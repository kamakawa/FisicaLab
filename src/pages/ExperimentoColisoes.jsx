// ExperimentoColisoes.jsx — redesign completo v2
// Foco: Pêndulo Balístico + Colisões 1D com layout moderno
import React, { useState, useEffect, useRef, useCallback } from 'react';

// ── constantes ─────────────────────────────────────────────────────────────────
const G   = 9.81;
const TAU = Math.PI * 2;
const fmt = (v, d = 2) => Number(v).toFixed(d);
const toRad = d => d * Math.PI / 180;

// ── design tokens — mesma paleta do projeto ────────────────────────────────────
const C = {
  bg:      '#0B0C10',
  card:    '#161B22',
  card2:   '#1F2833',
  neon:    '#66FCF1',
  emerald: '#45A29E',
  amber:   '#F5A623',
  rose:    '#FF6B9D',
  white:   '#C5C6C7',
  muted:   '#4A5568',
  border:  'rgba(102,252,241,0.10)',
  border2: 'rgba(102,252,241,0.22)',
};

// ── CSS global ──────────────────────────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&family=Inter:wght@300;400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0}

.col-root{
  min-height:100vh;background:${C.bg};color:${C.white};
  font-family:'Inter',sans-serif;padding:28px 32px 56px;
}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:${C.card}}
::-webkit-scrollbar-thumb{background:${C.emerald};border-radius:2px}

/* header */
.col-hdr{margin-bottom:28px}
.col-title{
  font-family:'Orbitron',monospace;font-size:24px;font-weight:900;letter-spacing:3px;
  background:linear-gradient(90deg,${C.neon},${C.emerald});
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
}
.col-sub{font-family:'Share Tech Mono',monospace;font-size:11px;color:${C.muted};letter-spacing:2px;margin-top:5px}

/* experiment pills */
.col-pills{display:flex;gap:8px;margin-bottom:26px;flex-wrap:wrap}
.col-pill{
  font-family:'Share Tech Mono',monospace;font-size:11px;letter-spacing:2px;
  padding:9px 22px;border-radius:99px;border:1px solid ${C.border};
  background:transparent;color:${C.muted};cursor:pointer;transition:all .2s;
}
.col-pill.on{
  border-color:var(--tc);color:var(--tc);
  background:color-mix(in srgb,var(--tc) 10%,transparent);
  box-shadow:0 0 16px color-mix(in srgb,var(--tc) 18%,transparent);
}

/* main layout */
.col-grid{display:grid;grid-template-columns:268px 1fr;gap:18px;align-items:start}
.col-side{
  background:${C.card};border:1px solid ${C.border};border-radius:12px;
  padding:20px 18px;display:flex;flex-direction:column;
}
.col-main{
  background:${C.card};border:1px solid ${C.border};border-radius:12px;
  padding:22px;display:flex;flex-direction:column;gap:16px;
}

/* section label */
.slbl{
  font-family:'Orbitron',monospace;font-size:9px;font-weight:700;letter-spacing:3px;
  color:var(--sc,${C.neon});margin-bottom:16px;padding-bottom:10px;
  border-bottom:1px solid ${C.border};
}

/* sliders */
.sl-row{margin-bottom:16px}
.sl-head{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:7px}
.sl-lbl{font-family:'Share Tech Mono',monospace;font-size:10px;letter-spacing:1px;color:${C.muted}}
.sl-val{font-family:'Share Tech Mono',monospace;font-size:13px;font-weight:700;color:var(--sc,${C.neon})}
input[type=range]{-webkit-appearance:none;width:100%;background:transparent;cursor:pointer}
input[type=range]:focus{outline:none}
input[type=range]::-webkit-slider-runnable-track{height:2px;background:rgba(255,255,255,.07);border-radius:2px}
input[type=range]::-webkit-slider-thumb{
  -webkit-appearance:none;width:16px;height:16px;border-radius:50%;margin-top:-7px;
  border:2px solid var(--sc,${C.neon});background:${C.bg};cursor:pointer;
  transition:box-shadow .15s;
}
input[type=range]::-webkit-slider-thumb:hover{box-shadow:0 0 0 5px color-mix(in srgb,var(--sc,${C.neon}) 20%,transparent)}

/* buttons */
.btn-row{display:flex;gap:8px;margin-top:4px;margin-bottom:16px}
.cbtn{
  flex:1;padding:9px 6px;border-radius:7px;border:1px solid ${C.border};
  background:transparent;color:${C.white};cursor:pointer;
  font-size:10px;font-family:'Share Tech Mono',monospace;letter-spacing:1.5px;
  transition:all .18s;white-space:nowrap;
}
.cbtn:hover:not(:disabled){border-color:${C.neon};color:${C.neon}}
.cbtn.on{border-color:${C.neon};color:${C.neon};background:rgba(102,252,241,.07)}
.cbtn.go{background:${C.neon};color:${C.bg};border-color:${C.neon};font-weight:700}
.cbtn.go:hover:not(:disabled){box-shadow:0 0 22px rgba(102,252,241,.35)}
.cbtn.danger{border-color:${C.rose}44;color:${C.rose};background:${C.rose}0a}
.cbtn.danger:hover{background:${C.rose}1a}
.cbtn:disabled{opacity:.3;cursor:not-allowed}
.cbtn.icon{flex:0 0 38px}

/* metrics */
.mtr-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:4px}
.mtr{background:rgba(0,0,0,.22);border-radius:8px;padding:11px 12px;border-left:2px solid var(--mc,${C.neon})}
.mtr-lbl{font-family:'Share Tech Mono',monospace;font-size:8px;letter-spacing:2px;color:${C.muted}}
.mtr-val{font-family:'Share Tech Mono',monospace;font-size:17px;font-weight:700;color:var(--mc,${C.neon});line-height:1.1;margin-top:3px}
.mtr-unit{font-size:9px;opacity:.55;font-weight:400}

/* status */
.status-badge{
  margin-top:12px;padding:10px 14px;border-radius:7px;text-align:center;
  font-family:'Share Tech Mono',monospace;font-size:10px;letter-spacing:2px;
  border:1px solid;transition:all .3s;
}

/* phase indicator */
.phase-bar{display:flex;gap:6px;margin-bottom:14px}
.phase-step{
  flex:1;padding:7px 8px;border-radius:6px;text-align:center;
  font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:1.5px;
  border:1px solid ${C.border};color:${C.muted};transition:all .3s;
}
.phase-step.active{border-color:var(--pc);color:var(--pc);background:color-mix(in srgb,var(--pc) 10%,transparent)}
.phase-step.done{border-color:${C.emerald}44;color:${C.emerald};background:${C.emerald}0a}

/* canvas */
.cv-host{width:100%;border-radius:10px;overflow:hidden;background:rgba(0,0,0,.4);position:relative}
canvas.main-cv{display:block;width:100%!important}

/* chart row */
.chart-row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}
.chart-box{background:rgba(0,0,0,.25);border-radius:8px;padding:10px;border:1px solid ${C.border}}
.chart-title{font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:2px;color:${C.muted};margin-bottom:6px}
.chart-box canvas{display:block;width:100%!important;border-radius:4px}

/* tabs */
.tab-strip{display:flex;gap:4px;border-bottom:1px solid ${C.border};padding-bottom:10px;margin-bottom:18px}
.tbtn{
  font-family:'Share Tech Mono',monospace;font-size:10px;letter-spacing:2px;
  padding:6px 18px;border-radius:5px;border:none;background:transparent;
  color:${C.muted};cursor:pointer;transition:all .18s;
}
.tbtn.on{color:var(--tc);background:color-mix(in srgb,var(--tc) 10%,transparent)}
.tbtn:hover:not(.on){color:${C.white}}

