// src/pages/ExperimentoCalorimetria.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FISICA2_BASE_STYLES } from '../styles/fisica2Theme';

const fmt = (n, d = 2) => (typeof n === 'number' && isFinite(n) ? n.toFixed(d) : '—');

// Constantes da água
const C_GELO = 2100;   // J/(kg·K)
const C_AGUA = 4186;   // J/(kg·K)
const C_VAPOR = 2010;  // J/(kg·K)
const L_FUSAO = 334000;       // J/kg
const L_VAPORIZACAO = 2256000; // J/kg
const TIME_SCALE = 50; // aceleração do "relógio" só para visualização (ver nota na tela)

const MATERIAIS = [
  { id: 'cobre', label: 'Cobre', k: 401 },
  { id: 'aluminio', label: 'Alumínio', k: 205 },
  { id: 'vidro', label: 'Vidro', k: 0.8 },
  { id: 'madeira', label: 'Madeira', k: 0.15 },
  { id: 'ar', label: 'Ar (parado)', k: 0.024 },
];

const STYLES = FISICA2_BASE_STYLES + `
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

// Estado físico da água em função do calor total fornecido Q (a partir de Tinicial ≤ 0°C)
function estadoEm(Q, m, tInicial) {
  let acc = 0;
  const qGelo = m * C_GELO * (0 - tInicial);
  if (Q < acc + qGelo) return { T: tInicial + Q / (m * C_GELO), fase: 'gelo', fracao: 0 };
  acc += qGelo;
  const qFusao = m * L_FUSAO;
  if (Q < acc + qFusao) return { T: 0, fase: 'fundindo', fracao: (Q - acc) / qFusao };
  acc += qFusao;
  const qAgua = m * C_AGUA * 100;
  if (Q < acc + qAgua) return { T: (Q - acc) / (m * C_AGUA), fase: 'agua', fracao: 0 };
  acc += qAgua;
  const qVaporizacao = m * L_VAPORIZACAO;
  if (Q < acc + qVaporizacao) return { T: 100, fase: 'vaporizando', fracao: (Q - acc) / qVaporizacao };
  acc += qVaporizacao;
  return { T: 100 + (Q - acc) / (m * C_VAPOR), fase: 'vapor', fracao: 0 };
}

function corFase(fase) {
  if (fase === 'gelo') return '#7EE8FA';
  if (fase === 'fundindo') return '#38BDF8';
  if (fase === 'agua') return '#0091AD';
  if (fase === 'vaporizando') return '#FBBF24';
  return '#E5E7EB';
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════
export default function ExperimentoCalorimetria() {
  const [tab, setTab] = useState('sim');

  return (
    <>
      <style>{STYLES}</style>
      <div className="app">
        <header className="header">
          <div className="header-title">Calorimetria e Transferência de Calor</div>
          <div className="header-sub">Física 2 · Termodinâmica</div>
          <span className="header-tag">Q = mcΔT</span>
        </header>

        <nav className="tabs">
          {[
            ['sim', 'Curva de Aquecimento'],
            ['conducao', 'Condução de Calor'],
            ['calc', 'Cálculo & Derivações'],
          ].map(([id, label]) => (
            <button key={id} className={`tab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </nav>

        {tab === 'sim' && <AquecimentoTab />}
        {tab === 'conducao' && <ConducaoTab />}
        {tab === 'calc' && <CalcTab />}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ABA 1 — CURVA DE AQUECIMENTO
