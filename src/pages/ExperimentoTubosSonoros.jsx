// src/pages/ExperimentoTubosSonoros.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FISICA2_BASE_STYLES } from '../styles/fisica2Theme';
import PainelExplicativo from '../components/PainelExplicativo';

const fmt = (n, d = 2) => (typeof n === 'number' && isFinite(n) ? n.toFixed(d) : '—');
// Velocidade angular usada só para a animação visual — a frequência real de um tubo
// sonoro (dezenas a milhares de Hz) é rápida demais para renderizar literalmente.
const VISUAL_OMEGA = 3;

const HARMONICOS_ABERTO = [1, 2, 3, 4, 5, 6];
const HARMONICOS_FECHADO = [1, 3, 5, 7, 9, 11];

const STYLES = FISICA2_BASE_STYLES + `
.pill-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 18px; }
.pill {
  font-family: var(--sans);
  font-size: 13px;
  font-weight: 600;
  padding: 8px 16px;
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

// Deslocamento do ar ao longo do tubo, em função da fração xFrac (0 a 1)
function formaOnda(tipo, n, xFrac) {
  return tipo === 'aberto'
    ? Math.cos(n * Math.PI * xFrac)
    : Math.sin((n * Math.PI * xFrac) / 2);
}

// Posições (fração 0-1) dos nós e antinós ao longo do tubo
function nosAntinos(tipo, n) {
  const nos = [], antinos = [];
  if (tipo === 'aberto') {
    for (let k = 0; k < n; k++) nos.push((2 * k + 1) / (2 * n));
    for (let k = 0; k <= n; k++) antinos.push(k / n);
  } else {
    for (let k = 0; k <= (n - 1) / 2; k++) nos.push((2 * k) / n);
    for (let k = 0; k <= (n - 1) / 2; k++) antinos.push((2 * k + 1) / n);
  }
  return { nos, antinos };
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════
export default function ExperimentoTubosSonoros() {
  const [tab, setTab] = useState('sim');

  return (
    <>
      <style>{STYLES}</style>
      <div className="app">
        <header className="header">
          <div className="header-title">Ondas Sonoras em Tubos</div>
          <div className="header-sub">Física 2 · Ondas</div>
          <span className="header-tag">aberto: fₙ=nv/2L · fechado: fₙ=nv/4L (ímpar)</span>
        </header>

        <nav className="tabs">
          {[
            ['sim', 'Simulação'],
            ['comparacao', 'Aberto × Fechado'],
            ['calc', 'Cálculo & Derivações'],
          ].map(([id, label]) => (
            <button key={id} className={`tab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </nav>

        {tab === 'sim' && <SimTab />}
        {tab === 'comparacao' && <ComparacaoTab />}
        {tab === 'calc' && <CalcTab />}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ABA 1 — SIMULAÇÃO (tubo único)
