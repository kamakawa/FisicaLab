// src/pages/ExperimentoLinhasCampo.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FISICA3_BASE_STYLES, ELETRO } from '../styles/fisica3Theme';

const { K } = ELETRO;
const fmt = (n, d = 2) => (typeof n === 'number' && isFinite(n) ? n.toFixed(d) : '—');
const fmtSci = (n) => (isFinite(n) ? (Math.abs(n) < 1000 && Math.abs(n) >= 0.01 ? n.toFixed(2) : n.toExponential(2)) : '—');
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

const STYLES = FISICA3_BASE_STYLES + `
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
  background: rgba(168,85,247,0.1);
}
`;

// ─── Configurações de carga (posições em unidades de cena, Q aplicado com o sinal indicado) ──
const CONFIGS = {
  unica: { label: 'Carga Única', cargas: [{ x: 0, y: 0, sinal: 1 }] },
  dipolo: { label: 'Dipolo', cargas: [{ x: -0.8, y: 0, sinal: 1 }, { x: 0.8, y: 0, sinal: -1 }] },
  iguais: { label: 'Cargas Iguais', cargas: [{ x: -0.8, y: 0, sinal: 1 }, { x: 0.8, y: 0, sinal: 1 }] },
  quadrupolo: {
    label: 'Quadrupolo',
    cargas: [
      { x: -0.8, y: 0.8, sinal: 1 }, { x: 0.8, y: 0.8, sinal: -1 },
      { x: -0.8, y: -0.8, sinal: -1 }, { x: 0.8, y: -0.8, sinal: 1 },
    ],
  },
};

function montaCargas(configId, Q) {
  return CONFIGS[configId].cargas.map(c => ({ x: c.x, y: c.y, q: c.sinal * Q * 1e-6 }));
}

function campoEm(pos, cargas) {
  let Ex = 0, Ey = 0;
  cargas.forEach(c => {
    const dx = pos.x - c.x, dy = pos.y - c.y;
    const r2 = dx * dx + dy * dy;
    if (r2 < 0.0009) return;
    const r = Math.sqrt(r2);
    const mag = (K * c.q) / r2;
    Ex += (mag * dx) / r;
    Ey += (mag * dy) / r;
  });
  return { x: Ex, y: Ey };
}

function potencialEm(pos, cargas) {
  let V = 0;
  cargas.forEach(c => {
    const r = Math.max(0.05, Math.hypot(pos.x - c.x, pos.y - c.y));
    V += (K * c.q) / r;
  });
  return V;
}

