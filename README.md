<p align="center">
  <h1 align="center">InfraWrap</h1>
  <p align="center">
    <strong>Autonomous infrastructure agent that plans, deploys, monitors, heals, and governs.</strong>
  </p>
  <p align="center">
    <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Node.js_22+-339933?logo=node.js&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/Anthropic_Claude-191919?logo=anthropic&logoColor=white" alt="Anthropic Claude" />
    <img src="https://img.shields.io/badge/Proxmox_VE-E57000?logo=proxmox&logoColor=white" alt="Proxmox" />
    <img src="https://img.shields.io/badge/License-MIT-blue" alt="MIT License" />
  </p>
</p>

---

## What is InfraWrap?

InfraWrap is an AI-powered infrastructure agent that turns natural language goals into multi-step execution plans, runs them against real Proxmox VE infrastructure, and continuously monitors the cluster for anomalies. When something goes wrong, it self-heals — detecting the issue, matching a playbook, executing remediation, and verifying recovery, all without human intervention. Every action passes through a governance engine with tiered approval, guardrails, circuit breakers, and a persistent audit trail.

## Key Features

| Feature | Description |
|---|---|
| **AI-Powered Planning** | Describe a goal in plain English. The agent generates a dependency-aware execution plan, runs it step-by-step, observes results, and replans on failure. |
| **Self-Healing** | Detect anomalies via threshold, trend, spike, and flatline analysis. Match playbooks, execute remediation, verify recovery. Circuit breaker and escalation prevent runaway loops. |
| **Real-Time Dashboard** | Web UI with live pipeline visualization, incident timeline, cluster health metrics, and audit log — all streamed via Server-Sent Events. |
| **Governance Engine** | Five-tier action classification (`read` / `safe_write` / `risky_write` / `destructive` / `never`), YAML policy-driven guardrails, and a persistent SQLite audit trail. |
| **Telegram Bot** | Command your infrastructure from your phone. Inline approval buttons for risky actions, live plan progress, cluster status on demand. |
| **Predictive Monitoring** | Threshold breaches, trend extrapolation via linear regression, spike detection via standard deviation, and flatline detection — all on a configurable poll loop. |
| **Incident Memory** | Tracks incident patterns over time, records playbook success/failure rates, and suggests playbooks for future incidents based on historical matches. |

## Architecture

```
                           +-----------+
                           |   User    |
                           +-----+-----+
                                 |
                +----------------+----------------+
                |                |                |
          +-----------+   +-----------+   +-----------+
          | Telegram  |   |    CLI    |   | Dashboard |
          |   Bot     |   |   REPL   |   | (HTTP+SSE)|
          +-----------+   +-----------+   +-----------+
                |                |                |
                +----------------+----------------+
                                 |
                         +-------+-------+
                         |  Agent Core   |
                         |  plan / exec  |
                         |  observe /    |
                         |  replan       |
                         +---+---+---+---+
                             |   |   |
                +------------+   |   +------------+
                |                |                |
          +-----------+   +-----------+   +-----------+
          |  Planner  |   | Executor  |   | Observer  |
          | (LLM)     |   |(run tools)|   | (verify)  |
          +-----------+   +-----------+   +-----------+
                                 |
                         +-------+-------+
                         | Tool Registry |
                         +---+-------+---+
                             |       |
                      +------+    +--+------+
                      |Proxmox|   | System  |
                      |  API  |   |  Tools  |
                      +-------+   +---------+

    +------------------+     +-------------------+     +--------------+
    | Governance Engine|     | Healing           |     | Event Bus    |
    | - Classifier     |     | Orchestrator      |     | (pub/sub)    |
    | - Approval Gate  |<--->| - Health Monitor  |<--->| - SSE stream |
    | - Circuit Breaker|     | - Anomaly Detect  |     | - History    |
    | - Audit Log      |     | - Playbook Engine |     |              |
    +------------------+     | - Incident Mgr    |     +--------------+
                             +-------------------+
```

A user sends a goal via Telegram, CLI, or the Dashboard. The **Agent Core** asks Claude to produce a dependency-aware execution plan, then executes each step through the **Tool Registry**. The **Governance Engine** evaluates every action before execution — classifying its risk tier, checking guardrails, and requesting approval when needed. The **Observer** verifies post-conditions after each step. If a step fails, the **Planner** replans around the failure.

In the background, the **Healing Orchestrator** polls cluster health, feeds metrics into the **Anomaly Detector**, and when an anomaly fires, matches it to a playbook and dispatches the Agent Core to heal — closing the loop autonomously.

