// src/styles/fisica3Theme.js
// Tema compartilhado dos experimentos de Física 3 — paleta roxo/violeta.
// Cada experimento importa FISICA3_BASE_STYLES e concatena seus próprios
// estilos específicos, evitando duplicar a paleta/estrutura em cada arquivo.

// Constantes físicas compartilhadas de eletrostática.
export const ELETRO = {
  K: 8.99e9,          // N·m²/C² — constante de Coulomb
  EPSILON0: 8.85e-12,  // C²/(N·m²) — permissividade do vácuo
};

// Constantes compartilhadas de relatividade especial.
export const RELATIVIDADE = {
  C: 299792458, // m/s — velocidade da luz no vácuo
};

export const FISICA3_BASE_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Playfair+Display:ital,wght@0,700;1,400&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:       #0B0F19;
  --surface:  rgba(15, 20, 30, 0.85);
  --panel:    rgba(15, 20, 30, 0.85);
  --border:   rgba(168, 85, 247, 0.2);
  --accent:   #A855F7;
  --accent-hover: #C084FC;
  --warm:     #FBBF24;
  --cool:     #38BDF8;
  --positivo: #EF4444;
  --negativo: #38BDF8;
  --danger:   #991B1B;
  --text:     #F3F4F6;
  --muted:    #9CA3AF;
  --mono:     'JetBrains Mono', 'Fira Code', monospace;
  --sans:     'Inter', system-ui, sans-serif;
}

body { background: var(--bg); }

.app {
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  font-family: var(--sans);
  font-size: 14px;
}

.header {
  border-bottom: 1px solid var(--border);
  padding: 20px 32px;
  display: flex;
  align-items: baseline;
  gap: 24px;
  background: linear-gradient(90deg, rgba(168, 85, 247, 0.06) 0%, transparent 40%);
}
.header-title {
  font-family: 'Playfair Display', serif;
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.5px;
}
.header-sub {
  font-size: 13px;
  color: var(--muted);
  letter-spacing: 0.15em;
  text-transform: uppercase;
}
.header-tag {
  margin-left: auto;
  font-size: 12px;
  color: var(--accent);
  border: 1px solid rgba(168, 85, 247, 0.35);
  background: rgba(168, 85, 247, 0.06);
  padding: 4px 12px;
  border-radius: 24px;
  font-family: var(--mono);
}

.tabs {
  display: flex;
  gap: 4px;
  padding: 16px 32px 0;
  border-bottom: 1px solid var(--border);
}
.tab {
  padding: 12px 24px;
  border: none;
  background: transparent;
  color: var(--muted);
  font-family: var(--sans);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: all 0.2s;
}
.tab:hover { color: var(--text); }
.tab.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}

.content {
  display: grid;
  grid-template-columns: 340px 1fr 300px;
  gap: 0;
  height: calc(100vh - 120px);
}

.sidebar-l, .sidebar-r {
  border-right: 1px solid var(--border);
  overflow-y: auto;
  padding: 24px;
  background: var(--panel);
  backdrop-filter: blur(12px);
}
.sidebar-r {
  border-right: none;
  border-left: 1px solid var(--border);
}

.sidebar-l::-webkit-scrollbar,
.sidebar-r::-webkit-scrollbar,
.calc-page::-webkit-scrollbar {
  width: 6px;
}
.sidebar-l::-webkit-scrollbar-track,
.sidebar-r::-webkit-scrollbar-track,
.calc-page::-webkit-scrollbar-track {
  background: rgba(255,255,255,0.05);
}
.sidebar-l::-webkit-scrollbar-thumb,
.sidebar-r::-webkit-scrollbar-thumb,
.calc-page::-webkit-scrollbar-thumb {
  background: var(--accent);
  border-radius: 4px;
}
.sidebar-l, .sidebar-r, .calc-page {
  scrollbar-width: thin;
  scrollbar-color: var(--accent) rgba(255,255,255,0.05);
}

.main-area {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.canvas-wrap {
  flex: 1;
  position: relative;
  background: radial-gradient(ellipse at 50% 50%, #1a1024 0%, #0B0F19 100%);
  overflow: hidden;
}
canvas { display: block; width: 100%; height: 100%; }

.plots-strip {
  height: 180px;
  border-top: 1px solid var(--border);
  display: flex;
  background: var(--panel);
}
.plot-box {
  flex: 1;
  border-right: 1px solid var(--border);
  padding: 12px;
  position: relative;
}
.plot-box:last-child { border-right: none; }
.plot-title {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--muted);
  text-transform: uppercase;
  margin-bottom: 8px;
}
.plot-box canvas { border-radius: 6px; }

.section-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.15em;
  color: var(--muted);
  text-transform: uppercase;
  margin-bottom: 16px;
  margin-top: 24px;
}
.section-label:first-child { margin-top: 0; }

