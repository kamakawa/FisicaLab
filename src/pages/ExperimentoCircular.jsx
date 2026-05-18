import React, { useState, useEffect, useRef, useCallback } from 'react';

// ─── Paleta e CSS global ─────────────────────────────────────────────────────
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Fira+Code:wght@400;500;600&family=Playfair+Display:ital,wght@0,700;1,400&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:       #07090f;
  --surface:  #0d1117;
  --panel:    #111827;
  --border:   rgba(255,255,255,0.07);
  --accent:   #60a5fa;
  --gold:     #fbbf24;
  --green:    #34d399;
  --red:      #f87171;
  --purple:   #a78bfa;
  --text:     #e2e8f0;
  --muted:    #64748b;
  --mono:     'Fira Code', monospace;
  --sans:     'Space Grotesk', sans-serif;
}

body { background: var(--bg); }

.app {
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  font-family: var(--sans);
  font-size: 14px;
}

/* ── Header ── */
.header {
  border-bottom: 1px solid var(--border);
  padding: 18px 32px;
  display: flex;
  align-items: baseline;
  gap: 20px;
  background: linear-gradient(90deg, rgba(96,165,250,0.06) 0%, transparent 60%);
}
.header-title {
  font-family: 'Playfair Display', serif;
  font-size: 26px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.5px;
}
.header-sub {
  font-size: 12px;
  color: var(--muted);
  letter-spacing: 0.15em;
  text-transform: uppercase;
}
.header-tag {
  margin-left: auto;
  font-size: 11px;
  color: var(--accent);
  border: 1px solid rgba(96,165,250,0.3);
  padding: 3px 10px;
  border-radius: 20px;
  font-family: var(--mono);
}

/* ── Tabs ── */
.tabs {
  display: flex;
  gap: 2px;
  padding: 12px 32px 0;
  border-bottom: 1px solid var(--border);
}
.tab {
  padding: 10px 20px;
  border: none;
  background: transparent;
  color: var(--muted);
  font-family: var(--sans);
  font-size: 13px;
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

/* ── Layout grid ── */
.content {
  display: grid;
  grid-template-columns: 320px 1fr 280px;
  gap: 0;
  height: calc(100vh - 104px);
}

.sidebar-l, .sidebar-r {
  border-right: 1px solid var(--border);
  overflow-y: auto;
  padding: 20px;
  background: var(--panel);
}
.sidebar-r {
  border-right: none;
  border-left: 1px solid var(--border);
}

.main-area {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── Panels & cards ── */
.section-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.18em;
  color: var(--muted);
  text-transform: uppercase;
  margin-bottom: 12px;
  margin-top: 20px;
}
.section-label:first-child { margin-top: 0; }

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 10px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 6px 0;
  border-bottom: 1px solid var(--border);
}
.stat-row:last-child { border-bottom: none; }
.stat-label { color: var(--muted); font-size: 12px; }
.stat-val {
  font-family: var(--mono);
  font-size: 13px;
  color: var(--text);
}
.stat-val.accent { color: var(--accent); }
.stat-val.gold   { color: var(--gold); }
.stat-val.green  { color: var(--green); }
.stat-val.red    { color: var(--red); }
.stat-val.purple { color: var(--purple); }

/* ── Sliders ── */
.ctrl {
  margin-bottom: 14px;
}
.ctrl-head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 12px;
}
.ctrl-name { color: var(--muted); }
.ctrl-num  { font-family: var(--mono); color: var(--accent); }
input[type=range] {
  width: 100%;
  accent-color: var(--accent);
  height: 3px;
  cursor: pointer;
}

/* ── Buttons ── */
.btn-row { display: flex; gap: 8px; margin-top: 12px; }
.btn {
  flex: 1;
  padding: 9px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: var(--sans);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  transition: all 0.15s;
}
.btn-primary {
  background: var(--accent);
  color: #07090f;
}
.btn-primary:hover { filter: brightness(1.15); }
.btn-secondary {
  background: rgba(255,255,255,0.06);
  color: var(--text);
  border: 1px solid var(--border);
}
.btn-secondary:hover { background: rgba(255,255,255,0.1); }
.btn-danger {
  background: rgba(248,113,113,0.15);
  color: var(--red);
  border: 1px solid rgba(248,113,113,0.2);
}
.btn-danger:hover { background: rgba(248,113,113,0.25); }

/* ── Canvas ── */
.canvas-wrap {
  flex: 1;
  position: relative;
  background: radial-gradient(ellipse at 50% 50%, #0f1829 0%, #07090f 80%);
  overflow: hidden;
}
canvas { display: block; width: 100%; height: 100%; }

/* ── Plots strip ── */
.plots-strip {
  height: 160px;
  border-top: 1px solid var(--border);
  display: flex;
  background: var(--panel);
}
.plot-box {
  flex: 1;
  border-right: 1px solid var(--border);
  padding: 8px;
  position: relative;
}
.plot-box:last-child { border-right: none; }
.plot-title {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--muted);
  text-transform: uppercase;
  margin-bottom: 4px;
}
.plot-box canvas { border-radius: 4px; }

/* ── Equações / Cálculo ── */
.eq-block {
  background: var(--surface);
  border: 1px solid var(--border);
  border-left: 3px solid var(--accent);
  border-radius: 0 10px 10px 0;
  padding: 12px 14px;
  margin-bottom: 10px;
  font-family: var(--mono);
  font-size: 12px;
  line-height: 1.9;
  color: var(--text);
}
.eq-block .eq-title {
  font-family: var(--sans);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 8px;
}
.eq-block .sym { color: var(--gold); }
.eq-block .op  { color: var(--purple); }
.eq-block .cmt { color: var(--muted); }

