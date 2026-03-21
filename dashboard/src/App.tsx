import { useSSE } from "./hooks/useSSE";
import { useClusterPolling, useIncidentPolling } from "./hooks/usePolling";
import { useStore } from "./store";
import Header from "./components/Header";
import EventStream from "./components/EventStream";
import TopologyMap from "./components/TopologyMap";
import ActivePlan from "./components/ActivePlan";
import Resources from "./components/Resources";
import Nodes from "./components/Nodes";
import Incidents from "./components/Incidents";
import Governance from "./components/Governance";
import Chaos from "./components/Chaos";
import CommandPalette from "./components/CommandPalette";
import ToastContainer from "./components/Toast";
import type { TabId } from "./types";

const TABS: { id: TabId; label: string; icon?: string }[] = [
  { id: "topology", label: "Topology", icon: "🔗" },
  { id: "plan", label: "Active Plan" },
  { id: "resources", label: "Resources" },
  { id: "nodes", label: "Nodes" },
  { id: "incidents", label: "Incidents" },
  { id: "governance", label: "Governance" },
  { id: "chaos", label: "Chaos", icon: "⚡" },
];

export function App() {
  useSSE();
  useClusterPolling();
  useIncidentPolling();

  const activeTab = useStore((s) => s.activeTab);
  const setActiveTab = useStore((s) => s.setActiveTab);
  const activeIncidents = useStore((s) => s.activeIncidents);

  return (
    <>
      <Header />

      <div className="main">
        <div className="col-left">
          <div className="tabs">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`tab${activeTab === tab.id ? " active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon && <span style={{ marginRight: 4 }}>{tab.icon}</span>}
                {tab.label}
                {tab.id === "incidents" && (
                  <span className={`tab-badge${activeIncidents.length === 0 ? " zero" : ""}`}>
                    {activeIncidents.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div style={{ position: "relative" }}>
            {activeTab === "topology" && <TopologyMap />}
            {activeTab === "plan" && <ActivePlan />}
            {activeTab === "resources" && <Resources />}
            {activeTab === "nodes" && <Nodes />}
            {activeTab === "incidents" && <Incidents />}
            {activeTab === "governance" && <Governance />}
            {activeTab === "chaos" && <Chaos />}
          </div>
        </div>

        <div className="col-right">
          <EventStream />
        </div>
      </div>

      <CommandPalette />
      <ToastContainer />
    </>
  );
}
