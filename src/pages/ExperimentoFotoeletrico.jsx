// src/pages/ExperimentoFotoeletrico.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FISICA3_BASE_STYLES, RELATIVIDADE, QUANTICA } from '../styles/fisica3Theme';
import PainelExplicativo from '../components/PainelExplicativo';

const { C } = RELATIVIDADE;
const { H_EV } = QUANTICA;
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

const MATERIAIS = {
  sodio: { label: 'Sódio (Na)', phi: 2.28 },
  zinco: { label: 'Zinco (Zn)', phi: 4.33 },
  cobre: { label: 'Cobre (Cu)', phi: 4.7 },
  platina: { label: 'Platina (Pt)', phi: 6.35 },
};

function corDoComprimentoOnda(nm) {
  if (nm < 380) return { r: 138, g: 43, b: 226, uv: true };
  let r, g, b;
  if (nm < 440) { r = -(nm - 440) / (440 - 380); g = 0; b = 1; }
  else if (nm < 490) { r = 0; g = (nm - 440) / (490 - 440); b = 1; }
  else if (nm < 510) { r = 0; g = 1; b = -(nm - 510) / (510 - 490); }
  else if (nm < 580) { r = (nm - 510) / (580 - 510); g = 1; b = 0; }
  else if (nm < 645) { r = 1; g = -(nm - 645) / (645 - 580); b = 0; }
  else { r = 1; g = 0; b = 0; }
  return { r: Math.round(clamp(r, 0, 1) * 255), g: Math.round(clamp(g, 0, 1) * 255), b: Math.round(clamp(b, 0, 1) * 255), uv: false };
}

