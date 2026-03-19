// ============================================================
// InfraWrap — Agent Core
// The main plan/execute/observe/replan loop
// ============================================================

import { randomUUID } from "node:crypto";
import type {
  Goal,
  Plan,
  PlanStep,
  Investigation,
  AgentMode,
} from "../types.js";
import type { ToolRegistry } from "../tools/registry.js";
import type { AIConfig } from "./llm.js";
import type { GovernanceEngineRef } from "./executor.js";
import { Planner, type PlanningContext } from "./planner.js";
import { Executor } from "./executor.js";
import { Observer, type ObservationResult } from "./observer.js";
import { Investigator, type InvestigationContext } from "./investigator.js";
import { AgentMemory } from "./memory.js";
import { EventBus } from "./events.js";

export interface AgentRunResult {
  success: boolean;
  plan: Plan;
  steps_completed: number;
  steps_failed: number;
  replans: number;
  duration_ms: number;
  errors: string[];
}

export interface AgentCoreOptions {
  toolRegistry: ToolRegistry;
  governance: GovernanceEngineRef;
  eventBus: EventBus;
  config: AIConfig;
  memoryDbPath?: string;
}

export class AgentCore {
  private toolRegistry: ToolRegistry;
  private governance: GovernanceEngineRef;
  private eventBus: EventBus;
  private config: AIConfig;

  readonly planner: Planner;
  readonly executor: Executor;
  readonly observer: Observer;
  readonly investigator: Investigator;
  readonly memory: AgentMemory;

  constructor(options: AgentCoreOptions) {
    this.toolRegistry = options.toolRegistry;
    this.governance = options.governance;
    this.eventBus = options.eventBus;
    this.config = options.config;

    this.planner = new Planner();
    this.executor = new Executor(
      this.toolRegistry,
      this.governance,
      this.eventBus,
    );
    this.observer = new Observer();
    this.investigator = new Investigator();
    this.memory = new AgentMemory(options.memoryDbPath);
  }

  /**
   * The MAIN LOOP: plan, execute, observe, replan.
   */
  async run(goal: Goal): Promise<AgentRunResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let replans = 0;
    let stepsCompleted = 0;
    let stepsFailed = 0;

    // 1. Get cluster state
    const clusterState = await this.toolRegistry.getClusterState();

    // 2. Recall relevant memories
    const memories = this.memory.recall(undefined, undefined, 20);

    // 3. Create initial plan
    const planningContext: PlanningContext = {
      tools: this.toolRegistry.getAllTools(),
      clusterState,
      memory: memories,
      config: this.config,
    };

