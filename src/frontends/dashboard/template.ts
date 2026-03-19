// ============================================================
// InfraWrap — Dashboard HTML Template
// Premium SaaS-grade real-time agent dashboard
// ============================================================

export function getHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>InfraWrap — Autonomous Infrastructure Agent</title>
<style>
/* ── Reset & Base ────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg-950: #09090b;
  --bg-900: #18181b;
  --bg-800: #27272a;
  --bg-700: #3f3f46;
  --bg-600: #52525b;

  --text-50: #fafafa;
  --text-100: #f4f4f5;
  --text-200: #e4e4e7;
  --text-300: #d4d4d8;
  --text-400: #a1a1aa;
  --text-500: #71717a;

  --emerald-400: #34d399;
  --emerald-500: #10b981;
  --emerald-600: #059669;
  --emerald-900: #064e3b;

  --red-400: #f87171;
  --red-500: #ef4444;
  --red-900: #7f1d1d;

  --amber-400: #fbbf24;
  --amber-500: #f59e0b;
  --amber-900: #78350f;

  --blue-400: #60a5fa;
  --blue-500: #3b82f6;
  --blue-600: #2563eb;
  --blue-900: #1e3a5f;

  --purple-400: #a78bfa;
  --purple-500: #8b5cf6;
  --purple-900: #4c1d95;

  --glass-bg: rgba(24, 24, 27, 0.7);
  --glass-border: rgba(63, 63, 70, 0.5);
  --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);

  --font-mono: 'SF Mono', 'Cascadia Code', 'Fira Code', 'JetBrains Mono', 'Consolas', monospace;
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', Roboto, sans-serif;

  --radius: 12px;
  --radius-sm: 8px;
  --radius-xs: 6px;
}

html { font-size: 14px; }

body {
  font-family: var(--font-sans);
  background: var(--bg-950);
  color: var(--text-200);
  min-height: 100vh;
  overflow-x: hidden;
  background-image:
    radial-gradient(ellipse 80% 50% at 50% -20%, rgba(16, 185, 129, 0.08), transparent),
    radial-gradient(ellipse 60% 40% at 80% 100%, rgba(139, 92, 246, 0.05), transparent);
}

/* ── Animations ──────────────────────────────────────── */
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 8px rgba(59, 130, 246, 0.3), 0 0 24px rgba(59, 130, 246, 0.1); }
  50% { box-shadow: 0 0 16px rgba(59, 130, 246, 0.6), 0 0 48px rgba(59, 130, 246, 0.2); }
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.3); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes slideInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes borderGlow {
  0%, 100% { border-color: rgba(59, 130, 246, 0.3); }
  50% { border-color: rgba(59, 130, 246, 0.7); }
}

/* ── Header ──────────────────────────────────────────── */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 56px;
  background: var(--glass-bg);
  border-bottom: 1px solid var(--glass-border);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  position: sticky;
  top: 0;
  z-index: 100;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 1.2rem;
  color: var(--text-50);
  letter-spacing: -0.02em;
}

.logo-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--emerald-500), var(--blue-500));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 800;
  color: white;
}

.logo-sub {
  font-size: 0.7rem;
  font-weight: 400;
  color: var(--text-500);
  margin-left: 4px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: var(--text-400);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-500);
  transition: background 0.3s;
}

.status-dot.connected {
  background: var(--emerald-400);
  animation: pulse-dot 2s ease-in-out infinite;
}

.status-dot.disconnected {
  background: var(--red-400);
}

.mode-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.mode-badge.build {
  background: rgba(59, 130, 246, 0.15);
  color: var(--blue-400);
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.mode-badge.watch {
  background: rgba(16, 185, 129, 0.15);
  color: var(--emerald-400);
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.mode-badge.investigate {
  background: rgba(245, 158, 11, 0.15);
  color: var(--amber-400);
  border: 1px solid rgba(245, 158, 11, 0.3);
}

/* ── Main Layout ─────────────────────────────────────── */
.main {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  padding: 16px 24px 24px;
  max-width: 1600px;
  margin: 0 auto;
}

@media (max-width: 1024px) {
  .main { grid-template-columns: 1fr; }
}

.left-col { display: flex; flex-direction: column; gap: 16px; }
.right-col { display: flex; flex-direction: column; gap: 16px; }

/* ── Card Base ───────────────────────────────────────── */
.card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: var(--glass-shadow);
  overflow: hidden;
  animation: slideInUp 0.4s ease-out;
  transition: border-color 0.3s;
}

.card:hover {
  border-color: rgba(113, 113, 122, 0.4);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid var(--glass-border);
}

.card-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-100);
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-title-icon {
  font-size: 1rem;
}

.card-badge {
  font-size: 0.65rem;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
}

.card-body {
  padding: 18px;
}

/* ── Active Plan Card (Showpiece) ────────────────────── */
.plan-card { }

.plan-info {
  margin-bottom: 16px;
}

.plan-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-50);
  margin-bottom: 4px;
}

.plan-desc {
  font-size: 0.8rem;
  color: var(--text-400);
  line-height: 1.5;
}

.plan-meta {
  display: flex;
  gap: 16px;
  margin-top: 8px;
  font-size: 0.72rem;
  color: var(--text-500);
}

.plan-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Pipeline visualization */
.pipeline {
  display: flex;
  align-items: center;
  gap: 0;
  overflow-x: auto;
  padding: 12px 0;
  scrollbar-width: thin;
  scrollbar-color: var(--bg-700) transparent;
}

