// ============================================================
// InfraWrap — Dashboard HTML Template
// Clean, premium SaaS-grade real-time agent dashboard
// Inspired by Vercel, Linear, and Grafana design systems
// ============================================================

export function getHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>InfraWrap — Infrastructure Agent</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
/* ── Reset ───────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg-primary: #0B1120;
  --bg-card: #111928;
  --bg-elevated: #162035;
  --bg-hover: #1a2540;
  --bg-active: #1f2d4a;

  --border: rgba(255, 255, 255, 0.07);
  --border-subtle: rgba(255, 255, 255, 0.04);
  --border-focus: rgba(255, 255, 255, 0.12);

  --text-primary: #EEF2F7;
  --text-secondary: #8899B0;
  --text-tertiary: #5A7491;
  --text-accent: #ffffff;

  --teal: #0ACDAA;
  --teal-deep: #07A589;
  --teal-muted: rgba(10, 205, 170, 0.10);
  --teal-border: rgba(10, 205, 170, 0.20);

  --green: #0ACDAA;
  --green-muted: rgba(10, 205, 170, 0.10);
  --red: #ef4444;
  --red-muted: rgba(239, 68, 68, 0.10);
  --amber: #eab308;
  --amber-muted: rgba(234, 179, 8, 0.10);
  --blue: #3b9eff;
  --blue-muted: rgba(59, 158, 255, 0.10);
  --purple: #a78bfa;
  --purple-muted: rgba(167, 139, 250, 0.10);

  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-brand: 'Syne', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', 'Consolas', monospace;

  --radius: 8px;
  --radius-sm: 6px;
  --radius-lg: 12px;
}

html { font-size: 14px; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }

body {
  font-family: var(--font-sans);
  background: var(--bg-primary);
  color: var(--text-primary);
  min-height: 100vh;
  line-height: 1.5;
}

/* ── Animations (minimal, purposeful) ────────────────── */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── Scrollbar ───────────────────────────────────────── */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--border-focus); }

/* ── Header ──────────────────────────────────────────── */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 48px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-primary);
  position: sticky;
  top: 0;
  z-index: 50;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-brand);
  font-weight: 800;
  font-size: 1rem;
  color: var(--text-accent);
  letter-spacing: -0.035em;
}

.logo .brand-accent {
  color: var(--teal);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.conn-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  color: var(--text-tertiary);
}

.conn-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--text-tertiary);
}

.conn-dot.live {
  background: var(--teal);
}

.conn-dot.dead {
  background: var(--red);
}

.mode-pill {
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 0.71rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.mode-pill.build { background: var(--blue-muted); color: var(--blue); }
.mode-pill.watch { background: var(--teal-muted); color: var(--teal); }
.mode-pill.investigate { background: var(--amber-muted); color: var(--amber); }

/* ── Stat Row ────────────────────────────────────────── */
.stat-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1px;
  background: var(--border);
  border-bottom: 1px solid var(--border);
}

.stat-cell {
  background: var(--bg-primary);
  padding: 16px 24px;
}

.stat-label {
  font-size: 0.71rem;
  font-weight: 500;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-accent);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}

.stat-value .unit {
  font-size: 0.78rem;
  font-weight: 400;
  color: var(--text-tertiary);
  margin-left: 2px;
}

/* ── Main Layout ─────────────────────────────────────── */
.main {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 0;
  max-width: 1440px;
  margin: 0 auto;
  min-height: calc(100vh - 48px - 73px);
}

@media (max-width: 1080px) {
  .main { grid-template-columns: 1fr; }
}

.col-left {
  border-right: 1px solid var(--border);
}

/* ── Card ────────────────────────────────────────────── */
.card {
  border-bottom: 1px solid var(--border);
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  border-bottom: 1px solid var(--border-subtle);
}

.card-title {
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
}

.card-title svg { width: 14px; height: 14px; opacity: 0.6; }

.card-badge {
  font-size: 0.64rem;
  font-weight: 500;
  padding: 1px 6px;
  border-radius: 3px;
  font-variant-numeric: tabular-nums;
}

.card-body { padding: 16px 24px; }
.card-body.flush { padding: 0; }

/* ── Active Plan / Pipeline ──────────────────────────── */
.plan-header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--border-subtle);
}

.plan-goal-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 10px;
}

.plan-mode-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
  margin-top: 1px;
}

.plan-mode-icon.build { background: var(--blue-muted); color: var(--blue); }
.plan-mode-icon.watch { background: var(--green-muted); color: var(--green); }
.plan-mode-icon.investigate { background: var(--amber-muted); color: var(--amber); }
.plan-mode-icon.heal { background: var(--purple-muted); color: var(--purple); }

.plan-goal-text {
  flex: 1;
  min-width: 0;
}

.plan-goal {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--text-accent);
  line-height: 1.4;
  margin-bottom: 2px;
}

.plan-reasoning {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.plan-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 0.71rem;
  color: var(--text-tertiary);
}

.plan-meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.plan-meta-item .meta-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
}

.plan-progress-bar {
  flex: 1;
  height: 3px;
  background: var(--bg-active);
  border-radius: 2px;
  overflow: hidden;
  min-width: 80px;
}

.plan-progress-fill {
  height: 100%;
  border-radius: 2px;
  background: var(--teal);
  transition: width 0.4s ease;
}

.plan-progress-fill.has-failures { background: var(--amber); }

/* Pipeline steps (vertical list) */
.pipeline {
  padding: 0;
}

.pipe-step {
  display: flex;
  align-items: stretch;
  position: relative;
}

.pipe-step-gutter {
  width: 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  position: relative;
}

.pipe-step-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid var(--border);
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.64rem;
  font-weight: 600;
  color: var(--text-tertiary);
  z-index: 2;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.pipe-step-line {
  width: 2px;
  flex: 1;
  background: var(--border);
  transition: background 0.3s ease;
}

.pipe-step:last-child .pipe-step-line { display: none; }

/* Step statuses */
.pipe-step.pending .pipe-step-number { border-color: var(--border); color: var(--text-tertiary); }
.pipe-step.running .pipe-step-number { border-color: var(--blue); color: var(--blue); background: var(--blue-muted); animation: pulse 1.5s ease-in-out infinite; }
.pipe-step.success .pipe-step-number { border-color: var(--teal); color: var(--teal); background: var(--teal-muted); }
.pipe-step.failed .pipe-step-number { border-color: var(--red); color: var(--red); background: var(--red-muted); }
.pipe-step.skipped .pipe-step-number { opacity: 0.3; }

.pipe-step.success .pipe-step-line { background: var(--teal); opacity: 0.3; }
.pipe-step.running .pipe-step-line { background: linear-gradient(to bottom, var(--blue) 0%, var(--border) 100%); opacity: 0.3; }

.pipe-step-content {
  flex: 1;
  padding: 4px 16px 16px 0;
  min-width: 0;
}

.pipe-step-action {
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--text-primary);
  font-family: var(--font-mono);
  margin-bottom: 2px;
}

.pipe-step-desc {
  font-size: 0.71rem;
  color: var(--text-tertiary);
  line-height: 1.4;
  margin-bottom: 4px;
}

.pipe-step-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pipe-step-tier {
  font-size: 0.60rem;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 3px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.pipe-step-tier.read { background: var(--blue-muted); color: var(--blue); }
.pipe-step-tier.safe_write { background: var(--green-muted); color: var(--green); }
.pipe-step-tier.risky_write { background: var(--amber-muted); color: var(--amber); }
.pipe-step-tier.destructive { background: var(--red-muted); color: var(--red); }

.pipe-step-duration {
  font-size: 0.64rem;
  font-family: var(--font-mono);
  color: var(--text-tertiary);
}

.pipe-step-error {
  margin-top: 4px;
  font-size: 0.71rem;
  color: var(--red);
  padding: 6px 10px;
  background: var(--red-muted);
  border-radius: var(--radius-sm);
  border-left: 2px solid var(--red);
}

.pipe-step.running .pipe-step-action { color: var(--blue); }
.pipe-step.failed .pipe-step-action { color: var(--red); }

/* Replan banner */
.plan-replan-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  background: var(--amber-muted);
  border-bottom: 1px solid rgba(234, 179, 8, 0.15);
  font-size: 0.75rem;
  color: var(--amber);
  animation: fadeIn 0.3s ease-out;
}