/* theory */
.theory{overflow-y:auto;max-height:600px;padding-right:6px;display:flex;flex-direction:column;gap:12px}
.tc{border-radius:0 10px 10px 0;overflow:hidden;border-left:3px solid var(--fc)}
.tc-head{
  padding:11px 16px;background:color-mix(in srgb,var(--fc) 8%,transparent);
  font-family:'Orbitron',monospace;font-size:9px;font-weight:700;letter-spacing:2.5px;
  color:var(--fc);cursor:pointer;display:flex;justify-content:space-between;
  user-select:none;
}
.tc-body{padding:14px 16px 16px;background:rgba(0,0,0,.18)}
.eq{
  font-family:'Share Tech Mono',monospace;font-size:12.5px;color:var(--fc);
  background:rgba(0,0,0,.3);border-radius:6px;padding:10px 14px;
  margin:9px 0;letter-spacing:.4px;line-height:1.75;
  border:1px solid color-mix(in srgb,var(--fc) 18%,transparent);
  white-space:pre;
}
.prose{font-size:13px;color:${C.white};line-height:1.78;opacity:.88}
.prose strong{color:var(--fc);font-weight:600}
.prose em{color:${C.neon};font-style:normal}
.step-grid{display:flex;flex-direction:column;gap:0}
.step{display:flex;gap:12px;align-items:baseline;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.05)}
.step:last-child{border-bottom:none}
.step-n{font-family:'Share Tech Mono',monospace;font-size:10px;color:${C.muted};min-width:20px}
.step-eq{font-family:'Share Tech Mono',monospace;font-size:12px;color:${C.white};flex:1}
.step-desc{font-size:11px;color:${C.muted};font-style:italic}

/* collisions 1d */
.col1d-info{
  background:rgba(0,0,0,.2);border-radius:8px;padding:14px 16px;
  font-family:'Share Tech Mono',monospace;font-size:11px;line-height:1.8;color:${C.white};
  border:1px solid ${C.border};
}

/* footer */
.col-footer{margin-top:32px;padding-top:14px;border-top:1px solid ${C.border};text-align:center;font-family:'Share Tech Mono',monospace;font-size:9px;color:${C.muted};letter-spacing:2.5px}

