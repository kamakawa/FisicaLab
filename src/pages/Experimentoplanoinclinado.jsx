// ExperimentoPlanoInclinado.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';

// ─── Paleta e CSS global (mesmo estilo do circular) ─────────────────────────
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Fira+Code:wght@400;500;600&family=Playfair+Display:ital,wght@0,700;1,400&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:       #07090f;
  --surface:  #0d1117;
  --panel:    #111827;
  --border:   rgba(255,255,255,0.07);
  --accent:   #60a5fa;
  --gold:     #fbbf24;
  --green:    #34d399;
  --red:      #f87171;
  --purple:   #a78bfa;
  --text:     #e2e8f0;
  --muted:    #64748b;
  --mono:     'Fira Code', monospace;
  --sans:     'Space Grotesk', sans-serif;
}

body { background: var(--bg); }

.app {
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  font-family: var(--sans);
  font-size: 14px;
}

.header {
  border-bottom: 1px solid var(--border);
  padding: 18px 32px;
  display: flex;
  align-items: baseline;
  gap: 20px;
  background: linear-gradient(90deg, rgba(96,165,250,0.06) 0%, transparent 60%);
}
.header-title {
  font-family: 'Playfair Display', serif;
  font-size: 26px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.5px;
}
.header-sub {
  font-size: 12px;
  color: var(--muted);
  letter-spacing: 0.15em;
  text-transform: uppercase;
}
.header-tag {
  margin-left: auto;
  font-size: 11px;
  color: var(--accent);
  border: 1px solid rgba(96,165,250,0.3);
  padding: 3px 10px;
  border-radius: 20px;
  font-family: var(--mono);
}

.tabs {
  display: flex;
  gap: 2px;
  padding: 12px 32px 0;
  border-bottom: 1px solid var(--border);
}
.tab {
  padding: 10px 20px;
  border: none;
  background: transparent;
  color: var(--muted);
  font-family: var(--sans);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: all 0.2s;
}
.tab:hover { color: var(--text); }
.tab.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}

.content {
  display: grid;
  grid-template-columns: 320px 1fr 280px;
  gap: 0;
  height: calc(100vh - 104px);
}

.sidebar-l, .sidebar-r {
  border-right: 1px solid var(--border);
  overflow-y: auto;
  padding: 20px;
  background: var(--panel);
}
.sidebar-r {
  border-right: none;
  border-left: 1px solid var(--border);
}

.main-area {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.canvas-wrap {
  flex: 1;
  position: relative;
  background: radial-gradient(ellipse at 50% 50%, #0f1829 0%, #07090f 80%);
  overflow: hidden;
}
canvas { display: block; width: 100%; height: 100%; }

.plots-strip {
  height: 160px;
  border-top: 1px solid var(--border);
  display: flex;
  background: var(--panel);
}
.plot-box {
  flex: 1;
  border-right: 1px solid var(--border);
  padding: 8px;
  position: relative;
}
.plot-box:last-child { border-right: none; }
.plot-title {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--muted);
  text-transform: uppercase;
  margin-bottom: 4px;
}
.plot-box canvas { border-radius: 4px; }

.section-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.18em;
  color: var(--muted);
  text-transform: uppercase;
  margin-bottom: 12px;
  margin-top: 20px;
}
.section-label:first-child { margin-top: 0; }

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 10px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 6px 0;
  border-bottom: 1px solid var(--border);
}
.stat-row:last-child { border-bottom: none; }
.stat-label { color: var(--muted); font-size: 12px; }
.stat-val {
  font-family: var(--mono);
  font-size: 13px;
  color: var(--text);
}
.stat-val.accent { color: var(--accent); }
.stat-val.gold   { color: var(--gold); }
.stat-val.green  { color: var(--green); }
.stat-val.red    { color: var(--red); }
.stat-val.purple { color: var(--purple); }

.ctrl {
  margin-bottom: 14px;
}
.ctrl-head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 12px;
}
.ctrl-name { color: var(--muted); }
.ctrl-num  { font-family: var(--mono); color: var(--accent); }
input[type=range] {
  width: 100%;
  accent-color: var(--accent);
  height: 3px;
  cursor: pointer;
}

.btn-row { display: flex; gap: 8px; margin-top: 12px; }
.btn {
  flex: 1;
  padding: 9px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: var(--sans);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  transition: all 0.15s;
}
.btn-primary {
  background: var(--accent);
  color: #07090f;
}
.btn-primary:hover { filter: brightness(1.15); }
.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn-secondary {
  background: rgba(255,255,255,0.06);
  color: var(--text);
  border: 1px solid var(--border);
}
.btn-secondary:hover { background: rgba(255,255,255,0.1); }
.btn-danger {
  background: rgba(248,113,113,0.15);
  color: var(--red);
  border: 1px solid rgba(248,113,113,0.2);
}
.btn-danger:hover { background: rgba(248,113,113,0.25); }

