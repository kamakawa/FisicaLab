// src/pages/ExperimentoDilatacaoTempoEspaco.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FISICA3_BASE_STYLES, RELATIVIDADE } from '../styles/fisica3Theme';
import PainelExplicativo from '../components/PainelExplicativo';

const { C } = RELATIVIDADE;
const fmt = (n, d = 2) => (typeof n === 'number' && isFinite(n) ? n.toFixed(d) : '—');
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const gammaOf = (beta) => 1 / Math.sqrt(1 - beta * beta);
const triangleWave = (x) => 1 - Math.abs(2 * (x % 1) - 1);

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
.split-row { flex: 1; display: flex; overflow: hidden; }
.split-panel { flex: 1; display: flex; flex-direction: column; border-right: 1px solid var(--border); overflow: hidden; }
.split-panel:last-child { border-right: none; }
`;

export default function ExperimentoDilatacaoTempoEspaco() {
  const [tab, setTab] = useState('relogio');
  return (
    <>
      <style>{STYLES}</style>
      <div className="app">
        <header className="header">
          <div className="header-title">Dilatação do Tempo e Contração do Espaço</div>
          <div className="header-sub">Física 3 · Relatividade Especial</div>
          <span className="header-tag">γ = 1/√(1−v²/c²)</span>
        </header>
        <nav className="tabs">
          {[['relogio', 'Relógio de Luz'], ['contracao', 'Contração do Espaço'], ['calc', 'Cálculo & Derivações']].map(([id, label]) => (
            <button key={id} className={`tab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>{label}</button>
          ))}
        </nav>
        {tab === 'relogio' && <RelogioTab />}
        {tab === 'contracao' && <ContracaoTab />}
        {tab === 'calc' && <CalcTab />}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ABA 1 — RELÓGIO DE LUZ (dilatação do tempo)
// ═══════════════════════════════════════════════════════════════════════════
const TICKS_POR_SEGUNDO = 0.32;

