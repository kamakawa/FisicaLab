// src/pages/ExperimentoPocoPotencial.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FISICA3_BASE_STYLES, QUANTICA } from '../styles/fisica3Theme';

const { H, HBAR } = QUANTICA;
const ME = 9.109e-31; // kg — massa do elétron
const E_CHARGE = 1.602e-19; // C
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
.split-row { flex: 1; display: flex; overflow: hidden; }
.split-panel { flex: 1; display: flex; flex-direction: column; border-right: 1px solid var(--border); overflow: hidden; }
.split-panel:last-child { border-right: none; }
`;

export default function ExperimentoPocoPotencial() {
  const [tab, setTab] = useState('poco');
  return (
    <>
      <style>{STYLES}</style>
      <div className="app">
        <header className="header">
          <div className="header-title">Poço de Potencial e Tunelamento Quântico</div>
          <div className="header-sub">Física 3 · Física Moderna</div>
          <span className="header-tag">−ℏ²/2m·ψ'' + Vψ = Eψ</span>
        </header>
        <nav className="tabs">
          {[['poco', 'Poço de Potencial'], ['tunel', 'Tunelamento'], ['calc', 'Cálculo & Derivações']].map(([id, label]) => (
            <button key={id} className={`tab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>{label}</button>
          ))}
        </nav>
        {tab === 'poco' && <PocoTab />}
        {tab === 'tunel' && <TunelTab />}
        {tab === 'calc' && <CalcTab />}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ABA 1 — POÇO DE POTENCIAL INFINITO (partícula na caixa)
// ═══════════════════════════════════════════════════════════════════════════
function En(n, L) { return (n * n * H * H) / (8 * ME * L * L) / E_CHARGE; } // eV

