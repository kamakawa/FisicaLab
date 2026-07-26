// src/pages/ExperimentoMHS.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FISICA2_BASE_STYLES } from '../styles/fisica2Theme';

const TAU = 2 * Math.PI;
const fmt = (n, d = 2) => (typeof n === 'number' && isFinite(n) ? n.toFixed(d) : '—');

const STYLES = FISICA2_BASE_STYLES + `
.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  font-family: var(--mono);
}
`;

// ─── Soluções analíticas do oscilador amortecido (x(0)=x0, v(0)=0) ───────────
function xSubamortecido(t, x0, gamma, omega0) {
  const wd = Math.sqrt(Math.max(1e-9, omega0 * omega0 - gamma * gamma));
  return x0 * Math.exp(-gamma * t) * (Math.cos(wd * t) + (gamma / wd) * Math.sin(wd * t));
}
function xCritico(t, x0, gamma) {
  return x0 * (1 + gamma * t) * Math.exp(-gamma * t);
}
function xSobreamortecido(t, x0, gamma, omega0) {
  const wh = Math.sqrt(Math.max(1e-9, gamma * gamma - omega0 * omega0));
  return x0 * Math.exp(-gamma * t) * (Math.cosh(wh * t) + (gamma / wh) * Math.sinh(wh * t));
}
function xAmortecido(t, x0, gamma, omega0) {
  if (gamma < omega0 * 0.99) return xSubamortecido(t, x0, gamma, omega0);
  if (gamma > omega0 * 1.01) return xSobreamortecido(t, x0, gamma, omega0);
  return xCritico(t, x0, gamma);
}
function classificar(gamma, omega0) {
  if (gamma < omega0 * 0.99) return { id: 'sub', label: 'SUBAMORTECIDO', cor: '#38BDF8' };
  if (gamma > omega0 * 1.01) return { id: 'sobre', label: 'SOBREAMORTECIDO', cor: '#FBBF24' };
  return { id: 'critico', label: 'CRITICAMENTE AMORTECIDO', cor: '#EF4444' };
}

