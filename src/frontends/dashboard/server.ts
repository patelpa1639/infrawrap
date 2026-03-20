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
import { IncidentManager } from "../../healing/incidents.js";
import { getDataDir } from "../../config.js";
import { join } from "node:path";
import { getHTML } from "./template.js";
import type { HealingOrchestrator } from "../../healing/orchestrator.js";
import { linearRegression, predictTimeToThreshold } from "../../monitoring/anomaly.js";
import type { DataPoint as AnomalyDataPoint } from "../../monitoring/anomaly.js";

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
  private incidentManager: IncidentManager;
  healer?: HealingOrchestrator;

  constructor(
    private readonly port: number,
    private readonly agentCore: AgentCore,
    private readonly toolRegistry: ToolRegistry,
    private readonly eventBus: EventBus,
    private readonly audit: AuditLog,
  ) {
    // Create a read-only IncidentManager that loads persisted incidents from disk
    this.incidentManager = new IncidentManager(eventBus, join(getDataDir(), "healing"));
  }

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
        case "/api/incidents":
          this.handleIncidents(res);
          break;
        case "/api/health/predictions":
          this.handlePredictions(res);
          break;
        default:
          // Dynamic route: /api/incidents/:id/timeline
          if (path.startsWith("/api/incidents/") && path.endsWith("/timeline")) {
            const incidentId = path.replace("/api/incidents/", "").replace("/timeline", "");
            this.handleIncidentTimeline(res, incidentId);
          } else {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Not found" }));
          }
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

  private handleIncidents(res: ServerResponse): void {
    try {
      const open = this.incidentManager.getOpen();
      const recent = this.incidentManager.getRecent(20);
      const patterns = this.incidentManager.getPatterns();
      this.json(res, { open, recent, patterns });
    } catch (err) {
      this.json(res, { error: "Failed to fetch incidents" }, 500);
    }
  }

  private handleIncidentTimeline(res: ServerResponse, incidentId: string): void {
    try {
      const incident = this.incidentManager.getById(incidentId);
      if (!incident) {
        this.json(res, { error: "Incident not found" }, 404);
        return;
      }
      const timeline = this.incidentManager.getTimeline(incidentId);
      this.json(res, { incident, timeline });
    } catch (err) {
      this.json(res, { error: "Failed to fetch incident timeline" }, 500);
    }
  }

  private handlePredictions(res: ServerResponse): void {
    try {
      const store = this.healer?.getHealthMonitor().store;
      if (!store) {
        this.json(res, { predictions: [] });
        return;
      }

      const CRITICAL_THRESHOLD = 90;
      const targetMetrics = ["node_cpu_pct", "node_mem_pct", "node_disk_pct"];
      const predictions: unknown[] = [];

      for (const metric of targetMetrics) {
        const allLatest = store.getAllLatest(metric);
        for (const { value: currentValue, labels } of allLatest) {
          const rawPoints = store.query(metric, labels, 30);
          if (rawPoints.length < 2) continue;

          // Convert health.ts DataPoints (numeric ts) to anomaly.ts DataPoints (string ts)
          const anomalyPoints: AnomalyDataPoint[] = rawPoints.map((p) => ({
            timestamp: new Date(p.timestamp).toISOString(),
            value: p.value,
            labels: p.labels,
          }));

          const { slope } = linearRegression(anomalyPoints);
          const slopePerHour = slope * 60; // slope is per minute from linearRegression
          const hoursToThreshold = predictTimeToThreshold(currentValue, slope, CRITICAL_THRESHOLD);

          const projected1h = Math.min(100, Math.max(0, currentValue + slopePerHour * 1));
          const projected6h = Math.min(100, Math.max(0, currentValue + slopePerHour * 6));
          const projected24h = Math.min(100, Math.max(0, currentValue + slopePerHour * 24));

          let status: string;
          if (hoursToThreshold === null || hoursToThreshold > 48) {
            status = "healthy";
          } else if (hoursToThreshold > 6) {
            status = "warning";
          } else {
            status = "critical";
          }

          predictions.push({
            metric,
            labels,
            current: Math.round(currentValue * 10) / 10,
            slope_per_hour: Math.round(slopePerHour * 100) / 100,
            projected_1h: Math.round(projected1h * 10) / 10,
            projected_6h: Math.round(projected6h * 10) / 10,
            projected_24h: Math.round(projected24h * 10) / 10,
            hours_to_critical: hoursToThreshold !== null ? Math.round(hoursToThreshold * 10) / 10 : null,
            status,
          });
        }
      }

      this.json(res, { predictions });
    } catch (err) {
      console.error("[DashboardServer] Predictions error:", err);
      this.json(res, { error: "Failed to generate predictions" }, 500);
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