.card {
  background: var(--surface);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: border-color 0.3s ease;
}
.card:hover { border-color: rgba(168, 85, 247, 0.45); }

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 8px 0;
  border-bottom: 1px solid var(--border);
}
.stat-row:last-child { border-bottom: none; }
.stat-label { color: var(--muted); font-size: 13px; }
.stat-val {
  font-family: var(--mono);
  font-size: 14px;
  color: var(--text);
  font-weight: 500;
}
.stat-val.accent   { color: var(--accent); }
.stat-val.warm     { color: var(--warm); }
.stat-val.cool     { color: var(--cool); }
.stat-val.positivo { color: var(--positivo); }
.stat-val.negativo { color: var(--negativo); }
.stat-val.danger   { color: var(--danger); }

.ctrl {
  margin-bottom: 20px;
}
.ctrl-head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
}
.ctrl-name { color: var(--text); font-weight: 500; }
.ctrl-num  { font-family: var(--mono); color: var(--accent); background: rgba(168, 85, 247, 0.12); padding: 2px 8px; border-radius: 4px; }
input[type=range] {
  width: 100%;
  accent-color: var(--accent);
  height: 4px;
  cursor: pointer;
}

.btn-row { display: flex; gap: 12px; margin-top: 16px; }
.btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: var(--sans);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.05em;
  transition: all 0.2s;
}
.btn-primary {
  background: var(--accent);
  color: #fff;
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.35);
}
.btn-primary:hover { filter: brightness(1.15); transform: translateY(-1px); }
.btn-primary:disabled {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.3);
  box-shadow: none;
  cursor: not-allowed;
  transform: none;
}
.btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text);
  border: 1px solid var(--border);
}
.btn-secondary:hover { background: rgba(255, 255, 255, 0.1); }
.btn-danger {
  background: rgba(153, 27, 27, 0.18);
  color: #f87171;
  border: 1px solid rgba(153, 27, 27, 0.35);
}
.btn-danger:hover { background: rgba(153, 27, 27, 0.28); }

.toggle-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  cursor: pointer;
}
.toggle-row input[type=checkbox] {
  accent-color: var(--accent);
  width: 16px; height: 16px;
}
.toggle-label { font-size: 13px; font-weight: 500; }

.eq-block {
  background: var(--surface);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border);
  border-left: 3px solid var(--accent);
  border-radius: 0 14px 14px 0;
  padding: 16px;
  margin-bottom: 12px;
  font-family: var(--mono);
  font-size: 13px;
  line-height: 2;
  color: var(--text);
  transition: border-color 0.3s ease;
}
.eq-block:hover { border-color: rgba(168, 85, 247, 0.45); }
.eq-block .eq-title {
  font-family: var(--sans);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 10px;
}
.eq-block .sym { color: var(--warm); }
.eq-block .op  { color: var(--cool); }
.eq-block .cmt { color: var(--muted); }

.calc-page {
  padding: 40px;
  max-width: 900px;
  margin: 0 auto;
  overflow-y: auto;
  height: calc(100vh - 120px);
}
.calc-section {
  margin-bottom: 48px;
}
.calc-h2 {
  font-family: 'Playfair Display', serif;
  font-size: 24px;
  color: #fff;
  margin-bottom: 20px;
  padding-bottom: 12px;
  padding-left: 14px;
  border-bottom: 1px solid var(--border);
  border-left: 3px solid var(--accent);
}
.calc-p {
  color: var(--muted);
  line-height: 1.8;
  margin-bottom: 16px;
  font-size: 15px;
}
.big-eq {
  background: var(--panel);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border);
  border-left: 3px solid var(--accent);
  border-radius: 0 16px 16px 0;
  padding: 24px;
  margin: 20px 0;
  font-family: var(--mono);
  font-size: 15px;
  line-height: 2.2;
  color: var(--text);
  transition: border-color 0.3s ease;
}
.big-eq:hover { border-color: rgba(168, 85, 247, 0.45); }
.big-eq .hi-acc { color: var(--accent); }
.big-eq .hi-warm { color: var(--warm); }
.big-eq .hi-cool { color: var(--cool); }
.big-eq .hi-pos  { color: var(--positivo); }
.big-eq .hi-neg  { color: var(--negativo); }
.big-eq .hi-danger { color: var(--danger); }
.big-eq .cmt    { color: var(--muted); font-style: italic; }
.derivation-step {
  display: flex;
  align-items: baseline;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
}
.derivation-step:last-child { border-bottom: none; }
.step-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(168, 85, 247, 0.14);
  font-family: var(--mono);
  font-size: 12px;
  font-weight: 600;
  color: var(--accent);
}
.step-eq { font-family: var(--mono); font-size: 14px; color: var(--text); }
.step-desc { font-size: 13px; color: var(--muted); margin-left: auto; font-style: italic; }

.alert-box {
  background: rgba(251,191,36,0.08);
  border: 1px solid rgba(251,191,36,0.3);
  border-radius: 12px;
  padding: 12px 16px;
  margin: 14px 0;
  font-size: 13px;
  color: var(--warm);
  line-height: 1.7;
}

.toggle-label { font-size: 13px; }
`;
