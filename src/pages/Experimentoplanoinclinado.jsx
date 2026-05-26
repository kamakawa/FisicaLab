// ExperimentoPlanoInclinado.jsx — redesign completo
// Animação via requestAnimationFrame + canvas com DPI correto
import React, { useState, useEffect, useRef, useCallback } from 'react';

// ─── constantes ───────────────────────────────────────────────────────────────
const G = 9.81;
const toRad = d => (d * Math.PI) / 180;
const toDeg = r => (r * 180) / Math.PI;

// ─── hook: canvas com DPI correto ─────────────────────────────────────────────
function useHiDpiCanvas(w, h) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ratio = window.devicePixelRatio || 1;
    c.width  = w * ratio;
    c.height = h * ratio;
    c.style.width  = w + 'px';
    c.style.height = h + 'px';
    const ctx = c.getContext('2d');
    ctx.scale(ratio, ratio);
  }, [w, h]);
  return ref;
}

// ─── tokens de design ─────────────────────────────────────────────────────────
const T = {
  bg:      '#0B0C10',
  card:    '#1F2833',
  neon:    '#66FCF1',
  emerald: '#45A29E',
  amber:   '#F5A623',
  rose:    '#FF6B9D',
  white:   '#C5C6C7',
  muted:   '#4A5568',
  border:  'rgba(102,252,241,0.12)',
};

// ─────────────────────────────────────────────────────────────────────────────
// ATOMS
// ─────────────────────────────────────────────────────────────────────────────

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&family=Inter:wght@300;400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .pie-root {
    min-height: 100vh;
    background: ${T.bg};
    color: ${T.white};
    font-family: 'Inter', sans-serif;
    padding: 28px 32px 48px;
  }

  /* scrollbar */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: ${T.card}; }
  ::-webkit-scrollbar-thumb { background: ${T.emerald}; border-radius: 2px; }

  /* sliders */
  input[type=range] { -webkit-appearance: none; width: 100%; background: transparent; cursor: pointer; }
  input[type=range]:focus { outline: none; }
  input[type=range]::-webkit-slider-runnable-track {
    height: 3px; background: rgba(255,255,255,0.08); border-radius: 3px;
  }
  input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none; width: 14px; height: 14px;
    border-radius: 50%; margin-top: -5.5px; cursor: pointer;
    transition: box-shadow .15s;
  }
  input[type=range]::-webkit-slider-thumb:hover { box-shadow: 0 0 0 4px rgba(102,252,241,.15); }

  /* tab */
  .tab-strip { display: flex; gap: 4px; border-bottom: 1px solid ${T.border}; padding-bottom: 8px; margin-bottom: 16px; }
  .tab-btn {
    font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 1.5px;
    padding: 6px 16px; border-radius: 4px; border: none; background: transparent;
    cursor: pointer; transition: all .2s; color: ${T.muted};
  }
  .tab-btn.active { color: var(--tc); background: color-mix(in srgb, var(--tc) 12%, transparent); }
  .tab-btn:hover:not(.active) { color: ${T.white}; }

  /* experiment selector */
  .exp-selector { display: flex; gap: 8px; margin-bottom: 28px; flex-wrap: wrap; }
  .exp-btn {
    font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 1.5px;
    padding: 8px 20px; border-radius: 20px; border: 1px solid ${T.border};
    background: transparent; color: ${T.muted}; cursor: pointer; transition: all .2s;
  }
  .exp-btn.active { border-color: var(--tc); color: var(--tc); background: color-mix(in srgb, var(--tc) 10%, transparent); }

  /* layout */
  .sim-grid { display: grid; grid-template-columns: 260px 1fr; gap: 20px; align-items: start; }
  .panel { background: ${T.card}; border: 1px solid ${T.border}; border-radius: 10px; padding: 20px; }
  .canvas-panel { background: ${T.card}; border: 1px solid ${T.border}; border-radius: 10px; padding: 20px; }

  /* metrics */
  .metrics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 16px; }
  .metric {
    background: rgba(0,0,0,.25); border-radius: 6px; padding: 10px 12px;
    border-left: 2px solid var(--mc);
  }
  .metric-label { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 1.5px; color: ${T.muted}; }
  .metric-val { font-family: 'Share Tech Mono', monospace; font-size: 17px; font-weight: 700; color: var(--mc); line-height: 1.2; margin-top: 2px; }
  .metric-unit { font-size: 10px; opacity: .6; }

  /* status badge */
  .status {
    margin-top: 14px; padding: 10px; border-radius: 6px; text-align: center;
    font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 1.5px;
    border: 1px solid; transition: all .3s;
  }

  /* ctrl buttons */
  .ctrl-row { display: flex; gap: 8px; margin-top: 14px; }
  .ctrl-btn {
    flex: 1; padding: 8px 6px; border-radius: 6px; border: 1px solid ${T.border};
    background: transparent; color: ${T.white}; cursor: pointer; font-size: 12px;
    font-family: 'Share Tech Mono', monospace; transition: all .2s; letter-spacing: 1px;
  }
  .ctrl-btn:hover { border-color: ${T.neon}; color: ${T.neon}; }
  .ctrl-btn.active { border-color: ${T.neon}; color: ${T.neon}; background: rgba(102,252,241,.08); }
  .ctrl-btn.primary { background: ${T.neon}; color: ${T.bg}; border-color: ${T.neon}; font-weight: 700; }
  .ctrl-btn.primary:hover { box-shadow: 0 0 20px rgba(102,252,241,.3); }
  .ctrl-btn:disabled { opacity: .35; cursor: not-allowed; }

  /* formula card */
  .formula-card {
    border-left: 2px solid var(--fc); border-radius: 0 6px 6px 0;
    background: rgba(0,0,0,.2); padding: 14px 16px; margin-bottom: 12px;
  }
  .formula-title { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 2px; color: var(--fc); margin-bottom: 8px; }
  .formula-body { font-family: 'Share Tech Mono', monospace; font-size: 12px; color: ${T.white}; line-height: 1.7; opacity: .85; }

  /* header */
  .pie-header { margin-bottom: 28px; }
  .pie-title {
    font-family: 'Orbitron', monospace; font-size: 22px; font-weight: 900;
    background: linear-gradient(90deg, ${T.neon}, ${T.emerald});
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    letter-spacing: 2px;
  }
  .pie-subtitle { font-family: 'Share Tech Mono', monospace; font-size: 11px; color: ${T.muted}; margin-top: 4px; letter-spacing: 1px; }

  /* canvas wrapper */
  .canvas-wrap { position: relative; border-radius: 8px; overflow: hidden; background: rgba(0,0,0,.3); }
  canvas { display: block; }

  /* theory scroll */
  .theory-scroll { max-height: 440px; overflow-y: auto; padding-right: 4px; }

  /* responsive */
  @media (max-width: 700px) {
    .sim-grid { grid-template-columns: 1fr; }
    .pie-root { padding: 16px; }
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// Slider
// ─────────────────────────────────────────────────────────────────────────────
const Slider = ({ label, value, onChange, min, max, step, unit, color = T.neon }) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
      <span style={{ fontSize: 11, color: T.muted, fontFamily: "'Share Tech Mono',monospace", letterSpacing: 1 }}>{label}</span>
      <span style={{ fontSize: 13, color, fontFamily: "'Share Tech Mono',monospace", fontWeight: 700 }}>
        {typeof value === 'number' ? (Number.isInteger(step) ? value : value.toFixed(2)) : value}{unit}
      </span>
    </div>
    <input
      type="range" min={min} max={max} step={step} value={value}
      onChange={e => onChange(parseFloat(e.target.value))}
      style={{ '--thumb-color': color }}
    />
    <style>{`input[type=range][style*="${color}"]::-webkit-slider-thumb { background: ${color}; }`}</style>
  </div>
);