## Self-Healing Loop

This is the core differentiator. The healing system runs as a continuous background loop:

```
  Detect            Diagnose            Plan              Heal             Verify
+-----------+    +-------------+    +------------+    +------------+    +------------+
|  Health   |--->|  Anomaly    |--->|  Playbook  |--->|   Agent    |--->|  Observer  |
|  Monitor  |    |  Detector   |    |  Engine    |    |   Core     |    |  (post-    |
|  (poll)   |    |  (4 types)  |    |  (match)   |    |  (execute) |    |   check)   |
+-----------+    +-------------+    +------------+    +------------+    +------------+
      ^                                                                      |
      |                          Incident Manager                            |
      +-------------------------(learn + resolve)----------------------------+
```

### Default Playbooks

| Playbook | Trigger | Action |
|---|---|---|
| **VM Crashed** | VM status drops from running to stopped | Force-start VM, verify recovery, alert operator |
| **VM Unresponsive** | VM flatlines on heartbeat | Graceful restart, verify network reachability |
| **Node Memory Critical** | Node memory exceeds 90% | Live-migrate lightest VM to least-loaded node |
| **Node CPU Overload** | Node CPU sustained above 90% | Live-migrate heaviest VM to least-loaded node |
| **Disk Space Critical** | Disk usage exceeds 90% | Clean snapshots older than 7 days, expand storage if needed |
| **Predictive Disk Full** | Trend projects disk full within 48h | Preemptive snapshot cleanup, alert operator |

### Safety Mechanisms

- **Circuit Breaker** -- 3 consecutive healing failures pauses all automated healing until manual reset
- **Escalation** -- Same anomaly triggering 3+ times within 30 minutes escalates to operator instead of retrying
- **Cooldowns** -- Per-playbook cooldown periods (10-360 minutes) prevent healing loops
- **Approval Gates** -- Destructive playbooks (e.g., disk expansion) require human approval before execution
- **Max Concurrent Heals** -- Only 2 simultaneous healing operations to prevent resource contention

## Governance

Every action is classified by risk and subject to policy controls.

### Action Tiers

| Tier | Examples | Approval |
|------|----------|----------|
| `read` | List VMs, check status, read logs | Never needed |
| `safe_write` | Start VM, create snapshot | Auto in watch mode |
| `risky_write` | Create VM, modify config, stop VM | Required in build mode |
| `destructive` | Delete VM, delete snapshot, force operations | Always requires explicit confirmation |
| `never` | `delete_all`, `format_storage`, `wipe*` | Agent refuses unconditionally |

Actions are classified from their tool definition, then **elevated** based on parameters: force flags, batch operations on 3+ targets, high resource allocations (>16GB RAM, >500GB disk), and delete flags all push the tier upward. Plan-level approval covers child steps, except destructive actions which always require step-level confirmation.

## Quick Start

### Prerequisites

- Node.js 22+ (18+ minimum)
- Access to a Proxmox VE instance with an API token
- Anthropic API key
- Telegram bot token (optional, for mobile access)

### Install

```bash
git clone https://github.com/patelpa1639/infrawrap.git
cd infrawrap
npm install
```

### Configure

```bash
cp .env.example .env
```

Required environment variables:

```env
# Proxmox VE
PROXMOX_HOST=192.168.1.100
PROXMOX_PORT=8006
PROXMOX_TOKEN_ID=user@realm!tokenname
PROXMOX_TOKEN_SECRET=<your-token-secret>
PROXMOX_ALLOW_SELF_SIGNED=true

# AI / LLM
AI_PROVIDER=anthropic
AI_API_KEY=<your-anthropic-api-key>
AI_MODEL=claude-haiku-4-5-20251001

# Telegram (optional)
TELEGRAM_BOT_TOKEN=<your-bot-token>
TELEGRAM_ALLOWED_USERS=<comma-separated-user-ids>

# Dashboard
DASHBOARD_PORT=3000

# Autopilot
AUTOPILOT_ENABLED=false
AUTOPILOT_POLL_INTERVAL_MS=30000
```

### Run

```bash
# Full mode -- dashboard + telegram + self-healing + autopilot
npm run dev -- full

# Dev mode -- CLI + dashboard + telegram + self-healing (best for testing)
npm run dev -- dev

# Interactive CLI only
npm run dev -- cli

# One-shot command
npm run dev -- "create a Ubuntu VM with 2 cores and 4GB RAM"

# Dashboard only
npm run dev -- dashboard

# Telegram bot only
npm run dev -- telegram

# MCP server (for Claude Code integration)
npm run dev -- mcp
```

