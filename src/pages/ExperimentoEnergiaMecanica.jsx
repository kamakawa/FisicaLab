// ExperimentoEnergiaMecanica.jsx
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

.energia-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}
.energia-bar-label {
  font-size: 10px;
  font-family: var(--mono);
  width: 30px;
}
.energia-bar-fill {
  height: 8px;
  border-radius: 4px;
  transition: width 0.1s ease;
}
`;

const TAU = 2 * Math.PI;
const fmt = (n, d = 2) => n.toFixed(d);
const g = 9.8;

export default function ExperimentoEnergiaMecanica({ onBack }) {
  const [tipoExperimento, setTipoExperimento] = useState('pendulo');
  const [tab, setTab] = useState('sim');

  return (
    <>
      <style>{STYLES}</style>
      <div className="app">
        <header className="header">
          <div>
            <div className="header-title">Energia Mecânica</div>
            <div className="header-sub">Física I · Conservação da Energia · Transformações Eₚ ↔ E꜀</div>
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

        <nav className="exp-selector">
          <button
            className={`exp-tab ${tipoExperimento === 'pendulo' ? 'active' : ''}`}
            onClick={() => setTipoExperimento('pendulo')}
          >
            🕰️ Pêndulo Simples
          </button>
          <button
            className={`exp-tab ${tipoExperimento === 'loop' ? 'active' : ''}`}
            onClick={() => setTipoExperimento('loop')}
          >
            🎢 Loop (Montanha Russa)
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

        {tab === 'sim' && tipoExperimento === 'pendulo' && <SimulacaoPendulo />}
        {tab === 'calc' && tipoExperimento === 'pendulo' && <CalculoPendulo />}
        {tab === 'sim' && tipoExperimento === 'loop' && <SimulacaoLoop />}
        {tab === 'calc' && tipoExperimento === 'loop' && <CalculoLoop />}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPERIMENTO 1: PÊNDULO SIMPLES
// ═══════════════════════════════════════════════════════════════════════════════
function SimulacaoPendulo() {
  const [massa, setMassa] = useState(1.0);
  const [comprimento, setComprimento] = useState(1.5);
  const [anguloInicial, setAnguloInicial] = useState(45);
  const [atrito, setAtrito] = useState(0.02);
  const [rodando, setRodando] = useState(true);
  const [showVetores, setShowVetores] = useState(true);
  const [showEnergia, setShowEnergia] = useState(true);

  const canvasRef = useRef(null);
  const plotAnguloRef = useRef(null);
  const plotEnergiaRef = useRef(null);
  const plotVelRef = useRef(null);
  
  const rafRef = useRef(null);
  const lastRef = useRef(null);
  
  const [angulo, setAngulo] = useState(anguloInicial * Math.PI / 180);
  const [velAngular, setVelAngular] = useState(0);
  const [tempo, setTempo] = useState(0);
  const [historico, setHistorico] = useState({ ang: [], E_total: [], E_cin: [], E_pot: [], t: [] });

  // Energias
  const h = comprimento * (1 - Math.cos(angulo));
  const Ep = massa * g * h;
  const Ec = 0.5 * massa * Math.pow(velAngular * comprimento, 2);
  const E_total = Ep + Ec;
  const E_inicial = massa * g * comprimento * (1 - Math.cos(anguloInicial * Math.PI / 180));
  const fracaoPerdida = ((E_inicial - E_total) / E_inicial) * 100;

  // Velocidade linear
  const v_linear = velAngular * comprimento;

  // Posição para desenho
  const angRad = angulo;
  const x = Math.sin(angRad) * comprimento;
  const y = -Math.cos(angRad) * comprimento;

  // Tensão no fio
  const T = massa * g * Math.cos(angRad) + massa * Math.pow(velAngular, 2) * comprimento;

  useEffect(() => {
    if (!rodando) { lastRef.current = null; return; }
    
    const step = (now) => {
      if (lastRef.current !== null) {
        let dt = Math.min((now - lastRef.current) / 1000, 0.02);
        
        // Equação do pêndulo com amortecimento: α = -(g/L)·senθ - β·ω
        const alpha = -(g / comprimento) * Math.sin(angulo) - atrito * velAngular;
        const newVelAng = velAngular + alpha * dt;
        const newAng = angulo + newVelAng * dt;
        
        setAngulo(newAng);
        setVelAngular(newVelAng);
        setTempo(prev => prev + dt);
        
        // Histórico
        setHistorico(prev => {
          const newHist = { ...prev };
          newHist.ang = [...(prev.ang || []), newAng * 180 / Math.PI];
          newHist.E_total = [...(prev.E_total || []), Ep + Ec];
          newHist.E_cin = [...(prev.E_cin || []), Ec];
          newHist.E_pot = [...(prev.E_pot || []), Ep];
          if (newHist.ang.length > 400) {
            newHist.ang.shift(); newHist.E_total.shift();
            newHist.E_cin.shift(); newHist.E_pot.shift();
          }
          return newHist;
        });
      }
      lastRef.current = now;
      rafRef.current = requestAnimationFrame(step);
    };
    
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [rodando, comprimento, atrito, angulo, velAngular, Ep, Ec]);

  // Reset
  const resetSimulacao = () => {
    setRodando(false);
    setAngulo(anguloInicial * Math.PI / 180);
    setVelAngular(0);
    setTempo(0);
    setHistorico({ ang: [], E_total: [], E_cin: [], E_pot: [], t: [] });
    setRodando(true);
  };

  // Desenho
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;
    ctx.clearRect(0, 0, W, H);
    
    const cx = W / 2;
    const baseY = H * 0.25;
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
    const pX = toX(x);
    const pY = toY(y);
    ctx.beginPath();
    ctx.moveTo(cx, baseY);
    ctx.lineTo(pX, pY);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Esfera
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(pX, pY, 18, 0, TAU);
    const grad = ctx.createRadialGradient(pX - 6, pY - 6, 0, pX, pY, 18);
    grad.addColorStop(0, '#93c5fd');
    grad.addColorStop(1, '#3b82f6');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px Fira Code';
    ctx.textAlign = 'center';
    ctx.fillText(`${fmt(massa)}kg`, pX, pY + 5);
    
    // Vetor peso
    if (showVetores) {
      const escalaForca = 15;
      const pesoX = pX;
      const pesoY = pY + massa * g * escalaForca;
      ctx.beginPath();
      ctx.moveTo(pX, pY);
      ctx.lineTo(pesoX, pesoY);
      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.fillStyle = '#f87171';
      ctx.font = '9px Fira Code';
      ctx.fillText(`P = ${fmt(massa * g)}N`, pesoX + 5, pesoY - 5);
      
      // Vetor tensão
      const T_x = -Math.sin(angRad) * T * escalaForca * 0.3;
      const T_y = -Math.cos(angRad) * T * escalaForca * 0.3;
      ctx.beginPath();
      ctx.moveTo(pX, pY);
      ctx.lineTo(pX + T_x, pY + T_y);
      ctx.strokeStyle = '#a78bfa';
      ctx.stroke();
      ctx.fillStyle = '#a78bfa';
      ctx.fillText(`T = ${fmt(T)}N`, pX + T_x + 5, pY + T_y - 5);
    }
    
    ctx.shadowBlur = 0;
    ctx.textAlign = 'left';
    
    // Informações
    ctx.fillStyle = 'rgba(100,116,139,0.9)';
    ctx.font = '10px Fira Code';
    ctx.fillText(`t = ${fmt(tempo, 2)} s`, 12, 30);
    ctx.fillStyle = '#34d399';
    ctx.fillText(`E_total = ${fmt(E_total, 2)} J`, 12, 55);
    ctx.fillStyle = '#fbbf24';
    ctx.fillText(`E_pot = ${fmt(Ep, 2)} J`, 12, 75);
    ctx.fillStyle = '#60a5fa';
    ctx.fillText(`E_cin = ${fmt(Ec, 2)} J`, 12, 95);
    ctx.fillStyle = '#f87171';
    ctx.fillText(`v = ${fmt(v_linear, 2)} m/s`, 12, 115);
    
    // Barras de energia
    if (showEnergia) {
      const maxE = Math.max(Ep, Ec, E_total, E_inicial);
      const barWidth = 180;
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(W - barWidth - 20, 30, barWidth, 12);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(W - barWidth - 20, 30, (Ep / maxE) * barWidth, 12);
      ctx.fillStyle = '#60a5fa';
      ctx.fillRect(W - barWidth - 20, 48, (Ec / maxE) * barWidth, 12);
      ctx.fillStyle = '#34d399';
      ctx.fillRect(W - barWidth - 20, 66, (E_total / maxE) * barWidth, 12);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '8px Fira Code';
      ctx.fillText('Eₚ', W - barWidth - 25, 39);
      ctx.fillText('E꜀', W - barWidth - 25, 57);
      ctx.fillText('Eₜ', W - barWidth - 25, 75);
    }
    
  }, [angulo, x, y, comprimento, massa, velAngular, v_linear, Ep, Ec, E_total, T, showVetores, showEnergia, tempo]);

  // Gráficos
  const drawPlot = useCallback((ref, data, color, label, yMin, yMax, unidade = '') => {
    const canvas = ref.current;
    if (!canvas || !data || data.length < 2) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, H/2); ctx.lineTo(W, H/2); ctx.stroke();
    const range = (yMax - yMin) || 1;
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = (i / (data.length - 1)) * W;
      const y = H - ((v - yMin) / range) * H;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.font = '9px Fira Code';
    ctx.fillText(label, 6, 14);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText(`${fmt(data[data.length-1], 2)} ${unidade}`, 6, 28);
  }, []);

  useEffect(() => {
    drawPlot(plotAnguloRef, historico.ang, '#f87171', 'θ(t)', -100, 100, '°');
    drawPlot(plotEnergiaRef, historico.E_total, '#34d399', 'E_total(t)', 0, E_inicial * 1.2, 'J');
    drawPlot(plotVelRef, historico.E_cin, '#60a5fa', 'E_cin(t)', 0, E_inicial * 1.2, 'J');
  }, [historico, drawPlot, E_inicial]);

  return (
    <div className="content">
      <div className="sidebar-l">
        <div className="section-label">Parâmetros do Pêndulo</div>
        <div className="ctrl"><div className="ctrl-head"><span className="ctrl-name">Massa m</span><span className="ctrl-num">{fmt(massa, 1)} kg</span></div><input type="range" min="0.2" max="5" step="0.1" value={massa} onChange={e => setMassa(+e.target.value)} /></div>
        <div className="ctrl"><div className="ctrl-head"><span className="ctrl-name">Comprimento L</span><span className="ctrl-num">{fmt(comprimento, 2)} m</span></div><input type="range" min="0.5" max="3" step="0.05" value={comprimento} onChange={e => setComprimento(+e.target.value)} /></div>
        <div className="ctrl"><div className="ctrl-head"><span className="ctrl-name">Ângulo inicial θ₀</span><span className="ctrl-num">{fmt(anguloInicial, 0)}°</span></div><input type="range" min="5" max="80" step="5" value={anguloInicial} onChange={e => setAnguloInicial(+e.target.value)} /></div>
        <div className="ctrl"><div className="ctrl-head"><span className="ctrl-name">Amortecimento β</span><span className="ctrl-num">{fmt(atrito, 3)}</span></div><input type="range" min="0" max="0.1" step="0.002" value={atrito} onChange={e => setAtrito(+e.target.value)} /></div>
        <div className="section-label">Visualização</div>
        <label className="toggle-row"><input type="checkbox" checked={showVetores} onChange={e => setShowVetores(e.target.checked)} /><span className="toggle-label" style={{ color: '#a78bfa' }}>Mostrar vetores (P, T)</span></label>
        <label className="toggle-row"><input type="checkbox" checked={showEnergia} onChange={e => setShowEnergia(e.target.checked)} /><span className="toggle-label" style={{ color: '#34d399' }}>Mostrar barras de energia</span></label>
        <div className="btn-row"><button className="btn btn-primary" onClick={() => setRodando(true)}>▶ Iniciar</button><button className="btn btn-secondary" onClick={() => setRodando(false)}>⏸ Pausar</button></div>
        <div className="btn-row"><button className="btn btn-danger" onClick={resetSimulacao}>↩ Reset</button></div>
      </div>
      <div className="main-area">
        <div className="canvas-wrap"><canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} /></div>
        <div className="plots-strip">
          <div className="plot-box"><div className="plot-title">Ângulo θ(t)</div><canvas ref={plotAnguloRef} style={{ width: '100%', height: '75px' }} /></div>
          <div className="plot-box"><div className="plot-title">Energia Total E(t)</div><canvas ref={plotEnergiaRef} style={{ width: '100%', height: '75px' }} /></div>
          <div className="plot-box"><div className="plot-title">Energia Cinética E꜀(t)</div><canvas ref={plotVelRef} style={{ width: '100%', height: '75px' }} /></div>
        </div>
      </div>
      <div className="sidebar-r">
        <div className="section-label">Energia Mecânica</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">Energia Potencial Eₚ</span><span className="stat-val gold">{fmt(Ep, 2)} J</span></div>
          <div className="stat-row"><span className="stat-label">Energia Cinética E꜀</span><span className="stat-val green">{fmt(Ec, 2)} J</span></div>
          <div className="stat-row"><span className="stat-label">Energia Total Eₜ</span><span className="stat-val accent">{fmt(E_total, 2)} J</span></div>
          <div className="stat-row"><span className="stat-label">Energia Inicial E₀</span><span className="stat-val purple">{fmt(E_inicial, 2)} J</span></div>
          <div className="stat-row"><span className="stat-label">Energia perdida</span><span className="stat-val red">{fmt(fracaoPerdida, 1)}%</span></div>
        </div>
        <div className="section-label">Grandezas Dinâmicas</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">Velocidade linear v</span><span className="stat-val accent">{fmt(v_linear, 2)} m/s</span></div>
          <div className="stat-row"><span className="stat-label">Velocidade angular ω</span><span className="stat-val gold">{fmt(velAngular, 2)} rad/s</span></div>
          <div className="stat-row"><span className="stat-label">Altura h</span><span className="stat-val green">{fmt(h, 3)} m</span></div>
          <div className="stat-row"><span className="stat-label">Tensão no fio T</span><span className="stat-val purple">{fmt(T, 2)} N</span></div>
        </div>
        <div className="section-label">Equações</div>
        <div className="eq-block"><div className="eq-title">Conservação da Energia</div>E₀ = ½mv² + mgh</div>
        <div className="eq-block"><div className="eq-title">Velocidade (qualquer θ)</div>v = √[2gL(cosθ - cosθ₀)]</div>
        <div className="eq-block"><div className="eq-title">Período (pequeno θ)</div>T = 2π√(L/g)</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CÁLCULO — PÊNDULO SIMPLES
// ═══════════════════════════════════════════════════════════════════════════════
function CalculoPendulo() {
  return (
    <div className="calc-page">
      <div className="calc-section"><div className="calc-h2">1. Energia Mecânica no Pêndulo Simples</div><p className="calc-p">A energia mecânica total é a soma da energia potencial gravitacional com a energia cinética:</p><div className="big-eq">E = Eₚ + E꜀ = m·g·h + ½·m·v²</div><p className="calc-p">Onde h = L·(1 - cosθ).</p></div>
      <div className="calc-section"><div className="calc-h2">2. Conservação da Energia</div><p className="calc-p">Na ausência de atrito, a energia mecânica total se conserva. Assim, podemos relacionar a velocidade com o ângulo:</p><div className="big-eq">m·g·L·(1 - cosθ₀) = ½·m·v² + m·g·L·(1 - cosθ)</div><div className="big-eq">v(θ) = √[2gL·(cosθ - cosθ₀)]</div></div>
      <div className="calc-section"><div className="calc-h2">3. Velocidade no Ponto Mais Baixo</div><p className="calc-p">No ponto mais baixo (θ = 0, h = 0), toda energia potencial se converte em cinética:</p><div className="big-eq">v_máx = √(2gL·(1 - cosθ₀))</div></div>
      <div className="calc-section"><div className="calc-h2">4. Derivadas do Movimento</div><p className="calc-p">A posição angular é descrita por θ(t). A velocidade angular é a derivada primeira e a aceleração angular a derivada segunda:</p><div className="big-eq">ω(t) = dθ/dt ; α(t) = d²θ/dt² = dω/dt</div><p className="calc-p">A equação diferencial do pêndulo é: d²θ/dt² + (g/L)·senθ = 0</p></div>
      <div className="calc-section"><div className="calc-h2">5. Trabalho e Potência</div><p className="calc-p">O trabalho realizado pela força peso é igual à variação da energia potencial. A potência instantânea é a derivada temporal da energia:</p><div className="big-eq">W = ΔEₚ = m·g·Δh ; P = dE/dt = <span className="hi-red">F⃗·v⃗</span></div></div>
      <div className="calc-section"><div className="calc-h2">6. Período para Pequenas Oscilações</div><p className="calc-p">Para ângulos pequenos (θ ≪ 1 rad), senθ ≈ θ, e a equação se torna a de um MHS:</p><div className="big-eq">d²θ/dt² + (g/L)·θ = 0 → ω = √(g/L) → T = 2π√(L/g)</div></div>
      <div className="calc-section"><div className="calc-h2">7. Exemplo Numérico</div><p className="calc-p">Considere L = 1.5 m, m = 1 kg, θ₀ = 45°:</p><div className="big-eq"><div className="derivation-step"><span className="step-num">①</span><span className="step-eq">E₀ = 1·9.8·1.5·(1 - cos45°) = 4.31 J</span><span className="step-desc">energia inicial</span></div><div className="derivation-step"><span className="step-num">②</span><span className="step-eq">v_máx = √(2·9.8·1.5·(1 - 0.707)) = 2.94 m/s</span><span className="step-desc">velocidade máxima</span></div><div className="derivation-step"><span className="step-num">③</span><span className="step-eq">T = 2π√(1.5/9.8) = 2.46 s</span><span className="step-desc">período</span></div></div></div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPERIMENTO 2: LOOP (MONTANHA RUSSA)
// ═══════════════════════════════════════════════════════════════════════════════
function SimulacaoLoop() {
  const [massa, setMassa] = useState(500);
  const [raio, setRaio] = useState(3);
  const [alturaInicial, setAlturaInicial] = useState(8);
  const [atrito, setAtrito] = useState(0.05);
  const [rodando, setRodando] = useState(true);
  const [showVetores, setShowVetores] = useState(true);
  const [showEnergia, setShowEnergia] = useState(true);
  const [tempo, setTempo] = useState(0);

  const canvasRef = useRef(null);
  const plotAlturaRef = useRef(null);
  const plotEnergiaRef = useRef(null);
  const plotVelRef = useRef(null);
  
  const rafRef = useRef(null);
  const lastRef = useRef(null);
  
  const [posicao, setPosicao] = useState(0);
  const [velocidade, setVelocidade] = useState(0);
  const [angulo, setAngulo] = useState(0);
  const [historico, setHistorico] = useState({ h: [], E_total: [], E_cin: [], E_pot: [], v: [] });

  // Comprimento total da pista
  const comprimentoRampa = alturaInicial / Math.sin(Math.atan(2));
  const comprimentoLoop = 2 * Math.PI * raio;
  const comprimentoTotal = comprimentoRampa + comprimentoLoop;
  
  // Altura mínima teórica para completar o loop (sem atrito)
  const h_min_teorica = 2.5 * raio;
  const podeCompletar = alturaInicial >= h_min_teorica;
  const alturaCritica = h_min_teorica;
  
  // Posição ao longo da pista
  let alturaAtual = 0;
  let anguloLoop = 0;
  
  if (posicao < comprimentoRampa) {
    const thetaRampa = Math.atan(alturaInicial / comprimentoRampa);
    alturaAtual = posicao * Math.sin(thetaRampa);
    anguloLoop = 0;
  } else {
    const posLoop = (posicao - comprimentoRampa) / raio;
    anguloLoop = posLoop;
    alturaAtual = raio * (1 - Math.cos(anguloLoop));
  }
  
  // Energias
  const Ep = massa * g * alturaAtual;
  const Ec = 0.5 * massa * velocidade * velocidade;
  const E_total = Ep + Ec;
  const E_inicial = massa * g * alturaInicial;
  
  // Força normal no topo do loop
  const v_topo_teorica = Math.sqrt(velocidade * velocidade - 2 * g * (2 * raio));
  const N_topo = massa * (velocidade * velocidade / raio - g);
  const condicaoSegura = N_topo >= 0;
  
  const v_top = velocidade;
  const N_top = massa * (v_top * v_top / raio - g);
  
  // Velocidade mínima no topo
  const v_min_topo = Math.sqrt(g * raio);
  
  // Fração da energia dissipada
  const perdaEnergia = ((E_inicial - E_total) / E_inicial) * 100;
  
  // Força normal em função da posição
  const forcaNormal = massa * (velocidade * velocidade / raio + g * Math.cos(anguloLoop));
  
  useEffect(() => {
    if (!rodando) { lastRef.current = null; return; }
    
    const step = (now) => {
      if (lastRef.current !== null) {
        let dt = Math.min((now - lastRef.current) / 1000, 0.02);
        
        // Determina aceleração (força resultante / massa)
        let aceleracao = 0;
        let novaVelocidade = velocidade;
        let novaPosicao = posicao;
        
        if (posicao < comprimentoRampa) {
          const thetaRampa = Math.atan(alturaInicial / comprimentoRampa);
          const a_grav = g * Math.sin(thetaRampa);
          const a_atrito = atrito * g * Math.cos(thetaRampa);
          aceleracao = a_grav - a_atrito * Math.sign(velocidade);
        } else {
          // No loop, aceleração devido à gravidade
          const angLoop = (posicao - comprimentoRampa) / raio;
          aceleracao = -g * Math.sin(angLoop) - atrito * velocidade;
        }
        
        novaVelocidade = velocidade + aceleracao * dt;
        novaPosicao = posicao + novaVelocidade * dt;
        
        if (novaPosicao < 0) {
          novaPosicao = 0;
          novaVelocidade = 0;
          setRodando(false);
        }
        if (novaPosicao > comprimentoTotal) {
          novaPosicao = comprimentoTotal;
          setRodando(false);
        }
        
        setVelocidade(Math.max(0, novaVelocidade));
        setPosicao(novaPosicao);
        setTempo(prev => prev + dt);
        
        // Histórico
        setHistorico(prev => {
          const newHist = { ...prev };
          newHist.h = [...(prev.h || []), alturaAtual];
          newHist.E_total = [...(prev.E_total || []), Ep + Ec];
          newHist.E_cin = [...(prev.E_cin || []), Ec];
          newHist.E_pot = [...(prev.E_pot || []), Ep];
          newHist.v = [...(prev.v || []), velocidade];
          if (newHist.h.length > 400) {
            newHist.h.shift(); newHist.E_total.shift();
            newHist.E_cin.shift(); newHist.E_pot.shift();
            newHist.v.shift();
          }
          return newHist;
        });
      }
      lastRef.current = now;
      rafRef.current = requestAnimationFrame(step);
    };
    
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [rodando, posicao, velocidade, comprimentoRampa, comprimentoTotal, alturaInicial, atrito, Ep, Ec, massa, g, raio]);

  const resetSimulacao = () => {
    setRodando(false);
    setPosicao(0);
    setVelocidade(0);
    setTempo(0);
    setHistorico({ h: [], E_total: [], E_cin: [], E_pot: [], v: [] });
    setRodando(true);
  };

  // Desenho
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;
    ctx.clearRect(0, 0, W, H);
    
    const cx = W / 2;
    const baseY = H * 0.7;
    const escala = Math.min(W, H) / (2 * raio + alturaInicial + 2);
    
    const toX = (x) => cx + x * escala;
    const toY = (y) => baseY - y * escala;
    
    // Desenha a rampa
    const thetaRampa = Math.atan(alturaInicial / comprimentoRampa);
    const rampaX = Math.cos(thetaRampa) * comprimentoRampa;
    const rampaY = Math.sin(thetaRampa) * comprimentoRampa;
    
    ctx.beginPath();
    ctx.moveTo(toX(-comprimentoRampa), toY(0));
    ctx.lineTo(toX(0), toY(0));
    ctx.lineTo(toX(rampaX), toY(rampaY));
    ctx.strokeStyle = '#4a5568';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    // Desenha o loop
    ctx.beginPath();
    for (let a = 0; a <= Math.PI * 2; a += 0.1) {
      const lx = toX(rampaX + raio * Math.sin(a));
      const ly = toY(rampaY + raio * (1 - Math.cos(a)));
      a === 0 ? ctx.moveTo(lx, ly) : ctx.lineTo(lx, ly);
    }
    ctx.stroke();
    
    // Posição do carrinho
    let carX, carY;
    if (posicao < comprimentoRampa) {
      const t = posicao / comprimentoRampa;
      carX = toX(-comprimentoRampa + t * rampaX);
      carY = toY(0 + t * rampaY);
    } else {
      const angLoop = (posicao - comprimentoRampa) / raio;
      carX = toX(rampaX + raio * Math.sin(angLoop));
      carY = toY(rampaY + raio * (1 - Math.cos(angLoop)));
    }
    
    // Carrinho
    ctx.fillStyle = '#e53e3e';
    ctx.fillRect(carX - 12, carY - 8, 24, 16);
    ctx.fillStyle = '#c53030';
    ctx.fillRect(carX - 12, carY - 8, 24, 5);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 8px Fira Code';
    ctx.textAlign = 'center';
    ctx.fillText(`${fmt(massa/1000, 1)}t`, carX, carY);
    
    // Vetores
    if (showVetores && posicao > comprimentoRampa) {
      const angLoop = (posicao - comprimentoRampa) / raio;
      const escalaForca = 0.5;
      const N_x = Math.cos(angLoop) * forcaNormal * escalaForca;
      const N_y = Math.sin(angLoop) * forcaNormal * escalaForca;
      ctx.beginPath();
      ctx.moveTo(carX, carY);
      ctx.lineTo(carX + N_x, carY + N_y);
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#60a5fa';
      ctx.fillText(`N = ${fmt(forcaNormal, 0)}N`, carX + N_x + 5, carY + N_y - 5);
    }
    
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(100,116,139,0.9)';
    ctx.font = '10px Fira Code';
    ctx.fillText(`v = ${fmt(velocidade, 2)} m/s`, 12, 30);
    ctx.fillStyle = podeCompletar ? '#34d399' : '#f87171';
    ctx.fillText(podeCompletar ? '✓ Condição satisfeita' : '⚠ Altura insuficiente!', 12, 55);
    
    if (!condicaoSegura && posicao > comprimentoRampa + Math.PI * raio) {
      ctx.fillStyle = '#f87171';
      ctx.fillText('⚠ Força normal negativa! O carrinho cairia!', 12, 80);
    }
    
    // Barras de energia
    if (showEnergia) {
      const maxE = Math.max(Ep, Ec, E_total, E_inicial);
      const barWidth = 180;
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(W - barWidth - 20, 30, barWidth, 12);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(W - barWidth - 20, 30, (Ep / maxE) * barWidth, 12);
      ctx.fillStyle = '#60a5fa';
      ctx.fillRect(W - barWidth - 20, 48, (Ec / maxE) * barWidth, 12);
      ctx.fillStyle = '#34d399';
      ctx.fillRect(W - barWidth - 20, 66, (E_total / maxE) * barWidth, 12);
    }
    
    // Marcador da altura crítica
    const yCritico = toY(2 * raio);
    ctx.beginPath();
    ctx.moveTo(cx - 80, yCritico);
    ctx.lineTo(cx + 80, yCritico);
    ctx.strokeStyle = 'rgba(251,191,36,0.5)';
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#fbbf24';
    ctx.font = '8px Fira Code';
    ctx.fillText(`h_min = ${fmt(h_min_teorica)}m`, cx + 85, yCritico);
    
  }, [posicao, velocidade, alturaAtual, Ep, Ec, E_total, E_inicial, comprimentoRampa, raio, alturaInicial, massa, podeCompletar, condicaoSegura, forcaNormal, showVetores, showEnergia, h_min_teorica]);

  // Gráficos
  const drawPlot = useCallback((ref, data, color, label, yMin, yMax, unidade = '') => {
    const canvas = ref.current;
    if (!canvas || !data || data.length < 2) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, H/2); ctx.lineTo(W, H/2); ctx.stroke();
    const range = (yMax - yMin) || 1;
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = (i / (data.length - 1)) * W;
      const y = H - ((v - yMin) / range) * H;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.font = '9px Fira Code';
    ctx.fillText(label, 6, 14);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText(`${fmt(data[data.length-1], 2)} ${unidade}`, 6, 28);
  }, []);

  useEffect(() => {
    drawPlot(plotAlturaRef, historico.h, '#fbbf24', 'h(t) posição', 0, alturaInicial * 1.2, 'm');
    drawPlot(plotEnergiaRef, historico.E_total, '#34d399', 'E_total(t)', 0, E_inicial * 1.2, 'J');
    drawPlot(plotVelRef, historico.v, '#60a5fa', 'v(t) velocidade', 0, Math.sqrt(2 * g * alturaInicial) * 1.2, 'm/s');
  }, [historico, drawPlot, alturaInicial, E_inicial]);

  return (
    <div className="content">
      <div className="sidebar-l">
        <div className="section-label">Parâmetros da Montanha Russa</div>
        <div className="ctrl"><div className="ctrl-head"><span className="ctrl-name">Massa m</span><span className="ctrl-num">{fmt(massa/1000, 1)} t</span></div><input type="range" min="100" max="2000" step="50" value={massa} onChange={e => setMassa(+e.target.value)} /></div>
        <div className="ctrl"><div className="ctrl-head"><span className="ctrl-name">Raio do Loop R</span><span className="ctrl-num">{fmt(raio, 1)} m</span></div><input type="range" min="1" max="6" step="0.2" value={raio} onChange={e => setRaio(+e.target.value)} /></div>
        <div className="ctrl"><div className="ctrl-head"><span className="ctrl-name">Altura inicial h₀</span><span className="ctrl-num">{fmt(alturaInicial, 1)} m</span></div><input type="range" min="2" max="15" step="0.2" value={alturaInicial} onChange={e => setAlturaInicial(+e.target.value)} /></div>
        <div className="ctrl"><div className="ctrl-head"><span className="ctrl-name">Atrito μ</span><span className="ctrl-num">{fmt(atrito, 3)}</span></div><input type="range" min="0" max="0.15" step="0.005" value={atrito} onChange={e => setAtrito(+e.target.value)} /></div>
        <div className="section-label">Visualização</div>
        <label className="toggle-row"><input type="checkbox" checked={showVetores} onChange={e => setShowVetores(e.target.checked)} /><span className="toggle-label" style={{ color: '#60a5fa' }}>Mostrar vetor normal</span></label>
        <label className="toggle-row"><input type="checkbox" checked={showEnergia} onChange={e => setShowEnergia(e.target.checked)} /><span className="toggle-label" style={{ color: '#34d399' }}>Mostrar barras de energia</span></label>
        <div className="btn-row"><button className="btn btn-primary" onClick={() => setRodando(true)}>▶ Iniciar</button><button className="btn btn-secondary" onClick={() => setRodando(false)}>⏸ Pausar</button></div>
        <div className="btn-row"><button className="btn btn-danger" onClick={resetSimulacao}>↩ Reset</button></div>
        {!podeCompletar && <div className="card" style={{ backgroundColor: 'rgba(248,113,113,0.1)', borderColor: '#f87171', marginTop: 12 }}><div className="stat-row"><span className="stat-label">⚠ Altura crítica</span><span className="stat-val red">{fmt(h_min_teorica, 2)} m</span></div><div className="stat-row"><span className="stat-label">Necessário</span><span className="stat-val gold">h ≥ 2.5·R</span></div></div>}
      </div>
      <div className="main-area">
        <div className="canvas-wrap"><canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} /></div>
        <div className="plots-strip">
          <div className="plot-box"><div className="plot-title">Altura h(t)</div><canvas ref={plotAlturaRef} style={{ width: '100%', height: '75px' }} /></div>
          <div className="plot-box"><div className="plot-title">Energia Total E(t)</div><canvas ref={plotEnergiaRef} style={{ width: '100%', height: '75px' }} /></div>
          <div className="plot-box"><div className="plot-title">Velocidade v(t)</div><canvas ref={plotVelRef} style={{ width: '100%', height: '75px' }} /></div>
        </div>
      </div>
      <div className="sidebar-r">
        <div className="section-label">Energia Mecânica</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">Energia Potencial Eₚ</span><span className="stat-val gold">{fmt(Ep/1000, 2)} kJ</span></div>
          <div className="stat-row"><span className="stat-label">Energia Cinética E꜀</span><span className="stat-val green">{fmt(Ec/1000, 2)} kJ</span></div>
          <div className="stat-row"><span className="stat-label">Energia Total Eₜ</span><span className="stat-val accent">{fmt(E_total/1000, 2)} kJ</span></div>
          <div className="stat-row"><span className="stat-label">Energia perdida</span><span className="stat-val red">{fmt(perdaEnergia, 1)}%</span></div>
        </div>
        <div className="section-label">Condições do Loop</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">Altura crítica h_mín</span><span className="stat-val gold">{fmt(h_min_teorica, 2)} m</span></div>
          <div className="stat-row"><span className="stat-label">v_mín no topo</span><span className="stat-val purple">{fmt(v_min_topo, 2)} m/s</span></div>
          <div className="stat-row"><span className="stat-label">Força Normal N</span><span className="stat-val" style={{ color: N_top >= 0 ? '#34d399' : '#f87171' }}>{fmt(N_top/1000, 2)} kN</span></div>
          <div className="stat-row"><span className="stat-label">Completa o loop?</span><span className={`stat-val ${condicaoSegura && podeCompletar ? 'green' : 'red'}`}>{condicaoSegura && podeCompletar ? '✓ Sim' : '✗ Não'}</span></div>
        </div>
        <div className="section-label">Equações</div>
        <div className="eq-block"><div className="eq-title">Altura mínima</div>h_mín = 2.5·R</div>
        <div className="eq-block"><div className="eq-title">Velocidade no topo</div>v = √(g·R)</div>
        <div className="eq-block"><div className="eq-title">Força Centrípeta</div>N + mg = m·v²/R</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CÁLCULO — LOOP (MONTANHA RUSSA)
// ═══════════════════════════════════════════════════════════════════════════════
function CalculoLoop() {
  return (
    <div className="calc-page">
      <div className="calc-section"><div className="calc-h2">1. Conservação da Energia no Loop</div><p className="calc-p">Um carrinho partindo do repouso de uma altura h percorre uma pista com um loop de raio R. A energia mecânica total se conserva (desprezando atrito):</p><div className="big-eq">m·g·h = m·g·(2R) + ½·m·v²</div></div>
      <div className="calc-section"><div className="calc-h2">2. Velocidade no Topo do Loop</div><p className="calc-p">Isolando a velocidade no topo (altura 2R):</p><div className="big-eq">v_topo = √(2g·(h - 2R))</div></div>
      <div className="calc-section"><div className="calc-h2">3. Condição para Completar o Loop</div><p className="calc-p">No topo do loop, a força normal N deve ser ≥ 0. A resultante centrípeta é: N + mg = m·v²/R. Para N ≥ 0:</p><div className="big-eq">m·v²/R ≥ mg → v ≥ √(g·R)</div><p className="calc-p">Substituindo a expressão da velocidade:</p><div className="big-eq">√(2g·(h - 2R)) ≥ √(g·R) → 2g·(h - 2R) ≥ g·R → h - 2R ≥ R/2 → <span className="hi-acc">h ≥ 2.5·R</span></div></div>
      <div className="calc-section"><div className="calc-h2">4. Derivadas e Forças</div><p className="calc-p">A força resultante é a derivada temporal do momento: F = dP/dt. No movimento circular, a aceleração centrípeta é: a_c = v²/R.</p><div className="big-eq">F_c = m·v²/R = m·ω²·R</div></div>
      <div className="calc-section"><div className="calc-h2">5. Trabalho e Potência</div><p className="calc-p">O trabalho da força resultante é igual à variação da energia cinética:</p><div className="big-eq">W = ΔE꜀ = ∫ <span className="hi-red">F⃗</span>·d<span className="hi-acc">r⃗</span></div><p className="calc-p">A potência instantânea é a derivada temporal da energia: P = dE/dt = <span className="hi-red">F⃗·v⃗</span></p></div>
      <div className="calc-section"><div className="calc-h2">6. Força Normal ao Longo do Loop</div><p className="calc-p">Em qualquer ponto do loop, a força normal é dada por:</p><div className="big-eq">N(θ) = m·v²/R - m·g·cosθ</div><p className="calc-p">Onde θ é medido a partir do topo.</p></div>
      <div className="calc-section"><div className="calc-h2">7. Exemplo Numérico</div><p className="calc-p">Considere R = 3 m, m = 500 kg:</p><div className="big-eq"><div className="derivation-step"><span className="step-num">①</span><span className="step-eq">h_mín = 2.5·3 = 7.5 m</span><span className="step-desc">altura mínima teórica</span></div><div className="derivation-step"><span className="step-num">②</span><span className="step-eq">v_topo = √(9.8·3) = 5.42 m/s</span><span className="step-desc">velocidade mínima no topo</span></div><div className="derivation-step"><span className="step-num">③</span><span className="step-eq">N = 500·(5.42²/3 - 9.8) = 0 N</span><span className="step-desc">condição crítica</span></div></div></div>
    </div>
  );
}