// ═══════════════════════════════════════════════════════════════════════════
function SimTab() {
  const [tipo, setTipo] = useState('aberto');
  const [n, setN] = useState(1);
  const [L, setL] = useState(1.0);
  const [temp, setTemp] = useState(20);
  const [rodando, setRodando] = useState(true);

  const harmonicos = tipo === 'aberto' ? HARMONICOS_ABERTO : HARMONICOS_FECHADO;

  // Ao trocar o tipo de tubo, garante que o harmônico selecionado continua válido
  useEffect(() => {
    if (!harmonicos.includes(n)) {
      setN(harmonicos.reduce((melhor, h) => (Math.abs(h - n) < Math.abs(melhor - n) ? h : melhor)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo]);

  const vSom = 331 + 0.6 * temp;
  const lambda = tipo === 'aberto' ? (2 * L) / n : (4 * L) / n;
  const freq = vSom / lambda;

  const tRef = useRef(null);
  const rafRef = useRef(null);
  const lastRef = useRef(null);
  if (tRef.current === null) tRef.current = 0;

  useEffect(() => {
    if (!rodando) { lastRef.current = null; return; }
    const step = (now) => {
      if (lastRef.current !== null) {
        tRef.current += Math.min((now - lastRef.current) / 1000, 0.05);
      }
      lastRef.current = now;
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [rodando]);

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

      const marginX = W * 0.1;
      const tubeW = W - marginX * 2;
      const midY = H * 0.5;
      const tubeH = 70;
      const ampPx = tubeH * 0.42; // mantém a onda dentro das paredes do tubo
      const envelope = Math.cos(VISUAL_OMEGA * tRef.current);

      // Corpo do tubo
      ctx.strokeStyle = 'rgba(239,68,68,0.4)';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(marginX, midY - tubeH / 2); ctx.lineTo(marginX + tubeW, midY - tubeH / 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(marginX, midY + tubeH / 2); ctx.lineTo(marginX + tubeW, midY + tubeH / 2); ctx.stroke();

      // Tampa na extremidade fechada (x=0) — só existe no tubo fechado
      if (tipo === 'fechado') {
        ctx.fillStyle = 'rgba(239,68,68,0.5)';
        ctx.fillRect(marginX - 8, midY - tubeH / 2 - 6, 8, tubeH + 12);
      }

      // Onda de deslocamento do ar
      const { nos, antinos } = nosAntinos(tipo, n);
      ctx.beginPath();
      for (let i = 0; i <= 150; i++) {
        const xf = i / 150;
        const y = midY - formaOnda(tipo, n, xf) * ampPx * envelope;
        i === 0 ? ctx.moveTo(marginX + xf * tubeW, y) : ctx.lineTo(marginX + xf * tubeW, y);
      }
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 8;
      ctx.shadowColor = 'rgba(56,189,248,0.5)';
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Nós (deslocamento sempre zero)
      nos.forEach(xf => {
        ctx.beginPath();
        ctx.arc(marginX + xf * tubeW, midY, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#EF4444';
        ctx.fill();
      });
      // Antinós (deslocamento máximo)
      antinos.forEach(xf => {
        const y = midY - formaOnda(tipo, n, xf) * ampPx * envelope;
        ctx.beginPath();
        ctx.arc(marginX + xf * tubeW, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#FBBF24';
        ctx.fill();
      });

      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = "11px 'JetBrains Mono', monospace";
      ctx.textAlign = 'left';
      ctx.fillText(tipo === 'fechado' ? 'extremidade fechada' : 'extremidade aberta', marginX - 4, midY + tubeH / 2 + 20);
      ctx.textAlign = 'right';
      ctx.fillText('extremidade aberta', marginX + tubeW + 4, midY + tubeH / 2 + 20);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [tipo, n]);

  const situacaoAtual = `Tubo ${tipo === 'aberto' ? 'aberto-aberto' : 'fechado-aberto'}, L=${fmt(L, 2)}m, harmônico n=${n}: λ=${fmt(lambda, 3)}m, f=${fmt(freq, 1)}Hz (som a ${fmt(vSom, 1)}m/s).`;

  const perguntasAssistente = [
    {
      id: 'tipo',
      pergunta: 'Qual a diferença entre tubo aberto e fechado?',
      resposta: 'No tubo aberto-aberto, as duas pontas são antinós (máxima vibração do ar) — todos os harmônicos (n=1,2,3...) são permitidos. No fechado-aberto, a ponta fechada é sempre um nó — só harmônicos ÍMPARES (n=1,3,5...) são permitidos.',
    },
    {
      id: 'n',
      pergunta: 'O que é o harmônico n aqui?',
      resposta: `n indica qual modo de vibração está soando. Agora n=${n} no tubo ${tipo === 'aberto' ? 'aberto' : 'fechado'}, dando λ=${tipo === 'aberto' ? '2L/n' : '4L/n'}=${fmt(lambda, 3)}m.`,
    },
    {
      id: 'porqueImpar',
      pergunta: 'Por que o tubo fechado só tem harmônicos ímpares?',
      resposta: 'Porque a ponta fechada precisa ser sempre um nó e a aberta sempre um antinó — geometricamente, só cabem múltiplos ímpares de um quarto de comprimento de onda entre um nó e o antinó mais próximo compatível.',
    },
    {
      id: 'freq',
      pergunta: 'Como a frequência depende do comprimento L?',
      resposta: `f=v/λ, e λ depende de L. Tubos mais compridos têm λ maior e, portanto, frequência mais grave — é por isso que instrumentos de tubo longo (como o trombone estendido) soam mais graves.`,
    },
  ];

  return (
    <div className="content">
      <PainelExplicativo situacao={situacaoAtual} perguntas={perguntasAssistente} />
      <div className="sidebar-l">
        <div className="section-label">Tipo de Tubo</div>
        <div className="pill-row">
          <button className={`pill ${tipo === 'aberto' ? 'on' : ''}`} onClick={() => setTipo('aberto')}>Aberto-Aberto</button>
          <button className={`pill ${tipo === 'fechado' ? 'on' : ''}`} onClick={() => setTipo('fechado')}>Fechado-Aberto</button>
        </div>

        <div className="section-label">Harmônico</div>
        <div className="pill-row">
          {harmonicos.map(h => (
            <button key={h} className={`pill ${n === h ? 'on' : ''}`} onClick={() => setN(h)}>
              {h === 1 ? 'Fundamental' : `${h}º`}
            </button>
          ))}
        </div>

        <div className="section-label">Tubo</div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Comprimento L</span><span className="ctrl-num">{fmt(L, 2)} m</span></div>
          <input type="range" min="0.2" max="2" step="0.05" value={L} onChange={e => setL(+e.target.value)} />
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Temperatura do ar</span><span className="ctrl-num">{fmt(temp, 0)}°C</span></div>
          <input type="range" min="-10" max="40" step="1" value={temp} onChange={e => setTemp(+e.target.value)} />
        </div>

        <div className="btn-row">
          <button className="btn btn-primary" onClick={() => setRodando(true)}>▶ Vibrar</button>
          <button className="btn btn-secondary" onClick={() => setRodando(false)}>⏸ Pausar</button>
        </div>

        <p style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5, marginTop: 12 }}>
          A curva mostra o <strong>deslocamento do ar</strong> (não a pressão) — por isso a ponta aberta
          é sempre um antinó (o ar se move livremente) e a ponta fechada é sempre um nó (o ar não pode se mover).
        </p>
      </div>

      <div className="main-area">
        <div className="canvas-wrap"><canvas ref={canvasRef} /></div>
      </div>

      <div className="sidebar-r">
        <div className="section-label">Meio</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">Velocidade do som v</span><span className="stat-val accent">{fmt(vSom, 1)} m/s</span></div>
        </div>

        <div className="section-label">Harmônico {n}</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">Comprimento de onda λ</span><span className="stat-val warm">{fmt(lambda, 3)} m</span></div>
          <div className="stat-row"><span className="stat-label">Frequência f</span><span className="stat-val cool">{fmt(freq, 1)} Hz</span></div>
        </div>

        <div className="section-label">Equações</div>
        <div className="eq-block">
          <div className="eq-title">Tubo Aberto-Aberto</div>
          λ_n <span className="op">=</span> 2L/n &nbsp; f_n <span className="op">=</span> n·v/2L
          <br /><span className="cmt">n = 1,2,3,4... (todos)</span>
        </div>
        <div className="eq-block">
          <div className="eq-title">Tubo Fechado-Aberto</div>
          λ_n <span className="op">=</span> 4L/n &nbsp; f_n <span className="op">=</span> n·v/4L
          <br /><span className="cmt">n = 1,3,5,7... (só ímpares)</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ABA 2 — COMPARAÇÃO ABERTO × FECHADO
// ═══════════════════════════════════════════════════════════════════════════
function ComparacaoTab() {
  const [L, setL] = useState(1.0);
  const [temp, setTemp] = useState(20);
  const [rodando, setRodando] = useState(true);

  const vSom = 331 + 0.6 * temp;
  const f1Aberto = vSom / (2 * L);
  const f1Fechado = vSom / (4 * L);

  const tRef = useRef(0);
  const rafRef = useRef(null);
  const lastRef = useRef(null);
  useEffect(() => {
    if (!rodando) { lastRef.current = null; return; }
    const step = (now) => {
      if (lastRef.current !== null) tRef.current += Math.min((now - lastRef.current) / 1000, 0.05);
      lastRef.current = now;
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [rodando]);

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

      const marginX = W * 0.1;
      const tubeW = W - marginX * 2;
      const tubeH = 50;
      const ampPx = tubeH * 0.42; // mantém a onda dentro das paredes do tubo
      const envelope = Math.cos(VISUAL_OMEGA * tRef.current);

      const desenhaTubo = (rowY, tipo, label, freqLabel) => {
        ctx.strokeStyle = 'rgba(239,68,68,0.4)';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(marginX, rowY - tubeH / 2); ctx.lineTo(marginX + tubeW, rowY - tubeH / 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(marginX, rowY + tubeH / 2); ctx.lineTo(marginX + tubeW, rowY + tubeH / 2); ctx.stroke();
        if (tipo === 'fechado') {
          ctx.fillStyle = 'rgba(239,68,68,0.5)';
          ctx.fillRect(marginX - 8, rowY - tubeH / 2 - 6, 8, tubeH + 12);
        }

        const { nos, antinos } = nosAntinos(tipo, 1);
        ctx.beginPath();
        for (let i = 0; i <= 120; i++) {
          const xf = i / 120;
          const y = rowY - formaOnda(tipo, 1, xf) * ampPx * envelope;
          i === 0 ? ctx.moveTo(marginX + xf * tubeW, y) : ctx.lineTo(marginX + xf * tubeW, y);
        }
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        nos.forEach(xf => { ctx.beginPath(); ctx.arc(marginX + xf * tubeW, rowY, 4, 0, Math.PI * 2); ctx.fillStyle = '#EF4444'; ctx.fill(); });
        antinos.forEach(xf => {
          const y = rowY - formaOnda(tipo, 1, xf) * ampPx * envelope;
          ctx.beginPath(); ctx.arc(marginX + xf * tubeW, y, 3.5, 0, Math.PI * 2); ctx.fillStyle = '#FBBF24'; ctx.fill();
        });

        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = "bold 12px 'JetBrains Mono', monospace";
        ctx.textAlign = 'left';
        ctx.fillText(label, marginX, rowY - tubeH / 2 - 14);
        ctx.textAlign = 'right';
        ctx.fillText(freqLabel, marginX + tubeW, rowY - tubeH / 2 - 14);
      };

      desenhaTubo(H * 0.3, 'aberto', 'Tubo Aberto-Aberto — fundamental (n=1)', `f₁ = ${fmt(f1Aberto, 1)} Hz`);
      desenhaTubo(H * 0.72, 'fechado', 'Tubo Fechado-Aberto — fundamental (n=1)', `f₁ = ${fmt(f1Fechado, 1)} Hz`);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [L, temp]);

  return (
    <div className="content">
      <div className="sidebar-l">
        <div className="section-label">Tubos (mesmo L e T)</div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Comprimento L</span><span className="ctrl-num">{fmt(L, 2)} m</span></div>
          <input type="range" min="0.2" max="2" step="0.05" value={L} onChange={e => setL(+e.target.value)} />
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Temperatura do ar</span><span className="ctrl-num">{fmt(temp, 0)}°C</span></div>
          <input type="range" min="-10" max="40" step="1" value={temp} onChange={e => setTemp(+e.target.value)} />
        </div>

        <div className="btn-row">
          <button className="btn btn-primary" onClick={() => setRodando(true)}>▶ Vibrar</button>
          <button className="btn btn-secondary" onClick={() => setRodando(false)}>⏸ Pausar</button>
        </div>

        <p style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.6 }}>
          Com o <strong>mesmo comprimento</strong>, o tubo fechado soa exatamente uma oitava mais grave
          (metade da frequência) do que o tubo aberto — é por isso que instrumentos "fechados" (como o
          clarinete) soam mais graves que instrumentos "abertos" de tamanho parecido (como a flauta).
        </p>
      </div>

      <div className="main-area">
        <div className="canvas-wrap"><canvas ref={canvasRef} /></div>
      </div>

      <div className="sidebar-r">
        <div className="section-label">Frequência Fundamental</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">f₁ (aberto)</span><span className="stat-val accent">{fmt(f1Aberto, 1)} Hz</span></div>
          <div className="stat-row"><span className="stat-label">f₁ (fechado)</span><span className="stat-val cool">{fmt(f1Fechado, 1)} Hz</span></div>
          <div className="stat-row"><span className="stat-label">Razão</span><span className="stat-val warm">{fmt(f1Aberto / f1Fechado, 2)}× (uma oitava)</span></div>
        </div>

        <div className="section-label">Harmônicos Presentes</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">Aberto</span><span className="stat-val purple">n = 1,2,3,4,5...</span></div>
          <div className="stat-row"><span className="stat-label">Fechado</span><span className="stat-val purple">n = 1,3,5,7...</span></div>
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
          <div className="calc-h2">1. Ondas de Deslocamento numa Coluna de Ar</div>
          <p className="calc-p">
            Assim como numa corda, ondas sonoras estacionárias se formam numa coluna de ar limitada por
            reflexões nas extremidades. A diferença é a condição de contorno: numa extremidade{' '}
            <strong>aberta</strong>, o ar pode se mover livremente (antinó de deslocamento); numa extremidade{' '}
            <strong>fechada</strong>, o ar encontra uma parede rígida e não pode se mover (nó de deslocamento).
          </p>
        </div>

        <div className="calc-section">
          <div className="calc-h2">2. Tubo Aberto em Ambas as Extremidades</div>
          <p className="calc-p">
            Com antinós em x=0 e x=L, a solução é y(x,t)=A·cos(kx)·cos(ωt). A condição em x=L exige:
          </p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">cos(kL) = ±1  →  kL = nπ, n=1,2,3...</span><span className="step-desc">antinó também em x=L</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq"><span className="hi-acc">λ_n = 2L/n,  f_n = n·v/(2L)</span></span><span className="step-desc">mesma fórmula da corda — todos os harmônicos</span></div>
          </div>
        </div>

        <div className="calc-section">
          <div className="calc-h2">3. Tubo Fechado numa Extremidade</div>
          <p className="calc-p">
            Com nó em x=0 (fechada) e antinó em x=L (aberta), a solução é y(x,t)=A·sen(kx)·cos(ωt).
            A condição em x=L exige:
          </p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">|sen(kL)| = 1  →  kL = π/2, 3π/2, 5π/2...</span><span className="step-desc">antinó em x=L</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq">kL = nπ/2, n=1,3,5,7... (só ímpares)</span><span className="step-desc">generalizando os múltiplos</span></div>
            <div className="derivation-step"><span className="step-num">③</span><span className="step-eq"><span className="hi-acc">λ_n = 4L/n,  f_n = n·v/(4L)</span>, n ímpar</span><span className="step-desc">só harmônicos ímpares existem</span></div>
          </div>
        </div>

        <div className="calc-section">
          <div className="calc-h2">4. Por que Só os Ímpares?</div>
          <p className="calc-p">
            Fisicamente, entre um nó (na ponta fechada) e o antinó mais próximo há sempre um quarto de
            comprimento de onda (λ/4). Para "caber" mais um trecho oscilante completo entre eles, é preciso
            adicionar meios comprimentos de onda inteiros (λ/2) — e cada meio comprimento adicionado
            corresponde a pular de um harmônico ímpar para o próximo ímpar (1→3→5...), nunca passando por um par.
          </p>
        </div>

        <div className="calc-section">
          <div className="calc-h2">5. Exemplo Numérico</div>
          <p className="calc-p">
            Dois tubos de L=0,5m, ar a 20°C (v=343 m/s). Um aberto, outro fechado numa ponta.
          </p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">Aberto: f₁ = 343/(2·0,5) = 343 Hz</span><span className="step-desc">fundamental do tubo aberto</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq">Fechado: f₁ = 343/(4·0,5) = 171,5 Hz</span><span className="step-desc">fundamental do tubo fechado — exatamente metade</span></div>
            <div className="derivation-step"><span className="step-num">③</span><span className="step-eq">Próximo harmônico do fechado: f₃ = 3·171,5 = 514,5 Hz</span><span className="step-desc">pula direto pro 3º (não existe 2º)</span></div>
          </div>
        </div>

      </div>
    </div>
  );
}