### First Command via Telegram

1. Start InfraWrap: `npm run dev -- full`
2. Open your Telegram bot
3. Send: `list all VMs on the cluster`
4. Watch the agent plan, execute, and return results in real time

## Dashboard

<!-- TODO: Add screenshots -->

The web dashboard at `http://localhost:3000` provides:

- **Pipeline Visualization** -- Watch plans execute step-by-step with live status updates
- **Incident Timeline** -- Open and resolved incidents with full action history and resolution details
- **Cluster Health** -- Live node and VM metrics streamed via SSE (CPU, memory, disk, uptime)
- **Audit Log** -- Searchable, filterable history of every action the agent has taken
- **Healing Status** -- Active heals, circuit breaker state, playbook execution history

## Tech Stack

| Component | Technology |
|---|---|
| Language | TypeScript (strict mode) |
| Runtime | Node.js 22 |
| AI / LLM | Anthropic Claude (Haiku for cost-efficiency) |
| Infrastructure API | Proxmox VE REST API |
| Telegram | grammY |
| Real-Time Streaming | Server-Sent Events (SSE) |
| Audit Storage | SQLite via better-sqlite3 |
| Schema Validation | Zod |
| MCP Integration | Model Context Protocol SDK |
| Dashboard | Zero-dependency -- pure HTML/CSS/JS served from Node.js `http` |

## Project Structure

```
infrawrap/
├── src/
│   ├── index.ts              # Entry point -- mode router (cli/telegram/dashboard/full/dev/mcp)
│   ├── config.ts             # Environment config loader (Zod validated)
│   ├── types.ts              # Shared type definitions
│   ├── agent/
│   │   ├── core.ts           # Plan -> Execute -> Observe -> Replan loop
│   │   ├── planner.ts        # LLM-powered plan generation + replanning
│   │   ├── executor.ts       # Step execution with governance checks
│   │   ├── observer.ts       # Post-condition verification
│   │   ├── investigator.ts   # Root cause analysis engine
│   │   ├── memory.ts         # Pattern + failure memory (SQLite)
│   │   ├── events.ts         # EventBus (pub/sub + history ring buffer)
│   │   ├── llm.ts            # LLM abstraction (Anthropic / OpenAI)
│   │   └── prompts.ts        # System prompts for each agent role
│   ├── governance/
│   │   ├── index.ts          # GovernanceEngine -- single evaluate() entry point
│   │   ├── classifier.ts     # Action tier classification + param-based elevation
│   │   ├── approval.ts       # Human approval gate (Telegram inline buttons)
│   │   ├── circuit-breaker.ts# Consecutive failure detection + cooldown
│   │   ├── audit.ts          # Persistent SQLite audit log
│   │   └── policy.ts         # YAML policy loader
│   ├── healing/
│   │   ├── orchestrator.ts   # Detect -> Diagnose -> Heal -> Verify loop
│   │   ├── playbooks.ts      # Playbook engine + 6 default playbooks
│   │   └── incidents.ts      # Incident lifecycle, pattern learning, playbook suggestion
│   ├── monitoring/
│   │   ├── health.ts         # Metric collection from nodes + VMs (24h retention)
│   │   └── anomaly.ts        # Threshold, trend, spike, flatline detection
│   ├── autopilot/
│   │   ├── daemon.ts         # Background polling daemon
│   │   └── rules.ts          # Autopilot rule definitions
│   ├── tools/
│   │   ├── registry.ts       # Tool registry + adapter pattern
│   │   ├── proxmox/          # Proxmox VE API adapter (VMs, containers, snapshots, storage, firewall, migration)
│   │   └── system/           # System tools (SSH, exec, ping)
│   └── frontends/
│       ├── cli.ts            # Interactive REPL + one-shot mode
│       ├── telegram.ts       # Telegram bot with inline approval buttons (grammY)
│       ├── mcp.ts            # MCP server for Claude Code integration
│       └── dashboard/
│           ├── server.ts     # HTTP + SSE server with REST API
│           └── template.ts   # Single-page HTML template
├── policies/
│   └── default.yaml          # Default governance policy
├── package.json
├── tsconfig.json
└── .env
```

## License

MIT

---

<p align="center">
  Built by <a href="https://github.com/patelpa1639">Pranav Patel</a>
</p>