@media(max-width:720px){.col-grid{grid-template-columns:1fr}.col-root{padding:14px 12px 40px}.chart-row{grid-template-columns:1fr}}
`;

// ── hook: responsive hi-dpi canvas ────────────────────────────────────────────
function useRespCanvas(h) {
  const ref     = useRef(null);
  const sizeRef = useRef({ w: 600, h });
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ratio = window.devicePixelRatio || 1;
    const go = () => {
      const w = c.parentElement?.clientWidth || 600;
      sizeRef.current = { w, h };
      c.width  = w * ratio; c.height = h * ratio;
      c.style.width = w + 'px'; c.style.height = h + 'px';
      c.getContext('2d').setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    go();
    const ro = new ResizeObserver(go);
    if (c.parentElement) ro.observe(c.parentElement);
    return () => ro.disconnect();
  }, [h]);
  return { ref, sizeRef };
}

// ── atoms ──────────────────────────────────────────────────────────────────────
const Sl = ({ label, value, onChange, min, max, step, unit, color = C.neon }) => (
  <div className="sl-row">
    <div className="sl-head">
      <span className="sl-lbl">{label}</span>
      <span className="sl-val" style={{ '--sc': color }}>
        {step < 1 ? fmt(value, step < 0.01 ? 3 : 2) : value}{unit}
      </span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value}
      onChange={e => onChange(+e.target.value)} style={{ '--sc': color }} />
  </div>
);

const Mtr = ({ label, value, unit, color = C.neon }) => (
  <div className="mtr" style={{ '--mc': color }}>
    <div className="mtr-lbl">{label}</div>
    <div className="mtr-val">{value}<span className="mtr-unit"> {unit}</span></div>
  </div>
);

const Tab = ({ active, onClick, children, color = C.neon }) => (
  <button className={`tbtn ${active ? 'on' : ''}`} style={{ '--tc': color }} onClick={onClick}>{children}</button>
);

const TC = ({ title, color = C.neon, children, open: init = true }) => {
  const [open, setOpen] = useState(init);
  return (
    <div className="tc" style={{ '--fc': color }}>
      <div className="tc-head" onClick={() => setOpen(o => !o)}>
        {title}<span style={{ fontSize: 14, opacity: .6 }}>{open ? '−' : '+'}</span>
      </div>
      {open && <div className="tc-body">{children}</div>}
    </div>
  );
};

// ── mini chart ─────────────────────────────────────────────────────────────────
const MiniChart = ({ data, label, color = C.neon, h = 90 }) => {
  const { ref, sizeRef } = useRespCanvas(h);
  useEffect(() => {
    const c = ref.current; if (!c || !data || data.length < 2) return;
    const { w: W, h: H } = sizeRef.current;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, W, H);
    const ys = data.map(d => d.y);
    const xs = data.map(d => d.x);
    const minX = xs[0], maxX = xs[xs.length - 1];
    const minY = Math.min(...ys), maxY = Math.max(...ys, minY + 0.001);
    const pad = { l: 8, r: 8, t: 8, b: 8 };
    const gW = W - pad.l - pad.r, gH = H - pad.t - pad.b;
    const px = x => pad.l + ((x - minX) / (maxX - minX + 0.001)) * gW;
    const py = y => H - pad.b - ((y - minY) / (maxY - minY)) * gH;

    // grid line at 0 if needed
    if (minY < 0 && maxY > 0) {
      ctx.beginPath(); ctx.moveTo(pad.l, py(0)); ctx.lineTo(W - pad.r, py(0));
      ctx.strokeStyle = 'rgba(255,255,255,.1)'; ctx.lineWidth = 1; ctx.stroke();
    }

    // area
    const grad = ctx.createLinearGradient(0, pad.t, 0, H - pad.b);
    grad.addColorStop(0, color + '35'); grad.addColorStop(1, color + '00');
    ctx.beginPath();
    data.forEach((d, i) => i === 0 ? ctx.moveTo(px(d.x), py(d.y)) : ctx.lineTo(px(d.x), py(d.y)));
    ctx.lineTo(px(xs[xs.length - 1]), py(minY));
    ctx.lineTo(px(xs[0]), py(minY));
    ctx.fillStyle = grad; ctx.fill();

    // line
    ctx.beginPath();
    data.forEach((d, i) => i === 0 ? ctx.moveTo(px(d.x), py(d.y)) : ctx.lineTo(px(d.x), py(d.y)));
    ctx.strokeStyle = color; ctx.lineWidth = 1.8;
    ctx.shadowColor = color; ctx.shadowBlur = 6;
    ctx.stroke(); ctx.shadowBlur = 0;

    // current dot
    const last = data[data.length - 1];
    ctx.beginPath(); ctx.arc(px(last.x), py(last.y), 4, 0, TAU);
    ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 14;
    ctx.fill(); ctx.shadowBlur = 0;
  }, [data, color, h, ref, sizeRef]);
  return <canvas ref={ref} className="main-cv" style={{ height: h }} />;
};

// ══════════════════════════════════════════════════════════════════════════════
//  PÊNDULO BALÍSTICO — canvas principal
// ══════════════════════════════════════════════════════════════════════════════
const CV_H = 420;

function drawArrowPB(ctx, ox, oy, ex, ey, color, label, lw = 2) {
  const dx = ex - ox, dy = ey - oy;
  const len = Math.hypot(dx, dy);
  if (len < 6) return;
  ctx.save();
  ctx.strokeStyle = color; ctx.fillStyle = color;
  ctx.lineWidth = lw; ctx.shadowColor = color; ctx.shadowBlur = 9;
  ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ex, ey); ctx.stroke();
  const a = Math.atan2(dy, dx);
  ctx.beginPath();
  ctx.moveTo(ex, ey);
  ctx.lineTo(ex - 10 * Math.cos(a - 0.38), ey - 10 * Math.sin(a - 0.38));
  ctx.lineTo(ex - 10 * Math.cos(a + 0.38), ey - 10 * Math.sin(a + 0.38));
  ctx.closePath(); ctx.fill();
  if (label) {
    ctx.shadowBlur = 0;
    ctx.font = 'bold 10px "Share Tech Mono",monospace';
    const nx = Math.cos(a + Math.PI / 2);
    const ny = Math.sin(a + Math.PI / 2);
    ctx.fillText(label, ex + 14 * Math.cos(a) + 10 * nx, ey + 14 * Math.sin(a) + 10 * ny);
  }
  ctx.restore();
}

const PenduloCanvas = ({ mP, mB, v0, L, phase, angle, projX, running, collided, showVec, hMax }) => {
  const { ref, sizeRef } = useRespCanvas(CV_H);

  useEffect(() => {
    const c = ref.current; if (!c) return;
    const { w: W, h: H } = sizeRef.current;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, W, H);

    // background grid
    ctx.strokeStyle = 'rgba(69,162,158,0.04)'; ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    const scale = Math.min(W, H) / (L * 4.5);
    const pivX  = W / 2;
    const pivY  = H * 0.22;

    // ── pêndulo ──────────────────────────────────────────────────────────────
    const bx = pivX + Math.sin(angle) * L * scale;
    const by = pivY + Math.cos(angle) * L * scale;

    // suporte
    ctx.fillStyle = C.card2;
    ctx.fillRect(pivX - 48, pivY - 20, 96, 20);
    // hatch
    ctx.strokeStyle = 'rgba(102,252,241,0.08)'; ctx.lineWidth = 1;
    for (let i = -40; i <= 40; i += 12) {
      ctx.beginPath(); ctx.moveTo(pivX + i, pivY - 20); ctx.lineTo(pivX + i + 10, pivY); ctx.stroke();
    }
    // pivô
    ctx.beginPath(); ctx.arc(pivX, pivY, 7, 0, TAU);
    ctx.fillStyle = C.neon; ctx.shadowColor = C.neon; ctx.shadowBlur = 12; ctx.fill(); ctx.shadowBlur = 0;

    // fio
    ctx.beginPath(); ctx.moveTo(pivX, pivY); ctx.lineTo(bx, by);
    ctx.strokeStyle = C.white; ctx.lineWidth = 1.8;
    ctx.shadowColor = C.neon; ctx.shadowBlur = 4; ctx.stroke(); ctx.shadowBlur = 0;

    // arco de trajetória (fantasma)
    const arcR = L * scale;
    const thetaMax = hMax > 0 ? Math.acos(Math.max(-1, 1 - hMax / L)) : 0;
    if (thetaMax > 0.02) {
      ctx.beginPath();
      ctx.arc(pivX, pivY, arcR, Math.PI / 2 - thetaMax, Math.PI / 2 + thetaMax);
      ctx.strokeStyle = `rgba(102,252,241,0.12)`; ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 6]); ctx.stroke(); ctx.setLineDash([]);
    }

    // bloco
    const bW = 48, bH = 44;
    ctx.save();
    ctx.translate(bx, by);
    if (phase === 'pendulo') {
      ctx.shadowColor = C.neon; ctx.shadowBlur = 22;
    }
    ctx.beginPath(); ctx.roundRect(-bW / 2, -bH / 2, bW, bH, 8);
    ctx.fillStyle = `rgba(102,252,241,0.14)`; ctx.fill();
    ctx.strokeStyle = C.neon; ctx.lineWidth = 2; ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = C.neon; ctx.font = 'bold 10px "Share Tech Mono",monospace';
    ctx.textAlign = 'center';
    ctx.fillText(collided ? `${mP+mB}kg` : `${mB}kg`, 0, 4);
    ctx.restore();

    // ── régua de altura ───────────────────────────────────────────────────────
    const rulerX = pivX + L * scale + 32;
    const baseY  = pivY + L * scale;
    if (hMax > 0.001) {
      const hPx = hMax * scale;
      ctx.beginPath(); ctx.moveTo(rulerX - 6, baseY); ctx.lineTo(rulerX + 6, baseY);
      ctx.strokeStyle = C.amber; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(rulerX - 6, baseY - hPx); ctx.lineTo(rulerX + 6, baseY - hPx);
      ctx.stroke();
      ctx.beginPath(); ctx.moveTo(rulerX, baseY); ctx.lineTo(rulerX, baseY - hPx);
      ctx.strokeStyle = C.amber; ctx.lineWidth = 1; ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.amber; ctx.font = 'bold 10px "Share Tech Mono",monospace'; ctx.textAlign = 'left';
      ctx.fillText(`h=${fmt(hMax, 3)}m`, rulerX + 9, baseY - hPx / 2 + 4);
    }

    // ── projétil ──────────────────────────────────────────────────────────────
    if (!collided && phase === 'projétil') {
      const px = pivX - (1.2 - projX) * scale * 1.4;
      const py = by;
      // smoke trail
      for (let i = 1; i <= 6; i++) {
        const tx = px - i * 10;
        ctx.beginPath(); ctx.arc(tx, py, 3 - i * 0.3, 0, TAU);
        ctx.fillStyle = `rgba(255,107,157,${0.04 * (7 - i)})`; ctx.fill();
      }
      // bullet
      ctx.beginPath(); ctx.arc(px, py, 7, 0, TAU);
      ctx.fillStyle = C.rose; ctx.shadowColor = C.rose; ctx.shadowBlur = 18; ctx.fill(); ctx.shadowBlur = 0;
      ctx.fillStyle = C.white; ctx.font = 'bold 9px "Share Tech Mono",monospace';
      ctx.textAlign = 'center'; ctx.fillText(`${mP}kg`, px, py - 12); ctx.textAlign = 'left';

      if (showVec) {
        drawArrowPB(ctx, px + 7, py, px + 7 + Math.min(70, v0 * 2.5), py, C.rose, `v₀=${fmt(v0)}m/s`);
      }
    }

    // ── vetores no bloco ───────────────────────────────────────────────────────
    if (showVec && collided) {
      const mT = mP + mB;
      const vBloco = phase === 'pendulo' ? Math.sqrt(Math.max(0, 2 * G * (hMax - L * (1 - Math.cos(angle))))) : 0;
      const tensao = mT * (G * Math.cos(angle) + vBloco * vBloco / L);
      const peso   = mT * G;
      const sc = Math.min(60, scale * 0.7) / Math.max(peso, 1);

      // Tensão: ao longo do fio (para o pivô)
      const tx = pivX - bx, ty = pivY - by;
      const tlen = Math.hypot(tx, ty);
      drawArrowPB(ctx, bx, by,
        bx + (tx / tlen) * Math.min(70, tensao * sc),
        by + (ty / tlen) * Math.min(70, tensao * sc),
        C.neon, `T=${fmt(tensao, 1)}N`, 2);

      // Peso: para baixo
      drawArrowPB(ctx, bx, by + 24, bx, by + 24 + Math.min(60, peso * sc), C.rose, `P=${fmt(peso, 1)}N`, 2);

      // Força centrípeta (se em movimento)
      if (vBloco > 0.05) {
        const Fc = mT * vBloco * vBloco / L;
        const tx2 = pivX - bx, ty2 = pivY - by, tl2 = Math.hypot(tx2, ty2);
        drawArrowPB(ctx, bx - 14, by,
          bx - 14 + (tx2 / tl2) * Math.min(50, Fc * sc),
          by + (ty2 / tl2) * Math.min(50, Fc * sc),
          C.amber, `Fc=${fmt(Fc, 1)}N`, 1.5);
      }
    }

    // ── angle arc ─────────────────────────────────────────────────────────────
    if (Math.abs(angle) > 0.01) {
      ctx.beginPath();
      ctx.arc(pivX, pivY, 38, Math.PI / 2, Math.PI / 2 + angle, angle < 0);
      ctx.strokeStyle = C.amber; ctx.lineWidth = 1.5;
      ctx.shadowColor = C.amber; ctx.shadowBlur = 5; ctx.stroke(); ctx.shadowBlur = 0;
      ctx.fillStyle = C.amber; ctx.font = '10px "Share Tech Mono",monospace'; ctx.textAlign = 'left';
      ctx.fillText(`${fmt(Math.abs(angle * 180 / Math.PI), 1)}°`, pivX + 44, pivY + 10);
    }

    // ── info overlay ──────────────────────────────────────────────────────────
    ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(10, 10, 175, 72); 
    ctx.strokeStyle = C.border; ctx.lineWidth = 1; ctx.strokeRect(10, 10, 175, 72);
    ctx.fillStyle = C.neon; ctx.font = '10px "Share Tech Mono",monospace'; ctx.textAlign = 'left';
    const mT = mP + mB;
    const vC = (mP * v0) / mT;
    const hT = vC * vC / (2 * G);
    ctx.fillText(`v_projétil = ${fmt(v0)} m/s`, 18, 28);
    ctx.fillStyle = C.emerald; ctx.fillText(`v_conjunto = ${fmt(vC, 3)} m/s`, 18, 44);
    ctx.fillStyle = C.amber;   ctx.fillText(`h_teórica  = ${fmt(hT, 4)} m`, 18, 60);
    ctx.fillStyle = phase === 'pendulo' ? C.rose : C.muted;
    ctx.fillText(`h_atual    = ${fmt(hMax, 4)} m`, 18, 76);

    ctx.textAlign = 'left';
  }, [mP, mB, v0, L, phase, angle, projX, collided, showVec, hMax, ref, sizeRef]);

  return <div className="cv-host" style={{ height: CV_H }}><canvas ref={ref} className="main-cv" /></div>;
};

// ══════════════════════════════════════════════════════════════════════════════
//  FÍSICA DO PÊNDULO — state machine em refs
// ══════════════════════════════════════════════════════════════════════════════
const PenduloBalistico = () => {
  const [mP,  setMP]  = useState(0.05);
  const [mB,  setMB]  = useState(0.50);
  const [v0,  setV0]  = useState(20);
  const [L,   setL]   = useState(1.2);
  const [showVec, setShowVec] = useState(true);
  const [aba, setAba] = useState('sim');

  // simulation state (rendered)
  const [phase,    setPhase]    = useState('repouso');
  const [angle,    setAngle]    = useState(0);
  const [projX,    setProjX]    = useState(0);
  const [collided, setCollided] = useState(false);
  const [hMax,     setHMax]     = useState(0);

  // chart histories
  const [histAngle,  setHistAngle]  = useState([]);
  const [histHeight, setHistHeight] = useState([]);
  const [histEnergy, setHistEnergy] = useState([]);

  // refs for RAF loop
  const rafRef   = useRef(null);
  const stateRef = useRef({
    phase: 'repouso', angle: 0, omega: 0, projX: 0,
    collided: false, hMax: 0, t: 0,
    angHist: [], hHist: [], eHist: []
  });

  const mT = mP + mB;
  const vC = (mP * v0) / mT;
  const hT = vC * vC / (2 * G);
  const thetaMax = Math.acos(Math.max(-1, 1 - hT / L));

  const disparar = () => {
    cancelAnimationFrame(rafRef.current);
    const s = stateRef.current;
    s.phase = 'projétil'; s.angle = 0; s.omega = 0;
    s.projX = 0; s.collided = false; s.hMax = 0; s.t = 0;
    s.angHist = []; s.hHist = []; s.eHist = [];
    setPhase('projétil'); setAngle(0); setProjX(0);
    setCollided(false); setHMax(0);
    setHistAngle([]); setHistHeight([]); setHistEnergy([]);
    let prev = null;

    const step = ts => {
      if (!prev) { prev = ts; rafRef.current = requestAnimationFrame(step); return; }
      const dt = Math.min((ts - prev) / 1000, 0.025);
      prev = ts;
      const s2 = stateRef.current;
      s2.t += dt;

      if (s2.phase === 'projétil') {
        s2.projX += dt * v0 * 0.65;
        if (s2.projX >= 1.0) {
          s2.phase = 'pendulo';
          s2.collided = true;
          s2.omega = vC / L;    // angular velocity at impact
          setCollided(true);
          setPhase('pendulo');
        }
        setProjX(s2.projX);

      } else if (s2.phase === 'pendulo') {
        // RK4 for pendulum ODE: dω/dt = -(g/L)·sin(θ)
        const f = (th, om) => -(G / L) * Math.sin(th);
        const k1o = f(s2.angle, s2.omega);
        const k2o = f(s2.angle + dt / 2 * s2.omega, s2.omega + dt / 2 * k1o);
        const k3o = f(s2.angle + dt / 2 * (s2.omega + dt / 2 * k1o), s2.omega + dt / 2 * k2o);
        const k4o = f(s2.angle + dt * (s2.omega + dt * k2o), s2.omega + dt * k3o);
        s2.omega += dt / 6 * (k1o + 2 * k2o + 2 * k3o + k4o);
        s2.angle += dt * s2.omega;

        const h = L * (1 - Math.cos(s2.angle));
        if (h > s2.hMax) s2.hMax = h;
        const Ek = 0.5 * mT * s2.omega * s2.omega * L * L;
        const Ep = mT * G * h;

        const pt = { x: s2.t };
        s2.angHist.push({ ...pt, y: s2.angle * 180 / Math.PI });
        s2.hHist.push({ ...pt, y: h });
        s2.eHist.push({ ...pt, y: Ek + Ep });

        setAngle(s2.angle);
        setHMax(s2.hMax);
        if (s2.angHist.length % 3 === 0) {
          setHistAngle([...s2.angHist]);
          setHistHeight([...s2.hHist]);
          setHistEnergy([...s2.eHist]);
        }

        // stop after 2 swings
        if (s2.t > 4 * Math.PI * Math.sqrt(L / G)) {
          setPhase('concluído');
          s2.phase = 'concluído';
          return;
        }
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  };

  const reset = () => {
    cancelAnimationFrame(rafRef.current);
    const s = stateRef.current;
    s.phase = 'repouso'; s.angle = 0; s.omega = 0;
    s.projX = 0; s.collided = false; s.hMax = 0; s.t = 0;
    setPhase('repouso'); setAngle(0); setProjX(0);
    setCollided(false); setHMax(0);
    setHistAngle([]); setHistHeight([]); setHistEnergy([]);
  };

  const phaseColor = { repouso: C.muted, projétil: C.rose, pendulo: C.neon, concluído: C.emerald };
  const pc = phaseColor[phase] || C.muted;

  return (
    <div className="col-grid">
      {/* ── painel esquerdo ── */}
      <div className="col-side">
        <div className="slbl" style={{ '--sc': C.neon }}>PARÂMETROS</div>

        <Sl label="Massa do projétil m" value={mP} onChange={v => { setMP(v); reset(); }}
          min={0.01} max={0.20} step={0.005} unit=" kg" color={C.rose} />
        <Sl label="Massa do bloco M"    value={mB} onChange={v => { setMB(v); reset(); }}
          min={0.10} max={2.00} step={0.05}  unit=" kg" color={C.neon} />
        <Sl label="Velocidade v₀"       value={v0} onChange={v => { setV0(v); reset(); }}
          min={5}    max={80}   step={1}     unit=" m/s" color={C.amber} />
        <Sl label="Comprimento do fio L" value={L} onChange={v => { setL(v); reset(); }}
          min={0.4}  max={2.5}  step={0.05}  unit=" m"   color={C.emerald} />

        <div className="btn-row">
          <button className="cbtn go" onClick={disparar} disabled={phase === 'projétil' || phase === 'pendulo'}>
            ▶ DISPARAR
          </button>
          <button className="cbtn danger" onClick={reset}>↺</button>
        </div>

        <button className={`cbtn ${showVec ? 'on' : ''}`} style={{ marginBottom: 14 }} onClick={() => setShowVec(v => !v)}>
          {showVec ? '◉ VETORES ON' : '○ VETORES OFF'}
        </button>

        {/* phase indicator */}
        <div className="phase-bar">
          {['projétil', 'pendulo', 'concluído'].map(p => {
            const phases = ['projétil', 'pendulo', 'concluído'];
            const cur = phases.indexOf(phase);
            const idx = phases.indexOf(p);
            const cls = phase === p ? 'active' : cur > idx ? 'done' : '';
            const colors = { projétil: C.rose, pendulo: C.neon, concluído: C.emerald };
            return (
              <div key={p} className={`phase-step ${cls}`}
                style={{ '--pc': colors[p] }}>
                {p === 'projétil' ? '① TIRO' : p === 'pendulo' ? '② PÊNDULO' : '③ CONCLUÍDO'}
              </div>
            );
          })}
        </div>

        <div className="mtr-grid">
          <Mtr label="v CONJUNTO"    value={fmt(vC, 3)}         unit="m/s" color={C.emerald} />
          <Mtr label="h TEÓRICA"     value={fmt(hT, 4)}         unit="m"   color={C.amber}   />
          <Mtr label="θ MÁXIMO"      value={fmt(thetaMax * 180 / Math.PI, 1)} unit="°" color={C.neon} />
          <Mtr label="h MEDIDA"      value={fmt(hMax, 4)}       unit="m"   color={phase === 'concluído' ? C.emerald : C.muted} />
        </div>

        <div className="status-badge" style={{ color: pc, borderColor: pc + '33', background: pc + '0a' }}>
          {{ repouso: '■ AGUARDANDO DISPARO', projétil: '→ PROJÉTIL EM VOO', pendulo: '∿ OSCILANDO', concluído: '✓ EXPERIMENTO CONCLUÍDO' }[phase]}
        </div>
      </div>

      {/* ── área principal ── */}
      <div className="col-main">
        <div className="tab-strip">
          <Tab active={aba === 'sim'}    onClick={() => setAba('sim')}    color={C.neon}>SIMULAÇÃO</Tab>
          <Tab active={aba === 'teoria'} onClick={() => setAba('teoria')} color={C.amber}>TEORIA</Tab>
          <Tab active={aba === 'graf'}   onClick={() => setAba('graf')}   color={C.emerald}>GRÁFICOS</Tab>
        </div>

        {aba === 'sim' && (
          <>
            <PenduloCanvas mP={mP} mB={mB} v0={v0} L={L}
              phase={phase} angle={angle} projX={projX}
              running={phase === 'pendulo'} collided={collided}
              showVec={showVec} hMax={hMax} />

            <div style={{ padding: '14px 16px', background: 'rgba(0,0,0,.2)', borderRadius: 8, border: `1px solid ${C.border}` }}>
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: C.muted, letterSpacing: 2, marginBottom: 8 }}>DIAGNÓSTICO EM TEMPO REAL</div>
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 11, color: C.white, lineHeight: 1.9 }}>
                m·v₀ = {fmt(mP * v0, 4)} kg·m/s  →  (m+M)·V = {fmt(mT * vC, 4)} kg·m/s{'\n'}
                ΔEₖ (colisão) = {fmt(0.5 * mP * v0 * v0 - 0.5 * mT * vC * vC, 4)} J  [{fmt((1 - mT * vC * vC / (mP * v0 * v0)) * 100, 1)}% dissipado]
              </div>
            </div>
          </>
        )}

        {aba === 'teoria' && <TheoryPendulo mP={mP} mB={mB} v0={v0} L={L} vC={vC} hT={hT} thetaMax={thetaMax} mT={mT} />}

        {aba === 'graf' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="chart-row">
              <div className="chart-box">
                <div className="chart-title">ÂNGULO θ(t) [graus]</div>
                <MiniChart data={histAngle.length > 1 ? histAngle : [{ x: 0, y: 0 }]} color={C.neon} h={90} />
              </div>
              <div className="chart-box">
                <div className="chart-title">ALTURA h(t) [m]</div>
                <MiniChart data={histHeight.length > 1 ? histHeight : [{ x: 0, y: 0 }]} color={C.amber} h={90} />
              </div>
              <div className="chart-box">
                <div className="chart-title">ENERGIA Emec(t) [J]</div>
                <MiniChart data={histEnergy.length > 1 ? histEnergy : [{ x: 0, y: 0 }]} color={C.emerald} h={90} />
              </div>
            </div>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 11, color: C.muted, lineHeight: 1.8, padding: '12px 14px', background: 'rgba(0,0,0,.2)', borderRadius: 8, border: `1px solid ${C.border}` }}>
              A energia mecânica total Emec = Eₖ + Ep deve permanecer constante após a colisão.{'\n'}
              Qualquer decaimento indica dissipação (ar, atrito no pivô). Período teórico: T = 2π√(L/g) = {fmt(2 * Math.PI * Math.sqrt(L / G), 3)} s
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
//  TEORIA — Pêndulo Balístico
// ══════════════════════════════════════════════════════════════════════════════
const TheoryPendulo = ({ mP, mB, v0, L, vC, hT, thetaMax, mT }) => (
  <div className="theory">
    <TC title="01 — CONTEXTO HISTÓRICO E FÍSICO" color={C.neon}>
      <p className="prose">
        O pêndulo balístico foi inventado por <strong>Benjamin Robins</strong> em 1742 para medir a
        velocidade de projéteis, muito antes da invenção de cronômetros de precisão.
        O princípio: um projétil embebe-se num bloco suspenso por fio, e a altura atingida
        pelo sistema permite calcular a velocidade inicial do projétil.
      </p>
      <p className="prose" style={{ marginTop: 8 }}>
        O experimento envolve <strong>dois princípios distintos</strong> em etapas distintas:
        conservação do <em>momento</em> na colisão, e conservação da <em>energia mecânica</em> na oscilação.
      </p>
    </TC>

    <TC title="02 — ETAPA I: COLISÃO PERFEITAMENTE INELÁSTICA" color={C.rose}>
      <p className="prose">
        A colisão ocorre num intervalo de tempo <em>Δt → 0</em>, durante o qual as forças
        externas (peso, tensão) têm impulso desprezível comparado às forças de impacto internas.
        Portanto o <strong>momento linear se conserva</strong>:
      </p>
      <div className="eq">{`m·v₀ + M·0 = (m + M)·V

