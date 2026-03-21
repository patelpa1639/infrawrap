import { useEffect, useRef } from "react";
import { useStore } from "../store";
import type { AgentEvent } from "../types";

export function useSSE() {
  const sourceRef = useRef<EventSource | null>(null);
  const store = useStore();

  useEffect(() => {
    function connect() {
      const es = new EventSource("/api/agent/events");
      sourceRef.current = es;

      es.onopen = () => store.setConnected(true);
      es.onerror = () => {
        store.setConnected(false);
        es.close();
        setTimeout(connect, 3000);
      };

      es.onmessage = (msg) => {
        try {
          const event: AgentEvent = JSON.parse(msg.data);
          handleEvent(event);
        } catch {
          // ignore parse errors
        }
      };

      // Listen for typed events
      const eventTypes = [
        "plan_created", "plan_approved", "replan",
        "step_started", "step_completed", "step_failed",
        "approval_requested", "circuit_breaker_tripped",
        "investigation_started", "investigation_complete",
        "incident_opened", "incident_action", "incident_resolved",
        "incident_failed", "incident_rca",
        "healing_started", "healing_completed", "healing_failed",
        "healing_paused", "healing_escalated",
        "chaos_simulated", "chaos_started", "chaos_recovery_detected",
        "chaos_completed", "chaos_failed",
        "health_check",
      ];

      for (const type of eventTypes) {
        es.addEventListener(type, (e) => {
          try {
            const data = JSON.parse((e as MessageEvent).data);
            handleEvent({ type, timestamp: new Date().toISOString(), data });
          } catch {
            // ignore
          }
        });
      }
    }

    function handleEvent(event: AgentEvent) {
      const d = event.data;
      const s = useStore.getState();

      // Add to event stream
      s.addEvent(event);

      switch (event.type) {
        case "plan_created":
          s.setPlan(d as unknown as import("../types").Plan);
          if (d.mode) s.setMode(d.mode as import("../types").AgentMode);
          break;

        case "replan":
          s.incrementReplans();
          if (d.new_plan) s.setPlan(d.new_plan as unknown as import("../types").Plan);
          break;

        case "step_started":
          s.updateStep(d.step_id as string, { status: "running" });
          s.incrementActions();
          break;

        case "step_completed":
          s.updateStep(d.step_id as string, {
            status: "success",
            duration_ms: d.duration_ms as number,
            output: d.result,
          });
          s.incrementCompleted();
          break;

        case "step_failed":
          s.updateStep(d.step_id as string, {
            status: "failed",
            duration_ms: d.duration_ms as number,
            error: d.error as string,
          });
          s.incrementFailed();
          s.incrementFailures();
          break;

        case "incident_opened":
          s.addActiveIncident(d as unknown as import("../types").Incident);
          break;

        case "incident_action":
          s.updateIncident(d.incident_id as string, {
            actions_taken: d.actions_taken as import("../types").IncidentAction[],
          });
          break;

        case "incident_resolved":
          s.resolveIncident(d.incident_id as string, {
            status: "resolved",
            resolved_at: d.resolved_at as string,
            duration_ms: d.duration_ms as number,
            resolution: d.resolution as string,
          });
          break;

        case "incident_failed":
          s.resolveIncident(d.incident_id as string, {
            status: "failed",
            resolved_at: d.resolved_at as string,
          });
          break;

        case "incident_rca":
          s.updateIncident(d.incident_id as string, {
            rca: d.rca as import("../types").RootCauseAnalysis,
          });
          break;

        case "healing_started":
          s.updateIncident(d.incident_id as string, { status: "healing" });
          s.setMode("heal");
          break;

        case "healing_completed":
          s.removeHealingBanner(d.incident_id as string);
          break;

        case "healing_failed":
          s.removeHealingBanner(d.incident_id as string);
          break;

        case "healing_paused":
          s.addHealingBanner({
            type: "paused",
            message: d.message as string || "Healing paused - circuit breaker tripped",
            id: d.incident_id as string || "paused",
          });
          break;

        case "healing_escalated":
          s.addHealingBanner({
            type: "escalated",
            message: d.message as string || "Incident escalated to operator",
            id: d.incident_id as string || "escalated",
          });
          break;

        case "health_check":
          s.addHealth(d as unknown as import("../types").HealthSummary);
          break;
      }
    }

    connect();

    return () => {
      sourceRef.current?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
