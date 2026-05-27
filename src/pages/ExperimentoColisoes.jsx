// ExperimentoSistemasParticulas.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';

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

/* Sub-tabs para experimentos */
.exp-selector {
  display: flex;
  gap: 2px;
  padding: 12px 32px 0;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
}
.exp-tab {
  padding: 8px 20px;
  border: none;
  background: transparent;
  color: var(--muted);
  font-family: var(--sans);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: all 0.2s;
}
.exp-tab:hover { color: var(--text); }
.exp-tab.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
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
  height: calc(100vh - 180px);
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
  height: calc(100vh - 180px);
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

export default function ExperimentoSistemasParticulas({ onBack }) {
  const [tipoExperimento, setTipoExperimento] = useState('colisoes'); // 'colisoes' ou 'pendulo'
  const [tab, setTab] = useState('sim');

  return (
    <>
      <style>{STYLES}</style>
      <div className="app">
        <header className="header">
          <div>
            <div className="header-title">Sistemas de Partículas e Colisões</div>
            <div className="header-sub">Física I · Conservação do Momento · Colisões</div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span className="header-tag">v2.0 · Interativo</span>
            {onBack && (
              <button 
                onClick={onBack}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontFamily: 'var(--mono)',
                  fontSize: '12px'
                }}
              >
                ← Voltar ao Menu
              </button>
            )}
          </div>
        </header>

        {/* Sub-tabs para escolher o experimento */}
        <nav className="exp-selector">
          <button
            className={`exp-tab ${tipoExperimento === 'colisoes' ? 'active' : ''}`}
            onClick={() => setTipoExperimento('colisoes')}
          >
            🎯 Colisões Unidimensionais (1D)
          </button>
          <button
            className={`exp-tab ${tipoExperimento === 'pendulo' ? 'active' : ''}`}
            onClick={() => setTipoExperimento('pendulo')}
          >
            🔫 Pêndulo Balístico
          </button>
        </nav>

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

        {tab === 'sim' && tipoExperimento === 'colisoes' && <SimulacaoColisoes1D />}
        {tab === 'calc' && tipoExperimento === 'colisoes' && <CalculoColisoes1D />}
        {tab === 'sim' && tipoExperimento === 'pendulo' && <SimulacaoPenduloBalistico />}
        {tab === 'calc' && tipoExperimento === 'pendulo' && <CalculoPenduloBalistico />}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIMULAÇÃO — Colisões Unidimensionais (1D)