.pipeline::-webkit-scrollbar { height: 4px; }
.pipeline::-webkit-scrollbar-track { background: transparent; }
.pipeline::-webkit-scrollbar-thumb { background: var(--bg-700); border-radius: 2px; }

.pipeline-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.step-box {
  padding: 10px 16px;
  border-radius: var(--radius-sm);
  border: 1.5px solid var(--bg-700);
  background: var(--bg-800);
  min-width: 120px;
  text-align: center;
  transition: all 0.4s ease;
  position: relative;
}

.step-box .step-name {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-200);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
}

.step-box .step-status-icon {
  font-size: 1rem;
}

.step-box .step-duration {
  font-size: 0.65rem;
  color: var(--text-500);
  font-family: var(--font-mono);
  margin-top: 2px;
}

/* Step states */
.step-box.pending {
  border-color: var(--bg-600);
  opacity: 0.6;
}

.step-box.running {
  border-color: var(--blue-500);
  background: rgba(59, 130, 246, 0.1);
  animation: pulse-glow 2s ease-in-out infinite, borderGlow 2s ease-in-out infinite;
}

.step-box.success {
  border-color: var(--emerald-500);
  background: rgba(16, 185, 129, 0.08);
}

.step-box.failed {
  border-color: var(--red-500);
  background: rgba(239, 68, 68, 0.08);
}

.step-box.skipped {
  border-color: var(--bg-700);
  opacity: 0.4;
  text-decoration: line-through;
}

.step-box.rolled_back {
  border-color: var(--amber-500);
  background: rgba(245, 158, 11, 0.08);
  text-decoration: line-through;
}

.pipeline-arrow {
  color: var(--bg-600);
  font-size: 0.9rem;
  flex-shrink: 0;
  padding: 0 4px;
  margin-bottom: 18px;
  font-family: var(--font-mono);
  transition: color 0.3s;
}

.pipeline-arrow.done {
  color: var(--emerald-500);
}

.no-plan {
  text-align: center;
  padding: 32px 16px;
  color: var(--text-500);
}

.no-plan-icon {
  font-size: 2rem;
  margin-bottom: 8px;
  opacity: 0.5;
}

.no-plan-text {
  font-size: 0.85rem;
}

/* ── Reasoning Stream ────────────────────────────────── */
.reasoning-stream {
  height: 320px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--bg-700) transparent;
}

.reasoning-stream::-webkit-scrollbar { width: 5px; }
.reasoning-stream::-webkit-scrollbar-track { background: transparent; }
.reasoning-stream::-webkit-scrollbar-thumb { background: var(--bg-700); border-radius: 3px; }

.event-entry {
  display: flex;
  gap: 10px;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(39, 39, 42, 0.5);
  font-family: var(--font-mono);
  font-size: 0.75rem;
  line-height: 1.6;
  animation: fadeIn 0.3s ease-out;
  transition: background 0.2s;
}

.event-entry:hover {
  background: rgba(39, 39, 42, 0.3);
}

.event-time {
  color: var(--text-500);
  white-space: nowrap;
  flex-shrink: 0;
  font-size: 0.7rem;
}

.event-type-badge {
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 0.65rem;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.event-type-badge.plan { background: rgba(139, 92, 246, 0.2); color: var(--purple-400); }
.event-type-badge.step { background: rgba(59, 130, 246, 0.2); color: var(--blue-400); }
.event-type-badge.success { background: rgba(16, 185, 129, 0.2); color: var(--emerald-400); }
.event-type-badge.fail { background: rgba(239, 68, 68, 0.2); color: var(--red-400); }
.event-type-badge.warn { background: rgba(245, 158, 11, 0.2); color: var(--amber-400); }
.event-type-badge.info { background: rgba(96, 165, 250, 0.15); color: var(--blue-400); }

.event-message {
  color: var(--text-300);
  word-break: break-word;
}

.empty-stream {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-500);
  gap: 8px;
}

.empty-stream-icon { font-size: 1.5rem; opacity: 0.4; }
.empty-stream-text { font-size: 0.8rem; }

/* ── Governance Panel ────────────────────────────────── */
.gov-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 16px;
}

.gov-stat {
  text-align: center;
  padding: 10px;
  border-radius: var(--radius-xs);
  background: var(--bg-800);
  border: 1px solid rgba(39, 39, 42, 0.5);
}

.gov-stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  font-family: var(--font-mono);
}

.gov-stat-value.success { color: var(--emerald-400); }
.gov-stat-value.blocked { color: var(--red-400); }
.gov-stat-value.warning { color: var(--amber-400); }

.gov-stat-label {
  font-size: 0.65rem;
  color: var(--text-500);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 2px;
}

.pending-approvals {
  margin-bottom: 16px;
}

.pending-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-300);
  margin-bottom: 8px;
}

.approval-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  background: var(--bg-800);
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: var(--radius-xs);
  margin-bottom: 6px;
  animation: slideInRight 0.3s ease-out;
}

.approval-info {
  flex: 1;
  min-width: 0;
}

.approval-action {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-200);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.approval-tier {
  font-size: 0.65rem;
  color: var(--amber-400);
}

