// src/pages/ExperimentoLeisTermo.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FISICA2_BASE_STYLES, GAS } from '../styles/fisica2Theme';
import PainelExplicativo from '../components/PainelExplicativo';

const { R, GAMMA } = GAS;
const fmt = (n, d = 2) => (typeof n === 'number' && isFinite(n) ? n.toFixed(d) : '—');

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
.entropy-gauge {
  width: 100%;
  height: 14px;
  border-radius: 7px;
  background: rgba(255,255,255,0.06);
  overflow: hidden;
  margin-top: 8px;
  position: relative;
}
.entropy-gauge-fill {
  height: 100%;
  border-radius: 7px;
  transition: width 0.2s ease, background 0.2s ease;
}
`;

// ── Geometria do ciclo de Carnot ──────────────────────────────────────────────
function carnotGeometry(Th, Tc, V1, V2) {
  const r = Math.pow(Th / Tc, 1 / (GAMMA - 1));
  const V3 = V2 * r;
  const V4 = V1 * r;
  return { V3, V4 };
}

// Estado (P,V,T,estágio) numa fração u ∈ [0,1) do ciclo completo
function carnotStateAt(u, Th, Tc, V1, V2, V3, V4, n) {
  const uu = ((u % 1) + 1) % 1;
  let V, T, stage, stageLabel;
  if (uu < 0.25) {
    const t = uu / 0.25;
    V = V1 + (V2 - V1) * t; T = Th;
    stage = 0; stageLabel = 'Expansão Isotérmica (absorve Qₕ)';
  } else if (uu < 0.5) {
    const t = (uu - 0.25) / 0.25;
    V = V2 + (V3 - V2) * t; T = Th * Math.pow(V2 / V, GAMMA - 1);
    stage = 1; stageLabel = 'Expansão Adiabática (Q=0)';
  } else if (uu < 0.75) {
    const t = (uu - 0.5) / 0.25;
    V = V3 + (V4 - V3) * t; T = Tc;
    stage = 2; stageLabel = 'Compressão Isotérmica (libera Qc)';
  } else {
    const t = (uu - 0.75) / 0.25;
    V = V4 + (V1 - V4) * t; T = Tc * Math.pow(V4 / V, GAMMA - 1);
    stage = 3; stageLabel = 'Compressão Adiabática (Q=0)';
  }
  const P = (n * R * T) / V;
  return { P, V, T, stage, stageLabel };
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════
export default function ExperimentoLeisTermo() {
  const [tab, setTab] = useState('sim');

  return (
    <>
      <style>{STYLES}</style>
      <div className="app">
        <header className="header">
          <div className="header-title">Leis da Termodinâmica</div>
          <div className="header-sub">Física 2 · Ciclo de Carnot · Entropia</div>
          <span className="header-tag">η = 1 − Tc/Th</span>
        </header>

        <nav className="tabs">
          {[
            ['sim', 'Simulação'],
            ['rendimento', 'Rendimento & Entropia'],
            ['calc', 'Cálculo & Derivações'],
          ].map(([id, label]) => (
            <button key={id} className={`tab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </nav>

        {tab === 'sim' && <SimTab />}
        {tab === 'rendimento' && <RendimentoTab />}
        {tab === 'calc' && <CalcTab />}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ABA 1 — SIMULAÇÃO (ciclo animado + esquema do motor térmico)
