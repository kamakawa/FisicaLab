// ExperimentoPlanoInclinado.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';

// ─── Paleta e CSS global ─────────────────────────
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Fira+Code:wght@400;500;600&family=Playfair+Display:ital,wght@0,700;1,400&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:       #05060a;
  --surface:  #0a0d14;
  --panel:    #0f141f;
  --border:   rgba(255, 255, 255, 0.08);
  --accent:   #3b82f6;
  --gold:     #eab308;
  --green:    #10b981;
  --red:      #ef4444;
  --purple:   #8b5cf6;
  --text:     #f1f5f9;
  --muted:    #94a3b8;
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
  padding: 20px 32px;
  display: flex;
  align-items: baseline;
  gap: 24px;
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.05) 0%, transparent 40%);
}
.header-title {
  font-family: 'Playfair Display', serif;
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.5px;
}
.header-sub {
  font-size: 13px;
  color: var(--muted);
  letter-spacing: 0.15em;
  text-transform: uppercase;
}
.header-tag {
  margin-left: auto;
  font-size: 12px;
  color: var(--accent);
  border: 1px solid rgba(59, 130, 246, 0.3);
  background: rgba(59, 130, 246, 0.05);
  padding: 4px 12px;
  border-radius: 24px;
  font-family: var(--mono);
}

.tabs {
  display: flex;
  gap: 4px;
  padding: 16px 32px 0;
  border-bottom: 1px solid var(--border);
}
.tab {
  padding: 12px 24px;
  border: none;
  background: transparent;
  color: var(--muted);
  font-family: var(--sans);
  font-size: 14px;
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
  grid-template-columns: 340px 1fr 300px;
  gap: 0;
  height: calc(100vh - 120px);
}

.sidebar-l, .sidebar-r {
  border-right: 1px solid var(--border);
  overflow-y: auto;
  padding: 24px;
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
  background: radial-gradient(ellipse at 50% 50%, #0d1424 0%, #05060a 100%);
  overflow: hidden;
}
canvas { display: block; width: 100%; height: 100%; }

.plots-strip {
  height: 180px;
  border-top: 1px solid var(--border);
  display: flex;
  background: var(--panel);
}
.plot-box {
  flex: 1;
  border-right: 1px solid var(--border);
  padding: 12px;
  position: relative;
}
.plot-box:last-child { border-right: none; }
.plot-title {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--muted);
  text-transform: uppercase;
  margin-bottom: 8px;
}
.plot-box canvas { border-radius: 6px; }

.section-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.15em;
  color: var(--muted);
  text-transform: uppercase;
  margin-bottom: 16px;
  margin-top: 24px;
}
.section-label:first-child { margin-top: 0; }

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 8px 0;
  border-bottom: 1px solid var(--border);
}
.stat-row:last-child { border-bottom: none; }
.stat-label { color: var(--muted); font-size: 13px; }
.stat-val {
  font-family: var(--mono);
  font-size: 14px;
  color: var(--text);
  font-weight: 500;
}
.stat-val.accent { color: var(--accent); }
.stat-val.gold   { color: var(--gold); }
.stat-val.green  { color: var(--green); }
.stat-val.red    { color: var(--red); }
.stat-val.purple { color: var(--purple); }

.ctrl {
  margin-bottom: 20px;
}
.ctrl-head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
}
.ctrl-name { color: var(--text); font-weight: 500; }
.ctrl-num  { font-family: var(--mono); color: var(--accent); background: rgba(59, 130, 246, 0.1); padding: 2px 8px; border-radius: 4px; }
input[type=range] {
  width: 100%;
  accent-color: var(--accent);
  height: 4px;
  cursor: pointer;
}

.btn-row { display: flex; gap: 12px; margin-top: 16px; }
.btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: var(--sans);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.05em;
  transition: all 0.2s;
}
.btn-primary {
  background: var(--accent);
  color: #fff;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}
.btn-primary:hover { filter: brightness(1.15); transform: translateY(-1px); }
.btn-primary:disabled {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.3);
  box-shadow: none;
  cursor: not-allowed;
  transform: none;
}
.btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text);
  border: 1px solid var(--border);
}
.btn-secondary:hover { background: rgba(255, 255, 255, 0.1); }
.btn-danger {
  background: rgba(239, 68, 68, 0.1);
  color: var(--red);
  border: 1px solid rgba(239, 68, 68, 0.2);
}
.btn-danger:hover { background: rgba(239, 68, 68, 0.2); }