// Mini-gráfico genérico (autoescala pelos próprios dados)
function drawMiniPlot(canvas, data, color, label, unit) {
  if (!canvas || data.length < 2) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.clientWidth, H = canvas.clientHeight;
  canvas.width = W * dpr; canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);

  const dMin = Math.min(...data), dMax = Math.max(...data);
  const pad = (dMax - dMin) * 0.15 || Math.abs(dMax) * 0.1 || 1;
  const yMin = dMin - pad, yMax = dMax + pad;
  const range = (yMax - yMin) || 1;

  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke();

  const toXY = (v, i) => [(i / (data.length - 1)) * W, H - ((v - yMin) / range) * H];
  ctx.beginPath();
  data.forEach((v, i) => { const [x, y] = toXY(v, i); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.8;
  ctx.stroke();

  const grd = ctx.createLinearGradient(0, 0, 0, H);
  grd.addColorStop(0, color + '33'); grd.addColorStop(1, color + '00');
  ctx.fillStyle = grd;
  ctx.beginPath();
  data.forEach((v, i) => { const [x, y] = toXY(v, i); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
  ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();

  ctx.fillStyle = color;
  ctx.font = "9px 'JetBrains Mono', monospace";
  ctx.textAlign = 'left';
  ctx.fillText(label, 6, 12);
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillText(`${data[data.length - 1].toFixed(2)} ${unit}`, 6, 24);
}

// Desenha uma mola em zigue-zague entre dois pontos horizontais
function drawSpring(ctx, x1, x2, y, coils, amp, color) {
  ctx.beginPath();
  ctx.moveTo(x1, y);
  const seg = (x2 - x1) / (coils * 2);
  for (let i = 0; i < coils * 2; i++) {
    const xx = x1 + seg * (i + 1);
    const yy = y + (i % 2 === 0 ? -amp : amp);
    ctx.lineTo(xx, yy);
  }
  ctx.lineTo(x2, y);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════
export default function ExperimentoMHS() {
  const [tab, setTab] = useState('sim');

  return (
    <>
      <style>{STYLES}</style>
      <div className="app">
        <header className="header">
          <div className="header-title">Oscilações Harmônicas</div>
          <div className="header-sub">Física 2 · Ondas</div>
          <span className="header-tag">x(t) = A·cos(ωt+φ)</span>
        </header>

        <nav className="tabs">
          {[
            ['sim', 'Simulação'],
            ['regimes', 'Regimes de Amortecimento'],
            ['calc', 'Cálculo & Derivações'],
          ].map(([id, label]) => (
            <button key={id} className={`tab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </nav>

        {tab === 'sim' && <SimTab />}
        {tab === 'regimes' && <RegimesTab />}
        {tab === 'calc' && <CalcTab />}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ABA 1 — SIMULAÇÃO (massa-mola)
// ═══════════════════════════════════════════════════════════════════════════
function SimTab() {
  const [m, setM] = useState(1);
  const [k, setK] = useState(15);
  const [x0, setX0] = useState(0.25);
  const [gamma, setGamma] = useState(0.15);
  const [rodando, setRodando] = useState(true);

  const omega0 = Math.sqrt(k / m);
  const periodo0 = TAU / omega0;

  const stateRef = useRef({ m, k, gamma });
  useEffect(() => { stateRef.current = { m, k, gamma }; }, [m, k, gamma]);

  const posRef = useRef({ x: x0, v: 0 });
  const tRef = useRef(0);
  const histRef = useRef({ x: [], v: [], E: [] });
  const [disp, setDisp] = useState({ x: x0, v: 0 });

  useEffect(() => {
    posRef.current = { x: x0, v: 0 };
    tRef.current = 0;
    histRef.current = { x: [], v: [], E: [] };
    setDisp({ x: x0, v: 0 });
    setRodando(true);
  }, [x0, m, k, gamma]);

  const rafRef = useRef(null);
  const lastRef = useRef(null);
  useEffect(() => {
    if (!rodando) { lastRef.current = null; return; }
    const step = (now) => {
      if (lastRef.current !== null) {
        const dt = Math.min((now - lastRef.current) / 1000, 0.02);
        const s = stateRef.current;
        const p = posRef.current;
        const omega0sq = s.k / s.m;
        const a = -2 * s.gamma * p.v - omega0sq * p.x;
        p.v += a * dt;
        p.x += p.v * dt;
        tRef.current += dt;

        const Ep = 0.5 * s.k * p.x * p.x;
        const Ec = 0.5 * s.m * p.v * p.v;
        const h = histRef.current;
        h.x.push(p.x); h.v.push(p.v); h.E.push(Ep + Ec);
        if (h.x.length > 300) { h.x.shift(); h.v.shift(); h.E.shift(); }

        setDisp({ x: p.x, v: p.v });
      }
      lastRef.current = now;
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [rodando]);

  const Ep = 0.5 * k * disp.x * disp.x;
  const Ec = 0.5 * m * disp.v * disp.v;
  const Et = Ep + Ec;
  const E0 = 0.5 * k * x0 * x0;

  const canvasRef = useRef(null);
  const plotXRef = useRef(null);
  const plotVRef = useRef(null);
  const plotERef = useRef(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    let raf;
    const ctx = cv.getContext('2d');
    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const W = cv.clientWidth, H = cv.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      const eqX = W * 0.55;
      const scale = Math.min(180, (W * 0.32) / 0.35);
      const wallX = W * 0.1;
      const midY = H * 0.45;

      // Parede
      ctx.fillStyle = 'rgba(239,68,68,0.4)';
      ctx.fillRect(wallX - 10, midY - 60, 10, 120);

      // Régua de equilíbrio
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.beginPath(); ctx.moveTo(eqX, midY - 70); ctx.lineTo(eqX, midY + 90); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.textAlign = 'center';
      ctx.fillText('x=0 (equilíbrio)', eqX, midY + 105);

      const px = eqX + posRef.current.x * scale;

      // Mola
      drawSpring(ctx, wallX, px - 22, midY, 12, 14, 'rgba(56,189,248,0.7)');

      // Massa
      const gradM = ctx.createLinearGradient(px - 22, midY - 22, px + 22, midY + 22);
      gradM.addColorStop(0, '#ff9d9d');
      gradM.addColorStop(1, '#EF4444');
      ctx.fillStyle = gradM;
      ctx.beginPath();
      ctx.roundRect(px - 22, midY - 22, 44, 44, 6);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = "bold 11px 'JetBrains Mono', monospace";
      ctx.fillText(`${fmt(stateRef.current.m, 1)}kg`, px, midY + 4);

      // Vetor velocidade
      const vLen = Math.max(-70, Math.min(70, posRef.current.v * scale * 0.3));
      if (Math.abs(vLen) > 2) {
        ctx.beginPath();
        ctx.moveTo(px, midY - 40);
        ctx.lineTo(px + vLen, midY - 40);
        ctx.strokeStyle = '#00F5C4';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        const dir = vLen >= 0 ? 1 : -1;
        ctx.beginPath();
        ctx.moveTo(px + vLen, midY - 40);
        ctx.lineTo(px + vLen - dir * 8, midY - 44);
        ctx.lineTo(px + vLen - dir * 8, midY - 36);
        ctx.closePath();
        ctx.fillStyle = '#00F5C4';
        ctx.fill();
      }

      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.textAlign = 'left';
      ctx.fillText(`x = ${fmt(posRef.current.x, 3)} m`, W * 0.72, midY - 60);
      ctx.fillText(`v = ${fmt(posRef.current.v, 3)} m/s`, W * 0.72, midY - 44);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const h = histRef.current;
    drawMiniPlot(plotXRef.current, h.x, '#EF4444', 'x(t)', 'm');
    drawMiniPlot(plotVRef.current, h.v, '#00F5C4', 'v(t)', 'm/s');
    drawMiniPlot(plotERef.current, h.E, '#FBBF24', 'E(t)', 'J');
  });

  return (
    <div className="content">
      <div className="sidebar-l">
        <div className="section-label">Sistema Massa-Mola</div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Massa m</span><span className="ctrl-num">{fmt(m, 2)} kg</span></div>
          <input type="range" min="0.2" max="3" step="0.1" value={m} onChange={e => setM(+e.target.value)} />
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Constante elástica k</span><span className="ctrl-num">{fmt(k, 1)} N/m</span></div>
          <input type="range" min="5" max="50" step="1" value={k} onChange={e => setK(+e.target.value)} />
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Amplitude inicial x₀</span><span className="ctrl-num">{fmt(x0, 2)} m</span></div>
          <input type="range" min="0.05" max="0.35" step="0.01" value={x0} onChange={e => setX0(+e.target.value)} />
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Amortecimento γ</span><span className="ctrl-num">{fmt(gamma, 2)} /s</span></div>
          <input type="range" min="0" max="3" step="0.05" value={gamma} onChange={e => setGamma(+e.target.value)} />
        </div>

        <div className="btn-row">
          <button className="btn btn-primary" onClick={() => setRodando(true)}>▶ Iniciar</button>
          <button className="btn btn-secondary" onClick={() => setRodando(false)}>⏸ Pausar</button>
        </div>
      </div>

      <div className="main-area">
        <div className="canvas-wrap"><canvas ref={canvasRef} /></div>
        <div className="plots-strip">
          <div className="plot-box"><div className="plot-title">Posição x(t)</div><canvas ref={plotXRef} /></div>
          <div className="plot-box"><div className="plot-title">Velocidade v(t)</div><canvas ref={plotVRef} /></div>
          <div className="plot-box"><div className="plot-title">Energia E(t)</div><canvas ref={plotERef} /></div>
        </div>
      </div>

      <div className="sidebar-r">
        <div className="section-label">Grandezas Naturais</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">Freq. angular natural ω₀</span><span className="stat-val accent">{fmt(omega0, 3)} rad/s</span></div>
          <div className="stat-row"><span className="stat-label">Período natural T₀</span><span className="stat-val warm">{fmt(periodo0, 3)} s</span></div>
          <div className="stat-row"><span className="stat-label">Frequência f₀</span><span className="stat-val cool">{fmt(1 / periodo0, 3)} Hz</span></div>
        </div>

        <div className="section-label">Energia Mecânica</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">Ep (elástica)</span><span className="stat-val warm">{fmt(Ep, 3)} J</span></div>
          <div className="stat-row"><span className="stat-label">Ec (cinética)</span><span className="stat-val cool">{fmt(Ec, 3)} J</span></div>
          <div className="stat-row"><span className="stat-label">Et (total atual)</span><span className="stat-val accent">{fmt(Et, 3)} J</span></div>
          <div className="stat-row"><span className="stat-label">E₀ (inicial)</span><span className="stat-val purple">{fmt(E0, 3)} J</span></div>
        </div>

        <div className="section-label">Equações</div>
        <div className="eq-block">
          <div className="eq-title">Frequência Angular</div>
          <span className="sym">ω₀</span> <span className="op">=</span> √(k/m)
        </div>
        <div className="eq-block">
          <div className="eq-title">Equação de Movimento</div>
          <span className="sym">x''</span> <span className="op">=</span> −2γ·x' − ω₀²·x
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ABA 2 — REGIMES DE AMORTECIMENTO
// ═══════════════════════════════════════════════════════════════════════════
function RegimesTab() {
  const [m, setM] = useState(1);
  const [k, setK] = useState(15);
  const [x0, setX0] = useState(0.25);
  const [gamma, setGamma] = useState(1.5);

  const omega0 = Math.sqrt(k / m);
  const regime = classificar(gamma, omega0);

  // Mantém γ dentro do intervalo do slider (que depende de ω₀) ao mudar m/k
  useEffect(() => {
    const max = Math.max(3, omega0 * 2.5);
    if (gamma > max) setGamma(max);
  }, [m, k]);

  const canvasRef = useRef(null);
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const W = cv.clientWidth, H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    const pad = { l: 55, r: 20, t: 24, b: 40 };
    const plotW = W - pad.l - pad.r;
    const plotH = H - pad.t - pad.b;
    const tMax = Math.max(6, (TAU / omega0) * 3);
    const toX = t => pad.l + (t / tMax) * plotW;
    const toY = x => pad.t + plotH / 2 - (x / (x0 * 1.2)) * (plotH / 2);

    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, pad.t + plotH); ctx.lineTo(pad.l + plotW, pad.t + plotH); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(pad.l, toY(0)); ctx.lineTo(pad.l + plotW, toY(0)); ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = "11px 'JetBrains Mono', monospace";
    ctx.textAlign = 'center';
    ctx.fillText('t (s)', pad.l + plotW / 2, H - 10);
    ctx.save();
    ctx.translate(16, pad.t + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('x (m)', 0, 0);
    ctx.restore();

    // Referência: criticamente amortecido (sempre desenhado, tracejado)
    ctx.beginPath();
    ctx.setLineDash([5, 5]);
    for (let i = 0; i <= 200; i++) {
      const t = (i / 200) * tMax;
      const xv = xCritico(t, x0, omega0);
      i === 0 ? ctx.moveTo(toX(t), toY(xv)) : ctx.lineTo(toX(t), toY(xv));
    }
    ctx.strokeStyle = 'rgba(239,68,68,0.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.setLineDash([]);

    // Curva atual (regime escolhido pelo usuário)
    ctx.beginPath();
    for (let i = 0; i <= 200; i++) {
      const t = (i / 200) * tMax;
      const xv = xAmortecido(t, x0, gamma, omega0);
      i === 0 ? ctx.moveTo(toX(t), toY(xv)) : ctx.lineTo(toX(t), toY(xv));
    }
    ctx.strokeStyle = regime.cor;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.textAlign = 'left';
    ctx.fillText('- - - crítico (γ=ω₀), para referência', pad.l + 8, pad.t + 14);
  }, [m, k, x0, gamma, omega0, regime]);

  return (
    <div className="content">
      <div className="sidebar-l">
        <div className="section-label">Sistema</div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Massa m</span><span className="ctrl-num">{fmt(m, 2)} kg</span></div>
          <input type="range" min="0.2" max="3" step="0.1" value={m} onChange={e => setM(+e.target.value)} />
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Constante elástica k</span><span className="ctrl-num">{fmt(k, 1)} N/m</span></div>
          <input type="range" min="5" max="50" step="1" value={k} onChange={e => setK(+e.target.value)} />
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Deslocamento inicial x₀</span><span className="ctrl-num">{fmt(x0, 2)} m</span></div>
          <input type="range" min="0.05" max="0.35" step="0.01" value={x0} onChange={e => setX0(+e.target.value)} />
        </div>

        <div className="section-label">Amortecimento</div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Coeficiente γ</span><span className="ctrl-num">{fmt(gamma, 2)} /s</span></div>
          <input type="range" min="0.05" max={Math.max(3, omega0 * 2.5)} step="0.02" value={gamma} onChange={e => setGamma(+e.target.value)} />
        </div>
        <p style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.6 }}>
          Arraste γ de baixo pra cima e observe: poucas oscilações que decaem devagar (subamortecido) →
          retorno mais rápido possível sem oscilar (crítico) → retorno lento e sem oscilar (sobreamortecido).
        </p>

        <div className="card" style={{ marginTop: 16 }}>
          <span className="status-badge" style={{ background: regime.cor + '22', color: regime.cor }}>
            {regime.label}
          </span>
        </div>
      </div>

      <div className="main-area">
        <div className="canvas-wrap"><canvas ref={canvasRef} /></div>
      </div>

      <div className="sidebar-r">
        <div className="section-label">Classificação</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">ω₀ (natural)</span><span className="stat-val accent">{fmt(omega0, 3)} rad/s</span></div>
          <div className="stat-row"><span className="stat-label">γ (amortecimento)</span><span className="stat-val warm">{fmt(gamma, 3)} /s</span></div>
          <div className="stat-row"><span className="stat-label">γ / ω₀</span><span className="stat-val purple">{fmt(gamma / omega0, 3)}</span></div>
        </div>

        <div className="section-label">Critério</div>
        <div className="eq-block">
          <div className="eq-title">Subamortecido</div>
          γ <span className="op">&lt;</span> ω₀ <span className="cmt">→ oscila com amplitude decrescente</span>
        </div>
        <div className="eq-block">
          <div className="eq-title">Criticamente Amortecido</div>
          γ <span className="op">=</span> ω₀ <span className="cmt">→ retorno mais rápido, sem oscilar</span>
        </div>
        <div className="eq-block">
          <div className="eq-title">Sobreamortecido</div>
          γ <span className="op">&gt;</span> ω₀ <span className="cmt">→ retorno lento, sem oscilar</span>
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
          <div className="calc-h2">1. Equação Diferencial do MHS</div>
          <p className="calc-p">
            Uma massa presa a uma mola ideal sofre uma força restauradora proporcional ao deslocamento
            (Lei de Hooke). Pela 2ª Lei de Newton:
          </p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">F = −k·x = m·x''</span><span className="step-desc">Lei de Hooke + 2ª Lei de Newton</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq"><span className="hi-acc">x'' + ω₀²·x = 0</span>,  ω₀ = √(k/m)</span><span className="step-desc">equação diferencial do MHS</span></div>
          </div>
        </div>

        <div className="calc-section">
          <div className="calc-h2">2. Solução Geral e suas Derivadas</div>
          <p className="calc-p">A solução geral dessa equação diferencial é uma função senoidal:</p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq"><span className="hi-acc">x(t) = A·cos(ω₀t + φ)</span></span><span className="step-desc">posição</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq"><span className="hi-cool">v(t) = x'(t) = −Aω₀·sen(ω₀t + φ)</span></span><span className="step-desc">velocidade</span></div>
            <div className="derivation-step"><span className="step-num">③</span><span className="step-eq"><span className="hi-warm">a(t) = v'(t) = −Aω₀²·cos(ω₀t + φ) = −ω₀²·x</span></span><span className="step-desc">aceleração</span></div>
          </div>
          <p className="calc-p">A e φ (amplitude e fase) são determinadas pelas condições iniciais x(0) e v(0).</p>
        </div>

        <div className="calc-section">
          <div className="calc-h2">3. Energia Mecânica no MHS</div>
          <p className="calc-p">Substituindo as soluções de x(t) e v(t) nas energias potencial e cinética:</p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">E_p = ½kx² = ½kA²cos²(ω₀t+φ)</span><span className="step-desc">energia potencial elástica</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq">E_c = ½mv² = ½mA²ω₀²sen²(ω₀t+φ) = ½kA²sen²(ω₀t+φ)</span><span className="step-desc">energia cinética (usando mω₀²=k)</span></div>
            <div className="derivation-step"><span className="step-num">③</span><span className="step-eq"><span className="hi-acc">E = E_p + E_c = ½kA²</span> (constante)</span><span className="step-desc">cos²+sen²=1 — energia total conservada</span></div>
          </div>
        </div>

        <div className="calc-section">
          <div className="calc-h2">4. Oscilador Amortecido — os Três Regimes</div>
          <p className="calc-p">
            Adicionando uma força de resistência proporcional à velocidade (F_amort=−b·v), a equação se torna:
          </p>
          <div className="big-eq">
            m·x'' + b·x' + k·x = 0 &nbsp;→&nbsp; <span className="hi-acc">x'' + 2γ·x' + ω₀²·x = 0</span>, γ = b/(2m)
          </div>
          <p className="calc-p">
            Buscando soluções x=e^(rt), obtemos a equação característica r²+2γr+ω₀²=0, cujas raízes são
            r=−γ±√(γ²−ω₀²). O sinal do discriminante define o regime:
          </p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">γ&lt;ω₀</span><span className="step-eq">raízes complexas → x(t)=e^(−γt)[A·cos(ω_d t)+B·sen(ω_d t)]</span><span className="step-desc">subamortecido, ω_d=√(ω₀²−γ²)</span></div>
            <div className="derivation-step"><span className="step-num">γ=ω₀</span><span className="step-eq">raiz dupla → x(t)=(A+Bt)·e^(−γt)</span><span className="step-desc">criticamente amortecido</span></div>
            <div className="derivation-step"><span className="step-num">γ&gt;ω₀</span><span className="step-eq">raízes reais → x(t)=e^(−γt)[A·cosh(ω_h t)+B·senh(ω_h t)]</span><span className="step-desc">sobreamortecido, ω_h=√(γ²−ω₀²)</span></div>
          </div>
          <p className="calc-p">
            O amortecimento crítico é o menor valor de γ que elimina completamente a oscilação — é o
            regime usado em amortecedores de carro e portas automáticas, para retornar à posição de
            equilíbrio o mais rápido possível sem "balançar".
          </p>
        </div>

        <div className="calc-section">
          <div className="calc-h2">5. Exemplo Numérico</div>
          <p className="calc-p">
            Um sistema massa-mola tem m=1kg, k=15N/m, liberado do repouso em x₀=0,2m.
          </p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">ω₀ = √(15/1) = 3,87 rad/s</span><span className="step-desc">frequência natural</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq">T₀ = 2π/3,87 = 1,62 s</span><span className="step-desc">período natural</span></div>
            <div className="derivation-step"><span className="step-num">③</span><span className="step-eq">E₀ = ½·15·0,2² = 0,3 J</span><span className="step-desc">energia mecânica total (sem amortecimento)</span></div>
            <div className="derivation-step"><span className="step-num">④</span><span className="step-eq">γ_crítico = ω₀ = 3,87 /s</span><span className="step-desc">amortecimento crítico para este sistema</span></div>
          </div>
        </div>

      </div>
    </div>
  );
}
