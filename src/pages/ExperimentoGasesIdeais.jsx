// src/pages/ExperimentoGasesIdeais.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FISICA2_BASE_STYLES, GAS } from '../styles/fisica2Theme';

// ─── Constantes e utilidades ─────────────────────────────────────────────────
const { R, GAMMA, CV } = GAS;
const fmt = (n, d = 2) => (typeof n === 'number' && isFinite(n) ? n.toFixed(d) : '—');

const STYLES = FISICA2_BASE_STYLES + `
.gauge-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.gauge-val {
  font-family: var(--mono);
  font-size: 28px;
  font-weight: 700;
  color: var(--accent);
}
.gauge-label {
  font-size: 10px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--muted);
}
.pill-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 18px; }
.pill {
  font-family: var(--sans);
  font-size: 12px;
  font-weight: 600;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.2s;
}
.pill:hover { color: var(--text); }
.pill.on {
  border-color: var(--accent);
  color: var(--accent);
  background: rgba(239,68,68,0.1);
}
`;

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════
export default function ExperimentoGasesIdeais() {
  const [tab, setTab] = useState('sim');

  return (
    <>
      <style>{STYLES}</style>
      <div className="app">
        <header className="header">
          <div className="header-title">Gases Ideais</div>
          <div className="header-sub">Física 2 · Termodinâmica</div>
          <span className="header-tag">PV = nRT</span>
        </header>

        <nav className="tabs">
          {[
            ['sim', 'Simulação'],
            ['transform', 'Transformações'],
            ['calc', 'Cálculo & Derivações'],
          ].map(([id, label]) => (
            <button key={id} className={`tab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </nav>

        {tab === 'sim' && <SimTab />}
        {tab === 'transform' && <TransformTab />}
        {tab === 'calc' && <CalcTab />}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ABA 1 — SIMULAÇÃO (pistão + partículas)
// ═══════════════════════════════════════════════════════════════════════════
function SimTab() {
  const [T, setT] = useState(300);
  const [V, setV] = useState(5);
  const [n, setN] = useState(1);
  const [rodando, setRodando] = useState(true);

  const VMAX = 10;
  const P = (n * R * T) / V;
  const KEmed = 1.5 * R * T;            // energia cinética média por mol (unidades de R·T)
  const PV = P * V;
  const nRT = n * R * T;

  const canvasRef = useRef(null);
  const plotPRef = useRef(null);
  const plotVRef = useRef(null);
  const plotTRef = useRef(null);
  const particlesRef = useRef([]);
  const rafRef = useRef(null);
  const lastRef = useRef(null);
  const stateRef = useRef({ T, V, n });
  const histRef = useRef({ P: [], V: [], T: [] });

  useEffect(() => { stateRef.current = { T, V, n }; }, [T, V, n]);

  // Inicializa partículas quando n muda (quantidade visual proporcional a n)
  useEffect(() => {
    const count = Math.round(Math.min(60, Math.max(18, 16 + n * 9)));
    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
    }));
  }, [n]);

  // Loop de animação
  useEffect(() => {
    if (!rodando) { lastRef.current = null; return; }
    const step = (now) => {
      if (lastRef.current !== null) {
        const dt = Math.min((now - lastRef.current) / 1000, 0.05);
        const s = stateRef.current;
        const speedScale = Math.sqrt(s.T / 300) * 0.55;
        particlesRef.current.forEach(p => {
          p.x += p.vx * speedScale * dt;
          p.y += p.vy * speedScale * dt;
          if (p.x < 0) { p.x = 0; p.vx *= -1; }
          if (p.x > 1) { p.x = 1; p.vx *= -1; }
          if (p.y < 0) { p.y = 0; p.vy *= -1; }
          if (p.y > 1) { p.y = 1; p.vy *= -1; }
        });

        const h = histRef.current;
        h.P.push((s.n * R * s.T) / s.V);
        h.V.push(s.V);
        h.T.push(s.T);
        if (h.P.length > 300) { h.P.shift(); h.V.shift(); h.T.shift(); }
      }
      lastRef.current = now;
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [rodando]);

  // Mini-gráfico genérico (autoescala pelos próprios dados)
  const drawMiniPlot = (canvas, data, color, label, unit) => {
    if (!canvas || data.length < 2) return;
    const ctx2 = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const W2 = canvas.clientWidth, H2 = canvas.clientHeight;
    canvas.width = W2 * dpr; canvas.height = H2 * dpr;
    ctx2.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx2.clearRect(0, 0, W2, H2);

    const dMin = Math.min(...data), dMax = Math.max(...data);
    const pad = (dMax - dMin) * 0.15 || Math.abs(dMax) * 0.1 || 1;
    const yMin = dMin - pad, yMax = dMax + pad;
    const range = (yMax - yMin) || 1;

    ctx2.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx2.lineWidth = 1;
    ctx2.beginPath(); ctx2.moveTo(0, H2 / 2); ctx2.lineTo(W2, H2 / 2); ctx2.stroke();

    const toXY = (v, i) => [(i / (data.length - 1)) * W2, H2 - ((v - yMin) / range) * H2];

    ctx2.beginPath();
    data.forEach((v, i) => { const [x, y] = toXY(v, i); i === 0 ? ctx2.moveTo(x, y) : ctx2.lineTo(x, y); });
    ctx2.strokeStyle = color;
    ctx2.lineWidth = 1.8;
    ctx2.stroke();

    const grd = ctx2.createLinearGradient(0, 0, 0, H2);
    grd.addColorStop(0, color + '33'); grd.addColorStop(1, color + '00');
    ctx2.fillStyle = grd;
    ctx2.beginPath();
    data.forEach((v, i) => { const [x, y] = toXY(v, i); i === 0 ? ctx2.moveTo(x, y) : ctx2.lineTo(x, y); });
    ctx2.lineTo(W2, H2); ctx2.lineTo(0, H2); ctx2.closePath(); ctx2.fill();

    ctx2.fillStyle = color;
    ctx2.font = "9px 'JetBrains Mono', monospace";
    ctx2.textAlign = 'left';
    ctx2.fillText(label, 6, 12);
    ctx2.fillStyle = 'rgba(255,255,255,0.6)';
    ctx2.fillText(`${data[data.length - 1].toFixed(2)} ${unit}`, 6, 24);
  };

  // Desenho
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    let raf;
    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const W = cv.clientWidth, H = cv.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      const contW = Math.min(W * 0.46, 300);
      const contLeft = W / 2 - contW / 2;
      const contRight = W / 2 + contW / 2;
      const baseY = H * 0.86;
      const maxHeightPx = H * 0.64;
      const heightPx = (stateRef.current.V / VMAX) * maxHeightPx;
      const pistonY = baseY - heightPx;

      // Paredes do cilindro
      ctx.strokeStyle = 'rgba(239,68,68,0.35)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(contLeft, pistonY - 4);
      ctx.lineTo(contLeft, baseY);
      ctx.lineTo(contRight, baseY);
      ctx.lineTo(contRight, pistonY - 4);
      ctx.stroke();

      // Base
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.fillRect(contLeft, baseY, contW, 10);

      // Partículas
      const speedScale = Math.sqrt(stateRef.current.T / 300);
      particlesRef.current.forEach(p => {
        const px = contLeft + p.x * contW;
        const py = pistonY + p.y * heightPx;
        const glow = Math.min(1, 0.5 + speedScale * 0.3);
        ctx.beginPath();
        ctx.arc(px, py, 3.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(239,68,68,${glow})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(239,68,68,0.6)';
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Pistão
      const gradPistao = ctx.createLinearGradient(0, pistonY - 10, 0, pistonY + 10);
      gradPistao.addColorStop(0, '#4b5563');
      gradPistao.addColorStop(1, '#1f2937');
      ctx.fillStyle = gradPistao;
      ctx.fillRect(contLeft - 6, pistonY - 8, contW + 12, 12);
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(contLeft - 6, pistonY - 8, contW + 12, 12);
      // Haste do pistão
      ctx.fillStyle = '#374151';
      ctx.fillRect(W / 2 - 5, 0, 10, pistonY - 8);

      // Label V (altura do gás)
      ctx.fillStyle = 'rgba(239,68,68,0.7)';
      ctx.font = "11px 'JetBrains Mono', monospace";
      ctx.textAlign = 'left';
      ctx.fillText(`V = ${fmt(stateRef.current.V, 2)} L`, contRight + 10, (pistonY + baseY) / 2);

      const h = histRef.current;
      drawMiniPlot(plotPRef.current, h.P, '#EF4444', 'P(t)', 'atm');
      drawMiniPlot(plotVRef.current, h.V, '#FBBF24', 'V(t)', 'L');
      drawMiniPlot(plotTRef.current, h.T, '#38BDF8', 'T(t)', 'K');

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="content">
      <div className="sidebar-l">
        <div className="section-label">Parâmetros</div>

        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Temperatura T</span><span className="ctrl-num">{fmt(T, 0)} K</span></div>
          <input type="range" min="100" max="1000" step="10" value={T} onChange={e => setT(+e.target.value)} />
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Volume V</span><span className="ctrl-num">{fmt(V, 2)} L</span></div>
          <input type="range" min="1" max={VMAX} step="0.1" value={V} onChange={e => setV(+e.target.value)} />
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Quantidade n</span><span className="ctrl-num">{fmt(n, 2)} mol</span></div>
          <input type="range" min="0.2" max="5" step="0.1" value={n} onChange={e => setN(+e.target.value)} />
        </div>

        <div className="btn-row">
          <button className="btn btn-primary" onClick={() => setRodando(true)}>▶ Iniciar</button>
          <button className="btn btn-secondary" onClick={() => setRodando(false)}>⏸ Pausar</button>
        </div>

        <div className="section-label">Pressão Resultante</div>
        <div className="card gauge-card">
          <div className="gauge-val">{fmt(P, 3)}</div>
          <div className="gauge-label">atm · P = nRT / V</div>
        </div>
      </div>

      <div className="main-area">
        <div className="canvas-wrap"><canvas ref={canvasRef} /></div>
        <div className="plots-strip">
          <div className="plot-box"><div className="plot-title">Pressão P(t)</div><canvas ref={plotPRef} /></div>
          <div className="plot-box"><div className="plot-title">Volume V(t)</div><canvas ref={plotVRef} /></div>
          <div className="plot-box"><div className="plot-title">Temperatura T(t)</div><canvas ref={plotTRef} /></div>
        </div>
      </div>

      <div className="sidebar-r">
        <div className="section-label">Estado do Gás</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">Pressão P</span><span className="stat-val accent">{fmt(P, 3)} atm</span></div>
          <div className="stat-row"><span className="stat-label">Volume V</span><span className="stat-val">{fmt(V, 2)} L</span></div>
          <div className="stat-row"><span className="stat-label">Temperatura T</span><span className="stat-val warm">{fmt(T, 0)} K ({fmt(T - 273.15, 0)} °C)</span></div>
          <div className="stat-row"><span className="stat-label">Quantidade n</span><span className="stat-val cool">{fmt(n, 2)} mol</span></div>
        </div>

        <div className="section-label">Verificação da Lei</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">P·V</span><span className="stat-val purple">{fmt(PV, 3)}</span></div>
          <div className="stat-row"><span className="stat-label">n·R·T</span><span className="stat-val purple">{fmt(nRT, 3)}</span></div>
          <div className="stat-row"><span className="stat-label">Energia cinética média/mol</span><span className="stat-val warm">{fmt(KEmed, 2)} atm·L</span></div>
        </div>

        <div className="section-label">Equação de Estado</div>
        <div className="eq-block">
          <div className="eq-title">Lei dos Gases Ideais</div>
          <span className="sym">P</span>·<span className="sym">V</span> <span className="op">=</span> n·R·<span className="sym">T</span><br />
          <span className="cmt">R = 0,0821 L·atm/(mol·K)</span>
        </div>
        <div className="eq-block">
          <div className="eq-title">Teoria Cinética</div>
          KE<sub>méd</sub> <span className="op">=</span> (3/2)·R·<span className="sym">T</span> <span className="op">por mol</span><br />
          <span className="cmt">Velocidade das partículas ∝ √T</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ABA 2 — TRANSFORMAÇÕES (diagrama P-V)
// ═══════════════════════════════════════════════════════════════════════════
function TransformTab() {
  const [proc, setProc] = useState('isotermica');
  const [n, setN] = useState(1);

  // Parâmetros por tipo de processo
  const [Tconst, setTconst] = useState(400);
  const [Pconst, setPconst] = useState(2);
  const [Vconst, setVconst] = useState(4);
  const [V1, setV1] = useState(3);
  const [V2, setV2] = useState(7);
  const [T1iso, setT1iso] = useState(300);
  const [T2iso, setT2iso] = useState(600);
  const [T1ad, setT1ad] = useState(500);

  const plotRef = useRef(null);

  // Calcula estados 1 e 2 conforme o processo
  let P1, P2, Vi, Vf, Ti, Tf, W, dU, Q, label;

  if (proc === 'isotermica') {
    Vi = V1; Vf = V2; Ti = Tconst; Tf = Tconst;
    P1 = (n * R * Ti) / Vi; P2 = (n * R * Tf) / Vf;
    W = n * R * Ti * Math.log(Vf / Vi);
    dU = 0; Q = W;
    label = 'Isotérmica (T constante)';
  } else if (proc === 'isobarica') {
    Vi = V1; Vf = V2; P1 = Pconst; P2 = Pconst;
    Ti = (Pconst * Vi) / (n * R); Tf = (Pconst * Vf) / (n * R);
    W = Pconst * (Vf - Vi);
    dU = CV * n * R * (Tf - Ti);
    Q = dU + W;
    label = 'Isobárica (P constante)';
  } else if (proc === 'isocorica') {
    Vi = Vconst; Vf = Vconst; Ti = T1iso; Tf = T2iso;
    P1 = (n * R * Ti) / Vconst; P2 = (n * R * Tf) / Vconst;
    W = 0;
    dU = CV * n * R * (Tf - Ti);
    Q = dU;
    label = 'Isocórica (V constante)';
  } else {
    Vi = V1; Vf = V2; Ti = T1ad;
    P1 = (n * R * Ti) / Vi;
    P2 = P1 * Math.pow(Vi / Vf, GAMMA);
    Tf = (P2 * Vf) / (n * R);
    dU = CV * n * R * (Tf - Ti);
    W = -dU;
    Q = 0;
    label = 'Adiabática (Q = 0)';
  }

  // Desenho do diagrama P-V
  useEffect(() => {
    const cv = plotRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const W_ = cv.clientWidth, H_ = cv.clientHeight;
    cv.width = W_ * dpr; cv.height = H_ * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W_, H_);

    const pad = { l: 55, r: 20, t: 20, b: 40 };
    const plotW = W_ - pad.l - pad.r;
    const plotH = H_ - pad.t - pad.b;

    const maxV = 11, maxP = Math.max(P1, P2) * 1.3 + 0.5;
    const toX = v => pad.l + (v / maxV) * plotW;
    const toY = p => pad.t + plotH - (p / maxP) * plotH;

    // Eixos
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, pad.t + plotH); ctx.lineTo(pad.l + plotW, pad.t + plotH); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = "11px 'JetBrains Mono', monospace";
    ctx.textAlign = 'center';
    ctx.fillText('V (L)', pad.l + plotW / 2, H_ - 10);
    ctx.save();
    ctx.translate(16, pad.t + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('P (atm)', 0, 0);
    ctx.restore();

    // Curva do processo
    const pts = [];
    const steps = 40;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const v = Vi + (Vf - Vi) * t;
      let p;
      if (proc === 'isotermica') p = (n * R * Ti) / v;
      else if (proc === 'isobarica') p = Pconst;
      else if (proc === 'isocorica') p = P1 + (P2 - P1) * t;
      else p = P1 * Math.pow(Vi / v, GAMMA);
      pts.push([v, p]);
    }

    // Área sob a curva (trabalho)
    ctx.beginPath();
    ctx.moveTo(toX(pts[0][0]), toY(0));
    pts.forEach(([v, p]) => ctx.lineTo(toX(v), toY(p)));
    ctx.lineTo(toX(pts[pts.length - 1][0]), toY(0));
    ctx.closePath();
    ctx.fillStyle = 'rgba(251,191,36,0.15)';
    ctx.fill();

    // Curva
    ctx.beginPath();
    pts.forEach(([v, p], i) => i === 0 ? ctx.moveTo(toX(v), toY(p)) : ctx.lineTo(toX(v), toY(p)));
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Pontos de estado
    [[Vi, P1, '1'], [Vf, P2, '2']].forEach(([v, p, lbl]) => {
      ctx.beginPath();
      ctx.arc(toX(v), toY(p), 5, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#F3F4F6';
      ctx.font = "bold 11px 'JetBrains Mono', monospace";
      ctx.fillText(lbl, toX(v), toY(p) - 12);
    });
  }, [proc, n, Tconst, Pconst, Vconst, V1, V2, T1iso, T2iso, T1ad, P1, P2, Vi, Vf, Ti]);

  return (
    <div className="content">
      <div className="sidebar-l">
        <div className="section-label">Tipo de Transformação</div>
        <div className="pill-row">
          {[
            ['isotermica', 'Isotérmica'],
            ['isobarica', 'Isobárica'],
            ['isocorica', 'Isocórica'],
            ['adiabatica', 'Adiabática'],
          ].map(([id, lbl]) => (
            <button key={id} className={`pill ${proc === id ? 'on' : ''}`} onClick={() => setProc(id)}>{lbl}</button>
          ))}
        </div>

        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Quantidade n</span><span className="ctrl-num">{fmt(n, 2)} mol</span></div>
          <input type="range" min="0.2" max="5" step="0.1" value={n} onChange={e => setN(+e.target.value)} />
        </div>

        {proc === 'isotermica' && (
          <div className="ctrl">
            <div className="ctrl-head"><span className="ctrl-name">Temperatura (constante)</span><span className="ctrl-num">{fmt(Tconst, 0)} K</span></div>
            <input type="range" min="150" max="900" step="10" value={Tconst} onChange={e => setTconst(+e.target.value)} />
          </div>
        )}
        {proc === 'isobarica' && (
          <div className="ctrl">
            <div className="ctrl-head"><span className="ctrl-name">Pressão (constante)</span><span className="ctrl-num">{fmt(Pconst, 2)} atm</span></div>
            <input type="range" min="0.5" max="5" step="0.1" value={Pconst} onChange={e => setPconst(+e.target.value)} />
          </div>
        )}
        {proc === 'isocorica' && (
          <div className="ctrl">
            <div className="ctrl-head"><span className="ctrl-name">Volume (constante)</span><span className="ctrl-num">{fmt(Vconst, 2)} L</span></div>
            <input type="range" min="1" max="10" step="0.1" value={Vconst} onChange={e => setVconst(+e.target.value)} />
          </div>
        )}
        {proc === 'adiabatica' && (
          <div className="ctrl">
            <div className="ctrl-head"><span className="ctrl-name">Temperatura inicial T₁</span><span className="ctrl-num">{fmt(T1ad, 0)} K</span></div>
            <input type="range" min="150" max="900" step="10" value={T1ad} onChange={e => setT1ad(+e.target.value)} />
          </div>
        )}

        {(proc === 'isotermica' || proc === 'isobarica' || proc === 'adiabatica') && (
          <>
            <div className="ctrl">
              <div className="ctrl-head"><span className="ctrl-name">Volume inicial V₁</span><span className="ctrl-num">{fmt(V1, 2)} L</span></div>
              <input type="range" min="1" max="10" step="0.1" value={V1} onChange={e => setV1(+e.target.value)} />
            </div>
            <div className="ctrl">
              <div className="ctrl-head"><span className="ctrl-name">Volume final V₂</span><span className="ctrl-num">{fmt(V2, 2)} L</span></div>
              <input type="range" min="1" max="10" step="0.1" value={V2} onChange={e => setV2(+e.target.value)} />
            </div>
          </>
        )}
        {proc === 'isocorica' && (
          <>
            <div className="ctrl">
              <div className="ctrl-head"><span className="ctrl-name">Temperatura inicial T₁</span><span className="ctrl-num">{fmt(T1iso, 0)} K</span></div>
              <input type="range" min="100" max="900" step="10" value={T1iso} onChange={e => setT1iso(+e.target.value)} />
            </div>
            <div className="ctrl">
              <div className="ctrl-head"><span className="ctrl-name">Temperatura final T₂</span><span className="ctrl-num">{fmt(T2iso, 0)} K</span></div>
              <input type="range" min="100" max="900" step="10" value={T2iso} onChange={e => setT2iso(+e.target.value)} />
            </div>
          </>
        )}
      </div>

      <div className="main-area">
        <div className="canvas-wrap"><canvas ref={plotRef} /></div>
      </div>

      <div className="sidebar-r">
        <div className="section-label">{label}</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">Estado 1 — P₁, V₁, T₁</span><span className="stat-val accent">{fmt(P1, 2)} atm · {fmt(Vi, 2)} L · {fmt(Ti, 0)} K</span></div>
          <div className="stat-row"><span className="stat-label">Estado 2 — P₂, V₂, T₂</span><span className="stat-val accent">{fmt(P2, 2)} atm · {fmt(Vf, 2)} L · {fmt(Tf, 0)} K</span></div>
        </div>

        <div className="section-label">1ª Lei da Termodinâmica</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">Trabalho W</span><span className="stat-val warm">{fmt(W, 2)} atm·L</span></div>
          <div className="stat-row"><span className="stat-label">Variação de Energia Interna ΔU</span><span className="stat-val cool">{fmt(dU, 2)} atm·L</span></div>
          <div className="stat-row"><span className="stat-label">Calor Trocado Q</span><span className="stat-val purple">{fmt(Q, 2)} atm·L</span></div>
        </div>

        <div className="section-label">Fórmulas</div>
        <div className="eq-block">
          <div className="eq-title">1ª Lei</div>
          Δ<span className="sym">U</span> <span className="op">=</span> <span className="sym">Q</span> − <span className="sym">W</span>
        </div>
        <div className="eq-block">
          <div className="eq-title">Trabalho deste processo</div>
          {proc === 'isotermica' && <>W = nRT·ln(V₂/V₁)</>}
          {proc === 'isobarica' && <>W = P·(V₂ − V₁)</>}
          {proc === 'isocorica' && <>W = 0 <span className="cmt">(V constante)</span></>}
          {proc === 'adiabatica' && <>P·V<sup>γ</sup> = constante <span className="cmt">(γ=1,4)</span></>}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ABA 3 — CÁLCULO & DERIVAÇÕES
// ═══════════════════════════════════════════════════════════════════════════
function CalcTab() {
  return (
    <div className="main-area" style={{ overflow: 'auto' }}>
      <div className="calc-page">

        <div className="calc-section">
          <div className="calc-h2">1. Da Teoria Cinética à Lei dos Gases Ideais</div>
          <p className="calc-p">
            Um gás ideal é modelado como um conjunto de partículas puntiformes em movimento aleatório, colidindo
            elasticamente entre si e com as paredes do recipiente. A pressão surge da taxa de transferência de
            momento nas colisões com a parede:
          </p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">P = (1/3)·(N/V)·m·⟨v²⟩</span><span className="step-desc">pressão cinética</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq">⟨KE⟩ = (1/2)m⟨v²⟩ = (3/2)k<span className="hi-warm">T</span></span><span className="step-desc">energia cinética média por partícula</span></div>
            <div className="derivation-step"><span className="step-num">③</span><span className="step-eq">P·V = N·k·<span className="hi-warm">T</span> = n·R·<span className="hi-warm">T</span></span><span className="step-desc">lei dos gases ideais (N=n·Nₐ, R=k·Nₐ)</span></div>
          </div>
        </div>

        <div className="calc-section">
          <div className="calc-h2">2. Trabalho Realizado por um Gás</div>
          <p className="calc-p">
            Quando um gás se expande ou é comprimido contra uma pressão externa P, ele realiza (ou recebe) trabalho.
            Para um deslocamento infinitesimal dV do pistão:
          </p>
          <div className="big-eq">
            <span className="hi-acc">W</span> = <span className="hi-pur">∫</span><sub>V₁</sub><sup>V₂</sup> <span className="sym">P</span> dV
            <span className="cmt">   ← área sob a curva no diagrama P-V</span>
          </div>
          <p className="calc-p">Para cada tipo de transformação, essa integral resulta em:</p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">Isotérmica</span><span className="step-eq">W = nRT·ln(V₂/V₁)</span><span className="step-desc">P = nRT/V substituído na integral</span></div>
            <div className="derivation-step"><span className="step-num">Isobárica</span><span className="step-eq">W = P·(V₂ − V₁)</span><span className="step-desc">P constante sai da integral</span></div>
            <div className="derivation-step"><span className="step-num">Isocórica</span><span className="step-eq">W = 0</span><span className="step-desc">dV = 0 em todo o processo</span></div>
            <div className="derivation-step"><span className="step-num">Adiabática</span><span className="step-eq">W = −ΔU = −nCᵥ(T₂ − T₁)</span><span className="step-desc">Q=0 → 1ª Lei dá W diretamente</span></div>
          </div>
        </div>

        <div className="calc-section">
          <div className="calc-h2">3. Energia Interna e a Primeira Lei da Termodinâmica</div>
          <p className="calc-p">
            Para um gás ideal, a energia interna depende apenas da temperatura (não de P ou V):
          </p>
          <div className="big-eq">
            <span className="hi-cool">U</span> = n·C<sub>V</sub>·<span className="hi-warm">T</span> = (5/2)·n·R·<span className="hi-warm">T</span>
            <span className="cmt">   ← Cᵥ = (5/2)R para gás diatômico (ex: ar)</span>
          </div>
          <p className="calc-p">A 1ª Lei da Termodinâmica relaciona calor, trabalho e energia interna:</p>
          <div className="big-eq">
            Δ<span className="hi-cool">U</span> = <span className="hi-acc">Q</span> − <span className="hi-acc">W</span>
            <span className="cmt">   ← convenção: W &gt; 0 quando o gás se expande</span>
          </div>
        </div>

        <div className="calc-section">
          <div className="calc-h2">4. Derivação da Adiabática (P·Vᵞ = constante)</div>
          <p className="calc-p">Numa transformação adiabática, Q=0. Combinando a 1ª Lei com dU=nCᵥdT e W=PdV:</p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">n·Cᵥ·dT = −P·dV</span><span className="step-desc">1ª Lei com Q=0</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq">Diferenciando PV=nRT: n·R·dT = P·dV + V·dP</span><span className="step-desc">derivada da equação de estado</span></div>
            <div className="derivation-step"><span className="step-num">③</span><span className="step-eq">Eliminando dT entre ① e ②: (Cᵥ+R)·P·dV = −Cᵥ·V·dP</span><span className="step-desc">substituição algébrica</span></div>
            <div className="derivation-step"><span className="step-num">④</span><span className="step-eq">γ·dV/V = −dP/P,  γ = (Cᵥ+R)/Cᵥ = Cₚ/Cᵥ</span><span className="step-desc">separando variáveis</span></div>
            <div className="derivation-step"><span className="step-num">⑤</span><span className="step-eq">Integrando: <span className="hi-acc">P·Vᵞ = constante</span></span><span className="step-desc">resultado final</span></div>
          </div>
        </div>

        <div className="calc-section">
          <div className="calc-h2">5. Exemplo Numérico</div>
          <p className="calc-p">
            1 mol de gás ideal se expande isotermicamente a T=400K, de V₁=3L até V₂=7L.
          </p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">P₁ = nRT/V₁ = 1·0,0821·400/3 = 10,95 atm</span><span className="step-desc">pressão inicial</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq">P₂ = nRT/V₂ = 1·0,0821·400/7 = 4,69 atm</span><span className="step-desc">pressão final</span></div>
            <div className="derivation-step"><span className="step-num">③</span><span className="step-eq">W = nRT·ln(7/3) = 1·0,0821·400·0,847 = 27,82 atm·L</span><span className="step-desc">trabalho realizado pelo gás</span></div>
            <div className="derivation-step"><span className="step-num">④</span><span className="step-eq">ΔU = 0 → Q = W = 27,82 atm·L</span><span className="step-desc">todo o calor vira trabalho</span></div>
          </div>
        </div>

      </div>
    </div>
  );
}