.approval-buttons {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.btn {
  padding: 4px 10px;
  border: none;
  border-radius: var(--radius-xs);
  font-size: 0.7rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-approve {
  background: rgba(16, 185, 129, 0.2);
  color: var(--emerald-400);
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.btn-approve:hover {
  background: rgba(16, 185, 129, 0.35);
}

.btn-deny {
  background: rgba(239, 68, 68, 0.15);
  color: var(--red-400);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.btn-deny:hover {
  background: rgba(239, 68, 68, 0.3);
}

.audit-list {
  max-height: 180px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--bg-700) transparent;
}

.audit-entry {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid rgba(39, 39, 42, 0.4);
  font-size: 0.72rem;
}

.audit-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.audit-dot.success { background: var(--emerald-400); }
.audit-dot.failed { background: var(--red-400); }
.audit-dot.blocked { background: var(--amber-400); }
.audit-dot.rolled_back { background: var(--purple-400); }

.audit-action {
  color: var(--text-300);
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.audit-time {
  color: var(--text-500);
  font-family: var(--font-mono);
  font-size: 0.65rem;
  flex-shrink: 0;
}

/* ── Cluster Resources Card ──────────────────────────── */
.resource-rings {
  display: flex;
  justify-content: center;
  gap: 28px;
  margin-bottom: 16px;
}

.ring-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.ring {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.6s ease;
}

.ring-value {
  font-size: 1.1rem;
  font-weight: 700;
  font-family: var(--font-mono);
  color: var(--text-50);
}

.ring-unit {
  font-size: 0.6rem;
  color: var(--text-500);
}

.ring-label {
  font-size: 0.7rem;
  color: var(--text-400);
  font-weight: 500;
}

.resource-counts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.res-count {
  text-align: center;
  padding: 8px;
  background: var(--bg-800);
  border-radius: var(--radius-xs);
  border: 1px solid rgba(39, 39, 42, 0.5);
}

.res-count-value {
  font-size: 1.2rem;
  font-weight: 700;
  font-family: var(--font-mono);
  color: var(--text-100);
}

.res-count-label {
  font-size: 0.6rem;
  color: var(--text-500);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Storage bar */
.storage-section {
  margin-top: 14px;
}

.storage-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  color: var(--text-400);
  margin-bottom: 4px;
}

.storage-bar {
  height: 6px;
  background: var(--bg-700);
  border-radius: 3px;
  overflow: hidden;
}

.storage-fill {
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, var(--emerald-500), var(--blue-500));
  transition: width 0.8s ease;
}

.storage-fill.high {
  background: linear-gradient(90deg, var(--amber-500), var(--red-500));
}

/* ── VMs Card ────────────────────────────────────────── */
.vm-list {
  max-height: 260px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--bg-700) transparent;
}

.vm-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: var(--radius-xs);
  margin-bottom: 4px;
  transition: background 0.2s;
}

.vm-item:hover {
  background: rgba(39, 39, 42, 0.4);
}

.vm-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.vm-dot.running { background: var(--emerald-400); }
.vm-dot.stopped { background: var(--red-400); }
.vm-dot.paused { background: var(--amber-400); }
.vm-dot.unknown { background: var(--text-500); }

.vm-info { flex: 1; min-width: 0; }

.vm-name {
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--text-200);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.vm-meta {
  font-size: 0.65rem;
  color: var(--text-500);
  font-family: var(--font-mono);
}

.vm-status {
  font-size: 0.65rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  flex-shrink: 0;
}

.vm-status.running { color: var(--emerald-400); }
.vm-status.stopped { color: var(--red-400); }
.vm-status.paused { color: var(--amber-400); }

.empty-vms {
  text-align: center;
  padding: 24px 0;
  color: var(--text-500);
  font-size: 0.8rem;
}

/* ── Alerts Card ─────────────────────────────────────── */
.alert-list {
  max-height: 200px;
  overflow-y: auto;
}

.alert-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 10px;
  border-radius: var(--radius-xs);
  margin-bottom: 4px;
  animation: fadeIn 0.3s ease-out;
}

.alert-severity-bar {
  width: 3px;
  min-height: 28px;
  border-radius: 2px;
  flex-shrink: 0;
  align-self: stretch;
}

.alert-severity-bar.critical { background: var(--red-400); }
.alert-severity-bar.warning { background: var(--amber-400); }
.alert-severity-bar.info { background: var(--blue-400); }

.alert-content { flex: 1; }

.alert-message {
  font-size: 0.75rem;
  color: var(--text-200);
  line-height: 1.4;
}

.alert-source {
  font-size: 0.65rem;
  color: var(--text-500);
  font-family: var(--font-mono);
  margin-top: 2px;
}

.all-clear {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 28px 0;
  color: var(--emerald-400);
  gap: 6px;
}

.all-clear-icon {
  font-size: 1.8rem;
  opacity: 0.7;
}

.all-clear-text {
  font-size: 0.8rem;
  color: var(--text-400);
}

/* ── Replan diff styling ─────────────────────────────── */
.step-box.removed {
  opacity: 0.35;
  text-decoration: line-through;
  border-color: var(--red-400);
  border-style: dashed;
}

.step-box.new-step {
  border-color: var(--purple-400);
  background: rgba(139, 92, 246, 0.1);
  box-shadow: 0 0 12px rgba(139, 92, 246, 0.2);
}
</style>
</head>
<body>

<!-- ── Header ──────────────────────────────────────────── -->
<header class="header">
  <div class="logo">
    <div class="logo-icon">IW</div>
    <span>InfraWrap</span>
    <span class="logo-sub">Autonomous Infrastructure Agent</span>
  </div>
  <div class="header-right">
    <div class="connection-status">
      <span class="status-dot" id="connDot"></span>
      <span id="connText">Connecting...</span>
    </div>
    <div class="mode-badge watch" id="modeBadge">Watch</div>
  </div>
