// src/pages/ExperimentoIncertezaHeisenberg.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FISICA3_BASE_STYLES, QUANTICA } from '../styles/fisica3Theme';

const { H, HBAR } = QUANTICA;
const fmt = (n, d = 2) => (typeof n === 'number' && isFinite(n) ? n.toFixed(d) : '—');
const fmtSci = (n) => (isFinite(n) ? (Math.abs(n) < 1000 && Math.abs(n) >= 0.01 ? n.toFixed(2) : n.toExponential(2)) : '—');
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

const STYLES = FISICA3_BASE_STYLES + `
.split-row { flex: 1; display: flex; overflow: hidden; }
.split-panel { flex: 1; display: flex; flex-direction: column; border-right: 1px solid var(--border); overflow: hidden; }
.split-panel:last-child { border-right: none; }
.btn-row { display: flex; gap: 12px; margin-top: 16px; }
`;

export default function ExperimentoIncertezaHeisenberg() {
  const [tab, setTab] = useState('pacote');
  return (
    <>
      <style>{STYLES}</style>
      <div className="app">
        <header className="header">
          <div className="header-title">Princípio da Incerteza de Heisenberg</div>
          <div className="header-sub">Física 3 · Física Moderna</div>
          <span className="header-tag">Δx·Δp ≥ ℏ/2</span>
        </header>
        <nav className="tabs">
          {[['pacote', 'Pacote de Onda'], ['fenda', 'Fenda Única'], ['calc', 'Cálculo & Derivações']].map(([id, label]) => (
            <button key={id} className={`tab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>{label}</button>
          ))}
        </nav>
        {tab === 'pacote' && <PacoteTab />}
        {tab === 'fenda' && <FendaUnicaTab />}
        {tab === 'calc' && <CalcTab />}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ABA 1 — PACOTE DE ONDA (espaço de posição vs espaço de momento)
// ═══════════════════════════════════════════════════════════════════════════
function PacoteTab() {
  const [sigmaXExp, setSigmaXExp] = useState(-10); // log10(sigma_x em metros)
  const sigmaX = Math.pow(10, sigmaXExp);
  const sigmaP = HBAR / (2 * sigmaX); // caso de incerteza mínima (pacote gaussiano)

  const produto = sigmaX * sigmaP;

  const canvasEsquerdaRef = useRef(null);
  const canvasDireitaRef = useRef(null);

  useEffect(() => {
    const desenhaPosicao = () => {
      const cv = canvasEsquerdaRef.current;
      if (!cv) return;
      const ctx = cv.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      const W = cv.clientWidth, H_ = cv.clientHeight;
      cv.width = W * dpr; cv.height = H_ * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H_);

      const cx = W / 2, cy = H_ / 2;
      // escala fixa (referenciada a sigmaX0), NÃO ao sigmaX atual — assim a largura
      // do pacote desenhado muda de verdade quando o slider muda, em vez de se
      // auto-normalizar e parecer sempre do mesmo tamanho.
      const sigmaX0 = 1e-10;
      const escala = (W * 0.42) / (4 * sigmaX0);
      const k0 = 10 / sigmaX0;

      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke();

      // envelope gaussiano (tracejado)
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(251,191,36,0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let px = 0; px <= W; px++) {
        const x = (px - cx) / escala;
        const env = Math.exp(-(x * x) / (2 * sigmaX * sigmaX));
        const y = cy - env * H_ * 0.4;
        px === 0 ? ctx.moveTo(px, y) : ctx.lineTo(px, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // pacote de onda: envelope * portadora oscilante
      ctx.strokeStyle = '#A855F7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let px = 0; px <= W; px++) {
        const x = (px - cx) / escala;
        const env = Math.exp(-(x * x) / (2 * sigmaX * sigmaX));
        const onda = env * Math.cos(k0 * x);
        const y = cy - onda * H_ * 0.4;
        px === 0 ? ctx.moveTo(px, y) : ctx.lineTo(px, y);
      }
      ctx.stroke();

      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = "11px 'JetBrains Mono', monospace";
      ctx.textAlign = 'center';
      ctx.fillText('ψ(x) — espaço de posição', cx, H_ - 10);
    };

    const desenhaMomento = () => {
      const cv = canvasDireitaRef.current;
      if (!cv) return;
      const ctx = cv.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      const W = cv.clientWidth, H_ = cv.clientHeight;
      cv.width = W * dpr; cv.height = H_ * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H_);

      const cx = W / 2, cy = H_ / 2;
      // mesma lógica de escala fixa do painel de posição, referenciada a sigmaP0
      const sigmaP0 = HBAR / (2 * 1e-10);
      const escala = (W * 0.42) / (4 * sigmaP0);

      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke();

      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let px = 0; px <= W; px++) {
        const p = (px - cx) / escala;
        const env = Math.exp(-(p * p) / (2 * sigmaP * sigmaP));
        const y = cy - env * H_ * 0.4;
        px === 0 ? ctx.moveTo(px, y) : ctx.lineTo(px, y);
      }
      ctx.stroke();
      ctx.fillStyle = 'rgba(56,189,248,0.15)';
      ctx.beginPath();
      ctx.moveTo(0, cy);
      for (let px = 0; px <= W; px++) {
        const p = (px - cx) / escala;
        const env = Math.exp(-(p * p) / (2 * sigmaP * sigmaP));
        ctx.lineTo(px, cy - env * H_ * 0.4);
      }
      ctx.lineTo(W, cy);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = "11px 'JetBrains Mono', monospace";
      ctx.textAlign = 'center';
      ctx.fillText('|φ(p)| — espaço de momento', cx, H_ - 10);
    };

    desenhaPosicao();
    desenhaMomento();
  }, [sigmaX, sigmaP]);

  return (
    <div className="content">
      <div className="sidebar-l">
        <div className="section-label">Localização do Pacote</div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Δx (largura em posição)</span><span className="ctrl-num">{fmtSci(sigmaX)} m</span></div>
          <input type="range" min="-11.5" max="-8" step="0.02" value={sigmaXExp} onChange={e => setSigmaXExp(+e.target.value)} />
        </div>

        <div className="section-label">O Compromisso Fundamental</div>
        <div className="card">
          <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.6 }}>
            Arraste o slider: quanto mais estreito o pacote em posição (mais localizado), mais largo
            fica em momento (menos definido) — e vice-versa. Essa troca não é uma limitação de
            instrumento, é uma propriedade matemática de qualquer onda.
          </p>
        </div>
      </div>

      <div className="main-area">
        <div className="split-row">
          <div className="split-panel"><canvas ref={canvasEsquerdaRef} /></div>
          <div className="split-panel"><canvas ref={canvasDireitaRef} /></div>
        </div>
      </div>

      <div className="sidebar-r">
        <div className="section-label">Incertezas</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">Δx</span><span className="stat-val" style={{ color: '#A855F7' }}>{fmtSci(sigmaX)} m</span></div>
          <div className="stat-row"><span className="stat-label">Δp</span><span className="stat-val cool">{fmtSci(sigmaP)} kg·m/s</span></div>
        </div>

        <div className="section-label">Verificação</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">Δx · Δp</span><span className="stat-val warm">{fmtSci(produto)}</span></div>
          <div className="stat-row"><span className="stat-label">ℏ/2</span><span className="stat-val">{fmtSci(HBAR / 2)}</span></div>
        </div>

        <div className="alert-box">
          Esse pacote gaussiano é o caso de "incerteza mínima" — a igualdade Δx·Δp=ℏ/2 exatamente.
          Qualquer outro formato de pacote de onda teria um produto maior.
        </div>

        <div className="eq-block">
          <div className="eq-title">Princípio da Incerteza</div>
          <span className="sym">Δx</span>·<span className="sym">Δp</span> <span className="op">≥</span> ℏ/2
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ABA 2 — FENDA ÚNICA (difração como demonstração física da incerteza)
// ═══════════════════════════════════════════════════════════════════════════
function amostraDifracaoSimples(a, lambda, Lp, largura) {
  for (let t = 0; t < 80; t++) {
    const y = (Math.random() - 0.5) * largura;
    const arg = (Math.PI * a * y) / (lambda * Lp);
    const sinc = arg === 0 ? 1 : Math.sin(arg) / arg;
    const dens = sinc * sinc;
    if (Math.random() < dens) return y;
  }
  return 0;
}

function FendaUnicaTab() {
  const [a, setA] = useState(5);
  const [lambda, setLambda] = useState(3);
  const [rodando, setRodando] = useState(true);
  const [contagem, setContagem] = useState(0);

  const Lp = 40;
  const thetaPrimeiroMinimo = lambda / a;

  const stateRef = useRef({ a, lambda, rodando });
  useEffect(() => { stateRef.current = { a, lambda, rodando }; }, [a, lambda, rodando]);

  const particulasRef = useRef([]);
  const contadorRef = useRef(0);
  const canvasRef = useRef(null);
  const bufferRef = useRef(null);

  const reiniciar = () => {
    particulasRef.current = [];
    contadorRef.current = 0;
    setContagem(0);
    const buf = bufferRef.current;
    if (buf) buf.getContext('2d').clearRect(0, 0, buf.width, buf.height);
  };

  useEffect(() => { reiniciar(); }, [a]);

  useEffect(() => {
    let raf, last = null, acumulador = 0;
    const draw = (now) => {
      const cv = canvasRef.current;
      if (!cv) { raf = requestAnimationFrame(draw); return; }
      if (!bufferRef.current) bufferRef.current = document.createElement('canvas');
      const dpr = window.devicePixelRatio || 1;
      const W = cv.clientWidth, H_ = cv.clientHeight;
      cv.width = W * dpr; cv.height = H_ * dpr;
      const ctx = cv.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const buf = bufferRef.current;
      if (buf.width !== cv.width || buf.height !== cv.height) { buf.width = cv.width; buf.height = cv.height; }
      const bctx = buf.getContext('2d');
      bctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const s = stateRef.current;
      const xFonte = 20, xFenda = W * 0.35, xTela = W * 0.92;
      const cy = H_ / 2;
      const larguraTela = H_ * 0.9;
      const aberturaPx = clamp(s.a * 5, 6, 90);

      const dt = last !== null ? Math.min((now - last) / 1000, 0.05) : 0.016;
      last = now;

      if (s.rodando) {
        acumulador += dt;
        if (acumulador > 0.025) {
          acumulador = 0;
          const finalY = amostraDifracaoSimples(s.a, s.lambda, Lp, larguraTela);
          const slitY = (Math.random() - 0.5) * aberturaPx;
          particulasRef.current.push({ x: xFonte, y: cy, xSlit: xFenda, ySlit: cy + slitY, xFim: xTela, yFim: cy + finalY, t: 0, dur: 0.5 + Math.random() * 0.2 });
          contadorRef.current += 1;
        }
      }

      ctx.clearRect(0, 0, W, H_);

      // barreira com fenda única
      ctx.strokeStyle = '#A855F7';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(xFenda, 0); ctx.lineTo(xFenda, cy - aberturaPx / 2 - 6);
      ctx.moveTo(xFenda, cy + aberturaPx / 2 + 6); ctx.lineTo(xFenda, H_);
      ctx.stroke();

      // tela acumulada
      ctx.drawImage(buf, 0, 0, W, H_);
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(xTela, 0); ctx.lineTo(xTela, H_); ctx.stroke();

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
          bctx.fillStyle = 'rgba(56,189,248,0.55)';
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
        <div className="section-label">Fenda</div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Largura a (Δx ao passar)</span><span className="ctrl-num">{fmt(a, 1)}</span></div>
          <input type="range" min="1" max="12" step="0.5" value={a} onChange={e => setA(+e.target.value)} />
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Comprimento de onda λ</span><span className="ctrl-num">{fmt(lambda, 1)}</span></div>
          <input type="range" min="1" max="8" step="0.2" value={lambda} onChange={e => setLambda(+e.target.value)} />
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 11.5, marginTop: -8, marginBottom: 16 }}>unidades arbitrárias — o que importa é a relação a↔espalhamento</p>

        <div className="btn-row">
          <button className="btn btn-primary" onClick={() => setRodando(r => !r)}>{rodando ? '⏸ Pausar' : '▶ Retomar'}</button>
          <button className="btn btn-danger" onClick={reiniciar}>↩ Reiniciar Tela</button>
        </div>

        <div className="section-label">A Incerteza em Ação</div>
        <div className="card">
          <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.6 }}>
            Estreite a fenda (reduza a): você está medindo a posição da partícula com mais precisão ao
            passar por ela. Repare que o padrão na tela se espalha mais — a incerteza no momento
            transversal aumentou. Não é um efeito de aparelho: é o próprio princípio da incerteza.
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
        </div>

        <div className="section-label">Espalhamento Angular</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">θ (primeiro mínimo) = λ/a</span><span className="stat-val warm">{fmt(thetaPrimeiroMinimo, 3)} rad</span></div>
        </div>

        <div className="alert-box">
          Δx (a fenda) e Δp (o espalhamento induzido) variam em sentidos opostos: Δp ≈ h/Δx, então
          Δx·Δp ≈ h — independente de λ. Reduzir a fenda pela metade dobra o espalhamento angular.
        </div>

        <div className="eq-block">
          <div className="eq-title">Origem Física da Incerteza</div>
          Δx <span className="op">≈</span> a
          <br />Δp <span className="op">≈</span> h/a
          <br /><span className="cmt">Δx·Δp ≈ h</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ABA 3 — CÁLCULO & DERIVAÇÕES
// ═══════════════════════════════════════════════════════════════════════════
function CalcTab() {
  const a = 1e-10; // confinamento em escala atômica, m
  const deltaP = HBAR / (2 * a);
  const me = 9.109e-31;
  const Emin = (deltaP * deltaP) / (2 * me);
  const Emin_eV = Emin / 1.602e-19;

  return (
    <div className="main-area" style={{ overflow: 'auto' }}>
      <div className="calc-page">

        <div className="calc-section">
          <div className="calc-h2">1. O Enunciado do Princípio</div>
          <p className="calc-p">
            Heisenberg (1927) mostrou que existe um limite fundamental — não uma limitação técnica de
            instrumentos — para o quanto se pode conhecer simultaneamente a posição e o momento de uma
            partícula:
          </p>
          <div className="big-eq">
            <span className="hi-acc">Δx · Δp ≥ ℏ/2</span>
            <span className="cmt">   ← ℏ = h/2π ≈ {fmtSci(HBAR)} J·s</span>
          </div>
          <p className="calc-p">
            Uma relação análoga vale para energia e tempo:
          </p>
          <div className="big-eq">
            <span className="hi-acc">ΔE · Δt ≥ ℏ/2</span>
          </div>
        </div>

        <div className="calc-section">
          <div className="calc-h2">2. Origem: Dualidade Onda-Partícula + Análise de Fourier</div>
          <p className="calc-p">
            Uma onda plana perfeita (comprimento de onda λ único, logo momento p=h/λ perfeitamente
            definido) se estende por todo o espaço — Δx=∞. Para localizar a partícula em uma região
            finita, é preciso somar (superpor) ondas de vários comprimentos de onda diferentes — o que
            introduz uma incerteza correspondente em p. Quanto mais estreito o pacote resultante em x,
            mais larga precisa ser a faixa de momentos somados.
          </p>
        </div>

        <div className="calc-section">
          <div className="calc-h2">3. Derivação Qualitativa via Difração em Fenda Única</div>
          <p className="calc-p">
            Uma partícula que atravessa uma fenda de largura a tem sua posição transversal conhecida
            com incerteza Δx≈a. A difração espalha o feixe até o primeiro mínimo em um ângulo θ dado por:
          </p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">a·sinθ = λ</span><span className="step-desc">condição do primeiro mínimo de difração</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq">Δp_y ≈ p·sinθ = (h/λ)·(λ/a) = h/a</span><span className="step-desc">incerteza no momento transversal induzida pela fenda</span></div>
            <div className="derivation-step"><span className="step-num">③</span><span className="step-eq"><span className="hi-acc">Δx·Δp_y ≈ a·(h/a) = h</span></span><span className="step-desc">mesma ordem de grandeza de ℏ — consistente com o princípio</span></div>
          </div>
        </div>

        <div className="calc-section">
          <div className="calc-h2">4. Consequências</div>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">Não existe "repouso absoluto" quântico</span><span className="step-desc">confinar uma partícula (Δx pequeno) força Δp≠0 — energia de ponto zero</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq">Órbitas eletrônicas clássicas são impossíveis</span><span className="step-desc">um elétron numa órbita definida teria Δx e Δp simultaneamente nulos</span></div>
            <div className="derivation-step"><span className="step-num">③</span><span className="step-eq">Partículas virtuais</span><span className="step-desc">ΔE·Δt≥ℏ/2 permite violações temporárias de conservação de energia em escalas de tempo curtas</span></div>
          </div>
        </div>

        <div className="calc-section">
          <div className="calc-h2">5. Exemplo Numérico: Energia Mínima de Confinamento</div>
          <p className="calc-p">
            Um elétron confinado a uma região do tamanho de um átomo (Δx≈1Å={a}m) tem, pelo princípio
            da incerteza, um momento mínimo Δp≈ℏ/(2Δx):
          </p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">Δp ≈ ℏ/(2Δx) ≈ {fmtSci(deltaP)} kg·m/s</span><span className="step-desc">momento mínimo induzido pelo confinamento</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq">E_mín ≈ (Δp)²/(2m_e) ≈ {fmt(Emin_eV, 2)} eV</span><span className="step-desc">estimativa da energia cinética mínima — mesma ordem de grandeza das energias de ligação atômicas reais</span></div>
          </div>
          <p className="calc-p">
            Essa estimativa simples, obtida só do princípio da incerteza, já antecipa por que átomos
            têm um tamanho mínimo estável — o assunto do próximo experimento (poço de potencial).
          </p>
        </div>

      </div>
    </div>
  );
}
