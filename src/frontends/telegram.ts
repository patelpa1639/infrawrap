// ============================================================
// InfraWrap — Telegram Bot Frontend
// Mobile interface for the autonomous infrastructure agent
// ============================================================

import { Bot, Context, InlineKeyboard } from "grammy";
import { randomUUID } from "node:crypto";
import type { AgentCore } from "../agent/core.js";
import type { ToolRegistry } from "../tools/registry.js";
import type { EventBus } from "../agent/events.js";
import type {
  Goal,
  Plan,
  PlanStep,
  AgentMode,
  AgentEvent,
  StepStatus,
  VMInfo,
  NodeInfo,
} from "../types.js";

// ── Telegram MarkdownV2 Helpers ─────────────────────────────

const MD2_SPECIAL = /([_*\[\]()~`>#+\-=|{}.!\\])/g;

function escMd2(text: string): string {
  return text.replace(MD2_SPECIAL, "\\$1");
}

function md2Bold(text: string): string {
  return `*${escMd2(text)}*`;
}

function md2Italic(text: string): string {
  return `_${escMd2(text)}_`;
}

function md2Code(text: string): string {
  return `\`${text.replace(/[`\\]/g, "\\$&")}\``;
}

function md2Pre(text: string, lang = ""): string {
  const escaped = text.replace(/`/g, "\\`");
  return `\`\`\`${lang}\n${escaped}\n\`\`\``;
}

function md2Link(label: string, url: string): string {
  return `[${escMd2(label)}](${url})`;
}

// ── Status Icons ────────────────────────────────────────────

function stepStatusIcon(status: StepStatus): string {
  switch (status) {
    case "success":
      return "\u2705"; // green check
    case "failed":
      return "\u274C"; // red cross
    case "running":
      return "\u23F3"; // hourglass
    case "pending":
      return "\u23F8"; // pause
    case "skipped":
      return "\u23ED"; // skip forward
    case "rolled_back":
      return "\u21A9"; // return arrow
    default:
      return "\u2753"; // question mark
  }
}

// ── Message Formatters ──────────────────────────────────────

function formatPlanMessage(plan: Plan): string {
  const lines: string[] = [];

  lines.push(md2Bold(`Plan ${plan.id.slice(0, 8)}`));
  lines.push(`${md2Italic("Steps:")} ${escMd2(String(plan.steps.length))}`);
  lines.push(`${md2Italic("Rev:")} ${escMd2(String(plan.revision))}`);
  lines.push("");
  lines.push(md2Bold("Reasoning:"));
  lines.push(escMd2(plan.reasoning));
  lines.push("");

  // Resources
  const re = plan.resource_estimate;
  lines.push(md2Bold("Resources:"));
  lines.push(
    escMd2(
      `  CPU: ${re.cpu_cores} cores | RAM: ${re.ram_mb} MB | Disk: ${re.disk_gb} GB`,
    ),
  );
  lines.push(
    escMd2(
      `  VMs: ${re.vms_created} | Containers: ${re.containers_created}`,
    ),
  );
  lines.push("");

  // Steps
  lines.push(md2Bold("Steps:"));
  for (let i = 0; i < plan.steps.length; i++) {
    const step = plan.steps[i];
    const icon = stepStatusIcon(step.status);
    lines.push(
      `${icon} ${md2Code(step.action)} \\- ${escMd2(step.description)}`,
    );
  }

  return lines.join("\n");
}

function formatVMListMessage(vms: VMInfo[]): string {
  if (vms.length === 0) {
    return escMd2("No VMs found.");
  }

  const lines: string[] = [md2Bold("Virtual Machines"), ""];

  for (const vm of vms) {
    const statusIcon =
      vm.status === "running" ? "\u{1F7E2}" : vm.status === "stopped" ? "\u{1F534}" : "\u{1F7E1}";
    lines.push(
      `${statusIcon} ${md2Bold(vm.name)} \\(${md2Code(String(vm.id))}\\)`,
    );
    lines.push(
      escMd2(
        `    Node: ${vm.node} | CPU: ${vm.cpu_cores} | RAM: ${vm.ram_mb}MB`,
      ),
    );
    if (vm.ip_address) {
      lines.push(escMd2(`    IP: ${vm.ip_address}`));
    }
    lines.push("");
  }

  return lines.join("\n");
}

function formatNodeListMessage(nodes: NodeInfo[]): string {
  if (nodes.length === 0) {
    return escMd2("No nodes found.");
  }

  const lines: string[] = [md2Bold("Cluster Nodes"), ""];

  for (const node of nodes) {
    const statusIcon =
      node.status === "online" ? "\u{1F7E2}" : node.status === "offline" ? "\u{1F534}" : "\u{1F7E1}";
    lines.push(`${statusIcon} ${md2Bold(node.name)}`);
    lines.push(
      escMd2(
        `    CPU: ${node.cpu_cores} cores (${node.cpu_usage_pct.toFixed(1)}%)`,
      ),
    );
    lines.push(
      escMd2(
        `    RAM: ${node.ram_used_mb}/${node.ram_total_mb} MB`,
      ),
    );
    lines.push("");
  }

  return lines.join("\n");
}

function formatStepProgressMessage(
  plan: Plan,
  currentStepIndex: number,
): string {
  const lines: string[] = [
    md2Bold(`Plan ${plan.id.slice(0, 8)} — Progress`),
    "",
  ];

  for (let i = 0; i < plan.steps.length; i++) {
    const step = plan.steps[i];
    const icon = stepStatusIcon(step.status);
    const highlight = i === currentStepIndex ? " \u25C0" : "";
    lines.push(
      `${icon} ${md2Code(step.action)}${escMd2(highlight)}`,
    );
  }

  return lines.join("\n");
}

// ── Pending Approval Tracking ───────────────────────────────

interface PendingApproval {
  planId: string;
  plan: Plan;
  chatId: number;
  messageId: number;
  goal: Goal;
  resolveApproval: (approved: boolean) => void;
}

// ── Bot Configuration ───────────────────────────────────────

export interface TelegramBotConfig {
  botToken: string;
  allowedUsers: number[];
}

// ── Main Bot Class ──────────────────────────────────────────

export class InfraWrapBot {
  private bot: Bot;
  private agentCore: AgentCore;
  private toolRegistry: ToolRegistry;
  private eventBus: EventBus;

  private allowedUsers: Set<number>;
  private pendingApprovals: Map<string, PendingApproval> = new Map();
  private progressMessages: Map<string, { chatId: number; messageId: number }> =
    new Map();

  constructor(
    config: TelegramBotConfig,
    agentCore: AgentCore,
    toolRegistry: ToolRegistry,
    eventBus: EventBus,
  ) {
    this.bot = new Bot(config.botToken);
    this.agentCore = agentCore;
    this.toolRegistry = toolRegistry;
    this.eventBus = eventBus;
    this.allowedUsers = new Set(config.allowedUsers);

    this.registerMiddleware();
    this.registerCommands();
    this.registerCallbackQueries();
    this.registerTextHandler();
    this.subscribeToEvents();
  }

  /**
   * Launch the bot and start polling for updates.
   */
  async start(): Promise<void> {
    console.log("[telegram] Starting InfraWrap Telegram bot...");

    await this.bot.api.setMyCommands([
      { command: "help", description: "Show all commands" },
      { command: "status", description: "Cluster overview" },
      { command: "vms", description: "List all VMs" },
      { command: "nodes", description: "List all cluster nodes" },
      { command: "build", description: "Trigger build mode" },
      { command: "investigate", description: "Run root cause analysis" },
      { command: "audit", description: "Show recent audit entries" },
      { command: "approve", description: "Approve pending action" },
      { command: "deny", description: "Deny pending action" },
    ]);

    this.bot.start({
      onStart: () => console.log("[telegram] Bot is running."),
    });
  }

  // ── Middleware ────────────────────────────────────────────

  private registerMiddleware(): void {
    // Allowlist enforcement
    this.bot.use(async (ctx, next) => {
      const userId = ctx.from?.id;
      if (!userId || !this.allowedUsers.has(userId)) {
        await ctx.reply("Access denied\\. You are not authorized to use this bot\\.", {
          parse_mode: "MarkdownV2",
        });
        return;
      }
      await next();
    });
  }

  // ── Command Handlers ─────────────────────────────────────

  private registerCommands(): void {
    this.bot.command("help", async (ctx) => {
      const text = [
        md2Bold("InfraWrap Commands"),
        "",
        `${md2Code("/help")} \\- Show this help`,
        `${md2Code("/status")} \\- Cluster overview`,
        `${md2Code("/vms")} \\- List all VMs`,
        `${md2Code("/nodes")} \\- List all nodes`,
        `${md2Code("/build <desc>")} \\- Trigger build mode`,
        `${md2Code("/investigate <desc>")} \\- Root cause analysis`,
        `${md2Code("/audit")} \\- Recent audit entries`,
        `${md2Code("/approve")} \\- Approve pending action`,
        `${md2Code("/deny")} \\- Deny pending action`,
        "",
        escMd2("Or just type a goal in plain text to trigger build mode."),
      ].join("\n");

      await ctx.reply(text, { parse_mode: "MarkdownV2" });
    });

    this.bot.command("status", async (ctx) => {
      try {
        const state = await this.toolRegistry.getClusterState();
        if (!state) {
          await ctx.reply(escMd2("No cluster connection available."), {
            parse_mode: "MarkdownV2",
          });
          return;
        }

        const lines = [
          md2Bold("Cluster Status"),
          "",
          `${md2Italic("Adapter:")} ${escMd2(state.adapter)}`,
          `${md2Italic("Nodes:")} ${escMd2(String(state.nodes.length))}`,
          `${md2Italic("VMs:")} ${escMd2(String(state.vms.length))}`,
          `${md2Italic("Containers:")} ${escMd2(String(state.containers.length))}`,
          `${md2Italic("Storage:")} ${escMd2(String(state.storage.length))}`,
          `${md2Italic("Updated:")} ${escMd2(state.timestamp)}`,
        ];

        await ctx.reply(lines.join("\n"), { parse_mode: "MarkdownV2" });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await ctx.reply(escMd2(`Failed to get status: ${msg}`), {
          parse_mode: "MarkdownV2",
        });
      }
    });

    this.bot.command("vms", async (ctx) => {
      try {
        const state = await this.toolRegistry.getClusterState();
        if (!state) {
          await ctx.reply(escMd2("No cluster connection available."), {
            parse_mode: "MarkdownV2",
          });
          return;
        }

        await ctx.reply(formatVMListMessage(state.vms), {
          parse_mode: "MarkdownV2",
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await ctx.reply(escMd2(`Failed to list VMs: ${msg}`), {
          parse_mode: "MarkdownV2",
        });
      }
    });

    this.bot.command("nodes", async (ctx) => {
      try {
        const state = await this.toolRegistry.getClusterState();
        if (!state) {
          await ctx.reply(escMd2("No cluster connection available."), {
            parse_mode: "MarkdownV2",
          });
          return;
        }

        await ctx.reply(formatNodeListMessage(state.nodes), {
          parse_mode: "MarkdownV2",
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await ctx.reply(escMd2(`Failed to list nodes: ${msg}`), {
          parse_mode: "MarkdownV2",
        });
      }
    });

    this.bot.command("build", async (ctx) => {
      const description = ctx.match;
      if (!description) {
        await ctx.reply(
          escMd2("Usage: /build <description of what to build>"),
          { parse_mode: "MarkdownV2" },
        );
        return;
      }

      await this.handleGoal(ctx, description.trim(), "build");
    });

    this.bot.command("investigate", async (ctx) => {
      const trigger = ctx.match;
      if (!trigger) {
        await ctx.reply(
          escMd2("Usage: /investigate <description of the issue>"),
          { parse_mode: "MarkdownV2" },
        );
        return;
      }

      await this.handleInvestigation(ctx, trigger.trim());
    });

    this.bot.command("audit", async (ctx) => {
      try {
        const events = this.eventBus.getHistory(15);

        if (events.length === 0) {
          await ctx.reply(escMd2("No recent events in the audit trail."), {
            parse_mode: "MarkdownV2",
          });
          return;
        }

        const lines = [md2Bold("Recent Events"), ""];

        for (const event of events) {
          const time = event.timestamp.slice(11, 19);
          lines.push(
            `${md2Code(time)} ${escMd2(event.type)}`,
          );
        }

        await ctx.reply(lines.join("\n"), { parse_mode: "MarkdownV2" });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await ctx.reply(escMd2(`Failed to fetch audit: ${msg}`), {
          parse_mode: "MarkdownV2",
        });
      }
    });

    this.bot.command("approve", async (ctx) => {
      await this.handleApprovalCommand(ctx, true);
    });

    this.bot.command("deny", async (ctx) => {
      await this.handleApprovalCommand(ctx, false);
    });
  }

  // ── Callback Query Handlers (inline keyboard) ────────────

  private registerCallbackQueries(): void {
    this.bot.callbackQuery(/^approve:(.+)$/, async (ctx) => {
      const planId = ctx.match![1];
      const pending = this.pendingApprovals.get(planId);

      if (!pending) {
        await ctx.answerCallbackQuery({
          text: "This approval is no longer pending.",
        });
        return;
      }

      pending.resolveApproval(true);
      this.pendingApprovals.delete(planId);

      await ctx.answerCallbackQuery({ text: "Plan approved!" });
      await ctx.editMessageText(
        formatPlanMessage(pending.plan) + "\n\n\u2705 " + md2Bold("APPROVED"),
        { parse_mode: "MarkdownV2" },
      );
    });

    this.bot.callbackQuery(/^deny:(.+)$/, async (ctx) => {
      const planId = ctx.match![1];
      const pending = this.pendingApprovals.get(planId);

      if (!pending) {
        await ctx.answerCallbackQuery({
          text: "This approval is no longer pending.",
        });
        return;
      }

      pending.resolveApproval(false);
      this.pendingApprovals.delete(planId);

      await ctx.answerCallbackQuery({ text: "Plan denied." });
      await ctx.editMessageText(
        formatPlanMessage(pending.plan) + "\n\n\u274C " + md2Bold("DENIED"),
        { parse_mode: "MarkdownV2" },
      );
    });
  }

  // ── Natural Language Handler ──────────────────────────────

  private registerTextHandler(): void {
    this.bot.on("message:text", async (ctx) => {
      const text = ctx.message.text;

      // Skip if it looks like a command
      if (text.startsWith("/")) return;

      await this.handleGoal(ctx, text, "build");
    });
  }

  // ── Goal Execution ────────────────────────────────────────

  private async handleGoal(
    ctx: Context,
    description: string,
    mode: AgentMode,
  ): Promise<void> {
    const chatId = ctx.chat?.id;
    if (!chatId) return;

    const goal: Goal = {
      id: randomUUID(),
      mode,
      description,
      raw_input: description,
      created_at: new Date().toISOString(),
    };

    const statusMsg = await ctx.reply(
      escMd2(`Working on: ${description}\n\nPlanning...`),
      { parse_mode: "MarkdownV2" },
    );

    // Track this message for progress updates
    this.progressMessages.set(goal.id, {
      chatId,
      messageId: statusMsg.message_id,
    });

    try {
      const result = await this.agentCore.run(goal);

      // Clean up progress tracking
      this.progressMessages.delete(goal.id);

      // Build result message
      const successIcon = result.success ? "\u2705" : "\u274C";
      const lines = [
        `${successIcon} ${md2Bold(result.success ? "Goal Completed" : "Goal Failed")}`,
        "",
        `${md2Italic("Steps:")} ${escMd2(`${result.steps_completed} completed, ${result.steps_failed} failed`)}`,
        `${md2Italic("Replans:")} ${escMd2(String(result.replans))}`,
        `${md2Italic("Duration:")} ${escMd2(`${result.duration_ms}ms`)}`,
      ];

      if (result.errors.length > 0) {
        lines.push("");
        lines.push(md2Bold("Errors:"));
        for (const err of result.errors) {
          lines.push(`\\- ${escMd2(err)}`);
        }
      }

      // Show final plan
      lines.push("");
      lines.push(formatPlanMessage(result.plan));

      await ctx.reply(lines.join("\n"), { parse_mode: "MarkdownV2" });
    } catch (err) {
      this.progressMessages.delete(goal.id);
      const msg = err instanceof Error ? err.message : String(err);
      await ctx.reply(escMd2(`Execution failed: ${msg}`), {
        parse_mode: "MarkdownV2",
      });
    }
  }

  // ── Investigation ─────────────────────────────────────────

  private async handleInvestigation(
    ctx: Context,
    trigger: string,
  ): Promise<void> {
    await ctx.reply(escMd2(`Investigating: ${trigger}\n\nPlease wait...`), {
      parse_mode: "MarkdownV2",
    });

    try {
      const investigation = await this.agentCore.investigate(trigger);

      const lines = [
        md2Bold("Investigation Report"),
        "",
        `${md2Italic("Trigger:")} ${escMd2(investigation.trigger)}`,
        `${md2Italic("Time:")} ${escMd2(investigation.timestamp)}`,
        "",
        md2Bold("Findings:"),
      ];

      for (const finding of investigation.findings) {
        const severityIcon =
          finding.severity === "critical"
            ? "\u{1F534}"
            : finding.severity === "warning"
              ? "\u{1F7E1}"
              : "\u{1F535}";
        lines.push(
          `${severityIcon} ${md2Bold(finding.source)}`,
        );
        lines.push(`    ${escMd2(finding.detail)}`);
      }

      lines.push("");
      lines.push(
        `${md2Bold("Root Cause:")} ${escMd2(investigation.root_cause)}`,
      );

      if (investigation.proposed_fix) {
        lines.push("");
        lines.push(md2Bold("Proposed Fix:"));
        lines.push(escMd2(investigation.proposed_fix.description));
        lines.push(
          `${md2Italic("Confidence:")} ${escMd2(investigation.proposed_fix.confidence)}`,
        );
        lines.push(
          `${md2Italic("Steps:")} ${escMd2(String(investigation.proposed_fix.steps.length))}`,
        );

        if (investigation.proposed_fix.requires_approval) {
          lines.push(escMd2("\n(Requires approval to apply)"));
        }
      }

      await ctx.reply(lines.join("\n"), { parse_mode: "MarkdownV2" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await ctx.reply(escMd2(`Investigation failed: ${msg}`), {
        parse_mode: "MarkdownV2",
      });
    }
  }

  // ── Approval Handling ─────────────────────────────────────

  private async handleApprovalCommand(
    ctx: Context,
    approved: boolean,
  ): Promise<void> {
    if (this.pendingApprovals.size === 0) {
      await ctx.reply(escMd2("No pending approvals."), {
        parse_mode: "MarkdownV2",
      });
      return;
    }

    // Approve/deny the most recent pending approval
    const [planId, pending] = [...this.pendingApprovals.entries()].pop()!;
    pending.resolveApproval(approved);
    this.pendingApprovals.delete(planId);

    const action = approved ? "approved" : "denied";
    const icon = approved ? "\u2705" : "\u274C";

    await ctx.reply(
      `${icon} Plan ${md2Code(planId.slice(0, 8))} has been ${escMd2(action)}\\.`,
      { parse_mode: "MarkdownV2" },
    );
  }

  /**
   * Send a plan to a chat for approval with inline keyboard buttons.
   */
  private async requestApproval(
    chatId: number,
    plan: Plan,
    goal: Goal,
  ): Promise<boolean> {
    const keyboard = new InlineKeyboard()
      .text("\u2705 Approve", `approve:${plan.id}`)
      .text("\u274C Deny", `deny:${plan.id}`);

    const message = await this.bot.api.sendMessage(
      chatId,
      formatPlanMessage(plan) +
        "\n\n\u{1F6A8} " +
        md2Bold("Approval Required"),
      {
        parse_mode: "MarkdownV2",
        reply_markup: keyboard,
      },
    );

    return new Promise<boolean>((resolve) => {
      this.pendingApprovals.set(plan.id, {
        planId: plan.id,
        plan,
        chatId,
        messageId: message.message_id,
        goal,
        resolveApproval: resolve,
      });
    });
  }

  // ── Event Bus Subscriptions ───────────────────────────────

  private subscribeToEvents(): void {
    this.eventBus.on("plan_created", async (event: AgentEvent) => {
      const data = event.data as {
        plan_id: string;
        goal: string;
        step_count: number;
      };

      // Notify all tracked progress messages
      for (const [, info] of this.progressMessages) {
        try {
          await this.bot.api.editMessageText(
            info.chatId,
            info.messageId,
            escMd2(
              `Plan created (${data.plan_id?.toString().slice(0, 8)}) with ${data.step_count} steps.\n\nExecuting...`,
            ),
            { parse_mode: "MarkdownV2" },
          );
        } catch {
          // Message edit can fail if content hasn't changed
        }
      }
    });

    this.eventBus.on("step_completed", async (event: AgentEvent) => {
      const data = event.data as {
        step_id: string;
        action: string;
        duration_ms: number;
        plan_id: string;
      };

      for (const [, info] of this.progressMessages) {
        try {
          await this.bot.api.editMessageText(
            info.chatId,
            info.messageId,
            `\u2705 ${md2Code(data.action)} completed \\(${escMd2(String(data.duration_ms))}ms\\)`,
            { parse_mode: "MarkdownV2" },
          );
        } catch {
          // Ignore edit failures
        }
      }
    });

    this.eventBus.on("step_failed", async (event: AgentEvent) => {
      const data = event.data as {
        step_id: string;
        action: string;
        error: string;
      };

      for (const [, info] of this.progressMessages) {
        try {
          await this.bot.api.editMessageText(
            info.chatId,
            info.messageId,
            `\u274C ${md2Code(data.action)} failed\n${escMd2(data.error || "Unknown error")}`,
            { parse_mode: "MarkdownV2" },
          );
        } catch {
          // Ignore edit failures
        }
      }
    });

    this.eventBus.on("alert_fired", async (event: AgentEvent) => {
      const data = event.data as {
        severity: string;
        message: string;
        source: string;
      };

      const severityIcon =
        data.severity === "critical"
          ? "\u{1F6A8}"
          : data.severity === "warning"
            ? "\u26A0\uFE0F"
            : "\u2139\uFE0F";

      const text = [
        `${severityIcon} ${md2Bold("Alert")}`,
        "",
        `${md2Italic("Severity:")} ${escMd2(data.severity?.toUpperCase() || "UNKNOWN")}`,
        `${md2Italic("Source:")} ${escMd2(data.source || "unknown")}`,
        `${md2Italic("Message:")} ${escMd2(data.message || "")}`,
      ].join("\n");

      // Send alert to all allowed users
      for (const userId of this.allowedUsers) {
        try {
          await this.bot.api.sendMessage(userId, text, {
            parse_mode: "MarkdownV2",
          });
        } catch {
          // User may not have started the bot yet
        }
      }
    });

    this.eventBus.on("circuit_breaker_tripped", async () => {
      const text = `\u{1F6A8} ${md2Bold("CIRCUIT BREAKER TRIPPED")}\n\n${escMd2("Execution has been halted due to consecutive failures. Manual intervention required.")}`;

      for (const userId of this.allowedUsers) {
        try {
          await this.bot.api.sendMessage(userId, text, {
            parse_mode: "MarkdownV2",
          });
        } catch {
          // Ignore send failures
        }
      }
    });

    this.eventBus.on("investigation_complete", async (event: AgentEvent) => {
      const data = event.data as {
        investigation_id: string;
        root_cause: string;
        findings_count: number;
        has_fix: boolean;
      };

      const text = [
        `\u{1F50D} ${md2Bold("Investigation Complete")}`,
        "",
        `${md2Italic("Findings:")} ${escMd2(String(data.findings_count))}`,
        `${md2Italic("Root Cause:")} ${escMd2(data.root_cause)}`,
        `${md2Italic("Fix Available:")} ${escMd2(data.has_fix ? "Yes" : "No")}`,
      ].join("\n");

      for (const [, info] of this.progressMessages) {
        try {
          await this.bot.api.editMessageText(
            info.chatId,
            info.messageId,
            text,
            { parse_mode: "MarkdownV2" },
          );
        } catch {
          // Ignore edit failures
        }
      }
    });
  }
}
