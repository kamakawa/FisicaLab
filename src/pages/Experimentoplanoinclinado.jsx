// ExperimentoPlanoInclinado.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';

// ─── Estilos (seguindo o padrão dos seus experimentos) ─────────────────────
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Fira+Code:wght@400;500;600&family=Playfair+Display:ital,wght@0,700;1,400&display=swap');

.plano-container {
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  font-family: var(--sans);
  font-size: 14px;
}

/* Layout grid */
.plano-content {
  display: grid;
  grid-template-columns: 320px 1fr 280px;
  gap: 0;
  height: calc(100vh - 104px);
}

.plano-sidebar-l, .plano-sidebar-r {
  border-right: 1px solid var(--border);
  overflow-y: auto;
  padding: 20px;
  background: var(--panel);
}
.plano-sidebar-r {
  border-right: none;
  border-left: 1px solid var(--border);
}

.plano-main-area {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.plano-canvas-wrap {
  flex: 1;
  position: relative;
  background: radial-gradient(ellipse at 50% 50%, #0f1829 0%, #07090f 80%);
  overflow: hidden;
}

.plano-canvas-wrap canvas {
  display: block;
  width: 100%;
  height: 100%;
}

/* Plots strip */
.plano-plots-strip {
  height: 160px;
  border-top: 1px solid var(--border);
  display: flex;
  background: var(--panel);
}

.plano-plot-box {
  flex: 1;
  border-right: 1px solid var(--border);
  padding: 8px;
  position: relative;
}
.plano-plot-box:last-child { border-right: none; }
.plano-plot-title {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--muted);
  text-transform: uppercase;
  margin-bottom: 4px;
}
.plano-plot-box canvas { border-radius: 4px; }

/* Controles e cards (reutilizando os estilos existentes) */
.plano-section-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.18em;
  color: var(--muted);
  text-transform: uppercase;
  margin-bottom: 12px;
  margin-top: 20px;
}
.plano-section-label:first-child { margin-top: 0; }

.plano-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 10px;
}

.plano-stat-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 6px 0;
  border-bottom: 1px solid var(--border);
}
.plano-stat-row:last-child { border-bottom: none; }
.plano-stat-label { color: var(--muted); font-size: 12px; }
.plano-stat-val {
  font-family: var(--mono);
  font-size: 13px;
  color: var(--text);
}
.plano-stat-val.accent { color: var(--accent); }
.plano-stat-val.gold   { color: var(--gold); }
.plano-stat-val.green  { color: var(--green); }
.plano-stat-val.red    { color: var(--red); }
.plano-stat-val.purple { color: var(--purple); }

.plano-ctrl {
  margin-bottom: 14px;
}
.plano-ctrl-head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 12px;
}
.plano-ctrl-name { color: var(--muted); }
.plano-ctrl-num  { font-family: var(--mono); color: var(--accent); }

.plano-btn-row { display: flex; gap: 8px; margin-top: 12px; }
.plano-btn {
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
.plano-btn-primary {
  background: var(--accent);
  color: #07090f;
}
.plano-btn-primary:hover { filter: brightness(1.15); }
.plano-btn-secondary {
  background: rgba(255,255,255,0.06);
  color: var(--text);
  border: 1px solid var(--border);
}
.plano-btn-secondary:hover { background: rgba(255,255,255,0.1); }
.plano-btn-danger {
  background: rgba(248,113,113,0.15);
  color: var(--red);
  border: 1px solid rgba(248,113,113,0.2);
}
.plano-btn-danger:hover { background: rgba(248,113,113,0.25); }

.plano-toggle-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  cursor: pointer;
}
.plano-toggle-row input[type=checkbox] {
  accent-color: var(--accent);
  width: 14px; height: 14px;
}
.plano-toggle-label { font-size: 12px; color: var(--muted); }