.plan-replan-banner .replan-icon {
  font-size: 0.85rem;
  flex-shrink: 0;
}

/* Plan completion */
.plan-complete-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 24px;
  font-size: 0.78rem;
}

.plan-complete-banner.success { background: var(--teal-muted); color: var(--teal); }
.plan-complete-banner.partial { background: var(--amber-muted); color: var(--amber); }

/* Step output results */
.step-output {
  margin-top: 6px;
  padding: 8px 12px;
  background: var(--bg-elevated);
  border-radius: var(--radius-sm);
  border-left: 2px solid var(--teal);
  max-height: 200px;
  overflow-y: auto;
  animation: fadeIn 0.2s ease-out;
}

.step-output-toggle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.64rem;
  color: var(--text-tertiary);
  cursor: pointer;
  margin-top: 4px;
  padding: 2px 6px;
  border-radius: 3px;
  background: var(--bg-elevated);
  border: none;
  font-family: var(--font-sans);
  transition: background 0.12s, color 0.12s;
}

.step-output-toggle:hover {
  background: var(--bg-hover);
  color: var(--text-secondary);
}

.step-output-toggle svg {
  width: 10px;
  height: 10px;
  transition: transform 0.15s ease;
}

.step-output-toggle.open svg {
  transform: rotate(90deg);
}

.step-output table {
  font-size: 0.71rem;
  width: 100%;
}

.step-output table th {
  font-size: 0.64rem;
  padding: 4px 10px;
  background: var(--bg-active);
}

.step-output table td {
  padding: 4px 10px;
  font-size: 0.71rem;
}

.step-output pre {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  color: var(--text-secondary);
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
  line-height: 1.5;
}

/* ── Nested Audit (plan → steps → details) ─────────── */
.audit-plan-group {
  border-bottom: 1px solid var(--border);
}

.audit-plan-group:last-child {
  border-bottom: none;
}

.audit-plan-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  cursor: pointer;
  user-select: none;
  transition: background 0.12s;
}

.audit-plan-header:hover {
  background: var(--bg-hover);
}

.audit-plan-chevron {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  color: var(--text-tertiary);
  transition: transform 0.2s ease;
}

.audit-plan-group.open > .audit-plan-header .audit-plan-chevron {
  transform: rotate(90deg);
}

.audit-plan-goal {
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--text-primary);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.audit-plan-summary {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.audit-plan-stat {
  font-size: 0.60rem;
  font-weight: 500;
  padding: 1px 5px;
  border-radius: 3px;
  font-family: var(--font-mono);
}

.audit-plan-stat.count { background: rgba(255,255,255,0.06); color: var(--text-secondary); }
.audit-plan-stat.ok { background: var(--green-muted); color: var(--green); }
.audit-plan-stat.fail { background: var(--red-muted); color: var(--red); }

.audit-plan-result {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.audit-plan-result.success { background: var(--teal); }
.audit-plan-result.failed { background: var(--red); }
.audit-plan-result.mixed { background: var(--amber); }

.audit-plan-steps {
  display: none;
  padding-left: 8px;
}

.audit-plan-group.open > .audit-plan-steps {
  display: block;
}

.empty-state {
  text-align: center;
  padding: 40px 24px;
  color: var(--text-tertiary);
  font-size: 0.78rem;
}

.empty-state .icon {
  font-size: 1.5rem;
  margin-bottom: 8px;
  opacity: 0.3;
}

/* ── VM Table ────────────────────────────────────────── */
.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.78rem;
}

thead th {
  text-align: left;
  padding: 8px 16px;
  font-weight: 500;
  color: var(--text-tertiary);
  font-size: 0.71rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid var(--border);
  background: var(--bg-card);
  position: sticky;
  top: 0;
}

tbody td {
  padding: 10px 16px;
  border-bottom: 1px solid var(--border-subtle);
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}

tbody tr:hover {
  background: var(--bg-hover);
}

tbody tr:last-child td {
  border-bottom: none;
}

.status-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 1px 8px;
  border-radius: 3px;
  font-size: 0.71rem;
  font-weight: 500;
}

.status-tag.running { background: var(--teal-muted); color: var(--teal); }
.status-tag.stopped { background: var(--red-muted); color: var(--red); }
.status-tag.paused { background: var(--amber-muted); color: var(--amber); }

.resource-bar {
  width: 60px;
  height: 4px;
  background: var(--bg-active);
  border-radius: 2px;
  overflow: hidden;
  display: inline-block;
  vertical-align: middle;
  margin-left: 6px;
}

.resource-bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s;
}

.resource-bar-fill.low { background: var(--teal); }
.resource-bar-fill.medium { background: var(--amber); }
.resource-bar-fill.high { background: var(--red); }

/* ── Event Log (right column) ────────────────────────── */
.event-log {
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.event-item {
  padding: 10px 16px;
  border-bottom: 1px solid var(--border-subtle);
  font-size: 0.75rem;
  line-height: 1.5;
  animation: fadeIn 0.2s ease-out;
  transition: background 0.12s;
}

.event-item:hover {
  background: var(--bg-hover);
}

.event-item-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.event-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  flex-shrink: 0;
  margin-top: 1px;
}

.event-icon.plan { background: var(--purple-muted); color: var(--purple); }
.event-icon.step { background: var(--blue-muted); color: var(--blue); }
.event-icon.ok { background: var(--teal-muted); color: var(--teal); }
.event-icon.err { background: var(--red-muted); color: var(--red); }
.event-icon.warn { background: var(--amber-muted); color: var(--amber); }
.event-icon.info { background: rgba(255,255,255,0.06); color: var(--text-secondary); }

.event-body {
  flex: 1;
  min-width: 0;
}

.event-title {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 1px;
}

.event-title .event-action {
  font-family: var(--font-mono);
  font-size: 0.71rem;
  color: var(--blue);
  font-weight: 400;
}

.event-detail {
  font-size: 0.71rem;
  color: var(--text-tertiary);
  line-height: 1.4;
}

.event-detail.error-detail {
  color: var(--red);
  margin-top: 3px;
  padding: 4px 8px;
  background: var(--red-muted);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: 0.68rem;
}

.event-ts {
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: 0.64rem;
  white-space: nowrap;
  flex-shrink: 0;
  padding-top: 2px;
}

.event-duration {
  font-family: var(--font-mono);
  font-size: 0.64rem;
  color: var(--text-tertiary);
  margin-left: 4px;
}

.event-badge {
  padding: 0 5px;
  border-radius: 3px;
  font-size: 0.64rem;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  line-height: 1.7;
}

.event-badge.plan { background: var(--purple-muted); color: var(--purple); }
.event-badge.step { background: var(--blue-muted); color: var(--blue); }
.event-badge.ok { background: var(--green-muted); color: var(--green); }
.event-badge.err { background: var(--red-muted); color: var(--red); }
.event-badge.warn { background: var(--amber-muted); color: var(--amber); }
.event-badge.info { background: rgba(255,255,255,0.06); color: var(--text-secondary); }

.event-msg {
  color: var(--text-secondary);
  word-break: break-word;
}

.event-log-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  font-size: 0.78rem;
  flex-direction: column;
  gap: 8px;
}

.event-log-empty .empty-pulse {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-tertiary);
  opacity: 0.3;
  animation: pulse 2s ease-in-out infinite;
}

/* Event groups (collapsible per plan) */
.event-group {
  border-bottom: 1px solid var(--border);
}

.event-group-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  cursor: pointer;
  user-select: none;
  background: var(--bg-elevated);
  transition: background 0.12s;
  border-bottom: 1px solid var(--border-subtle);
}

.event-group-header:hover {
  background: var(--bg-hover);
}

.event-group-chevron {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  color: var(--text-tertiary);
  transition: transform 0.2s ease;
}

.event-group.collapsed .event-group-chevron {
  transform: rotate(-90deg);
}

.event-group.collapsed .event-group-items {
  display: none;
}