    let plan: Plan;
    try {
      plan = await this.planner.plan(goal, planningContext);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        plan: this.emptyPlan(goal.id),
        steps_completed: 0,
        steps_failed: 0,
        replans: 0,
        duration_ms: Date.now() - startTime,
        errors: [`Planning failed: ${errMsg}`],
      };
    }

    // 4. Emit plan_created
    this.eventBus.emit({
      type: "plan_created",
      timestamp: new Date().toISOString(),
      data: {
        plan_id: plan.id,
        goal: goal.description,
        step_count: plan.steps.length,
        reasoning: plan.reasoning,
      },
    });

    // 5. If mode requires plan approval, request it
    if (this.requiresPlanApproval(goal.mode)) {
      this.eventBus.emit({
        type: "approval_requested",
        timestamp: new Date().toISOString(),
        data: { plan_id: plan.id, type: "plan_approval", mode: goal.mode },
      });
      // In a full implementation, we would await approval here.
      // For now, we mark the plan as approved and continue.
      plan.status = "approved";
      this.eventBus.emit({
        type: "plan_approved",
        timestamp: new Date().toISOString(),
        data: { plan_id: plan.id },
      });
    }

    plan.status = "executing";

    // 6. Execute steps in dependency order
    const executed = new Set<string>();
    let activePlan = plan;

    while (true) {
      // Find next executable steps (all dependencies satisfied)
      const readySteps = activePlan.steps.filter(
        (s) =>
          s.status === "pending" &&
          s.depends_on.every((dep) => executed.has(dep)),
      );

      if (readySteps.length === 0) {
        // No more steps to execute — either all done or deadlocked
        break;
      }

      // Execute ready steps sequentially (could be parallelized for independent steps)
      for (const step of readySteps) {
        step.status = "running";

        const result = await this.executor.executeStep(step, goal.mode);
        step.result = result;

        if (!result.success) {
          step.status = "failed";
          stepsFailed++;
          errors.push(result.error || `Step ${step.id} failed`);

          // Check circuit breaker
          if (this.governance.circuitBreaker.isTripped()) {
            this.eventBus.emit({
              type: "circuit_breaker_tripped",
              timestamp: new Date().toISOString(),
              data: { plan_id: activePlan.id, step_id: step.id },
            });
            // Abort execution — mark remaining steps as skipped
            this.skipRemainingSteps(activePlan, executed);
            activePlan.status = "failed";

            return {
              success: false,
              plan: activePlan,
              steps_completed: stepsCompleted,
              steps_failed: stepsFailed,
              replans,
              duration_ms: Date.now() - startTime,
              errors,
            };
          }

          // Attempt replan
          try {
            const updatedClusterState =
              await this.toolRegistry.getClusterState();
            const replanContext: PlanningContext = {
              tools: this.toolRegistry.getAllTools(),
              clusterState: updatedClusterState,
              memory: memories,
              previousPlan: activePlan,
              config: this.config,
            };

            const newPlan = await this.planner.replan(
              activePlan,
              step,
              result.error || "Unknown error",
              replanContext,
            );

            replans++;

            this.eventBus.emit({
              type: "replan",
              timestamp: new Date().toISOString(),
              data: {
                old_plan_id: activePlan.id,
                new_plan_id: newPlan.id,
                failed_step_id: step.id,
                reasoning: newPlan.reasoning,
              },
            });

            if (newPlan.steps.length === 0) {
              // Replanner determined the goal is unachievable
              activePlan.status = "failed";
              errors.push(
                `Replan produced no steps: ${newPlan.reasoning}`,
              );
              return {
                success: false,
                plan: activePlan,
                steps_completed: stepsCompleted,
                steps_failed: stepsFailed,
                replans,
                duration_ms: Date.now() - startTime,
                errors,
              };
            }

            // Switch to the new plan
            activePlan = newPlan;
            activePlan.status = "executing";
            executed.clear(); // New plan has fresh step IDs
            break; // Restart the while loop with the new plan
          } catch (replanErr) {
            const msg =
              replanErr instanceof Error
                ? replanErr.message
                : String(replanErr);
            errors.push(`Replan failed: ${msg}`);
            this.skipRemainingSteps(activePlan, executed);
            activePlan.status = "failed";

            return {
              success: false,
              plan: activePlan,
              steps_completed: stepsCompleted,
              steps_failed: stepsFailed,
              replans,
              duration_ms: Date.now() - startTime,
              errors,
            };
          }
        } else {
          // Step succeeded — observe the result
          step.status = "success";
          stepsCompleted++;
          executed.add(step.id);

          // Verify state via observer
          try {
            const currentClusterState =
              await this.toolRegistry.getClusterState();
            const observation: ObservationResult = await this.observer.observe(
              step,
              result,
              currentClusterState,
              this.config,
            );

            if (observation.severity === "major") {
              // Treat major discrepancy as a failure
              step.status = "failed";
              stepsCompleted--;
              stepsFailed++;
              const discrepancyMsg = `Observation found major discrepancy: ${observation.discrepancies.join("; ")}`;
              errors.push(discrepancyMsg);

              // Emit step_failed with observation details
              this.eventBus.emit({
                type: "step_failed",
                timestamp: new Date().toISOString(),
                data: {
                  step_id: step.id,
                  action: step.action,
                  error: discrepancyMsg,
                  observation,
                },
              });
            }
          } catch {
            // Observation failure is non-fatal — continue
          }
        }
      }

      // Check if all steps in the active plan are done
      const allDone = activePlan.steps.every(
        (s) =>
          s.status === "success" ||
          s.status === "failed" ||
          s.status === "skipped",
      );
      if (allDone) break;
    }

    // 7. Finalize
    const allSucceeded = activePlan.steps.every(
      (s) => s.status === "success",
    );
    activePlan.status = allSucceeded ? "completed" : "failed";

    // Save relevant memories
    this.saveRunMemories(goal, activePlan, allSucceeded);

    return {
      success: allSucceeded,
      plan: activePlan,
      steps_completed: stepsCompleted,
      steps_failed: stepsFailed,
      replans,
      duration_ms: Date.now() - startTime,
      errors,
    };
  }

  /**
   * Perform an investigation (root cause analysis) for a given trigger.
   */
  async investigate(trigger: string): Promise<Investigation> {
    this.eventBus.emit({
      type: "investigation_started",
      timestamp: new Date().toISOString(),
      data: { trigger },
    });

    const clusterState = await this.toolRegistry.getClusterState();
    const recentEvents = this.eventBus.getHistory(50);
    // Audit entries would come from the governance engine in a full implementation.
    // For now, pass an empty array.
    const recentAudit: import("../types.js").AuditEntry[] = [];

    const context: InvestigationContext = {
      clusterState,
      recentEvents,
      recentAudit,
      config: this.config,
    };

    const investigation = await this.investigator.investigate(trigger, context);

    this.eventBus.emit({
      type: "investigation_complete",
      timestamp: new Date().toISOString(),
      data: {
        investigation_id: investigation.id,
        root_cause: investigation.root_cause,
        findings_count: investigation.findings.length,
        has_fix: !!investigation.proposed_fix,
      },
    });

    return investigation;
  }

  // ── Private Helpers ─────────────────────────────────────────

  private requiresPlanApproval(mode: AgentMode): boolean {
    // Build mode always requires plan approval; watch mode does not
    return mode === "build";
  }

  private skipRemainingSteps(plan: Plan, executed: Set<string>): void {
    for (const step of plan.steps) {
      if (step.status === "pending" && !executed.has(step.id)) {
        step.status = "skipped";
      }
    }
  }

  private saveRunMemories(
    goal: Goal,
    plan: Plan,
    success: boolean,
  ): void {
    try {
      if (success) {
        this.memory.save({
          type: "pattern",
          key: `goal:${goal.description.slice(0, 100)}`,
          value: JSON.stringify({
            goal: goal.description,
            mode: goal.mode,
            steps_count: plan.steps.length,
            reasoning: plan.reasoning,
          }),
          confidence: 0.8,
        });
      } else {
        const failedSteps = plan.steps.filter((s) => s.status === "failed");
        for (const step of failedSteps) {
          this.memory.save({
            type: "failure",
            key: `fail:${step.action}:${step.result?.error?.slice(0, 80) || "unknown"}`,
            value: JSON.stringify({
              action: step.action,
              params: step.params,
              error: step.result?.error,
              goal: goal.description,
            }),
            confidence: 0.6,
          });
        }
      }
    } catch {
      // Memory persistence is best-effort — never block the main flow
    }
  }

  private emptyPlan(goalId: string): Plan {
    return {
      id: randomUUID(),
      goal_id: goalId,
      steps: [],
      created_at: new Date().toISOString(),
      status: "failed",
      resource_estimate: {
        ram_mb: 0,
        disk_gb: 0,
        cpu_cores: 0,
        vms_created: 0,
        containers_created: 0,
      },
      reasoning: "",
      revision: 0,
    };
  }
}