export default function ExperimentoFotoeletrico() {
  const [tab, setTab] = useState('sim');
  return (
    <>
      <style>{STYLES}</style>
      <div className="app">
        <header className="header">
          <div className="header-title">Efeito Fotoelétrico</div>
          <div className="header-sub">Física 3 · Física Moderna</div>
          <span className="header-tag">K_max = hf − φ</span>
        </header>
        <nav className="tabs">
          {[['sim', 'Simulação'], ['grafico', 'Gráfico K_max vs f'], ['calc', 'Cálculo & Derivações']].map(([id, label]) => (
            <button key={id} className={`tab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>{label}</button>
          ))}
        </nav>
        {tab === 'sim' && <SimTab />}
        {tab === 'grafico' && <GraficoTab />}
        {tab === 'calc' && <CalcTab />}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ABA 1 — SIMULAÇÃO
// ═══════════════════════════════════════════════════════════════════════════
function SimTab() {
  const [material, setMaterial] = useState('zinco');
  const [lambda, setLambda] = useState(300);
  const [intensidade, setIntensidade] = useState(50);

  const phi = MATERIAIS[material].phi;
  const f = C / (lambda * 1e-9);
  const Efoton = H_EV * f;
  const Kmax = Efoton - phi;
  const ejeta = Kmax > 0;
  const Vcorte = Math.max(0, Kmax);
  const f0 = phi / H_EV;
  const lambda0 = (C / f0) * 1e9;

  const stateRef = useRef({ ejeta, Kmax, lambda, intensidade });
  useEffect(() => { stateRef.current = { ejeta, Kmax, lambda, intensidade }; }, [ejeta, Kmax, lambda, intensidade]);

  const particulasRef = useRef([]);
  const canvasRef = useRef(null);
  useEffect(() => {
    let raf, last = null, acumulador = 0;
    const ctx2 = canvasRef.current?.getContext('2d');
    const draw = (now) => {
      if (last !== null && ctx2) {
        const dt = Math.min((now - last) / 1000, 0.05);
        const s = stateRef.current;
        const cv = canvasRef.current;
        const W = cv.clientWidth, H = cv.clientHeight;
        const xPlaca = W * 0.42;

        acumulador += dt;
        const intervalo = 0.5 - (s.intensidade / 100) * 0.42;
        if (acumulador > intervalo) {
          acumulador = 0;
          const cor = corDoComprimentoOnda(s.lambda);
          particulasRef.current.push({
            tipo: 'foton', x: 0, y: 20 + Math.random() * (H - 40),
            vx: 220, vy: 0, cor: `rgb(${cor.r},${cor.g},${cor.b})`, uv: cor.uv,
          });
        }

        const dpr = window.devicePixelRatio || 1;
        cv.width = W * dpr; cv.height = H * dpr;
        ctx2.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx2.clearRect(0, 0, W, H);

        // placa metálica
        ctx2.fillStyle = 'rgba(168,85,247,0.15)';
        ctx2.strokeStyle = '#A855F7';
        ctx2.lineWidth = 2;
        ctx2.fillRect(xPlaca, 10, 14, H - 20);
        ctx2.strokeRect(xPlaca, 10, 14, H - 20);
        ctx2.fillStyle = 'rgba(255,255,255,0.4)';
        ctx2.font = "11px 'JetBrains Mono', monospace";
        ctx2.textAlign = 'center';
        ctx2.fillText('placa metálica', xPlaca + 7, H - 6);

        const novos = [];
        particulasRef.current.forEach(p => {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          if (p.tipo === 'foton') {
            if (p.x >= xPlaca) {
              if (s.ejeta) {
                const vEletron = 90 + 260 * Math.min(1, Math.sqrt(s.Kmax) / 3);
                novos.push({ tipo: 'eletron', x: xPlaca, y: p.y, vx: -vEletron, vy: (Math.random() - 0.5) * 40, vida: 1.4 });
              } else {
                novos.push({ tipo: 'absorvido', x: xPlaca, y: p.y, vida: 0.3 });
              }
              return;
            }
          } else if (p.tipo === 'eletron') {
            p.vida -= dt;
            if (p.x < -10 || p.vida <= 0) return;
          } else if (p.tipo === 'absorvido') {
            p.vida -= dt;
            if (p.vida <= 0) return;
          }
          novos.push(p);
        });
        particulasRef.current = novos;

        particulasRef.current.forEach(p => {
          if (p.tipo === 'foton') {
            ctx2.beginPath();
            ctx2.arc(p.x, p.y, 4, 0, Math.PI * 2);
            ctx2.fillStyle = p.uv ? 'rgba(138,43,226,0.55)' : p.cor;
            ctx2.shadowBlur = 8; ctx2.shadowColor = p.cor;
            ctx2.fill(); ctx2.shadowBlur = 0;
          } else if (p.tipo === 'eletron') {
            ctx2.beginPath();
            ctx2.arc(p.x, p.y, 4, 0, Math.PI * 2);
            ctx2.fillStyle = `rgba(56,189,248,${clamp(p.vida, 0, 1)})`;
            ctx2.shadowBlur = 10; ctx2.shadowColor = '#38BDF8';
            ctx2.fill(); ctx2.shadowBlur = 0;
            ctx2.fillStyle = '#fff';
            ctx2.font = 'bold 8px sans-serif';
            ctx2.textAlign = 'center'; ctx2.textBaseline = 'middle';
            ctx2.fillText('−', p.x, p.y);
            ctx2.textBaseline = 'alphabetic';
          } else if (p.tipo === 'absorvido') {
            ctx2.beginPath();
            ctx2.arc(p.x, p.y, 8 * (1 - p.vida / 0.3), 0, Math.PI * 2);
            ctx2.strokeStyle = `rgba(255,255,255,${p.vida / 0.3 * 0.5})`;
            ctx2.lineWidth = 1.5;
            ctx2.stroke();
          }
        });

        if (!s.ejeta) {
          ctx2.fillStyle = 'rgba(255,255,255,0.35)';
          ctx2.font = "12px 'JetBrains Mono', monospace";
          ctx2.textAlign = 'left';
          ctx2.fillText('hf < φ — nenhum elétron ejetado, não importa a intensidade', xPlaca + 24, 24);
        }
      }
      last = now;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  const situacaoAtual = `Com λ=${fmt(lambda, 0)}nm sobre ${MATERIAIS[material].label} (φ=${fmt(phi, 2)}eV), cada fóton carrega E=${fmt(Efoton, 3)}eV. ${ejeta ? `Isso é maior que φ, então elétrons são ejetados com K_max=${fmt(Kmax, 3)}eV.` : 'Isso é menor que φ, então nenhum elétron é ejetado — não importa a intensidade.'}`;

  const perguntasAssistente = [
    {
      id: 'lambda',
      pergunta: 'O que é o comprimento de onda λ?',
      resposta: `λ é o comprimento de onda da luz incidente, em nanômetros. Agora vale ${fmt(lambda, 0)}nm — quanto menor λ, maior a frequência f=c/λ e maior a energia de cada fóton (E=hf).`,
    },
    {
      id: 'phi',
      pergunta: 'O que é a função trabalho φ?',
      resposta: `φ é a energia mínima necessária para arrancar um elétron da superfície do metal. Cada material tem a sua — ${MATERIAIS[material].label} tem φ=${fmt(phi, 2)}eV. Quanto maior φ, mais difícil ejetar elétrons.`,
    },
    {
      id: 'intensidade',
      pergunta: 'Por que a intensidade não muda K_max?',
      resposta: 'A intensidade controla quantos fótons chegam por segundo (logo, quantos elétrons são ejetados), mas cada fóton individual continua com a mesma energia E=hf. Se hf<φ, nenhum fóton — por mais que sejam muitos — consegue ejetar um elétron sozinho.',
    },
    {
      id: 'kmax',
      pergunta: 'O que é K_max?',
      resposta: `K_max=hf−φ é a energia cinética máxima do elétron ejetado — o que sobra da energia do fóton depois de "pagar" a função trabalho. Agora K_max=${fmt(Kmax, 3)}eV${ejeta ? '' : ' (negativo, ou seja, não há ejeção)'}.`,
    },
    {
      id: 'corte',
      pergunta: 'O que é a frequência de corte f₀?',
      resposta: `f₀=φ/h é a frequência mínima de luz capaz de ejetar elétrons desse material — abaixo dela, K_max seria negativo (fisicamente impossível), então simplesmente não há ejeção. Para ${MATERIAIS[material].label}, o comprimento de onda de corte é λ₀=${fmt(lambda0, 0)}nm.`,
    },
  ];

  return (
    <div className="content">
      <PainelExplicativo situacao={situacaoAtual} perguntas={perguntasAssistente} />
      <div className="sidebar-l">
        <div className="section-label">Material da Placa</div>
        <div className="pill-row">
          {Object.entries(MATERIAIS).map(([id, mat]) => (
            <button key={id} className={`pill ${material === id ? 'on' : ''}`} onClick={() => setMaterial(id)}>{mat.label}</button>
          ))}
        </div>

        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Comprimento de onda λ</span><span className="ctrl-num">{fmt(lambda, 0)} nm</span></div>
          <input type="range" min="100" max="700" step="5" value={lambda} onChange={e => setLambda(+e.target.value)} />
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Intensidade da luz</span><span className="ctrl-num">{fmt(intensidade, 0)}%</span></div>
          <input type="range" min="5" max="100" step="1" value={intensidade} onChange={e => setIntensidade(+e.target.value)} />
        </div>

        <div className="section-label">O que observar</div>
        <div className="card">
          <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.6 }}>
            Abaixo da frequência de corte, aumentar a intensidade só significa mais fótons — nenhum
            deles, individualmente, tem energia suficiente para ejetar um elétron.
          </p>
        </div>
      </div>

      <div className="main-area">
        <div className="canvas-wrap"><canvas ref={canvasRef} /></div>
      </div>

      <div className="sidebar-r">
        <div className="section-label">Fóton Incidente</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">λ</span><span className="stat-val warm">{fmt(lambda, 0)} nm</span></div>
          <div className="stat-row"><span className="stat-label">f</span><span className="stat-val">{fmtSci(f)} Hz</span></div>
          <div className="stat-row"><span className="stat-label">E_fóton = hf</span><span className="stat-val accent">{fmt(Efoton, 3)} eV</span></div>
        </div>

        <div className="section-label">Material</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">φ (função trabalho)</span><span className="stat-val cool">{fmt(phi, 2)} eV</span></div>
          <div className="stat-row"><span className="stat-label">f₀ (frequência de corte)</span><span className="stat-val">{fmtSci(f0)} Hz</span></div>
          <div className="stat-row"><span className="stat-label">λ₀ (comprimento de corte)</span><span className="stat-val">{fmt(lambda0, 0)} nm</span></div>
        </div>

        <div className="section-label">Elétron Ejetado</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">K_max = hf − φ</span><span className={`stat-val ${ejeta ? 'positivo' : 'negativo'}`}>{fmt(Kmax, 3)} eV</span></div>
          <div className="stat-row"><span className="stat-label">V_corte</span><span className="stat-val warm">{fmt(Vcorte, 3)} V</span></div>
          <div className="stat-row"><span className="stat-label">Ejeta elétron?</span><span className={`stat-val ${ejeta ? 'positivo' : 'negativo'}`}>{ejeta ? 'Sim' : 'Não'}</span></div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ABA 2 — GRÁFICO K_max vs FREQUÊNCIA
// ═══════════════════════════════════════════════════════════════════════════
function GraficoTab() {
  const [ativos, setAtivos] = useState({ sodio: true, zinco: true, cobre: false, platina: false });
  const [lambda, setLambda] = useState(250);
  const f = C / (lambda * 1e-9);

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
    const fMinTHz = 3, fMaxTHz = 30; // em unidades de 10^14 Hz
    const kMin = -3, kMax = 10;

    const toPx = (fTHz, k) => ({
      x: padL + ((fTHz - fMinTHz) / (fMaxTHz - fMinTHz)) * plotW,
      y: padT + plotH - ((k - kMin) / (kMax - kMin)) * plotH,
    });

    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1;
    const y0 = toPx(fMinTHz, 0).y;
    ctx.beginPath(); ctx.moveTo(padL, y0); ctx.lineTo(padL + plotW, y0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(padL, padT); ctx.lineTo(padL, padT + plotH); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = "11px 'JetBrains Mono', monospace";
    ctx.textAlign = 'center';
    ctx.fillText('f (×10¹⁴ Hz)', padL + plotW / 2, H - 10);
    ctx.save();
    ctx.translate(16, padT + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('K_max (eV)', 0, 0);
    ctx.restore();

    const cores = { sodio: '#FBBF24', zinco: '#38BDF8', cobre: '#F97316', platina: '#EF4444' };
    Object.entries(MATERIAIS).forEach(([id, mat]) => {
      if (!ativos[id]) return;
      const cor = cores[id];
      const f0THz = (mat.phi / H_EV) / 1e14;
      // trecho negativo (sem ejeção) — tracejado
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = cor + '80';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      let p1 = toPx(fMinTHz, H_EV * fMinTHz * 1e14 - mat.phi);
      let p2 = toPx(f0THz, 0);
      ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
      ctx.setLineDash([]);
      // trecho físico (K_max > 0) — sólido
      ctx.strokeStyle = cor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      p1 = toPx(f0THz, 0);
      p2 = toPx(fMaxTHz, H_EV * fMaxTHz * 1e14 - mat.phi);
      ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();

      ctx.fillStyle = cor;
      ctx.textAlign = 'left';
      ctx.fillText(mat.label, p2.x - 90, p2.y - 8);
    });

    // marcador de frequência atual
    const fTHz = f / 1e14;
    if (fTHz >= fMinTHz && fTHz <= fMaxTHz) {
      const pTop = toPx(fTHz, kMax), pBot = toPx(fTHz, kMin);
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(pTop.x, pTop.y); ctx.lineTo(pBot.x, pBot.y); ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [ativos, lambda, f]);

  return (
    <div className="content">
      <div className="sidebar-l">
        <div className="section-label">Materiais Exibidos</div>
        {Object.entries(MATERIAIS).map(([id, mat]) => (
          <label className="toggle-row" key={id}>
            <input type="checkbox" checked={ativos[id]} onChange={e => setAtivos({ ...ativos, [id]: e.target.checked })} />
            <span className="toggle-label">{mat.label} (φ={fmt(mat.phi, 2)} eV)</span>
          </label>
        ))}

        <div className="section-label">Frequência de Referência</div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">λ</span><span className="ctrl-num">{fmt(lambda, 0)} nm</span></div>
          <input type="range" min="100" max="700" step="5" value={lambda} onChange={e => setLambda(+e.target.value)} />
        </div>

        <div className="card">
          <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.6 }}>
            Todas as retas têm a <strong>mesma inclinação</strong> (= h, a constante de Planck) — só o
            ponto onde cruzam o eixo f (a frequência de corte f₀=φ/h) muda com o material. Foi assim
            que Millikan mediu h experimentalmente.
          </p>
        </div>
      </div>

      <div className="main-area">
        <div className="canvas-wrap"><canvas ref={canvasRef} /></div>
      </div>

      <div className="sidebar-r">
        <div className="section-label">Constante de Planck</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">h (inclinação das retas)</span><span className="stat-val accent">{fmtSci(H_EV)} eV·s</span></div>
        </div>

        <div className="section-label">Frequência de Referência</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">f</span><span className="stat-val warm">{fmtSci(f)} Hz</span></div>
          <div className="stat-row"><span className="stat-label">E_fóton</span><span className="stat-val">{fmt(H_EV * f, 3)} eV</span></div>
        </div>

        <div className="eq-block">
          <div className="eq-title">Equação Fotoelétrica de Einstein</div>
          <span className="sym">K_max</span> <span className="op">=</span> hf − φ
          <br /><span className="cmt">reta: y=hx+b, com b=−φ</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ABA 3 — CÁLCULO & DERIVAÇÕES
// ═══════════════════════════════════════════════════════════════════════════
function CalcTab() {
  const phi = 4.33, lambda = 250;
  const f = C / (lambda * 1e-9);
  const Efoton = H_EV * f;
  const Kmax = Efoton - phi;

  return (
    <div className="main-area" style={{ overflow: 'auto' }}>
      <div className="calc-page">

        <div className="calc-section">
          <div className="calc-h2">1. O Fracasso do Modelo Ondulatório Clássico</div>
          <p className="calc-p">
            Na física clássica, a luz é uma onda contínua, e sua energia depende só da intensidade.
            Isso prevê três coisas sobre o efeito fotoelétrico — todas contradizem o experimento:
          </p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">Qualquer frequência deveria ejetar elétrons</span><span className="step-desc">bastaria esperar tempo suficiente — mas há uma frequência de corte real</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq">Mais intensidade → mais energia cinética</span><span className="step-desc">experimentalmente, K_max não depende da intensidade</span></div>
            <div className="derivation-step"><span className="step-num">③</span><span className="step-eq">Ejeção deveria ter atraso mensurável</span><span className="step-desc">observa-se ejeção instantânea, mesmo com luz fraca</span></div>
          </div>
        </div>

        <div className="calc-section">
          <div className="calc-h2">2. A Hipótese de Einstein: Luz Quantizada</div>
          <p className="calc-p">
            Einstein propôs (1905) que a luz é composta de pacotes discretos de energia — fótons —
            cada um carregando uma energia proporcional apenas à frequência:
          </p>
          <div className="big-eq">
            <span className="hi-acc">E_fóton = hf</span>
            <span className="cmt">   ← h = constante de Planck ≈ {fmtSci(H_EV)} eV·s</span>
          </div>
          <p className="calc-p">
            Intensidade maior significa <em>mais fótons por segundo</em>, não fótons mais energéticos —
            isso resolve de imediato os três problemas acima.
          </p>
        </div>

        <div className="calc-section">
          <div className="calc-h2">3. A Equação Fotoelétrica</div>
          <p className="calc-p">
            Um elétron preso no metal precisa de uma energia mínima φ (função trabalho) para escapar.
            Se o fóton absorvido tem energia hf, a energia cinética restante do elétron ejetado é:
          </p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">hf = φ + K_max</span><span className="step-desc">conservação de energia: energia do fóton = trabalho de escape + energia cinética restante</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq"><span className="hi-acc">K_max = hf − φ</span></span><span className="step-desc">equação fotoelétrica de Einstein</span></div>
            <div className="derivation-step"><span className="step-num">③</span><span className="step-eq">eV_corte = K_max</span><span className="step-desc">tensão de corte necessária para barrar até o elétron mais rápido</span></div>
          </div>
        </div>

        <div className="calc-section">
          <div className="calc-h2">4. Frequência de Corte</div>
          <p className="calc-p">
            Abaixo de uma frequência mínima f₀, mesmo um único fóton não tem energia suficiente para
            vencer φ — não importa quantos fótons por segundo (intensidade) incidam:
          </p>
          <div className="big-eq">
            <span className="hi-acc">f₀ = φ / h</span>
          </div>
          <div className="alert-box">
            Essa é a assinatura mais direta da natureza quântica da luz: um limiar de frequência bem
            definido, independente da intensidade — algo que a teoria ondulatória clássica não consegue explicar.
          </div>
        </div>

        <div className="calc-section">
          <div className="calc-h2">5. Exemplo Numérico</div>
          <p className="calc-p">
            Luz de λ={lambda}nm incide sobre zinco (φ={phi}eV):
          </p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">f = c/λ ≈ {fmtSci(f)} Hz</span><span className="step-desc">frequência da luz incidente</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq">E_fóton = hf ≈ {fmt(Efoton, 3)} eV</span><span className="step-desc">energia de cada fóton</span></div>
            <div className="derivation-step"><span className="step-num">③</span><span className="step-eq">K_max = hf − φ ≈ {fmt(Kmax, 3)} eV</span><span className="step-desc">energia cinética máxima do elétron ejetado</span></div>
          </div>
        </div>

      </div>
    </div>
  );
}