.event-group-goal {
  font-size: 0.71rem;
  font-weight: 500;
  color: var(--text-primary);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.event-group-summary {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.event-group-stat {
  font-size: 0.60rem;
  font-weight: 500;
  padding: 1px 5px;
  border-radius: 3px;
  font-family: var(--font-mono);
}

.event-group-stat.steps { background: var(--blue-muted); color: var(--blue); }
.event-group-stat.ok { background: var(--green-muted); color: var(--green); }
.event-group-stat.fail { background: var(--red-muted); color: var(--red); }

.event-group-result {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.event-group-result.success { background: var(--teal); }
.event-group-result.failed { background: var(--red); }
.event-group-result.running { background: var(--blue); animation: pulse 1.5s ease-in-out infinite; }

.event-group-items {
  /* shown by default, hidden when .collapsed */
}

/* ── Nodes Grid ──────────────────────────────────────── */
.nodes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.node-card {
  padding: 14px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: var(--bg-card);
}

.node-name {
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.node-name .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.node-name .dot.online { background: var(--teal); }
.node-name .dot.offline { background: var(--red); }

.node-stat {
  display: flex;
  justify-content: space-between;
  font-size: 0.71rem;
  color: var(--text-tertiary);
  margin-bottom: 4px;
}

.node-stat span:last-child {
  font-family: var(--font-mono);
  color: var(--text-secondary);
}

/* ── Governance / Audit ──────────────────────────────── */
.gov-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
}

.gov-item {
  padding: 14px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: var(--bg-card);
}

.gov-label {
  font-size: 0.71rem;
  color: var(--text-tertiary);
  margin-bottom: 4px;
}

.gov-value {
  font-size: 1.1rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.gov-value.ok { color: var(--teal); }
.gov-value.warn { color: var(--amber); }
.gov-value.danger { color: var(--red); }
.gov-value.neutral { color: var(--text-primary); }

/* ── Audit Accordion ────────────────────────────────── */
.audit-list {
  max-height: 500px;
  overflow-y: auto;
}

.audit-row {
  border-bottom: 1px solid var(--border-subtle);
}

.audit-row:last-child {
  border-bottom: none;
}

.audit-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  cursor: pointer;
  user-select: none;
  transition: background 0.12s;
}

.audit-header:hover {
  background: var(--bg-hover);
}

.audit-chevron {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: var(--text-tertiary);
  transition: transform 0.2s ease;
}

.audit-row.open .audit-chevron {
  transform: rotate(90deg);
}

.audit-header .audit-time {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  color: var(--text-tertiary);
  white-space: nowrap;
  flex-shrink: 0;
  min-width: 64px;
}

.audit-header .audit-action {
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--text-primary);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.audit-header .audit-tier {
  font-size: 0.64rem;
  font-weight: 500;
  padding: 1px 6px;
  border-radius: 3px;
  flex-shrink: 0;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.audit-tier.read { background: var(--blue-muted); color: var(--blue); }
.audit-tier.safe_write { background: var(--teal-muted); color: var(--teal); }
.audit-tier.risky_write { background: var(--amber-muted); color: var(--amber); }
.audit-tier.destructive { background: var(--red-muted); color: var(--red); }

.audit-header .audit-result-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.audit-result-dot.success { background: var(--teal); }
.audit-result-dot.failed { background: var(--red); }
.audit-result-dot.blocked { background: var(--amber); }
.audit-result-dot.rolled_back { background: var(--purple); }

.audit-detail {
  display: none;
  padding: 0 16px 14px 42px;
  animation: fadeIn 0.15s ease-out;
}

.audit-row.open .audit-detail {
  display: block;
}

.audit-detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 20px;
  margin-bottom: 10px;
}

.audit-detail-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.audit-detail-item .label {
  font-size: 0.64rem;
  font-weight: 500;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.audit-detail-item .value {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-family: var(--font-mono);
  word-break: break-all;
}

.audit-detail-item .value.ok { color: var(--green); }
.audit-detail-item .value.err { color: var(--red); }
.audit-detail-item .value.warn { color: var(--amber); }

.audit-reasoning {
  font-size: 0.75rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 10px;
  padding: 8px 12px;
  background: var(--bg-elevated);
  border-radius: var(--radius-sm);
  border-left: 2px solid var(--border-focus);
}

.audit-params {
  font-size: 0.71rem;
  font-family: var(--font-mono);
  color: var(--text-tertiary);
  padding: 8px 12px;
  background: var(--bg-elevated);
  border-radius: var(--radius-sm);
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 120px;
  overflow-y: auto;
}

.audit-error {
  font-size: 0.75rem;
  color: var(--red);
  padding: 8px 12px;
  background: var(--red-muted);
  border-radius: var(--radius-sm);
  margin-top: 8px;
}

.audit-approval {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.71rem;
  padding: 2px 8px;
  border-radius: 3px;
}

/* ── Tab Bar ─────────────────────────────────────────── */
.tabs {
  display: flex;
  border-bottom: 1px solid var(--border);
  padding: 0 24px;
  gap: 0;
}

.tab {
  padding: 10px 16px;
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--text-tertiary);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: color 0.15s, border-color 0.15s;
  user-select: none;
}

.tab:hover { color: var(--text-secondary); }
.tab.active { color: var(--text-primary); border-bottom-color: var(--text-primary); }

.tab-panel { display: none; }
.tab-panel.active { display: block; }

/* ── Loading ─────────────────────────────────────────── */
.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid var(--border);
  border-top-color: var(--text-secondary);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  display: inline-block;
}

.loading-bar {
  height: 2px;
  background: var(--bg-active);
  position: relative;
  overflow: hidden;
}

.loading-bar::after {
  content: '';
  position: absolute;
  left: -40%;
  width: 40%;
  height: 100%;
  background: var(--teal);
  animation: loading 1s ease-in-out infinite;
}

@keyframes loading {
  0% { left: -40%; }
  100% { left: 100%; }
}
</style>
</head>
<body>

<!-- ── Header ──────────────────────────────────────── -->
<header class="header">
  <div class="logo">
    <svg width="24" height="24" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="72" height="72" rx="18" fill="#0ACDAA"/>
      <line x1="17" y1="17" x2="26" y2="17" stroke="white" stroke-width="4" stroke-linecap="round"/>
      <line x1="17" y1="17" x2="17" y2="55" stroke="white" stroke-width="4" stroke-linecap="round"/>
      <line x1="17" y1="55" x2="26" y2="55" stroke="white" stroke-width="4" stroke-linecap="round"/>
      <line x1="55" y1="17" x2="46" y2="17" stroke="white" stroke-width="4" stroke-linecap="round"/>
      <line x1="55" y1="17" x2="55" y2="55" stroke="white" stroke-width="4" stroke-linecap="round"/>
      <line x1="55" y1="55" x2="46" y2="55" stroke="white" stroke-width="4" stroke-linecap="round"/>
      <line x1="26" y1="29" x2="46" y2="29" stroke="white" stroke-width="3.5" stroke-linecap="round"/>
      <line x1="26" y1="36" x2="46" y2="36" stroke="white" stroke-width="3.5" stroke-linecap="round"/>
      <line x1="26" y1="43" x2="46" y2="43" stroke="white" stroke-width="3.5" stroke-linecap="round"/>
    </svg>
    infra<span class="brand-accent">wrap</span>
  </div>
  <div class="header-right">
    <div class="conn-status">
      <span class="conn-dot" id="connDot"></span>
      <span id="connLabel">Connecting...</span>
    </div>
    <span class="mode-pill watch" id="modePill">WATCH</span>
  </div>
</header>

<!-- ── Stats Row ───────────────────────────────────── -->
<div class="stat-row" id="statRow">
  <div class="stat-cell">
    <div class="stat-label">Nodes</div>
    <div class="stat-value" id="statNodes">-</div>
  </div>
  <div class="stat-cell">
    <div class="stat-label">VMs</div>
    <div class="stat-value" id="statVMs">-</div>
  </div>
  <div class="stat-cell">
    <div class="stat-label">Containers</div>
    <div class="stat-value" id="statCTs">-</div>
  </div>
  <div class="stat-cell">
    <div class="stat-label">Running</div>
    <div class="stat-value" id="statRunning">-</div>
  </div>
  <div class="stat-cell">
    <div class="stat-label">Avg CPU</div>
    <div class="stat-value" id="statCPU">-<span class="unit">%</span></div>
  </div>
  <div class="stat-cell">
    <div class="stat-label">Avg RAM</div>
    <div class="stat-value" id="statRAM">-<span class="unit">%</span></div>
  </div>
</div>

<!-- ── Main Content ────────────────────────────────── -->
<div class="main">
  <!-- Left Column -->
  <div class="col-left">
    <!-- Tabs -->
    <div class="tabs">
      <div class="tab active" data-tab="plan">Active Plan</div>
      <div class="tab" data-tab="resources">Resources</div>
      <div class="tab" data-tab="nodes">Nodes</div>
      <div class="tab" data-tab="governance">Governance</div>
    </div>

    <!-- Tab: Active Plan -->
    <div class="tab-panel active" id="tab-plan">
      <div class="card">
        <div id="planContent">
          <div class="empty-state">
            <div class="icon">&#9675;</div>
            <div>No active plan. The agent is idle.</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab: Resources (VMs + Containers) -->
    <div class="tab-panel" id="tab-resources">
      <div class="card">
        <div class="card-head">
          <span class="card-title">Virtual Machines</span>
          <span class="card-badge" id="vmCount" style="background:var(--blue-muted);color:var(--blue)">0</span>
        </div>
        <div class="card-body flush">
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Node</th>
                  <th>CPU</th>
                  <th>RAM</th>
                </tr>
              </thead>
              <tbody id="vmTable">
                <tr><td colspan="6" style="text-align:center;color:var(--text-tertiary);padding:24px">Loading...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-head">
          <span class="card-title">Containers</span>
          <span class="card-badge" id="ctCount" style="background:var(--purple-muted);color:var(--purple)">0</span>
        </div>
        <div class="card-body flush">
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Node</th>
                  <th>CPU</th>
                  <th>RAM</th>
                </tr>
              </thead>
              <tbody id="ctTable">
                <tr><td colspan="6" style="text-align:center;color:var(--text-tertiary);padding:24px">Loading...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab: Nodes -->
    <div class="tab-panel" id="tab-nodes">
      <div class="card">
        <div class="card-body">
          <div class="nodes-grid" id="nodesGrid">
            <div style="color:var(--text-tertiary);font-size:0.78rem">Loading node data...</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab: Governance -->
    <div class="tab-panel" id="tab-governance">
      <div class="card">
        <div class="card-head">
          <span class="card-title">Governance &amp; Safety</span>
        </div>
        <div class="card-body">
          <div class="gov-grid" id="govGrid">
            <div class="gov-item">
              <div class="gov-label">Circuit Breaker</div>
              <div class="gov-value ok" id="govCircuit">Closed</div>
            </div>
            <div class="gov-item">
              <div class="gov-label">Total Actions</div>
              <div class="gov-value neutral" id="govTotal">0</div>
            </div>
            <div class="gov-item">
              <div class="gov-label">Failures</div>
              <div class="gov-value neutral" id="govFail">0</div>
            </div>
            <div class="gov-item">
              <div class="gov-label">Approvals Pending</div>
              <div class="gov-value neutral" id="govPending">0</div>
            </div>
            <div class="gov-item">
              <div class="gov-label">Replans</div>
              <div class="gov-value neutral" id="govReplans">0</div>
            </div>
            <div class="gov-item">
              <div class="gov-label">Uptime</div>
              <div class="gov-value neutral" id="govUptime">-</div>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-head">
          <span class="card-title">Audit Trail</span>
          <span class="card-badge" id="auditCount" style="background:rgba(255,255,255,0.06);color:var(--text-secondary)">0</span>
        </div>
        <div class="card-body flush">
          <div class="audit-list" id="auditList">
            <div style="text-align:center;color:var(--text-tertiary);padding:24px;font-size:0.78rem">No audit entries</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Right Column: Event Stream -->
  <div class="col-right">
    <div class="card" style="border-bottom:none;height:100%;display:flex;flex-direction:column">
      <div class="card-head">
        <span class="card-title">Event Stream</span>
        <span class="card-badge" id="eventCount" style="background:rgba(255,255,255,0.06);color:var(--text-secondary)">0</span>
      </div>
      <div class="event-log" id="eventLog">
        <div class="event-log-empty" id="eventEmpty"><div class="empty-pulse"></div>Waiting for events...</div>
      </div>
    </div>
  </div>
</div>

<script>
// ── State ──────────────────────────────────────────────
const state = {
  connected: false,
  mode: 'watch',
  events: [],
  plan: null,        // current plan data (goal, reasoning, steps, etc.)
  planSteps: {},     // step_id -> { status, duration_ms, error }
  planCompleted: 0,  // count of completed steps
  planFailed: 0,     // count of failed steps
  planGoals: {},     // plan_id -> goal text (for audit grouping)
  cluster: null,
  startTime: Date.now(),
  replans: 0,
  failures: 0,
  totalActions: 0,
  currentPlanId: null,
};

// ── SSE Connection ─────────────────────────────────────
let evtSource = null;
let reconnectTimer = null;

function connect() {
  if (evtSource) { try { evtSource.close(); } catch {} }

  evtSource = new EventSource('/api/agent/events');

  evtSource.addEventListener('connected', (e) => {
    state.connected = true;
    updateConnStatus();
  });

  evtSource.addEventListener('plan_created', (e) => handleEvent(JSON.parse(e.data)));
  evtSource.addEventListener('plan_approved', (e) => handleEvent(JSON.parse(e.data)));
  evtSource.addEventListener('step_started', (e) => handleEvent(JSON.parse(e.data)));
  evtSource.addEventListener('step_completed', (e) => handleEvent(JSON.parse(e.data)));
  evtSource.addEventListener('step_failed', (e) => handleEvent(JSON.parse(e.data)));
  evtSource.addEventListener('replan', (e) => handleEvent(JSON.parse(e.data)));
  evtSource.addEventListener('approval_requested', (e) => handleEvent(JSON.parse(e.data)));
  evtSource.addEventListener('circuit_breaker_tripped', (e) => handleEvent(JSON.parse(e.data)));
  evtSource.addEventListener('investigation_started', (e) => handleEvent(JSON.parse(e.data)));
  evtSource.addEventListener('investigation_complete', (e) => handleEvent(JSON.parse(e.data)));

  evtSource.onerror = () => {
    state.connected = false;
    updateConnStatus();
    if (reconnectTimer) clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(connect, 3000);
  };
}

function handleEvent(event) {
  state.events.push(event);
  state.totalActions++;
  const d = event.data || {};

  switch (event.type) {
    case 'plan_created':
    case 'replan':
      state.plan = d;
      state.currentPlanId = d.plan_id || d.new_plan_id;
      state.planSteps = {};
      state.planCompleted = 0;
      state.planFailed = 0;
      if (d.goal) state.planGoals[d.plan_id || d.new_plan_id] = d.goal;
      if (d.steps) {
        d.steps.forEach(s => { state.planSteps[s.id] = { status: 'pending' }; });
      }
      if (event.type === 'replan') state.replans++;
      if (d.mode) { state.mode = d.mode; updateMode(); }
      break;

    case 'step_started':
      if (state.planSteps[d.step_id]) {
        state.planSteps[d.step_id].status = 'running';
      } else {
        state.planSteps[d.step_id] = { status: 'running' };
      }
      break;

    case 'step_completed':
      if (state.planSteps[d.step_id]) {
        state.planSteps[d.step_id].status = 'success';
        state.planSteps[d.step_id].duration_ms = d.duration_ms;
        if (d.output !== undefined) state.planSteps[d.step_id].output = d.output;
      }
      state.planCompleted++;
      break;

    case 'step_failed':
      if (state.planSteps[d.step_id]) {
        state.planSteps[d.step_id].status = 'failed';
        state.planSteps[d.step_id].error = d.error;
        state.planSteps[d.step_id].duration_ms = d.duration_ms;
      }
      state.planFailed++;
      state.failures++;
      break;

    case 'circuit_breaker_tripped':
      // Mark remaining pending steps as skipped
      Object.values(state.planSteps).forEach(s => {
        if (s.status === 'pending') s.status = 'skipped';
      });
      break;
  }

  renderEvent(event);
  renderPlan();
  updateGov();

  const el = document.getElementById('eventCount');
  if (el) el.textContent = state.events.length;
}

// ── Rendering ──────────────────────────────────────────

function updateConnStatus() {
  const dot = document.getElementById('connDot');
  const label = document.getElementById('connLabel');
  if (state.connected) {
    dot.className = 'conn-dot live';
    label.textContent = 'Live';
  } else {
    dot.className = 'conn-dot dead';
    label.textContent = 'Reconnecting...';
  }
}

function updateMode() {
  const pill = document.getElementById('modePill');
  pill.textContent = state.mode.toUpperCase();
  pill.className = 'mode-pill ' + state.mode;
}

// Track current event group
let currentGroupId = null;
let currentGroupEl = null;
let eventGroups = {}; // planId -> { el, goal, steps, completed, failed, total }

function ensureEventGroup(planId, goal, stepCount) {
  const log = document.getElementById('eventLog');
  const empty = document.getElementById('eventEmpty');
  if (empty) empty.remove();

  if (eventGroups[planId]) {
    currentGroupId = planId;
    currentGroupEl = eventGroups[planId].el;
    return;
  }

  const group = document.createElement('div');
  group.className = 'event-group';
  group.id = 'evg-' + planId;

  const chevron = '<svg class="event-group-chevron" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 4l4 4-4 4"/></svg>';

  const header = document.createElement('div');
  header.className = 'event-group-header';
  header.innerHTML =
    chevron +
    '<span class="event-group-goal">' + escapeHtml(goal || 'Plan ' + (planId || '').slice(0, 8)) + '</span>' +
    '<div class="event-group-summary" id="evg-sum-' + planId + '">' +
      '<span class="event-group-stat steps">' + (stepCount || '?') + ' steps</span>' +
      '<span class="event-group-result running"></span>' +
    '</div>';
  header.onclick = function() { group.classList.toggle('collapsed'); };

  const items = document.createElement('div');
  items.className = 'event-group-items';

  group.appendChild(header);
  group.appendChild(items);
  log.appendChild(group);

  eventGroups[planId] = { el: group, itemsEl: items, goal: goal, total: stepCount || 0, completed: 0, failed: 0 };
  currentGroupId = planId;
  currentGroupEl = eventGroups[planId].el;
}

function updateGroupSummary(planId) {
  const g = eventGroups[planId];
  if (!g) return;

  const total = g.total;
  const done = g.completed;
  const fail = g.failed;
  const isComplete = total > 0 && (done + fail) >= total;
  const allSuccess = isComplete && fail === 0;

  let resultClass = 'running';
  if (isComplete) resultClass = allSuccess ? 'success' : 'failed';

  let html = '<span class="event-group-stat steps">' + total + ' steps</span>';
  if (done > 0) html += '<span class="event-group-stat ok">' + done + ' ok</span>';
  if (fail > 0) html += '<span class="event-group-stat fail">' + fail + ' err</span>';
  html += '<span class="event-group-result ' + resultClass + '"></span>';

  const sumEl = document.getElementById('evg-sum-' + planId);
  if (sumEl) sumEl.innerHTML = html;

  // Collapse when done
  if (isComplete) {
    g.el.classList.add('collapsed');
  }
}

function renderEvent(event) {
  const d = event.data || {};
  const ts = new Date(event.timestamp).toLocaleTimeString('en-US', { hour12: false });
  const ev = formatEvent(event);

  // Determine which group this belongs to
  if (event.type === 'plan_created') {
    ensureEventGroup(d.plan_id, d.goal, d.step_count);
  } else if (event.type === 'replan') {
    // Collapse old group, start new one
    if (eventGroups[d.old_plan_id]) {
      eventGroups[d.old_plan_id].el.classList.add('collapsed');
    }
    ensureEventGroup(d.new_plan_id, eventGroups[d.old_plan_id]?.goal || d.goal, d.step_count);
  }

  // Track step completion in group
  const groupPlanId = currentGroupId;
  if (groupPlanId && eventGroups[groupPlanId]) {
    if (event.type === 'step_completed') {
      eventGroups[groupPlanId].completed++;
      updateGroupSummary(groupPlanId);
    } else if (event.type === 'step_failed') {
      eventGroups[groupPlanId].failed++;
      updateGroupSummary(groupPlanId);
    } else if (event.type === 'replan' && eventGroups[d.new_plan_id]) {
      eventGroups[d.new_plan_id].total = d.step_count || 0;
      updateGroupSummary(d.new_plan_id);
    }
  }

  // Build event item
  const item = document.createElement('div');
  item.className = 'event-item';

  let detailHtml = '';
  if (ev.detail) {
    detailHtml = '<div class="event-detail' + (ev.isError ? ' error-detail' : '') + '">' + escapeHtml(ev.detail) + '</div>';
  }

  let durationHtml = '';
  if (d.duration_ms !== undefined) {
    durationHtml = '<span class="event-duration">' + d.duration_ms + 'ms</span>';
  }

  item.innerHTML =
    '<div class="event-item-row">' +
      '<div class="event-icon ' + ev.iconClass + '">' + ev.icon + '</div>' +
      '<div class="event-body">' +
        '<div class="event-title">' + ev.title + durationHtml + '</div>' +
        detailHtml +
      '</div>' +
      '<span class="event-ts">' + ts + '</span>' +
    '</div>';

  // Append to group or directly to log
  if (groupPlanId && eventGroups[groupPlanId]) {
    eventGroups[groupPlanId].itemsEl.appendChild(item);
  } else {
    const log = document.getElementById('eventLog');
    const empty = document.getElementById('eventEmpty');
    if (empty) empty.remove();
    log.appendChild(item);
  }

  // Scroll to bottom
  const log = document.getElementById('eventLog');
  log.scrollTop = log.scrollHeight;
}

function formatEvent(event) {
  const d = event.data || {};
  switch (event.type) {
    case 'plan_created':
      return {
        iconClass: 'plan', icon: '&#9656;',
        title: 'Plan created <span class="event-action">' + (d.step_count || 0) + ' steps</span>',
        detail: d.goal || null,
      };
    case 'plan_approved':
      return {
        iconClass: 'ok', icon: '&#10003;',
        title: 'Plan approved',
      };
    case 'step_started':
      return {
        iconClass: 'step', icon: '&#9654;',
        title: 'Executing <span class="event-action">' + escapeHtml(d.action || '') + '</span>',
        detail: d.description || null,
      };
    case 'step_completed':
      return {
        iconClass: 'ok', icon: '&#10003;',
        title: 'Completed <span class="event-action">' + escapeHtml(d.action || '') + '</span>',
      };
    case 'step_failed':
      return {
        iconClass: 'err', icon: '&#10007;',
        title: 'Failed <span class="event-action">' + escapeHtml(d.action || '') + '</span>',
        detail: d.error ? (d.error.length > 150 ? d.error.slice(0, 150) + '...' : d.error) : null,
        isError: true,
      };
    case 'replan':
      return {
        iconClass: 'warn', icon: '&#8635;',
        title: 'Replanning <span class="event-action">' + (d.step_count || '?') + ' new steps</span>',
        detail: d.reasoning ? d.reasoning.slice(0, 120) : null,
      };
    case 'approval_requested':
      return {
        iconClass: 'warn', icon: '&#9888;',
        title: d.action ? 'Approval required for <span class="event-action">' + escapeHtml(d.action) + '</span>' : 'Approval required',
        detail: d.tier ? 'Tier: ' + d.tier + (d.mode ? ' | Mode: ' + d.mode : '') : null,
      };
    case 'circuit_breaker_tripped':
      return {
        iconClass: 'err', icon: '&#9889;',
        title: 'Circuit breaker tripped',
        detail: 'Execution halted — too many consecutive failures',
        isError: true,
      };
    case 'investigation_started':
      return {
        iconClass: 'info', icon: '&#128269;',
        title: 'Investigation started',
        detail: d.trigger || null,
      };
    case 'investigation_complete':
      return {
        iconClass: 'ok', icon: '&#128270;',
        title: 'Investigation complete <span class="event-action">' + (d.findings_count || 0) + ' findings</span>',
        detail: d.root_cause ? 'Root cause: ' + d.root_cause.slice(0, 120) : null,
      };
    default:
      return {
        iconClass: 'info', icon: '&#8226;',
        title: event.type.replace(/_/g, ' '),
        detail: JSON.stringify(d).slice(0, 120),
      };
  }
}

function renderPlan() {
  const el = document.getElementById('planContent');
  if (!state.plan) {
    el.innerHTML = '<div class="empty-state"><div class="icon">&#9675;</div><div>No active plan. The agent is idle.</div></div>';
    return;
  }

  const p = state.plan;
  const steps = p.steps || [];
  const total = steps.length || p.step_count || 0;
  const done = state.planCompleted;
  const failed = state.planFailed;
  const progressPct = total > 0 ? Math.round(((done + failed) / total) * 100) : 0;
  const isComplete = total > 0 && (done + failed) >= total;
  const allSuccess = isComplete && failed === 0;

  // Mode icon
  const modeIcons = { build: '&#9881;', watch: '&#9673;', investigate: '&#128269;', heal: '&#9889;' };
  const mode = p.mode || state.mode || 'build';
  const modeIcon = modeIcons[mode] || '&#9881;';

  let html = '';

  // Completion banner
  if (isComplete) {
    if (allSuccess) {
      html += '<div class="plan-complete-banner success">&#10003; Plan completed successfully &mdash; ' + done + '/' + total + ' steps</div>';
    } else {
      html += '<div class="plan-complete-banner partial">&#9888; Plan finished with ' + failed + ' failure' + (failed > 1 ? 's' : '') + ' &mdash; ' + done + ' succeeded, ' + failed + ' failed</div>';
    }
  }

  // Replan indicator
  if (state.replans > 0) {
    html += '<div class="plan-replan-banner"><span class="replan-icon">&#8635;</span> Replanned ' + state.replans + ' time' + (state.replans > 1 ? 's' : '') + '</div>';
  }

  // Header
  html += '<div class="plan-header">';
  html += '<div class="plan-goal-row">';
  html += '<div class="plan-mode-icon ' + mode + '">' + modeIcon + '</div>';
  html += '<div class="plan-goal-text">';
  html += '<div class="plan-goal">' + escapeHtml(p.goal || 'Unnamed goal') + '</div>';
  if (p.reasoning) {
    html += '<div class="plan-reasoning">' + escapeHtml(p.reasoning) + '</div>';
  }
  html += '</div>';
  html += '</div>';

  // Meta row with progress
  html += '<div class="plan-meta">';
  html += '<span class="plan-meta-item"><span class="meta-dot" style="background:var(--blue)"></span> ' + total + ' steps</span>';
  html += '<span class="plan-meta-item"><span class="meta-dot" style="background:var(--green)"></span> ' + done + ' done</span>';
  if (failed > 0) {
    html += '<span class="plan-meta-item"><span class="meta-dot" style="background:var(--red)"></span> ' + failed + ' failed</span>';
  }
  html += '<div class="plan-progress-bar"><div class="plan-progress-fill' + (failed > 0 ? ' has-failures' : '') + '" style="width:' + progressPct + '%"></div></div>';
  html += '<span style="font-family:var(--font-mono);font-size:0.68rem">' + progressPct + '%</span>';
  html += '</div>';
  html += '</div>';

  // Pipeline steps
  if (steps.length > 0) {
    html += '<div class="pipeline">';
    steps.forEach((step, i) => {
      const stepState = state.planSteps[step.id] || { status: 'pending' };
      const status = stepState.status;
      const tierClass = (step.tier || 'read').replace(' ', '_');

      // Step number icon
      let numContent = '' + (i + 1);
      if (status === 'success') numContent = '&#10003;';
      if (status === 'failed') numContent = '&#10007;';
      if (status === 'running') numContent = '<span class="spinner" style="width:12px;height:12px;border-width:1.5px"></span>';

      html += '<div class="pipe-step ' + status + '">';
      html += '<div class="pipe-step-gutter">';
      html += '<div class="pipe-step-number">' + numContent + '</div>';
      html += '<div class="pipe-step-line"></div>';
      html += '</div>';
      html += '<div class="pipe-step-content">';
      html += '<div class="pipe-step-action">' + escapeHtml(step.action || 'Unknown') + '</div>';
      if (step.description) {
        html += '<div class="pipe-step-desc">' + escapeHtml(step.description) + '</div>';
      }
      html += '<div class="pipe-step-meta">';
      html += '<span class="pipe-step-tier ' + tierClass + '">' + escapeHtml(step.tier || 'read') + '</span>';
      if (stepState.duration_ms !== undefined) {
        html += '<span class="pipe-step-duration">' + stepState.duration_ms + 'ms</span>';
      }
      html += '</div>';
      if (stepState.error) {
        html += '<div class="pipe-step-error">' + escapeHtml(stepState.error.length > 200 ? stepState.error.slice(0, 200) + '...' : stepState.error) + '</div>';
      }
      if (stepState.output !== undefined && stepState.status === 'success') {
        const outId = 'step-out-' + step.id.replace(/[^a-zA-Z0-9]/g, '');
        const chevSvg = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 4l4 4-4 4"/></svg>';
        html += '<button class="step-output-toggle" onclick="toggleStepOutput(this, \\'' + outId + '\\')">' + chevSvg + ' View output</button>';
        html += '<div class="step-output" id="' + outId + '" style="display:none">' + formatStepOutput(stepState.output) + '</div>';
      }
      html += '</div>';
      html += '</div>';
    });
    html += '</div>';
  }

  el.innerHTML = html;
}

function renderCluster(data) {
  if (!data) return;
  state.cluster = data;

  // Stats
  const vms = data.vms || [];
  const cts = data.containers || [];
  const nodes = data.nodes || [];
  const running = vms.filter(v => v.status === 'running').length + cts.filter(c => c.status === 'running').length;

  setText('statNodes', nodes.length);
  setText('statVMs', vms.length);
  setText('statCTs', cts.length);
  setText('statRunning', running);

  // CPU / RAM averages (fields: cpu_usage_pct, ram_total_mb, ram_used_mb)
  if (nodes.length > 0) {
    const avgCpu = nodes.reduce((s, n) => s + (n.cpu_usage_pct || 0), 0) / nodes.length;
    const avgRam = nodes.reduce((s, n) => {
      if (n.ram_total_mb && n.ram_used_mb) return s + (n.ram_used_mb / n.ram_total_mb * 100);
      return s;
    }, 0) / nodes.length;
    document.getElementById('statCPU').innerHTML = avgCpu.toFixed(1) + '<span class="unit">%</span>';
    document.getElementById('statRAM').innerHTML = avgRam.toFixed(1) + '<span class="unit">%</span>';
  }

  // VM table
  setText('vmCount', vms.length);
  const vmTbody = document.getElementById('vmTable');
  if (vms.length === 0) {
    vmTbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-tertiary);padding:24px">No VMs found</td></tr>';
  } else {
    vmTbody.innerHTML = vms.map(vm => {
      const ramMB = vm.ram_mb || 0;
      const cpuCores = vm.cpu_cores || 0;
      const diskGB = vm.disk_gb || 0;
      return '<tr>' +
        '<td style="font-family:var(--font-mono)">' + vm.id + '</td>' +
        '<td style="font-weight:500">' + escapeHtml(vm.name || '-') + '</td>' +
        '<td><span class="status-tag ' + (vm.status || '') + '">' + (vm.status || '-') + '</span></td>' +
        '<td style="color:var(--text-secondary)">' + escapeHtml(vm.node || '-') + '</td>' +
        '<td style="font-family:var(--font-mono)">' + cpuCores + ' cores</td>' +
        '<td style="font-family:var(--font-mono)">' + (ramMB >= 1024 ? (ramMB / 1024).toFixed(1) + ' GB' : ramMB + ' MB') + '</td>' +
        '</tr>';
    }).join('');
  }

  // Container table
  setText('ctCount', cts.length);
  const ctTbody = document.getElementById('ctTable');
  if (cts.length === 0) {
    ctTbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-tertiary);padding:24px">No containers found</td></tr>';
  } else {
    ctTbody.innerHTML = cts.map(ct => {
      const ramMB = ct.ram_mb || 0;
      const cpuCores = ct.cpu_cores || 0;
      return '<tr>' +
        '<td style="font-family:var(--font-mono)">' + ct.id + '</td>' +
        '<td style="font-weight:500">' + escapeHtml(ct.name || '-') + '</td>' +
        '<td><span class="status-tag ' + (ct.status || '') + '">' + (ct.status || '-') + '</span></td>' +
        '<td style="color:var(--text-secondary)">' + escapeHtml(ct.node || '-') + '</td>' +
        '<td style="font-family:var(--font-mono)">' + cpuCores + ' cores</td>' +
        '<td style="font-family:var(--font-mono)">' + (ramMB >= 1024 ? (ramMB / 1024).toFixed(1) + ' GB' : ramMB + ' MB') + '</td>' +
        '</tr>';
    }).join('');
  }

  // Nodes grid
  const grid = document.getElementById('nodesGrid');
  if (nodes.length === 0) {
    grid.innerHTML = '<div style="color:var(--text-tertiary);font-size:0.78rem">No nodes found</div>';
  } else {
    grid.innerHTML = nodes.map(n => {
      const online = n.status === 'online';
      const cpu = typeof n.cpu_usage_pct === 'number' ? n.cpu_usage_pct.toFixed(1) + '%' : '-';
      const ramPct = n.ram_total_mb && n.ram_used_mb ? (n.ram_used_mb / n.ram_total_mb * 100).toFixed(1) + '%' : '-';
      const ramGB = n.ram_total_mb ? (n.ram_total_mb / 1024).toFixed(1) + ' GB' : '-';
      return '<div class="node-card">' +
        '<div class="node-name"><span class="dot ' + (online ? 'online' : 'offline') + '"></span>' + escapeHtml(n.name || '-') + '</div>' +
        '<div class="node-stat"><span>CPU</span><span>' + (n.cpu_cores || '-') + ' cores / ' + cpu + '</span></div>' +
        '<div class="node-stat"><span>RAM</span><span>' + ramPct + ' / ' + ramGB + '</span></div>' +
        '<div class="node-stat"><span>Uptime</span><span>' + formatUptime(n.uptime_s) + '</span></div>' +
        '</div>';
    }).join('');
  }
}