/* ── Info badge ── */
.badge {
  display: inline-block;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  font-family: var(--mono);
  margin-left: 6px;
}
.badge-blue   { background: rgba(96,165,250,0.15); color: var(--accent); }
.badge-green  { background: rgba(52,211,153,0.15); color: var(--green); }
.badge-red    { background: rgba(248,113,113,0.15); color: var(--red); }
.badge-gold   { background: rgba(251,191,36,0.15);  color: var(--gold); }

/* ── Checkbox ── */
.toggle-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  cursor: pointer;
}
.toggle-row input[type=checkbox] {
  accent-color: var(--accent);
  width: 14px; height: 14px;
}
.toggle-label { font-size: 12px; color: var(--muted); }

/* ── Experiment tab ── */
.exp-grid {
  display: grid;
  grid-template-columns: 350px 1fr 280px;
  gap: 0;
  height: calc(100vh - 104px);
}
.exp-canvas-wrap {
  background: radial-gradient(ellipse at 50% 50%, #0f1829 0%, #07090f 80%);
  position: relative;
  overflow: hidden;
}

/* ── Calc tab ── */
.calc-page {
  padding: 32px;
  max-width: 900px;
  margin: 0 auto;
  overflow-y: auto;
  height: calc(100vh - 104px);
}
.calc-section {
  margin-bottom: 40px;
}
.calc-h2 {
  font-family: 'Playfair Display', serif;
  font-size: 22px;
  color: #fff;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border);
}
.calc-p {
  color: var(--muted);
  line-height: 1.7;
  margin-bottom: 14px;
  font-size: 13px;
}
.big-eq {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px 24px;
  margin: 16px 0;
  font-family: var(--mono);
  font-size: 14px;
  line-height: 2.2;
  color: var(--text);
}
.big-eq .hi-acc { color: var(--accent); }
.big-eq .hi-gld { color: var(--gold); }
.big-eq .hi-grn { color: var(--green); }
.big-eq .hi-red { color: var(--red); }
.big-eq .hi-pur { color: var(--purple); }
.big-eq .cmt    { color: var(--muted); font-style: italic; }
.derivation-step {
  display: flex;
  align-items: baseline;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
}
.derivation-step:last-child { border-bottom: none; }
.step-num {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--muted);
  min-width: 24px;
}
.step-eq { font-family: var(--mono); font-size: 13px; color: var(--text); }
.step-desc { font-size: 12px; color: var(--muted); margin-left: auto; font-style: italic; }
`;

// ─── Utilities ───────────────────────────────────────────────────────────────
const TAU = 2 * Math.PI;
const fmt  = (n, d = 2) => n.toFixed(d);

// ─── Componente principal ────────────────────────────────────────────────────
export default function ExperimentoCircular() {
  const [tab, setTab] = useState('sim');

  return (
    <>
      <style>{STYLES}</style>
      <div className="app">
        <header className="header">
          <div>
            <div className="header-title">Movimento Circular</div>
            <div className="header-sub">Física I · Mecânica Clássica</div>
          </div>
          <span className="header-tag">v2.0 · Interativo</span>
        </header>

        <nav className="tabs">
          {[
            ['sim',  'Simulação'],
            ['exp',  'Experimento'],
            ['calc', 'Cálculo & Derivações'],
          ].map(([id, label]) => (
            <button
              key={id}
              className={`tab ${tab === id ? 'active' : ''}`}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </nav>

        {tab === 'sim'  && <SimTab />}
        {tab === 'exp'  && <ExpTab />}
        {tab === 'calc' && <CalcTab />}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ABA 1 — SIMULAÇÃO
// ═══════════════════════════════════════════════════════════════════════════════
function SimTab() {
  const [raio,      setRaio]      = useState(3.5);
  const [omega,     setOmega]     = useState(2.0);
  const [massa,     setMassa]     = useState(1.5);
  const [rodando,   setRodando]   = useState(true);
  const [t,         setT]         = useState(0);
  const [showV,     setShowV]     = useState(true);
  const [showA,     setShowA]     = useState(true);
  const [showT,     setShowT]     = useState(true);   // tension
  const [showTrail, setShowTrail] = useState(true);

  const canvasRef   = useRef(null);
  const plotPosRef  = useRef(null);
  const plotVRef    = useRef(null);
  const plotARef    = useRef(null);
  const histRef     = useRef({ px:[], py:[], vx:[], vy:[], ax:[], ay:[], ts:[] });
  const trailRef    = useRef([]);
  const rafRef      = useRef(null);
  const lastRef     = useRef(null);

  // ── Física ──
  const angulo = omega * t;
  const vLin   = omega * raio;
  const aCent  = omega * omega * raio;
  const T      = massa * aCent;               // força centrípeta = tensão
  const Per    = TAU / omega;
  const freq   = 1 / Per;
  const Ec     = 0.5 * massa * vLin * vLin;

  // ── Animação ──
  useEffect(() => {
    if (!rodando) { lastRef.current = null; return; }
    const step = (now) => {
      if (lastRef.current !== null) {
        const dt = Math.min((now - lastRef.current) / 1000, 0.05);
        setT(prev => prev + dt);
      }
      lastRef.current = now;
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [rodando]);

  // ── Histórico para gráficos ──
  useEffect(() => {
    const h = histRef.current;
    const ang = omega * t;
    h.px.push(Math.cos(ang)); h.py.push(Math.sin(ang));
    h.vx.push(-Math.sin(ang)); h.vy.push(Math.cos(ang));
    h.ax.push(-Math.cos(ang)); h.ay.push(-Math.sin(ang));
    h.ts.push(t);
    const MAX = 400;
    if (h.ts.length > MAX) {
      h.px.shift(); h.py.shift(); h.vx.shift(); h.vy.shift();
      h.ax.shift(); h.ay.shift(); h.ts.shift();
    }
  }, [t, omega]);

  // ── Trail ──
  useEffect(() => {
    if (!showTrail) { trailRef.current = []; return; }
    const ang = omega * t;
    trailRef.current.push({ x: Math.cos(ang), y: Math.sin(ang), t });
    if (trailRef.current.length > 200) trailRef.current.shift();
  }, [t, omega, showTrail]);

  // ── Desenho principal ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;
    const cx = W / 2, cy = H / 2;
    const scale = Math.min(W, H) / 2 * 0.78 / 6;

    ctx.clearRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let r = 1; r <= 8; r++) {
      ctx.beginPath();
      ctx.arc(cx, cy, r * scale, 0, TAU);
      ctx.stroke();
    }
    [-1, 0, 1].forEach(dx => {
      ctx.beginPath();
      ctx.moveTo(cx + dx * 3 * scale, 0);
      ctx.lineTo(cx + dx * 3 * scale, H);
      ctx.stroke();
    });

    // Órbita
    ctx.beginPath();
    ctx.arc(cx, cy, raio * scale, 0, TAU);
    ctx.strokeStyle = 'rgba(96,165,250,0.25)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Trail
    if (showTrail && trailRef.current.length > 1) {
      const trail = trailRef.current;
      for (let i = 1; i < trail.length; i++) {
        const alpha = i / trail.length;
        ctx.beginPath();
        ctx.moveTo(cx + trail[i-1].x * raio * scale, cy + trail[i-1].y * raio * scale);
        ctx.lineTo(cx + trail[i].x * raio * scale, cy + trail[i].y * raio * scale);
        ctx.strokeStyle = `rgba(96,165,250,${alpha * 0.5})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    const ang = omega * t;
    const px = cx + Math.cos(ang) * raio * scale;
    const py = cy + Math.sin(ang) * raio * scale;

    // Raio
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, py);
    ctx.strokeStyle = 'rgba(251,191,36,0.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Label raio
    ctx.fillStyle = 'rgba(251,191,36,0.7)';
    ctx.font = '12px Fira Code';
    ctx.fillText(`r = ${fmt(raio)}m`, cx + Math.cos(ang) * raio * scale * 0.5 + 6, cy + Math.sin(ang) * raio * scale * 0.5 - 6);

    // Vetores
    const arrow = (x1, y1, dx, dy, color, label) => {
      const len = Math.sqrt(dx*dx + dy*dy);
      if (len < 1) return;
      const ux = dx / len, uy = dy / len;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x1 + dx, y1 + dy);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      // Seta
      const hs = 8;
      ctx.beginPath();
      ctx.moveTo(x1 + dx, y1 + dy);
      ctx.lineTo(x1 + dx - hs * ux + hs * 0.4 * uy, y1 + dy - hs * uy - hs * 0.4 * ux);
      ctx.lineTo(x1 + dx - hs * ux - hs * 0.4 * uy, y1 + dy - hs * uy + hs * 0.4 * ux);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      // Label
      ctx.fillStyle = color;
      ctx.font = '11px Fira Code';
      ctx.fillText(label, x1 + dx + 6, y1 + dy + 4);
    };

    const vScale = 20;
    const aScale = 12;
    const tScale = 14;

    if (showV) {
      const vx = -Math.sin(ang) * vLin * vScale;
      const vy =  Math.cos(ang) * vLin * vScale;
      arrow(px, py, vx, vy, '#34d399', `v=${fmt(vLin)}m/s`);
    }
    if (showA) {
      const ax = -(Math.cos(ang)) * aCent * aScale;
      const ay = -(Math.sin(ang)) * aCent * aScale;
      arrow(px, py, ax, ay, '#f87171', `ac=${fmt(aCent)}m/s²`);
    }
    if (showT) {
      const tx = -(Math.cos(ang)) * T * tScale * 0.3;
      const ty = -(Math.sin(ang)) * T * tScale * 0.3;
      arrow(px, py, tx, ty, '#a78bfa', `T=${fmt(T)}N`);
    }

    // Partícula
    ctx.beginPath();
    ctx.arc(px, py, 12, 0, TAU);
    const grd = ctx.createRadialGradient(px, py, 0, px, py, 12);
    grd.addColorStop(0, '#93c5fd');
    grd.addColorStop(1, '#3b82f6');
    ctx.fillStyle = grd;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Massa label
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px Fira Code';
    ctx.textAlign = 'center';
    ctx.fillText(`${fmt(massa,1)}kg`, px, py + 4);
    ctx.textAlign = 'left';

    // Centro
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, TAU);
    ctx.fillStyle = '#fff';
    ctx.fill();

    // Ângulo arc
    ctx.beginPath();
    ctx.arc(cx, cy, 28, 0, ang % TAU, omega < 0);
    ctx.strokeStyle = 'rgba(251,191,36,0.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = 'rgba(251,191,36,0.8)';
    ctx.font = '11px Fira Code';
    ctx.fillText(`θ=${fmt((ang % TAU) * 180 / Math.PI, 0)}°`, cx + 32, cy - 10);

    // Info tempo
    ctx.fillStyle = 'rgba(100,116,139,0.9)';
    ctx.font = '12px Fira Code';
    ctx.fillText(`t = ${fmt(t, 2)} s`, 12, H - 12);
  }, [t, raio, omega, massa, vLin, aCent, T, showV, showA, showT, showTrail]);

  // ── Mini gráficos ──
  const drawPlot = useCallback((ref, data, color, label, yMin, yMax) => {
    const canvas = ref.current;
    if (!canvas || data.length < 2) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;
    ctx.clearRect(0, 0, W, H);

    // Eixos
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, H/2); ctx.lineTo(W, H/2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, H*0.25); ctx.lineTo(W, H*0.25); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, H*0.75); ctx.lineTo(W, H*0.75); ctx.stroke();

    // Curva
    const range = (yMax - yMin) || 1;
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = (i / (data.length - 1)) * W;
      const y = H - ((v - yMin) / range) * H;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Label
    ctx.fillStyle = color;
    ctx.font = '10px Fira Code';
    ctx.fillText(label, 6, 14);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText(fmt(data[data.length - 1]), 6, 28);
  }, []);

  useEffect(() => {
    const h = histRef.current;
    drawPlot(plotPosRef, h.px, '#60a5fa', 'x(t) = cos(ωt)', -1.1, 1.1);
    drawPlot(plotVRef,   h.vy, '#34d399', 'vy(t) = ω·cos(ωt)', -1.1, 1.1);
    drawPlot(plotARef,   h.ay.map(v => -v), '#f87171', 'ay(t) = −ω²sin(ωt)', -1.1, 1.1);
  }, [t, drawPlot]);

  return (
    <div className="content">
      {/* ── Esquerda ── */}
      <div className="sidebar-l">
        <div className="section-label">Parâmetros</div>

        <div className="ctrl">
          <div className="ctrl-head">
            <span className="ctrl-name">Raio</span>
            <span className="ctrl-num">{fmt(raio, 1)} m</span>
          </div>
          <input type="range" min="1" max="6" step="0.1" value={raio}
            onChange={e => { setRaio(+e.target.value); trailRef.current = []; }} />
        </div>

        <div className="ctrl">
          <div className="ctrl-head">
            <span className="ctrl-name">Velocidade Angular ω</span>
            <span className="ctrl-num">{fmt(omega, 1)} rad/s</span>
          </div>
          <input type="range" min="0.3" max="8" step="0.1" value={omega}
            onChange={e => setOmega(+e.target.value)} />
        </div>

        <div className="ctrl">
          <div className="ctrl-head">
            <span className="ctrl-name">Massa m</span>
            <span className="ctrl-num">{fmt(massa, 1)} kg</span>
          </div>
          <input type="range" min="0.5" max="10" step="0.1" value={massa}
            onChange={e => setMassa(+e.target.value)} />
        </div>

        <div className="section-label">Visualização</div>

        {[
          [showV,     setShowV,     'Vetor Velocidade', '#34d399'],
          [showA,     setShowA,     'Vetor Aceleração Centrípeta', '#f87171'],
          [showT,     setShowT,     'Força Centrípeta (Tensão)', '#a78bfa'],
          [showTrail, setShowTrail, 'Rastro da Partícula', '#60a5fa'],
        ].map(([val, fn, label, c]) => (
          <label className="toggle-row" key={label}>
            <input type="checkbox" checked={val} onChange={e => fn(e.target.checked)} />
            <span className="toggle-label" style={{ color: c }}>{label}</span>
          </label>
        ))}

        <div className="btn-row">
          <button className="btn btn-primary"   onClick={() => setRodando(true)}>▶ Iniciar</button>
          <button className="btn btn-secondary" onClick={() => setRodando(false)}>⏸ Pausar</button>
        </div>
        <div className="btn-row">
          <button className="btn btn-danger" onClick={() => { setT(0); trailRef.current = []; }}>↩ Reset</button>
        </div>
      </div>

      {/* ── Centro ── */}
      <div className="main-area">
        <div className="canvas-wrap">
          <canvas ref={canvasRef} style={{ width:'100%', height:'100%' }} />
        </div>
        <div className="plots-strip">
          <div className="plot-box">
            <div className="plot-title">Posição x(t)</div>
            <canvas ref={plotPosRef} style={{ width:'100%', height:'120px' }} />
          </div>
          <div className="plot-box">
            <div className="plot-title">Velocidade vy(t)</div>
            <canvas ref={plotVRef} style={{ width:'100%', height:'120px' }} />
          </div>
          <div className="plot-box">
            <div className="plot-title">Aceleração ay(t)</div>
            <canvas ref={plotARef} style={{ width:'100%', height:'120px' }} />
          </div>
        </div>
      </div>

      {/* ── Direita ── */}
      <div className="sidebar-r">
        <div className="section-label">Grandezas Calculadas</div>

        <div className="card">
          <div className="stat-row"><span className="stat-label">Vel. Linear v</span>        <span className="stat-val accent">{fmt(vLin)} m/s</span></div>
          <div className="stat-row"><span className="stat-label">Acel. Centrípeta aₒ</span>  <span className="stat-val red">{fmt(aCent)} m/s²</span></div>
          <div className="stat-row"><span className="stat-label">Força Centrípeta F</span>   <span className="stat-val purple">{fmt(T)} N</span></div>
          <div className="stat-row"><span className="stat-label">Período T</span>             <span className="stat-val gold">{fmt(Per)} s</span></div>
          <div className="stat-row"><span className="stat-label">Frequência f</span>          <span className="stat-val green">{fmt(freq, 3)} Hz</span></div>
          <div className="stat-row"><span className="stat-label">Energia Cinética Eₖ</span>  <span className="stat-val">{fmt(Ec)} J</span></div>
          <div className="stat-row"><span className="stat-label">Ângulo θ</span>             <span className="stat-val">{fmt(((omega*t) % TAU)*180/Math.PI, 1)}°</span></div>
        </div>

        <div className="section-label">Equações Instantâneas</div>

        <div className="eq-block">
          <div className="eq-title">Posição Vetorial</div>
          <span className="sym">r⃗</span> <span className="op">=</span> r·<span className="sym">cos</span>(ωt)î + r·<span className="sym">sin</span>(ωt)ĵ
        </div>

        <div className="eq-block">
          <div className="eq-title">Velocidade Tangencial</div>
          <span className="sym">v⃗</span> <span className="op">=</span> d<span className="sym">r⃗</span>/dt<br />
          &nbsp;&nbsp;<span className="op">=</span> −rω·<span className="sym">sin</span>(ωt)î + rω·<span className="sym">cos</span>(ωt)ĵ
        </div>

        <div className="eq-block">
          <div className="eq-title">Aceleração Centrípeta</div>
          <span className="sym">a⃗</span> <span className="op">=</span> d<span className="sym">v⃗</span>/dt<br />
          &nbsp;&nbsp;<span className="op">=</span> −rω²·<span className="sym">cos</span>(ωt)î − rω²·<span className="sym">sin</span>(ωt)ĵ<br />
          &nbsp;&nbsp;<span className="op">=</span> −ω²·<span className="sym">r⃗</span> <span className="cmt">← aponta para centro</span>
        </div>

        <div className="eq-block">
          <div className="eq-title">2ª Lei de Newton</div>
          <span className="sym">F⃗</span>ₒ <span className="op">=</span> m·<span className="sym">a⃗</span> <span className="op">=</span> −mω²·r·r̂
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ABA 2 — EXPERIMENTO  (pêndulo cônico com atrito do ar)
// ═══════════════════════════════════════════════════════════════════════════════
function ExpTab() {
  const [massa,     setMassa]     = useState(0.5);
  const [fio,       setFio]       = useState(1.2);
  const [angFio,    setAngFio]    = useState(25);   // graus
  const [atrito,    setAtrito]    = useState(0.05);
  const [omega,     setOmega]     = useState(0);
  const [t,         setT]         = useState(0);
  const [rodando,   setRodando]   = useState(false);
  const [showForce, setShowForce] = useState(true);

  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const lastRef   = useRef(null);
  const stateRef  = useRef({ omega: 0, angFio: 25, t: 0 });

  const g = 9.8;
  const angRad   = angFio * Math.PI / 180;
  const r        = fio * Math.sin(angRad);
  const h        = fio * Math.cos(angRad);
  const omegaEq  = Math.sqrt(g / h);  // velocidade angular de equilíbrio
  const T_fio    = massa * g / Math.cos(angRad);
  const Fc       = massa * omegaEq * omegaEq * r;
  const Per      = TAU / omegaEq;
  const vLin     = omegaEq * r;

  useEffect(() => {
    stateRef.current.omega  = omega;
    stateRef.current.angFio = angFio;
    stateRef.current.t      = t;
  }, [omega, angFio, t]);

  useEffect(() => {
    if (!rodando) { lastRef.current = null; return; }

    const step = (now) => {
      if (lastRef.current !== null) {
        const dt = Math.min((now - lastRef.current) / 1000, 0.04);
        const s  = stateRef.current;
        const angR  = s.angFio * Math.PI / 180;
        const rr    = fio * Math.sin(angR);
        const hh    = fio * Math.cos(angR);
        const omEq  = Math.sqrt(g / hh);

        // Equação dinâmica simplificada: ω tende ao equilíbrio com amortecimento
        const dOmega = (omEq - s.omega) * 0.8 - atrito * s.omega;
        const newOmega = Math.max(0, s.omega + dOmega * dt);

        // Ângulo do fio evolui até equilíbrio
        const angEq  = Math.atan(newOmega * newOmega * fio * Math.sin(angR) / g) * 180 / Math.PI;
        const newAng = s.angFio + (angEq - s.angFio) * 0.3 * dt;

        stateRef.current = { omega: newOmega, angFio: newAng, t: s.t + dt };
        setOmega(newOmega);
        setAngFio(newAng);
        setT(s.t + dt);
      }
      lastRef.current = now;
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [rodando, fio, atrito, g]);

  // ── Desenho pêndulo cônico ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;
    ctx.clearRect(0, 0, W, H);

    const cx = W / 2, pivY = 80;
    const scale = Math.min(W, H) / 3.5;

    const angR = angFio * Math.PI / 180;
    const rr   = fio * Math.sin(angR) * scale;
    const hh   = fio * Math.cos(angR) * scale;
    const massaX = cx + rr;
    const massaY = pivY + hh;

    // Suporte
    ctx.fillStyle = '#334155';
    ctx.fillRect(cx - 40, pivY - 18, 80, 18);
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(cx, pivY, 8, 0, TAU);
    ctx.fill();

    // Elipse (trajetória projetada)
    ctx.beginPath();
    ctx.ellipse(cx, massaY, rr, rr * 0.25, 0, 0, TAU);
    ctx.strokeStyle = 'rgba(96,165,250,0.2)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Linha vertical (altura h)
    ctx.beginPath();
    ctx.moveTo(cx, pivY);
    ctx.lineTo(cx, massaY);
    ctx.strokeStyle = 'rgba(251,191,36,0.25)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Fio
    ctx.beginPath();
    ctx.moveTo(cx, pivY);
    ctx.lineTo(massaX, massaY);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Raio horizontal
    ctx.beginPath();
    ctx.moveTo(cx, massaY);
    ctx.lineTo(massaX, massaY);
    ctx.strokeStyle = 'rgba(96,165,250,0.5)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4,4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Labels geométricos
    ctx.fillStyle = 'rgba(251,191,36,0.8)';
    ctx.font = '11px Fira Code';
    ctx.fillText(`L=${fmt(fio,1)}m`, cx + rr/2 - 10, pivY + hh/2 - 8);
    ctx.fillStyle = 'rgba(96,165,250,0.8)';
    ctx.fillText(`r=${fmt(rr/scale,2)}m`, cx + rr/2 - 5, massaY + 18);
    ctx.fillStyle = 'rgba(100,116,139,0.8)';
    ctx.fillText(`h=${fmt(hh/scale,2)}m`, cx - 56, pivY + hh/2 + 4);

    // Ângulo arc
    ctx.beginPath();
    ctx.arc(cx, pivY, 30, Math.PI/2, Math.PI/2 + angR, false);
    ctx.strokeStyle = '#f87171';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#f87171';
    ctx.font = '11px Fira Code';
    ctx.fillText(`θ=${fmt(angFio, 1)}°`, cx + 8, pivY + 38);

    if (showForce) {
      const fScale = 30;
      const arrow2 = (x1, y1, dx, dy, color, lbl) => {
        const len = Math.sqrt(dx*dx+dy*dy);
        if (len < 2) return;
        const ux = dx/len, uy = dy/len;
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x1+dx,y1+dy);
        ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.stroke();
        const hs = 8;
        ctx.beginPath();
        ctx.moveTo(x1+dx, y1+dy);
        ctx.lineTo(x1+dx-hs*ux+hs*0.4*uy, y1+dy-hs*uy-hs*0.4*ux);
        ctx.lineTo(x1+dx-hs*ux-hs*0.4*uy, y1+dy-hs*uy+hs*0.4*ux);
        ctx.closePath();
        ctx.fillStyle = color; ctx.fill();
        ctx.fillStyle = color; ctx.font = '10px Fira Code';
        ctx.fillText(lbl, x1+dx+4, y1+dy+4);
      };

      // Tensão (ao longo do fio em direção ao pivot)
      const dx_t = -(Math.sin(angR));
      const dy_t = -(Math.cos(angR));
      arrow2(massaX, massaY, dx_t * T_fio * fScale * 0.6, dy_t * T_fio * fScale * 0.6,
        '#a78bfa', `T=${fmt(T_fio,1)}N`);

      // Peso
      arrow2(massaX, massaY, 0, massa * g * fScale * 0.6, '#f87171', `mg=${fmt(massa*g,1)}N`);

      // Centrípeta
      arrow2(massaX, massaY, -Fc * fScale * 0.6, 0, '#34d399', `Fc=${fmt(Fc,1)}N`);
    }

    // Massa (bola)
    const grd = ctx.createRadialGradient(massaX, massaY, 0, massaX, massaY, 16);
    grd.addColorStop(0, '#93c5fd');
    grd.addColorStop(1, '#3b82f6');
    ctx.beginPath();
    ctx.arc(massaX, massaY, 16, 0, TAU);
    ctx.fillStyle = grd;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px Fira Code';
    ctx.textAlign = 'center';
    ctx.fillText(`${fmt(massa,1)}`, massaX, massaY + 4);
    ctx.textAlign = 'left';

    // Tempo e ω
    ctx.fillStyle = 'rgba(100,116,139,0.9)';
    ctx.font = '12px Fira Code';
    ctx.fillText(`ω = ${fmt(omega, 2)} rad/s`, 12, H - 28);
    ctx.fillText(`t = ${fmt(t, 2)} s`, 12, H - 12);
  }, [angFio, fio, massa, omega, t, showForce, T_fio, Fc, r, h, angRad]);

  const iniciar = () => {
    setRodando(true);
  };
  const pausar = () => setRodando(false);
  const reset  = () => {
    setRodando(false);
    setOmega(0);
    setAngFio(25);
    setT(0);
  };

  return (
    <div className="exp-grid">
      {/* Esquerda */}
      <div className="sidebar-l">
        <div className="section-label">Pêndulo Cônico — Parâmetros</div>

        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Comprimento do Fio L</span><span className="ctrl-num">{fmt(fio,1)} m</span></div>
          <input type="range" min="0.4" max="2.5" step="0.05" value={fio} onChange={e => setFio(+e.target.value)} />
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Ângulo do Fio θ</span><span className="ctrl-num">{fmt(angFio,1)}°</span></div>
          <input type="range" min="5" max="70" step="0.5" value={angFio} onChange={e => setAngFio(+e.target.value)} />
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Massa m</span><span className="ctrl-num">{fmt(massa,1)} kg</span></div>
          <input type="range" min="0.1" max="3" step="0.05" value={massa} onChange={e => setMassa(+e.target.value)} />
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Coef. Atrito do Ar β</span><span className="ctrl-num">{fmt(atrito,3)}</span></div>
          <input type="range" min="0" max="0.3" step="0.005" value={atrito} onChange={e => setAtrito(+e.target.value)} />
        </div>

        <label className="toggle-row">
          <input type="checkbox" checked={showForce} onChange={e => setShowForce(e.target.checked)} />
          <span className="toggle-label" style={{color:'#a78bfa'}}>Mostrar vetores de força</span>
        </label>

        <div className="btn-row">
          <button className="btn btn-primary"   onClick={iniciar}>▶ Iniciar</button>
          <button className="btn btn-secondary" onClick={pausar}>⏸ Pausar</button>
        </div>
        <div className="btn-row">
          <button className="btn btn-danger" onClick={reset}>↩ Reset</button>
        </div>

        <div className="section-label" style={{marginTop:20}}>Condições de Equilíbrio</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">ωₑq (equilíbrio)</span> <span className="stat-val accent">{fmt(omegaEq,3)} rad/s</span></div>
          <div className="stat-row"><span className="stat-label">ω atual</span>           <span className="stat-val green">{fmt(omega,3)} rad/s</span></div>
          <div className="stat-row"><span className="stat-label">Diferença</span>         <span className="stat-val gold">{fmt(Math.abs(omegaEq-omega),3)} rad/s</span></div>
        </div>
      </div>

      {/* Centro */}
      <div className="exp-canvas-wrap">
        <canvas ref={canvasRef} style={{ width:'100%', height:'100%' }} />
      </div>

      {/* Direita */}
      <div className="sidebar-r">
        <div className="section-label">Grandezas do Pêndulo Cônico</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">Raio da órbita r</span>  <span className="stat-val accent">{fmt(r, 3)} m</span></div>
          <div className="stat-row"><span className="stat-label">Altura h</span>           <span className="stat-val">{fmt(h, 3)} m</span></div>
          <div className="stat-row"><span className="stat-label">Tensão T no fio</span>   <span className="stat-val purple">{fmt(T_fio, 2)} N</span></div>
          <div className="stat-row"><span className="stat-label">Força Centrípeta Fc</span><span className="stat-val green">{fmt(Fc, 2)} N</span></div>
          <div className="stat-row"><span className="stat-label">Vel. Linear v</span>     <span className="stat-val accent">{fmt(vLin,2)} m/s</span></div>
          <div className="stat-row"><span className="stat-label">Período T</span>          <span className="stat-val gold">{fmt(Per, 2)} s</span></div>
        </div>

        <div className="section-label">Balanço de Forças</div>
        <div className="eq-block">
          <div className="eq-title">Decomposição (eixo y)</div>
          <span className="sym">T</span>·cos(θ) <span className="op">=</span> m·g<br/>
          <span className="sym">T</span> <span className="op">=</span> mg / cos(θ)
        </div>
        <div className="eq-block">
          <div className="eq-title">Decomposição (eixo x)</div>
          <span className="sym">T</span>·sin(θ) <span className="op">=</span> m·ω²·r<br/>
          mg·tan(θ) <span className="op">=</span> m·ω²·r<br/>
          ω <span className="op">=</span> √(g / h)
        </div>
        <div className="eq-block">
          <div className="eq-title">Equação de Movimento c/ Atrito</div>
          dω/dt <span className="op">=</span> (ω_eq − ω) − β·ω<br/>
          <span className="cmt">// amortecimento viscoso do ar</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ABA 3 — CÁLCULO & DERIVAÇÕES
// ═══════════════════════════════════════════════════════════════════════════════
function CalcTab() {
  return (
    <div className="calc-page">

      {/* ── 1. Posição ── */}
      <div className="calc-section">
        <div className="calc-h2">1. Descrição Vetorial do Movimento</div>
        <p className="calc-p">
          Uma partícula em movimento circular uniforme (MCU) de raio <em>r</em> com velocidade angular constante <em>ω</em> tem sua posição descrita por:
        </p>
        <div className="big-eq">
          <span className="hi-acc">r⃗</span>(t) = r·cos(<span className="hi-gld">ω</span>t)·î + r·sin(<span className="hi-gld">ω</span>t)·ĵ
        </div>
        <p className="calc-p">
          Esta é uma parametrização da circunferência em termos do tempo. O módulo do vetor posição é sempre constante: |<em>r⃗</em>| = r.
        </p>
      </div>

      {/* ── 2. Derivada → Velocidade ── */}
      <div className="calc-section">
        <div className="calc-h2">2. Derivada da Posição → Velocidade Instantânea</div>
        <p className="calc-p">
          A velocidade é a derivada temporal do vetor posição. Aplicando a regra da cadeia:
        </p>
        <div className="big-eq">
          <div className="derivation-step">
            <span className="step-num">①</span>
            <span className="step-eq"><span className="hi-grn">v⃗</span>(t) = d<span className="hi-acc">r⃗</span>/dt</span>
            <span className="step-desc">definição</span>
          </div>
          <div className="derivation-step">
            <span className="step-num">②</span>
            <span className="step-eq">= d/dt [r·cos(<span className="hi-gld">ω</span>t)]·î + d/dt [r·sin(<span className="hi-gld">ω</span>t)]·ĵ</span>
            <span className="step-desc">linearidade</span>
          </div>
          <div className="derivation-step">
            <span className="step-num">③</span>
            <span className="step-eq">= −r<span className="hi-gld">ω</span>·sin(<span className="hi-gld">ω</span>t)·î + r<span className="hi-gld">ω</span>·cos(<span className="hi-gld">ω</span>t)·ĵ</span>
            <span className="step-desc">regra da cadeia</span>
          </div>
          <div className="derivation-step">
            <span className="step-num">④</span>
            <span className="step-eq">|<span className="hi-grn">v⃗</span>| = r<span className="hi-gld">ω</span> = v</span>
            <span className="step-desc">módulo constante → cos²+sin²=1</span>
          </div>
        </div>
        <p className="calc-p">
          O vetor velocidade é <strong>perpendicular</strong> ao vetor posição: <em>r⃗</em> · <em>v⃗</em> = 0 (pode ser verificado por produto escalar).
          Isso confirma que a velocidade é sempre tangente à trajetória.
        </p>
      </div>

      {/* ── 3. Segunda Derivada → Aceleração ── */}
      <div className="calc-section">
        <div className="calc-h2">3. Segunda Derivada → Aceleração Centrípeta</div>
        <p className="calc-p">
          A aceleração é a derivada da velocidade. Derivando <em>v⃗</em> uma segunda vez:
        </p>
        <div className="big-eq">
          <div className="derivation-step">
            <span className="step-num">①</span>
            <span className="step-eq"><span className="hi-red">a⃗</span>(t) = d<span className="hi-grn">v⃗</span>/dt = d²<span className="hi-acc">r⃗</span>/dt²</span>
            <span className="step-desc">definição</span>
          </div>
          <div className="derivation-step">
            <span className="step-num">②</span>
            <span className="step-eq">= −r<span className="hi-gld">ω</span>²·cos(<span className="hi-gld">ω</span>t)·î − r<span className="hi-gld">ω</span>²·sin(<span className="hi-gld">ω</span>t)·ĵ</span>
            <span className="step-desc">d/dt de v⃗</span>
          </div>
          <div className="derivation-step">
            <span className="step-num">③</span>
            <span className="step-eq">= −<span className="hi-gld">ω</span>² · [r·cos(ωt)·î + r·sin(ωt)·ĵ]</span>
            <span className="step-desc">fatoração</span>
          </div>
          <div className="derivation-step">
            <span className="step-num">④</span>
            <span className="step-eq"><span className="hi-red">a⃗</span> = −<span className="hi-gld">ω</span>² · <span className="hi-acc">r⃗</span></span>
            <span className="step-desc cmt">← aponta para o centro!</span>
          </div>
          <div className="derivation-step">
            <span className="step-num">⑤</span>
            <span className="step-eq">|<span className="hi-red">a⃗</span>| = <span className="hi-gld">ω</span>²·r = v²/r</span>
            <span className="step-desc">módulo da aceleração centrípeta</span>
          </div>
        </div>
      </div>

      {/* ── 4. Integral → Deslocamento angular ── */}
      <div className="calc-section">
        <div className="calc-h2">4. Integral → Ângulo e Posição a partir de ω(t)</div>
        <p className="calc-p">
          No caso mais geral, a velocidade angular pode variar no tempo. O ângulo percorrido é obtido
          pela integral de ω(t):
        </p>
        <div className="big-eq">
          θ(t) = θ₀ + <span className="hi-pur">∫</span><sub>0</sub><sup>t</sup> <span className="hi-gld">ω</span>(t') dt'
        </div>
        <p className="calc-p">
          Para o MCUV (aceleração angular α constante): ω(t) = ω₀ + α·t
        </p>
        <div className="big-eq">
          <div className="derivation-step">
            <span className="step-num">①</span>
            <span className="step-eq">θ(t) = ∫(ω₀ + αt) dt = ω₀t + ½αt² + C</span>
            <span className="step-desc">integral direta</span>
          </div>
          <div className="derivation-step">
            <span className="step-num">②</span>
            <span className="step-eq">ω²(t) = ω₀² + 2α·Δθ</span>
            <span className="step-desc">eliminando t</span>
          </div>
          <div className="derivation-step">
            <span className="step-num">③</span>
            <span className="step-eq">v(t) = r·ω(t),   a_t = r·α  (tangencial)</span>
            <span className="step-desc">relação com grandezas lineares</span>
          </div>
        </div>
      </div>

      {/* ── 5. Energia e Trabalho ── */}
      <div className="calc-section">
        <div className="calc-h2">5. Energia Cinética e Trabalho no MCU</div>
        <p className="calc-p">
          No MCU a força centrípeta é sempre perpendicular ao deslocamento — portanto ela <strong>não realiza trabalho</strong>:
        </p>
        <div className="big-eq">
          W_c = <span className="hi-pur">∫</span> <span className="hi-acc">F⃗</span>_c · d<span className="hi-acc">r⃗</span> = 0
          <br/>
          <span className="cmt">// F⃗_c ⊥ v⃗  →  F⃗_c · v⃗ = 0  em todo instante</span>
        </div>
        <p className="calc-p">
          A energia cinética permanece constante:
        </p>
        <div className="big-eq">
          E_k = ½·m·v² = ½·m·(ωr)² = ½·m·ω²·r²  =  constante
        </div>
      </div>

      {/* ── 6. Pêndulo cônico ── */}
      <div className="calc-section">
        <div className="calc-h2">6. Pêndulo Cônico — Derivação Completa</div>
        <p className="calc-p">
          No experimento do pêndulo cônico, a tensão T no fio deve satisfazer simultaneamente
          o equilíbrio vertical e fornecer a força centrípeta horizontal:
        </p>
        <div className="big-eq">
          <div className="derivation-step">
            <span className="step-num">y</span>
            <span className="step-eq">T·cos(θ) = m·g  →  T = mg/cos(θ)</span>
            <span className="step-desc">equilíbrio vertical</span>
          </div>
          <div className="derivation-step">
            <span className="step-num">x</span>
            <span className="step-eq">T·sin(θ) = m·ω²·r  (centrípeta)</span>
            <span className="step-desc">2ª Lei Newton radial</span>
          </div>
          <div className="derivation-step">
            <span className="step-num">③</span>
            <span className="step-eq">(mg/cos θ)·sin θ = m·ω²·r</span>
            <span className="step-desc">substituição de T</span>
          </div>
          <div className="derivation-step">
            <span className="step-num">④</span>
            <span className="step-eq">g·tan(θ) = ω²·r = ω²·L·sin(θ)</span>
            <span className="step-desc">r = L·sin θ</span>
          </div>
          <div className="derivation-step">
            <span className="step-num">⑤</span>
            <span className="step-eq">g / (L·cos θ) = ω²  →  ω = √(g/h)</span>
            <span className="step-desc">h = L·cos θ  ← resultado!</span>
          </div>
        </div>
        <p className="calc-p">
          Observe que <em>ω independe da massa</em> — apenas da geometria do sistema (comprimento e ângulo do fio).
          Quanto maior o ângulo θ, menor h, e portanto maior ω necessário para o equilíbrio.
        </p>
      </div>

      {/* ── 7. Referencial não-inercial ── */}
      <div className="calc-section">
        <div className="calc-h2">7. Referencial Não-Inercial — Força Centrífuga</div>
        <p className="calc-p">
          No referencial <em>co-rotativo</em> com a partícula, ela está em repouso.
          Nesse referencial aparece a <strong>força centrífuga fictícia</strong>:
        </p>
        <div className="big-eq">
          <span className="hi-red">F⃗</span>_cf = +m·ω²·r·r̂  <span className="cmt">// aponta para fora do centro</span>
          <br/>
          Equilíbrio no referencial rotativo:<br/>
          <span className="hi-red">F⃗</span>_cf + <span className="hi-acc">F⃗</span>_c = 0
          <br/>
          m·ω²·r − m·ω²·r = 0  ✓
        </div>
        <p className="calc-p">
          A força centrífuga é apenas uma consequência matemática da mudança de referencial;
          ela não é uma força real (não tem par de reação na 3ª Lei de Newton).
        </p>
      </div>

    </div>
  );
}