const Metric = ({ label, value, unit, color = T.neon }) => (
  <div className="metric" style={{ '--mc': color }}>
    <div className="metric-label">{label}</div>
    <div className="metric-val">{value} <span className="metric-unit">{unit}</span></div>
  </div>
);

const Tab = ({ active, onClick, children, color = T.neon }) => (
  <button className={`tab-btn ${active ? 'active' : ''}`} style={{ '--tc': color }} onClick={onClick}>
    {children}
  </button>
);

const FormulaCard = ({ title, children, color = T.neon }) => (
  <div className="formula-card" style={{ '--fc': color }}>
    <div className="formula-title">{title}</div>
    <div className="formula-body">{children}</div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// drawArrow — helper canvas
// ─────────────────────────────────────────────────────────────────────────────
function drawArrow(ctx, ox, oy, angle, length, color, label, glowStrength = 10) {
  if (length < 4) return;
  const ex = ox + length * Math.cos(angle);
  const ey = oy + length * Math.sin(angle);

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle   = color;
  ctx.lineWidth   = 2;
  ctx.shadowColor = color;
  ctx.shadowBlur  = glowStrength;

  ctx.beginPath();
  ctx.moveTo(ox, oy);
  ctx.lineTo(ex, ey);
  ctx.stroke();

  const a = Math.atan2(ey - oy, ex - ox);
  ctx.beginPath();
  ctx.moveTo(ex, ey);
  ctx.lineTo(ex - 10 * Math.cos(a - 0.42), ey - 10 * Math.sin(a - 0.42));
  ctx.lineTo(ex - 10 * Math.cos(a + 0.42), ey - 10 * Math.sin(a + 0.42));
  ctx.closePath();
  ctx.fill();

  if (label) {
    ctx.shadowBlur = 0;
    ctx.font = 'bold 10px "Share Tech Mono", monospace';
    ctx.fillText(label, ex + 12 * Math.cos(a), ey + 12 * Math.sin(a));
  }
  ctx.restore();
}

// ─────────────────────────────────────────────────────────────────────────────
// drawIncline — shared ramp geometry
// ─────────────────────────────────────────────────────────────────────────────
function drawIncline(ctx, W, H, theta, rampColor = T.neon) {
  const tR = toRad(theta);
  const bX = 44, bY = H - 48;
  const len = W - 80;
  const tX  = bX + len * Math.cos(tR);
  const tY  = bY - len * Math.sin(tR);

  // filled ramp
  ctx.beginPath();
  ctx.moveTo(bX, bY);
  ctx.lineTo(tX, tY);
  ctx.lineTo(tX, bY);
  ctx.closePath();
  ctx.fillStyle = `color-mix(in srgb, ${rampColor} 5%, transparent)`;
  ctx.fill();

  // ramp surface
  ctx.beginPath();
  ctx.moveTo(bX, bY);
  ctx.lineTo(tX, tY);
  ctx.strokeStyle = rampColor;
  ctx.lineWidth   = 2.5;
  ctx.shadowColor = rampColor;
  ctx.shadowBlur  = 8;
  ctx.stroke();
  ctx.shadowBlur  = 0;

  // ground line
  ctx.beginPath();
  ctx.moveTo(bX, bY);
  ctx.lineTo(tX, bY);
  ctx.strokeStyle = 'rgba(255,255,255,.12)';
  ctx.lineWidth   = 1;
  ctx.stroke();

  // angle arc
  ctx.beginPath();
  ctx.arc(bX, bY, 38, -tR, 0);
  ctx.strokeStyle = T.amber;
  ctx.lineWidth   = 1.5;
  ctx.shadowColor = T.amber;
  ctx.shadowBlur  = 6;
  ctx.stroke();
  ctx.shadowBlur  = 0;

  ctx.fillStyle = T.amber;
  ctx.font = 'bold 11px "Share Tech Mono", monospace';
  ctx.fillText(`${theta}°`, bX + 46, bY - 12);

  return { bX, bY, tX, tY, len, tR };
}

// ─────────────────────────────────────────────────────────────────────────────
// drawBlock
// ─────────────────────────────────────────────────────────────────────────────
function drawBlock(ctx, cx, cy, tR, label, color = T.neon, glowing = false) {
  const bW = 44, bH = 34;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-tR);

  // glow shell when moving
  if (glowing) {
    ctx.shadowColor = color;
    ctx.shadowBlur  = 22;
  }

  // body
  ctx.beginPath();
  ctx.roundRect(-bW / 2, -bH, bW, bH, 6);
  ctx.fillStyle   = `color-mix(in srgb, ${color} 18%, transparent)`;
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth   = glowing ? 2 : 1.5;
  ctx.stroke();
  ctx.shadowBlur  = 0;

  // friction texture at base
  ctx.strokeStyle = `color-mix(in srgb, ${color} 30%, transparent)`;
  ctx.lineWidth   = 0.8;
  for (let i = -18; i <= 18; i += 7) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + 4, -6); ctx.stroke();
  }

  // label
  ctx.fillStyle  = color;
  ctx.font       = 'bold 10px "Share Tech Mono", monospace';
  ctx.textAlign  = 'center';
  ctx.fillText(label, 0, -bH / 2 + 5);
  ctx.restore();
}