</header>

<!-- ── Main Grid ───────────────────────────────────────── -->
<main class="main">
  <!-- Left Column -->
  <div class="left-col">

    <!-- Active Plan -->
    <div class="card plan-card">
      <div class="card-header">
        <div class="card-title">
          <span class="card-title-icon">&#x1F4CB;</span> Active Plan
        </div>
        <span class="card-badge" id="planBadge" style="background:rgba(59,130,246,0.15);color:var(--blue-400);">No Plan</span>
      </div>
      <div class="card-body" id="planBody">
        <div class="no-plan">
          <div class="no-plan-icon">&#x1F916;</div>
          <div class="no-plan-text">Waiting for agent to create a plan...</div>
        </div>
      </div>
    </div>

    <!-- Agent Reasoning Stream -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <span class="card-title-icon">&#x1F9E0;</span> Agent Reasoning
        </div>
        <span class="card-badge" style="background:rgba(139,92,246,0.15);color:var(--purple-400);" id="eventCount">0 events</span>
      </div>
      <div class="card-body" style="padding:0;">
        <div class="reasoning-stream" id="reasoningStream">
          <div class="empty-stream">
            <div class="empty-stream-icon">&#x1F4AD;</div>
            <div class="empty-stream-text">Agent reasoning will appear here in real-time</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Governance Panel -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <span class="card-title-icon">&#x1F6E1;&#xFE0F;</span> Governance
        </div>
      </div>
      <div class="card-body">
        <div class="gov-stats">
          <div class="gov-stat">
            <div class="gov-stat-value success" id="statActions">0</div>
            <div class="gov-stat-label">Actions Today</div>
          </div>
          <div class="gov-stat">
            <div class="gov-stat-value blocked" id="statBlocked">0</div>
            <div class="gov-stat-label">Blocked</div>
          </div>
          <div class="gov-stat">
            <div class="gov-stat-value warning" id="statAlerts">0</div>
            <div class="gov-stat-label">Alerts</div>
          </div>
        </div>

        <div class="pending-approvals" id="pendingApprovals" style="display:none;">
          <div class="pending-title">Pending Approvals</div>
          <div id="approvalList"></div>
        </div>

        <div class="pending-title" style="margin-bottom:6px;">Recent Audit</div>
        <div class="audit-list" id="auditList">
          <div style="text-align:center;color:var(--text-500);font-size:0.75rem;padding:12px 0;">No audit entries yet</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Right Column -->
  <div class="right-col">

    <!-- Cluster Resources -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <span class="card-title-icon">&#x1F4CA;</span> Cluster Resources
        </div>
      </div>
      <div class="card-body">
        <div class="resource-rings">
          <div class="ring-container">
            <div class="ring" id="cpuRing" style="background: conic-gradient(var(--emerald-500) 0% 0%, var(--bg-700) 0% 100%);">
              <div>
                <div class="ring-value" id="cpuValue">0<span class="ring-unit">%</span></div>
              </div>
            </div>
            <div class="ring-label">CPU</div>
          </div>
          <div class="ring-container">
            <div class="ring" id="ramRing" style="background: conic-gradient(var(--blue-500) 0% 0%, var(--bg-700) 0% 100%);">
              <div>
                <div class="ring-value" id="ramValue">0<span class="ring-unit">%</span></div>
              </div>
            </div>
            <div class="ring-label">RAM</div>
          </div>
        </div>
        <div class="resource-counts">
          <div class="res-count">
            <div class="res-count-value" id="vmCount">0</div>
            <div class="res-count-label">VMs</div>
          </div>
          <div class="res-count">
            <div class="res-count-value" id="ctCount">0</div>
            <div class="res-count-label">Containers</div>
          </div>
          <div class="res-count">
            <div class="res-count-value" id="nodeCount">0</div>
            <div class="res-count-label">Nodes</div>
          </div>
        </div>
        <div class="storage-section">
          <div class="storage-label">
            <span>Storage</span>
            <span id="storageText">0 / 0 GB</span>
          </div>
          <div class="storage-bar">
            <div class="storage-fill" id="storageFill" style="width:0%;"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Running VMs -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <span class="card-title-icon">&#x1F5A5;&#xFE0F;</span> Running Labs / VMs
        </div>
        <span class="card-badge" style="background:rgba(16,185,129,0.15);color:var(--emerald-400);" id="vmBadge">0 VMs</span>
      </div>
      <div class="card-body" style="padding:8px 12px;">
        <div class="vm-list" id="vmList">
          <div class="empty-vms">No VMs discovered</div>
        </div>
      </div>
    </div>

    <!-- Alerts -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <span class="card-title-icon">&#x1F514;</span> Alerts
        </div>
        <span class="card-badge" id="alertBadge" style="background:rgba(16,185,129,0.15);color:var(--emerald-400);">All Clear</span>
      </div>
      <div class="card-body">
        <div class="alert-list" id="alertList">
          <div class="all-clear" id="allClear">
            <div class="all-clear-icon">&#x2705;</div>
            <div class="all-clear-text">All systems operational</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</main>