V = m·v₀ / (m + M)
V = ${fmt(mP)}·${fmt(v0)} / (${fmt(mP)} + ${fmt(mB)})
V = ${fmt(vC, 4)} m/s`}</div>
      <p className="prose">
        Importante: a <em>energia cinética NÃO se conserva</em> na colisão. A energia dissipada
        em deformação plástica e calor é:
      </p>
      <div className="eq">{`ΔEₖ = ½m·v₀² − ½(m+M)·V²
ΔEₖ = ${fmt(0.5*mP*v0*v0, 4)} − ${fmt(0.5*mT*vC*vC, 4)}
ΔEₖ = ${fmt(0.5*mP*v0*v0 - 0.5*mT*vC*vC, 4)} J  [${fmt((1 - mT*vC*vC/(mP*v0*v0))*100, 1)}% dissipado]`}</div>
    </TC>

    <TC title="03 — ETAPA II: OSCILAÇÃO DO PÊNDULO" color={C.neon}>
      <p className="prose">
        Após a colisão, o sistema (bloco + projétil) oscila como um pêndulo.
        Nesta fase, sem forças dissipativas, a <strong>energia mecânica se conserva</strong>:
      </p>
      <div className="eq">{`½(m+M)·V² = (m+M)·g·h

h = V² / (2g)
h = ${fmt(vC,4)}² / (2 × 9,81)
h = ${fmt(hT, 5)} m`}</div>
      <p className="prose">Relacionando h com o ângulo máximo θ pela geometria do pêndulo:</p>
      <div className="eq">{`h = L·(1 − cos θ)

