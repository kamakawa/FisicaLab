// src/pages/ExperimentoOndasEstacionarias.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FISICA2_BASE_STYLES } from '../styles/fisica2Theme';

const fmt = (n, d = 2) => (typeof n === 'number' && isFinite(n) ? n.toFixed(d) : '—');
// Velocidade angular usada só para a animação visual — frequências reais de uma corda
// (dezenas a centenas de Hz) são rápidas demais para renderizar literalmente.
const VISUAL_OMEGA = 3;

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

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════
export default function ExperimentoOndasEstacionarias() {
  const [tab, setTab] = useState('sim');

  return (
    <>
      <style>{STYLES}</style>
      <div className="app">
        <header className="header">
          <div className="header-title">Ondas Estacionárias em Cordas</div>
          <div className="header-sub">Física 2 · Ondas</div>
          <span className="header-tag">fₙ = n·v/2L</span>
        </header>

        <nav className="tabs">
          {[
            ['sim', 'Simulação'],
            ['harmonicos', 'Série Harmônica'],
            ['calc', 'Cálculo & Derivações'],
          ].map(([id, label]) => (
            <button key={id} className={`tab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </nav>

        {tab === 'sim' && <SimTab />}
        {tab === 'harmonicos' && <HarmonicosTab />}
        {tab === 'calc' && <CalcTab />}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ABA 1 — SIMULAÇÃO (harmônico único)
// ═══════════════════════════════════════════════════════════════════════════
function SimTab() {
  const [n, setN] = useState(2);
  const [L, setL] = useState(1.0);       // m
  const [tensao, setTensao] = useState(30); // N
  const [muGm, setMuGm] = useState(2);    // g/m
  const [rodando, setRodando] = useState(true);

  const mu = muGm / 1000; // kg/m
  const v = Math.sqrt(tensao / mu);
  const lambda = (2 * L) / n;
  const freq = v / lambda;
  const periodo = 1 / freq;

  const tRef = useRef(0);
  const rafRef = useRef(null);
  const lastRef = useRef(null);

  useEffect(() => {
    if (!rodando) { lastRef.current = null; return; }
    const step = (now) => {
      if (lastRef.current !== null) {
        const dt = Math.min((now - lastRef.current) / 1000, 0.05);
        tRef.current += dt;
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
      const stringW = W - marginX * 2;
      const midY = H * 0.5;
      const ampPx = H * 0.28;
      const envelope = Math.cos(VISUAL_OMEGA * tRef.current);

      // Suportes fixos
      ['left', 'right'].forEach(side => {
        const x = side === 'left' ? marginX : marginX + stringW;
        ctx.fillStyle = 'rgba(239,68,68,0.5)';
        ctx.fillRect(x - 6, midY - 40, 12, 80);
      });

      // Envoltória (linhas tracejadas mostrando amplitude máxima)
      ctx.beginPath();
      ctx.setLineDash([4, 5]);
      for (let i = 0; i <= 100; i++) {
        const xf = i / 100;
        const y = midY - Math.sin(n * Math.PI * xf) * ampPx;
        i === 0 ? ctx.moveTo(marginX + xf * stringW, y) : ctx.lineTo(marginX + xf * stringW, y);
      }
      ctx.strokeStyle = 'rgba(239,68,68,0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.beginPath();
      for (let i = 0; i <= 100; i++) {
        const xf = i / 100;
        const y = midY + Math.sin(n * Math.PI * xf) * ampPx;
        i === 0 ? ctx.moveTo(marginX + xf * stringW, y) : ctx.lineTo(marginX + xf * stringW, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Corda animada
      ctx.beginPath();
      for (let i = 0; i <= 150; i++) {
        const xf = i / 150;
        const y = midY - Math.sin(n * Math.PI * xf) * ampPx * envelope;
        i === 0 ? ctx.moveTo(marginX + xf * stringW, y) : ctx.lineTo(marginX + xf * stringW, y);
      }
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 8;
      ctx.shadowColor = 'rgba(56,189,248,0.5)';
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Nós (n+1 pontos fixos, incluindo as extremidades)
      for (let k = 0; k <= n; k++) {
        const xf = k / n;
        const x = marginX + xf * stringW;
        ctx.beginPath();
        ctx.arc(x, midY, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#EF4444';
        ctx.fill();
      }

      // Antinós (n pontos de amplitude máxima)
      for (let k = 0; k < n; k++) {
        const xf = (k + 0.5) / n;
        const x = marginX + xf * stringW;
        const y = midY - Math.sin(n * Math.PI * xf) * ampPx * envelope;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#FBBF24';
        ctx.fill();
      }

      ctx.font = "11px 'JetBrains Mono', monospace";
      ctx.textAlign = 'left';
      const legendY = H * 0.9;
      ctx.beginPath(); ctx.arc(marginX + 4, legendY - 3, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#EF4444'; ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillText('nó', marginX + 14, legendY);

      ctx.beginPath(); ctx.arc(marginX + 74, legendY - 3, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#FBBF24'; ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillText('antinó', marginX + 84, legendY);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [n]);

  return (
    <div className="content">
      <div className="sidebar-l">
        <div className="section-label">Harmônico</div>
        <div className="pill-row">
          {[1, 2, 3, 4, 5, 6].map(nn => (
            <button key={nn} className={`pill ${n === nn ? 'on' : ''}`} onClick={() => setN(nn)}>
              {nn === 1 ? 'Fundamental' : `${nn}º`}
            </button>
          ))}
        </div>

        <div className="section-label">Corda</div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Comprimento L</span><span className="ctrl-num">{fmt(L, 2)} m</span></div>
          <input type="range" min="0.3" max="2" step="0.05" value={L} onChange={e => setL(+e.target.value)} />
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Tensão T</span><span className="ctrl-num">{fmt(tensao, 0)} N</span></div>
          <input type="range" min="5" max="100" step="1" value={tensao} onChange={e => setTensao(+e.target.value)} />
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Densidade linear μ</span><span className="ctrl-num">{fmt(muGm, 2)} g/m</span></div>
          <input type="range" min="0.5" max="10" step="0.1" value={muGm} onChange={e => setMuGm(+e.target.value)} />
        </div>

        <div className="btn-row">
          <button className="btn btn-primary" onClick={() => setRodando(true)}>▶ Vibrar</button>
          <button className="btn btn-secondary" onClick={() => setRodando(false)}>⏸ Pausar</button>
        </div>

        <p style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5, marginTop: 12 }}>
          ⏱ A animação roda numa velocidade fixa para visualização — a frequência real
          (calculada corretamente ao lado) costuma ser rápida demais para se ver a olho nu.
        </p>
      </div>

      <div className="main-area">
        <div className="canvas-wrap"><canvas ref={canvasRef} /></div>
      </div>

      <div className="sidebar-r">
        <div className="section-label">Onda na Corda</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">Velocidade v = √(T/μ)</span><span className="stat-val accent">{fmt(v, 1)} m/s</span></div>
          <div className="stat-row"><span className="stat-label">Comprimento de onda λ_{n}</span><span className="stat-val warm">{fmt(lambda, 3)} m</span></div>
        </div>

        <div className="section-label">Harmônico {n}</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">Frequência f_{n}</span><span className="stat-val cool">{fmt(freq, 1)} Hz</span></div>
          <div className="stat-row"><span className="stat-label">Período T_{n}</span><span className="stat-val purple">{fmt(periodo * 1000, 2)} ms</span></div>
          <div className="stat-row"><span className="stat-label">Número de nós</span><span className="stat-val">{n + 1}</span></div>
          <div className="stat-row"><span className="stat-label">Número de antinós</span><span className="stat-val">{n}</span></div>
        </div>

        <div className="section-label">Equações</div>
        <div className="eq-block">
          <div className="eq-title">Velocidade na Corda</div>
          <span className="sym">v</span> <span className="op">=</span> √(T/μ)
        </div>
        <div className="eq-block">
          <div className="eq-title">Harmônicos</div>
          λ_n <span className="op">=</span> 2L/n &nbsp; <span className="op">·</span> &nbsp; f_n <span className="op">=</span> n·v/2L
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ABA 2 — SÉRIE HARMÔNICA (comparação n=1..6)
// ═══════════════════════════════════════════════════════════════════════════
function HarmonicosTab() {
  const [L, setL] = useState(1.0);
  const [tensao, setTensao] = useState(30);
  const [muGm, setMuGm] = useState(2);
  const [rodando, setRodando] = useState(true);

  const mu = muGm / 1000;
  const v = Math.sqrt(tensao / mu);
  const f1 = v / (2 * L);

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

      const marginX = W * 0.12;
      const stringW = W - marginX * 2;
      const rowH = H / 6;
      const ampPx = rowH * 0.36;
      const envelope = Math.cos(VISUAL_OMEGA * tRef.current);

      for (let n = 1; n <= 6; n++) {
        const rowY = rowH * (n - 0.5);
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(marginX, rowY); ctx.lineTo(marginX + stringW, rowY); ctx.stroke();

        ctx.beginPath();
        for (let i = 0; i <= 120; i++) {
          const xf = i / 120;
          const y = rowY - Math.sin(n * Math.PI * xf) * ampPx * envelope;
          i === 0 ? ctx.moveTo(marginX + xf * stringW, y) : ctx.lineTo(marginX + xf * stringW, y);
        }
        ctx.strokeStyle = n === 1 ? '#EF4444' : '#38BDF8';
        ctx.lineWidth = 2.2;
        ctx.stroke();

        for (let k = 0; k <= n; k++) {
          const xf = k / n;
          ctx.beginPath();
          ctx.arc(marginX + xf * stringW, rowY, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = '#EF4444';
          ctx.fill();
        }

        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = "11px 'JetBrains Mono', monospace";
        ctx.textAlign = 'left';
        ctx.fillText(`n=${n}${n === 1 ? ' (fundamental)' : ''}`, 8, rowY - rowH * 0.28);
        ctx.textAlign = 'right';
        ctx.fillText(`f_${n} = ${fmt(n * f1, 1)} Hz`, W - 8, rowY - rowH * 0.28);
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [L, tensao, muGm]);

  return (
    <div className="content">
      <div className="sidebar-l">
        <div className="section-label">Corda (afeta todos os harmônicos)</div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Comprimento L</span><span className="ctrl-num">{fmt(L, 2)} m</span></div>
          <input type="range" min="0.3" max="2" step="0.05" value={L} onChange={e => setL(+e.target.value)} />
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Tensão T</span><span className="ctrl-num">{fmt(tensao, 0)} N</span></div>
          <input type="range" min="5" max="100" step="1" value={tensao} onChange={e => setTensao(+e.target.value)} />
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Densidade linear μ</span><span className="ctrl-num">{fmt(muGm, 2)} g/m</span></div>
          <input type="range" min="0.5" max="10" step="0.1" value={muGm} onChange={e => setMuGm(+e.target.value)} />
        </div>

        <div className="btn-row">
          <button className="btn btn-primary" onClick={() => setRodando(true)}>▶ Vibrar Todos</button>
          <button className="btn btn-secondary" onClick={() => setRodando(false)}>⏸ Pausar</button>
        </div>

        <div className="section-label">Frequência Fundamental</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">v = √(T/μ)</span><span className="stat-val accent">{fmt(v, 1)} m/s</span></div>
          <div className="stat-row"><span className="stat-label">f₁ (fundamental)</span><span className="stat-val warm">{fmt(f1, 1)} Hz</span></div>
        </div>
        <p style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>
          Os harmônicos superiores são sempre múltiplos inteiros de f₁ — por isso formam uma
          "série harmônica". É essa relação simples que dá o timbre característico dos instrumentos de corda.
        </p>
      </div>

      <div className="main-area">
        <div className="canvas-wrap"><canvas ref={canvasRef} /></div>
      </div>

      <div className="sidebar-r">
        <div className="section-label">Série Harmônica</div>
        <div className="card">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div className="stat-row" key={n}>
              <span className="stat-label">f_{n} = {n}·f₁</span>
              <span className="stat-val cool">{fmt(n * f1, 1)} Hz</span>
            </div>
          ))}
        </div>

        <div className="section-label">Equação</div>
        <div className="eq-block">
          <div className="eq-title">Série Harmônica</div>
          <span className="sym">f</span>_n <span className="op">=</span> n·f₁, n <span className="op">=</span> 1,2,3...
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
          <div className="calc-h2">1. Onda Estacionária como Superposição</div>
          <p className="calc-p">
            Uma onda estacionária surge da superposição de duas ondas idênticas viajando em sentidos opostos
            (a onda incidente e sua reflexão na extremidade fixa):
          </p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">y₁ = A·sen(kx−ωt),  y₂ = A·sen(kx+ωt)</span><span className="step-desc">ondas viajando em sentidos opostos</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq">y = y₁+y₂ = 2A·sen(kx)·cos(ωt)</span><span className="step-desc">soma trigonométrica (produto para soma)</span></div>
            <div className="derivation-step"><span className="step-num">③</span><span className="step-eq"><span className="hi-acc">y(x,t) = [2A·sen(kx)]·cos(ωt)</span></span><span className="step-desc">amplitude espacial fixa × oscilação temporal</span></div>
          </div>
          <p className="calc-p">
            Note que y(x,t) não é mais uma onda viajante — o termo sen(kx) define um perfil espacial fixo
            que apenas cresce e diminui no tempo (por isso "estacionária").
          </p>
        </div>

        <div className="calc-section">
          <div className="calc-h2">2. Condições de Contorno e os Harmônicos</div>
          <p className="calc-p">
            Numa corda presa nas duas extremidades (x=0 e x=L), o deslocamento deve ser zero nesses pontos
            em todo instante:
          </p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">sen(kL) = 0  →  kL = nπ, n=1,2,3...</span><span className="step-desc">condição de contorno em x=L</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq">k = 2π/λ  →  λ_n = 2L/n</span><span className="step-desc">só certos comprimentos de onda "cabem"</span></div>
          </div>
          <p className="calc-p">
            Cada valor de n gera um modo normal de vibração diferente — o harmônico n tem n+1 nós
            (incluindo as extremidades) e n antinós.
          </p>
        </div>

        <div className="calc-section">
          <div className="calc-h2">3. Velocidade da Onda numa Corda Tensionada</div>
          <p className="calc-p">
            A velocidade de propagação de uma onda transversal numa corda depende da tensão (força
            restauradora) e da densidade linear (inércia):
          </p>
          <div className="big-eq">
            <span className="hi-acc">v = √(T/μ)</span>
            <span className="cmt">   ← T = tração (N), μ = massa por unidade de comprimento (kg/m)</span>
          </div>
          <p className="calc-p">
            Mais tensão → onda mais rápida (frequências mais agudas). Corda mais grossa/densa → onda mais
            lenta (frequências mais graves) — por isso as cordas graves de um violão são mais grossas.
          </p>
        </div>

        <div className="calc-section">
          <div className="calc-h2">4. Frequências Harmônicas</div>
          <p className="calc-p">Combinando v=λf com λ_n=2L/n, obtemos a frequência de cada harmônico:</p>
          <div className="big-eq">
            <span className="hi-acc">f_n = v/λ_n = n·v/(2L) = n·f₁</span>
            <span className="cmt">   ← todos os harmônicos são múltiplos inteiros da fundamental f₁</span>
          </div>
          <p className="calc-p">
            Essa relação simples (série harmônica) é a base da música ocidental e do timbre dos
            instrumentos — a mistura de harmônicos presentes é o que diferencia o som de um violão do de um piano
            tocando a mesma nota fundamental.
          </p>
        </div>

        <div className="calc-section">
          <div className="calc-h2">5. Exemplo Numérico</div>
          <p className="calc-p">
            Uma corda de violão com L=0,65m, μ=1,2g/m e T=70N.
          </p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">v = √(70/0,0012) = 241,5 m/s</span><span className="step-desc">velocidade da onda</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq">f₁ = 241,5/(2·0,65) = 185,8 Hz</span><span className="step-desc">frequência fundamental</span></div>
            <div className="derivation-step"><span className="step-num">③</span><span className="step-eq">f₂ = 371,5 Hz,  f₃ = 557,3 Hz</span><span className="step-desc">2º e 3º harmônicos</span></div>
          </div>
        </div>

      </div>
    </div>
  );
}
