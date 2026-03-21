import { create } from "zustand";
import type {
  AgentMode,
  ClusterState,
  Plan,
  StepState,
  AgentEvent,
  Incident,
  HealingBanner,
  HealthSummary,
  TabId,
  Toast,
} from "../types";

interface DashboardState {
  // Connection
  connected: boolean;
  setConnected: (v: boolean) => void;

  // Mode
  mode: AgentMode;
  setMode: (m: AgentMode) => void;

  // Active tab
  activeTab: TabId;
  setActiveTab: (t: TabId) => void;

  // Cluster
  cluster: ClusterState | null;
  setCluster: (c: ClusterState) => void;

  // Plan
  plan: Plan | null;
  planSteps: Record<string, StepState>;
  planCompleted: number;
  planFailed: number;
  replans: number;
  currentPlanId: string | null;
  planGoals: Record<string, string>;
  setPlan: (p: Plan) => void;
  updateStep: (id: string, s: Partial<StepState>) => void;
  incrementCompleted: () => void;
  incrementFailed: () => void;
  incrementReplans: () => void;

  // Events
  events: AgentEvent[];
  addEvent: (e: AgentEvent) => void;

  // Incidents
  activeIncidents: Incident[];
  recentIncidents: Incident[];
  setIncidents: (active: Incident[], recent: Incident[]) => void;
  addActiveIncident: (i: Incident) => void;
  updateIncident: (id: string, updates: Partial<Incident>) => void;
  resolveIncident: (id: string, resolution: Partial<Incident>) => void;
  expandedIncidents: Record<string, boolean>;
  toggleIncidentExpanded: (id: string) => void;

  // Healing
  healingBanners: HealingBanner[];
  addHealingBanner: (b: HealingBanner) => void;
  removeHealingBanner: (id: string) => void;

  // Health
  healthHistory: HealthSummary[];
  lastHealth: HealthSummary | null;
  addHealth: (h: HealthSummary) => void;

  // Toasts
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id" | "timestamp">) => void;
  removeToast: (id: string) => void;

  // Governance counters
  totalActions: number;
  failures: number;
  startTime: number;
  incrementActions: () => void;
  incrementFailures: () => void;
}

export const useStore = create<DashboardState>((set) => ({
  connected: false,
  setConnected: (v) => set({ connected: v }),

  mode: "watch",
  setMode: (m) => set({ mode: m }),

  activeTab: "topology",
  setActiveTab: (t) => set({ activeTab: t }),

  cluster: null,
  setCluster: (c) => set({ cluster: c }),

  plan: null,
  planSteps: {},
  planCompleted: 0,
  planFailed: 0,
  replans: 0,
  currentPlanId: null,
  planGoals: {},
  setPlan: (p) =>
    set((s) => ({
      plan: p,
      currentPlanId: p.id,
      planCompleted: 0,
      planFailed: 0,
      planSteps: {},
      planGoals: { ...s.planGoals, [p.id]: (p as unknown as Record<string, unknown>).goal as string || p.reasoning || "" },
    })),
  updateStep: (id, updates) =>
    set((s) => ({
      planSteps: { ...s.planSteps, [id]: { ...s.planSteps[id], ...updates } as StepState },
    })),
  incrementCompleted: () => set((s) => ({ planCompleted: s.planCompleted + 1 })),
  incrementFailed: () => set((s) => ({ planFailed: s.planFailed + 1 })),
  incrementReplans: () => set((s) => ({ replans: s.replans + 1 })),

  events: [],
  addEvent: (e) => set((s) => ({ events: [...s.events, e] })),

  activeIncidents: [],
  recentIncidents: [],
  setIncidents: (active, recent) => set({ activeIncidents: active, recentIncidents: recent }),
  addActiveIncident: (i) =>
    set((s) => ({ activeIncidents: [i, ...s.activeIncidents] })),
  updateIncident: (id, updates) =>
    set((s) => ({
      activeIncidents: s.activeIncidents.map((i) =>
        i.id === id ? { ...i, ...updates } : i
      ),
    })),
  resolveIncident: (id, resolution) =>
    set((s) => {
      const incident = s.activeIncidents.find((i) => i.id === id);
      if (!incident) return s;
      const resolved = { ...incident, ...resolution };
      return {
        activeIncidents: s.activeIncidents.filter((i) => i.id !== id),
        recentIncidents: [resolved, ...s.recentIncidents].slice(0, 20),
      };
    }),
  expandedIncidents: {},
  toggleIncidentExpanded: (id) =>
    set((s) => ({
      expandedIncidents: { ...s.expandedIncidents, [id]: !s.expandedIncidents[id] },
    })),

  healingBanners: [],
  addHealingBanner: (b) =>
    set((s) => ({
      healingBanners: [...s.healingBanners.filter((x) => x.id !== b.id), b],
    })),
  removeHealingBanner: (id) =>
    set((s) => ({
      healingBanners: s.healingBanners.filter((x) => x.id !== id),
    })),

  healthHistory: [],
  lastHealth: null,
  addHealth: (h) =>
    set((s) => ({
      lastHealth: h,
      healthHistory: [...s.healthHistory, h].slice(-30),
    })),

  toasts: [],
  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    set((s) => ({
      toasts: [{ ...toast, id, timestamp: new Date().toISOString() }, ...s.toasts].slice(0, 20),
    }));
  },
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  totalActions: 0,
  failures: 0,
  startTime: Date.now(),
  incrementActions: () => set((s) => ({ totalActions: s.totalActions + 1 })),
  incrementFailures: () => set((s) => ({ failures: s.failures + 1 })),
}));
