// src/pages/ExperimentoDualidadeOnda.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FISICA3_BASE_STYLES, QUANTICA } from '../styles/fisica3Theme';

const { H } = QUANTICA;
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

const PRESETS = {
  eletron: { label: 'Elétron', m: 9.109e-31, v: 2e6 },
  proton: { label: 'Próton (acelerador)', m: 1.673e-27, v: 1e7 },
  bola: { label: 'Bola de Tênis', m: 0.057, v: 30 },
  pessoa: { label: 'Pessoa Andando', m: 70, v: 1.4 },
};

const REFERENCIAS = [
  { label: 'raio do próton', m: 1e-15 },
  { label: 'raio atômico', m: 1e-10 },
  { label: 'luz visível', m: 5e-7 },
  { label: 'espessura de um cabelo', m: 1e-4 },
  { label: 'grão de areia', m: 1e-3 },
  { label: '1 metro', m: 1 },
];

export default function ExperimentoDualidadeOnda() {
  const [tab, setTab] = useState('debroglie');
  return (
    <>
      <style>{STYLES}</style>
      <div className="app">
        <header className="header">
          <div className="header-title">Dualidade Onda-Partícula</div>
          <div className="header-sub">Física 3 · Física Moderna</div>
          <span className="header-tag">λ = h/p</span>
        </header>
        <nav className="tabs">
          {[['debroglie', 'Comprimento de de Broglie'], ['fenda', 'Fenda Dupla'], ['calc', 'Cálculo & Derivações']].map(([id, label]) => (
            <button key={id} className={`tab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>{label}</button>
          ))}
        </nav>
        {tab === 'debroglie' && <DeBroglieTab />}
        {tab === 'fenda' && <FendaTab />}
        {tab === 'calc' && <CalcTab />}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ABA 1 — COMPRIMENTO DE ONDA DE DE BROGLIE
// ═══════════════════════════════════════════════════════════════════════════
function DeBroglieTab() {
  const [preset, setPreset] = useState('eletron');
  const [m, setM] = useState(PRESETS.eletron.m);
  const [v, setV] = useState(PRESETS.eletron.v);

  const aplicarPreset = (id) => {
    setPreset(id);
    setM(PRESETS[id].m);
    setV(PRESETS[id].v);
  };

  const p = m * v;
  const lambda = H / p;

  const canvasRef = useRef(null);
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const W = cv.clientWidth, H_ = cv.clientHeight;
    cv.width = W * dpr; cv.height = H_ * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H_);

    const padL = 40, padR = 40;
    const plotW = W - padL - padR;
    const cy = H_ / 2;
    const logMin = -16, logMax = 1; // metros, em log10

    const toPx = (metros) => padL + ((Math.log10(metros) - logMin) / (logMax - logMin)) * plotW;

    // régua principal
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(padL, cy); ctx.lineTo(padL + plotW, cy); ctx.stroke();

    // marcas de década
    for (let e = logMin; e <= logMax; e += 3) {
      const x = toPx(Math.pow(10, e));
      ctx.beginPath(); ctx.moveTo(x, cy - 6); ctx.lineTo(x, cy + 6); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.font = "9px 'JetBrains Mono', monospace";
      ctx.textAlign = 'center';
      ctx.fillText(`10${e}`, x, cy + 20);
    }

    // referências conhecidas
    REFERENCIAS.forEach(ref => {
      const x = toPx(ref.m);
      ctx.beginPath();
      ctx.arc(x, cy, 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(56,189,248,0.7)';
      ctx.fill();
      ctx.save();
      ctx.translate(x, cy - 14);
      ctx.rotate(-Math.PI / 5);
      ctx.fillStyle = 'rgba(56,189,248,0.9)';
      ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.textAlign = 'left';
      ctx.fillText(ref.label, 0, 0);
      ctx.restore();
    });

    // marcador do lambda atual
    const xL = clamp(toPx(lambda), padL, padL + plotW);
    ctx.beginPath();
    ctx.arc(xL, cy, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#FBBF24';
    ctx.shadowBlur = 14; ctx.shadowColor = '#FBBF24';
    ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = '#FBBF24';
    ctx.font = "bold 11px 'JetBrains Mono', monospace";
    ctx.textAlign = 'center';
    ctx.fillText(`λ ≈ ${fmtSci(lambda)} m`, xL, cy - 30);
  }, [lambda]);

  return (
    <div className="content">
      <div className="sidebar-l">
        <div className="section-label">Partícula</div>
        <div className="pill-row">
          {Object.entries(PRESETS).map(([id, pr]) => (
            <button key={id} className={`pill ${preset === id ? 'on' : ''}`} onClick={() => aplicarPreset(id)}>{pr.label}</button>
          ))}
        </div>

        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Massa m</span><span className="ctrl-num">{fmtSci(m)} kg</span></div>
          <input type="range" min={Math.log10(1e-31)} max={Math.log10(200)} step="0.02" value={Math.log10(m)} onChange={e => setM(Math.pow(10, +e.target.value))} />
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Velocidade v</span><span className="ctrl-num">{fmtSci(v)} m/s</span></div>
          <input type="range" min={Math.log10(0.1)} max={Math.log10(2.9e8)} step="0.02" value={Math.log10(v)} onChange={e => setV(Math.pow(10, +e.target.value))} />
        </div>

        <div className="section-label">Por que Não Vemos Bolas de Tênis Difratarem</div>
        <div className="card">
          <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.6 }}>
            Toda matéria tem um comprimento de onda associado, mas para objetos macroscópicos ele é
            tão absurdamente pequeno que nenhum efeito ondulatório é observável. Só para partículas
            muito leves (elétrons, nêutrons) λ chega perto de escalas atômicas — por isso a difração
            de elétrons é um experimento real de laboratório.
          </p>
        </div>
      </div>

      <div className="main-area">
        <div className="canvas-wrap"><canvas ref={canvasRef} /></div>
      </div>

      <div className="sidebar-r">
        <div className="section-label">Partícula</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">m</span><span className="stat-val">{fmtSci(m)} kg</span></div>
          <div className="stat-row"><span className="stat-label">v</span><span className="stat-val">{fmtSci(v)} m/s</span></div>
          <div className="stat-row"><span className="stat-label">p = mv</span><span className="stat-val cool">{fmtSci(m * v)} kg·m/s</span></div>
        </div>

        <div className="section-label">Comprimento de Onda</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">λ = h/p</span><span className="stat-val accent">{fmtSci(lambda)} m</span></div>
          <div className="stat-row"><span className="stat-label">comparado ao raio atômico</span><span className="stat-val warm">{fmtSci(lambda / 1e-10)}×</span></div>
        </div>

        <div className="eq-block">
          <div className="eq-title">Hipótese de de Broglie</div>
          <span className="sym">λ</span> <span className="op">=</span> h/p <span className="op">=</span> h/(mv)
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ABA 2 — FENDA DUPLA (unidades arbitrárias, foco no comportamento qualitativo)
// ═══════════════════════════════════════════════════════════════════════════
function amostraInterferencia(d, lambda, Lp, largura) {
  for (let t = 0; t < 60; t++) {
    const y = (Math.random() - 0.5) * largura;
    const dens = Math.pow(Math.cos((Math.PI * d * y) / (lambda * Lp)), 2);
    if (Math.random() < dens) return y;
  }
  return 0;
}
function amostraClassica(d, largura) {
  const ladoSlit = Math.random() < 0.5 ? -d / 2 : d / 2;
  const sigma = largura * 0.05;
  let y;
  do { y = ladoSlit + (Math.random() + Math.random() + Math.random() - 1.5) * sigma * 2; } while (Math.abs(y) > largura / 2);
  return y;
}

function FendaTab() {
  const [d, setD] = useState(5);
  const [lambda, setLambda] = useState(3);
  const [medindo, setMedindo] = useState(false);
  const [rodando, setRodando] = useState(true);
  const [contagem, setContagem] = useState(0);

  const Lp = 40;
  const stateRef = useRef({ d, lambda, medindo, rodando });
  useEffect(() => { stateRef.current = { d, lambda, medindo, rodando }; }, [d, lambda, medindo, rodando]);

  const particulasRef = useRef([]);
  const canvasRef = useRef(null);
  const bufferRef = useRef(null);
  const contadorRef = useRef(0);

  const reiniciar = () => {
    particulasRef.current = [];
    contadorRef.current = 0;
    setContagem(0);
    const buf = bufferRef.current;
    if (buf) buf.getContext('2d').clearRect(0, 0, buf.width, buf.height);
  };

  useEffect(() => { reiniciar(); }, [medindo]);

  useEffect(() => {
    let raf, last = null, acumulador = 0;
    const draw = (now) => {
      const cv = canvasRef.current;
      if (!cv) { raf = requestAnimationFrame(draw); return; }
      if (!bufferRef.current) {
        bufferRef.current = document.createElement('canvas');
      }
      const dpr = window.devicePixelRatio || 1;
      const W = cv.clientWidth, H_ = cv.clientHeight;
      cv.width = W * dpr; cv.height = H_ * dpr;
      const ctx = cv.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const buf = bufferRef.current;
      if (buf.width !== cv.width || buf.height !== cv.height) {
        buf.width = cv.width; buf.height = cv.height;
      }
      const bctx = buf.getContext('2d');
      bctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const s = stateRef.current;
      const xFonte = 20, xFenda = W * 0.35, xTela = W * 0.92;
      const cy = H_ / 2;
      const larguraTela = H_ * 0.9;

      const dt = last !== null ? Math.min((now - last) / 1000, 0.05) : 0.016;
      last = now;

      if (s.rodando) {
        acumulador += dt;
        if (acumulador > 0.03) {
          acumulador = 0;
          const finalY = s.medindo ? amostraClassica(s.d, larguraTela) : amostraInterferencia(s.d, s.lambda, Lp, larguraTela);
          const abertura = clamp(s.d * 4, 8, 40);
          const slitY = (Math.random() < 0.5 ? -abertura / 2 : abertura / 2);
          particulasRef.current.push({ x: xFonte, y: cy, xSlit: xFenda, ySlit: cy + slitY, xFim: xTela, yFim: cy + finalY, t: 0, dur: 0.5 + Math.random() * 0.2 });
          contadorRef.current += 1;
        }
      }

      ctx.clearRect(0, 0, W, H_);

      // barreira com duas fendas
      const slitTopo = cy - clamp(s.d * 4, 10, 60);
      const slitBase = cy + clamp(s.d * 4, 10, 60);
      ctx.strokeStyle = '#A855F7';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(xFenda, 0); ctx.lineTo(xFenda, slitTopo - 6);
      ctx.moveTo(xFenda, slitTopo + 6); ctx.lineTo(xFenda, slitBase - 6);
      ctx.moveTo(xFenda, slitBase + 6); ctx.lineTo(xFenda, H_);
      ctx.stroke();

      if (s.medindo) {
        [slitTopo, slitBase].forEach(sy => {
          ctx.beginPath();
          ctx.arc(xFenda, sy, 5, 0, Math.PI * 2);
          ctx.fillStyle = '#FBBF24';
          ctx.fill();
        });
      }

      // tela (buffer acumulado)
      ctx.drawImage(buf, 0, 0, W, H_);
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(xTela, 0); ctx.lineTo(xTela, H_); ctx.stroke();

      // partículas em voo
      const ativos = [];
      particulasRef.current.forEach(p => {
        p.t += dt;
        const f = clamp(p.t / p.dur, 0, 1);
        let px, py;
        if (f < 0.4) {
          const f1 = f / 0.4;
          px = p.x + (p.xSlit - p.x) * f1;
          py = p.y + (p.ySlit - p.y) * f1;
        } else {
          const f2 = (f - 0.4) / 0.6;
          px = p.xSlit + (p.xFim - p.xSlit) * f2;
          py = p.ySlit + (p.yFim - p.ySlit) * f2;
        }
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(251,191,36,0.85)';
        ctx.shadowBlur = 6; ctx.shadowColor = '#FBBF24';
        ctx.fill(); ctx.shadowBlur = 0;

        if (f >= 1) {
          bctx.beginPath();
          bctx.arc(p.xFim, p.yFim, 1.4, 0, Math.PI * 2);
          bctx.fillStyle = 'rgba(192,132,252,0.55)';
          bctx.fill();
        } else {
          ativos.push(p);
        }
      });
      particulasRef.current = ativos;

      setContagem(contadorRef.current);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="content">
      <div className="sidebar-l">
        <div className="section-label">Fendas</div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Separação d</span><span className="ctrl-num">{fmt(d, 1)}</span></div>
          <input type="range" min="2" max="12" step="0.5" value={d} onChange={e => setD(+e.target.value)} />
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Comprimento de onda λ</span><span className="ctrl-num">{fmt(lambda, 1)}</span></div>
          <input type="range" min="1" max="8" step="0.2" value={lambda} onChange={e => setLambda(+e.target.value)} />
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 11.5, marginTop: -8, marginBottom: 16 }}>unidades arbitrárias — o que importa é o padrão qualitativo</p>

        <label className="toggle-row">
          <input type="checkbox" checked={medindo} onChange={e => setMedindo(e.target.checked)} />
          <span className="toggle-label">Detector "por qual fenda" ativo</span>
        </label>

        <div className="btn-row">
          <button className="btn btn-primary" onClick={() => setRodando(r => !r)}>{rodando ? '⏸ Pausar' : '▶ Retomar'}</button>
          <button className="btn btn-danger" onClick={reiniciar}>↩ Reiniciar Tela</button>
        </div>

        <div className="section-label">Complementaridade</div>
        <div className="card">
          <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.6 }}>
            Ative o detector: mesmo enviando partículas uma de cada vez, o padrão de interferência
            desaparece e vira duas faixas simples — como se fossem bolinhas clássicas. Saber "por qual
            fenda" a partícula passou destrói o padrão de onda.
          </p>
        </div>
      </div>

      <div className="main-area">
        <div className="canvas-wrap"><canvas ref={canvasRef} /></div>
      </div>

      <div className="sidebar-r">
        <div className="section-label">Estado</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">Partículas detectadas</span><span className="stat-val accent">{contagem}</span></div>
          <div className="stat-row"><span className="stat-label">Modo</span><span className={`stat-val ${medindo ? 'negativo' : 'positivo'}`}>{medindo ? 'medindo (sem interferência)' : 'sem medir (interferência)'}</span></div>
        </div>

        <div className="alert-box">
          {medindo
            ? 'Cada partícula "escolhe" uma fenda e cai perto dela — duas faixas, sem franjas.'
            : 'Cada partícula, individualmente, se comporta como onda até ser detectada — o padrão de franjas emerge mesmo com uma partícula de cada vez.'}
        </div>

        <div className="section-label">Equação</div>
        <div className="eq-block">
          <div className="eq-title">Interferência Construtiva</div>
          d·sinθ <span className="op">=</span> mλ
          <br /><span className="cmt">franjas espaçadas por Δy = λL/d</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ABA 3 — CÁLCULO & DERIVAÇÕES
// ═══════════════════════════════════════════════════════════════════════════
function CalcTab() {
  const me = 9.109e-31, e = 1.602e-19, V = 100;
  const lambdaEletron = H / Math.sqrt(2 * me * e * V);

  return (
    <div className="main-area" style={{ overflow: 'auto' }}>
      <div className="calc-page">

        <div className="calc-section">
          <div className="calc-h2">1. A Hipótese de de Broglie</div>
          <p className="calc-p">
            O efeito fotoelétrico já mostrou que a luz — uma onda, classicamente — se comporta como
            partícula (fótons). Em 1924, de Broglie propôs o inverso: toda partícula com momento p
            também tem um comprimento de onda associado. Partindo de E=hf e E=pc (válida para fótons,
            m=0):
          </p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">hf = pc → p = hf/c = h/λ</span><span className="step-desc">relação válida para o fóton</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq"><span className="hi-acc">λ = h/p</span></span><span className="step-desc">de Broglie propôs que vale para qualquer partícula, com ou sem massa</span></div>
          </div>
        </div>

        <div className="calc-section">
          <div className="calc-h2">2. A Experiência da Fenda Dupla</div>
          <p className="calc-p">
            Partículas atravessando duas fendas estreitas produzem um padrão de interferência na tela —
            faixas claras e escuras, característica de ondas. A condição de interferência construtiva:
          </p>
          <div className="big-eq">
            <span className="hi-acc">d·sinθ = mλ</span>  (m = 0, ±1, ±2, ...)
            <span className="cmt">   ← d = separação das fendas, θ = ângulo até a franja</span>
          </div>
          <p className="calc-p">
            O mais surpreendente: o padrão aparece mesmo enviando partículas <strong>uma de cada
            vez</strong> — cada partícula individual "interfere consigo mesma", como se explorasse os
            dois caminhos possíveis simultaneamente.
          </p>
        </div>

        <div className="calc-section">
          <div className="calc-h2">3. O Princípio da Complementaridade</div>
          <p className="calc-p">
            Se um detector identifica por qual fenda cada partícula passou, o padrão de interferência
            desaparece — restam só duas faixas, como partículas clássicas. Bohr formalizou isso como
            complementaridade: os aspectos de onda e de partícula são mutuamente exclusivos em uma
            mesma medição. Não existe um experimento que revele "por qual fenda" e ainda preserve as
            franjas de interferência.
          </p>
        </div>

        <div className="calc-section">
          <div className="calc-h2">4. Exemplo Numérico: Difração de Elétrons</div>
          <p className="calc-p">
            Um elétron acelerado a partir do repouso por uma diferença de potencial V={V}V ganha energia
            cinética eV = ½m_ev², logo:
          </p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">v = √(2eV/m_e)</span><span className="step-desc">da energia cinética ganha</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq">λ = h/(m_ev) = h/√(2m_eeV)</span><span className="step-desc">substituindo na fórmula de de Broglie</span></div>
            <div className="derivation-step"><span className="step-num">③</span><span className="step-eq">λ ≈ {fmtSci(lambdaEletron)} m</span><span className="step-desc">comparável a espaçamentos atômicos — por isso cristais difratam elétrons</span></div>
          </div>
        </div>

        <div className="calc-section">
          <div className="calc-h2">5. Por que Objetos Macroscópicos Não Difratam</div>
          <p className="calc-p">
            Para uma bola de tênis (m≈0.057kg, v≈30m/s), λ=h/(mv)≈{fmtSci(H / (0.057 * 30))} m — muitas
            ordens de grandeza menor que o raio de um próton. Nenhuma fenda concebível seria estreita o
            bastante para revelar esse comprimento de onda; por isso o mundo macroscópico parece
            puramente clássico.
          </p>
        </div>

      </div>
    </div>
  );
}