function RelogioTab() {
  const [beta, setBeta] = useState(0.6);
  const [rodando, setRodando] = useState(true);
  const gamma = gammaOf(clamp(beta, 0.01, 0.995));

  const nTicksRef = useRef(0);
  const [display, setDisplay] = useState({ nTicks: 0, tLab: 0 });
  const trailRef = useRef([]);
  const tempoRealRef = useRef(0);

  const leftRef = useRef(null);
  const rightRef = useRef(null);

  useEffect(() => {
    let raf, last = null;
    const step = (now) => {
      if (last !== null) {
        const dt = Math.min((now - last) / 1000, 0.05);
        if (rodando) {
          nTicksRef.current += dt * TICKS_POR_SEGUNDO;
          tempoRealRef.current += dt;
        }
      }
      last = now;

      const N = nTicksRef.current;
      const gammaAtual = gammaOf(clamp(beta, 0.01, 0.995));
      const tLab = gammaAtual * N;
      setDisplay({ nTicks: N, tLab });

      // ── painel esquerdo: referencial da nave (repouso) ──
      const cvL = leftRef.current;
      if (cvL) {
        const dpr = window.devicePixelRatio || 1;
        const W = cvL.clientWidth, H = cvL.clientHeight;
        cvL.width = W * dpr; cvL.height = H * dpr;
        const ctx = cvL.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);

        const topY = H * 0.18, bottomY = H * 0.82, cx = W / 2;
        desenhaEspelhos(ctx, 0, W, topY, bottomY);
        const yFrac = triangleWave(N);
        const py = bottomY - yFrac * (bottomY - topY);
        desenhaFoton(ctx, cx, py);

        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = "11px 'JetBrains Mono', monospace";
        ctx.textAlign = 'center';
        ctx.fillText('referencial da nave (em repouso)', W / 2, H - 8);
      }

      // ── painel direito: referencial do observador externo ──
      const cvR = rightRef.current;
      if (cvR) {
        const dpr = window.devicePixelRatio || 1;
        const W = cvR.clientWidth, H = cvR.clientHeight;
        cvR.width = W * dpr; cvR.height = H * dpr;
        const ctx = cvR.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);

        const topY = H * 0.18, bottomY = H * 0.82;
        desenhaEspelhos(ctx, 0, W, topY, bottomY);

        const velPx = 22 + beta * 90;
        const xShip = (tempoRealRef.current * velPx) % W;
        const yFrac = triangleWave(N);
        const py = bottomY - yFrac * (bottomY - topY);

        const trail = trailRef.current;
        trail.push({ x: xShip, y: py });
        if (trail.length > 30) trail.shift();

        // trilha (zigue-zague recente), quebrando o traço nos saltos de wraparound
        ctx.lineWidth = 2;
        ctx.beginPath();
        let iniciado = false;
        trail.forEach((p, idx) => {
          if (idx > 0 && Math.abs(p.x - trail[idx - 1].x) > W / 2) { iniciado = false; }
          const alpha = 0.12 + 0.55 * (idx / trail.length);
          if (!iniciado) { ctx.moveTo(p.x, p.y); iniciado = true; }
          else { ctx.lineTo(p.x, p.y); }
          ctx.strokeStyle = `rgba(216,180,254,${alpha})`;
        });
        ctx.stroke();

        desenhaFoton(ctx, xShip, py);

        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = "11px 'JetBrains Mono', monospace";
        ctx.textAlign = 'center';
        ctx.fillText('referencial do observador externo (nave em movimento)', W / 2, H - 8);
      }

      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [beta, rodando]);

  const aplicarPreset = (v) => setBeta(v);

  const situacaoAtual = `Com β=${fmt(beta, 3)}c, γ=${fmt(gamma, 4)}. Para cada tique completo do relógio da nave, o observador externo mede ${fmt(gamma, 3)}× mais tempo decorrido — agora τ(nave)=${fmt(display.nTicks, 2)} e t(observador)=${fmt(display.tLab, 2)}.`;

  const perguntasAssistente = [
    {
      id: 'beta',
      pergunta: 'O que é β?',
      resposta: `β=v/c é a velocidade da nave como fração da velocidade da luz. Agora β=${fmt(beta, 3)}, ou seja, a nave viaja a ${fmt(beta * 100, 1)}% da velocidade da luz.`,
    },
    {
      id: 'gamma',
      pergunta: 'O que é o fator γ?',
      resposta: `γ=1/√(1−β²) é o fator de Lorentz — mede o quanto o tempo dilata (e o espaço contrai) devido à velocidade. Agora γ=${fmt(gamma, 4)}, ou seja, o observador externo mede o tempo passar ${fmt(gamma, 3)}× mais devagar na nave.`,
    },
    {
      id: 'relogios',
      pergunta: 'Por que os dois relógios mostram números diferentes?',
      resposta: 'Os dois fótons batem nos espelhos exatamente juntos (é o mesmo evento físico nos dois referenciais) — mas cada observador usa seu próprio relógio para cronometrar isso. O relógio da nave sempre mede menos tempo (τ) que o do observador externo (t), na proporção γ.',
    },
    {
      id: 'zigzag',
      pergunta: 'Por que o fóton faz um zigue-zague no painel direito?',
      resposta: 'No referencial externo, a nave se move enquanto o fóton sobe e desce — então, além do movimento vertical, o fóton também se desloca horizontalmente junto com a nave, formando o caminho diagonal (mais longo que o vertical puro do painel esquerdo).',
    },
  ];

  return (
    <div className="content">
      <PainelExplicativo situacao={situacaoAtual} perguntas={perguntasAssistente} />
      <div className="sidebar-l">
        <div className="section-label">Velocidade da Nave</div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">v / c (β)</span><span className="ctrl-num">{fmt(beta, 3)}c</span></div>
          <input type="range" min="0.05" max="0.995" step="0.005" value={beta} onChange={e => setBeta(+e.target.value)} />
        </div>
        <div className="pill-row">
          <button className="pill" onClick={() => aplicarPreset(0.5)}>0.5c</button>
          <button className="pill" onClick={() => aplicarPreset(0.9)}>0.9c</button>
          <button className="pill" onClick={() => aplicarPreset(0.99)}>0.99c</button>
        </div>

        <div className="btn-row">
          <button className="btn btn-primary" onClick={() => setRodando(r => !r)}>{rodando ? '⏸ Pausar' : '▶ Retomar'}</button>
          <button className="btn btn-danger" onClick={() => { nTicksRef.current = 0; tempoRealRef.current = 0; trailRef.current = []; }}>↩ Reiniciar</button>
        </div>

        <div className="section-label">O que observar</div>
        <div className="card">
          <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.6 }}>
            Os dois fótons batem nos espelhos exatamente juntos (o número de "tiques" é o mesmo
            evento físico nos dois referenciais). A diferença aparece nos relógios: o observador
            externo sempre mede mais tempo decorrido para o mesmo número de tiques.
          </p>
        </div>
      </div>

      <div className="main-area">
        <div className="split-row">
          <div className="split-panel"><canvas ref={leftRef} /></div>
          <div className="split-panel"><canvas ref={rightRef} /></div>
        </div>
      </div>

      <div className="sidebar-r">
        <div className="section-label">Fator de Lorentz</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">γ</span><span className="stat-val accent">{fmt(gamma, 4)}</span></div>
        </div>

        <div className="section-label">Relógios (em tiques, unidade = T₀)</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">τ (nave)</span><span className="stat-val warm">{fmt(display.nTicks, 3)}</span></div>
          <div className="stat-row"><span className="stat-label">t (observador)</span><span className="stat-val cool">{fmt(display.tLab, 3)}</span></div>
          <div className="stat-row"><span className="stat-label">t / τ</span><span className="stat-val">{fmt(display.nTicks > 0.001 ? display.tLab / display.nTicks : gamma, 4)}</span></div>
        </div>

        <div className="alert-box">
          Repare que t/τ converge para γ — exatamente o fator de dilatação temporal. Quanto mais perto
          de c, mais o relógio da nave parece "atrasado" do ponto de vista externo.
        </div>

        <div className="section-label">Equação</div>
        <div className="eq-block">
          <div className="eq-title">Dilatação do Tempo</div>
          <span className="sym">Δt</span> <span className="op">=</span> γ·Δτ
          <br /><span className="cmt">Δτ = tempo próprio (medido no referencial da nave)</span>
        </div>
      </div>
    </div>
  );
}