.plano-eq-block {
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
.plano-eq-title {
  font-family: var(--sans);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 8px;
}
.plano-eq-block .sym { color: var(--gold); }
.plano-eq-block .op  { color: var(--purple); }
.plano-eq-block .cmt { color: var(--muted); }
`;

const TAU = 2 * Math.PI;
const fmt = (n, d = 2) => n.toFixed(d);
const g = 9.8;

export default function ExperimentoPlanoInclinado({ onBack }) {
  // ─── Parâmetros do experimento ──────────────────────────────────────────
  const [angulo, setAngulo] = useState(25);        // graus
  const [massa, setMassa] = useState(2.0);         // kg
  const [muEstatico, setMuEstatico] = useState(0.35);
  const [muCinetico, setMuCinetico] = useState(0.25);
  const [posicao, setPosicao] = useState(0);        // posição ao longo do plano (m)
  const [velocidade, setVelocidade] = useState(0);
  const [rodando, setRodando] = useState(true);
  const [showVetores, setShowVetores] = useState(true);
  const [showTrail, setShowTrail] = useState(true);
  const [resetKey, setResetKey] = useState(0);

  // Refs
  const canvasRef = useRef(null);
  const plotPosRef = useRef(null);
  const plotVelRef = useRef(null);
  const plotAccRef = useRef(null);
  const trailRef = useRef([]);
  const histRef = useRef({ pos: [], vel: [], acc: [], t: [] });
  const rafRef = useRef(null);
  const lastRef = useRef(null);

  // ─── Grandezas calculadas ──────────────────────────────────────────────
  const angRad = angulo * Math.PI / 180;
  const senθ = Math.sin(angRad);
  const cosθ = Math.cos(angRad);

  const Peso = massa * g;
  const PesoParalelo = Peso * senθ;
  const Normal = Peso * cosθ;
  const AtritoEstaticoMax = muEstatico * Normal;
  const AtritoCinetico = muCinetico * Normal;

  // Determina se o bloco está em repouso ou movimento
  const estaEmRepouso = Math.abs(velocidade) < 0.01 && PesoParalelo <= AtritoEstaticoMax;
  const forcaResultante = estaEmRepouso ? 0 : PesoParalelo - Math.sign(velocidade) * AtritoCinetico;
  const aceleracao = forcaResultante / massa;

  // Aceleração teórica (para exibição)
  const aTeorica = (senθ - muCinetico * cosθ) * g;
  const anguloCritico = Math.atan(muEstatico) * 180 / Math.PI;
  const estaDeslizando = PesoParalelo > AtritoEstaticoMax;

  // Energias
  const Ec = 0.5 * massa * velocidade * velocidade;
  const Ep = massa * g * (posicao * senθ); // altura em relação ao ponto mais baixo

  // ─── Lógica de animação (física realista) ─────────────────────────────
  useEffect(() => {
    if (!rodando) {
      lastRef.current = null;
      return;
    }

    const step = (now) => {
      if (lastRef.current !== null) {
        let dt = Math.min((now - lastRef.current) / 1000, 0.05);

        // Determina a aceleração atual baseada no estado
        let aAtual;
        const P_paralelo = massa * g * senθ;
        const N = massa * g * cosθ;
        const F_atrito_max = muEstatico * N;
        const F_atrito_cin = muCinetico * N;

        if (Math.abs(velocidade) < 0.01 && P_paralelo <= F_atrito_max) {
          aAtual = 0;
        } else {
          const sinalVel = Math.sign(velocidade);
          const forcaResult = P_paralelo - sinalVel * F_atrito_cin;
          aAtual = forcaResult / massa;
        }

        // Euler integração
        const newVel = velocidade + aAtual * dt;
        let newPos = posicao + newVel * dt;

        // Limites do plano (comprimento fixo de 8m para visualização)
        const comprimentoMax = 8.0;
        if (newPos < 0) {
          newPos = 0;
          setVelocidade(0);
          return;
        }
        if (newPos > comprimentoMax) {
          newPos = comprimentoMax;
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

  // ─── Reset da simulação ────────────────────────────────────────────────
  const resetSimulacao = useCallback(() => {
    setPosicao(0);
    setVelocidade(0);
    setRodando(true);
    trailRef.current = [];
    histRef.current = { pos: [], vel: [], acc: [], t: [] };
    setResetKey(k => k + 1);
  }, []);

  // ─── Histórico para gráficos ───────────────────────────────────────────
  useEffect(() => {
    const h = histRef.current;
    const aAtual = estaEmRepouso ? 0 : aceleracao;

    h.pos.push(posicao);
    h.vel.push(velocidade);
    h.acc.push(aAtual);
    h.t.push(Date.now() / 1000);

    const MAX = 400;
    if (h.pos.length > MAX) {
      h.pos.shift(); h.vel.shift(); h.acc.shift(); h.t.shift();
    }
  }, [posicao, velocidade, estaEmRepouso, aceleracao]);

  // ─── Trail (rastro) ────────────────────────────────────────────────────
  useEffect(() => {
    if (!showTrail) {
      trailRef.current = [];
      return;
    }
    trailRef.current.push({ pos: posicao, t: Date.now() / 1000 });
    if (trailRef.current.length > 150) trailRef.current.shift();
  }, [posicao, showTrail]);

  // ─── Desenho do canvas (plano inclinado) ───────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;

    ctx.clearRect(0, 0, W, H);

    // Configuração da perspectiva do plano
    const margemEsq = W * 0.15;
    const margemDir = W * 0.85;
    const topoY = H * 0.2;
    const baseY = H * 0.85;

    const comprimentoPlano = 8.0; // metros
    const x1 = margemEsq;
    const y1 = topoY;
    const x2 = margemDir;
    const y2 = baseY;

    // Calcula o ângulo visual do plano
    const dxVis = x2 - x1;
    const dyVis = y2 - y1;
    const anguloVis = Math.atan2(-dyVis, dxVis);
    const comprimentoVis = Math.hypot(dxVis, dyVis);

    // Posição do bloco ao longo do plano
    const tBloco = posicao / comprimentoPlano;
    const blocoX = x1 + tBloco * dxVis;
    const blocoY = y1 + tBloco * dyVis;

    // Desenha o plano (superfície inclinada)
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x2, y2 + 8);
    ctx.lineTo(x1, y1 + 8);
    ctx.closePath();
    ctx.fillStyle = '#2d3748';
    ctx.fill();
    ctx.strokeStyle = '#4a5568';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Linha de borda do plano
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = '#718096';
    ctx.stroke();

    // Textura do plano (linhas horizontais)
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 10; i++) {
      const tLinha = i / 10;
      const lx = x1 + tLinha * dxVis;
      const ly = y1 + tLinha * dyVis;
      ctx.beginPath();
      ctx.moveTo(lx - 20, ly + 4);
      ctx.lineTo(lx + 20, ly + 4);
      ctx.stroke();
    }

    // Trail (rastro)
    if (showTrail && trailRef.current.length > 1) {
      for (let i = 1; i < trailRef.current.length; i++) {
        const p1 = trailRef.current[i - 1].pos;
        const p2 = trailRef.current[i].pos;
        const t1 = p1 / comprimentoPlano;
        const t2 = p2 / comprimentoPlano;
        const xa = x1 + t1 * dxVis;
        const ya = y1 + t1 * dyVis;
        const xb = x1 + t2 * dxVis;
        const yb = y1 + t2 * dyVis;
        const alpha = i / trailRef.current.length;
        ctx.beginPath();
        ctx.moveTo(xa, ya - 6);
        ctx.lineTo(xb, yb - 6);
        ctx.strokeStyle = `rgba(96,165,250,${alpha * 0.6})`;
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    }

    // Vetores (forças)
    if (showVetores) {
      const escalaForca = 0.08; // fator de escala para desenho

      const desenhaVetor = (x, y, fx, fy, cor, label) => {
        const mag = Math.hypot(fx, fy);
        if (mag < 0.1) return;
        const ang = Math.atan2(fy, fx);
        const comp = mag * escalaForca;
        const xf = x + Math.cos(ang) * comp;
        const yf = y + Math.sin(ang) * comp;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(xf, yf);
        ctx.strokeStyle = cor;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Seta
        const hs = 7;
        const ang1 = ang + Math.PI * 0.8;
        const ang2 = ang - Math.PI * 0.8;
        ctx.beginPath();
        ctx.moveTo(xf, yf);
        ctx.lineTo(xf + Math.cos(ang1) * hs, yf + Math.sin(ang1) * hs);
        ctx.lineTo(xf + Math.cos(ang2) * hs, yf + Math.sin(ang2) * hs);
        ctx.fillStyle = cor;
        ctx.fill();

        ctx.fillStyle = cor;
        ctx.font = '10px Fira Code';
        ctx.fillText(label, xf + 5, yf - 3);
      };

      // Centro do bloco
      const cxBloco = blocoX;
      const cyBloco = blocoY - 6;

      // Peso (vertical para baixo)
      desenhaVetor(cxBloco, cyBloco, 0, Peso, '#f87171', `P = ${fmt(Peso)}N`);

      // Normal (perpendicular ao plano)
      const angNormal = anguloVis - Math.PI / 2;
      const nx = Math.cos(angNormal) * Normal;
      const ny = Math.sin(angNormal) * Normal;
      desenhaVetor(cxBloco, cyBloco, nx, ny, '#60a5fa', `N = ${fmt(Normal)}N`);

      // Atrito (paralelo ao plano, oposto ao movimento)
      const sinalAtrito = velocidade >= 0 ? -1 : 1;
      const atritoX = Math.cos(anguloVis) * sinalAtrito * AtritoCinetico;
      const atritoY = Math.sin(anguloVis) * sinalAtrito * AtritoCinetico;
      if (!estaEmRepouso) {
        desenhaVetor(cxBloco, cyBloco, atritoX, atritoY, '#a78bfa', `fₐ = ${fmt(AtritoCinetico)}N`);
      } else if (PesoParalelo > 0) {
        desenhaVetor(cxBloco, cyBloco, -atritoX, -atritoY, '#a78bfa', `fₑ = ${fmt(AtritoEstaticoMax)}N (máx)`);
      }

      // Resultante (se houver movimento)
      if (!estaEmRepouso && Math.abs(forcaResultante) > 0.01) {
        const angResultante = forcaResultante >= 0 ? anguloVis : anguloVis + Math.PI;
        const rx = Math.cos(angResultante) * Math.abs(forcaResultante);
        const ry = Math.sin(angResultante) * Math.abs(forcaResultante);
        desenhaVetor(cxBloco, cyBloco, rx, ry, '#34d399', `Fᵣ = ${fmt(Math.abs(forcaResultante))}N`);
      }
    }

    // Bloco (cubo com efeito 3D)
    ctx.shadowBlur = 8;
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.fillStyle = '#e53e3e';
    ctx.fillRect(blocoX - 15, blocoY - 20, 30, 22);
    ctx.fillStyle = '#c53030';
    ctx.fillRect(blocoX - 15, blocoY - 20, 30, 6);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(blocoX - 15, blocoY - 20, 30, 22);

    // Texto da massa
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 9px Fira Code';
    ctx.textAlign = 'center';
    ctx.fillText(`${fmt(massa)}kg`, blocoX, blocoY - 8);
    ctx.textAlign = 'left';

    // Ângulo do plano
    ctx.fillStyle = 'rgba(251,191,36,0.8)';
    ctx.font = '10px Fira Code';
    const anguloTexto = `θ = ${fmt(angulo)}°`;
    ctx.fillText(anguloTexto, x1 + 20, y1 - 8);
    if (angulo >= anguloCritico) {
      ctx.fillStyle = 'rgba(52,211,153,0.8)';
      ctx.fillText('⚠ Deslizando', x1 + 20, y1 + 15);
    } else {
      ctx.fillStyle = 'rgba(100,116,139,0.7)';
      ctx.fillText('✓ Em repouso', x1 + 20, y1 + 15);
    }

    // Informações de tempo/posição
    ctx.fillStyle = 'rgba(100,116,139,0.9)';
    ctx.font = '10px Fira Code';
    ctx.fillText(`s = ${fmt(posicao, 2)} m`, 12, H - 20);
    ctx.fillText(`v = ${fmt(velocidade, 2)} m/s`, 12, H - 36);

    ctx.shadowBlur = 0;
  }, [angulo, massa, posicao, velocidade, Peso, Normal, AtritoCinetico, AtritoEstaticoMax,
      estaEmRepouso, PesoParalelo, forcaResultante, showVetores, showTrail, trailRef,
      anguloCritico]);

  // ─── Gráficos (posição, velocidade, aceleração) ────────────────────────
  const drawPlot = useCallback((canvasRef, data, color, label, yMin, yMax, unidade = '') => {
    const canvas = canvasRef.current;
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

    // Curva
    const range = (yMax - yMin) || 1;
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = (i / (data.length - 1)) * W;
      const y = H - ((v - yMin) / range) * H;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Label e valor atual
    ctx.fillStyle = color;
    ctx.font = '10px Fira Code';
    ctx.fillText(label, 6, 14);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    const ultimoValor = data[data.length - 1];
    ctx.fillText(`${fmt(ultimoValor, 2)} ${unidade}`, 6, 28);
  }, []);

  useEffect(() => {
    const h = histRef.current;
    drawPlot(plotPosRef, h.pos, '#60a5fa', 's(t) posição', 0, 8.2, 'm');
    drawPlot(plotVelRef, h.vel, '#34d399', 'v(t) velocidade', -3, 8, 'm/s');
    drawPlot(plotAccRef, h.acc, '#f87171', 'a(t) aceleração', -2, 6, 'm/s²');
  }, [posicao, velocidade, drawPlot]);

  return (
    <>
      <style>{STYLES}</style>
      <div className="plano-container">
        <div className="plano-content">
          {/* ─── Sidebar Esquerda (Controles) ──────────────────────────── */}
          <div className="plano-sidebar-l">
            <div className="plano-section-label">Parâmetros do Plano</div>

            <div className="plano-ctrl">
              <div className="plano-ctrl-head">
                <span className="plano-ctrl-name">Ângulo θ</span>
                <span className="plano-ctrl-num">{fmt(angulo, 1)}°</span>
              </div>
              <input type="range" min="0" max="70" step="0.5" value={angulo}
                onChange={e => setAngulo(+e.target.value)} />
            </div>

            <div className="plano-ctrl">
              <div className="plano-ctrl-head">
                <span className="plano-ctrl-name">Massa m</span>
                <span className="plano-ctrl-num">{fmt(massa, 1)} kg</span>
              </div>
              <input type="range" min="0.5" max="10" step="0.1" value={massa}
                onChange={e => setMassa(+e.target.value)} />
            </div>

            <div className="plano-section-label">Atrito</div>

            <div className="plano-ctrl">
              <div className="plano-ctrl-head">
                <span className="plano-ctrl-name">μₑ (estático)</span>
                <span className="plano-ctrl-num">{fmt(muEstatico, 3)}</span>
              </div>
              <input type="range" min="0" max="1.2" step="0.01" value={muEstatico}
                onChange={e => setMuEstatico(+e.target.value)} />
            </div>

            <div className="plano-ctrl">
              <div className="plano-ctrl-head">
                <span className="plano-ctrl-name">μ꜀ (cinético)</span>
                <span className="plano-ctrl-num">{fmt(muCinetico, 3)}</span>
              </div>
              <input type="range" min="0" max="1.2" step="0.01" value={muCinetico}
                onChange={e => setMuCinetico(+e.target.value)} />
            </div>

            <div className="plano-section-label">Visualização</div>

            <label className="plano-toggle-row">
              <input type="checkbox" checked={showVetores} onChange={e => setShowVetores(e.target.checked)} />
              <span className="plano-toggle-label" style={{ color: '#a78bfa' }}>Mostrar vetores de força</span>
            </label>

            <label className="plano-toggle-row">
              <input type="checkbox" checked={showTrail} onChange={e => setShowTrail(e.target.checked)} />
              <span className="plano-toggle-label" style={{ color: '#60a5fa' }}>Rastro da partícula</span>
            </label>

            <div className="plano-btn-row">
              <button className="plano-btn plano-btn-primary" onClick={() => setRodando(true)}>▶ Iniciar</button>
              <button className="plano-btn plano-btn-secondary" onClick={() => setRodando(false)}>⏸ Pausar</button>
            </div>
            <div className="plano-btn-row">
              <button className="plano-btn plano-btn-danger" onClick={resetSimulacao}>↩ Reset</button>
              {onBack && (
                <button className="plano-btn plano-btn-secondary" onClick={onBack}>← Voltar</button>
              )}
            </div>
          </div>

          {/* ─── Área Principal (Canvas + Gráficos) ──────────────────────── */}
          <div className="plano-main-area">
            <div className="plano-canvas-wrap">
              <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
            </div>
            <div className="plano-plots-strip">
              <div className="plano-plot-box">
                <div className="plano-plot-title">Posição s(t)</div>
                <canvas ref={plotPosRef} style={{ width: '100%', height: '120px' }} />
              </div>
              <div className="plano-plot-box">
                <div className="plano-plot-title">Velocidade v(t)</div>
                <canvas ref={plotVelRef} style={{ width: '100%', height: '120px' }} />
              </div>
              <div className="plano-plot-box">
                <div className="plano-plot-title">Aceleração a(t)</div>
                <canvas ref={plotAccRef} style={{ width: '100%', height: '120px' }} />
              </div>
            </div>
          </div>

          {/* ─── Sidebar Direita (Informações e Equações) ────────────────── */}
          <div className="plano-sidebar-r">
            <div className="plano-section-label">Grandezas Mecânicas</div>

            <div className="plano-card">
              <div className="plano-stat-row">
                <span className="plano-stat-label">Peso (P)</span>
                <span className="plano-stat-val accent">{fmt(Peso)} N</span>
              </div>
              <div className="plano-stat-row">
                <span className="plano-stat-label">Componente paralela P∥</span>
                <span className="plano-stat-val gold">{fmt(PesoParalelo)} N</span>
              </div>
              <div className="plano-stat-row">
                <span className="plano-stat-label">Força Normal (N)</span>
                <span className="plano-stat-val">{fmt(Normal)} N</span>
              </div>
              <div className="plano-stat-row">
                <span className="plano-stat-label">Atrito estático máx (fₑₘₐₓ)</span>
                <span className="plano-stat-val purple">{fmt(AtritoEstaticoMax)} N</span>
              </div>
              <div className="plano-stat-row">
                <span className="plano-stat-label">Atrito cinético (f꜀)</span>
                <span className="plano-stat-val purple">{fmt(AtritoCinetico)} N</span>
              </div>
              <div className="plano-stat-row">
                <span className="plano-stat-label">Força Resultante (Fᵣ)</span>
                <span className="plano-stat-val green">{fmt(Math.abs(forcaResultante), 2)} N</span>
              </div>
              <div className="plano-stat-row">
                <span className="plano-stat-label">Aceleração (a)</span>
                <span className="plano-stat-val red">{fmt(estaEmRepouso ? 0 : aceleracao, 3)} m/s²</span>
              </div>
              <div className="plano-stat-row">
                <span className="plano-stat-label">Energia Cinética (E꜀)</span>
                <span className="plano-stat-val">{fmt(Ec)} J</span>
              </div>
              <div className="plano-stat-row">
                <span className="plano-stat-label">Energia Potencial (Eₚ)</span>
                <span className="plano-stat-val">{fmt(Ep)} J</span>
              </div>
            </div>

            <div className="plano-section-label">Condições de Deslizamento</div>
            <div className="plano-card">
              <div className="plano-stat-row">
                <span className="plano-stat-label">Ângulo crítico θ꜀</span>
                <span className="plano-stat-val gold">{fmt(anguloCritico, 1)}°</span>
              </div>
              <div className="plano-stat-row">
                <span className="plano-stat-label">Status</span>
                <span className={`plano-stat-val ${estaDeslizando ? 'green' : 'red'}`}>
                  {estaDeslizando ? '🔴 Deslizando' : '🟢 Em repouso'}
                </span>
              </div>
              <div className="plano-stat-row">
                <span className="plano-stat-label">Velocidade atual</span>
                <span className="plano-stat-val accent">{fmt(velocidade, 3)} m/s</span>
              </div>
            </div>

            <div className="plano-section-label">Equações Fundamentais</div>

            <div className="plano-eq-block">
              <div className="plano-eq-title">Componentes do Peso</div>
              <span className="sym">P∥</span> <span className="op">=</span> m·g·<span className="sym">sen</span>θ<br />
              <span className="sym">P⊥</span> <span className="op">=</span> m·g·<span className="sym">cos</span>θ
            </div>

            <div className="plano-eq-block">
              <div className="plano-eq-title">Força de Atrito</div>
              fₑₘₐₓ <span className="op">=</span> μₑ·N <span className="op">=</span> μₑ·m·g·<span className="sym">cos</span>θ<br />
              f꜀ <span className="op">=</span> μ꜀·N<br />
              <span className="cmt">Desliza se: P∥ &gt; fₑₘₐₓ</span>
            </div>

            <div className="plano-eq-block">
              <div className="plano-eq-title">2ª Lei de Newton</div>
              Fᵣ <span className="op">=</span> m·a<br />
              a <span className="op">=</span> g·(<span className="sym">sen</span>θ − μ꜀·<span className="sym">cos</span>θ)
            </div>

            <div className="plano-eq-block">
              <div className="plano-eq-title">Ângulo Crítico</div>
              θ꜀ <span className="op">=</span> <span className="sym">arctan</span>(μₑ)
            </div>
          </div>
        </div>
      </div>
    </>
  );
}