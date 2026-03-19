// ============================================================
// Approval Gate — Controls what actions require human sign-off
// ============================================================

import { createInterface } from "node:readline";
import { randomUUID } from "node:crypto";
import type {
  ActionTier,
  AgentMode,
  ApprovalRequest,
  ApprovalResponse,
  PolicyConfig,
} from "../types.js";

// ── Approval Matrix ─────────────────────────────────────────
// Maps (ApprovalMode × ActionTier) → needs approval?

type ApprovalMode = PolicyConfig["approval"]["build_mode"];

/**
 * Tiers that require approval under each approval mode.
 * "read" is always auto-approved regardless of mode.
 */
const APPROVAL_MATRIX: Record<ApprovalMode, Set<ActionTier>> = {
  approve_all: new Set(["safe_write", "risky_write", "destructive"]),
  approve_plan: new Set(["safe_write", "risky_write", "destructive"]),
  approve_risky: new Set(["risky_write", "destructive"]),
  auto: new Set(["destructive"]),
};

// ── ApprovalGate Class ──────────────────────────────────────

export class ApprovalGate {
  /**
   * Determine whether an action at a given tier needs human approval
   * under the current agent mode and policy.
   */
  needsApproval(
    tier: ActionTier,
    mode: AgentMode,
    policy: PolicyConfig,
  ): boolean {
    // Read actions never need approval
    if (tier === "read") return false;

    // "never" tier actions are always blocked — not approvable
    if (tier === "never") return false;

    const approvalMode = this.getApprovalMode(mode, policy);
    return APPROVAL_MATRIX[approvalMode]?.has(tier) ?? true;
  }

  /**
   * Request human approval via CLI prompt.
   * Returns an ApprovalResponse with the user's decision.
   */
  async requestApproval(
    request: ApprovalRequest,
  ): Promise<ApprovalResponse> {
    const rl = createInterface({
      input: process.stdin,
      output: process.stderr, // Use stderr so stdout stays clean for piping
    });

    const tierLabel = this.formatTier(request.tier);

    console.error("\n┌─────────────────────────────────────────────");
    console.error("│ APPROVAL REQUIRED");
    console.error("├─────────────────────────────────────────────");
    console.error(`│ Action:    ${request.action}`);
    console.error(`│ Tier:      ${tierLabel}`);
    console.error(`│ Reasoning: ${request.reasoning}`);
    if (request.plan_id) {
      console.error(`│ Plan:      ${request.plan_id}`);
    }
    console.error(`│ Params:    ${JSON.stringify(request.params, null, 2).replace(/\n/g, "\n│            ")}`);
    console.error("└─────────────────────────────────────────────");

    const answer = await new Promise<string>((resolve) => {
      rl.question("\n  Approve? [y/N] ", (ans) => {
        rl.close();
        resolve(ans.trim().toLowerCase());
      });
    });

    const approved = answer === "y" || answer === "yes";

    return {
      request_id: request.id,
      approved,
      approved_by: approved ? "cli_user" : undefined,
      method: "cli",
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create a pre-approved auto-response (for auto-approved tiers).
   */
  autoApprove(requestId: string): ApprovalResponse {
    return {
      request_id: requestId,
      approved: true,
      approved_by: "system",
      method: "auto",
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create a rejection response for blocked actions.
   */
  reject(requestId: string, reason: string): ApprovalResponse {
    return {
      request_id: requestId,
      approved: false,
      method: "auto",
      timestamp: new Date().toISOString(),
    };
  }

  // ── Private Helpers ─────────────────────────────────────────

  private getApprovalMode(mode: AgentMode, policy: PolicyConfig): ApprovalMode {
    switch (mode) {
      case "build":
        return policy.approval.build_mode;
      case "watch":
        return policy.approval.watch_mode;
      case "investigate":
        return policy.approval.investigate_mode;
      default:
        return "approve_all"; // Safest default
    }
  }

  private formatTier(tier: ActionTier): string {
    switch (tier) {
      case "read":
        return "READ (safe)";
      case "safe_write":
        return "SAFE WRITE";
      case "risky_write":
        return "RISKY WRITE ⚠";
      case "destructive":
        return "DESTRUCTIVE ✘";
      case "never":
        return "FORBIDDEN ✘✘";
      default:
        return tier;
    }
  }
}