// Traça uma linha de campo a partir de um ponto, seguindo (ou contra) o campo
function tracaLinha(cargas, start, sentido, limite) {
  const pontos = [{ ...start }];
  let pos = { ...start };
  const passo = 0.05;
  for (let i = 0; i < 500; i++) {
    const E = campoEm(pos, cargas);
    const mag = Math.hypot(E.x, E.y);
    if (mag < 1e-3) break;
    pos = { x: pos.x + (E.x / mag) * passo * sentido, y: pos.y + (E.y / mag) * passo * sentido };
    pontos.push({ ...pos });
    if (cargas.some(c => c.q < 0 && Math.hypot(pos.x - c.x, pos.y - c.y) < 0.14)) break;
    if (Math.abs(pos.x) > limite || Math.abs(pos.y) > limite) break;
  }
  return pontos;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════
export default function ExperimentoLinhasCampo() {
  const [tab, setTab] = useState('sim');

  return (
    <>
      <style>{STYLES}</style>
      <div className="app">
        <header className="header">
          <div className="header-title">Linhas de Campo e Potencial</div>
          <div className="header-sub">Física 3 · Eletrostática</div>
          <span className="header-tag">V = Σ k·qᵢ/rᵢ</span>
        </header>

        <nav className="tabs">
          {[
            ['sim', 'Simulação'],
            ['trabalho', 'Trabalho e ΔV'],
            ['calc', 'Cálculo & Derivações'],
          ].map(([id, label]) => (
            <button key={id} className={`tab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </nav>

        {tab === 'sim' && <SimTab />}
        {tab === 'trabalho' && <TrabalhoTab />}
        {tab === 'calc' && <CalcTab />}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ABA 1 — SIMULAÇÃO (linhas de campo + mapa de potencial + carga de teste)
// ═══════════════════════════════════════════════════════════════════════════
function SimTab() {
  const [configId, setConfigId] = useState('dipolo');
  const [Q, setQ] = useState(10);
  const [mostraPotencial, setMostraPotencial] = useState(true);
  const [mostraCampo, setMostraCampo] = useState(true);
  const [x0, setX0] = useState(-1.4);
  const [y0, setY0] = useState(0.6);
  const [sinalTeste, setSinalTeste] = useState(1);
  const [solto, setSolto] = useState(false);

  const cargas = montaCargas(configId, Q);
  const stateRef = useRef({ cargas, sinalTeste });
  useEffect(() => { stateRef.current = { cargas, sinalTeste }; }, [configId, Q, sinalTeste]);

  const testePosRef = useRef({ x: x0, y: y0 });
  const [testeDisp, setTesteDisp] = useState({ x: x0, y: y0 });
  const rafRef = useRef(null);
  const lastRef = useRef(null);

  useEffect(() => {
    testePosRef.current = { x: x0, y: y0 };
    setTesteDisp({ x: x0, y: y0 });
    setSolto(false);
  }, [x0, y0, configId, Q, sinalTeste]);

  useEffect(() => {
    if (!solto) { lastRef.current = null; return; }
    const step = (now) => {
      if (lastRef.current !== null) {
        const dt = Math.min((now - lastRef.current) / 1000, 0.03);
        const s = stateRef.current;
        const E = campoEm(testePosRef.current, s.cargas);
        const mag = Math.hypot(E.x, E.y);
        if (mag > 1e-3) {
          const vel = 1.1 * s.sinalTeste;
          testePosRef.current = {
            x: testePosRef.current.x + (E.x / mag) * vel * dt,
            y: testePosRef.current.y + (E.y / mag) * vel * dt,
          };
        }
        setTesteDisp({ ...testePosRef.current });
        const p = testePosRef.current;
        if (s.cargas.some(c => (s.sinalTeste > 0 ? c.q < 0 : c.q > 0) && Math.hypot(p.x - c.x, p.y - c.y) < 0.16)) setSolto(false);
        if (Math.abs(p.x) > 2.2 || Math.abs(p.y) > 2.2) setSolto(false);
      }
      lastRef.current = now;
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [solto]);

  const canvasRef = useRef(null);
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    let raf, t = 0;
    const ctx = cv.getContext('2d');
    const draw = () => {
      t += 0.016;
      const dpr = window.devicePixelRatio || 1;
      const W = cv.clientWidth, H = cv.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      const cx = W / 2, cy = H / 2;
      const escala = Math.min(W, H) / 4.4; // px por unidade de cena
      const limite = 2.1;
      const toXY = (p) => ({ x: cx + p.x * escala, y: cy - p.y * escala });

      const s = stateRef.current;

      // Mapa de potencial (grade grosseira, cada célula pintada por V)
      if (mostraPotencial) {
        const cel = 12;
        const Vref = Math.abs(potencialEm({ x: 0.35, y: 0 }, s.cargas)) || 1;
        for (let py = 0; py < H; py += cel) {
          for (let px = 0; px < W; px += cel) {
            const worldX = (px + cel / 2 - cx) / escala;
            const worldY = -(py + cel / 2 - cy) / escala;
            const V = potencialEm({ x: worldX, y: worldY }, s.cargas);
            const frac = clamp(V / Vref, -1, 1);
            ctx.fillStyle = frac >= 0
              ? `rgba(239,68,68,${Math.abs(frac) * 0.5})`
              : `rgba(56,189,248,${Math.abs(frac) * 0.5})`;
            ctx.fillRect(px, py, cel, cel);
          }
        }
      }

      // Linhas de campo (saem das cargas positivas)
      if (mostraCampo) {
        s.cargas.filter(c => c.q > 0).forEach(c => {
          const n = 10;
          for (let i = 0; i < n; i++) {
            const ang = (i / n) * Math.PI * 2;
            const start = { x: c.x + Math.cos(ang) * 0.16, y: c.y + Math.sin(ang) * 0.16 };
            const linha = tracaLinha(s.cargas, start, 1, limite);
            ctx.beginPath();
            linha.forEach((p, idx) => {
              const sp = toXY(p);
              idx === 0 ? ctx.moveTo(sp.x, sp.y) : ctx.lineTo(sp.x, sp.y);
            });
            ctx.strokeStyle = 'rgba(255,255,255,0.35)';
            ctx.lineWidth = 1.3;
            ctx.stroke();
          }
        });
      }

      // Cargas
      s.cargas.forEach(c => {
        const p = toXY(c);
        const positiva = c.q >= 0;
        const cor = positiva ? '#EF4444' : '#38BDF8';
        const pulso = 0.92 + 0.08 * Math.sin(t * 3 + c.x * 2);
        const grad = ctx.createRadialGradient(p.x - 4, p.y - 4, 1, p.x, p.y, 18);
        grad.addColorStop(0, positiva ? '#ff9d9d' : '#93c5fd');
        grad.addColorStop(1, cor);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 15 * pulso, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.shadowBlur = 14;
        ctx.shadowColor = cor + '99';
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(positiva ? '+' : '−', p.x, p.y);
      });

      // Carga de teste
      const tp = toXY(testePosRef.current);
      ctx.beginPath();
      ctx.arc(tp.x, tp.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = sinalTesteCorAtual(s.sinalTeste);
      ctx.shadowBlur = 12;
      ctx.shadowColor = sinalTesteCorAtual(s.sinalTeste);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      raf = requestAnimationFrame(draw);
    };
    function sinalTesteCorAtual(sinal) { return sinal > 0 ? '#FBBF24' : '#A855F7'; }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [mostraPotencial, mostraCampo]);

  const Vteste = potencialEm(testeDisp, cargas);

  return (
    <div className="content">
      <div className="sidebar-l">
        <div className="section-label">Configuração de Cargas</div>
        <div className="pill-row">
          {Object.entries(CONFIGS).map(([id, cfg]) => (
            <button key={id} className={`pill ${configId === id ? 'on' : ''}`} onClick={() => setConfigId(id)}>{cfg.label}</button>
          ))}
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Magnitude das cargas</span><span className="ctrl-num">{fmt(Q, 1)} μC</span></div>
          <input type="range" min="1" max="20" step="0.5" value={Q} onChange={e => setQ(+e.target.value)} />
        </div>

        <div className="section-label">Visualização</div>
        <label className="toggle-row">
          <input type="checkbox" checked={mostraPotencial} onChange={e => setMostraPotencial(e.target.checked)} />
          <span className="toggle-label">Mapa de potencial</span>
        </label>
        <label className="toggle-row">
          <input type="checkbox" checked={mostraCampo} onChange={e => setMostraCampo(e.target.checked)} />
          <span className="toggle-label">Linhas de campo</span>
        </label>

        <div className="section-label">Carga de Teste</div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Posição inicial x</span><span className="ctrl-num">{fmt(x0, 2)}</span></div>
          <input type="range" min="-2" max="2" step="0.05" value={x0} onChange={e => setX0(+e.target.value)} />
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Posição inicial y</span><span className="ctrl-num">{fmt(y0, 2)}</span></div>
          <input type="range" min="-2" max="2" step="0.05" value={y0} onChange={e => setY0(+e.target.value)} />
        </div>
        <div className="pill-row">
          <button className={`pill ${sinalTeste > 0 ? 'on' : ''}`} onClick={() => setSinalTeste(1)}>Teste Positiva</button>
          <button className={`pill ${sinalTeste < 0 ? 'on' : ''}`} onClick={() => setSinalTeste(-1)}>Teste Negativa</button>
        </div>
        <div className="btn-row">
          <button className="btn btn-primary" onClick={() => setSolto(true)}>▶ Soltar</button>
          <button className="btn btn-danger" onClick={() => { testePosRef.current = { x: x0, y: y0 }; setTesteDisp({ x: x0, y: y0 }); setSolto(false); }}>↩ Reset</button>
        </div>
      </div>

      <div className="main-area">
        <div className="canvas-wrap"><canvas ref={canvasRef} /></div>
      </div>

      <div className="sidebar-r">
        <div className="section-label">Carga de Teste</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">Posição</span><span className="stat-val">({fmt(testeDisp.x, 2)}, {fmt(testeDisp.y, 2)})</span></div>
          <div className="stat-row"><span className="stat-label">Potencial no ponto V</span><span className="stat-val accent">{fmtSci(Vteste)} V</span></div>
        </div>

        <div className="section-label">Convenções</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">Linhas de campo</span><span className="stat-val warm">saem de + / entram em −</span></div>
          <div className="stat-row"><span className="stat-label">Mapa de potencial</span><span className="stat-val positivo">vermelho=V+, azul=V−</span></div>
        </div>

        <div className="section-label">Equações</div>
        <div className="eq-block">
          <div className="eq-title">Potencial Elétrico</div>
          <span className="sym">V</span> <span className="op">=</span> Σᵢ k·qᵢ/rᵢ
        </div>
        <div className="eq-block">
          <div className="eq-title">Regra Geométrica</div>
          equipotenciais <span className="op">⊥</span> linhas de campo, sempre
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ABA 2 — TRABALHO E DIFERENÇA DE POTENCIAL
// ═══════════════════════════════════════════════════════════════════════════
function TrabalhoTab() {
  const [configId, setConfigId] = useState('dipolo');
  const [Q, setQ] = useState(10);
  const [qTeste, setQTeste] = useState(2);
  const [ax, setAx] = useState(-1.5);
  const [ay, setAy] = useState(0.8);
  const [bx, setBx] = useState(1.5);
  const [by, setBy] = useState(-0.8);

  const cargas = montaCargas(configId, Q);
  const VA = potencialEm({ x: ax, y: ay }, cargas);
  const VB = potencialEm({ x: bx, y: by }, cargas);
  const deltaV = VB - VA;
  const W = qTeste * 1e-6 * (VA - VB);

  const canvasRef = useRef(null);
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const W_ = cv.clientWidth, H_ = cv.clientHeight;
    cv.width = W_ * dpr; cv.height = H_ * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W_, H_);

    const cx = W_ / 2, cy = H_ / 2;
    const escala = Math.min(W_, H_) / 4.4;
    const toXY = (p) => ({ x: cx + p.x * escala, y: cy - p.y * escala });

    cargas.forEach(c => {
      const p = toXY(c);
      const positiva = c.q >= 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 15, 0, Math.PI * 2);
      ctx.fillStyle = positiva ? '#EF4444' : '#38BDF8';
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(positiva ? '+' : '−', p.x, p.y);
    });

    const pA = toXY({ x: ax, y: ay });
    const pB = toXY({ x: bx, y: by });
    ctx.beginPath();
    ctx.setLineDash([5, 5]);
    ctx.moveTo(pA.x, pA.y);
    ctx.lineTo(pB.x, pB.y);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.setLineDash([]);

    [[pA, 'A', '#FBBF24'], [pB, 'B', '#A855F7']].forEach(([p, label, cor]) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
      ctx.fillStyle = cor;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = cor;
      ctx.font = "bold 12px 'JetBrains Mono', monospace";
      ctx.textAlign = 'center';
      ctx.fillText(label, p.x, p.y - 14);
    });
  }, [configId, Q, ax, ay, bx, by]);

  return (
    <div className="content">
      <div className="sidebar-l">
        <div className="section-label">Configuração de Cargas</div>
        <div className="pill-row">
          {Object.entries(CONFIGS).map(([id, cfg]) => (
            <button key={id} className={`pill ${configId === id ? 'on' : ''}`} onClick={() => setConfigId(id)}>{cfg.label}</button>
          ))}
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Magnitude das cargas</span><span className="ctrl-num">{fmt(Q, 1)} μC</span></div>
          <input type="range" min="1" max="20" step="0.5" value={Q} onChange={e => setQ(+e.target.value)} />
        </div>

        <div className="section-label">Carga de Teste</div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Carga q</span><span className="ctrl-num">{fmt(qTeste, 1)} μC</span></div>
          <input type="range" min="-10" max="10" step="0.5" value={qTeste} onChange={e => setQTeste(+e.target.value)} />
        </div>

        <div className="section-label">Ponto A</div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">x_A</span><span className="ctrl-num">{fmt(ax, 2)}</span></div>
          <input type="range" min="-2" max="2" step="0.05" value={ax} onChange={e => setAx(+e.target.value)} />
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">y_A</span><span className="ctrl-num">{fmt(ay, 2)}</span></div>
          <input type="range" min="-2" max="2" step="0.05" value={ay} onChange={e => setAy(+e.target.value)} />
        </div>

        <div className="section-label">Ponto B</div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">x_B</span><span className="ctrl-num">{fmt(bx, 2)}</span></div>
          <input type="range" min="-2" max="2" step="0.05" value={bx} onChange={e => setBx(+e.target.value)} />
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">y_B</span><span className="ctrl-num">{fmt(by, 2)}</span></div>
          <input type="range" min="-2" max="2" step="0.05" value={by} onChange={e => setBy(+e.target.value)} />
        </div>
      </div>

      <div className="main-area">
        <div className="canvas-wrap"><canvas ref={canvasRef} /></div>
      </div>

      <div className="sidebar-r">
        <div className="section-label">Potenciais</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">V_A</span><span className="stat-val warm">{fmtSci(VA)} V</span></div>
          <div className="stat-row"><span className="stat-label">V_B</span><span className="stat-val purple">{fmtSci(VB)} V</span></div>
          <div className="stat-row"><span className="stat-label">ΔV = V_B − V_A</span><span className="stat-val cool">{fmtSci(deltaV)} V</span></div>
        </div>

        <div className="section-label">Trabalho</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">W (de A até B)</span><span className={`stat-val ${W >= 0 ? 'positivo' : 'negativo'}`}>{fmtSci(W)} J</span></div>
        </div>

        <div className="section-label">Equação</div>
        <div className="eq-block">
          <div className="eq-title">Trabalho da Força Elétrica</div>
          <span className="sym">W</span>_A→B <span className="op">=</span> q·(V_A − V_B)
          <br /><span className="cmt">independe do caminho percorrido — só dos pontos A e B</span>
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
          <div className="calc-h2">1. Potencial Elétrico de uma Carga Pontual</div>
          <p className="calc-p">
            O potencial elétrico é o trabalho por unidade de carga necessário para trazer uma carga de
            teste do infinito até um ponto, contra o campo. Integrando o campo E=kq/r² ao longo do caminho:
          </p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">V(r) = −∫∞ʳ E dr' = −∫∞ʳ kq/r'² dr'</span><span className="step-desc">definição via integral de linha</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq"><span className="hi-acc">V(r) = k·q/r</span></span><span className="step-desc">potencial de uma carga pontual (V(∞)=0)</span></div>
          </div>
          <p className="calc-p">
            Diferente do campo (vetorial), o potencial é <strong>escalar</strong> — não tem direção, só
            magnitude e sinal.
          </p>
        </div>

        <div className="calc-section">
          <div className="calc-h2">2. Superposição de Potenciais</div>
          <p className="calc-p">
            Como o potencial é escalar, a superposição é uma soma algébrica simples (não vetorial) —
            muito mais fácil de calcular que o campo:
          </p>
          <div className="big-eq">
            <span className="hi-acc">V_total = Σᵢ k·qᵢ/rᵢ</span>
          </div>
        </div>

        <div className="calc-section">
          <div className="calc-h2">3. Relação entre Campo e Potencial</div>
          <p className="calc-p">
            O campo elétrico aponta na direção de maior <em>decréscimo</em> do potencial, com magnitude
            igual à taxa dessa variação:
          </p>
          <div className="big-eq">
            <span className="hi-acc">E⃗ = −∇V</span>
            <span className="cmt">   ← em 1D: E = −dV/dr</span>
          </div>
          <p className="calc-p">
            Consequência geométrica: como o campo é perpendicular às superfícies de V constante (senão
            haveria variação de V ao longo da superfície), <strong>linhas de campo e linhas equipotenciais
            são sempre perpendiculares entre si</strong>.
          </p>
        </div>

        <div className="calc-section">
          <div className="calc-h2">4. Trabalho e Energia Potencial Elétrica</div>
          <p className="calc-p">
            O trabalho realizado pela força elétrica ao mover uma carga q de A até B depende só da
            diferença de potencial entre os pontos — não do caminho percorrido (força conservativa):
          </p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">W_A→B = q·(V_A − V_B)</span><span className="step-desc">trabalho da força elétrica</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq">U = q·V</span><span className="step-desc">energia potencial elétrica no ponto</span></div>
            <div className="derivation-step"><span className="step-num">③</span><span className="step-eq">W_A→B = U_A − U_B = −ΔU</span><span className="step-desc">trabalho = menos a variação de energia potencial</span></div>
          </div>
        </div>

        <div className="calc-section">
          <div className="calc-h2">5. Exemplo Numérico</div>
          <p className="calc-p">
            Uma carga de +5μC é movida de um ponto onde V_A=800V para outro onde V_B=200V.
          </p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">ΔV = 200 − 800 = −600V</span><span className="step-desc">variação de potencial</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq">W = 5×10⁻⁶ × (800−200) = 3×10⁻³ J</span><span className="step-desc">trabalho da força elétrica</span></div>
            <div className="derivation-step"><span className="step-num">③</span><span className="step-eq">W &gt; 0 → a força elétrica realiza trabalho positivo</span><span className="step-desc">carga positiva "cai" espontaneamente para menor V</span></div>
          </div>
        </div>

      </div>
    </div>
  );
}
