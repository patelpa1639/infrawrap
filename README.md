# InfraWrap

**Autonomous infrastructure agent with built-in governance.**

Plan. Deploy. Monitor. Heal. — Any hypervisor, any cloud.

Give it a goal in plain English. It plans a multi-step deployment, executes each step against real infrastructure, observes the results, and replans on failure. Every action passes through a governance engine with tiered approvals, circuit breakers, blast radius limits, and a full audit trail.

---

## What Makes This Different

This is not an LLM wrapper that calls APIs. It's an **agent with a reasoning loop**.

| Feature | Typical automation | InfraWrap |
|---|---|---|
| Execution | Run a script | Plan → Execute → Observe → Replan |
| Failure handling | Script fails, you debug | Agent investigates root cause, proposes fix |
| Safety | Hope for the best | Tiered approvals, circuit breakers, audit trail |
| Learning | None | Cross-session memory, pattern recognition |

### The Agent Loop

```
Goal → Plan → [Approve] → Execute → Observe → Evaluate
                                        ↓
                                   Failed? → Replan → [Re-approve] → Continue
                                        ↓
                                   Tripped? → Stop → Alert → Investigate
```

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                       InfraWrap                           │
│                                                           │
│  FRONTENDS                                                │
│  ┌────────┐  ┌──────────┐  ┌───────────┐  ┌──────────┐   │
│  │  CLI   │  │ Telegram │  │    Web    │  │   MCP    │   │
│  │ (REPL) │  │   Bot    │  │ Dashboard │  │  Server  │   │
│  └───┬────┘  └────┬─────┘  └─────┬─────┘  └────┬─────┘   │
│      └────────┬───┴──────────────┴──────────────┘         │
│               ▼                                           │
│  BRAIN                                                    │
│  ┌──────────────────────────────────────────────────┐     │
│  │                  Agent Core                       │     │
│  │  Planner │ Executor │ Observer │ Investigator     │     │
│  │  Memory  │ Replanner │ Event Bus                  │     │
│  └──────────────────────────────────────────────────┘     │
│               ▼                                           │
│  GOVERNANCE                                               │
│  ┌──────────────────────────────────────────────────┐     │
│  │  Policy Engine │ Action Classifier │ Approval Gate│     │
│  │  Circuit Breaker │ Audit Log │ Rollback Manager   │     │
│  └──────────────────────────────────────────────────┘     │
│               ▼                                           │
│  ADAPTERS                                                 │
│  ┌──────────┐  ┌───────────┐  ┌──────────┐               │
│  │ Proxmox  │  │  vSphere  │  │  System  │               │
│  │   API    │  │  (planned) │  │ SSH/Exec │               │
│  └──────────┘  └───────────┘  └──────────┘               │
│                                                           │
│  AUTOPILOT                                                │
│  ┌──────────────────────────────────────────────────┐     │
│  │  Health Poller → Rules Engine → Self-Healing      │     │
│  └──────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────┘
```

---

## Quick Start

```bash
# Clone
git clone https://github.com/patelpa1639/infrawrap.git
cd infrawrap

# Install
npm install

# Configure
cp .env.example .env
# Edit .env with your Proxmox credentials and AI API key

# Run
npm run dev                    # Interactive CLI
npm run dev:dashboard          # Web dashboard on :3000
npm run dev:telegram           # Telegram bot
npm run dev:mcp                # MCP server (for Claude Code)
npm run dev:autopilot          # Autopilot daemon + dashboard
```

---

## Modes

### Build Mode
Describe what you want. The agent creates it.

```
infrawrap> Build me a 3-node Kubernetes cluster with 4 CPUs and 8GB RAM each

Planning...
┌────┬───────────────────────────┬──────────────┬────────────┐
│ #  │ Step                      │ Action       │ Tier       │
├────┼───────────────────────────┼──────────────┼────────────┤
│ 1  │ Create bridge network     │ create_vm    │ risky      │
│ 2  │ Provision k8s-master      │ create_vm    │ risky      │
│ 3  │ Provision k8s-worker-01   │ create_vm    │ risky      │
│ 4  │ Provision k8s-worker-02   │ create_vm    │ risky      │
│ 5  │ Configure networking      │ ssh_exec     │ risky      │
│ 6  │ Install kubeadm           │ ssh_exec     │ risky      │
│ 7  │ Verify cluster            │ ssh_exec     │ risky      │
└────┴───────────────────────────┴──────────────┴────────────┘
Resources: 12 CPU cores, 24GB RAM, 3 VMs

Approve this plan? [y/n]
```

### Watch Mode (Autopilot)
The agent monitors running infrastructure and self-heals when things break.

- Detects crashed VMs → restarts with cooldown
- Detects resource pressure → alerts
- Detects node failures → critical alerts
- All actions pass through governance before execution

### Investigate Mode
Something broke. The agent figures out why.

```
infrawrap> /investigate Why is my web server unreachable?

Investigating...
  → Checking VM status... running
  → Checking network... bridge is up
  → SSH into VM... eth0 has no IP
  → Checking DHCP server... lease pool exhausted

Root Cause: DHCP pool exhausted (14/14 addresses allocated)
Confidence: high

Proposed Fix:
  1. Expand DHCP pool from /28 to /24
  2. Renew lease on web server
  3. Add monitoring for DHCP pool capacity