<script>
// ── State ──────────────────────────────────────────────────
const state = {
  connected: false,
  mode: 'watch',
  plan: null,
  steps: [],
  events: [],
  alerts: [],
  approvals: [],
  cluster: null,
  auditStats: null,
  auditEntries: [],
  eventCounter: 0,
};

// ── DOM refs ───────────────────────────────────────────────
const $ = (id) => document.getElementById(id);

// ── SSE Connection ─────────────────────────────────────────
let evtSource = null;
let reconnectTimer = null;

function connectSSE() {
  if (evtSource) { try { evtSource.close(); } catch(e) {} }

  evtSource = new EventSource('/api/agent/events');

  evtSource.addEventListener('connected', (e) => {
    state.connected = true;
    updateConnectionStatus();
  });

  evtSource.addEventListener('plan_created', (e) => handleEvent(JSON.parse(e.data)));
  evtSource.addEventListener('plan_approved', (e) => handleEvent(JSON.parse(e.data)));
  evtSource.addEventListener('step_started', (e) => handleEvent(JSON.parse(e.data)));
  evtSource.addEventListener('step_completed', (e) => handleEvent(JSON.parse(e.data)));
  evtSource.addEventListener('step_failed', (e) => handleEvent(JSON.parse(e.data)));
  evtSource.addEventListener('replan', (e) => handleEvent(JSON.parse(e.data)));
  evtSource.addEventListener('investigation_started', (e) => handleEvent(JSON.parse(e.data)));
  evtSource.addEventListener('investigation_complete', (e) => handleEvent(JSON.parse(e.data)));
  evtSource.addEventListener('approval_requested', (e) => handleEvent(JSON.parse(e.data)));
  evtSource.addEventListener('approval_received', (e) => handleEvent(JSON.parse(e.data)));
  evtSource.addEventListener('circuit_breaker_tripped', (e) => handleEvent(JSON.parse(e.data)));
  evtSource.addEventListener('alert_fired', (e) => handleEvent(JSON.parse(e.data)));
  evtSource.addEventListener('alert_resolved', (e) => handleEvent(JSON.parse(e.data)));
  evtSource.addEventListener('health_check', (e) => handleEvent(JSON.parse(e.data)));

  evtSource.onopen = () => {
    state.connected = true;
    updateConnectionStatus();
    if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
  };

  evtSource.onerror = () => {
    state.connected = false;
    updateConnectionStatus();
    evtSource.close();
    // Auto-reconnect after 3s
    if (!reconnectTimer) {
      reconnectTimer = setTimeout(() => { reconnectTimer = null; connectSSE(); }, 3000);
    }
  };
}

// ── Event Handler ──────────────────────────────────────────
function handleEvent(event) {
  state.eventCounter++;
  state.events.push(event);
  if (state.events.length > 500) state.events = state.events.slice(-400);

  switch (event.type) {
    case 'plan_created':
      state.plan = {
        id: event.data.plan_id,
        goal: event.data.goal,
        reasoning: event.data.reasoning,
        step_count: event.data.step_count,
        status: 'executing',
      };
      state.steps = [];
      // Build initial pending steps from count
      for (let i = 0; i < (event.data.step_count || 0); i++) {
        state.steps.push({ id: 'step-' + i, name: 'Step ' + (i + 1), status: 'pending', duration: null });
      }
      if (event.data.mode) state.mode = event.data.mode;
      break;

    case 'plan_approved':
      if (state.plan) state.plan.status = 'approved';
      break;

    case 'step_started':
      updateStep(event.data.step_id, {
        status: 'running',
        name: event.data.action || event.data.description || event.data.step_id,
      });
      break;

    case 'step_completed':
      updateStep(event.data.step_id, {
        status: 'success',
        name: event.data.action || event.data.description || event.data.step_id,
        duration: event.data.duration_ms,
      });
      break;

    case 'step_failed':
      updateStep(event.data.step_id, {
        status: 'failed',
        name: event.data.action || event.data.description || event.data.step_id,
        error: event.data.error,
      });
      break;

    case 'replan':
      if (state.plan) state.plan.status = 'replanning';
      // Mark remaining pending steps as removed
      state.steps.forEach(s => { if (s.status === 'pending') s.status = 'removed'; });
      state.mode = 'build';
      break;

    case 'investigation_started':
      state.mode = 'investigate';
      break;

    case 'approval_requested':
      state.approvals.push({
        id: event.data.plan_id || event.data.request_id || ('apr-' + Date.now()),
        action: event.data.type || event.data.action || 'Unknown action',
        tier: event.data.tier || 'risky_write',
        timestamp: event.timestamp,
      });
      break;

    case 'approval_received':
      state.approvals = state.approvals.filter(a => a.id !== (event.data.request_id || event.data.plan_id));
      break;

    case 'alert_fired':
      state.alerts.unshift({
        id: event.data.alert_id || ('alert-' + Date.now()),
        severity: event.data.severity || 'warning',
        message: event.data.message || 'Alert fired',
        source: event.data.source || 'system',
        timestamp: event.timestamp,
      });
      if (state.alerts.length > 50) state.alerts = state.alerts.slice(0, 50);
      break;

    case 'alert_resolved':
      state.alerts = state.alerts.filter(a => a.id !== event.data.alert_id);
      break;

    case 'circuit_breaker_tripped':
      state.alerts.unshift({
        id: 'cb-' + Date.now(),
        severity: 'critical',
        message: 'Circuit breaker tripped! Execution halted.',
        source: 'governance',
        timestamp: event.timestamp,
      });
      break;
  }

  updateUI();
}