.toggle-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  cursor: pointer;
}
.toggle-row input[type=checkbox] {
  accent-color: var(--accent);
  width: 16px; height: 16px;
}
.toggle-label { font-size: 13px; font-weight: 500; }

.eq-block {
  background: var(--surface);
  border: 1px solid var(--border);
  border-left: 3px solid var(--accent);
  border-radius: 0 8px 8px 0;
  padding: 16px;
  margin-bottom: 12px;
  font-family: var(--mono);
  font-size: 13px;
  line-height: 2;
  color: var(--text);
}
.eq-block .eq-title {
  font-family: var(--sans);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 10px;
}
.eq-block .sym { color: var(--gold); }
.eq-block .op  { color: var(--purple); }
.eq-block .cmt { color: var(--muted); }

.calc-page {
  padding: 40px;
  max-width: 900px;
  margin: 0 auto;
  overflow-y: auto;
  height: calc(100vh - 120px);
}
.calc-section {
  margin-bottom: 48px;
}
.calc-h2 {
  font-family: 'Playfair Display', serif;
  font-size: 24px;
  color: #fff;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}
.calc-p {
  color: var(--muted);
  line-height: 1.8;
  margin-bottom: 16px;
  font-size: 15px;
}
.big-eq {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
  margin: 20px 0;
  font-family: var(--mono);
  font-size: 15px;
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
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
}
.derivation-step:last-child { border-bottom: none; }
.step-num {
  font-family: var(--mono);
  font-size: 12px;
  color: var(--muted);
  min-width: 24px;
}
.step-eq { font-family: var(--mono); font-size: 14px; color: var(--text); }
.step-desc { font-size: 13px; color: var(--muted); margin-left: auto; font-style: italic; }
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
          <span className="header-tag">v3.0 · Dinâmico</span>
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
// ABA 1 — SIMULAÇÃO
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

  const angRad = (angulo * Math.PI) / 180;
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

  const anguloCritico = (Math.atan(muEstatico) * 180) / Math.PI;
  const comprimentoPlano = 8.0;

  const podeIniciar = PesoParalelo > AtritoEstaticoMax;

  const iniciarMovimento = () => {
    if (podeIniciar) setRodando(true);
  };

  // Lógica da Física (Euler integration)
  useEffect(() => {
    if (!rodando) {
      lastRef.current = null;
      return;
    }

    const step = (now) => {
      if (lastRef.current !== null) {
        let dt = Math.min((now - lastRef.current) / 1000, 0.05);

        let aAtual;
        if (Math.abs(velocidade) < 0.01 && PesoParalelo <= AtritoEstaticoMax) {
          aAtual = 0;
        } else {
          const sinalVel = Math.sign(velocidade);
          aAtual = (PesoParalelo - sinalVel * AtritoCinetico) / massa;
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
  }, [rodando, massa, angulo, muEstatico, muCinetico, velocidade, posicao, PesoParalelo, AtritoEstaticoMax, AtritoCinetico]);

  const resetSimulacao = () => {
    setRodando(false);
    setPosicao(0);
    setVelocidade(0);
    trailRef.current = [];
    histRef.current = { pos: [], vel: [], acc: [], t: [] };
  };

  // Hitórico Gráficos
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

  // Rastro (Trail)
  useEffect(() => {
    if (!showTrail) { trailRef.current = []; return; }
    trailRef.current.push({ pos: posicao });
    if (trailRef.current.length > 150) trailRef.current.shift();
  }, [posicao, showTrail]);

  // ─── RENDERIZAÇÃO PRINCIPAL DO CANVAS ───
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;

    ctx.clearRect(0, 0, W, H);

    // Mapeamento de coordenadas (cálculo dinâmico da rampa)
    const margemEsq = W * 0.15;
    const margemDir = W * 0.85;
    const baseY = H * 0.85;

    // Fixo o canto inferior direito como base de ancoragem da rampa
    const x2 = margemDir;
    const y2 = baseY;

    // Hipotenusa máxima para não sair da tela
    const maxHipotenusa = margemDir - margemEsq;
    let L_ramp = maxHipotenusa;
    
    // Evita que o topo da rampa corte o cabeçalho do canvas em ângulos agudos
    const maxH = y2 - (H * 0.15); 
    if (L_ramp * Math.sin(angRad) > maxH) {
      L_ramp = maxH / Math.sin(angRad);
    }

    // Calcula origem (x1, y1) usando a trigonometria atual baseada no controle do usuário
    const x1 = x2 - L_ramp * Math.cos(angRad);
    const y1 = y2 - L_ramp * Math.sin(angRad);

    const dxVis = x2 - x1;
    const dyVis = y2 - y1;
    const anguloVis = Math.atan2(dyVis, dxVis); // anguloVis corresponde a descida

    // Posição linear mapeada na rampa
    const tBloco = posicao / comprimentoPlano;
    const blocoX = x1 + tBloco * dxVis;
    const blocoY = y1 + tBloco * dyVis;

    // ─── DESENHO DA ESTRUTURA FÍSICA ───
    
    // Desenho da Rampa (Triângulo Sólido)
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x1, y2);
    ctx.closePath();
    ctx.fillStyle = '#1e293b'; // Slate escuro
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Superfície de Deslizamento (Linha superior)
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Chão (Base horizontal)
    ctx.beginPath();
    ctx.moveTo(x1 - 40, y2);
    ctx.lineTo(x2 + 40, y2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Linhas verticais indicativas de altura (grid estrutural)
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1, y2);
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.stroke();
    ctx.setLineDash([]);

    // ─── RASTRO (Trail) ───
    if (showTrail && trailRef.current.length > 1) {
      for (let i = 1; i < trailRef.current.length; i++) {
        const t1 = trailRef.current[i - 1].pos / comprimentoPlano;
        const t2 = trailRef.current[i].pos / comprimentoPlano;
        const xa = x1 + t1 * dxVis;
        const ya = y1 + t1 * dyVis;
        const xb = x1 + t2 * dxVis;
        const yb = y1 + t2 * dyVis;
        const alpha = Math.min(0.6, i / trailRef.current.length);
        
        ctx.beginPath();
        ctx.moveTo(xa, ya);
        ctx.lineTo(xb, yb);
        ctx.strokeStyle = `rgba(16, 185, 129, ${alpha})`;
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    }

    // ─── RENDERIZAÇÃO ROTACIONADA DO BLOCO ───
    const blocow = 40;
    const blocoh = 36;
    
    ctx.save();
    // Translada a origem do canvas para o ponto exato de contato na hipotenusa
    ctx.translate(blocoX, blocoY);
    // Rotaciona todo o contexto do canvas para o ângulo visual (o bloco desenha-se alinhado)
    ctx.rotate(anguloVis);

    // Bloco centralizado horizontalmente no eixo de deslocamento (-blocow/2)
    // Deslocado para cima da linha da rampa (-blocoh)
    ctx.shadowBlur = 12;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';

    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-blocow / 2, -blocoh, blocow, blocoh);
    
    // Detalhes internos da malha do bloco
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.strokeRect(-blocow / 2, -blocoh, blocow, blocoh);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(-blocow / 2 + 4, -blocoh + 4, blocow - 8, 4);

    // Massa renderizada no centro
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px "Fira Code"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 0;
    ctx.fillText(`${fmt(massa, 1)}kg`, 0, -blocoh / 2);

    ctx.restore();

    // ─── VETORES DE FORÇA ───
    if (showVetores) {
      // Centro de massa global para a origem dos vetores
      const cxBloco = blocoX + (blocoh / 2) * Math.sin(anguloVis);
      const cyBloco = blocoY - (blocoh / 2) * Math.cos(anguloVis);

      // Função de desenho vetorial (trabalha com magnitudes e ângulos absolutos)
      const desenhaVetor = (x, y, mag, angAbsoluto, cor, label) => {
        if (mag < 0.2) return;
        
        // Mapeamento logarítmico brando para escalar força para pixels
        // (impede vetores de quebrarem a interface, mas os mantêm proporcionais)
        const comp = Math.min(Math.max(mag * 4, 30), 120); 
        
        const xf = x + Math.cos(angAbsoluto) * comp;
        const yf = y + Math.sin(angAbsoluto) * comp;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(xf, yf);
        ctx.strokeStyle = cor;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Cabeça da Seta (Arrowhead)
        const tamanhoSeta = 10;
        const ang1 = angAbsoluto + Math.PI * 0.85;
        const ang2 = angAbsoluto - Math.PI * 0.85;
        ctx.beginPath();
        ctx.moveTo(xf, yf);
        ctx.lineTo(xf + Math.cos(ang1) * tamanhoSeta, yf + Math.sin(ang1) * tamanhoSeta);
        ctx.lineTo(xf + Math.cos(ang2) * tamanhoSeta, yf + Math.sin(ang2) * tamanhoSeta);
        ctx.fillStyle = cor;
        ctx.fill();

        // Rótulo alinhado ao lado da extremidade da seta
        ctx.font = 'bold 11px "Fira Code"';
        ctx.fillStyle = cor;
        ctx.fillText(label, xf + 6, yf + 4);
      };

      // Peso P (sempre aponta reto para o centro da Terra -> 90° ou PI/2 radianos)
      desenhaVetor(cxBloco, cyBloco, Peso, Math.PI / 2, '#ef4444', `P=${fmt(Peso)}N`);

      // Normal N (perpendicular ao plano, apontando para fora)
      desenhaVetor(cxBloco, cyBloco, Normal, anguloVis - Math.PI / 2, '#3b82f6', `N=${fmt(Normal)}N`);

      // Atrito (sempre paralelo ao plano, em oposição à tendência/movimento)
      if (!estaEmRepouso && Math.abs(velocidade) > 0.01) {
        // Atrito Dinâmico
        const dirAtrito = velocidade >= 0 ? anguloVis + Math.PI : anguloVis;
        desenhaVetor(cxBloco, cyBloco, AtritoCinetico, dirAtrito, '#8b5cf6', `f꜀=${fmt(AtritoCinetico)}N`);
      } else if (PesoParalelo > AtritoEstaticoMax && estaEmRepouso) {
        // Iminência de Deslizar (Atrito Estático Máx superado)
        desenhaVetor(cxBloco, cyBloco, AtritoEstaticoMax, anguloVis + Math.PI, '#8b5cf6', `fₑ=${fmt(AtritoEstaticoMax)}N`);
      } else if (estaEmRepouso) {
        // Atrito Estático estabilizador equilibra exatemente a componente de descida (P∥)
        desenhaVetor(cxBloco, cyBloco, PesoParalelo, anguloVis + Math.PI, '#8b5cf6', `f=${fmt(PesoParalelo)}N`);
      }
    }

    // ─── INFORMAÇÕES GEOMÉTRICAS (Overlay Analítico) ───
    ctx.fillStyle = '#eab308';
    ctx.font = 'bold 13px "Fira Code"';
    // Colocamos a etiqueta do ângulo perto da base (onde visualmente forma a quina)
    ctx.fillText(`θ = ${fmt(angulo)}°`, x1 + 20, y2 - 10);

    ctx.font = '11px "Fira Code"';
    if (PesoParalelo > AtritoEstaticoMax) {
      ctx.fillStyle = '#10b981';
      ctx.fillText('⚡ DESLIZANDO', 20, 30);
    } else {
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('● EM REPOUSO', 20, 30);
    }

    // Régua linear de monitoramento
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`s(t) = ${fmt(posicao, 2)} m`, 20, H - 40);
    ctx.fillText(`v(t) = ${fmt(velocidade, 2)} m/s`, 20, H - 24);

  }, [angulo, massa, posicao, velocidade, Peso, Normal, AtritoCinetico, AtritoEstaticoMax, 
      estaEmRepouso, PesoParalelo, forcaResultante, angRad, showVetores, showTrail]);

  // Gráficos (Data plotting)
  const drawPlot = useCallback((ref, data, color, label, yMin, yMax, unidade = '') => {
    const canvas = ref.current;
    if (!canvas || !data || data.length < 2) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;
    ctx.clearRect(0, 0, W, H);

    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, H/2); ctx.lineTo(W, H/2); ctx.stroke();

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

    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fillStyle = `${color}10`;
    ctx.fill();

    ctx.fillStyle = color;
    ctx.font = 'bold 10px "Fira Code"';
    ctx.fillText(label, 8, 16);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '10px "Fira Code"';
    ctx.fillText(`${fmt(data[data.length - 1], 2)} ${unidade}`, 8, 30);
  }, []);

  useEffect(() => {
    const h = histRef.current;
    drawPlot(plotPosRef, h.pos, '#3b82f6', 's(t) Posição', 0, comprimentoPlano, 'm');
    drawPlot(plotVelRef, h.vel, '#10b981', 'v(t) Velocidade', -3, 8, 'm/s');
    drawPlot(plotAccRef, h.acc, '#ef4444', 'a(t) Aceleração', -2, 6, 'm/s²');
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

        <div className="section-label">Coeficientes de Atrito</div>

        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Estático (μₑ)</span><span className="ctrl-num">{fmt(muEstatico, 3)}</span></div>
          <input type="range" min="0" max="1.2" step="0.01" value={muEstatico} onChange={e => setMuEstatico(+e.target.value)} />
        </div>

        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Cinético (μ꜀)</span><span className="ctrl-num">{fmt(muCinetico, 3)}</span></div>
          <input type="range" min="0" max="1.2" step="0.01" value={muCinetico} onChange={e => setMuCinetico(+e.target.value)} />
        </div>

        <div className="section-label">Overlay & Visualização</div>

        <label className="toggle-row">
          <input type="checkbox" checked={showVetores} onChange={e => setShowVetores(e.target.checked)} />
          <span className="toggle-label" style={{ color: '#8b5cf6' }}>Vetores Dinâmicos</span>
        </label>

        <label className="toggle-row">
          <input type="checkbox" checked={showTrail} onChange={e => setShowTrail(e.target.checked)} />
          <span className="toggle-label" style={{ color: '#10b981' }}>Traçado s(t)</span>
        </label>

        <div className="btn-row">
          <button className="btn btn-primary" onClick={iniciarMovimento} disabled={!podeIniciar}>
            ▶ Iniciar
          </button>
          <button className="btn btn-secondary" onClick={() => setRodando(false)}>⏸ Pausar</button>
        </div>
        <div className="btn-row">
          <button className="btn btn-danger" onClick={resetSimulacao}>↩ Resetar Instância</button>
        </div>
      </div>

      <div className="main-area">
        <div className="canvas-wrap">
          <canvas ref={canvasRef} />
        </div>
        <div className="plots-strip">
          <div className="plot-box"><canvas ref={plotPosRef} /></div>
          <div className="plot-box"><canvas ref={plotVelRef} /></div>
          <div className="plot-box"><canvas ref={plotAccRef} /></div>
        </div>
      </div>

      <div className="sidebar-r">
        <div className="section-label">Vetor Resultante</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">Peso P</span><span className="stat-val accent">{fmt(Peso)} N</span></div>
          <div className="stat-row"><span className="stat-label">Plano Paralelo P∥</span><span className="stat-val gold">{fmt(PesoParalelo)} N</span></div>
          <div className="stat-row"><span className="stat-label">Força Normal N</span><span className="stat-val">{fmt(Normal)} N</span></div>
          <div className="stat-row"><span className="stat-label">Atrito Estático Máx</span><span className="stat-val purple">{fmt(AtritoEstaticoMax)} N</span></div>
          <div className="stat-row"><span className="stat-label">Atrito Cinético</span><span className="stat-val purple">{fmt(AtritoCinetico)} N</span></div>
          <div className="stat-row"><span className="stat-label">Força Resultante Fᵣ</span><span className="stat-val green">{fmt(Math.abs(forcaResultante), 2)} N</span></div>
          <div className="stat-row"><span className="stat-label">Aceleração a</span><span className="stat-val red">{fmt(estaEmRepouso ? 0 : aceleracao, 3)} m/s²</span></div>
        </div>

        <div className="section-label">Limiares Físicos</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">Ângulo crítico θ꜀</span><span className="stat-val gold">{fmt(anguloCritico, 1)}°</span></div>
          <div className="stat-row"><span className="stat-label">Status</span><span className={`stat-val ${PesoParalelo > AtritoEstaticoMax ? 'green' : 'red'}`}>
            {PesoParalelo > AtritoEstaticoMax ? '🔴 Dinâmico' : '🟢 Estático'}
          </span></div>
        </div>

        <div className="section-label">Equações Modelo</div>

        <div className="eq-block">
          <div className="eq-title">Componentes (Trig)</div>
          <span className="sym">P∥</span> <span className="op">=</span> m·g·<span className="sym">sin</span>(θ)<br />
          <span className="sym">P⊥</span> <span className="op">=</span> m·g·<span className="sym">cos</span>(θ)
        </div>

        <div className="eq-block">
          <div className="eq-title">Fricção Superfície</div>
          fₑₘₐₓ <span className="op">=</span> μₑ·N<br />
          f꜀ <span className="op">=</span> μ꜀·N<br />
          <span className="cmt">// P∥ deve superar fₑₘₐₓ</span>
        </div>

        <div className="eq-block">
          <div className="eq-title">Dinâmica (Newton)</div>
          a <span className="op">=</span> g·(<span className="sym">sin</span>(θ) − μ꜀·<span className="sym">cos</span>(θ))
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