function PocoTab() {
  const [Lnm, setLnm] = useState(0.5);
  const [n, setN] = useState(1);
  const L = Lnm * 1e-9;

  const niveis = [1, 2, 3, 4, 5].map(k => En(k, L));
  const Eatual = En(n, L);

  const canvasEsqRef = useRef(null);
  const canvasDirRef = useRef(null);

  useEffect(() => {
    // painel esquerdo: ψ_n(x) e |ψ_n(x)|²
    const cvE = canvasEsqRef.current;
    if (cvE) {
      const ctx = cvE.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      const W = cvE.clientWidth, H_ = cvE.clientHeight;
      cvE.width = W * dpr; cvE.height = H_ * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H_);

      const padY = 30;
      const cy = H_ / 2;
      // largura da caixa em pixels acompanha L de verdade (com limites pra caber no canvas),
      // em vez de sempre ocupar a largura toda do canvas — assim dá pra ver a caixa
      // encolher/crescer quando o slider muda.
      const plotW = clamp(Lnm * 220, 60, W - 60);
      const x0 = (W - plotW) / 2, x1 = x0 + plotW;

      // paredes do poço
      ctx.strokeStyle = '#A855F7';
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(x0, padY - 10); ctx.lineTo(x0, H_ - padY + 10); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x1, padY - 10); ctx.lineTo(x1, H_ - padY + 10); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x0, cy); ctx.lineTo(x1, cy); ctx.stroke();

      // ψ_n(x)
      ctx.strokeStyle = '#FBBF24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let px = 0; px <= plotW; px++) {
        const frac = px / plotW;
        const psi = Math.sin(n * Math.PI * frac);
        const y = cy - psi * (H_ * 0.32);
        px === 0 ? ctx.moveTo(x0 + px, y) : ctx.lineTo(x0 + px, y);
      }
      ctx.stroke();

      // |ψ_n(x)|²
      ctx.strokeStyle = 'rgba(56,189,248,0.85)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let px = 0; px <= plotW; px++) {
        const frac = px / plotW;
        const psi = Math.sin(n * Math.PI * frac);
        const y = (H_ - padY) - psi * psi * (H_ * 0.28);
        px === 0 ? ctx.moveTo(x0 + px, y) : ctx.lineTo(x0 + px, y);
      }
      ctx.stroke();

      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = "11px 'JetBrains Mono', monospace";
      ctx.textAlign = 'center';
      ctx.fillText(`ψ_${n}(x) (amarelo)  e  |ψ_${n}(x)|² (azul)`, W / 2, 18);
    }

    // painel direito: diagrama de níveis de energia
    const cvD = canvasDirRef.current;
    if (cvD) {
      const ctx = cvD.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      const W = cvD.clientWidth, H_ = cvD.clientHeight;
      cvD.width = W * dpr; cvD.height = H_ * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H_);

      const padT = 24, padB = 30;
      const plotH = H_ - padT - padB;
      // escala fixa (referenciada a L0=0.5nm), NÃO ao nível máximo atual — assim a régua
      // de energia realmente sobe/desce quando L muda (poço mais estreito = energias
      // maiores, os níveis sobem na tela), em vez de sempre se auto-ajustar e parecer igual.
      const maxReferencia = En(5, 0.5e-9);
      const toY = (E) => padT + plotH - clamp(E / maxReferencia, 0, 1) * plotH;

      niveis.forEach((E, idx) => {
        const k = idx + 1;
        const y = toY(E);
        const ativo = k === n;
        ctx.beginPath();
        ctx.moveTo(W * 0.2, y); ctx.lineTo(W * 0.8, y);
        ctx.strokeStyle = ativo ? '#FBBF24' : 'rgba(168,85,247,0.4)';
        ctx.lineWidth = ativo ? 3 : 1.5;
        ctx.stroke();
        ctx.fillStyle = ativo ? '#FBBF24' : 'rgba(255,255,255,0.4)';
        ctx.font = "11px 'JetBrains Mono', monospace";
        ctx.textAlign = 'left';
        ctx.fillText(`n=${k}  (${fmt(E, 3)} eV)`, W * 0.82, y + 4);
      });

      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.textAlign = 'center';
      ctx.fillText('níveis de energia quantizados', W / 2, H_ - 10);
    }
  }, [Lnm, n, L, niveis]);

  return (
    <div className="content">
      <div className="sidebar-l">
        <div className="section-label">Caixa (Poço Infinito)</div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Largura L</span><span className="ctrl-num">{fmt(Lnm, 2)} nm</span></div>
          <input type="range" min="0.1" max="2" step="0.02" value={Lnm} onChange={e => setLnm(+e.target.value)} />
        </div>

        <div className="section-label">Número Quântico</div>
        <div className="pill-row">
          {[1, 2, 3, 4, 5].map(k => (
            <button key={k} className={`pill ${n === k ? 'on' : ''}`} onClick={() => setN(k)}>n={k}</button>
          ))}
        </div>

        <div className="section-label">Por que o Gráfico é Estático</div>
        <div className="card">
          <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.6 }}>
            Autoestados de energia são <strong>estados estacionários</strong>: a densidade de
            probabilidade |ψ|² não muda no tempo. Por isso o gráfico só muda quando você altera L ou n
            — nada "acontece" fisicamente ao longo do tempo aqui.
          </p>
        </div>
      </div>

      <div className="main-area">
        <div className="split-row">
          <div className="split-panel"><canvas ref={canvasEsqRef} /></div>
          <div className="split-panel"><canvas ref={canvasDirRef} /></div>
        </div>
      </div>

      <div className="sidebar-r">
        <div className="section-label">Estado Selecionado</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">n</span><span className="stat-val warm">{n}</span></div>
          <div className="stat-row"><span className="stat-label">E_n</span><span className="stat-val accent">{fmt(Eatual, 4)} eV</span></div>
          <div className="stat-row"><span className="stat-label">λ_n = 2L/n</span><span className="stat-val cool">{fmt((2 * Lnm) / n, 3)} nm</span></div>
        </div>

        {n === 1 && (
          <div className="alert-box">
            Mesmo no estado de menor energia (n=1), E₁≠0 — a "energia de ponto zero". Consequência
            direta do princípio da incerteza: confinar a partícula (Δx≈L) exige Δp≠0, logo energia
            cinética mínima não-nula.
          </div>
        )}

        <div className="section-label">Equação</div>
        <div className="eq-block">
          <div className="eq-title">Níveis de Energia Quantizados</div>
          <span className="sym">E_n</span> <span className="op">=</span> n²h²/(8mL²)
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ABA 2 — TUNELAMENTO QUÂNTICO
// ═══════════════════════════════════════════════════════════════════════════
function TunelTab() {
  const [E, setE] = useState(2);
  const [V0, setV0] = useState(5);
  const [aNm, setANm] = useState(0.5);

  const a = aNm * 1e-9;
  const Efinal = Math.min(E, V0 - 0.05);
  const k1 = Math.sqrt(2 * ME * Efinal * E_CHARGE) / HBAR;
  const kappa = Math.sqrt(2 * ME * (V0 - Efinal) * E_CHARGE) / HBAR;
  const senh = Math.sinh(kappa * a);
  const T = 1 / (1 + (V0 * V0 * senh * senh) / (4 * Efinal * (V0 - Efinal)));

  const canvasRef = useRef(null);
  useEffect(() => {
    let raf, t = 0;
    const cv = canvasRef.current;
    const ctx = cv?.getContext('2d');
    const draw = () => {
      if (!cv || !ctx) { raf = requestAnimationFrame(draw); return; }
      t += 0.02;
      const dpr = window.devicePixelRatio || 1;
      const W = cv.clientWidth, H_ = cv.clientHeight;
      cv.width = W * dpr; cv.height = H_ * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H_);

      const cy = H_ / 2;
      const xBarreiraIni = W * 0.42, xBarreiraFim = W * 0.58;
      const alturaBarreira = clamp((V0 / 10) * H_ * 0.4, 20, H_ * 0.42);

      // barreira de potencial
      ctx.fillStyle = 'rgba(251,191,36,0.18)';
      ctx.strokeStyle = '#FBBF24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, H_ - 20);
      ctx.lineTo(xBarreiraIni, H_ - 20);
      ctx.lineTo(xBarreiraIni, H_ - 20 - alturaBarreira);
      ctx.lineTo(xBarreiraFim, H_ - 20 - alturaBarreira);
      ctx.lineTo(xBarreiraFim, H_ - 20);
      ctx.lineTo(W, H_ - 20);
      ctx.stroke();
      ctx.lineTo(W, H_ - 20 + 40);
      ctx.lineTo(0, H_ - 20 + 40);
      ctx.closePath();
      ctx.fill();

      // linha de energia E
      const yE = H_ - 20 - (E / 10) * H_ * 0.4;
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.moveTo(0, yE); ctx.lineTo(W, yE); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.textAlign = 'left';
      ctx.fillText('E', 6, yE - 6);

      // função de onda Re[ψ(x)]
      const amp = H_ * 0.16;
      const escalaK1 = 3e9; // px por (1/m), calibrado para dar oscilações visíveis
      const escalaKappa = 3e9;
      ctx.strokeStyle = '#A855F7';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      for (let px = 0; px <= W; px++) {
        let val;
        if (px < xBarreiraIni) {
          val = Math.cos(k1 * (px / escalaK1) - t);
        } else if (px <= xBarreiraFim) {
          const xi = (px - xBarreiraIni) / escalaKappa;
          const decaimento = Math.exp(-kappa * xi);
          val = decaimento;
        } else {
          const ampTransmitida = Math.sqrt(clamp(T, 0, 1));
          val = ampTransmitida * Math.cos(k1 * ((px - xBarreiraFim) / escalaK1) - t);
        }
        const y = cy - val * amp;
        px === 0 ? ctx.moveTo(px, y) : ctx.lineTo(px, y);
      }
      ctx.stroke();

      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.font = "11px 'JetBrains Mono', monospace";
      ctx.textAlign = 'center';
      ctx.fillText('Re[ψ(x)] — a oscilação mostra a fase evoluindo; a envoltória é o que importa', W / 2, 20);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [E, V0, a, k1, kappa, T]);

  return (
    <div className="content">
      <div className="sidebar-l">
        <div className="section-label">Partícula e Barreira</div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Energia da partícula E</span><span className="ctrl-num">{fmt(E, 2)} eV</span></div>
          <input type="range" min="0.2" max="9.5" step="0.1" value={E} onChange={e => setE(+e.target.value)} />
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Altura da barreira V₀</span><span className="ctrl-num">{fmt(V0, 2)} eV</span></div>
          <input type="range" min="1" max="10" step="0.2" value={V0} onChange={e => setV0(+e.target.value)} />
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Largura da barreira a</span><span className="ctrl-num">{fmt(aNm, 2)} nm</span></div>
          <input type="range" min="0.05" max="1.5" step="0.02" value={aNm} onChange={e => setANm(+e.target.value)} />
        </div>

        <div className="section-label">Classicamente Impossível</div>
        <div className="card">
          <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.6 }}>
            Como E&lt;V₀, uma partícula clássica jamais atravessaria essa barreira — rebateria sempre.
            Quanticamente, há uma probabilidade real de transmissão T, decaindo exponencialmente com a
            largura e a altura da barreira.
          </p>
        </div>
      </div>

      <div className="main-area">
        <div className="canvas-wrap"><canvas ref={canvasRef} /></div>
      </div>

      <div className="sidebar-r">
        <div className="section-label">Constante de Decaimento</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">κ = √(2m(V₀−E))/ℏ</span><span className="stat-val">{fmtSci(kappa)} m⁻¹</span></div>
        </div>

        <div className="section-label">Probabilidades</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">T (transmissão)</span><span className="stat-val positivo">{fmtSci(T)}</span></div>
          <div className="stat-row"><span className="stat-label">R = 1−T (reflexão)</span><span className="stat-val negativo">{fmtSci(1 - T)}</span></div>
        </div>

        <div className="alert-box">
          Dobrar a largura da barreira eleva o expoente −2κa ao quadrado no fator de decaimento — T cai
          exponencialmente rápido com a. É por isso que o tunelamento só é relevante em escalas
          atômicas/nanométricas.
        </div>

        <div className="eq-block">
          <div className="eq-title">Transmissão (barreira retangular)</div>
          <span className="sym">T</span> <span className="op">≈</span> e<span className="cmt">−2κa</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ABA 3 — CÁLCULO & DERIVAÇÕES
// ═══════════════════════════════════════════════════════════════════════════
function CalcTab() {
  const L = 0.5e-9;
  const E1 = En(1, L), E2 = En(2, L);

  const E = 2, V0 = 5, a = 0.3e-9;
  const kappa = Math.sqrt(2 * ME * (V0 - E) * E_CHARGE) / HBAR;
  const T = Math.exp(-2 * kappa * a);

  return (
    <div className="main-area" style={{ overflow: 'auto' }}>
      <div className="calc-page">

        <div className="calc-section">
          <div className="calc-h2">1. A Equação de Schrödinger Independente do Tempo</div>
          <p className="calc-p">
            Toda a mecânica quântica não-relativística de uma partícula sob um potencial V(x) é regida por:
          </p>
          <div className="big-eq">
            <span className="hi-acc">−(ℏ²/2m)·d²ψ/dx² + V(x)ψ = Eψ</span>
          </div>
        </div>

        <div className="calc-section">
          <div className="calc-h2">2. O Poço de Potencial Infinito</div>
          <p className="calc-p">
            Para uma partícula confinada entre paredes infinitas em x=0 e x=L (V=∞ fora, V=0 dentro), a
            condição de contorno ψ(0)=ψ(L)=0 só é satisfeita para comprimentos de onda específicos —
            exatamente como uma corda presa nas duas pontas:
          </p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">ψ_n(x) = √(2/L)·sin(nπx/L)</span><span className="step-desc">n = 1, 2, 3, ... — só encaixam meios-comprimentos de onda inteiros</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq"><span className="hi-acc">E_n = n²h²/(8mL²)</span></span><span className="step-desc">energia quantizada — só certos valores discretos são permitidos</span></div>
          </div>
          <p className="calc-p">
            Exemplo: elétron confinado em L=0.5nm tem E₁≈{fmt(E1, 3)}eV, E₂≈{fmt(E2, 3)}eV — o
            espaçamento entre níveis cresce com n² (não são igualmente espaçados).
          </p>
        </div>

        <div className="calc-section">
          <div className="calc-h2">3. Tunelamento: Solução Dentro da Barreira</div>
          <p className="calc-p">
            Dentro de uma barreira com E&lt;V(x), a equação de Schrödinger dá uma "energia cinética"
            efetiva negativa — a solução deixa de oscilar e passa a ser uma exponencial real:
          </p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">ψ'' = (2m/ℏ²)(V₀−E)ψ = κ²ψ</span><span className="step-desc">Schrödinger dentro da barreira, com κ=√(2m(V₀−E))/ℏ</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq">ψ(x) = Ce^(−κx) + De^(κx)</span><span className="step-desc">solução geral — decaimento/crescimento exponencial, não oscilatória</span></div>
            <div className="derivation-step"><span className="step-num">③</span><span className="step-eq"><span className="hi-acc">T ≈ e^(−2κa)</span></span><span className="step-desc">probabilidade de transmissão, para barreiras largas (κa≫1)</span></div>
          </div>
        </div>

        <div className="calc-section">
          <div className="calc-h2">4. Aplicações Reais do Tunelamento</div>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">Decaimento alfa</span><span className="step-desc">partículas α tunelam através da barreira de potencial nuclear</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq">Microscópio de Tunelamento (STM)</span><span className="step-desc">mede a corrente de tunelamento entre uma ponta e a superfície, átomo por átomo</span></div>
            <div className="derivation-step"><span className="step-num">③</span><span className="step-eq">Fusão estelar</span><span className="step-desc">núcleos tunelam através da repulsão coulombiana em temperaturas "baixas demais" classicamente</span></div>
          </div>
        </div>

        <div className="calc-section">
          <div className="calc-h2">5. Exemplo Numérico</div>
          <p className="calc-p">
            Elétron com E={E}eV incide sobre barreira V₀={V0}eV, largura a={(a * 1e9).toFixed(1)}nm:
          </p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">κ = √(2m(V₀−E))/ℏ ≈ {fmtSci(kappa)} m⁻¹</span><span className="step-desc">constante de decaimento dentro da barreira</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq">T ≈ e^(−2κa) ≈ {fmtSci(T)}</span><span className="step-desc">probabilidade de tunelamento — pequena, mas não nula</span></div>
          </div>
        </div>

      </div>
    </div>
  );
}