cos θ = 1 − h/L = 1 − ${fmt(hT,4)}/${fmt(L)}
θ = arccos(${fmt(1-hT/L, 4)}) = ${fmt(thetaMax*180/Math.PI, 2)}°`}</div>
    </TC>

    <TC title="04 — EQUAÇÃO MESTRA: v₀ DA ALTURA" color={C.amber}>
      <p className="prose">
        Combinando as duas etapas, isolamos <strong>v₀</strong> em função de h (ou θ):
      </p>
      <div className="step-grid">
        <div className="step"><span className="step-n">①</span><span className="step-eq">V = √(2gh)</span><span className="step-desc">da energia</span></div>
        <div className="step"><span className="step-n">②</span><span className="step-eq">m·v₀ = (m+M)·V</span><span className="step-desc">do momento</span></div>
        <div className="step"><span className="step-n">③</span><span className="step-eq">v₀ = (m+M)/m · √(2gh)</span><span className="step-desc">equação mestra</span></div>
        <div className="step"><span className="step-n">④</span><span className="step-eq">v₀ = (m+M)/m · √(2gL(1−cosθ))</span><span className="step-desc">com θ medido</span></div>
      </div>
      <div className="eq">{`Verificação numérica:
v₀ = (${fmt(mT,3)}/${fmt(mP,3)}) · √(2 · 9,81 · ${fmt(hT,4)})
v₀ = ${fmt(mT/mP,3)} · ${fmt(Math.sqrt(2*G*hT),4)}
v₀ = ${fmt((mT/mP)*Math.sqrt(2*G*hT), 3)} m/s  ✓`}</div>
    </TC>

    <TC title="05 — EQUAÇÃO DO MOVIMENTO: DERIVADA E ODE" color={C.emerald}>
      <p className="prose">
        Após a colisão, a equação do movimento do pêndulo é obtida pela
        <strong> 2ª Lei de Newton</strong> na direção tangencial:
      </p>
      <div className="eq">{`Força tangencial:  F_t = −(m+M)·g·sen θ