function updateStep(stepId, updates) {
  let step = state.steps.find(s => s.id === stepId);
  if (!step) {
    step = { id: stepId, name: stepId, status: 'pending', duration: null };
    state.steps.push(step);
  }
  Object.assign(step, updates);
}

// ── UI Updates ─────────────────────────────────────────────
function updateUI() {
  updateConnectionStatus();
  updateModeBadge();
  updatePlan();
  updateReasoningStream();
  updateGovernance();
  updateAlerts();
  updateEventCount();
}

function updateConnectionStatus() {
  const dot = $('connDot');
  const text = $('connText');
  if (state.connected) {
    dot.className = 'status-dot connected';
    text.textContent = 'Connected';
  } else {
    dot.className = 'status-dot disconnected';
    text.textContent = 'Reconnecting...';
  }
}

function updateModeBadge() {
  const badge = $('modeBadge');
  badge.className = 'mode-badge ' + state.mode;
  badge.textContent = state.mode.charAt(0).toUpperCase() + state.mode.slice(1);
}

function updateEventCount() {
  $('eventCount').textContent = state.eventCounter + ' events';
}

function updatePlan() {
  const body = $('planBody');
  const badge = $('planBadge');

  if (!state.plan) {
    badge.textContent = 'No Plan';
    badge.style.background = 'rgba(113,113,122,0.15)';
    badge.style.color = 'var(--text-400)';
    body.innerHTML = '<div class="no-plan"><div class="no-plan-icon">&#x1F916;</div><div class="no-plan-text">Waiting for agent to create a plan...</div></div>';
    return;
  }

  const statusColors = {
    executing: { bg: 'rgba(59,130,246,0.15)', color: 'var(--blue-400)' },
    approved: { bg: 'rgba(16,185,129,0.15)', color: 'var(--emerald-400)' },
    completed: { bg: 'rgba(16,185,129,0.15)', color: 'var(--emerald-400)' },
    failed: { bg: 'rgba(239,68,68,0.15)', color: 'var(--red-400)' },
    replanning: { bg: 'rgba(245,158,11,0.15)', color: 'var(--amber-400)' },
  };
  const sc = statusColors[state.plan.status] || statusColors.executing;
  badge.textContent = state.plan.status.charAt(0).toUpperCase() + state.plan.status.slice(1);
  badge.style.background = sc.bg;
  badge.style.color = sc.color;

  // Build plan info + pipeline
  let html = '<div class="plan-info">';
  html += '<div class="plan-title">' + escapeHtml(state.plan.goal || 'Plan ' + state.plan.id) + '</div>';
  if (state.plan.reasoning) {
    html += '<div class="plan-desc">' + escapeHtml(state.plan.reasoning).substring(0, 200) + '</div>';
  }
  html += '<div class="plan-meta"><span>&#x1F522; ' + state.steps.length + ' steps</span>';
  html += '<span>&#x1F4DD; Rev ' + (state.plan.revision || 1) + '</span></div>';
  html += '</div>';

  // Pipeline
  if (state.steps.length > 0) {
    html += '<div class="pipeline">';
    state.steps.forEach((step, i) => {
      const statusClass = step.status || 'pending';
      const icon = getStepIcon(step.status);
      html += '<div class="pipeline-step"><div class="step-box ' + statusClass + '">';
      html += '<div class="step-name">' + escapeHtml(step.name || ('Step ' + (i + 1))) + '</div>';
      html += '<div class="step-status-icon">' + icon + '</div>';
      if (step.duration != null) {
        html += '<div class="step-duration">' + formatDuration(step.duration) + '</div>';
      }
      html += '</div></div>';
      if (i < state.steps.length - 1) {
        const arrowClass = (step.status === 'success') ? 'pipeline-arrow done' : 'pipeline-arrow';
        html += '<div class="' + arrowClass + '">&#x25B6;</div>';
      }
    });
    html += '</div>';
  }

  body.innerHTML = html;
}

function getStepIcon(status) {
  switch (status) {
    case 'success': return '&#x2705;';
    case 'running': return '<span style="display:inline-block;animation:spin 1s linear infinite;">&#x1F504;</span>';
    case 'failed': return '&#x274C;';
    case 'skipped': return '&#x23ED;';
    case 'rolled_back': return '&#x21A9;&#xFE0F;';
    case 'removed': return '&#x1F6AB;';
    default: return '&#x23F3;';
  }
}

function updateReasoningStream() {
  const stream = $('reasoningStream');
  const events = state.events.slice(-100);

  if (events.length === 0) return;

  let html = '';
  events.forEach(ev => {
    const time = formatTime(ev.timestamp);
    const badge = getEventBadge(ev.type);
    const msg = getEventMessage(ev);
    html += '<div class="event-entry">';
    html += '<span class="event-time">' + time + '</span>';
    html += '<span class="event-type-badge ' + badge.cls + '">' + badge.label + '</span>';
    html += '<span class="event-message">' + escapeHtml(msg) + '</span>';
    html += '</div>';
  });

  stream.innerHTML = html;
  // Auto-scroll to bottom
  stream.scrollTop = stream.scrollHeight;
}