function resourceBar(pct) {
  const level = pct > 80 ? 'high' : pct > 50 ? 'medium' : 'low';
  return '<div class="resource-bar"><div class="resource-bar-fill ' + level + '" style="width:' + Math.min(pct, 100) + '%"></div></div>';
}

function updateGov() {
  setText('govTotal', state.totalActions);
  setText('govFail', state.failures);
  setText('govReplans', state.replans);

  const elapsed = Date.now() - state.startTime;
  setText('govUptime', formatDuration(elapsed));
}

// ── Audit ──────────────────────────────────────────────
async function loadAudit() {
  try {
    const [entries, stats] = await Promise.all([
      fetch('/api/audit?limit=100').then(r => r.json()),
      fetch('/api/audit/stats').then(r => r.json()),
    ]);

    const list = document.getElementById('auditList');
    setText('auditCount', Array.isArray(entries) ? entries.length : 0);

    if (stats) {
      if (stats.total !== undefined) setText('govTotal', stats.total);
      if (stats.failed !== undefined) setText('govFail', stats.failed);
    }

    if (!Array.isArray(entries) || entries.length === 0) {
      list.innerHTML = '<div style="text-align:center;color:var(--text-tertiary);padding:24px;font-size:0.78rem">No audit entries yet</div>';
      return;
    }

    // Group entries by plan_id
    const planGroups = [];
    const planMap = {};
    const ungrouped = [];

    entries.forEach(e => {
      if (e.plan_id) {
        if (!planMap[e.plan_id]) {
          planMap[e.plan_id] = { plan_id: e.plan_id, entries: [], firstTime: e.timestamp };
          planGroups.push(planMap[e.plan_id]);
        }
        planMap[e.plan_id].entries.push(e);
      } else {
        ungrouped.push(e);
      }
    });

    let html = '';

    // Render grouped plans
    planGroups.forEach((group, gi) => {
      const entries = group.entries;
      const successCount = entries.filter(e => e.result === 'success').length;
      const failCount = entries.filter(e => e.result === 'failed').length;
      const allSuccess = failCount === 0;
      const resultClass = allSuccess ? 'success' : (successCount === 0 ? 'failed' : 'mixed');

      // Use goal from SSE events, or derive from first entry
      const firstEntry = entries[0];
      const goalLabel = state.planGoals[group.plan_id] || firstEntry.reasoning || firstEntry.action || 'Plan ' + group.plan_id.slice(0, 8);
      const planTime = new Date(group.firstTime).toLocaleTimeString('en-US', { hour12: false });
      const totalDuration = entries.reduce((s, e) => s + (e.duration_ms || 0), 0);

      const chevSvg = '<svg class="audit-plan-chevron" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 4l4 4-4 4"/></svg>';

      html += '<div class="audit-plan-group" data-plan="' + group.plan_id + '">';
      html += '<div class="audit-plan-header" onclick="toggleAuditPlan(this)">';
      html += chevSvg;
      html += '<span style="font-family:var(--font-mono);font-size:0.64rem;color:var(--text-tertiary);flex-shrink:0">' + planTime + '</span>';
      html += '<span class="audit-plan-goal">' + escapeHtml(goalLabel.length > 80 ? goalLabel.slice(0, 77) + '...' : goalLabel) + '</span>';
      html += '<div class="audit-plan-summary">';
      html += '<span class="audit-plan-stat count">' + entries.length + '</span>';
      if (successCount > 0) html += '<span class="audit-plan-stat ok">' + successCount + '</span>';
      if (failCount > 0) html += '<span class="audit-plan-stat fail">' + failCount + '</span>';
      if (totalDuration > 0) html += '<span style="font-family:var(--font-mono);font-size:0.60rem;color:var(--text-tertiary)">' + totalDuration + 'ms</span>';
      html += '<span class="audit-plan-result ' + resultClass + '"></span>';
      html += '</div>';
      html += '</div>';

      // Steps within this plan
      html += '<div class="audit-plan-steps">';
      entries.forEach((e, i) => {
        html += renderAuditEntry(e, gi + '-' + i);
      });
      html += '</div>';
      html += '</div>';
    });

    // Render ungrouped entries (no plan_id)
    ungrouped.forEach((e, i) => {
      html += renderAuditEntry(e, 'u-' + i);
    });

    list.innerHTML = html;
  } catch (err) {
    console.error('Failed to load audit:', err);
  }
}