Aceleração tang.:  a_t = L·α = L·d²θ/dt²

(m+M)·L·d²θ/dt² = −(m+M)·g·sen θ

ODE:  d²θ/dt² = −(g/L)·sen θ`}</div>
      <p className="prose">
        Para ângulos pequenos (θ &lt; 15°), <em>sen θ ≈ θ</em> e a equação lineariza:
      </p>
      <div className="eq">{`d²θ/dt² + (g/L)·θ = 0    ← oscilador harmônico!

Solução geral:
θ(t) = θ_max · cos(ω₀t + φ)

ω₀ = √(g/L) = √(9,81/${fmt(L)}) = ${fmt(Math.sqrt(G/L),4)} rad/s
T  = 2π/ω₀ = ${fmt(2*Math.PI*Math.sqrt(L/G),3)} s`}</div>
      <p className="prose">
        O simulador integra a ODE <em>exata</em> (com sen θ) pelo método de
        <strong> Runge-Kutta 4ª ordem</strong>, sem a aproximação de pequenos ângulos.
      </p>
    </TC>

    <TC title="06 — ENERGIA: INTEGRAL DA FORÇA NO PÊNDULO" color={C.rose} open={false}>
      <p className="prose">
        A energia potencial do sistema é obtida integrando a força peso ao longo da trajetória:
      </p>
      <div className="eq">{`Ep = ∫F_tangencial · ds  ao longo do arco

Para o pêndulo, h = L(1 − cosθ):
Ep(θ) = (m+M)·g·L·(1 − cosθ)

dEp/dθ = (m+M)·g·L·senθ   ← força restauradora

Energia total (conservada após colisão):
Emec = ½(m+M)·L²·ω² + (m+M)·g·L·(1−cosθ) = cte

Na posição mais alta (ω = 0):
Emec = (m+M)·g·L·(1−cosθ_max) = ${fmt(mT*G*hT, 5)} J`}</div>
    </TC>

    <TC title="07 — INCERTEZA E MÉTODO EXPERIMENTAL" color={C.amber} open={false}>
      <p className="prose">
        Na prática, mede-se θ com uma régua e transferidor. Propagando incerteza em v₀:
      </p>
      <div className="eq">{`v₀ = (m+M)/m · √(2gL(1−cosθ))

∂v₀/∂θ = (m+M)/m · g·L·senθ / √(2gL(1−cosθ))