```

---

## Governance

Every action is classified by risk and subject to policy controls.

### Action Tiers

| Tier | Examples | Approval |
|------|----------|----------|
| **read** | List VMs, check status, read logs | Never needed |
| **safe_write** | Start VM, create snapshot | Auto in watch mode |
| **risky_write** | Create VM, modify config, stop VM | Always required |
| **destructive** | Delete VM, delete snapshot | Explicit confirmation |
| **never** | Delete all, format storage | Agent refuses |

### Safety Mechanisms

- **Circuit Breaker** — 3 consecutive failures → agent pauses, alerts human
- **Blast Radius Limits** — Max VMs per action, max resource allocation %
- **Cooldown Timers** — Prevent restart loops
- **Snapshot Before Modify** — Auto-snapshot before risky changes
- **Full Audit Trail** — Every action logged with reasoning, approval, and state diff

### Policy Configuration

```yaml
# policies/default.yaml
guardrails:
  max_vms_per_action: 5
  max_ram_allocation_pct: 80
  require_snapshot_before_modify: true
  cooldown_between_restarts_s: 60
  max_restart_attempts: 3

boundaries:
  forbidden_actions:
    - delete_all
    - format_storage
    - modify_host_config
```

---

## Interfaces

| Interface | Use Case | Command |
|-----------|----------|---------|
| **CLI/REPL** | Local terminal | `npm run dev` |
| **Telegram** | Phone/mobile | `npm run dev:telegram` |
| **Dashboard** | Visual monitoring, demos | `npm run dev:dashboard` |
| **MCP Server** | Claude Code integration | `npm run dev:mcp` |
| **Autopilot** | Background daemon | `npm run dev:autopilot` |

---

## Adapters

InfraWrap uses an adapter pattern so it can talk to any infrastructure:

| Adapter | Status | Coverage |
|---------|--------|----------|
| **Proxmox VE** | Implemented | 31 tools (VMs, containers, snapshots, storage, firewall, migration) |
| **System** | Implemented | SSH exec, local exec, ping |
| **vSphere** | Planned | Via pyvmomi bridge |
| **libvirt/KVM** | Planned | — |
| **AWS** | Planned | — |

Adding a new adapter means implementing the `InfraAdapter` interface:

```typescript
interface InfraAdapter {
  name: string;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  getTools(): ToolDefinition[];
  execute(tool: string, params: Record<string, unknown>): Promise<ToolCallResult>;
  getClusterState(): Promise<ClusterState>;
}
```

---

## Tech Stack

- **TypeScript** — Strict mode, full type safety
- **Node.js 18+** — Async-native runtime
- **Claude / GPT** — LLM for planning, analysis, investigation
- **SQLite** — Audit log and agent memory (zero-config)
- **grammy** — Telegram bot framework
- **MCP SDK** — Model Context Protocol for AI tool integration
- **Zod** — Runtime schema validation
- **No frameworks** — Dashboard is pure HTML/CSS/JS, API server is raw Node.js http

---

## Project Structure

```
infrawrap/
├── src/
│   ├── index.ts                 # Entry point, mode router
│   ├── config.ts                # Environment config (Zod validated)
│   ├── types.ts                 # Core type system
│   ├── agent/                   # The brain
│   │   ├── core.ts              # Plan/Execute/Observe/Replan loop
│   │   ├── planner.ts           # Goal → execution plan
│   │   ├── executor.ts          # Step → tool call → verify
│   │   ├── observer.ts          # Expected vs actual state
│   │   ├── investigator.ts      # Root cause analysis
│   │   ├── memory.ts            # Cross-session learning (SQLite)
│   │   ├── events.ts            # Event bus for real-time streaming
│   │   ├── llm.ts               # LLM abstraction (Anthropic/OpenAI)
│   │   └── prompts.ts           # System prompts for each agent role
│   ├── governance/              # Safety & policy
│   │   ├── index.ts             # Governance engine
│   │   ├── policy.ts            # YAML policy loader
│   │   ├── classifier.ts        # Action tier classification
│   │   ├── approval.ts          # Approval gate
│   │   ├── circuit-breaker.ts   # Failure detection
│   │   └── audit.ts             # Audit logging (SQLite)
│   ├── tools/                   # What the agent can do
│   │   ├── registry.ts          # Tool registry
│   │   ├── proxmox/             # Proxmox VE adapter
│   │   │   ├── client.ts        # REST API client
│   │   │   └── adapter.ts       # InfraAdapter implementation
│   │   └── system/              # System tools
│   │       └── tools.ts         # SSH, exec, ping
│   ├── frontends/               # User interfaces
│   │   ├── cli.ts               # CLI/REPL
│   │   ├── telegram.ts          # Telegram bot
│   │   ├── mcp.ts               # MCP server
│   │   └── dashboard/           # Web dashboard
│   │       ├── server.ts        # HTTP + SSE server
│   │       └── template.ts      # HTML template
│   └── autopilot/               # Continuous monitoring
│       ├── daemon.ts            # Health polling loop
│       └── rules.ts             # Self-healing rules
├── policies/
│   └── default.yaml             # Default governance policy
├── labs/                        # Lab blueprint templates (YAML)
├── package.json
├── tsconfig.json
└── .env.example
```

---

## License

MIT

---

Built by [Pranav Patel](https://github.com/patelpa1639)