function desenhaEspelhos(ctx, x0, x1, topY, bottomY) {
  [topY, bottomY].forEach(y => {
    ctx.beginPath();
    ctx.moveTo(x0, y); ctx.lineTo(x1, y);
    ctx.strokeStyle = 'rgba(168,85,247,0.55)';
    ctx.lineWidth = 3;
    ctx.stroke();
  });
}

function desenhaFoton(ctx, x, y) {
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#FBBF24';
  ctx.shadowBlur = 14;
  ctx.shadowColor = '#FBBF24';
  ctx.fill();
  ctx.shadowBlur = 0;
}

// ═══════════════════════════════════════════════════════════════════════════
// ABA 2 — CONTRAÇÃO DO ESPAÇO
// ═══════════════════════════════════════════════════════════════════════════
function ContracaoTab() {
  const [L0, setL0] = useState(10);
  const [beta, setBeta] = useState(0.6);
  const gamma = gammaOf(clamp(beta, 0.01, 0.995));
  const L = L0 / gamma;

  const canvasRef = useRef(null);
  const tRef = useRef(0);

  useEffect(() => {
    let raf, last = null;
    const draw = (now) => {
      if (last !== null) tRef.current += Math.min((now - last) / 1000, 0.05);
      last = now;

      const cv = canvasRef.current;
      if (cv) {
        const dpr = window.devicePixelRatio || 1;
        const W = cv.clientWidth, H = cv.clientHeight;
        cv.width = W * dpr; cv.height = H * dpr;
        const ctx = cv.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);

        const cy = H / 2;
        const pxPorMetro = Math.min(60, (W * 0.7) / Math.max(L0, 1));

        // régua de referência (grade fixa do referencial do laboratório)
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 1;
        ctx.font = "10px 'JetBrains Mono', monospace";
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.textAlign = 'center';
        for (let m = 0; m * pxPorMetro < W; m++) {
          const x = m * pxPorMetro;
          ctx.beginPath(); ctx.moveTo(x, cy - 60); ctx.lineTo(x, cy + 60); ctx.stroke();
          if (m % 2 === 0) ctx.fillText(`${m}m`, x, cy + 78);
        }

        const velPx = 12 + beta * 55;
        const larguraContraida = L * pxPorMetro;
        const larguraRepouso = L0 * pxPorMetro;
        const xFrente = (tRef.current * velPx) % (W + larguraRepouso + 40) - larguraRepouso - 20;

        // silhueta fantasma (comprimento de repouso L0, para comparação)
        ctx.setLineDash([5, 4]);
        ctx.strokeStyle = 'rgba(255,255,255,0.35)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(xFrente, cy - 22, larguraRepouso, 44);
        ctx.setLineDash([]);

        // nave contraída (comprimento real medido pelo observador externo)
        const grad = ctx.createLinearGradient(xFrente, 0, xFrente + larguraContraida, 0);
        grad.addColorStop(0, '#A855F7');
        grad.addColorStop(1, '#7C3AED');
        ctx.fillStyle = grad;
        ctx.fillRect(xFrente, cy - 22, larguraContraida, 44);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(xFrente, cy - 22, larguraContraida, 44);

        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = "10px 'JetBrains Mono', monospace";
        ctx.textAlign = 'center';
        ctx.fillText('L₀ (repouso)', xFrente + larguraRepouso / 2, cy - 30);
        ctx.fillStyle = '#fff';
        ctx.fillText('L (contraído)', xFrente + larguraContraida / 2, cy + 40);
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [L0, beta]);

  return (
    <div className="content">
      <div className="sidebar-l">
        <div className="section-label">Nave</div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Comprimento próprio L₀</span><span className="ctrl-num">{fmt(L0, 1)} m</span></div>
          <input type="range" min="2" max="20" step="0.5" value={L0} onChange={e => setL0(+e.target.value)} />
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">v / c (β)</span><span className="ctrl-num">{fmt(beta, 3)}c</span></div>
          <input type="range" min="0.05" max="0.995" step="0.005" value={beta} onChange={e => setBeta(+e.target.value)} />
        </div>

        <div className="section-label">Nota</div>
        <div className="card">
          <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.6 }}>
            A silhueta tracejada mostra o comprimento próprio L₀ (medido por alguém a bordo da nave).
            O bloco sólido é o que o observador externo mede: contraído por um fator γ, só na direção
            do movimento.
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

        <div className="section-label">Comprimentos</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">L₀ (repouso)</span><span className="stat-val warm">{fmt(L0, 2)} m</span></div>
          <div className="stat-row"><span className="stat-label">L (contraído)</span><span className="stat-val cool">{fmt(L, 2)} m</span></div>
          <div className="stat-row"><span className="stat-label">Contração</span><span className="stat-val danger">{fmt((1 - L / L0) * 100, 1)}%</span></div>
        </div>

        <div className="section-label">Equação</div>
        <div className="eq-block">
          <div className="eq-title">Contração do Espaço</div>
          <span className="sym">L</span> <span className="op">=</span> L₀ / γ
          <br /><span className="cmt">só ocorre na direção do movimento</span>
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
          <div className="calc-h2">1. Os Postulados de Einstein (1905)</div>
          <p className="calc-p">
            A Relatividade Especial parte de apenas dois postulados, dos quais toda a teoria é derivada:
          </p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">Princípio da relatividade</span><span className="step-desc">as leis da física são as mesmas em todo referencial inercial</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq">Constância de c</span><span className="step-desc">a velocidade da luz no vácuo é a mesma para todos os observadores, não importa a velocidade da fonte</span></div>
          </div>
        </div>

        <div className="calc-section">
          <div className="calc-h2">2. Derivando a Dilatação do Tempo (Relógio de Luz)</div>
          <p className="calc-p">
            Considere um relógio de luz com espelhos separados por uma distância D, dentro de uma nave
            que se move com velocidade v. No referencial da nave, o fóton sobe e desce em linha reta,
            levando um tempo próprio Δτ = D/c por trecho. No referencial externo, a nave se move
            enquanto o fóton sobe, então o fóton percorre um caminho diagonal mais longo — mas ainda à
            velocidade c.
          </p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">(cΔt/2)² = D² + (vΔt/2)²</span><span className="step-desc">Pitágoras: hipotenusa=cΔt/2, cateto vertical=D, cateto horizontal=vΔt/2</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq">D = cΔτ/2</span><span className="step-desc">no referencial da nave, D é percorrida em Δτ/2 à velocidade c</span></div>
            <div className="derivation-step"><span className="step-num">③</span><span className="step-eq">(cΔt)² − (vΔt)² = (cΔτ)²</span><span className="step-desc">substituindo D e simplificando</span></div>
            <div className="derivation-step"><span className="step-num">④</span><span className="step-eq"><span className="hi-acc">Δt = γ·Δτ,  γ = 1/√(1−v²/c²)</span></span><span className="step-desc">isolando Δt</span></div>
          </div>
        </div>

        <div className="calc-section">
          <div className="calc-h2">3. Contração do Espaço</div>
          <p className="calc-p">
            A contração segue da dilatação do tempo combinada com o princípio da relatividade: os dois
            observadores devem concordar sobre a velocidade relativa v = L/Δt. Se o tempo próprio de
            travessia Δτ é menor que o tempo Δt medido externamente (Δt=γΔτ), e a nave percorre a mesma
            distância física relativa, o comprimento medido externamente deve ser menor na mesma proporção:
          </p>
          <div className="big-eq">
            <span className="hi-acc">L = L₀ / γ</span>
            <span className="cmt">   ← contração só na direção do movimento; dimensões perpendiculares não mudam</span>
          </div>
        </div>

        <div className="calc-section">
          <div className="calc-h2">4. O Fator de Lorentz γ</div>
          <p className="calc-p">
            γ cresce lentamente em baixas velocidades e diverge conforme v→c:
          </p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">v=0.1c</span><span className="step-eq">γ ≈ {fmt(gammaOf(0.1), 4)}</span><span className="step-desc">quase imperceptível</span></div>
            <div className="derivation-step"><span className="step-num">v=0.5c</span><span className="step-eq">γ ≈ {fmt(gammaOf(0.5), 4)}</span><span className="step-desc">15% de dilatação</span></div>
            <div className="derivation-step"><span className="step-num">v=0.9c</span><span className="step-eq">γ ≈ {fmt(gammaOf(0.9), 4)}</span><span className="step-desc">mais que o dobro</span></div>
            <div className="derivation-step"><span className="step-num">v=0.99c</span><span className="step-eq">γ ≈ {fmt(gammaOf(0.99), 4)}</span><span className="step-desc">quase 10×</span></div>
            <div className="derivation-step"><span className="step-num">v=0.999c</span><span className="step-eq">γ ≈ {fmt(gammaOf(0.999), 4)}</span><span className="step-desc">diverge conforme v→c</span></div>
          </div>
        </div>

        <div className="calc-section">
          <div className="calc-h2">5. Exemplo Numérico</div>
          <p className="calc-p">
            Uma astronauta viaja a v=0.8c (γ≈{fmt(gammaOf(0.8), 3)}) por Δτ=10 anos, segundo o relógio da própria nave.
          </p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">Δt = γ·Δτ = {fmt(gammaOf(0.8), 3)} × 10</span><span className="step-desc">tempo decorrido na Terra</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq">Δt ≈ {fmt(gammaOf(0.8) * 10, 1)} anos</span><span className="step-desc">enquanto a astronauta envelheceu só 10 anos</span></div>
            <div className="derivation-step"><span className="step-num">③</span><span className="step-eq">v = 0.8c ≈ {fmt(0.8 * C / 1000, 0)} km/s</span><span className="step-desc">velocidade em unidades usuais</span></div>
          </div>
        </div>

      </div>
    </div>
  );
}