function getEventBadge(type) {
  const map = {
    plan_created: { cls: 'plan', label: 'PLAN' },
    plan_approved: { cls: 'success', label: 'APPROVED' },
    step_started: { cls: 'step', label: 'STEP' },
    step_completed: { cls: 'success', label: 'DONE' },
    step_failed: { cls: 'fail', label: 'FAIL' },
    replan: { cls: 'warn', label: 'REPLAN' },
    investigation_started: { cls: 'warn', label: 'INVESTIGATE' },
    investigation_complete: { cls: 'info', label: 'FINDING' },
    approval_requested: { cls: 'warn', label: 'APPROVAL' },
    approval_received: { cls: 'success', label: 'APPROVED' },
    circuit_breaker_tripped: { cls: 'fail', label: 'BREAKER' },
    alert_fired: { cls: 'fail', label: 'ALERT' },
    alert_resolved: { cls: 'success', label: 'RESOLVED' },
    health_check: { cls: 'info', label: 'HEALTH' },
  };
  return map[type] || { cls: 'info', label: type.toUpperCase() };
}

function getEventMessage(ev) {
  const d = ev.data || {};
  switch (ev.type) {
    case 'plan_created': return 'Created plan: ' + (d.goal || d.plan_id) + ' (' + (d.step_count || 0) + ' steps)';
    case 'plan_approved': return 'Plan ' + (d.plan_id || '').substring(0, 8) + ' approved';
    case 'step_started': return 'Executing: ' + (d.action || d.description || d.step_id);
    case 'step_completed': return (d.action || d.step_id) + ' completed in ' + formatDuration(d.duration_ms);
    case 'step_failed': return (d.action || d.step_id) + ' failed: ' + (d.error || 'unknown error');
    case 'replan': return 'Replanning due to failure. New approach: ' + (d.reasoning || '').substring(0, 120);
    case 'investigation_started': return 'Investigating: ' + (d.trigger || 'unknown issue');
    case 'investigation_complete': return 'Root cause: ' + (d.root_cause || 'unknown') + ' (' + (d.findings_count || 0) + ' findings)';
    case 'approval_requested': return 'Awaiting approval for ' + (d.type || d.action || 'action') + ' in ' + (d.mode || 'build') + ' mode';
    case 'approval_received': return 'Approval received: ' + (d.approved ? 'APPROVED' : 'DENIED');
    case 'circuit_breaker_tripped': return 'Circuit breaker tripped! Step: ' + (d.step_id || 'unknown');
    case 'alert_fired': return '[' + (d.severity || 'warning').toUpperCase() + '] ' + (d.message || 'Alert');
    case 'alert_resolved': return 'Alert resolved: ' + (d.alert_id || '');
    case 'health_check': return 'Health: ' + (d.target || '') + ' is ' + (d.status || 'unknown');
    default: return JSON.stringify(d).substring(0, 150);
  }
}

function updateGovernance() {
  // Approvals
  const approvalSection = $('pendingApprovals');
  const approvalList = $('approvalList');
  if (state.approvals.length > 0) {
    approvalSection.style.display = 'block';
    let html = '';
    state.approvals.forEach(a => {
      html += '<div class="approval-item">';
      html += '<div class="approval-info"><div class="approval-action">' + escapeHtml(a.action) + '</div>';
      html += '<div class="approval-tier">' + escapeHtml(a.tier) + '</div></div>';
      html += '<div class="approval-buttons">';
      html += '<button class="btn btn-approve" onclick="approveAction(\\'' + a.id + '\\')">Approve</button>';
      html += '<button class="btn btn-deny" onclick="denyAction(\\'' + a.id + '\\')">Deny</button>';
      html += '</div></div>';
    });
    approvalList.innerHTML = html;
  } else {
    approvalSection.style.display = 'none';
  }
}

function updateClusterUI(data) {
  if (!data) return;
  state.cluster = data;

  const nodes = data.nodes || [];
  const vms = data.vms || [];
  const containers = data.containers || [];
  const storage = data.storage || [];

  // CPU & RAM rings
  let totalCpu = 0, usedCpu = 0, totalRam = 0, usedRam = 0;
  nodes.forEach(n => {
    totalCpu += n.cpu_cores || 0;
    usedCpu += (n.cpu_cores || 0) * (n.cpu_usage_pct || 0) / 100;
    totalRam += n.ram_total_mb || 0;
    usedRam += n.ram_used_mb || 0;
  });

  const cpuPct = totalCpu > 0 ? Math.round((usedCpu / totalCpu) * 100) : 0;
  const ramPct = totalRam > 0 ? Math.round((usedRam / totalRam) * 100) : 0;

  const cpuColor = cpuPct > 80 ? 'var(--red-400)' : cpuPct > 60 ? 'var(--amber-400)' : 'var(--emerald-500)';
  const ramColor = ramPct > 80 ? 'var(--red-400)' : ramPct > 60 ? 'var(--amber-400)' : 'var(--blue-500)';

  $('cpuRing').style.background = 'conic-gradient(' + cpuColor + ' 0% ' + cpuPct + '%, var(--bg-700) ' + cpuPct + '% 100%)';
  $('cpuValue').innerHTML = cpuPct + '<span class="ring-unit">%</span>';
  $('ramRing').style.background = 'conic-gradient(' + ramColor + ' 0% ' + ramPct + '%, var(--bg-700) ' + ramPct + '% 100%)';
  $('ramValue').innerHTML = ramPct + '<span class="ring-unit">%</span>';

  // Counts
  $('vmCount').textContent = vms.length;
  $('ctCount').textContent = containers.length;
  $('nodeCount').textContent = nodes.length;
  $('vmBadge').textContent = vms.length + ' VMs';

  // Storage
  let totalStorage = 0, usedStorage = 0;
  storage.forEach(s => { totalStorage += s.total_gb || 0; usedStorage += s.used_gb || 0; });
  const storagePct = totalStorage > 0 ? Math.round((usedStorage / totalStorage) * 100) : 0;
  $('storageText').textContent = usedStorage.toFixed(0) + ' / ' + totalStorage.toFixed(0) + ' GB';
  const fill = $('storageFill');
  fill.style.width = storagePct + '%';
  fill.className = 'storage-fill' + (storagePct > 80 ? ' high' : '');

  // VM list
  const vmList = $('vmList');
  if (vms.length === 0) {
    vmList.innerHTML = '<div class="empty-vms">No VMs discovered</div>';
  } else {
    let html = '';
    vms.forEach(vm => {
      const st = vm.status || 'unknown';
      html += '<div class="vm-item">';
      html += '<div class="vm-dot ' + st + '"></div>';
      html += '<div class="vm-info"><div class="vm-name">' + escapeHtml(vm.name || 'VM ' + vm.id) + '</div>';
      html += '<div class="vm-meta">VMID ' + vm.id + ' &middot; ' + (vm.ram_mb || 0) + ' MB</div></div>';
      html += '<div class="vm-status ' + st + '">' + st + '</div>';
      html += '</div>';
    });
    vmList.innerHTML = html;
  }
}