// ═══════════════════════════════════════════════════════════════════════════════
function SimulacaoColisoes1D() {
  const [m1, setM1] = useState(2.0);
  const [m2, setM2] = useState(2.0);
  const [v1, setV1] = useState(3.0);
  const [v2, setV2] = useState(-2.0);
  const [e, setE] = useState(0.8);
  const [rodando, setRodando] = useState(true);
  const [showVetores, setShowVetores] = useState(true);
  const [showTrail, setShowTrail] = useState(true);
  
  const canvasRef = useRef(null);
  const plotPos1Ref = useRef(null);
  const plotPos2Ref = useRef(null);
  const plotVelRef = useRef(null);
  const plotMomRef = useRef(null);
  
  const trailRef1 = useRef([]);
  const trailRef2 = useRef([]);
  const histRef = useRef({ pos1: [], pos2: [], vel1: [], vel2: [], pTotal: [] });
  
  const rafRef = useRef(null);
  const lastRef = useRef(null);
  
  const [pos1, setPos1] = useState(-4);
  const [pos2, setPos2] = useState(4);
  const [vel1Atual, setVel1Atual] = useState(v1);
  const [vel2Atual, setVel2Atual] = useState(v2);
  const [colidiu, setColidiu] = useState(false);
  const [tempo, setTempo] = useState(0);

  const limiteEsq = -6;
  const limiteDir = 6;
  const raio = 0.4;

  const momentoTotal = m1 * vel1Atual + m2 * vel2Atual;
  const EcAtual = 0.5 * m1 * vel1Atual * vel1Atual + 0.5 * m2 * vel2Atual * vel2Atual;
  
  const v1PosColisao = ((m1 - m2) * v1 + 2 * m2 * v2) / (m1 + m2);
  const v2PosColisao = ((m2 - m1) * v2 + 2 * m1 * v1) / (m1 + m2);
  const vRel = v1 - v2;
  const v1PosInelastica = (m1 * v1 + m2 * v2 - e * m2 * vRel) / (m1 + m2);
  const v2PosInelastica = (m1 * v1 + m2 * v2 + e * m1 * vRel) / (m1 + m2);

  const verificaColisao = (p1, p2) => Math.abs(p1 - p2) <= raio * 2;

  const aplicarColisao = () => {
    if (colidiu) return;
    const vRelColisao = vel1Atual - vel2Atual;
    const v1Novo = (m1 * vel1Atual + m2 * vel2Atual - e * m2 * vRelColisao) / (m1 + m2);
    const v2Novo = (m1 * vel1Atual + m2 * vel2Atual + e * m1 * vRelColisao) / (m1 + m2);
    setVel1Atual(v1Novo);
    setVel2Atual(v2Novo);
    setColidiu(true);
  };

  useEffect(() => {
    if (!rodando) { lastRef.current = null; return; }
    const step = (now) => {
      if (lastRef.current !== null) {
        let dt = Math.min((now - lastRef.current) / 1000, 0.02);
        setPos1(prev => {
          let newPos = prev + vel1Atual * dt;
          if (newPos + raio > limiteDir) newPos = limiteDir - raio;
          if (newPos - raio < limiteEsq) newPos = limiteEsq + raio;
          return newPos;
        });
        setPos2(prev => {
          let newPos = prev + vel2Atual * dt;
          if (newPos + raio > limiteDir) newPos = limiteDir - raio;
          if (newPos - raio < limiteEsq) newPos = limiteEsq + raio;
          return newPos;
        });
        setTempo(prev => prev + dt);
      }
      lastRef.current = now;
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [rodando, vel1Atual, vel2Atual]);

  useEffect(() => {
    if (verificaColisao(pos1, pos2) && !colidiu && rodando) aplicarColisao();
    if (!verificaColisao(pos1, pos2) && colidiu) setColidiu(false);
  }, [pos1, pos2, colidiu, rodando]);

  useEffect(() => {
    if (!rodando) {
      setVel1Atual(v1);
      setVel2Atual(v2);
      setPos1(-4);
      setPos2(4);
      setTempo(0);
      setColidiu(false);
    }
  }, [v1, v2, m1, m2, e, rodando]);

  useEffect(() => {
    if (!showTrail) { trailRef1.current = []; trailRef2.current = []; return; }
    trailRef1.current.push({ pos: pos1 });
    trailRef2.current.push({ pos: pos2 });
    if (trailRef1.current.length > 200) trailRef1.current.shift();
    if (trailRef2.current.length > 200) trailRef2.current.shift();
  }, [pos1, pos2, showTrail]);

  useEffect(() => {
    const h = histRef.current;
    h.pos1.push(pos1); h.pos2.push(pos2);
    h.vel1.push(vel1Atual); h.vel2.push(vel2Atual);
    h.pTotal.push(momentoTotal);
    if (h.pos1.length > 400) {
      h.pos1.shift(); h.pos2.shift();
      h.vel1.shift(); h.vel2.shift();
      h.pTotal.shift();
    }
  }, [pos1, pos2, vel1Atual, vel2Atual, momentoTotal]);

  // Desenho
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;
    ctx.clearRect(0, 0, W, H);
    
    const yCentro = H / 2;
    const escalaX = (W - 100) / (limiteDir - limiteEsq);
    const offsetX = 50;
    const toX = (x) => offsetX + (x - limiteEsq) * escalaX;
    const raioTela = raio * escalaX;
    
    // Pista
    ctx.beginPath();
    ctx.moveTo(offsetX - 10, yCentro);
    ctx.lineTo(W - offsetX + 10, yCentro);
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Marcadores
    ctx.fillStyle = 'rgba(100,116,139,0.5)';
    ctx.font = '9px Fira Code';
    for (let x = -6; x <= 6; x += 2) {
      const px = toX(x);
      ctx.beginPath();
      ctx.moveTo(px, yCentro - 5);
      ctx.lineTo(px, yCentro + 5);
      ctx.stroke();
      ctx.fillText(`${x}`, px - 4, yCentro - 8);
    }
    
    // Trail
    if (showTrail) {
      for (let i = 1; i < trailRef1.current.length; i++) {
        const alpha = i / trailRef1.current.length;
        const xa = toX(trailRef1.current[i-1].pos);
        const xb = toX(trailRef1.current[i].pos);
        ctx.beginPath();
        ctx.moveTo(xa, yCentro - 25);
        ctx.lineTo(xb, yCentro - 25);
        ctx.strokeStyle = `rgba(248,113,113,${alpha * 0.5})`;
        ctx.lineWidth = 3;
        ctx.stroke();
      }
      for (let i = 1; i < trailRef2.current.length; i++) {
        const alpha = i / trailRef2.current.length;
        const xa = toX(trailRef2.current[i-1].pos);
        const xb = toX(trailRef2.current[i].pos);
        ctx.beginPath();
        ctx.moveTo(xa, yCentro + 25);
        ctx.lineTo(xb, yCentro + 25);
        ctx.strokeStyle = `rgba(96,165,250,${alpha * 0.5})`;
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    }
    
    // Partícula 1
    const x1 = toX(pos1);
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(x1, yCentro - 20, raioTela, 0, TAU);
    const grad1 = ctx.createRadialGradient(x1 - 5, yCentro - 25, 0, x1, yCentro - 20, raioTela);
    grad1.addColorStop(0, '#ff7a7a');
    grad1.addColorStop(1, '#f87171');
    ctx.fillStyle = grad1;
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 9px Fira Code';
    ctx.textAlign = 'center';
    ctx.fillText(`${fmt(m1)}kg`, x1, yCentro - 28);
    
    // Partícula 2
    const x2 = toX(pos2);
    ctx.beginPath();
    ctx.arc(x2, yCentro + 20, raioTela, 0, TAU);
    const grad2 = ctx.createRadialGradient(x2 - 5, yCentro + 15, 0, x2, yCentro + 20, raioTela);
    grad2.addColorStop(0, '#7ab8ff');
    grad2.addColorStop(1, '#60a5fa');
    ctx.fillStyle = grad2;
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillText(`${fmt(m2)}kg`, x2, yCentro + 12);
    
    // Vetores de momento
    if (showVetores) {
      const escalaMomento = 0.5;
      const desenhaVetor = (x, y, valor, cor, label) => {
        if (Math.abs(valor) < 0.1) return;
        const comp = Math.min(Math.abs(valor) * escalaMomento, 60);
        const dir = valor > 0 ? 1 : -1;
        const xf = x + dir * comp;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(xf, y);
        ctx.strokeStyle = cor;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(xf, y);
        ctx.lineTo(xf - dir * 8, y - 4);
        ctx.lineTo(xf - dir * 8, y + 4);
        ctx.fillStyle = cor;
        ctx.fill();
        ctx.fillStyle = cor;
        ctx.font = '9px Fira Code';
        ctx.fillText(label, x + dir * (comp + 5), y - 5);
      };
      desenhaVetor(x1, yCentro - 35, m1 * vel1Atual, '#f87171', 'p₁');
      desenhaVetor(x2, yCentro + 35, m2 * vel2Atual, '#60a5fa', 'p₂');
    }
    
    ctx.shadowBlur = 0;
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(100,116,139,0.9)';
    ctx.font = '10px Fira Code';
    ctx.fillText(`t = ${fmt(tempo, 2)} s`, 12, 30);
    ctx.fillStyle = '#f87171';
    ctx.fillText(`v₁ = ${fmt(vel1Atual, 2)} m/s`, 12, 55);
    ctx.fillStyle = '#60a5fa';
    ctx.fillText(`v₂ = ${fmt(vel2Atual, 2)} m/s`, 12, 75);
    ctx.fillStyle = '#34d399';
    ctx.fillText(`P = ${fmt(momentoTotal, 2)} kg·m/s`, 12, 95);
  }, [pos1, pos2, vel1Atual, vel2Atual, m1, m2, showVetores, showTrail, trailRef1, trailRef2, tempo, momentoTotal]);

  const drawPlot = useCallback((ref, data1, data2, color1, color2, label1, label2, yMin, yMax) => {
    const canvas = ref.current;
    if (!canvas || !data1 || data1.length < 2) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, H/2); ctx.lineTo(W, H/2); ctx.stroke();
    const range = (yMax - yMin) || 1;
    const desenhaCurva = (data, color) => {
      if (data.length < 2) return;
      ctx.beginPath();
      data.forEach((v, i) => {
        const x = (i / (data.length - 1)) * W;
        const y = H - ((v - yMin) / range) * H;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.8;
      ctx.stroke();
    };
    desenhaCurva(data1, color1);
    if (data2 && data2.length > 0) desenhaCurva(data2, color2);
    ctx.fillStyle = color1;
    ctx.font = '9px Fira Code';
    ctx.fillText(label1, 6, 14);
    if (label2) { ctx.fillStyle = color2; ctx.fillText(label2, 6, 28); }
  }, []);
  
  useEffect(() => {
    const h = histRef.current;
    drawPlot(plotPos1Ref, h.pos1, h.pos2, '#f87171', '#60a5fa', 'x₁(t)', 'x₂(t)', -6.5, 6.5);
    drawPlot(plotVelRef, h.vel1, h.vel2, '#f87171', '#60a5fa', 'v₁(t)', 'v₂(t)', -6, 6);
    drawPlot(plotMomRef, h.pTotal, null, '#34d399', null, 'P total', null, -5, 15);
  }, [pos1, pos2, vel1Atual, drawPlot]);

  const resetSimulacao = () => {
    setRodando(false);
    setVel1Atual(v1);
    setVel2Atual(v2);
    setPos1(-4);
    setPos2(4);
    setTempo(0);
    setColidiu(false);
    trailRef1.current = [];
    trailRef2.current = [];
    histRef.current = { pos1: [], pos2: [], vel1: [], vel2: [], pTotal: [] };
    setRodando(true);
  };

  return (
    <div className="content">
      <div className="sidebar-l">
        <div className="section-label">Parâmetros das Partículas</div>
        <div className="ctrl"><div className="ctrl-head"><span className="ctrl-name">Massa m₁</span><span className="ctrl-num">{fmt(m1, 1)} kg</span></div><input type="range" min="0.5" max="10" step="0.1" value={m1} onChange={e => setM1(+e.target.value)} /></div>
        <div className="ctrl"><div className="ctrl-head"><span className="ctrl-name">Velocidade v₁</span><span className="ctrl-num">{fmt(v1, 1)} m/s</span></div><input type="range" min="-6" max="6" step="0.2" value={v1} onChange={e => setV1(+e.target.value)} /></div>
        <div className="ctrl"><div className="ctrl-head"><span className="ctrl-name">Massa m₂</span><span className="ctrl-num">{fmt(m2, 1)} kg</span></div><input type="range" min="0.5" max="10" step="0.1" value={m2} onChange={e => setM2(+e.target.value)} /></div>
        <div className="ctrl"><div className="ctrl-head"><span className="ctrl-name">Velocidade v₂</span><span className="ctrl-num">{fmt(v2, 1)} m/s</span></div><input type="range" min="-6" max="6" step="0.2" value={v2} onChange={e => setV2(+e.target.value)} /></div>
        <div className="section-label">Parâmetros da Colisão</div>
        <div className="ctrl"><div className="ctrl-head"><span className="ctrl-name">Coef. Restituição e</span><span className="ctrl-num">{fmt(e, 2)}</span></div><input type="range" min="0" max="1" step="0.01" value={e} onChange={e => setE(+e.target.value)} /></div>
        <div className="section-label">Visualização</div>
        <label className="toggle-row"><input type="checkbox" checked={showVetores} onChange={e => setShowVetores(e.target.checked)} /><span className="toggle-label" style={{ color: '#a78bfa' }}>Mostrar vetores de momento</span></label>
        <label className="toggle-row"><input type="checkbox" checked={showTrail} onChange={e => setShowTrail(e.target.checked)} /><span className="toggle-label" style={{ color: '#60a5fa' }}>Rastro das partículas</span></label>
        <div className="btn-row"><button className="btn btn-primary" onClick={() => setRodando(true)}>▶ Iniciar</button><button className="btn btn-secondary" onClick={() => setRodando(false)}>⏸ Pausar</button></div>
        <div className="btn-row"><button className="btn btn-danger" onClick={resetSimulacao}>↩ Reset</button></div>
      </div>
      <div className="main-area">
        <div className="canvas-wrap"><canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} /></div>
        <div className="plots-strip">
          <div className="plot-box"><div className="plot-title">Posição x(t)</div><canvas ref={plotPos1Ref} style={{ width: '100%', height: '75px' }} /></div>
          <div className="plot-box"><div className="plot-title">Velocidade v(t)</div><canvas ref={plotVelRef} style={{ width: '100%', height: '75px' }} /></div>
          <div className="plot-box"><div className="plot-title">Momento P(t)</div><canvas ref={plotMomRef} style={{ width: '100%', height: '75px' }} /></div>
        </div>
      </div>
      <div className="sidebar-r">
        <div className="section-label">Grandezas Calculadas</div>
        <div className="card"><div className="stat-row"><span className="stat-label">Momento Total P</span><span className="stat-val accent">{fmt(momentoTotal, 2)} kg·m/s</span></div><div className="stat-row"><span className="stat-label">Energia Cinética E꜀</span><span className="stat-val green">{fmt(EcAtual, 2)} J</span></div></div>
        <div className="section-label">Velocidades Pós-Colisão</div>
        <div className="card"><div className="stat-row"><span className="stat-label">v₁' (elástica)</span><span className="stat-val gold">{fmt(v1PosColisao, 2)} m/s</span></div><div className="stat-row"><span className="stat-label">v₂' (elástica)</span><span className="stat-val gold">{fmt(v2PosColisao, 2)} m/s</span></div><div className="stat-row"><span className="stat-label">v₁' (e={fmt(e,2)})</span><span className="stat-val purple">{fmt(v1PosInelastica, 2)} m/s</span></div><div className="stat-row"><span className="stat-label">v₂' (e={fmt(e,2)})</span><span className="stat-val purple">{fmt(v2PosInelastica, 2)} m/s</span></div></div>
        <div className="section-label">Equações</div>
        <div className="eq-block"><div className="eq-title">Conservação do Momento</div>m₁v₁ + m₂v₂ = m₁v₁' + m₂v₂'</div>
        <div className="eq-block"><div className="eq-title">Coeficiente de Restituição</div>e = (v₂' - v₁')/(v₁ - v₂)</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CÁLCULO — Colisões Unidimensionais
// ═══════════════════════════════════════════════════════════════════════════════
function CalculoColisoes1D() {
  return (
    <div className="calc-page">
      <div className="calc-section"><div className="calc-h2">1. Conservação do Momento Linear</div><p className="calc-p">Em um sistema isolado (sem forças externas), o momento linear total se conserva. Para duas partículas em colisão unidimensional:</p><div className="big-eq"><span className="hi-acc">P⃗</span><sub>antes</sub> = <span className="hi-acc">P⃗</span><sub>depois</sub><br/>m₁·v₁ + m₂·v₂ = m₁·v₁' + m₂·v₂'</div></div>
      <div className="calc-section"><div className="calc-h2">2. Coeficiente de Restituição (e)</div><p className="calc-p">O coeficiente de restituição mede a elasticidade da colisão: e = |v₂' - v₁'| / |v₁ - v₂|. Valores limites: e = 1 (elástica), e = 0 (perfeitamente inelástica).</p></div>
      <div className="calc-section"><div className="calc-h2">3. Dedução das Velocidades Finais</div><div className="big-eq"><div className="derivation-step"><span className="step-num">①</span><span className="step-eq">m₁v₁ + m₂v₂ = m₁v₁' + m₂v₂'</span><span className="step-desc">conservação do momento</span></div><div className="derivation-step"><span className="step-num">②</span><span className="step-eq">v₂' - v₁' = e·(v₁ - v₂)</span><span className="step-desc">coeficiente de restituição</span></div><div className="derivation-step"><span className="step-num">③</span><span className="step-eq">v₁' = [(m₁ - m₂)v₁ + 2m₂v₂] / (m₁ + m₂)</span><span className="step-desc">resolvendo o sistema</span></div><div className="derivation-step"><span className="step-num">④</span><span className="step-eq">v₂' = [(m₂ - m₁)v₂ + 2m₁v₁] / (m₁ + m₂)</span><span className="step-desc">análogo para v₂'</span></div></div></div>
      <div className="calc-section"><div className="calc-h2">4. Casos Especiais</div><div className="big-eq"><div className="derivation-step"><span className="step-num">①</span><span className="step-eq">m₁ = m₂ → v₁' = v₂, v₂' = v₁</span><span className="step-desc">trocam velocidades</span></div><div className="derivation-step"><span className="step-num">②</span><span className="step-eq">v₂ = 0 → v₁' = (m₁ - m₂)v₁/(m₁ + m₂)</span><span className="step-desc">alvo em repouso</span></div><div className="derivation-step"><span className="step-num">③</span><span className="step-eq">m₂ → ∞ → v₁' = -e·v₁</span><span className="step-desc">parede fixa</span></div></div></div>
      <div className="calc-section"><div className="calc-h2">5. Energia Cinética na Colisão</div><p className="calc-p">A energia cinética se conserva APENAS em colisões elásticas (e = 1). A energia "perdida" é convertida em calor, som ou deformação permanente.</p><div className="big-eq">ΔE = ½m₁v₁'² + ½m₂v₂'² - (½m₁v₁² + ½m₂v₂²) ≤ 0</div></div>
      <div className="calc-section"><div className="calc-h2">6. Derivadas e Impulso</div><p className="calc-p">A força é a derivada temporal do momento: F = dP/dt. O impulso é a integral da força no tempo: J = ∫ F dt = ΔP.</p></div>
      <div className="calc-section"><div className="calc-h2">7. Exemplo Numérico</div><p className="calc-p">Considere m₁ = 2 kg, v₁ = 3 m/s, m₂ = 2 kg, v₂ = -2 m/s, e = 0.8</p><div className="big-eq"><div className="derivation-step"><span className="step-num">①</span><span className="step-eq">P = 2·3 + 2·(-2) = 2 kg·m/s</span><span className="step-desc">momento total</span></div><div className="derivation-step"><span className="step-num">②</span><span className="step-eq">v₁' = -2 m/s, v₂' = 3 m/s</span><span className="step-desc">trocam velocidades</span></div></div></div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIMULAÇÃO — Pêndulo Balístico
// ═══════════════════════════════════════════════════════════════════════════════
function SimulacaoPenduloBalistico() {
  const [mProjetil, setMProjetil] = useState(0.05);
  const [mBloco, setMBloco] = useState(0.5);
  const [vProjetil, setVProjetil] = useState(20);
  const [comprimento, setComprimento] = useState(1.2);
  const [disparando, setDisparando] = useState(false);
  const [showVetores, setShowVetores] = useState(true);
  
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const lastRef = useRef(null);
  
  const [projetilX, setProjetilX] = useState(-2);
  const [projetilY, setProjetilY] = useState(0);
  const [projetilV, setProjetilV] = useState(vProjetil);
  const [blocoAngle, setBlocoAngle] = useState(0);
  const [blocoV, setBlocoV] = useState(0);
  const [colidiu, setColidiu] = useState(false);
  const [alturaMax, setAlturaMax] = useState(0);
  
  const mTotal = mProjetil + mBloco;
  const vPosColisao = (mProjetil * vProjetil) / mTotal;
  const hMaxTeorica = (vPosColisao * vPosColisao) / (2 * g);
  const angleMaxTeorico = Math.acos(1 - hMaxTeorica / comprimento);
  
  const blocoX = Math.sin(blocoAngle) * comprimento;
  const blocoY = -Math.cos(blocoAngle) * comprimento;
  
  const disparar = () => {
    setDisparando(true);
    setProjetilX(-2);
    setProjetilY(0);
    setProjetilV(vProjetil);
    setBlocoAngle(0);
    setBlocoV(0);
    setColidiu(false);
    setAlturaMax(0);
  };
  
  useEffect(() => {
    if (!disparando) { lastRef.current = null; return; }
    const step = (now) => {
      if (lastRef.current !== null) {
        let dt = Math.min((now - lastRef.current) / 1000, 0.02);
        if (!colidiu) {
          let newX = projetilX + projetilV * dt;
          const distancia = Math.hypot(newX - blocoX, projetilY - blocoY);
          if (distancia < 0.15) {
            setColidiu(true);
            setDisparando(false);
            setBlocoV(vPosColisao / comprimento);
            setAlturaMax(blocoY + comprimento);
          } else {
            setProjetilX(newX);
          }
        } else {
          const alpha = -(g / comprimento) * Math.sin(blocoAngle);
          const newV = blocoV + alpha * dt;
          const newAngle = blocoAngle + newV * dt;
          setBlocoV(newV);
          setBlocoAngle(newAngle);
          const currentH = comprimento * (1 - Math.cos(newAngle));
          if (currentH > alturaMax) setAlturaMax(currentH);
        }
      }
      lastRef.current = now;
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [disparando, colidiu, projetilX, projetilV, blocoAngle, blocoV, comprimento, vPosColisao]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;
    ctx.clearRect(0, 0, W, H);
    
    const cx = W / 2;
    const baseY = H * 0.3;
    const escala = Math.min(W, H) / 5;
    const toX = (x) => cx + x * escala;
    const toY = (y) => baseY - y * escala;
    
    // Suporte
    ctx.fillStyle = '#334155';
    ctx.fillRect(cx - 40, baseY - 18, 80, 18);
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(cx, baseY, 10, 0, TAU);
    ctx.fill();
    
    // Fio
    const pX = toX(blocoX);
    const pY = toY(blocoY);
    ctx.beginPath();
    ctx.moveTo(cx, baseY);
    ctx.lineTo(pX, pY);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Bloco
    ctx.fillStyle = '#60a5fa';
    ctx.fillRect(pX - 20, pY - 20, 40, 40);
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(pX - 20, pY - 20, 40, 10);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px Fira Code';
    ctx.textAlign = 'center';
    ctx.fillText(`${fmt(mBloco)}kg`, pX, pY);
    
    // Projétil
    if (!colidiu && disparando) {
      const projX = toX(projetilX);
      const projY = toY(projetilY);
      ctx.beginPath();
      ctx.arc(projX, projY, 6, 0, TAU);
      ctx.fillStyle = '#f87171';
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.fillText(`${fmt(mProjetil)}kg`, projX, projY - 8);
    }
    
    // Régua
    ctx.beginPath();
    ctx.moveTo(cx + 80, baseY);
    ctx.lineTo(cx + 80, baseY - comprimento * escala);
    ctx.strokeStyle = 'rgba(251,191,36,0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    const hAtual = comprimento * (1 - Math.cos(blocoAngle));
    const hY = baseY - hAtual * escala;
    ctx.beginPath();
    ctx.moveTo(cx + 75, hY);
    ctx.lineTo(cx + 85, hY);
    ctx.stroke();
    ctx.fillStyle = '#fbbf24';
    ctx.fillText(`h = ${fmt(hAtual, 3)}m`, cx + 90, hY);
    
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(100,116,139,0.9)';
    ctx.font = '10px Fira Code';
    ctx.fillText(`v_projétil = ${fmt(vProjetil)} m/s`, 12, 30);
    ctx.fillText(`v_conjunto = ${fmt(vPosColisao, 2)} m/s`, 12, 50);
    ctx.fillText(`h_máx teórica = ${fmt(hMaxTeorica, 3)} m`, 12, 70);
    ctx.fillText(`h_máx real = ${fmt(alturaMax, 3)} m`, 12, 90);
  }, [projetilX, blocoAngle, comprimento, mBloco, mProjetil, vProjetil, colidiu, disparando, vPosColisao, hMaxTeorica, alturaMax]);
  
  const reset = () => {
    setDisparando(false);
    setColidiu(false);
    setProjetilX(-2);
    setBlocoAngle(0);
    setAlturaMax(0);
  };
  
  return (
    <div className="content">
      <div className="sidebar-l">
        <div className="section-label">Parâmetros</div>
        <div className="ctrl"><div className="ctrl-head"><span className="ctrl-name">Massa do Projétil m</span><span className="ctrl-num">{fmt(mProjetil, 3)} kg</span></div><input type="range" min="0.01" max="0.2" step="0.005" value={mProjetil} onChange={e => setMProjetil(+e.target.value)} /></div>
        <div className="ctrl"><div className="ctrl-head"><span className="ctrl-name">Massa do Bloco M</span><span className="ctrl-num">{fmt(mBloco, 2)} kg</span></div><input type="range" min="0.1" max="2" step="0.05" value={mBloco} onChange={e => setMBloco(+e.target.value)} /></div>
        <div className="ctrl"><div className="ctrl-head"><span className="ctrl-name">Velocidade do Projétil</span><span className="ctrl-num">{fmt(vProjetil)} m/s</span></div><input type="range" min="5" max="50" step="1" value={vProjetil} onChange={e => setVProjetil(+e.target.value)} /></div>
        <div className="ctrl"><div className="ctrl-head"><span className="ctrl-name">Comprimento do Fio L</span><span className="ctrl-num">{fmt(comprimento, 2)} m</span></div><input type="range" min="0.5" max="2" step="0.05" value={comprimento} onChange={e => setComprimento(+e.target.value)} /></div>
        <label className="toggle-row"><input type="checkbox" checked={showVetores} onChange={e => setShowVetores(e.target.checked)} /><span className="toggle-label" style={{ color: '#a78bfa' }}>Mostrar vetores</span></label>
        <div className="btn-row"><button className="btn btn-primary" onClick={disparar} disabled={disparando}>🎯 Disparar</button><button className="btn btn-danger" onClick={reset}>↩ Reset</button></div>
      </div>
      <div className="main-area"><div className="canvas-wrap"><canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} /></div></div>
      <div className="sidebar-r">
        <div className="section-label">Resultados</div>
        <div className="card"><div className="stat-row"><span className="stat-label">Momento inicial</span><span className="stat-val accent">{fmt(mProjetil * vProjetil, 3)} kg·m/s</span></div><div className="stat-row"><span className="stat-label">Velocidade pós-colisão</span><span className="stat-val green">{fmt(vPosColisao, 2)} m/s</span></div><div className="stat-row"><span className="stat-label">Altura máxima teórica</span><span className="stat-val gold">{fmt(hMaxTeorica, 3)} m</span></div><div className="stat-row"><span className="stat-label">Ângulo máximo</span><span className="stat-val purple">{fmt(angleMaxTeorico * 180 / Math.PI, 1)}°</span></div></div>
        <div className="section-label">Equações</div>
        <div className="eq-block"><div className="eq-title">Conservação do Momento</div>m·v = (M + m)·V</div>
        <div className="eq-block"><div className="eq-title">Conservação da Energia</div>½(M+m)·V² = (M+m)·g·h</div>
        <div className="eq-block"><div className="eq-title">Velocidade do Projétil</div>v = (M+m)/m · √(2gh)</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CÁLCULO — Pêndulo Balístico
// ═══════════════════════════════════════════════════════════════════════════════
function CalculoPenduloBalistico() {
  return (
    <div className="calc-page">
      <div className="calc-section"><div className="calc-h2">1. O Pêndulo Balístico</div><p className="calc-p">Dispositivo clássico para medir velocidade de projéteis. Um projétil de massa m atinge um bloco de massa M e fica alojado (colisão perfeitamente inelástica).</p></div>
      <div className="calc-section"><div className="calc-h2">2. Colisão (1ª etapa)</div><p className="calc-p">Na colisão, o momento linear se conserva: m·v = (M + m)·V → V = m·v/(M+m)</p></div>
      <div className="calc-section"><div className="calc-h2">3. Subida do Pêndulo (2ª etapa)</div><p className="calc-p">Após a colisão, a energia mecânica se conserva: ½(M+m)·V² = (M+m)·g·h → h = V²/(2g)</p></div>
      <div className="calc-section"><div className="calc-h2">4. Determinando a Velocidade do Projétil</div><div className="big-eq"><div className="derivation-step"><span className="step-num">①</span><span className="step-eq">V = √(2gh)</span><span className="step-desc">da conservação da energia</span></div><div className="derivation-step"><span className="step-num">②</span><span className="step-eq">m·v = (M+m)·√(2gh)</span><span className="step-desc">substituindo</span></div><div className="derivation-step"><span className="step-num">③</span><span className="step-eq">v = (M+m)/m · √(2gh)</span><span className="step-desc">velocidade do projétil</span></div></div></div>
      <div className="calc-section"><div className="calc-h2">5. Relação com o Ângulo</div><p className="calc-p">A altura h está relacionada ao ângulo θ: h = L·(1 - cosθ). Portanto: v = (M+m)/m · √(2gL(1 - cosθ))</p></div>
      <div className="calc-section"><div className="calc-h2">6. Derivadas e Energia</div><p className="calc-p">A taxa de variação da energia potencial: dEₚ/dh = (M+m)·g. A força restauradora: F = -dEₚ/dx = -(M+m)·g·senθ</p></div>
      <div className="calc-section"><div className="calc-h2">7. Exemplo Numérico</div><p className="calc-p">Considere m = 50g, M = 500g, v = 20 m/s, L = 1.2m</p><div className="big-eq"><div className="derivation-step"><span className="step-num">①</span><span className="step-eq">V = 0.05·20/0.55 = 1.82 m/s</span><span className="step-desc">velocidade após colisão</span></div><div className="derivation-step"><span className="step-num">②</span><span className="step-eq">h = (1.82)²/(2·9.8) = 0.169 m</span><span className="step-desc">altura máxima</span></div><div className="derivation-step"><span className="step-num">③</span><span className="step-eq">θ = arccos(1 - 0.169/1.2) = 30.5°</span><span className="step-desc">ângulo máximo</span></div></div></div>
    </div>
  );
}