// ─────────────────────────────────────────────────────────────────────────────
// CANVAS 1 — Bloco simples  (usa requestAnimationFrame internamente)
// ─────────────────────────────────────────────────────────────────────────────
const CW = 520, CH = 340;

const PlanoCanvas = ({ theta, mu, massa, showVetores, running, onReset }) => {
  const canvasRef = useHiDpiCanvas(CW, CH);
  const posRef    = useRef(0);
  const velRef    = useRef(0);
  const trailRef  = useRef([]);
  const rafRef    = useRef(null);
  const prevT     = useRef(null);

  // reset when params change
  useEffect(() => {
    posRef.current   = 0;
    velRef.current   = 0;
    trailRef.current = [];
  }, [theta, mu, massa]);

  const draw = useCallback((pos) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CW, CH);

    const tR  = toRad(theta);
    const { bX, bY, len, tX, tY } = drawIncline(ctx, CW, CH, theta);

    const bx = bX + len * pos * Math.cos(tR);
    const by = bY - len * pos * Math.sin(tR);

    // trail
    const trail = trailRef.current;
    trail.forEach((p, i) => {
      const alpha = (i / trail.length) * 0.25;
      const tx = bX + len * p * Math.cos(tR);
      const ty = bY - len * p * Math.sin(tR);
      ctx.beginPath();
      ctx.arc(tx, ty, 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(102,252,241,${alpha})`;
      ctx.fill();
    });

    const emMov = (massa * G * Math.sin(tR)) > (mu * massa * G * Math.cos(tR));
    drawBlock(ctx, bx, by, tR, `${massa} kg`, T.neon, emMov && running);

    if (!showVetores) return;
    const P  = massa * G;
    const N  = massa * G * Math.cos(tR);
    const Px = massa * G * Math.sin(tR);
    const Fa = mu * N;

    const S = 0.45;
    drawArrow(ctx, bx, by - 8, Math.PI / 2,       Math.min(80, P  * S), T.rose,    `P=${P.toFixed(0)}N`);
    drawArrow(ctx, bx, by - 8, -(Math.PI/2)+tR,   Math.min(80, N  * S), T.emerald, `N=${N.toFixed(0)}N`);
    drawArrow(ctx, bx, by - 8, Math.PI - tR,       Math.min(80, Px * S), T.amber,   `P∥=${Px.toFixed(0)}N`);

    if (Fa > 0.5) {
      const angF = Px > Fa ? tR : tR + Math.PI;
      drawArrow(ctx, bx, by - 8, angF, Math.min(80, Fa * S), '#FF8C00', `f=${Fa.toFixed(0)}N`);
    }
  }, [theta, mu, massa, showVetores, running]);

  useEffect(() => {
    if (!running) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      prevT.current = null;
      draw(posRef.current);
      return;
    }
    const tR  = toRad(theta);
    const a   = Math.max(0, G * (Math.sin(tR) - mu * Math.cos(tR)));
    if (a < 0.001) { draw(posRef.current); return; }

    const step = (ts) => {
      if (!prevT.current) prevT.current = ts;
      const dt = Math.min((ts - prevT.current) / 1000, 0.03);
      prevT.current = ts;

      // physics step
      velRef.current += a * dt;
      posRef.current  = Math.min(0.92, posRef.current + velRef.current * dt / (len => len)(CW - 80) * 1.8);

      if (posRef.current >= 0.92) {
        posRef.current = 0.92;
        draw(0.92);
        onReset?.();
        return;
      }
      // trail
      trailRef.current.push(posRef.current);
      if (trailRef.current.length > 28) trailRef.current.shift();

      draw(posRef.current);
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running, theta, mu, draw, onReset]);

  // initial draw
  useEffect(() => { if (!running) draw(0); }, [theta, mu, massa, showVetores, draw, running]);

  return (
    <div className="canvas-wrap">
      <canvas ref={canvasRef} />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CANVAS 2 — Dois blocos  (animação contínua)
// ─────────────────────────────────────────────────────────────────────────────
const DoisBlocosCanvas = ({ theta, mu1, mu2, m1, m2, aceleracao }) => {
  const canvasRef = useHiDpiCanvas(CW, CH - 40);
  const posRef    = useRef(0);
  const rafRef    = useRef(null);
  const prevT     = useRef(null);

  useEffect(() => {
    posRef.current = 0;
    prevT.current  = null;
  }, [theta, mu1, mu2, m1, m2]);

  useEffect(() => {
    const W = CW, H = CH - 40;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const step = (ts) => {
      if (!prevT.current) prevT.current = ts;
      const dt = Math.min((ts - prevT.current) / 1000, 0.025);
      prevT.current = ts;

      if (aceleracao > 0.01) {
        posRef.current = (posRef.current + dt * 0.04) % 1;
      }

      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, W, H);

      const { bX, bY, len, tR } = drawIncline(ctx, W, H, theta, T.rose);

      const p1 = (0.25 + posRef.current * 0.5) % 0.9;
      const p2 = (0.55 + posRef.current * 0.5) % 0.9;

      const b1x = bX + len * p1 * Math.cos(tR);
      const b1y = bY - len * p1 * Math.sin(tR);
      const b2x = bX + len * p2 * Math.cos(tR);
      const b2y = bY - len * p2 * Math.sin(tR);

      // rope
      ctx.beginPath();
      ctx.moveTo(b1x + 22 * Math.cos(tR), b1y - 22 * Math.sin(tR));
      ctx.lineTo(b2x - 22 * Math.cos(tR), b2y + 22 * Math.sin(tR));
      ctx.strokeStyle = T.amber;
      ctx.lineWidth   = 1.5;
      ctx.shadowColor = T.amber;
      ctx.shadowBlur  = 6;
      ctx.setLineDash([5, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.shadowBlur  = 0;

      drawBlock(ctx, b1x, b1y, tR, `${m1}kg`, T.rose, aceleracao > 0.01);
      drawBlock(ctx, b2x, b2y, tR, `${m2}kg`, T.neon,  aceleracao > 0.01);

      // tension label
      const mx = (b1x + b2x) / 2, my = (b1y + b2y) / 2;
      ctx.fillStyle = T.amber;
      ctx.font      = '10px "Share Tech Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`T = ${Math.abs(aceleracao > 0 ? (m2 * (G * Math.sin(tR) - mu2 * G * Math.cos(tR) - aceleracao)) : 0).toFixed(1)} N`, mx, my - 16);

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [theta, mu1, mu2, m1, m2, aceleracao]);

  return <div className="canvas-wrap"><canvas ref={canvasRef} /></div>;
};

// ─────────────────────────────────────────────────────────────────────────────
// CANVAS 3 — Ângulo crítico  (reactive, no animation loop needed)
// ─────────────────────────────────────────────────────────────────────────────
const AnguloCriticoCanvas = ({ theta, thetaCritico, estado }) => {
  const W = CW, H = CH - 40;
  const canvasRef = useHiDpiCanvas(W, H);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, W, H);

    const stateColor = { repouso: T.emerald, iminente: T.amber, deslizando: T.rose };
    const color = stateColor[estado] || T.neon;

    const { bX, bY, len, tR } = drawIncline(ctx, W, H, theta, color);

    // critical angle overlay
    const tCR = toRad(thetaCritico);
    const cX  = bX + len * Math.cos(tCR);
    const cY  = bY - len * Math.sin(tCR);
    ctx.beginPath();
    ctx.moveTo(bX, bY);
    ctx.lineTo(cX, cY);
    ctx.strokeStyle = T.amber;
    ctx.lineWidth   = 1;
    ctx.setLineDash([6, 5]);
    ctx.globalAlpha = 0.4;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;

    ctx.beginPath();
    ctx.arc(bX, bY, 52, -tCR, 0);
    ctx.strokeStyle = T.amber;
    ctx.lineWidth   = 1.2;
    ctx.shadowColor = T.amber;
    ctx.shadowBlur  = 5;
    ctx.stroke();
    ctx.shadowBlur  = 0;
    ctx.fillStyle   = T.amber;
    ctx.font        = '9px "Share Tech Mono", monospace';
    ctx.fillText(`θc = ${thetaCritico.toFixed(1)}°`, bX + 60, bY - 26);

    const bx = bX + len * 0.5 * Math.cos(tR);
    const by = bY - len * 0.5 * Math.sin(tR);
    drawBlock(ctx, bx, by, tR, estado.toUpperCase(), color, estado !== 'repouso');

    // status banner
    const banners = { repouso: '✓ EQUILÍBRIO ESTÁTICO', iminente: '⚠ IMINÊNCIA DE DESLIZAMENTO', deslizando: '▶ BLOCO DESLIZANDO' };
    ctx.fillStyle   = color;
    ctx.shadowColor = color;
    ctx.shadowBlur  = 12;
    ctx.font        = 'bold 12px "Share Tech Mono", monospace';
    ctx.textAlign   = 'center';
    ctx.fillText(banners[estado], W / 2, 26);
    ctx.shadowBlur  = 0;
  }, [theta, thetaCritico, estado]);

  return <div className="canvas-wrap"><canvas ref={canvasRef} /></div>;
};

// ─────────────────────────────────────────────────────────────────────────────
// CHART — mini sparkline
// ─────────────────────────────────────────────────────────────────────────────
const MiniChart = ({ data, xLabel, yLabel, color = T.neon, highlight }) => {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    if (!c || !data.length) return;
    const ratio = window.devicePixelRatio || 1;
    const w = 460, h = 160;
    c.width  = w * ratio; c.height = h * ratio;
    c.style.width = w + 'px'; c.style.height = h + 'px';
    const ctx = c.getContext('2d');
    ctx.scale(ratio, ratio);

    const pad = { l: 46, r: 20, t: 16, b: 36 };
    const gW  = w - pad.l - pad.r;
    const gH  = h - pad.t - pad.b;

    const xs = data.map(d => d.x), ys = data.map(d => d.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(0, ...ys), maxY = Math.max(...ys) || 1;

    const px = x => pad.l + ((x - minX) / (maxX - minX)) * gW;
    const py = y => h - pad.b - ((y - minY) / (maxY - minY)) * gH;

    // grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth   = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad.t + i * gH / 4;
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke();
    }

    // area fill
    const grad = ctx.createLinearGradient(0, pad.t, 0, h - pad.b);
    grad.addColorStop(0, `${color}28`);
    grad.addColorStop(1, `${color}00`);
    ctx.beginPath();
    data.forEach((d, i) => i === 0 ? ctx.moveTo(px(d.x), py(d.y)) : ctx.lineTo(px(d.x), py(d.y)));
    ctx.lineTo(px(data[data.length-1].x), py(0));
    ctx.lineTo(px(data[0].x), py(0));
    ctx.fillStyle = grad;
    ctx.fill();

    // line
    ctx.beginPath();
    data.forEach((d, i) => i === 0 ? ctx.moveTo(px(d.x), py(d.y)) : ctx.lineTo(px(d.x), py(d.y)));
    ctx.strokeStyle = color;
    ctx.lineWidth   = 2;
    ctx.shadowColor = color;
    ctx.shadowBlur  = 8;
    ctx.stroke();
    ctx.shadowBlur  = 0;

    // highlight marker
    if (highlight !== undefined) {
      const hd = data.find(d => Math.abs(d.x - highlight) < 0.6) || data[Math.round(highlight)];
      if (hd) {
        ctx.beginPath();
        ctx.arc(px(hd.x), py(hd.y), 5, 0, Math.PI * 2);
        ctx.fillStyle   = color;
        ctx.shadowColor = color;
        ctx.shadowBlur  = 16;
        ctx.fill();
        ctx.shadowBlur  = 0;
      }
    }

    // axes labels
    ctx.fillStyle = T.muted;
    ctx.font      = '10px "Share Tech Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(xLabel, w / 2, h - 4);
    ctx.save(); ctx.translate(11, h / 2); ctx.rotate(-Math.PI / 2);
    ctx.fillText(yLabel, 0, 0); ctx.restore();

    // y ticks
    ctx.textAlign = 'right';
    [minY, (minY + maxY) / 2, maxY].forEach(v => {
      ctx.fillText(v.toFixed(1), pad.l - 6, py(v) + 3);
    });
  }, [data, color, highlight, xLabel, yLabel]);
  return <canvas ref={ref} style={{ borderRadius: 6, maxWidth: '100%' }} />;
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPERIMENTO 1 — Bloco Simples
// ─────────────────────────────────────────────────────────────────────────────
const ExpBlocoSimples = () => {
  const [theta,       setTheta]       = useState(30);
  const [mu,          setMu]          = useState(0.25);
  const [massa,       setMassa]       = useState(5);
  const [showVetores, setShowVetores] = useState(true);
  const [running,     setRunning]     = useState(false);
  const [aba,         setAba]         = useState('sim');

  const tR  = toRad(theta);
  const N   = massa * G * Math.cos(tR);
  const Px  = massa * G * Math.sin(tR);
  const Fat = mu * N;
  const acc = Math.max(0, (Px - Fat) / massa);
  const mov = Px > Fat;

  const chartData = Array.from({ length: 90 }, (_, i) => ({
    x: i, y: Math.max(0, G * (Math.sin(toRad(i)) - mu * Math.cos(toRad(i)))),
  }));

  const handleReset = useCallback(() => setRunning(false), []);
  const resetAll    = () => { setRunning(false); };

  return (
    <div className="sim-grid">
      {/* ── painel esquerdo ── */}
      <div className="panel">
        <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 10, letterSpacing: 2, color: T.neon, marginBottom: 18 }}>PARÂMETROS</div>

        <Slider label="Ângulo θ"    value={theta} onChange={v => { setTheta(v); resetAll(); }} min={1} max={85} step={1}    unit="°"   color={T.amber}   />
        <Slider label="Coef. atrito μ" value={mu} onChange={v => { setMu(v);    resetAll(); }} min={0} max={0.9} step={0.01} unit=""    color="#FF8C00"   />
        <Slider label="Massa m"    value={massa} onChange={v => { setMassa(v);  resetAll(); }} min={1} max={30}  step={0.5}  unit=" kg" color={T.neon}    />

        <div className="ctrl-row">
          <button className={`ctrl-btn ${showVetores ? 'active' : ''}`} onClick={() => setShowVetores(v => !v)}>
            {showVetores ? '◉ VET ON' : '○ VET OFF'}
          </button>
          <button
            className={`ctrl-btn ${running ? '' : 'primary'}`}
            disabled={!mov}
            onClick={() => setRunning(r => !r)}
          >
            {running ? '⏸ PAUSA' : '▶ PLAY'}
          </button>
          <button className="ctrl-btn" onClick={resetAll} style={{ flex: '0 0 36px' }}>↺</button>
        </div>

        <div className="metrics-grid">
          <Metric label="ACELERAÇÃO" value={acc.toFixed(3)} unit="m/s²" color={mov ? T.neon : T.muted} />
          <Metric label="NORMAL N"   value={N.toFixed(1)}   unit="N"    color={T.emerald} />
          <Metric label="P∥"         value={Px.toFixed(1)}  unit="N"    color={T.amber}   />
          <Metric label="ATRITO f"   value={Fat.toFixed(1)} unit="N"    color="#FF8C00"   />
        </div>

        <div className="status" style={{
          color: mov ? T.neon : T.rose,
          borderColor: mov ? `${T.neon}33` : `${T.rose}33`,
          background: mov ? `${T.neon}0a` : `${T.rose}0a`,
        }}>
          {mov ? `▶ DESLIZANDO  a = ${acc.toFixed(3)} m/s²` : '■ EQUILÍBRIO ESTÁTICO'}
        </div>
      </div>

      {/* ── área principal ── */}
      <div className="canvas-panel">
        <div className="tab-strip">
          <Tab active={aba==='sim'}    onClick={() => setAba('sim')}    color={T.neon}>SIMULAÇÃO</Tab>
          <Tab active={aba==='teoria'} onClick={() => setAba('teoria')} color={T.amber}>TEORIA</Tab>
          <Tab active={aba==='graf'}   onClick={() => setAba('graf')}   color={T.emerald}>GRÁFICO</Tab>
        </div>

        {aba === 'sim' && (
          <PlanoCanvas theta={theta} mu={mu} massa={massa} showVetores={showVetores} running={running} onReset={handleReset} />
        )}

        {aba === 'teoria' && (
          <div className="theory-scroll">
            <FormulaCard title="DECOMPOSIÇÃO DO PESO" color={T.amber}>
              P∥ = m·g·sen θ = {Px.toFixed(2)} N{'\n'}
              P⊥ = m·g·cos θ = {N.toFixed(2)} N{'\n\n'}
              A componente P∥ tende a deslizar o bloco;{'\n'}
              P⊥ comprime a superfície gerando N.
            </FormulaCard>
            <FormulaCard title="FORÇA NORMAL" color={T.emerald}>
              Equilíbrio perpendicular → N = P⊥ = {N.toFixed(2)} N{'\n\n'}
              Para θ = {theta}° e m = {massa} kg:{'\n'}
              N = {massa}·9,81·cos({theta}°) = {N.toFixed(2)} N
            </FormulaCard>
            <FormulaCard title="ACELERAÇÃO RESULTANTE" color={T.neon}>
              a = g·(sen θ − μ·cos θ){'\n'}
              a = 9,81·(sen{theta}° − {mu}·cos{theta}°){'\n'}
              a = {acc.toFixed(4)} m/s²{'\n\n'}
              {mov ? '▶ Bloco em movimento.' : '■ Atrito suficiente para manter equilíbrio.'}
            </FormulaCard>
          </div>
        )}

        {aba === 'graf' && (
          <>
            <MiniChart data={chartData} xLabel="ângulo θ (°)" yLabel="a (m/s²)" color={T.neon} highlight={theta} />
            <div style={{ marginTop: 10, fontSize: 11, color: T.muted, fontFamily: "'Share Tech Mono',monospace", lineHeight: 1.6 }}>
              Ponto atual θ = {theta}° → a = {acc.toFixed(3)} m/s²{'\n'}
              Ângulo crítico: arctan({mu}) = {toDeg(Math.atan(mu)).toFixed(1)}°
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPERIMENTO 2 — Dois Blocos
// ─────────────────────────────────────────────────────────────────────────────
const ExpDoisBlocos = () => {
  const [theta, setTheta] = useState(35);
  const [m1,  setM1]  = useState(4);
  const [m2,  setM2]  = useState(3);
  const [mu1, setMu1] = useState(0.2);
  const [mu2, setMu2] = useState(0.3);
  const [aba, setAba] = useState('sim');

  const tR  = toRad(theta);
  const mt  = m1 + m2;
  const Fat = (mu1 * m1 + mu2 * m2) * G * Math.cos(tR);
  const Px  = mt * G * Math.sin(tR);
  const acc = Math.max(0, (Px - Fat) / mt);
  const T2  = m2 * (G * Math.sin(tR) - mu2 * G * Math.cos(tR) - acc);

  return (
    <div className="sim-grid">
      <div className="panel">
        <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 10, letterSpacing: 2, color: T.rose, marginBottom: 18 }}>PARÂMETROS</div>
        <Slider label="Ângulo θ"      value={theta} onChange={setTheta} min={1}   max={85}  step={1}    unit="°"   color={T.amber} />
        <Slider label="Massa m₁"      value={m1}    onChange={setM1}    min={1}   max={20}  step={0.5}  unit=" kg" color={T.rose}  />
        <Slider label="Massa m₂"      value={m2}    onChange={setM2}    min={1}   max={20}  step={0.5}  unit=" kg" color={T.neon}  />
        <Slider label="μ₁ (atrito m₁)" value={mu1}  onChange={setMu1}   min={0}   max={0.9} step={0.01} unit=""    color={T.rose}  />
        <Slider label="μ₂ (atrito m₂)" value={mu2}  onChange={setMu2}   min={0}   max={0.9} step={0.01} unit=""    color={T.neon}  />
        <div className="metrics-grid">
          <Metric label="ACELERAÇÃO"  value={acc.toFixed(3)}       unit="m/s²" color={T.rose}    />
          <Metric label="TRAÇÃO T"    value={Math.abs(T2).toFixed(1)} unit="N"   color={T.amber}   />
          <Metric label="F. MOTORA"   value={Px.toFixed(1)}        unit="N"    color={T.emerald} />
          <Metric label="ATRITO TOT." value={Fat.toFixed(1)}       unit="N"    color="#FF8C00"   />
        </div>
      </div>

      <div className="canvas-panel">
        <div className="tab-strip">
          <Tab active={aba==='sim'}    onClick={() => setAba('sim')}    color={T.rose}>SIMULAÇÃO</Tab>
          <Tab active={aba==='teoria'} onClick={() => setAba('teoria')} color={T.amber}>TEORIA</Tab>
        </div>

        {aba === 'sim' && <DoisBlocosCanvas theta={theta} mu1={mu1} mu2={mu2} m1={m1} m2={m2} aceleracao={acc} />}

        {aba === 'teoria' && (
          <div className="theory-scroll">
            <FormulaCard title="SISTEMA COMPLETO" color={T.amber}>
              (m₁+m₂)·a = (m₁+m₂)·g·sen θ − (μ₁m₁+μ₂m₂)·g·cos θ{'\n\n'}
              a = {acc.toFixed(4)} m/s²
            </FormulaCard>
            <FormulaCard title="TRAÇÃO NO FIO" color={T.rose}>
              Isolando m₂:{'\n'}
              T = m₂·(g·sen θ − μ₂·g·cos θ − a){'\n'}
              T = {Math.abs(T2).toFixed(2)} N
            </FormulaCard>
            <FormulaCard title="OBSERVAÇÃO" color={T.neon}>
              Coeficientes diferentes (μ₁≠μ₂) geram{'\n'}
              tensão interna não-nula no fio mesmo{'\n'}
              quando o sistema está em equilíbrio.
            </FormulaCard>
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPERIMENTO 3 — Ângulo Crítico
// ─────────────────────────────────────────────────────────────────────────────
const ExpAnguloCritico = () => {
  const [theta, setTheta] = useState(20);
  const [muEst, setMuEst] = useState(0.4);
  const [massa, setMassa] = useState(5);
  const [aba,   setAba]   = useState('sim');

  const thetaCrit = toDeg(Math.atan(muEst));
  const diff      = theta - thetaCrit;
  const estado    = diff < -0.5 ? 'repouso' : diff > 0.5 ? 'deslizando' : 'iminente';

  const stateColor = { repouso: T.emerald, iminente: T.amber, deslizando: T.rose };
  const sc = stateColor[estado];

  const dadosForca = Array.from({ length: 90 }, (_, i) => {
    const tr = toRad(i);
    return { x: i, y: massa * G * Math.sin(tr) - muEst * massa * G * Math.cos(tr) };
  });

  return (
    <div className="sim-grid">
      <div className="panel">
        <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 10, letterSpacing: 2, color: T.amber, marginBottom: 18 }}>PARÂMETROS</div>
        <Slider label="Ângulo θ"        value={theta} onChange={setTheta} min={1}    max={89}  step={1}    unit="°"   color={T.amber}   />
        <Slider label="μₛ (estático)"  value={muEst} onChange={setMuEst} min={0.05} max={0.95} step={0.01} unit=""    color="#FF8C00"   />
        <Slider label="Massa m"         value={massa} onChange={setMassa} min={1}    max={30}   step={1}    unit=" kg" color={T.muted}   />

        <div style={{ marginTop: 16, padding: 16, borderRadius: 8, background: `${sc}10`, border: `1px solid ${sc}33`, textAlign: 'center' }}>
          <div style={{ fontSize: 9, color: T.muted, fontFamily: "'Share Tech Mono',monospace", letterSpacing: 2 }}>ÂNGULO CRÍTICO</div>
          <div style={{ fontSize: 34, fontWeight: 900, color: T.amber, fontFamily: "'Orbitron',monospace", marginTop: 4 }}>
            {thetaCrit.toFixed(1)}°
          </div>
          <div style={{ fontSize: 9, color: T.muted, fontFamily: "'Share Tech Mono',monospace" }}>θc = arctan(μₛ)</div>
        </div>

        <div className="status" style={{ color: sc, borderColor: `${sc}33`, background: `${sc}0a`, marginTop: 12 }}>
          {{ repouso: '✓ EM REPOUSO', iminente: '⚠ IMINENTE', deslizando: '▶ DESLIZANDO' }[estado]}
        </div>

        <div className="metrics-grid">
          <Metric label="P∥"          value={(massa * G * Math.sin(toRad(theta))).toFixed(1)} unit="N" color={T.amber}   />
          <Metric label="fₛ MÁX."    value={(muEst * massa * G * Math.cos(toRad(theta))).toFixed(1)} unit="N" color="#FF8C00" />
        </div>
      </div>

      <div className="canvas-panel">
        <div className="tab-strip">
          <Tab active={aba==='sim'}    onClick={() => setAba('sim')}    color={T.amber}>SIMULAÇÃO</Tab>
          <Tab active={aba==='teoria'} onClick={() => setAba('teoria')} color={T.emerald}>TEORIA</Tab>
          <Tab active={aba==='graf'}   onClick={() => setAba('graf')}   color={T.rose}>GRÁFICO</Tab>
        </div>

        {aba === 'sim'    && <AnguloCriticoCanvas theta={theta} thetaCritico={thetaCrit} estado={estado} />}

        {aba === 'teoria' && (
          <div className="theory-scroll">
            <FormulaCard title="CONDIÇÃO DE EQUILÍBRIO" color={T.emerald}>
              fₛ ≥ P∥  →  μₛ·N ≥ m·g·sen θ{'\n'}
              μₛ·m·g·cos θ ≥ m·g·sen θ{'\n'}
              μₛ ≥ tan θ
            </FormulaCard>
            <FormulaCard title="ÂNGULO CRÍTICO" color={T.amber}>
              No limite: μₛ = tan θc{'\n'}
              θc = arctan(μₛ) = arctan({muEst}) = {thetaCrit.toFixed(2)}°{'\n\n'}
              θ {'<'} θc → repouso{'\n'}
              θ = θc → iminência{'\n'}
              θ {'>'} θc → deslizamento
            </FormulaCard>
            <FormulaCard title="INDEPENDÊNCIA DA MASSA" color={T.neon}>
              A massa cancela na expressão final.{'\n'}
              Blocos de qualquer massa com mesmo μₛ{'\n'}
              deslizam no mesmo ângulo crítico.
            </FormulaCard>
          </div>
        )}

        {aba === 'graf' && (
          <>
            <MiniChart data={dadosForca} xLabel="ângulo θ (°)" yLabel="F_res (N)" color={T.rose} highlight={theta} />
            <div style={{ marginTop: 10, fontSize: 11, color: T.muted, fontFamily: "'Share Tech Mono',monospace", lineHeight: 1.6 }}>
              F_res = P∥ − fₛ,máx{'\n'}
              F_res {'<'} 0 → repouso  ·  F_res = 0 → θc  ·  F_res {'>'} 0 → deslizamento
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ROOT
// ─────────────────────────────────────────────────────────────────────────────
export default function ExperimentoPlanoInclinado() {
  const [exp, setExp] = useState('bloco');

  const exps = [
    { id: 'bloco',   label: 'BLOCO NO PLANO',  color: T.neon  },
    { id: 'dois',    label: 'SISTEMA 2 BLOCOS', color: T.rose  },
    { id: 'critico', label: 'ÂNGULO CRÍTICO',   color: T.amber },
  ];

  return (
    <div className="pie-root">
      <style>{css}</style>

      {/* header */}
      <div className="pie-header">
        <div className="pie-title">PLANO INCLINADO</div>
        <div className="pie-subtitle">
          DECOMPOSIÇÃO DE FORÇAS · ATRITO ESTÁTICO E CINÉTICO · ÂNGULO CRÍTICO
        </div>
      </div>

      {/* experiment selector */}
      <div className="exp-selector">
        {exps.map(e => (
          <button
            key={e.id}
            className={`exp-btn ${exp === e.id ? 'active' : ''}`}
            style={{ '--tc': e.color }}
            onClick={() => setExp(e.id)}
          >
            {e.label}
          </button>
        ))}
      </div>

      {/* content */}
      {exp === 'bloco'   && <ExpBlocoSimples />}
      {exp === 'dois'    && <ExpDoisBlocos />}
      {exp === 'critico' && <ExpAnguloCritico />}

      {/* footer */}
      <div style={{ marginTop: 32, paddingTop: 16, borderTop: `1px solid ${T.border}`, textAlign: 'center', fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: T.muted, letterSpacing: 2 }}>
        g = 9,81 m/s²  ·  MECÂNICA CLÁSSICA  ·  LEIS DE NEWTON
      </div>
    </div>
  );
}