function updateAlerts() {
  const list = $('alertList');
  const badge = $('alertBadge');

  if (state.alerts.length === 0) {
    list.innerHTML = '<div class="all-clear" id="allClear"><div class="all-clear-icon">&#x2705;</div><div class="all-clear-text">All systems operational</div></div>';
    badge.textContent = 'All Clear';
    badge.style.background = 'rgba(16,185,129,0.15)';
    badge.style.color = 'var(--emerald-400)';
    return;
  }

  const critCount = state.alerts.filter(a => a.severity === 'critical').length;
  badge.textContent = state.alerts.length + ' Active';
  badge.style.background = critCount > 0 ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)';
  badge.style.color = critCount > 0 ? 'var(--red-400)' : 'var(--amber-400)';

  let html = '';
  state.alerts.slice(0, 10).forEach(a => {
    html += '<div class="alert-item">';
    html += '<div class="alert-severity-bar ' + a.severity + '"></div>';
    html += '<div class="alert-content"><div class="alert-message">' + escapeHtml(a.message) + '</div>';
    html += '<div class="alert-source">' + escapeHtml(a.source) + ' &middot; ' + formatTime(a.timestamp) + '</div></div>';
    html += '</div>';
  });
  list.innerHTML = html;
}

function updateAuditUI(entries) {
  state.auditEntries = entries || [];
  const list = $('auditList');
  if (state.auditEntries.length === 0) {
    list.innerHTML = '<div style="text-align:center;color:var(--text-500);font-size:0.75rem;padding:12px 0;">No audit entries yet</div>';
    return;
  }

  let html = '';
  state.auditEntries.slice(0, 10).forEach(e => {
    html += '<div class="audit-entry">';
    html += '<div class="audit-dot ' + (e.result || 'success') + '"></div>';
    html += '<div class="audit-action">' + escapeHtml(e.action) + '</div>';
    html += '<div class="audit-time">' + formatTime(e.timestamp) + '</div>';
    html += '</div>';
  });
  list.innerHTML = html;
}

function updateAuditStatsUI(stats) {
  if (!stats) return;
  state.auditStats = stats;
  $('statActions').textContent = stats.total || 0;
  $('statBlocked').textContent = (stats.by_result && stats.by_result.blocked) || 0;

  // Alerts count from state
  $('statAlerts').textContent = state.alerts.length;
}

// ── API Fetchers ───────────────────────────────────────────
async function fetchCluster() {
  try {
    const res = await fetch('/api/cluster');
    if (res.ok) updateClusterUI(await res.json());
  } catch (e) { /* silent */ }
}

async function fetchAudit() {
  try {
    const res = await fetch('/api/audit?limit=10');
    if (res.ok) updateAuditUI(await res.json());
  } catch (e) { /* silent */ }
}

async function fetchAuditStats() {
  try {
    const res = await fetch('/api/audit/stats');
    if (res.ok) updateAuditStatsUI(await res.json());
  } catch (e) { /* silent */ }
}

// ── Approval actions (stubs — wired to backend later) ──────
function approveAction(id) {
  state.approvals = state.approvals.filter(a => a.id !== id);
  updateGovernance();
}

function denyAction(id) {
  state.approvals = state.approvals.filter(a => a.id !== id);
  updateGovernance();
}

// ── Helpers ────────────────────────────────────────────────
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

function formatTime(ts) {
  if (!ts) return '--:--:--';
  try {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-US', { hour12: false });
  } catch { return ts; }
}

function formatDuration(ms) {
  if (ms == null) return '';
  if (ms < 1000) return ms + 'ms';
  if (ms < 60000) return (ms / 1000).toFixed(1) + 's';
  return (ms / 60000).toFixed(1) + 'm';
}

// ── Init ───────────────────────────────────────────────────
connectSSE();
fetchCluster();
fetchAudit();
fetchAuditStats();

// Periodic refreshes
setInterval(fetchCluster, 15000);
setInterval(fetchAuditStats, 30000);
setInterval(fetchAudit, 30000);
</script>
</body>
</html>`;
}
