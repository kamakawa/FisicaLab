// src/pages/ExperimentoEnergiaMomentoRelativistico.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FISICA3_BASE_STYLES, RELATIVIDADE } from '../styles/fisica3Theme';
import PainelExplicativo from '../components/PainelExplicativo';

const { C } = RELATIVIDADE;
const fmt = (n, d = 2) => (typeof n === 'number' && isFinite(n) ? n.toFixed(d) : '—');
const fmtSci = (n) => (isFinite(n) ? (Math.abs(n) < 1000 && Math.abs(n) >= 0.01 ? n.toFixed(2) : n.toExponential(2)) : '—');
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const gammaOf = (beta) => 1 / Math.sqrt(1 - beta * beta);

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

export default function ExperimentoEnergiaMomentoRelativistico() {
  const [tab, setTab] = useState('energia');
  return (
    <>
      <style>{STYLES}</style>
      <div className="app">
        <header className="header">
          <div className="header-title">Energia e Momento Relativísticos</div>
          <div className="header-sub">Física 3 · Relatividade Especial</div>
          <span className="header-tag">E² = (pc)² + (mc²)²</span>
        </header>
        <nav className="tabs">
          {[['energia', 'Energia e Momento'], ['hiperbole', 'Hipérbole E-p'], ['calc', 'Cálculo & Derivações']].map(([id, label]) => (
            <button key={id} className={`tab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>{label}</button>
          ))}
        </nav>
        {tab === 'energia' && <EnergiaTab />}
        {tab === 'hiperbole' && <HiperboleTab />}
        {tab === 'calc' && <CalcTab />}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ABA 1 — ENERGIA E MOMENTO vs VELOCIDADE
// ═══════════════════════════════════════════════════════════════════════════
function EnergiaTab() {
  const [m, setM] = useState(1);
  const [beta, setBeta] = useState(0.6);
  const betaClamped = clamp(beta, 0.001, 0.995);
  const gamma = gammaOf(betaClamped);

  const p = gamma * m * betaClamped * C;
  const pClassico = m * betaClamped * C;
  const Etotal = gamma * m * C * C;
  const Erest = m * C * C;
  const K = (gamma - 1) * m * C * C;
  const Kclassico = 0.5 * m * Math.pow(betaClamped * C, 2);

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

    const padL = 60, padB = 40, padT = 20, padR = 20;
    const plotW = W - padL - padR, plotH = H - padT - padB;
    const betaMax = 0.995;

    const Npts = 220;
    const curvaE = [], curvaK = [], curvaKc = [];
    let maxY = 1;
    for (let i = 0; i <= Npts; i++) {
      const b = (betaMax * i) / Npts;
      const g = gammaOf(clamp(b, 0, 0.9995));
      curvaE.push({ b, y: g });
      curvaK.push({ b, y: g - 1 });
      curvaKc.push({ b, y: 0.5 * b * b });
      if (isFinite(g)) maxY = Math.max(maxY, g);
    }
    const eixoMax = Math.min(maxY * 1.05, 12);

    const toPx = (b, y) => ({
      x: padL + (b / betaMax) * plotW,
      y: padT + plotH - clamp(y / eixoMax, 0, 1) * plotH,
    });

    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, padT); ctx.lineTo(padL, padT + plotH); ctx.lineTo(padL + plotW, padT + plotH);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = "11px 'JetBrains Mono', monospace";
    ctx.textAlign = 'center';
    ctx.fillText('β = v/c', padL + plotW / 2, H - 10);
    ctx.save();
    ctx.translate(16, padT + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('múltiplos de mc²', 0, 0);
    ctx.restore();

    const desenhaCurva = (curva, cor, largura) => {
      ctx.beginPath();
      curva.forEach((p, idx) => {
        const sp = toPx(p.b, p.y);
        idx === 0 ? ctx.moveTo(sp.x, sp.y) : ctx.lineTo(sp.x, sp.y);
      });
      ctx.strokeStyle = cor;
      ctx.lineWidth = largura;
      ctx.stroke();
    };
    desenhaCurva(curvaE, '#A855F7', 2.5);
    desenhaCurva(curvaK, '#FBBF24', 2.5);
    desenhaCurva(curvaKc, 'rgba(56,189,248,0.7)', 1.8);

    // legenda
    const legendas = [['E total (γ)', '#A855F7'], ['K relativística (γ−1)', '#FBBF24'], ['K clássica (½β²)', 'rgba(56,189,248,0.9)']];
    legendas.forEach(([txt, cor], i) => {
      ctx.fillStyle = cor;
      ctx.fillRect(padL + 10, padT + 8 + i * 18, 10, 10);
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillText(txt, padL + 26, padT + 17 + i * 18);
    });

    // marcador do beta atual
    const gAtual = gamma;
    const pE = toPx(betaClamped, gAtual);
    const pK = toPx(betaClamped, gAtual - 1);
    [[pE, '#A855F7'], [pK, '#FBBF24']].forEach(([pt, cor]) => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = cor;
      ctx.shadowBlur = 8; ctx.shadowColor = cor;
      ctx.fill(); ctx.shadowBlur = 0;
    });
  }, [m, beta, betaClamped, gamma]);

  const situacaoAtual = `Com m=${fmt(m, 3)}kg e β=${fmt(beta, 3)}c (γ=${fmt(gamma, 3)}), a energia cinética real vale K=${fmtSci(K)}J, contra K_clássica=${fmtSci(Kclassico)}J previsto por Newton — uma razão de ${fmt(Kclassico > 0 ? K / Kclassico : 1, 2)}×.`;

  const perguntasAssistente = [
    {
      id: 'gamma',
      pergunta: 'O que é γ e por que ele aparece em tudo?',
      resposta: `γ=1/√(1−β²) é o fator de Lorentz. Agora γ=${fmt(gamma, 4)}. Ele multiplica tanto o momento (p=γmv) quanto a energia (E=γmc²) — é o "preço" relativístico de se mover rápido.`,
    },
    {
      id: 'Etotal',
      pergunta: 'O que é a energia total E?',
      resposta: `E=γmc² é toda a energia da partícula, incluindo a energia de repouso (mc², que ela tem mesmo parada) mais a energia cinética. Agora E=${fmtSci(gamma * m * C * C)}J.`,
    },
    {
      id: 'K',
      pergunta: 'Por que a curva clássica (azul) se afasta da real?',
      resposta: 'K_clássica=½mv² é só uma aproximação, válida para v≪c. Conforme β cresce, essa aproximação subestima cada vez mais a energia real — perto de β=1 a diferença é gigantesca, e a energia real diverge para o infinito.',
    },
    {
      id: 'p',
      pergunta: 'O que é o momento relativístico p?',
      resposta: `p=γmv é a versão correta do momento — o clássico p=mv só vale para v≪c. Agora p=${fmtSci(gamma * m * betaClamped * C)}kg·m/s, contra ${fmtSci(m * betaClamped * C)}kg·m/s pela fórmula clássica.`,
    },
    {
      id: 'infinito',
      pergunta: 'Por que a energia "diverge" perto de c?',
      resposta: 'Porque γ→∞ quando β→1. Como E=γmc², seria necessária energia infinita para acelerar uma partícula com massa até a velocidade da luz — por isso nada com massa consegue atingir c.',
    },
  ];

  return (
    <div className="content">
      <PainelExplicativo situacao={situacaoAtual} perguntas={perguntasAssistente} />
      <div className="sidebar-l">
        <div className="section-label">Partícula</div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Massa m</span><span className="ctrl-num">{fmt(m, 3)} kg</span></div>
          <input type="range" min="0.001" max="5" step="0.001" value={m} onChange={e => setM(+e.target.value)} />
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">v / c (β)</span><span className="ctrl-num">{fmt(beta, 3)}c</span></div>
          <input type="range" min="0.01" max="0.995" step="0.005" value={beta} onChange={e => setBeta(+e.target.value)} />
        </div>

        <div className="section-label">Por que a Curva Diverge</div>
        <div className="card">
          <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.6 }}>
            A curva clássica (azul) subestima cada vez mais a energia real conforme β cresce. Perto de
            β=1, a energia relativística real diverge — por isso é impossível acelerar uma partícula
            com massa até a velocidade da luz.
          </p>
        </div>
      </div>

      <div className="main-area">
        <div className="canvas-wrap"><canvas ref={canvasRef} /></div>
      </div>

      <div className="sidebar-r">
        <div className="section-label">Fator de Lorentz</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">γ</span><span className="stat-val accent">{fmt(gamma, 4)}</span></div>
        </div>

        <div className="section-label">Momento</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">p = γmv</span><span className="stat-val warm">{fmtSci(p)} kg·m/s</span></div>
          <div className="stat-row"><span className="stat-label">p clássico = mv</span><span className="stat-val cool">{fmtSci(pClassico)} kg·m/s</span></div>
        </div>

        <div className="section-label">Energia</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">E_repouso = mc²</span><span className="stat-val">{fmtSci(Erest)} J</span></div>
          <div className="stat-row"><span className="stat-label">E_total = γmc²</span><span className="stat-val" style={{ color: '#A855F7' }}>{fmtSci(Etotal)} J</span></div>
          <div className="stat-row"><span className="stat-label">K = (γ−1)mc²</span><span className="stat-val warm">{fmtSci(K)} J</span></div>
          <div className="stat-row"><span className="stat-label">K clássica = ½mv²</span><span className="stat-val cool">{fmtSci(Kclassico)} J</span></div>
        </div>

        <div className="alert-box">
          Razão K / K_clássica = {fmt(Kclassico > 0 ? K / Kclassico : 1, 2)}× — quanto mais perto de c,
          maior o quanto a física newtoniana subestima a energia necessária.
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ABA 2 — HIPÉRBOLE ENERGIA-MOMENTO
// ═══════════════════════════════════════════════════════════════════════════
function HiperboleTab() {
  const [m, setM] = useState(1);
  const [beta, setBeta] = useState(0.7);
  const [mostrarFoton, setMostrarFoton] = useState(true);
  const betaClamped = clamp(beta, 0.001, 0.995);
  const gamma = gammaOf(betaClamped);

  // eixos normalizados: X = pc/mc² = γβ,  Y = E/mc² = γ  →  Y² − X² = 1 (universal, independe de m)
  const X = gamma * betaClamped;
  const Y = gamma;

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

    const cx = W / 2, cy = H - 50;
    const escala = Math.min(W / 8, (H - 70) / 6);

    const toXY = (px, py) => ({ x: cx + px * escala, y: cy - py * escala });

    // eixos
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1.5;
    let p1 = toXY(-3.6, 0), p2 = toXY(3.6, 0);
    ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
    p1 = toXY(0, 0); p2 = toXY(0, 6);
    ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = "11px 'JetBrains Mono', monospace";
    ctx.textAlign = 'center';
    ctx.fillText('pc / mc²', toXY(3.3, 0).x, toXY(3.3, 0).y - 10);
    ctx.fillText('E / mc²', toXY(0, 5.7).x + 30, toXY(0, 5.7).y);

    // linhas de luz (assíntotas, caso fóton m→0): Y = ±X
    ctx.setLineDash([6, 5]);
    ctx.strokeStyle = 'rgba(251,191,36,0.55)';
    ctx.lineWidth = 1.5;
    p1 = toXY(-3.6, -3.6); p2 = toXY(3.6, 3.6);
    ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
    ctx.setLineDash([]);

    // hipérbole Y² - X² = 1 (universal — a mesma para qualquer massa, em unidades de mc²)
    ctx.strokeStyle = '#A855F7';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let px = -3.6; px <= 3.6; px += 0.03) {
      const py = Math.sqrt(1 + px * px);
      const pt = toXY(px, py);
      px === -3.6 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y);
    }
    ctx.stroke();

    // ponto de repouso (X=0,Y=1)
    const pRepouso = toXY(0, 1);
    ctx.beginPath();
    ctx.arc(pRepouso.x, pRepouso.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fill();

    // marcador da partícula atual
    const pAtual = toXY(X, Y);
    ctx.beginPath();
    ctx.arc(pAtual.x, pAtual.y, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#FBBF24';
    ctx.shadowBlur = 12; ctx.shadowColor = '#FBBF24';
    ctx.fill(); ctx.shadowBlur = 0;

    // ponto do fóton (m=0), sobre a assíntota, para contraste
    if (mostrarFoton) {
      const pFoton = toXY(2.6, 2.6);
      ctx.beginPath();
      ctx.arc(pFoton.x, pFoton.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#38BDF8';
      ctx.shadowBlur = 10; ctx.shadowColor = '#38BDF8';
      ctx.fill(); ctx.shadowBlur = 0;
      ctx.fillStyle = '#38BDF8';
      ctx.textAlign = 'left';
      ctx.fillText('fóton: E=pc (m=0)', pFoton.x + 10, pFoton.y);
    }

    ctx.fillStyle = '#C084FC';
    ctx.textAlign = 'left';
    ctx.fillText('E² = (pc)² + (mc²)²', pAtual.x + 10, pAtual.y - 12);
  }, [m, beta, betaClamped, gamma, X, Y, mostrarFoton]);

  return (
    <div className="content">
      <div className="sidebar-l">
        <div className="section-label">Partícula</div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Massa m</span><span className="ctrl-num">{fmt(m, 3)} kg</span></div>
          <input type="range" min="0.001" max="5" step="0.001" value={m} onChange={e => setM(+e.target.value)} />
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">v / c (β)</span><span className="ctrl-num">{fmt(beta, 3)}c</span></div>
          <input type="range" min="0.01" max="0.995" step="0.005" value={beta} onChange={e => setBeta(+e.target.value)} />
        </div>

        <label className="toggle-row">
          <input type="checkbox" checked={mostrarFoton} onChange={e => setMostrarFoton(e.target.checked)} />
          <span className="toggle-label">Mostrar caso do fóton (m=0)</span>
        </label>

        <div className="card">
          <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.6 }}>
            Essa hipérbole é universal — a mesma para qualquer massa, quando E e p são medidos em
            unidades de mc². Arraste β: o ponto amarelo sobe pela hipérbole e se aproxima cada vez mais
            da reta de luz (assíntota), mas nunca a alcança, pois isso exigiria E→∞.
          </p>
        </div>
      </div>

      <div className="main-area">
        <div className="canvas-wrap"><canvas ref={canvasRef} /></div>
      </div>

      <div className="sidebar-r">
        <div className="section-label">Coordenadas Normalizadas</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">pc / mc² (= γβ)</span><span className="stat-val warm">{fmt(X, 3)}</span></div>
          <div className="stat-row"><span className="stat-label">E / mc² (= γ)</span><span className="stat-val" style={{ color: '#A855F7' }}>{fmt(Y, 3)}</span></div>
        </div>

        <div className="section-label">Valores Físicos</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">mc²</span><span className="stat-val">{fmtSci(m * C * C)} J</span></div>
          <div className="stat-row"><span className="stat-label">p = γmv</span><span className="stat-val cool">{fmtSci(gamma * m * betaClamped * C)} kg·m/s</span></div>
          <div className="stat-row"><span className="stat-label">E = γmc²</span><span className="stat-val warm">{fmtSci(gamma * m * C * C)} J</span></div>
        </div>

        <div className="section-label">Equação</div>
        <div className="eq-block">
          <div className="eq-title">Relação Energia-Momento</div>
          <span className="sym">E²</span> <span className="op">=</span> (pc)² + (mc²)²
          <br /><span className="cmt">análoga ao invariante do Diagrama de Minkowski</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ABA 3 — CÁLCULO & DERIVAÇÕES
// ═══════════════════════════════════════════════════════════════════════════
function CalcTab() {
  const m = 9.109e-31; // massa do elétron, kg
  const beta = 0.99;
  const gamma = gammaOf(beta);
  const K = (gamma - 1) * m * C * C;
  const Kclassico = 0.5 * m * Math.pow(beta * C, 2);

  return (
    <div className="main-area" style={{ overflow: 'auto' }}>
      <div className="calc-page">

        <div className="calc-section">
          <div className="calc-h2">1. Momento Relativístico</div>
          <p className="calc-p">
            O momento clássico p=mv não se conserva em colisões relativísticas se v se aproxima de c. A
            forma correta, que se reduz a mv quando v≪c, é:
          </p>
          <div className="big-eq">
            <span className="hi-acc">p = γmv</span>
          </div>
        </div>

        <div className="calc-section">
          <div className="calc-h2">2. Energia Total e Energia de Repouso</div>
          <p className="calc-p">
            Einstein postulou que a energia total de uma partícula livre é E=γmc². Mesmo em repouso
            (v=0, γ=1), ela carrega uma energia — a famosa equivalência massa-energia:
          </p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">E = γmc²</span><span className="step-desc">energia total</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq"><span className="hi-acc">E₀ = mc²</span> (v=0, γ=1)</span><span className="step-desc">energia de repouso — massa é uma forma de energia</span></div>
            <div className="derivation-step"><span className="step-num">③</span><span className="step-eq">K = E − E₀ = (γ−1)mc²</span><span className="step-desc">energia cinética relativística</span></div>
          </div>
          <p className="calc-p">
            Expandindo γ em série de Taylor para v≪c: γ≈1+½β², logo K≈½mv² — a fórmula clássica é o
            primeiro termo de uma série que a relatividade completa.
          </p>
        </div>

        <div className="calc-section">
          <div className="calc-h2">3. A Relação Energia-Momento</div>
          <p className="calc-p">
            Combinando as definições de E e p, uma relação invariante (a mesma em todo referencial) surge:
          </p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">E² − (pc)² = γ²m²c⁴ − γ²m²v²c²</span><span className="step-desc">substituindo E=γmc², p=γmv</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq">= γ²m²c⁴(1 − v²/c²) = m²c⁴</span><span className="step-desc">já que γ²(1−β²)=1, por definição de γ</span></div>
            <div className="derivation-step"><span className="step-num">③</span><span className="step-eq"><span className="hi-acc">E² = (pc)² + (mc²)²</span></span><span className="step-desc">relação energia-momento</span></div>
          </div>
        </div>

        <div className="calc-section">
          <div className="calc-h2">4. O Caso da Luz (Partículas sem Massa)</div>
          <p className="calc-p">
            Fazendo m=0 na relação energia-momento, sobra uma relação simples, válida para fótons e
            qualquer partícula sem massa:
          </p>
          <div className="big-eq">
            <span className="hi-acc">E = pc</span>
            <span className="cmt">   ← a reta assíntota da hipérbole universal, quando m→0</span>
          </div>
        </div>

        <div className="calc-section">
          <div className="calc-h2">5. Por que Nada com Massa Atinge a Velocidade da Luz</div>
          <p className="calc-p">
            Conforme v→c (β→1), γ→∞. Como E=γmc² e p=γmv, ambos divergem para qualquer m&gt;0 — seria
            necessária uma quantidade infinita de energia para acelerar uma partícula massiva até c.
            Só partículas com m=0 (como o fóton) podem viajar exatamente a c, e nesse caso, "acelerar"
            não faz sentido: elas sempre se movem a c.
          </p>
        </div>

        <div className="calc-section">
          <div className="calc-h2">6. Exemplo Numérico</div>
          <p className="calc-p">
            Um elétron (m≈{m.toExponential(3)} kg) acelerado a β={beta}c (γ≈{fmt(gamma, 3)}):
          </p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">K_relativística = (γ−1)mc² ≈ {fmtSci(K)} J</span><span className="step-desc">energia cinética real</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq">K_clássica = ½mv² ≈ {fmtSci(Kclassico)} J</span><span className="step-desc">previsão newtoniana, incorreta aqui</span></div>
            <div className="derivation-step"><span className="step-num">③</span><span className="step-eq">razão ≈ {fmt(K / Kclassico, 2)}×</span><span className="step-desc">a física clássica subestima a energia necessária nessa velocidade</span></div>
          </div>
        </div>

      </div>
    </div>
  );
}
