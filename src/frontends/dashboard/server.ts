// ============================================================
// InfraWrap — Dashboard Server
// HTTP + SSE server for the real-time agent dashboard
// ============================================================

import { createServer, type Server, type IncomingMessage, type ServerResponse } from "node:http";
import type { AgentCore } from "../../agent/core.js";
import type { ToolRegistry } from "../../tools/registry.js";
import { EventBus } from "../../agent/events.js";
import type { AuditLog } from "../../governance/audit.js";
import type { AgentEvent } from "../../types.js";
import { getHTML } from "./template.js";

// ── SSE Client Tracking ────────────────────────────────────

interface SSEClient {
  id: number;
  res: ServerResponse;
  connectedAt: number;
}

// ── Dashboard Server ───────────────────────────────────────

export class DashboardServer {
  private server: Server | null = null;
  private clients: Map<number, SSEClient> = new Map();
  private clientIdCounter = 0;
  private eventListener: ((event: AgentEvent) => void) | null = null;

  constructor(
    private readonly port: number,
    private readonly agentCore: AgentCore,
    private readonly toolRegistry: ToolRegistry,
    private readonly eventBus: EventBus,
    private readonly audit: AuditLog,
  ) {}

  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = createServer((req, res) => this.handleRequest(req, res));

      // Subscribe to all EventBus events and forward to SSE clients
      this.eventListener = (event: AgentEvent) => {
        this.broadcast(event);
      };
      this.eventBus.on("*", this.eventListener);

      this.server.on("error", (err) => {
        console.error("[DashboardServer] Server error:", err);
        reject(err);
      });

      this.server.listen(this.port, () => {
        console.log(`[DashboardServer] Listening on http://localhost:${this.port}`);
        resolve();
      });
    });
  }

  stop(): void {
    // Unsubscribe from EventBus
    if (this.eventListener) {
      this.eventBus.off("*", this.eventListener);
      this.eventListener = null;
    }

    // Close all SSE connections
    for (const [id, client] of this.clients) {
      try {
        client.res.end();
      } catch {
        // Client may already be disconnected
      }
      this.clients.delete(id);
    }

    // Close the HTTP server
    if (this.server) {
      this.server.close();
      this.server = null;
    }

    console.log("[DashboardServer] Stopped.");
  }

  // ── Request Router ──────────────────────────────────────

  private handleRequest(req: IncomingMessage, res: ServerResponse): void {
    const url = new URL(req.url || "/", `http://localhost:${this.port}`);
    const path = url.pathname;

    // CORS headers for local development
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    try {
      switch (path) {
        case "/":
          this.serveHTML(res);
          break;
        case "/api/cluster":
          this.handleCluster(res);
          break;
        case "/api/agent/status":
          this.handleAgentStatus(res);
          break;
        case "/api/agent/events":
          this.handleSSE(req, res);
          break;
        case "/api/audit":
          this.handleAudit(res, url);
          break;
        case "/api/audit/stats":
          this.handleAuditStats(res);
          break;
        default:
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Not found" }));
      }
    } catch (err) {
      console.error("[DashboardServer] Request error:", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Internal server error" }));
    }
  }

  // ── Route Handlers ──────────────────────────────────────

  private serveHTML(res: ServerResponse): void {
    const html = getHTML();
    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-cache",
    });
    res.end(html);
  }

  private async handleCluster(res: ServerResponse): Promise<void> {
    try {
      const state = await this.toolRegistry.getClusterState();
      this.json(res, state ?? { nodes: [], vms: [], containers: [], storage: [], timestamp: new Date().toISOString() });
    } catch (err) {
      this.json(res, { error: "Failed to fetch cluster state" }, 500);
    }
  }

  private handleAgentStatus(res: ServerResponse): void {
    // Gather current agent state from the event bus history
    const history = this.eventBus.getHistory(100);

    // Find the most recent plan
    const lastPlanEvent = [...history]
      .reverse()
      .find((e) => e.type === "plan_created" || e.type === "replan");

    // Find the most recent step event
    const lastStepEvent = [...history]
      .reverse()
      .find((e) =>
        e.type === "step_started" ||
        e.type === "step_completed" ||
        e.type === "step_failed",
      );

    // Determine current mode from the most recent plan
    const mode = lastPlanEvent?.data?.mode ?? "watch";

    this.json(res, {
      mode,
      current_plan: lastPlanEvent?.data ?? null,
      current_step: lastStepEvent?.data ?? null,
      event_count: history.length,
      connected_clients: this.clients.size,
    });
  }

  private handleSSE(req: IncomingMessage, res: ServerResponse): void {
    const clientId = ++this.clientIdCounter;

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no", // Disable nginx buffering if proxied
    });

    // Send initial connection event
    res.write(`event: connected\ndata: ${JSON.stringify({ clientId, timestamp: new Date().toISOString() })}\n\n`);

    // Send recent history so the client can catch up
    const recentEvents = this.eventBus.getHistory(50);
    for (const event of recentEvents) {
      res.write(`event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`);
    }

    const client: SSEClient = { id: clientId, res, connectedAt: Date.now() };
    this.clients.set(clientId, client);

    // Heartbeat to keep connection alive
    const heartbeat = setInterval(() => {
      try {
        res.write(`: heartbeat\n\n`);
      } catch {
        clearInterval(heartbeat);
      }
    }, 15_000);

    // Clean up on disconnect
    req.on("close", () => {
      clearInterval(heartbeat);
      this.clients.delete(clientId);
    });
  }

  private handleAudit(res: ServerResponse, url: URL): void {
    const filters: Record<string, unknown> = {};
    const action = url.searchParams.get("action");
    const tier = url.searchParams.get("tier");
    const result = url.searchParams.get("result");
    const since = url.searchParams.get("since");
    const limit = url.searchParams.get("limit");

    if (action) filters.action = action;
    if (tier) filters.tier = tier;
    if (result) filters.result = result;
    if (since) filters.since = since;
    if (limit) filters.limit = parseInt(limit, 10);

    try {
      const entries = this.audit.query(filters as any);
      this.json(res, entries);
    } catch (err) {
      this.json(res, { error: "Failed to query audit log" }, 500);
    }
  }

  private handleAuditStats(res: ServerResponse): void {
    try {
      const stats = this.audit.getStats();
      this.json(res, stats);
    } catch (err) {
      this.json(res, { error: "Failed to get audit stats" }, 500);
    }
  }

  // ── SSE Broadcasting ────────────────────────────────────

  private broadcast(event: AgentEvent): void {
    const data = `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`;

    for (const [id, client] of this.clients) {
      try {
        client.res.write(data);
      } catch {
        // Client disconnected — clean up
        this.clients.delete(id);
      }
    }
  }

  // ── Helpers ─────────────────────────────────────────────

  private json(res: ServerResponse, data: unknown, status = 200): void {
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
  }
}