// ═══════════════════════════════════════════════════════════════════════════
function SimTab() {
  const [Th, setTh] = useState(600);
  const [Tc, setTc] = useState(300);
  const [V1, setV1] = useState(2);
  const [V2, setV2] = useState(4);
  const [n, setN] = useState(1);
  const [rodando, setRodando] = useState(true);
  const [progresso, setProgresso] = useState(0);

  const stateRef = useRef({ Th, Tc, V1, V2, n });
  useEffect(() => { stateRef.current = { Th, Tc, V1, V2, n }; }, [Th, Tc, V1, V2, n]);

  // V2 sempre precisa ser maior que V1 (expansão), senão o ciclo degenera
  useEffect(() => { if (V2 <= V1) setV2(V1 + 0.5); }, [V1]);

  const uRef = useRef(0);
  const rafRef = useRef(null);
  const lastRef = useRef(null);

  useEffect(() => {
    if (!rodando) { lastRef.current = null; return; }
    const step = (now) => {
      if (lastRef.current !== null) {
        const dt = Math.min((now - lastRef.current) / 1000, 0.05);
        uRef.current = (uRef.current + dt / 6) % 1; // 6s por volta completa
        setProgresso(uRef.current);
      }
      lastRef.current = now;
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [rodando]);

  const { V3, V4 } = carnotGeometry(Th, Tc, V1, V2);
  const atual = carnotStateAt(progresso, Th, Tc, V1, V2, V3, V4, n);

  const Qh = n * R * Th * Math.log(V2 / V1);
  const Qc = n * R * Tc * Math.log(V3 / V4);
  const Wnet = Qh - Qc;
  const eta = 1 - Tc / Th;

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
      const { V3: v3, V4: v4 } = carnotGeometry(s.Th, s.Tc, s.V1, s.V2);
      const cur = carnotStateAt(uRef.current, s.Th, s.Tc, s.V1, s.V2, v3, v4, s.n);

      // ── Painel esquerdo: diagrama P-V ──
      const diagW = W * 0.58;
      const pad = { l: 55, r: 20, t: 24, b: 40 };
      const plotW = diagW - pad.l - pad.r;
      const plotH = H - pad.t - pad.b;
      const maxV = Math.max(s.V1, s.V2, v3, v4) * 1.15;
      const maxP = (s.n * R * s.Th) / s.V1 * 1.15;
      const toX = v => pad.l + (v / maxV) * plotW;
      const toY = p => pad.t + plotH - (p / maxP) * plotH;

      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, pad.t + plotH); ctx.lineTo(pad.l + plotW, pad.t + plotH); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = "11px 'JetBrains Mono', monospace";
      ctx.textAlign = 'center';
      ctx.fillText('V (L)', pad.l + plotW / 2, H - 10);
      ctx.save();
      ctx.translate(16, pad.t + plotH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('P (atm)', 0, 0);
      ctx.restore();

      // Traça o laço completo do ciclo
      const loopPts = [];
      for (let i = 0; i <= 200; i++) loopPts.push(carnotStateAt(i / 200, s.Th, s.Tc, s.V1, s.V2, v3, v4, s.n));
      ctx.beginPath();
      loopPts.forEach((p, i) => i === 0 ? ctx.moveTo(toX(p.V), toY(p.P)) : ctx.lineTo(toX(p.V), toY(p.P)));
      ctx.closePath();
      ctx.strokeStyle = 'rgba(239,68,68,0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Ponto de estado atual
      ctx.beginPath();
      ctx.arc(toX(cur.V), toY(cur.P), 6, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 12;
      ctx.shadowColor = 'rgba(239,68,68,0.8)';
      ctx.stroke();
      ctx.shadowBlur = 0;

      // ── Painel direito: esquema do motor térmico ──
      const schX = diagW + (W - diagW) / 2;
      const boxW = Math.min(120, W - diagW - 40);
      const hotY = H * 0.16, coldY = H * 0.72, engineY = H * 0.46;

      const drawBox = (y, label, tempLabel, color) => {
        ctx.fillStyle = `${color}22`;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(schX - boxW / 2, y - 20, boxW, 40, 8);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = color;
        ctx.font = "bold 11px 'JetBrains Mono', monospace";
        ctx.textAlign = 'center';
        ctx.fillText(label, schX, y - 3);
        ctx.fillText(tempLabel, schX, y + 12);
      };
      drawBox(hotY, 'RESERV. QUENTE', `${fmt(s.Th, 0)} K`, '#EF4444');
      drawBox(coldY, 'RESERV. FRIO', `${fmt(s.Tc, 0)} K`, '#38BDF8');

      // Motor (círculo central)
      ctx.beginPath();
      ctx.arc(schX, engineY, 26, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(251,191,36,0.15)';
      ctx.strokeStyle = '#FBBF24';
      ctx.lineWidth = 2;
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#FBBF24';
      ctx.font = "bold 13px 'JetBrains Mono', monospace";
      ctx.fillText('M', schX, engineY + 5);

      const activeHot = cur.stage === 0;
      const activeCold = cur.stage === 2;
      const arrow = (x, y1, y2, color, active) => {
        ctx.beginPath();
        ctx.moveTo(x, y1); ctx.lineTo(x, y2);
        ctx.strokeStyle = active ? color : `${color}55`;
        ctx.lineWidth = active ? 3 : 1.5;
        if (active) { ctx.shadowBlur = 10; ctx.shadowColor = color; }
        ctx.stroke();
        ctx.shadowBlur = 0;
        const dir = y2 > y1 ? 1 : -1;
        ctx.beginPath();
        ctx.moveTo(x, y2);
        ctx.lineTo(x - 5, y2 - 8 * dir);
        ctx.lineTo(x + 5, y2 - 8 * dir);
        ctx.closePath();
        ctx.fillStyle = active ? color : `${color}55`;
        ctx.fill();
      };
      arrow(schX, hotY + 22, engineY - 28, '#EF4444', activeHot);
      arrow(schX, engineY + 28, coldY - 22, '#38BDF8', activeCold);

      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.textAlign = 'left';
      ctx.fillText('Qₕ', schX + boxW / 2 - 14, (hotY + engineY) / 2);
      ctx.fillText('Qc', schX + boxW / 2 - 14, (engineY + coldY) / 2);
      ctx.fillText('W →', schX + 30, engineY + 4);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  const situacaoAtual = `Com T_quente=${fmt(Th, 0)}K e T_fria=${fmt(Tc, 0)}K, o ciclo de Carnot absorve Qₕ=${fmt(Qh, 1)}, rejeita Qc=${fmt(Qc, 1)}, produz trabalho líquido W=${fmt(Wnet, 1)}, com rendimento η=${fmt(eta * 100, 1)}%.`;

  const perguntasAssistente = [
    {
      id: 'Th',
      pergunta: 'O que são T_quente e T_fria?',
      resposta: `São as temperaturas dos dois reservatórios térmicos entre os quais o ciclo opera. Agora T_quente=${fmt(Th, 0)}K e T_fria=${fmt(Tc, 0)}K — quanto maior a diferença entre elas, maior o rendimento possível.`,
    },
    {
      id: 'ciclo',
      pergunta: 'O que são as 4 etapas do ciclo?',
      resposta: 'O ciclo de Carnot tem 4 etapas: expansão isotérmica (absorve Qₕ na temperatura quente), expansão adiabática (esfria sem trocar calor), compressão isotérmica (libera Qc na temperatura fria), e compressão adiabática (esquenta de volta) — fechando o ciclo.',
    },
    {
      id: 'eta',
      pergunta: 'O que é o rendimento η?',
      resposta: `η=1−Tc/Tₕ é a fração do calor absorvido que vira trabalho útil. Agora η=${fmt(eta * 100, 1)}% — esse é o rendimento MÁXIMO teoricamente possível entre essas duas temperaturas, nenhum motor real pode superá-lo.`,
    },
    {
      id: 'trabalho',
      pergunta: 'O que é o trabalho líquido W?',
      resposta: `W=Qₕ−Qc é o trabalho que sobra depois de descontar o calor rejeitado para a fonte fria. Agora W=${fmt(Wnet, 1)} — é isso que o motor térmico realmente entrega como energia útil.`,
    },
  ];

  return (
    <div className="content">
      <PainelExplicativo situacao={situacaoAtual} perguntas={perguntasAssistente} />
      <div className="sidebar-l">
        <div className="section-label">Reservatórios Térmicos</div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Temperatura Quente Tₕ</span><span className="ctrl-num">{fmt(Th, 0)} K</span></div>
          <input type="range" min="350" max="900" step="10" value={Th} onChange={e => setTh(+e.target.value)} />
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Temperatura Fria Tc</span><span className="ctrl-num">{fmt(Tc, 0)} K</span></div>
          <input type="range" min="150" max="340" step="10" value={Tc} onChange={e => setTc(+e.target.value)} />
        </div>

        <div className="section-label">Gás de Trabalho</div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Volume inicial V₁</span><span className="ctrl-num">{fmt(V1, 2)} L</span></div>
          <input type="range" min="1" max="4" step="0.1" value={V1} onChange={e => setV1(+e.target.value)} />
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Volume após expansão V₂</span><span className="ctrl-num">{fmt(V2, 2)} L</span></div>
          <input type="range" min={V1 + 0.5} max={V1 + 6} step="0.1" value={V2} onChange={e => setV2(+e.target.value)} />
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Quantidade n</span><span className="ctrl-num">{fmt(n, 2)} mol</span></div>
          <input type="range" min="0.2" max="3" step="0.1" value={n} onChange={e => setN(+e.target.value)} />
        </div>

        <div className="btn-row">
          <button className="btn btn-primary" onClick={() => setRodando(true)}>▶ Iniciar</button>
          <button className="btn btn-secondary" onClick={() => setRodando(false)}>⏸ Pausar</button>
        </div>
      </div>

      <div className="main-area">
        <div className="canvas-wrap"><canvas ref={canvasRef} /></div>
      </div>

      <div className="sidebar-r">
        <div className="section-label">Estágio Atual</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">Etapa</span><span className="stat-val accent">{atual.stageLabel}</span></div>
          <div className="stat-row"><span className="stat-label">P atual</span><span className="stat-val">{fmt(atual.P, 3)} atm</span></div>
          <div className="stat-row"><span className="stat-label">V atual</span><span className="stat-val">{fmt(atual.V, 2)} L</span></div>
          <div className="stat-row"><span className="stat-label">T atual</span><span className="stat-val warm">{fmt(atual.T, 0)} K</span></div>
        </div>

        <div className="section-label">Balanço do Ciclo Completo</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">Calor absorvido Qₕ</span><span className="stat-val accent">{fmt(Qh, 2)} atm·L</span></div>
          <div className="stat-row"><span className="stat-label">Calor rejeitado Qc</span><span className="stat-val cool">{fmt(Qc, 2)} atm·L</span></div>
          <div className="stat-row"><span className="stat-label">Trabalho líquido W</span><span className="stat-val warm">{fmt(Wnet, 2)} atm·L</span></div>
          <div className="stat-row"><span className="stat-label">Rendimento η</span><span className="stat-val purple">{fmt(eta * 100, 1)}%</span></div>
        </div>

        <div className="section-label">Equações-Chave</div>
        <div className="eq-block">
          <div className="eq-title">Ciclo de Carnot</div>
          <span className="sym">Q</span>ₕ <span className="op">=</span> nRTₕ·ln(V₂/V₁)<br />
          <span className="sym">Q</span>c <span className="op">=</span> nRTc·ln(V₃/V₄)
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ABA 2 — RENDIMENTO & ENTROPIA (2ª Lei)
// ═══════════════════════════════════════════════════════════════════════════
function RendimentoTab() {
  const [Th, setTh] = useState(600);
  const [Tc, setTc] = useState(300);
  const [Qh, setQh] = useState(500);
  const etaCarnot = 1 - Tc / Th;
  const [fracao, setFracao] = useState(1);

  const etaReal = fracao * etaCarnot;
  const Wreal = etaReal * Qh;
  const QcReal = Qh - Wreal;
  const dS_quente = -Qh / Th;
  const dS_fria = QcReal / Tc;
  const dS_universo = dS_quente + dS_fria;

  return (
    <div className="content" style={{ gridTemplateColumns: '360px 1fr 300px' }}>
      <div className="sidebar-l">
        <div className="section-label">Reservatórios</div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Temperatura Quente Tₕ</span><span className="ctrl-num">{fmt(Th, 0)} K</span></div>
          <input type="range" min="350" max="900" step="10" value={Th} onChange={e => setTh(+e.target.value)} />
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Temperatura Fria Tc</span><span className="ctrl-num">{fmt(Tc, 0)} K</span></div>
          <input type="range" min="150" max="340" step="10" value={Tc} onChange={e => setTc(+e.target.value)} />
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Calor absorvido Qₕ</span><span className="ctrl-num">{fmt(Qh, 0)} atm·L</span></div>
          <input type="range" min="100" max="1000" step="10" value={Qh} onChange={e => setQh(+e.target.value)} />
        </div>

        <div className="section-label">Motor Real (2ª Lei)</div>
        <div className="ctrl">
          <div className="ctrl-head">
            <span className="ctrl-name">Fração do rendimento de Carnot</span>
            <span className="ctrl-num">{fmt(fracao * 100, 0)}%</span>
          </div>
          <input type="range" min="0.3" max="1" step="0.01" value={fracao} onChange={e => setFracao(+e.target.value)} />
        </div>
        <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
          Nenhum motor térmico pode ultrapassar 100% do rendimento de Carnot — por isso o slider trava em 1.
          Abaixo disso, o motor é irreversível e gera entropia extra no universo.
        </p>
      </div>

      <div className="main-area" style={{ padding: 24, overflowY: 'auto' }}>
        <div className="card">
          <div className="section-label" style={{ marginTop: 0 }}>Geração de Entropia (ΔS do Universo)</div>
          <div className="entropy-gauge">
            <div
              className="entropy-gauge-fill"
              style={{
                width: `${Math.min(100, (dS_universo / (Qh / Tc * 0.3)) * 100)}%`,
                background: dS_universo < 0.001 ? '#00F5C4' : 'linear-gradient(90deg, #FBBF24, #EF4444)',
              }}
            />
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 10 }}>
            ΔS<sub>universo</sub> = ΔS<sub>quente</sub> + ΔS<sub>fria</sub> = <strong style={{ color: dS_universo < 0.001 ? '#00F5C4' : '#FBBF24' }}>{fmt(dS_universo, 4)} atm·L/K</strong>
            {dS_universo < 0.001 ? ' — ciclo reversível (limite de Carnot)' : ' — ciclo irreversível, entropia sendo criada'}
          </p>
        </div>

        <div className="card">
          <div className="section-label" style={{ marginTop: 0 }}>Comparação de Rendimento</div>
          <div className="stat-row"><span className="stat-label">Rendimento de Carnot (máximo teórico)</span><span className="stat-val accent">{fmt(etaCarnot * 100, 1)}%</span></div>
          <div className="stat-row"><span className="stat-label">Rendimento real deste motor</span><span className="stat-val warm">{fmt(etaReal * 100, 1)}%</span></div>
        </div>
      </div>

      <div className="sidebar-r">
        <div className="section-label">Balanço de Energia</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">Qₕ (absorvido)</span><span className="stat-val accent">{fmt(Qh, 1)} atm·L</span></div>
          <div className="stat-row"><span className="stat-label">W (trabalho útil)</span><span className="stat-val warm">{fmt(Wreal, 1)} atm·L</span></div>
          <div className="stat-row"><span className="stat-label">Qc (rejeitado)</span><span className="stat-val cool">{fmt(QcReal, 1)} atm·L</span></div>
        </div>

        <div className="section-label">Variação de Entropia</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">ΔS reservatório quente</span><span className="stat-val danger">{fmt(dS_quente, 4)} atm·L/K</span></div>
          <div className="stat-row"><span className="stat-label">ΔS reservatório frio</span><span className="stat-val cool">+{fmt(dS_fria, 4)} atm·L/K</span></div>
          <div className="stat-row"><span className="stat-label">ΔS universo</span><span className="stat-val purple">{fmt(dS_universo, 4)} atm·L/K</span></div>
        </div>

        <div className="section-label">2ª Lei da Termodinâmica</div>
        <div className="eq-block">
          <div className="eq-title">Desigualdade de Clausius</div>
          Δ<span className="sym">S</span><sub>universo</sub> <span className="op">≥</span> 0<br />
          <span className="cmt">igualdade só no limite reversível (Carnot)</span>
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
          <div className="calc-h2">1. O Ciclo de Carnot</div>
          <p className="calc-p">
            O ciclo de Carnot é o ciclo termodinâmico mais eficiente possível operando entre duas temperaturas
            fixas Tₕ (quente) e Tc (fria). É composto por 4 etapas reversíveis:
          </p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">Expansão isotérmica em Tₕ (1→2)</span><span className="step-desc">absorve Qₕ do reservatório quente</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq">Expansão adiabática (2→3)</span><span className="step-desc">Q=0, temperatura cai de Tₕ para Tc</span></div>
            <div className="derivation-step"><span className="step-num">③</span><span className="step-eq">Compressão isotérmica em Tc (3→4)</span><span className="step-desc">libera Qc para o reservatório frio</span></div>
            <div className="derivation-step"><span className="step-num">④</span><span className="step-eq">Compressão adiabática (4→1)</span><span className="step-desc">Q=0, temperatura sobe de Tc para Tₕ</span></div>
          </div>
        </div>

        <div className="calc-section">
          <div className="calc-h2">2. Dedução do Rendimento de Carnot</div>
          <p className="calc-p">Os calores trocados nas etapas isotérmicas valem, pela lei dos gases ideais:</p>
          <div className="big-eq">
            <span className="hi-acc">Q</span>ₕ = nRTₕ·ln(V₂/V₁)     <span className="hi-cool">Q</span>c = nRTc·ln(V₃/V₄)
          </div>
          <p className="calc-p">
            Nas etapas adiabáticas, a relação T·V<sup>γ−1</sup>=constante conecta os volumes:
            V₃/V₂ = V₄/V₁ = (Tₕ/Tc)<sup>1/(γ−1)</sup>. Substituindo, V₃/V₄ = V₂/V₁ — os logaritmos se cancelam:
          </p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">Qc/Qₕ = Tc/Tₕ</span><span className="step-desc">razão de calores = razão de temperaturas</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq">η = W/Qₕ = (Qₕ−Qc)/Qₕ = 1 − Qc/Qₕ</span><span className="step-desc">definição de rendimento</span></div>
            <div className="derivation-step"><span className="step-num">③</span><span className="step-eq"><span className="hi-acc">η_Carnot = 1 − Tc/Tₕ</span></span><span className="step-desc">rendimento máximo possível</span></div>
          </div>
        </div>

        <div className="calc-section">
          <div className="calc-h2">3. Entropia e a Desigualdade de Clausius</div>
          <p className="calc-p">
            A 2ª Lei da Termodinâmica afirma que a entropia do universo nunca diminui. Para um motor operando
            entre dois reservatórios:
          </p>
          <div className="big-eq">
            Δ<span className="hi-pur">S</span><sub>universo</sub> = Δ<span className="hi-pur">S</span><sub>quente</sub> + Δ<span className="hi-pur">S</span><sub>fria</sub> = −<span className="hi-acc">Q</span>ₕ/Tₕ + <span className="hi-cool">Q</span>c/Tc <span className="op">≥</span> 0
          </div>
          <p className="calc-p">
            A igualdade (ΔS=0) só ocorre no limite reversível — exatamente o ciclo de Carnot. Qualquer motor real,
            por ser irreversível (atrito, gradientes de temperatura finitos, etc.), gera entropia extra e por isso
            tem rendimento necessariamente menor que η_Carnot.
          </p>
        </div>

        <div className="calc-section">
          <div className="calc-h2">4. Por que Nenhum Motor Supera Carnot</div>
          <p className="calc-p">
            Suponha, por absurdo, um motor com η &gt; η_Carnot operando entre os mesmos Tₕ e Tc. Poderíamos usá-lo
            para acionar um refrigerador de Carnot (o ciclo invertido) usando parte do seu trabalho. O resultado
            líquido seria transferir calor do reservatório frio para o quente <em>sem</em> nenhum trabalho externo —
            violando o Enunciado de Clausius da 2ª Lei. Logo, η_Carnot é um limite superior absoluto.
          </p>
        </div>

        <div className="calc-section">
          <div className="calc-h2">5. Exemplo Numérico</div>
          <p className="calc-p">
            Um motor de Carnot opera entre Tₕ=600K e Tc=300K, absorvendo Qₕ=500 atm·L por ciclo.
          </p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">η = 1 − 300/600 = 0,5 = 50%</span><span className="step-desc">rendimento de Carnot</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq">W = η·Qₕ = 0,5·500 = 250 atm·L</span><span className="step-desc">trabalho líquido</span></div>
            <div className="derivation-step"><span className="step-num">③</span><span className="step-eq">Qc = Qₕ − W = 250 atm·L</span><span className="step-desc">calor rejeitado</span></div>
            <div className="derivation-step"><span className="step-num">④</span><span className="step-eq">ΔS = −500/600 + 250/300 = 0</span><span className="step-desc">reversível ✓</span></div>
          </div>
        </div>

      </div>
    </div>
  );
}