function renderAuditEntry(e, idx) {
  const time = new Date(e.timestamp).toLocaleTimeString('en-US', { hour12: false });
  const tierClass = (e.tier || 'read').replace(' ', '_');
  const durationStr = e.duration_ms ? e.duration_ms + 'ms' : '-';

  let detailHtml = '<div class="audit-detail-grid">';
  detailHtml += '<div class="audit-detail-item"><span class="label">Result</span><span class="value ' + (e.result === 'success' ? 'ok' : 'err') + '">' + (e.result || '-') + '</span></div>';
  detailHtml += '<div class="audit-detail-item"><span class="label">Duration</span><span class="value">' + durationStr + '</span></div>';
  detailHtml += '<div class="audit-detail-item"><span class="label">Tier</span><span class="value">' + (e.tier || '-') + '</span></div>';

  if (e.approval) {
    const appr = e.approval;
    const icon = appr.approved ? '&#10003;' : '&#10007;';
    const apprColor = appr.approved ? 'background:var(--green-muted);color:var(--green)' : 'background:var(--red-muted);color:var(--red)';
    detailHtml += '<div class="audit-detail-item"><span class="label">Approval</span><span class="audit-approval" style="' + apprColor + '">' + icon + ' ' + (appr.approved ? 'Approved' : 'Denied') + ' via ' + (appr.method || '?') + '</span></div>';
  }
  detailHtml += '</div>';

  if (e.reasoning) {
    detailHtml += '<div class="audit-reasoning">' + escapeHtml(e.reasoning) + '</div>';
  }
  if (e.params && Object.keys(e.params).length > 0) {
    detailHtml += '<div style="margin-bottom:4px"><span style="font-size:0.64rem;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:0.04em">Parameters</span></div>';
    detailHtml += '<div class="audit-params">' + escapeHtml(JSON.stringify(e.params, null, 2)) + '</div>';
  }
  if (e.error) {
    detailHtml += '<div class="audit-error">' + escapeHtml(e.error) + '</div>';
  }

  const chevronSvg = '<svg class="audit-chevron" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 4l4 4-4 4"/></svg>';

  return '<div class="audit-row" data-idx="' + idx + '">' +
    '<div class="audit-header" onclick="toggleAudit(this)">' +
      chevronSvg +
      '<span class="audit-time">' + time + '</span>' +
      '<span class="audit-action">' + escapeHtml(e.action || '-') + '</span>' +
      '<span class="audit-tier ' + tierClass + '">' + (e.tier || '-') + '</span>' +
      '<span class="audit-result-dot ' + (e.result || '') + '"></span>' +
    '</div>' +
    '<div class="audit-detail">' + detailHtml + '</div>' +
  '</div>';
}

