# AGENTS.md

This repository is designed to work well with coding agents such as Codex and Claude. Use this file as the default operating guide before making changes.

## Project Overview

InfraWrap is an autonomous infrastructure agent for Proxmox-focused operations. The backend is a TypeScript Node.js application that plans actions with an LLM, routes them through governance checks, executes tools, observes outcomes, and exposes multiple frontends.

Primary runtime modes:

- `cli`: interactive or one-shot terminal frontend
- `telegram`: Telegram bot frontend
- `dashboard`: HTTP + SSE dashboard server
- `mcp`: MCP server for tool-based AI integration
- `autopilot`: continuous monitoring loop
- `full`: dashboard + telegram + autopilot together

## Important Directories

- `src/index.ts`: main entrypoint and mode bootstrap
- `src/agent/`: planner, executor, observer, LLM abstraction, memory
- `src/governance/`: policy loading, action classification, approvals, audit, circuit breaker
- `src/tools/`: tool registry plus adapters
- `src/tools/proxmox/`: Proxmox adapter and REST client
- `src/tools/system/`: SSH/local/system tools
- `src/healing/`: incident management, playbooks, healing orchestrator
- `src/monitoring/`: health metric collection and anomaly detection
- `src/chaos/`: chaos simulation and execution
- `src/frontends/`: CLI, Telegram, MCP, backend dashboard server
- `dashboard/`: React + Vite dashboard frontend
- `policies/default.yaml`: default governance policy
- `data/`: runtime persistence for audit and healing state

## Working Rules For Agents

- Read the relevant module before editing it. This repo has shared concepts across agent, governance, healing, and dashboard code.
- Prefer editing `src/` and `dashboard/src/`. Do not hand-edit `dist/`; it is build output.
- Keep governance behavior explicit. Any new action path should preserve tiering, approval flow, audit logging, and circuit-breaker behavior.
- Assume Proxmox access may be real. Avoid destructive defaults and do not weaken guardrails casually.
- Preserve existing event emissions when changing execution or healing flows. The dashboard depends on them.
- If adding a new backend capability, consider whether it affects:
  - tool definitions
  - governance classification
  - dashboard API or SSE events
  - incident/healing behavior
- Prefer small, targeted changes over broad rewrites.

## Local Commands

Backend:

- `npm run dev`
- `npm run dev:cli`
- `npm run dev:dashboard`
- `npm run dev:telegram`
- `npm run dev:mcp`
- `npm run dev:autopilot`
- `npm run build`
- `npm run lint`

Dashboard frontend:

- `cd dashboard && npm run dev`
- `cd dashboard && npm run build`

## Environment

Important env vars live in `.env.example`:

- Proxmox: `PROXMOX_HOST`, `PROXMOX_TOKEN_ID`, `PROXMOX_TOKEN_SECRET`
- AI: `AI_PROVIDER`, `AI_API_KEY`, `AI_MODEL`
- Telegram: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ALLOWED_USERS`
- Dashboard: `DASHBOARD_PORT`
- Autopilot: `AUTOPILOT_ENABLED`, `AUTOPILOT_POLL_INTERVAL_MS`
- Chaos: `CHAOS_PROTECTED_VMIDS`

The backend supports both `anthropic` and `openai` providers via `src/agent/llm.ts`.

## Repo-Specific Notes

- The backend dashboard server serves `dashboard/dist` if it exists; otherwise it falls back to an inline HTML template.
- The default policy accepts `approve_fix` in YAML and normalizes it to `approve_risky` in `src/governance/policy.ts`.
- There is no real automated test suite yet. The main safety check is `npm run lint` and, for dashboard work, `cd dashboard && npm run build`.
- `ToolRegistry.getClusterState()` returns the first connected adapter's cluster state, so changes that depend on cluster snapshots should be made carefully.
- The system adapter exposes powerful commands like `local_exec`, `ssh_exec`, and `run_script`; keep these governed and avoid bypassing the normal execution path.

## Preferred Change Workflow

When working on a task:

1. Identify the user-facing entrypoint and the affected subsystem.
2. Read the surrounding code before editing.
3. Make the smallest coherent change.
4. Run the narrowest useful verification command.
5. Summarize what changed, what was verified, and any remaining risks.

## Good Defaults For Codex And Claude

- Be explicit about assumptions.
- Call out infra risk before changing behavior that could affect live systems.
- Do not revert unrelated local changes.
- If a change touches runtime behavior, mention which mode(s) it affects.
- If a change adds or alters events, API shapes, or tool names, document that clearly in the final summary.