Incerteza: σ_v₀ ≈ |∂v₀/∂θ| · σ_θ`}</div>
      <p className="prose">
        Para θ pequenos, sen θ ≈ θ e a incerteza é proporcional a σ_θ/θ — medir
        ângulos maiores reduz o erro relativo. Isso explica por que projéteis mais
        rápidos ou blocos mais leves geram resultados mais precisos.
      </p>
    </TC>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
//  COLISÕES 1D — canvas + física
// ══════════════════════════════════════════════════════════════════════════════
const CV_H2 = 260;

const Col1DCanvas = ({ m1, m2, v1, v2, e, pos1, pos2, vel1, vel2, showVec, t }) => {
  const { ref, sizeRef } = useRespCanvas(CV_H2);

  useEffect(() => {
    const c = ref.current; if (!c) return;
    const { w: W, h: H } = sizeRef.current;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, W, H);

    // grid
    ctx.strokeStyle = 'rgba(69,162,158,0.04)'; ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }

    const cx = W / 2;
    const sc = W / 16;
    const yCentro = H / 2;
    const r1 = Math.max(12, Math.min(32, m1 * 5));
    const r2 = Math.max(12, Math.min(32, m2 * 5));

    // ground
    ctx.beginPath(); ctx.moveTo(20, yCentro + 36); ctx.lineTo(W - 20, yCentro + 36);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1; ctx.stroke();

    const x1 = cx + pos1 * sc;
    const x2 = cx + pos2 * sc;

    // particle 1
    ctx.beginPath(); ctx.arc(x1, yCentro, r1, 0, TAU);
    ctx.fillStyle = `rgba(255,107,157,0.2)`; ctx.fill();
    ctx.strokeStyle = C.rose; ctx.lineWidth = 2;
    ctx.shadowColor = C.rose; ctx.shadowBlur = 14; ctx.stroke(); ctx.shadowBlur = 0;
    ctx.fillStyle = C.rose; ctx.font = 'bold 10px "Share Tech Mono",monospace'; ctx.textAlign = 'center';
    ctx.fillText(`${fmt(m1, 1)}`, x1, yCentro + 4);

    // particle 2
    ctx.beginPath(); ctx.arc(x2, yCentro, r2, 0, TAU);
    ctx.fillStyle = `rgba(102,252,241,0.2)`; ctx.fill();
    ctx.strokeStyle = C.neon; ctx.lineWidth = 2;
    ctx.shadowColor = C.neon; ctx.shadowBlur = 14; ctx.stroke(); ctx.shadowBlur = 0;
    ctx.fillStyle = C.neon; ctx.fillText(`${fmt(m2, 1)}`, x2, yCentro + 4);

    // labels
    ctx.shadowBlur = 0; ctx.textAlign = 'center';
    ctx.fillStyle = C.rose; ctx.font = '10px "Share Tech Mono",monospace';
    ctx.fillText(`v₁=${fmt(vel1,2)}m/s`, x1, yCentro - r1 - 16);
    ctx.fillStyle = C.neon;
    ctx.fillText(`v₂=${fmt(vel2,2)}m/s`, x2, yCentro - r2 - 16);

    if (showVec) {
      const sc2 = 0.6;
      if (Math.abs(vel1) > 0.05) {
        const len = Math.min(60, Math.abs(vel1) * sc2 * 20);
        const dir = vel1 > 0 ? 1 : -1;
        drawArrowPB(ctx, x1, yCentro - r1 - 4, x1 + dir * len, yCentro - r1 - 4, C.rose, `p₁=${fmt(m1*vel1,2)}`, 2);
      }
      if (Math.abs(vel2) > 0.05) {
        const len = Math.min(60, Math.abs(vel2) * sc2 * 20);
        const dir = vel2 > 0 ? 1 : -1;
        drawArrowPB(ctx, x2, yCentro + r2 + 4, x2 + dir * len, yCentro + r2 + 4, C.neon, `p₂=${fmt(m2*vel2,2)}`, 2);
      }
    }

    // tempo e momento
    ctx.fillStyle = C.muted; ctx.font = '10px "Share Tech Mono",monospace'; ctx.textAlign = 'left';
    ctx.fillText(`t = ${fmt(t, 2)} s`, 14, 20);
    ctx.fillStyle = C.emerald;
    ctx.fillText(`P_total = ${fmt(m1*vel1 + m2*vel2, 3)} kg·m/s`, 14, 36);
    ctx.textAlign = 'left';
  }, [m1, m2, v1, v2, e, pos1, pos2, vel1, vel2, showVec, t, ref, sizeRef]);

  return <div className="cv-host" style={{ height: CV_H2 }}><canvas ref={ref} className="main-cv" /></div>;
};

const Colisoes1D = () => {
  const [m1, setM1] = useState(2.0);
  const [m2, setM2] = useState(2.0);
  const [v1, setV1] = useState(3.0);
  const [v2, setV2] = useState(-1.5);
  const [e,  setE]  = useState(1.0);
  const [showVec, setShowVec] = useState(true);
  const [aba, setAba] = useState('sim');

  const [pos1, setPos1] = useState(-4);
  const [pos2, setPos2] = useState(4);
  const [vel1, setVel1] = useState(v1);
  const [vel2, setVel2] = useState(v2);
  const [t,    setT]    = useState(0);
  const [rodando, setRodando] = useState(false);
  const [collided, setCollided] = useState(false);

  const [histVel1,  setHistVel1]  = useState([]);
  const [histVel2,  setHistVel2]  = useState([]);
  const [histMom,   setHistMom]   = useState([]);

  const rafRef   = useRef(null);
  const stateRef = useRef({ pos1: -4, pos2: 4, vel1: v1, vel2: v2, t: 0, collided: false, hV1: [], hV2: [], hM: [] });

  // theoretical post-collision velocities
  const v1p = ((m1 - e * m2) * v1 + (1 + e) * m2 * v2) / (m1 + m2);
  const v2p = ((m2 - e * m1) * v2 + (1 + e) * m1 * v1) / (m1 + m2);
  const Ek0 = 0.5 * m1 * v1 * v1 + 0.5 * m2 * v2 * v2;
  const Ekf = 0.5 * m1 * v1p * v1p + 0.5 * m2 * v2p * v2p;
  const pTot = m1 * v1 + m2 * v2;

  const reset = () => {
    cancelAnimationFrame(rafRef.current);
    const s = stateRef.current;
    s.pos1 = -4; s.pos2 = 4; s.vel1 = v1; s.vel2 = v2;
    s.t = 0; s.collided = false; s.hV1 = []; s.hV2 = []; s.hM = [];
    setPos1(-4); setPos2(4); setVel1(v1); setVel2(v2);
    setT(0); setCollided(false); setRodando(false);
    setHistVel1([]); setHistVel2([]); setHistMom([]);
  };

  const iniciar = () => {
    reset();
    setTimeout(() => {
      stateRef.current.vel1 = v1; stateRef.current.vel2 = v2;
      setVel1(v1); setVel2(v2); setRodando(true);
    }, 50);
  };

  useEffect(() => {
    if (!rodando) { cancelAnimationFrame(rafRef.current); return; }
    let prev = null;
    const step = ts => {
      if (!prev) { prev = ts; rafRef.current = requestAnimationFrame(step); return; }
      const dt = Math.min((ts - prev) / 1000, 0.02);
      prev = ts;
      const s = stateRef.current;
      s.t += dt;

      if (!s.collided) {
        s.pos1 += s.vel1 * dt * 1.2;
        s.pos2 += s.vel2 * dt * 1.2;
        const r1 = Math.max(0.5, m1 * 0.3);
        const r2 = Math.max(0.5, m2 * 0.3);
        if (s.pos1 + r1 >= s.pos2 - r2) {
          s.vel1 = v1p; s.vel2 = v2p; s.collided = true;
          setCollided(true);
        }
      } else {
        s.pos1 += s.vel1 * dt * 1.2;
        s.pos2 += s.vel2 * dt * 1.2;
      }

      s.hV1.push({ x: s.t, y: s.vel1 });
      s.hV2.push({ x: s.t, y: s.vel2 });
      s.hM.push({ x: s.t, y: m1 * s.vel1 + m2 * s.vel2 });

      setPos1(s.pos1); setPos2(s.pos2);
      setVel1(s.vel1); setVel2(s.vel2);
      setT(s.t);

      if (s.t % 0.05 < dt) {
        setHistVel1([...s.hV1]); setHistVel2([...s.hV2]); setHistMom([...s.hM]);
      }

      if (Math.abs(s.pos1) > 9 && Math.abs(s.pos2) > 9) { setRodando(false); return; }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [rodando, m1, m2, v1p, v2p]);

  return (
    <div className="col-grid">
      <div className="col-side">
        <div className="slbl" style={{ '--sc': C.rose }}>PARÂMETROS</div>
        <Sl label="Massa m₁"    value={m1} onChange={v=>{setM1(v);reset()}} min={0.5} max={10} step={0.1} unit=" kg" color={C.rose}    />
        <Sl label="Velocidade v₁" value={v1} onChange={v=>{setV1(v);reset()}} min={-6} max={6} step={0.1} unit=" m/s" color={C.rose}   />
        <Sl label="Massa m₂"    value={m2} onChange={v=>{setM2(v);reset()}} min={0.5} max={10} step={0.1} unit=" kg" color={C.neon}    />
        <Sl label="Velocidade v₂" value={v2} onChange={v=>{setV2(v);reset()}} min={-6} max={6} step={0.1} unit=" m/s" color={C.neon}   />
        <Sl label="Coef. restituição e" value={e} onChange={v=>{setE(v);reset()}} min={0} max={1} step={0.01} unit="" color={C.amber}   />

        <div className="btn-row">
          <button className="cbtn go" onClick={iniciar} disabled={rodando}>▶ INICIAR</button>
          <button className="cbtn" onClick={() => setRodando(false)} disabled={!rodando}>⏸</button>
          <button className="cbtn danger" onClick={reset}>↺</button>
        </div>
        <button className={`cbtn ${showVec ? 'on' : ''}`} style={{ marginBottom: 14 }} onClick={() => setShowVec(v => !v)}>
          {showVec ? '◉ VETORES ON' : '○ VETORES OFF'}
        </button>

        <div className="mtr-grid">
          <Mtr label="P TOTAL"   value={fmt(pTot, 3)}   unit="kg·m/s" color={C.emerald} />
          <Mtr label="ΔEₖ"       value={fmt(Ek0-Ekf,3)} unit="J"      color={e<1?C.rose:C.emerald} />
          <Mtr label="v₁' teór." value={fmt(v1p, 3)}    unit="m/s"    color={C.rose}    />
          <Mtr label="v₂' teór." value={fmt(v2p, 3)}    unit="m/s"    color={C.neon}    />
        </div>

        <div className="status-badge" style={{
          color: e === 1 ? C.neon : e === 0 ? C.rose : C.amber,
          borderColor: (e === 1 ? C.neon : e === 0 ? C.rose : C.amber) + '33',
          background: (e === 1 ? C.neon : e === 0 ? C.rose : C.amber) + '0a',
        }}>
          {e === 1 ? '◆ COLISÃO ELÁSTICA' : e === 0 ? '◆ PERFEIT. INELÁSTICA' : `◆ PARCIALMENTE INELÁSTICA  e=${fmt(e,2)}`}
        </div>
      </div>

      <div className="col-main">
        <div className="tab-strip">
          <Tab active={aba==='sim'}    onClick={()=>setAba('sim')}    color={C.neon}>SIMULAÇÃO</Tab>
          <Tab active={aba==='teoria'} onClick={()=>setAba('teoria')} color={C.amber}>TEORIA</Tab>
          <Tab active={aba==='graf'}   onClick={()=>setAba('graf')}   color={C.emerald}>GRÁFICOS</Tab>
        </div>

        {aba === 'sim' && (
          <>
            <Col1DCanvas m1={m1} m2={m2} v1={v1} v2={v2} e={e}
              pos1={pos1} pos2={pos2} vel1={vel1} vel2={vel2}
              showVec={showVec} t={t} />
            <div className="col1d-info">
              {`Antes:  p = m₁v₁ + m₂v₂ = ${fmt(m1*v1,3)} + (${fmt(m2*v2,3)}) = ${fmt(pTot,3)} kg·m/s\n`}
              {`        Eₖ = ½m₁v₁² + ½m₂v₂² = ${fmt(Ek0,3)} J\n\n`}
              {`Depois: v₁' = ${fmt(v1p,3)} m/s   v₂' = ${fmt(v2p,3)} m/s\n`}
              {`        Eₖ' = ${fmt(Ekf,3)} J   ΔEₖ = ${fmt(Ek0-Ekf,3)} J`}
            </div>
          </>
        )}

        {aba === 'teoria' && (
          <div className="theory">
            <TC title="01 — CONSERVAÇÃO DO MOMENTO" color={C.neon}>
              <p className="prose">
                Em sistema isolado, o momento total é constante. Para duas partículas:
              </p>
              <div className="eq">{`m₁·v₁ + m₂·v₂ = m₁·v₁' + m₂·v₂'\n\n${fmt(m1,1)}·(${fmt(v1,1)}) + ${fmt(m2,1)}·(${fmt(v2,1)}) = ${fmt(pTot,3)} kg·m/s`}</div>
            </TC>
            <TC title="02 — COEFICIENTE DE RESTITUIÇÃO" color={C.amber}>
              <div className="eq">{`e = (v₂' − v₁') / (v₁ − v₂)\n\ne = 1  → elástica     (Eₖ conservada)\ne = 0  → inelástica   (máx. ΔEₖ)\n0<e<1  → parcialmente inelástica`}</div>
            </TC>
            <TC title="03 — VELOCIDADES PÓS-COLISÃO" color={C.emerald}>
              <div className="eq">{`v₁' = [(m₁ − e·m₂)v₁ + (1+e)m₂v₂] / (m₁+m₂)\nv₁' = ${fmt(v1p,4)} m/s\n\nv₂' = [(m₂ − e·m₁)v₂ + (1+e)m₁v₁] / (m₁+m₂)\nv₂' = ${fmt(v2p,4)} m/s`}</div>
            </TC>
            <TC title="04 — IMPULSO E DERIVADA DO MOMENTO" color={C.rose} open={false}>
              <p className="prose">A <strong>força</strong> é a derivada temporal do momento:</p>
              <div className="eq">{`F = dP/dt\n\nImpulso: J = ∫F dt = ΔP\n\nNa colisão (Δt→0):\nJ_interno = 0  →  ΔP_total = 0`}</div>
            </TC>
          </div>
        )}

        {aba === 'graf' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="chart-row">
              <div className="chart-box">
                <div className="chart-title">VELOCIDADE v₁(t)</div>
                <MiniChart data={histVel1.length>1?histVel1:[{x:0,y:v1}]} color={C.rose} h={90} />
              </div>
              <div className="chart-box">
                <div className="chart-title">VELOCIDADE v₂(t)</div>
                <MiniChart data={histVel2.length>1?histVel2:[{x:0,y:v2}]} color={C.neon} h={90} />
              </div>
              <div className="chart-box">
                <div className="chart-title">MOMENTO P(t)</div>
                <MiniChart data={histMom.length>1?histMom:[{x:0,y:pTot}]} color={C.emerald} h={90} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
//  ROOT
// ══════════════════════════════════════════════════════════════════════════════
export default function ExperimentoColisoes() {
  const [exp, setExp] = useState('pendulo');
  const exps = [
    { id: 'pendulo', label: 'PÊNDULO BALÍSTICO', color: C.neon  },
    { id: 'col1d',   label: 'COLISÕES 1D',        color: C.rose  },
  ];

  return (
    <div className="col-root">
      <style>{css}</style>

      <div className="col-hdr">
        <div className="col-title">COLISÕES E MOMENTUM</div>
        <div className="col-sub">CONSERVAÇÃO DO MOMENTO · PÊNDULO BALÍSTICO · COEFICIENTE DE RESTITUIÇÃO · CÁLCULO</div>
      </div>

      <div className="col-pills">
        {exps.map(e => (
          <button key={e.id} className={`col-pill ${exp===e.id?'on':''}`}
            style={{ '--tc': e.color }} onClick={() => setExp(e.id)}>
            {e.label}
          </button>
        ))}
      </div>

      {exp === 'pendulo' && <PenduloBalistico />}
      {exp === 'col1d'   && <Colisoes1D />}

      <div className="col-footer">
        g = 9,81 m/s²  ·  MECÂNICA CLÁSSICA  ·  CONSERVAÇÃO DE MOMENTO E ENERGIA
      </div>
    </div>
  );
}