// ═══════════════════════════════════════════════════════════════════════════
function AquecimentoTab() {
  const [m, setM] = useState(0.3);
  const [P, setPot] = useState(1500);
  const [tInicial, setTInicial] = useState(-10);
  const [rodando, setRodando] = useState(true);

  const stateRef = useRef({ m, P });
  useEffect(() => { stateRef.current = { m, P }; }, [m, P]);

  const tRef = useRef(0);
  const [tDisp, setTDisp] = useState(0);
  const histRef = useRef({ T: [], t: [] });
  const rafRef = useRef(null);
  const lastRef = useRef(null);

  useEffect(() => {
    tRef.current = 0;
    setTDisp(0);
    histRef.current = { T: [], t: [] };
    setRodando(true);
  }, [m, P, tInicial]);

  useEffect(() => {
    if (!rodando) { lastRef.current = null; return; }
    const step = (now) => {
      if (lastRef.current !== null) {
        const dtReal = Math.min((now - lastRef.current) / 1000, 0.05);
        tRef.current += dtReal * TIME_SCALE;
        setTDisp(tRef.current);

        const s = stateRef.current;
        const Q = s.P * tRef.current;
        const est = estadoEm(Q, s.m, tInicial);
        const h = histRef.current;
        h.T.push(est.T); h.t.push(tRef.current);
        if (h.T.length > 400) { h.T.shift(); h.t.shift(); }

        if (est.fase === 'vapor' && est.T >= 180) setRodando(false);
      }
      lastRef.current = now;
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [rodando, tInicial]);

  const Qatual = P * tDisp;
  const estadoAtual = estadoEm(Qatual, m, tInicial);

  const canvasRef = useRef(null);
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

      const s = stateRef.current;
      const Q = s.P * tRef.current;
      const est = estadoEm(Q, s.m, tInicial);
      const cor = corFase(est.fase);

      // ── Coluna 1: béquer ──
      const beakerX = W * 0.16, beakerW = Math.min(120, W * 0.2);
      const beakerTopY = H * 0.15, beakerBotY = H * 0.8;

      ctx.strokeStyle = 'rgba(239,68,68,0.4)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(beakerX - beakerW / 2, beakerTopY);
      ctx.lineTo(beakerX - beakerW / 2, beakerBotY);
      ctx.lineTo(beakerX + beakerW / 2, beakerBotY);
      ctx.lineTo(beakerX + beakerW / 2, beakerTopY);
      ctx.stroke();

      ctx.fillStyle = cor + 'AA';
      ctx.fillRect(beakerX - beakerW / 2, beakerTopY + 20, beakerW, beakerBotY - beakerTopY - 20);

      // Bolhas quando vaporizando / vapor
      if (est.fase === 'vaporizando' || est.fase === 'vapor') {
        for (let i = 0; i < 6; i++) {
          const bx = beakerX - beakerW / 2 + 12 + (i * beakerW) / 6;
          const by = beakerBotY - ((tRef.current * 40 + i * 30) % (beakerBotY - beakerTopY - 20));
          ctx.beginPath();
          ctx.arc(bx, by, 3, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,255,255,0.5)';
          ctx.fill();
        }
      }

      // Chama do aquecedor (intensidade proporcional a P)
      const flameH = 10 + (s.P / 3000) * 24;
      ctx.beginPath();
      ctx.moveTo(beakerX - 14, beakerBotY + 8);
      ctx.quadraticCurveTo(beakerX, beakerBotY + 8 - flameH, beakerX + 14, beakerBotY + 8);
      ctx.closePath();
      ctx.fillStyle = '#F97316';
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(249,115,22,0.7)';
      ctx.fill();
      ctx.shadowBlur = 0;

      // Termômetro
      const termX = beakerX + beakerW / 2 + 36;
      const termTopY = beakerTopY, termBotY = beakerBotY;
      const tFrac = Math.max(0, Math.min(1, (est.T + 30) / 160));
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(termX, termTopY); ctx.lineTo(termX, termBotY); ctx.stroke();
      ctx.strokeStyle = cor;
      ctx.beginPath();
      ctx.moveTo(termX, termBotY);
      ctx.lineTo(termX, termBotY - tFrac * (termBotY - termTopY));
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = "bold 12px 'JetBrains Mono', monospace";
      ctx.textAlign = 'center';
      ctx.fillText(`${fmt(est.T, 0)}°C`, termX, termTopY - 12);

      // ── Coluna 2: gráfico T × t ──
      const padL = W * 0.42, padR = W * 0.04, padT = H * 0.1, padB = H * 0.14;
      const plotW = W - padL - padR;
      const plotH = H - padT - padB;
      const tMax = Math.max(60, tRef.current * 1.15);
      const toX = t => padL + (t / tMax) * plotW;
      const toY = temp => padT + plotH - ((temp + 30) / 160) * plotH;

      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(padL, padT); ctx.lineTo(padL, padT + plotH); ctx.lineTo(padL + plotW, padT + plotH); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.textAlign = 'center';
      ctx.fillText('t (s, físico)', padL + plotW / 2, H - 8);
      ctx.save();
      ctx.translate(padL - 34, padT + plotH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('T (°C)', 0, 0);
      ctx.restore();

      // Linhas de referência 0°C e 100°C
      [0, 100].forEach(temp => {
        ctx.beginPath();
        ctx.moveTo(padL, toY(temp)); ctx.lineTo(padL + plotW, toY(temp));
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      const h = histRef.current;
      if (h.T.length > 1) {
        ctx.beginPath();
        h.T.forEach((temp, i) => {
          const x = toX(h.t[i]), y = toY(temp);
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [tInicial]);

  return (
    <div className="content">
      <div className="sidebar-l">
        <div className="section-label">Amostra de Água</div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Massa m</span><span className="ctrl-num">{fmt(m, 2)} kg</span></div>
          <input type="range" min="0.1" max="1" step="0.05" value={m} onChange={e => setM(+e.target.value)} />
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Temperatura inicial</span><span className="ctrl-num">{fmt(tInicial, 0)}°C</span></div>
          <input type="range" min="-30" max="-2" step="1" value={tInicial} onChange={e => setTInicial(+e.target.value)} />
        </div>

        <div className="section-label">Aquecedor</div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Potência P</span><span className="ctrl-num">{fmt(P, 0)} W</span></div>
          <input type="range" min="500" max="3000" step="50" value={P} onChange={e => setPot(+e.target.value)} />
        </div>

        <div className="btn-row">
          <button className="btn btn-primary" onClick={() => setRodando(true)}>▶ Aquecer</button>
          <button className="btn btn-secondary" onClick={() => setRodando(false)}>⏸ Pausar</button>
        </div>

        <p style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5, marginTop: 12 }}>
          ⏱ Esta simulação roda {TIME_SCALE}× mais rápido que o tempo real — Q=Pt continua fisicamente correto.
        </p>
      </div>

      <div className="main-area">
        <div className="canvas-wrap"><canvas ref={canvasRef} /></div>
      </div>

      <div className="sidebar-r">
        <div className="section-label">Estado Atual</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">Fase</span><span className="stat-val accent">{estadoAtual.fase.toUpperCase()}</span></div>
          <div className="stat-row"><span className="stat-label">Temperatura</span><span className="stat-val warm">{fmt(estadoAtual.T, 1)}°C</span></div>
          <div className="stat-row"><span className="stat-label">Calor fornecido Q</span><span className="stat-val cool">{fmt(Qatual / 1000, 1)} kJ</span></div>
          {(estadoAtual.fase === 'fundindo' || estadoAtual.fase === 'vaporizando') && (
            <div className="stat-row"><span className="stat-label">Fração transformada</span><span className="stat-val purple">{fmt(estadoAtual.fracao * 100, 0)}%</span></div>
          )}
        </div>

        <div className="section-label">Constantes da Água</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">c (gelo)</span><span className="stat-val">{C_GELO} J/(kg·K)</span></div>
          <div className="stat-row"><span className="stat-label">c (água)</span><span className="stat-val">{C_AGUA} J/(kg·K)</span></div>
          <div className="stat-row"><span className="stat-label">L (fusão)</span><span className="stat-val">{fmt(L_FUSAO / 1000, 0)} kJ/kg</span></div>
          <div className="stat-row"><span className="stat-label">L (vaporização)</span><span className="stat-val">{fmt(L_VAPORIZACAO / 1000, 0)} kJ/kg</span></div>
        </div>

        <div className="section-label">Equações</div>
        <div className="eq-block">
          <div className="eq-title">Calor Sensível</div>
          <span className="sym">Q</span> <span className="op">=</span> m·c·ΔT
        </div>
        <div className="eq-block">
          <div className="eq-title">Calor Latente</div>
          <span className="sym">Q</span> <span className="op">=</span> m·L
          <br /><span className="cmt">T constante durante a transição</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ABA 2 — CONDUÇÃO DE CALOR
// ═══════════════════════════════════════════════════════════════════════════
function ConducaoTab() {
  const [materialId, setMaterialId] = useState('aluminio');
  const [A, setA] = useState(10);      // cm²
  const [L, setL] = useState(0.5);     // m
  const [Tq, setTq] = useState(90);    // °C
  const [Tf, setTf] = useState(15);    // °C

  const material = MATERIAIS.find(mm => mm.id === materialId);
  const Am2 = A / 10000;
  const H = (material.k * Am2 * (Tq - Tf)) / L; // Watts

  const canvasRef = useRef(null);
  const tRef = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    let raf;
    const ctx = cv.getContext('2d');
    const draw = () => {
      tRef.current += 0.016;
      const dpr = window.devicePixelRatio || 1;
      const W = cv.clientWidth, HH = cv.clientHeight;
      cv.width = W * dpr; cv.height = HH * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, HH);

      const barLeft = W * 0.15, barRight = W * 0.85;
      const barY = HH * 0.5, barH = 60;

      // Gradiente de temperatura ao longo da barra (perfil linear em regime permanente)
      const grad = ctx.createLinearGradient(barLeft, 0, barRight, 0);
      grad.addColorStop(0, '#EF4444');
      grad.addColorStop(1, '#38BDF8');
      ctx.fillStyle = grad;
      ctx.fillRect(barLeft, barY - barH / 2, barRight - barLeft, barH);
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 2;
      ctx.strokeRect(barLeft, barY - barH / 2, barRight - barLeft, barH);

      // Reservatórios
      ctx.fillStyle = 'rgba(239,68,68,0.25)';
      ctx.fillRect(barLeft - 50, barY - 45, 50, 90);
      ctx.fillStyle = 'rgba(56,189,248,0.25)';
      ctx.fillRect(barRight, barY - 45, 50, 90);
      ctx.fillStyle = '#fff';
      ctx.font = "bold 12px 'JetBrains Mono', monospace";
      ctx.textAlign = 'center';
      ctx.fillText(`${fmt(Tq, 0)}°C`, barLeft - 25, barY + 5);
      ctx.fillText(`${fmt(Tf, 0)}°C`, barRight + 25, barY + 5);

      // Partículas de calor fluindo (velocidade proporcional a H)
      const HNorm = Math.min(1, H / 200);
      const speed = 40 + HNorm * 260;
      const count = Math.max(3, Math.round(3 + HNorm * 10));
      for (let i = 0; i < count; i++) {
        const frac = ((tRef.current * speed / (barRight - barLeft)) + i / count) % 1;
        const px = barLeft + frac * (barRight - barLeft);
        ctx.beginPath();
        ctx.arc(px, barY, 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251,191,36,${0.9 - frac * 0.4})`;
        ctx.shadowBlur = 6;
        ctx.shadowColor = 'rgba(251,191,36,0.6)';
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = "11px 'JetBrains Mono', monospace";
      ctx.fillText(`${material.label} · L=${fmt(L, 2)}m · A=${fmt(A, 0)}cm²`, (barLeft + barRight) / 2, barY - barH / 2 - 16);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [materialId, A, L, Tq, Tf, H]);

  return (
    <div className="content">
      <div className="sidebar-l">
        <div className="section-label">Material da Barra</div>
        <div className="pill-row">
          {MATERIAIS.map(mm => (
            <button key={mm.id} className={`pill ${materialId === mm.id ? 'on' : ''}`} onClick={() => setMaterialId(mm.id)}>{mm.label}</button>
          ))}
        </div>

        <div className="section-label">Geometria</div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Área da seção A</span><span className="ctrl-num">{fmt(A, 0)} cm²</span></div>
          <input type="range" min="1" max="50" step="1" value={A} onChange={e => setA(+e.target.value)} />
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Comprimento L</span><span className="ctrl-num">{fmt(L, 2)} m</span></div>
          <input type="range" min="0.1" max="2" step="0.05" value={L} onChange={e => setL(+e.target.value)} />
        </div>

        <div className="section-label">Temperaturas</div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Extremidade quente</span><span className="ctrl-num">{fmt(Tq, 0)}°C</span></div>
          <input type="range" min="30" max="150" step="1" value={Tq} onChange={e => setTq(+e.target.value)} />
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Extremidade fria</span><span className="ctrl-num">{fmt(Tf, 0)}°C</span></div>
          <input type="range" min="-10" max="29" step="1" value={Tf} onChange={e => setTf(+e.target.value)} />
        </div>
      </div>

      <div className="main-area">
        <div className="canvas-wrap"><canvas ref={canvasRef} /></div>
      </div>

      <div className="sidebar-r">
        <div className="section-label">Fluxo de Calor</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">Condutividade k</span><span className="stat-val accent">{material.k} W/(m·K)</span></div>
          <div className="stat-row"><span className="stat-label">Taxa de fluxo H</span><span className="stat-val warm">{H > 100 ? fmt(H, 0) : fmt(H, 2)} W</span></div>
          <div className="stat-row"><span className="stat-label">ΔT</span><span className="stat-val cool">{fmt(Tq - Tf, 0)} K</span></div>
        </div>

        <div className="section-label">Equações</div>
        <div className="eq-block">
          <div className="eq-title">Lei de Fourier (Condução)</div>
          <span className="sym">H</span> <span className="op">=</span> k·A·ΔT / L
        </div>
        <div className="eq-block">
          <div className="eq-title">Convecção (referência)</div>
          <span className="sym">H</span> <span className="op">=</span> h·A·ΔT
        </div>
        <div className="eq-block">
          <div className="eq-title">Radiação (referência)</div>
          <span className="sym">P</span> <span className="op">=</span> ε·σ·A·T⁴
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
          <div className="calc-h2">1. Calor Sensível e Capacidade Térmica</div>
          <p className="calc-p">
            Quando um corpo recebe calor sem mudar de fase, sua temperatura varia proporcionalmente ao
            calor recebido:
          </p>
          <div className="big-eq">
            <span className="hi-acc">Q = m·c·ΔT</span>
            <span className="cmt">   ← c = calor específico (J/kg·K), característico de cada substância</span>
          </div>
          <p className="calc-p">
            A capacidade térmica C=mc representa quanto calor é necessário para elevar a temperatura de
            todo o corpo em 1K.
          </p>
        </div>

        <div className="calc-section">
          <div className="calc-h2">2. Calor Latente e Mudanças de Fase</div>
          <p className="calc-p">
            Durante uma mudança de fase (fusão, vaporização), toda a energia recebida é usada para
            reorganizar as ligações moleculares — a temperatura permanece constante:
          </p>
          <div className="big-eq">
            <span className="hi-acc">Q = m·L</span>
            <span className="cmt">   ← L = calor latente (J/kg): L_fusão para sólido↔líquido, L_vaporização para líquido↔gás</span>
          </div>
          <p className="calc-p">
            É por isso que a curva de aquecimento tem patamares horizontais em 0°C e 100°C (para a água) —
            a temperatura "espera" toda a substância mudar de fase antes de voltar a subir.
          </p>
        </div>

        <div className="calc-section">
          <div className="calc-h2">3. Princípio da Calorimetria (Equilíbrio Térmico)</div>
          <p className="calc-p">
            Quando dois corpos a temperaturas diferentes trocam calor entre si (isolados do ambiente), a
            energia se conserva — o calor perdido por um é ganho pelo outro:
          </p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">Q_cedido + Q_recebido = 0</span><span className="step-desc">conservação de energia</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq">m₁c₁(T₁−T_eq) = m₂c₂(T_eq−T₂)</span><span className="step-desc">isolando em termos de T_eq</span></div>
            <div className="derivation-step"><span className="step-num">③</span><span className="step-eq"><span className="hi-acc">T_eq = (m₁c₁T₁ + m₂c₂T₂) / (m₁c₁ + m₂c₂)</span></span><span className="step-desc">temperatura final de equilíbrio</span></div>
          </div>
        </div>

        <div className="calc-section">
          <div className="calc-h2">4. Mecanismos de Transferência de Calor</div>
          <p className="calc-p">Calor pode se propagar de três formas fundamentalmente diferentes:</p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">Condução</span><span className="step-eq">H = k·A·ΔT/L</span><span className="step-desc">contato direto — vibração molecular se propaga (Lei de Fourier)</span></div>
            <div className="derivation-step"><span className="step-num">Convecção</span><span className="step-eq">H = h·A·ΔT</span><span className="step-desc">transporte por movimento de fluido (mais quente sobe, mais frio desce)</span></div>
            <div className="derivation-step"><span className="step-num">Radiação</span><span className="step-eq">P = ε·σ·A·T⁴</span><span className="step-desc">ondas eletromagnéticas — único mecanismo que funciona no vácuo</span></div>
          </div>
          <p className="calc-p">
            Note que a radiação cresce com T⁴ (Lei de Stefan-Boltzmann, σ=5,67×10⁻⁸ W/m²K⁴) — dobrar a
            temperatura absoluta multiplica a potência irradiada por 16×.
          </p>
        </div>

        <div className="calc-section">
          <div className="calc-h2">5. Exemplo Numérico</div>
          <p className="calc-p">
            Quanto calor é necessário para transformar 0,5 kg de gelo a −10°C em vapor a 100°C?
          </p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">Q₁ = 0,5·2100·10 = 10.500 J</span><span className="step-desc">aquecer o gelo até 0°C</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq">Q₂ = 0,5·334.000 = 167.000 J</span><span className="step-desc">fundir o gelo (0°C constante)</span></div>
            <div className="derivation-step"><span className="step-num">③</span><span className="step-eq">Q₃ = 0,5·4186·100 = 209.300 J</span><span className="step-desc">aquecer a água até 100°C</span></div>
            <div className="derivation-step"><span className="step-num">④</span><span className="step-eq">Q₄ = 0,5·2.256.000 = 1.128.000 J</span><span className="step-desc">vaporizar a água (100°C constante)</span></div>
            <div className="derivation-step"><span className="step-num">⑤</span><span className="step-eq"><span className="hi-acc">Q_total ≈ 1.514.800 J ≈ 1,51 MJ</span></span><span className="step-desc">soma de todas as etapas</span></div>
          </div>
        </div>

      </div>
    </div>
  );
}
