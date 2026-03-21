import { useStore } from "../store";
import { formatUptime } from "../hooks/useFormatters";

export default function Nodes() {
  const cluster = useStore((s) => s.cluster);

  if (!cluster || !cluster.nodes.length) {
    return <div className="empty-state">No nodes found</div>;
  }

  return (
    <div className="nodes-grid">
      {cluster.nodes.map((node) => {
        const cpuPct = node.cpu_usage_pct || node.cpu_pct || 0;
        const ramTotalMb = node.ram_total_mb || node.ram_mb || 1;
        const ramPct = (node.ram_used_mb / ramTotalMb) * 100;
        const ramTotalGb = ramTotalMb / 1024;

        return (
          <div key={node.id} className="node-card">
            <div className="node-name">
              <span
                className={`dot ${node.status === "online" ? "online" : "offline"}`}
              />
              {node.name}
            </div>
            <div className="node-stat">CPU: {node.cpu_cores} cores / {cpuPct.toFixed(1)}%</div>
            <div className="node-stat">RAM: {ramPct.toFixed(1)}% / {ramTotalGb.toFixed(1)} GB</div>
            <div className="node-stat">Uptime: {formatUptime(node.uptime_s)}</div>
          </div>
        );
      })}
    </div>
  );
}