function toggleAuditPlan(header) {
  header.parentElement.classList.toggle('open');
}

function toggleAudit(header) {
  header.parentElement.classList.toggle('open');
}

// ── Tabs ───────────────────────────────────────────────
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('tab-' + tab.dataset.tab).classList.add('active');

    // Lazy load audit
    if (tab.dataset.tab === 'governance') loadAudit();
  });
});

// ── Helpers ────────────────────────────────────────────
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = String(val);
}

function escapeHtml(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function toggleStepOutput(btn, id) {
  const el = document.getElementById(id);
  if (!el) return;
  const visible = el.style.display !== 'none';
  el.style.display = visible ? 'none' : 'block';
  btn.classList.toggle('open', !visible);
}

// Fields to hide from output (internal / noisy)
const HIDDEN_FIELDS = new Set(['ssl_fingerprint', 'digest', 'ha', 'serial', 'lock', 'tags', 'pool', 'template', 'agent', 'protection', 'keyboard', 'tablet', 'kvm', 'args', 'vmgenid', 'hookscript', 'hotplug', 'bios']);

// Fields that contain byte values
const BYTE_FIELDS = new Set(['maxdisk', 'maxmem', 'mem', 'disk', 'total', 'used', 'free', 'available', 'avail', 'ram_mb', 'ram_total_mb', 'ram_used_mb', 'disk_gb', 'ballooninfo']);

// Fields that contain seconds
const UPTIME_FIELDS = new Set(['uptime', 'uptime_s']);

function prettyHeader(key) {
  // Special known mappings
  const map = {
    'maxdisk': 'Disk', 'maxmem': 'RAM', 'mem': 'RAM Used', 'vmid': 'VMID',
    'cpu': 'CPU %', 'cpus': 'Cores', 'netin': 'Net In', 'netout': 'Net Out',
    'pid': 'PID', 'id': 'ID', 'name': 'Name', 'status': 'Status', 'node': 'Node',
    'type': 'Type', 'level': 'Level', 'pveversion': 'PVE Version',
    'cpu_cores': 'Cores', 'cpu_usage_pct': 'CPU %', 'ram_mb': 'RAM',
    'ram_total_mb': 'Total RAM', 'ram_used_mb': 'Used RAM', 'disk_gb': 'Disk',
    'uptime_s': 'Uptime', 'uptime': 'Uptime', 'loadavg': 'Load Avg',
    'cpuinfo': 'CPU Info', 'memory': 'Memory', 'swap': 'Swap',
    'current-kernel': 'Kernel', 'ksm': 'KSM', 'rootfs': 'Root FS',
    'content': 'Content', 'storage': 'Storage', 'shared': 'Shared',
    'enabled': 'Enabled', 'active': 'Active', 'total': 'Total',
    'used': 'Used', 'avail': 'Available', 'used_fraction': 'Usage %',
  };
  if (map[key]) return map[key];
  // snake_case / kebab-case → Title Case
  return key.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatBytes(bytes) {
  if (typeof bytes !== 'number' || bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(1024));
  const idx = Math.min(i, units.length - 1);
  return (bytes / Math.pow(1024, idx)).toFixed(idx > 1 ? 1 : 0) + ' ' + units[idx];
}

function formatOutputVal(key, val) {
  if (val === null || val === undefined) return '-';

  const lk = key.toLowerCase();

  // Byte values
  if (BYTE_FIELDS.has(lk) && typeof val === 'number' && val > 1024) {
    return formatBytes(val);
  }

  // Uptime
  if (UPTIME_FIELDS.has(lk) && typeof val === 'number') {
    return formatUptime(val);
  }

  // CPU percentage (0-1 float)
  if (lk === 'cpu' && typeof val === 'number' && val <= 1) {
    return (val * 100).toFixed(1) + '%';
  }

  // Network bytes
  if ((lk === 'netin' || lk === 'netout') && typeof val === 'number') {
    return formatBytes(val);
  }

  // used_fraction as percentage
  if (lk === 'used_fraction' && typeof val === 'number') {
    return (val * 100).toFixed(1) + '%';
  }

  // Nested objects — format nicely
  if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
    const parts = [];
    Object.entries(val).forEach(function(pair) {
      const sv = BYTE_FIELDS.has(pair[0]) && typeof pair[1] === 'number' && pair[1] > 1024
        ? formatBytes(pair[1]) : String(pair[1]);
      parts.push(prettyHeader(pair[0]) + ': ' + sv);
    });
    return parts.join(', ');
  }

  // Arrays
  if (Array.isArray(val)) {
    if (val.length <= 5) return val.join(', ');
    return val.slice(0, 5).join(', ') + ' (+' + (val.length - 5) + ')';
  }

  // Long strings
  const s = String(val);
  if (s.length > 80) return s.slice(0, 77) + '...';
  return s;
}

function formatStepOutput(data) {
  if (data === null || data === undefined) return '<pre>No output</pre>';

  // Arrays of objects → smart table
  if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
    const allKeys = Object.keys(data[0]);
    const cols = allKeys.filter(k => !HIDDEN_FIELDS.has(k.toLowerCase()) && !k.startsWith('_'));
    // Prioritize important columns first
    const priority = ['id', 'vmid', 'name', 'status', 'node', 'type', 'cpu', 'cpus', 'maxmem', 'maxdisk', 'uptime', 'storage', 'total', 'used', 'avail', 'content'];
    const sorted = cols.sort(function(a, b) {
      const ai = priority.indexOf(a.toLowerCase());
      const bi = priority.indexOf(b.toLowerCase());
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return 0;
    }).slice(0, 8);

    let html = '<table><thead><tr>';
    sorted.forEach(k => { html += '<th>' + escapeHtml(prettyHeader(k)) + '</th>'; });
    html += '</tr></thead><tbody>';
    data.slice(0, 50).forEach(row => {
      html += '<tr>';
      sorted.forEach(k => {
        const formatted = formatOutputVal(k, row[k]);
        // Status badge
        if (k.toLowerCase() === 'status') {
          const sc = String(row[k]).toLowerCase();
          html += '<td><span class="status-tag ' + sc + '">' + escapeHtml(formatted) + '</span></td>';
        } else {
          html += '<td>' + escapeHtml(formatted) + '</td>';
        }
      });
      html += '</tr>';
    });
    html += '</tbody></table>';
    if (data.length > 50) html += '<div style="color:var(--text-tertiary);font-size:0.64rem;padding:4px 10px">...and ' + (data.length - 50) + ' more</div>';
    return html;
  }

  // Single object → clean key-value
  if (typeof data === 'object' && !Array.isArray(data)) {
    const keys = Object.keys(data).filter(k => !HIDDEN_FIELDS.has(k.toLowerCase()) && !k.startsWith('_'));
    if (keys.length === 0) return '<pre>Empty result</pre>';
    let html = '<table><tbody>';
    keys.forEach(k => {
      const formatted = formatOutputVal(k, data[k]);
      html += '<tr><td style="color:var(--text-tertiary);font-weight:500;white-space:nowrap;padding-right:16px">' + escapeHtml(prettyHeader(k)) + '</td><td>' + escapeHtml(formatted) + '</td></tr>';
    });
    html += '</tbody></table>';
    return html;
  }

  // Primitive or string
  return '<pre>' + escapeHtml(String(data)) + '</pre>';
}

function formatUptime(seconds) {
  if (!seconds || typeof seconds !== 'number') return '-';
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return d + 'd ' + h + 'h';
  if (h > 0) return h + 'h ' + m + 'm';
  return m + 'm';
}

function formatDuration(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return h + 'h ' + (m % 60) + 'm';
  if (m > 0) return m + 'm ' + (s % 60) + 's';
  return s + 's';
}

// ── Polling ────────────────────────────────────────────
async function pollCluster() {
  try {
    const data = await fetch('/api/cluster').then(r => r.json());
    renderCluster(data);
  } catch {}
}

// ── Init ───────────────────────────────────────────────
connect();
pollCluster();
setInterval(pollCluster, 10000);
setInterval(updateGov, 5000);
</script>
</body>
</html>`;
}