.toggle-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  cursor: pointer;
}
.toggle-row input[type=checkbox] {
  accent-color: var(--accent);
  width: 14px; height: 14px;
}
.toggle-label { font-size: 12px; color: var(--muted); }

.eq-block {
  background: var(--surface);
  border: 1px solid var(--border);
  border-left: 3px solid var(--accent);
  border-radius: 0 10px 10px 0;
  padding: 12px 14px;
  margin-bottom: 10px;
  font-family: var(--mono);
  font-size: 12px;
  line-height: 1.9;
  color: var(--text);
}
.eq-block .eq-title {
  font-family: var(--sans);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 8px;
}
.eq-block .sym { color: var(--gold); }
.eq-block .op  { color: var(--purple); }
.eq-block .cmt { color: var(--muted); }

.calc-page {
  padding: 32px;
  max-width: 900px;
  margin: 0 auto;
  overflow-y: auto;
  height: calc(100vh - 104px);
}
.calc-section {
  margin-bottom: 40px;
}
.calc-h2 {
  font-family: 'Playfair Display', serif;
  font-size: 22px;
  color: #fff;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border);
}
.calc-p {
  color: var(--muted);
  line-height: 1.7;
  margin-bottom: 14px;
  font-size: 13px;
}
.big-eq {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px 24px;
  margin: 16px 0;
  font-family: var(--mono);
  font-size: 14px;
  line-height: 2.2;
  color: var(--text);
}
.big-eq .hi-acc { color: var(--accent); }
.big-eq .hi-gld { color: var(--gold); }
.big-eq .hi-grn { color: var(--green); }
.big-eq .hi-red { color: var(--red); }
.big-eq .hi-pur { color: var(--purple); }
.big-eq .cmt    { color: var(--muted); font-style: italic; }
.derivation-step {
  display: flex;
  align-items: baseline;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
}
.derivation-step:last-child { border-bottom: none; }
.step-num {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--muted);
  min-width: 24px;
}
.step-eq { font-family: var(--mono); font-size: 13px; color: var(--text); }
.step-desc { font-size: 12px; color: var(--muted); margin-left: auto; font-style: italic; }
`;

const TAU = 2 * Math.PI;
const fmt = (n, d = 2) => n.toFixed(d);
const g = 9.8;

export default function ExperimentoPlanoInclinado() {
  const [tab, setTab] = useState('sim');

  return (
    <>
      <style>{STYLES}</style>
      <div className="app">
        <header className="header">
          <div>
            <div className="header-title">Plano Inclinado com Atrito</div>
            <div className="header-sub">Física I · Dinâmica · Leis de Newton</div>
          </div>
          <span className="header-tag">v2.0 · Interativo</span>
        </header>

        <nav className="tabs">
          {[
            ['sim', 'Simulação'],
            ['calc', 'Cálculo & Derivações'],
          ].map(([id, label]) => (
            <button
              key={id}
              className={`tab ${tab === id ? 'active' : ''}`}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </nav>

        {tab === 'sim' && <SimTab />}
        {tab === 'calc' && <CalcTab />}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ABA 1 — SIMULAÇÃO (Plano Inclinado com Atrito)
// ═══════════════════════════════════════════════════════════════════════════════
function SimTab() {
  const [angulo, setAngulo] = useState(25);
  const [massa, setMassa] = useState(2.0);
  const [muEstatico, setMuEstatico] = useState(0.35);
  const [muCinetico, setMuCinetico] = useState(0.25);
  const [posicao, setPosicao] = useState(0);
  const [velocidade, setVelocidade] = useState(0);
  const [rodando, setRodando] = useState(false);
  const [showVetores, setShowVetores] = useState(true);
  const [showTrail, setShowTrail] = useState(true);

  const canvasRef = useRef(null);
  const plotPosRef = useRef(null);
  const plotVelRef = useRef(null);
  const plotAccRef = useRef(null);
  const trailRef = useRef([]);
  const histRef = useRef({ pos: [], vel: [], acc: [], t: [] });
  const rafRef = useRef(null);
  const lastRef = useRef(null);

  const angRad = angulo * Math.PI / 180;
  const senθ = Math.sin(angRad);
  const cosθ = Math.cos(angRad);

  const Peso = massa * g;
  const PesoParalelo = Peso * senθ;
  const Normal = Peso * cosθ;
  const AtritoEstaticoMax = muEstatico * Normal;
  const AtritoCinetico = muCinetico * Normal;

  const estaEmRepouso = Math.abs(velocidade) < 0.01 && PesoParalelo <= AtritoEstaticoMax;
  const forcaResultante = estaEmRepouso ? 0 : PesoParalelo - Math.sign(velocidade) * AtritoCinetico;
  const aceleracao = forcaResultante / massa;

  const anguloCritico = Math.atan(muEstatico) * 180 / Math.PI;
  const comprimentoPlano = 8.0;

  const podeIniciar = PesoParalelo > AtritoEstaticoMax;

  const iniciarMovimento = () => {
    if (podeIniciar) {
      setRodando(true);
    }
  };

  // Animação
  useEffect(() => {
    if (!rodando) {
      lastRef.current = null;
      return;
    }

    const step = (now) => {
      if (lastRef.current !== null) {
        let dt = Math.min((now - lastRef.current) / 1000, 0.05);

        const P_paralelo = massa * g * senθ;
        const N = massa * g * cosθ;
        const F_atrito_max = muEstatico * N;
        const F_atrito_cin = muCinetico * N;

        let aAtual;
        if (Math.abs(velocidade) < 0.01 && P_paralelo <= F_atrito_max) {
          aAtual = 0;
        } else {
          const sinalVel = Math.sign(velocidade);
          const forcaResult = P_paralelo - sinalVel * F_atrito_cin;
          aAtual = forcaResult / massa;
        }

        const newVel = velocidade + aAtual * dt;
        let newPos = posicao + newVel * dt;

        if (newPos < 0) {
          newPos = 0;
          setVelocidade(0);
          setRodando(false);
          return;
        }
        if (newPos > comprimentoPlano) {
          newPos = comprimentoPlano;
          setVelocidade(0);
          setRodando(false);
          return;
        }

        setVelocidade(newVel);
        setPosicao(newPos);
      }
      lastRef.current = now;
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [rodando, massa, angulo, muEstatico, muCinetico, velocidade, posicao, senθ, cosθ]);

  const resetSimulacao = () => {
    setRodando(false);
    setPosicao(0);
    setVelocidade(0);
    trailRef.current = [];
    histRef.current = { pos: [], vel: [], acc: [], t: [] };
  };

  // Histórico
  useEffect(() => {
    const h = histRef.current;
    const aAtual = estaEmRepouso ? 0 : aceleracao;
    h.pos.push(posicao);
    h.vel.push(velocidade);
    h.acc.push(aAtual);
    if (h.pos.length > 400) {
      h.pos.shift(); h.vel.shift(); h.acc.shift();
    }
  }, [posicao, velocidade, estaEmRepouso, aceleracao]);

  // Trail
  useEffect(() => {
    if (!showTrail) { trailRef.current = []; return; }
    trailRef.current.push({ pos: posicao });
    if (trailRef.current.length > 150) trailRef.current.shift();
  }, [posicao, showTrail]);

  // Desenho do canvas com qualidade melhorada
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;

    ctx.clearRect(0, 0, W, H);

    // Configuração da perspectiva do plano
    const margemEsq = W * 0.12;
    const margemDir = W * 0.88;
    const topoY = H * 0.18;
    const baseY = H * 0.88;

    const x1 = margemEsq;
    const y1 = topoY;
    const x2 = margemDir;
    const y2 = baseY;
    const dxVis = x2 - x1;
    const dyVis = y2 - y1;
    const anguloVis = Math.atan2(-dyVis, dxVis);
    const tBloco = posicao / comprimentoPlano;
    const blocoX = x1 + tBloco * dxVis;
    const blocoY = y1 + tBloco * dyVis;

    // ─── Desenho do plano inclinado (3D falso) ───
    // Face superior do plano
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x2 + 12, y2 + 8);
    ctx.lineTo(x1 + 12, y1 + 8);
    ctx.closePath();
    ctx.fillStyle = '#2a3a4a';
    ctx.fill();
    ctx.strokeStyle = '#4a6a7a';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Face lateral (profundidade)
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 + 12, y2 + 8);
    ctx.lineTo(x1 + 12, y1 + 8);
    ctx.lineTo(x1, y1);
    ctx.closePath();
    ctx.fillStyle = '#1a2a35';
    ctx.fill();
    ctx.stroke();

    // Superfície principal com textura
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x1, y1);
    ctx.fillStyle = '#3a5a6a';
    ctx.fill();

    // Linhas de textura do plano (estilo grid)
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 0.8;
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      const lx = x1 + t * dxVis;
      const ly = y1 + t * dyVis;
      ctx.beginPath();
      ctx.moveTo(lx - 15, ly + 3);
      ctx.lineTo(lx + 15, ly + 3);
      ctx.stroke();
    }

    // Borda superior do plano (linha de destaque)
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = '#7ab8d0';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Trail (rastro com efeito de brilho)
    if (showTrail && trailRef.current.length > 1) {
      for (let i = 1; i < trailRef.current.length; i++) {
        const t1 = trailRef.current[i - 1].pos / comprimentoPlano;
        const t2 = trailRef.current[i].pos / comprimentoPlano;
        const xa = x1 + t1 * dxVis;
        const ya = y1 + t1 * dyVis;
        const xb = x1 + t2 * dxVis;
        const yb = y1 + t2 * dyVis;
        const alpha = Math.min(0.7, i / trailRef.current.length);
        ctx.beginPath();
        ctx.moveTo(xa, ya - 8);
        ctx.lineTo(xb, yb - 8);
        ctx.strokeStyle = `rgba(96,165,250,${alpha * 0.5})`;
        ctx.lineWidth = 4;
        ctx.stroke();
        // Brilho central
        ctx.beginPath();
        ctx.moveTo(xa, ya - 8);
        ctx.lineTo(xb, yb - 8);
        ctx.strokeStyle = `rgba(150,200,255,${alpha * 0.3})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    // ─── Vetores de força (melhorados) ───
    if (showVetores) {
      const escala = 0.065;
      const cxBloco = blocoX;
      const cyBloco = blocoY - 10;

      const desenhaVetor = (x, y, fx, fy, cor, label, lineWidth = 2.5) => {
        const mag = Math.hypot(fx, fy);
        if (mag < 0.3) return;
        const ang = Math.atan2(fy, fx);
        const comp = Math.min(mag * escala, 70);
        const xf = x + Math.cos(ang) * comp;
        const yf = y + Math.sin(ang) * comp;

        // Sombra do vetor
        ctx.shadowBlur = 4;
        ctx.shadowColor = 'rgba(0,0,0,0.3)';

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(xf, yf);
        ctx.strokeStyle = cor;
        ctx.lineWidth = lineWidth;
        ctx.stroke();

        // Ponta da seta (melhorada)
        const hs = 8;
        const ang1 = ang + Math.PI * 0.85;
        const ang2 = ang - Math.PI * 0.85;
        ctx.beginPath();
        ctx.moveTo(xf, yf);
        ctx.lineTo(xf + Math.cos(ang1) * hs, yf + Math.sin(ang1) * hs);
        ctx.lineTo(xf + Math.cos(ang2) * hs, yf + Math.sin(ang2) * hs);
        ctx.fillStyle = cor;
        ctx.fill();

        // Label com fundo semi-transparente
        ctx.shadowBlur = 0;
        ctx.font = 'bold 10px Fira Code';
        ctx.fillStyle = cor;
        ctx.shadowBlur = 2;
        ctx.fillText(label, xf + 6, yf - 4);
        ctx.shadowBlur = 0;
      };

      // Peso (vertical)
      desenhaVetor(cxBloco, cyBloco, 0, Peso, '#f87171', `P = ${fmt(Peso)}N`, 2.5);

      // Normal (perpendicular ao plano)
      const angNormal = anguloVis - Math.PI / 2;
      desenhaVetor(cxBloco, cyBloco, Math.cos(angNormal) * Normal, Math.sin(angNormal) * Normal, '#60a5fa', `N = ${fmt(Normal)}N`, 2.5);

      // Atrito (paralelo ao plano, oposto ao movimento)
      if (!estaEmRepouso && Math.abs(velocidade) > 0.01) {
        const sinalAtrito = velocidade >= 0 ? -1 : 1;
        const atritoX = Math.cos(anguloVis) * sinalAtrito * AtritoCinetico;
        const atritoY = Math.sin(anguloVis) * sinalAtrito * AtritoCinetico;
        desenhaVetor(cxBloco, cyBloco, atritoX, atritoY, '#a78bfa', `f = ${fmt(AtritoCinetico)}N`, 2.5);
      } else if (PesoParalelo > AtritoEstaticoMax && estaEmRepouso) {
        // Atrito estático máximo (prestes a deslizar)
        const sinalAtrito = 1;
        const atritoX = -Math.cos(anguloVis) * sinalAtrito * AtritoEstaticoMax;
        const atritoY = -Math.sin(anguloVis) * sinalAtrito * AtritoEstaticoMax;
        desenhaVetor(cxBloco, cyBloco, atritoX, atritoY, '#a78bfa', `fₑ = ${fmt(AtritoEstaticoMax)}N`, 2.5);
      }

      // Força resultante (apenas quando em movimento)
      if (!estaEmRepouso && Math.abs(forcaResultante) > 0.05) {
        const angResultante = forcaResultante >= 0 ? anguloVis : anguloVis + Math.PI;
        const rx = Math.cos(angResultante) * Math.abs(forcaResultante);
        const ry = Math.sin(angResultante) * Math.abs(forcaResultante);
        desenhaVetor(cxBloco, cyBloco, rx, ry, '#34d399', `Fᵣ = ${fmt(Math.abs(forcaResultante))}N`, 3);
      }
    }

    // ─── Bloco (cubo 3D com qualidade melhorada) ───
    const blocow = 32;
    const blocoh = 28;
    const blocoXc = blocoX - blocow / 2;
    const blocoYc = blocoY - blocoh - 4;

    // Sombra do bloco
    ctx.shadowBlur = 8;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';

    // Face frontal
    ctx.fillStyle = '#e55a5a';
    ctx.fillRect(blocoXc, blocoYc, blocow, blocoh);
    // Face superior (efeito 3D)
    ctx.fillStyle = '#ff7a7a';
    ctx.beginPath();
    ctx.moveTo(blocoXc, blocoYc);
    ctx.lineTo(blocoXc + blocow, blocoYc);
    ctx.lineTo(blocoXc + blocow - 6, blocoYc - 8);
    ctx.lineTo(blocoXc - 6, blocoYc - 8);
    ctx.fill();
    // Face lateral direita
    ctx.fillStyle = '#b54545';
    ctx.beginPath();
    ctx.moveTo(blocoXc + blocow, blocoYc);
    ctx.lineTo(blocoXc + blocow, blocoYc + blocoh);
    ctx.lineTo(blocoXc + blocow - 6, blocoYc + blocoh - 8);
    ctx.lineTo(blocoXc + blocow - 6, blocoYc - 8);
    ctx.fill();

    // Detalhes do bloco (linhas de borda)
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1;
    ctx.strokeRect(blocoXc, blocoYc, blocow, blocoh);

    // Textura/metais do bloco
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(blocoXc + 4, blocoYc + 4, blocow - 8, 3);
    ctx.fillRect(blocoXc + 4, blocoYc + 10, blocow - 8, 2);

    // Texto da massa dentro do bloco
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px Fira Code';
    ctx.textAlign = 'center';
    ctx.shadowBlur = 2;
    ctx.fillText(`${fmt(massa)} kg`, blocoX, blocoYc + 18);
    ctx.textAlign = 'left';
    ctx.shadowBlur = 0;

    // ─── Informações geométricas ───
    ctx.fillStyle = 'rgba(251,191,36,0.9)';
    ctx.font = 'bold 11px Fira Code';
    ctx.fillText(`θ = ${fmt(angulo)}°`, x1 + 15, y1 - 12);

    // Indicador de estado
    ctx.font = '10px Fira Code';
    if (PesoParalelo > AtritoEstaticoMax) {
      ctx.fillStyle = 'rgba(52,211,153,0.9)';
      ctx.fillText('⚡ DESLIZANDO', x1 + 15, y1 + 18);
    } else {
      ctx.fillStyle = 'rgba(100,116,139,0.9)';
      ctx.fillText('● EM REPOUSO', x1 + 15, y1 + 18);
    }

    // Ângulo crítico
    if (angulo >= anguloCritico - 5 && angulo < anguloCritico) {
      ctx.fillStyle = 'rgba(251,191,36,0.7)';
      ctx.font = '9px Fira Code';
      ctx.fillText(`θ crítico = ${fmt(anguloCritico, 1)}°`, x1 + 15, y1 + 32);
    }

    // Informações de tempo/posição/velocidade
    ctx.fillStyle = 'rgba(100,116,139,0.9)';
    ctx.font = '10px Fira Code';
    ctx.fillText(`s = ${fmt(posicao, 2)} m`, 12, H - 20);
    ctx.fillText(`v = ${fmt(velocidade, 2)} m/s`, 12, H - 36);
    ctx.fillStyle = 'rgba(96,165,250,0.7)';
    ctx.fillText(`a = ${fmt(estaEmRepouso ? 0 : aceleracao, 3)} m/s²`, 12, H - 52);

  }, [angulo, massa, posicao, velocidade, Peso, Normal, AtritoCinetico, AtritoEstaticoMax, 
      estaEmRepouso, PesoParalelo, forcaResultante, aceleracao, showVetores, showTrail, trailRef, anguloCritico]);

  // Gráficos
  const drawPlot = useCallback((ref, data, color, label, yMin, yMax, unidade = '') => {
    const canvas = ref.current;
    if (!canvas || !data || data.length < 2) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;
    ctx.clearRect(0, 0, W, H);

    // Eixos
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, H/2); ctx.lineTo(W, H/2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, H*0.25); ctx.lineTo(W, H*0.25); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, H*0.75); ctx.lineTo(W, H*0.75); ctx.stroke();

    // Curva com gradiente de cor
    const range = (yMax - yMin) || 1;
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = (i / (data.length - 1)) * W;
      const y = H - ((v - yMin) / range) * H;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Área sob a curva (efeito de preenchimento suave)
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = (i / (data.length - 1)) * W;
      const y = H - ((v - yMin) / range) * H;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fillStyle = `${color}15`;
    ctx.fill();

    // Label e valor atual
    ctx.fillStyle = color;
    ctx.font = 'bold 10px Fira Code';
    ctx.fillText(label, 6, 14);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '10px Fira Code';
    const ultimoValor = data[data.length - 1];
    ctx.fillText(`${fmt(ultimoValor, 2)} ${unidade}`, 6, 28);
  }, []);

  useEffect(() => {
    const h = histRef.current;
    drawPlot(plotPosRef, h.pos, '#60a5fa', 's(t) posição', 0, comprimentoPlano, 'm');
    drawPlot(plotVelRef, h.vel, '#34d399', 'v(t) velocidade', -3, 8, 'm/s');
    drawPlot(plotAccRef, h.acc, '#f87171', 'a(t) aceleração', -2, 6, 'm/s²');
  }, [posicao, velocidade, drawPlot]);

  return (
    <div className="content">
      <div className="sidebar-l">
        <div className="section-label">Parâmetros</div>

        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Ângulo θ</span><span className="ctrl-num">{fmt(angulo, 1)}°</span></div>
          <input type="range" min="0" max="70" step="0.5" value={angulo} onChange={e => setAngulo(+e.target.value)} />
        </div>

        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Massa m</span><span className="ctrl-num">{fmt(massa, 1)} kg</span></div>
          <input type="range" min="0.5" max="10" step="0.1" value={massa} onChange={e => setMassa(+e.target.value)} />
        </div>

        <div className="section-label">Atrito</div>

        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">μₑ (estático)</span><span className="ctrl-num">{fmt(muEstatico, 3)}</span></div>
          <input type="range" min="0" max="1.2" step="0.01" value={muEstatico} onChange={e => setMuEstatico(+e.target.value)} />
        </div>

        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">μ꜀ (cinético)</span><span className="ctrl-num">{fmt(muCinetico, 3)}</span></div>
          <input type="range" min="0" max="1.2" step="0.01" value={muCinetico} onChange={e => setMuCinetico(+e.target.value)} />
        </div>

        <div className="section-label">Visualização</div>

        <label className="toggle-row">
          <input type="checkbox" checked={showVetores} onChange={e => setShowVetores(e.target.checked)} />
          <span className="toggle-label" style={{ color: '#a78bfa' }}>Mostrar vetores de força</span>
        </label>

        <label className="toggle-row">
          <input type="checkbox" checked={showTrail} onChange={e => setShowTrail(e.target.checked)} />
          <span className="toggle-label" style={{ color: '#60a5fa' }}>Rastro da partícula</span>
        </label>

        <div className="btn-row">
          <button className="btn btn-primary" onClick={iniciarMovimento} disabled={!podeIniciar}>
            ▶ Iniciar
          </button>
          <button className="btn btn-secondary" onClick={() => setRodando(false)}>⏸ Pausar</button>
        </div>
        <div className="btn-row">
          <button className="btn btn-danger" onClick={resetSimulacao}>↩ Reset</button>
        </div>
      </div>

      <div className="main-area">
        <div className="canvas-wrap">
          <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
        </div>
        <div className="plots-strip">
          <div className="plot-box"><div className="plot-title">Posição s(t)</div><canvas ref={plotPosRef} style={{ width: '100%', height: '120px' }} /></div>
          <div className="plot-box"><div className="plot-title">Velocidade v(t)</div><canvas ref={plotVelRef} style={{ width: '100%', height: '120px' }} /></div>
          <div className="plot-box"><div className="plot-title">Aceleração a(t)</div><canvas ref={plotAccRef} style={{ width: '100%', height: '120px' }} /></div>
        </div>
      </div>

      <div className="sidebar-r">
        <div className="section-label">Grandezas Calculadas</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">Peso P</span><span className="stat-val accent">{fmt(Peso)} N</span></div>
          <div className="stat-row"><span className="stat-label">Componente paralela P∥</span><span className="stat-val gold">{fmt(PesoParalelo)} N</span></div>
          <div className="stat-row"><span className="stat-label">Força Normal N</span><span className="stat-val">{fmt(Normal)} N</span></div>
          <div className="stat-row"><span className="stat-label">Atrito estático máx</span><span className="stat-val purple">{fmt(AtritoEstaticoMax)} N</span></div>
          <div className="stat-row"><span className="stat-label">Atrito cinético</span><span className="stat-val purple">{fmt(AtritoCinetico)} N</span></div>
          <div className="stat-row"><span className="stat-label">Força Resultante</span><span className="stat-val green">{fmt(Math.abs(forcaResultante), 2)} N</span></div>
          <div className="stat-row"><span className="stat-label">Aceleração a</span><span className="stat-val red">{fmt(estaEmRepouso ? 0 : aceleracao, 3)} m/s²</span></div>
        </div>

        <div className="section-label">Condições de Deslizamento</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">Ângulo crítico θ꜀</span><span className="stat-val gold">{fmt(anguloCritico, 1)}°</span></div>
          <div className="stat-row"><span className="stat-label">Status</span><span className={`stat-val ${PesoParalelo > AtritoEstaticoMax ? 'green' : 'red'}`}>
            {PesoParalelo > AtritoEstaticoMax ? '🔴 Deslizando' : '🟢 Em repouso'}
          </span></div>
          <div className="stat-row"><span className="stat-label">Energia Cinética</span><span className="stat-val accent">{fmt(0.5 * massa * velocidade * velocidade)} J</span></div>
        </div>

        <div className="section-label">Equações Fundamentais</div>

        <div className="eq-block">
          <div className="eq-title">Componentes do Peso</div>
          <span className="sym">P∥</span> <span className="op">=</span> m·g·<span className="sym">sen</span>θ<br />
          <span className="sym">P⊥</span> <span className="op">=</span> m·g·<span className="sym">cos</span>θ
        </div>

        <div className="eq-block">
          <div className="eq-title">Força de Atrito</div>
          fₑₘₐₓ <span className="op">=</span> μₑ·N <span className="op">=</span> μₑ·m·g·<span className="sym">cos</span>θ<br />
          f꜀ <span className="op">=</span> μ꜀·N<br />
          <span className="cmt">Desliza se: P∥ &gt; fₑₘₐₓ</span>
        </div>

        <div className="eq-block">
          <div className="eq-title">2ª Lei de Newton</div>
          Fᵣ <span className="op">=</span> m·a<br />
          a <span className="op">=</span> g·(<span className="sym">sen</span>θ − μ꜀·<span className="sym">cos</span>θ)
        </div>

        <div className="eq-block">
          <div className="eq-title">Ângulo Crítico</div>
          θ꜀ <span className="op">=</span> <span className="sym">arctan</span>(μₑ)
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ABA 2 — CÁLCULO & DERIVAÇÕES (Teoria completa)
// ═══════════════════════════════════════════════════════════════════════════════
function CalcTab() {
  return (
    <div className="calc-page">
      {/* ── 1. Decomposição do Peso ── */}
      <div className="calc-section">
        <div className="calc-h2">1. Decomposição da Força Peso no Plano Inclinado</div>
        <p className="calc-p">
          Uma partícula de massa <em>m</em> sobre um plano inclinado de ângulo <em>θ</em> sofre a ação da gravidade.
          O vetor peso <span className="hi-red">P⃗</span> = m·<span className="hi-red">g⃗</span> pode ser decomposto em duas componentes:
        </p>
        <div className="big-eq">
          <div className="derivation-step"><span className="step-num">①</span><span className="step-eq"><span className="hi-grn">P∥</span> = m·g·<span className="hi-gld">sen</span>θ</span><span className="step-desc">componente paralela ao plano</span></div>
          <div className="derivation-step"><span className="step-num">②</span><span className="step-eq"><span className="hi-pur">P⊥</span> = m·g·<span className="hi-gld">cos</span>θ</span><span className="step-desc">componente perpendicular ao plano</span></div>
        </div>
        <p className="calc-p">
          A componente perpendicular é equilibrada pela força normal <em>N</em> que o plano exerce sobre o corpo:
          <span className="hi-acc"> N = P⊥ = m·g·cosθ</span>.
        </p>
      </div>

      {/* ── 2. Força de Atrito ── */}
      <div className="calc-section">
        <div className="calc-h2">2. Força de Atrito</div>
        <p className="calc-p">
          A força de atrito surge da interação entre as superfícies em contato. Experimentalmente, verifica-se que:
        </p>
        <div className="big-eq">
          <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">fₑₘₐₓ = μₑ·N</span><span className="step-desc">atrito estático máximo</span></div>
          <div className="derivation-step"><span className="step-num">②</span><span className="step-eq">f꜀ = μ꜀·N</span><span className="step-desc">atrito cinético (dinâmico)</span></div>
        </div>
        <p className="calc-p">
          Onde <em>μₑ</em> e <em>μ꜀</em> são os coeficientes de atrito estático e cinético, respectivamente.
          Para a maioria dos materiais, <em>μₑ &gt; μ꜀</em>, o que explica porque é mais difícil iniciar o movimento do que mantê-lo.
        </p>
      </div>

      {/* ── 3. Condição de Deslizamento ── */}
      <div className="calc-section">
        <div className="calc-h2">3. Condição para o Corpo Entrar em Movimento</div>
        <p className="calc-p">
          O corpo permanece em repouso enquanto a componente paralela do peso não superar o atrito estático máximo:
        </p>
        <div className="big-eq">
          m·g·<span className="hi-gld">sen</span>θ ≤ μₑ·m·g·<span className="hi-gld">cos</span>θ
        </div>
        <p className="calc-p">
          Cancelando os termos comuns, obtemos a condição para o ângulo crítico:
        </p>
        <div className="big-eq">
          <span className="hi-gld">tan</span>θ꜀ = μₑ &nbsp;&nbsp;→&nbsp;&nbsp; θ꜀ = <span className="hi-pur">arctan</span>(μₑ)
        </div>
        <p className="calc-p">
          Para ângulos <em>θ &lt; θ꜀</em>, o corpo permanece em repouso. Para <em>θ &gt; θ꜀</em>, o corpo começa a deslizar.
        </p>
      </div>

      {/* ── 4. Aceleração do Corpo em Movimento ── */}
      <div className="calc-section">
        <div className="calc-h2">4. Dinâmica do Movimento (2ª Lei de Newton)</div>
        <p className="calc-p">
          Quando o corpo está deslizando, a força resultante na direção paralela ao plano é:
        </p>
        <div className="big-eq">
          Fᵣ = P∥ − f꜀ = m·g·<span className="hi-gld">sen</span>θ − μ꜀·m·g·<span className="hi-gld">cos</span>θ
        </div>
        <p className="calc-p">
          Pela 2ª Lei de Newton (<span className="hi-acc">F⃗ = m·a⃗</span>), temos:
        </p>
        <div className="big-eq">
          <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">m·a = m·g·senθ − μ꜀·m·g·cosθ</span><span className="step-desc">substituindo as forças</span></div>
          <div className="derivation-step"><span className="step-num">②</span><span className="step-eq">a = g·(senθ − μ꜀·cosθ)</span><span className="step-desc">cancelando a massa m</span></div>
        </div>
        <p className="calc-p">
          Observe que <strong>a aceleração independe da massa</strong> do corpo! Isso é análogo à queda livre,
          onde todos os corpos caem com a mesma aceleração (desprezando resistência do ar).
        </p>
      </div>

      {/* ── 5. Equações Horárias do Movimento ── */}
      <div className="calc-section">
        <div className="calc-h2">5. Equações Horárias (Cinemática com Aceleração Constante)</div>
        <p className="calc-p">
          Quando a aceleração é constante (θ e μ꜀ fixos), podemos integrar para obter a velocidade e a posição em função do tempo:
        </p>
        <div className="big-eq">
          <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">a(t) = <span className="hi-red">constante</span> = g·(senθ − μ꜀·cosθ)</span><span className="step-desc">aceleração constante</span></div>
          <div className="derivation-step"><span className="step-num">②</span><span className="step-eq">v(t) = <span className="hi-pur">∫</span> a dt = v₀ + a·t</span><span className="step-desc">velocidade por integração</span></div>
          <div className="derivation-step"><span className="step-num">③</span><span className="step-eq">s(t) = <span className="hi-pur">∫</span> v dt = s₀ + v₀·t + ½·a·t²</span><span className="step-desc">posição por integração</span></div>
        </div>
        <p className="calc-p">
          Se o corpo parte do repouso (v₀ = 0) e da origem (s₀ = 0), as equações se simplificam:
        </p>
        <div className="big-eq">
          v(t) = a·t &nbsp;&nbsp; e &nbsp;&nbsp; s(t) = ½·a·t²
        </div>
      </div>

      {/* ── 6. Conservação da Energia ── */}
      <div className="calc-section">
        <div className="calc-h2">6. Conservação da Energia e Dissipação por Atrito</div>
        <p className="calc-p">
          Em um plano inclinado com atrito, a energia mecânica <strong>não se conserva</strong>.
          Parte da energia potencial gravitacional é convertida em calor devido ao atrito.
        </p>
        <div className="big-eq">
          <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">Eₚ(top) = m·g·h = m·g·L·senθ</span><span className="step-desc">energia potencial no topo</span></div>
          <div className="derivation-step"><span className="step-num">②</span><span className="step-eq">E꜀(base) = ½·m·v²</span><span className="step-desc">energia cinética na base</span></div>
          <div className="derivation-step"><span className="step-num">③</span><span className="step-eq">W_atrito = <span className="hi-pur">∫</span> f꜀·dx = μ꜀·m·g·cosθ·L</span><span className="step-desc">trabalho da força de atrito</span></div>
          <div className="derivation-step"><span className="step-num">④</span><span className="step-eq">Eₚ(top) = E꜀(base) + W_atrito</span><span className="step-desc">conservação da energia total</span></div>
        </div>
        <p className="calc-p">
          Portanto, a velocidade final na base do plano é menor do que seria sem atrito:
        </p>
        <div className="big-eq">
          v = √[2gL·(senθ − μ꜀·cosθ)]
        </div>
      </div>

      {/* ── 7. Exemplo Numérico ── */}
      <div className="calc-section">
        <div className="calc-h2">7. Exemplo Numérico Completo</div>
        <p className="calc-p">
          Considere um bloco de massa <em>m = 2 kg</em> em um plano inclinado de <em>θ = 30°</em> com <em>μₑ = 0,4</em> e <em>μ꜀ = 0,3</em>.
        </p>
        <div className="big-eq">
          <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">P∥ = 2·9,8·sen30° = 9,8 N</span><span className="step-desc">componente paralela</span></div>
          <div className="derivation-step"><span className="step-num">②</span><span className="step-eq">N = 2·9,8·cos30° = 16,97 N</span><span className="step-desc">força normal</span></div>
          <div className="derivation-step"><span className="step-num">③</span><span className="step-eq">fₑₘₐₓ = 0,4·16,97 = 6,79 N</span><span className="step-desc">atrito estático máximo</span></div>
          <div className="derivation-step"><span className="step-num">④</span><span className="step-eq">Como P∥ (= 9,8 N) &gt; fₑₘₐₓ (= 6,79 N) → <span className="hi-grn">desliza!</span></span><span className="step-desc">condição de movimento</span></div>
          <div className="derivation-step"><span className="step-num">⑤</span><span className="step-eq">a = 9,8·(sen30° − 0,3·cos30°) = 9,8·(0,5 − 0,2598) = 2,35 m/s²</span><span className="step-desc">aceleração do bloco</span></div>
        </div>
      </div>
    </div>
  );
}