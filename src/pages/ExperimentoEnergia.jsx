// src/pages/ExperimentoEnergia.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import CanvasEnergia from '../components/CanvasEnergia';
import EnergiaCalculus from '../components/EnergiaCalculus';

// ─── Estilos globais ─────────────────────────────────────────────────────────
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Fira+Code:wght@400;500;600&family=Playfair+Display:ital,wght@0,700;1,400&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:       #07090f;
  --surface:  #0d1117;
  --panel:    #111827;
  --border:   rgba(255,255,255,0.07);
  --accent:   #10b981;
  --gold:     #fbbf24;
  --green:    #34d399;
  --red:      #f87171;
  --purple:   #a78bfa;
  --orange:   #f97316;
  --text:     #e2e8f0;
  --muted:    #64748b;
  --mono:     'Fira Code', monospace;
  --sans:     'Space Grotesk', sans-serif;
}

body { background: var(--bg); }

.app-energia {
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  font-family: var(--sans);
  font-size: 14px;
}

/* Header */
.header-energia {
  border-bottom: 1px solid var(--border);
  padding: 18px 32px;
  display: flex;
  align-items: baseline;
  gap: 20px;
  background: linear-gradient(90deg, rgba(16,185,129,0.06) 0%, transparent 60%);
}
.header-title-energia {
  font-family: 'Playfair Display', serif;
  font-size: 26px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.5px;
}
.header-sub-energia {
  font-size: 12px;
  color: var(--muted);
  letter-spacing: 0.15em;
  text-transform: uppercase;
}
.header-tag-energia {
  margin-left: auto;
  font-size: 11px;
  color: var(--accent);
  border: 1px solid rgba(16,185,129,0.3);
  padding: 3px 10px;
  border-radius: 20px;
  font-family: var(--mono);
}

/* Tabs principais */
.tabs-energia {
  display: flex;
  gap: 2px;
  padding: 12px 32px 0;
  border-bottom: 1px solid var(--border);
}
.tab-energia {
  padding: 10px 24px;
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
.tab-energia:hover { color: var(--text); }
.tab-energia.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}

/* Layout grid principal - apenas para aba de simulação */
.content-energia {
  display: grid;
  grid-template-columns: 320px 1fr 300px;
  gap: 0;
  height: calc(100vh - 104px);
}

/* Layout para aba de teoria - centralizado */
.theory-container {
  height: calc(100vh - 104px);
  overflow-y: auto;
  padding: 24px 32px;
  max-width: 1000px;
  margin: 0 auto;
}

/* Sidebars */
.sidebar-left-energia, .sidebar-right-energia {
  overflow-y: auto;
  padding: 20px;
  background: var(--panel);
}
.sidebar-left-energia {
  border-right: 1px solid var(--border);
}
.sidebar-right-energia {
  border-left: 1px solid var(--border);
}

/* Área central */
.main-area-energia {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: radial-gradient(ellipse at 50% 50%, #0f1829 0%, #07090f 80%);
}

.canvas-wrap-energia {
  flex: 1;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.canvas-wrap-energia canvas {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

/* Status bar */
.status-bar-energia {
  margin: 16px 20px;
  padding: 12px 20px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  font-family: var(--mono);
  font-size: 12px;
  border: 1px solid rgba(255,255,255,0.05);
}
.status-bar-energia span { color: var(--accent); }
.status-bar-energia span:first-child { color: var(--gold); }
.status-bar-energia span:last-child { color: var(--green); }

/* Cards e controles */
.section-label-energia {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.18em;
  color: var(--muted);
  text-transform: uppercase;
  margin-bottom: 12px;
  margin-top: 20px;
}
.section-label-energia:first-child { margin-top: 0; }

.ctrl-energia {
  margin-bottom: 18px;
}
.ctrl-head-energia {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 12px;
}
.ctrl-name-energia { color: var(--muted); }
.ctrl-num-energia {
  font-family: var(--mono);
  color: var(--accent);
}
.ctrl-num-energia.special { color: var(--gold); }
.ctrl-num-energia.risk { color: var(--red); }

input[type=range] {
  width: 100%;
  height: 4px;
  -webkit-appearance: none;
  background: rgba(100,100,100,0.2);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}
input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--accent);
  border: 2px solid var(--bg);
  cursor: pointer;
  transition: all 0.2s;
}
input[type=range]::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  background: var(--green);
}

/* Botões */
.btn-row-energia {
  display: flex;
  gap: 10px;
  margin: 16px 0;
}
.btn-energia {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-family: var(--sans);
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s;
}
.btn-primary-energia {
  background: var(--accent);
  color: #07090f;
}
.btn-primary-energia:hover {
  background: #0d9488;
  transform: translateY(-1px);
}
.btn-secondary-energia {
  background: rgba(255,255,255,0.06);
  color: var(--text);
  border: 1px solid var(--border);
}
.btn-secondary-energia:hover {
  background: rgba(255,255,255,0.1);
}
.btn-reset-energia {
  background: rgba(248,113,113,0.15);
  color: var(--red);
  border: 1px solid rgba(248,113,113,0.2);
}
.btn-reset-energia:hover {
  background: rgba(248,113,113,0.25);
}

/* Card de métricas */
.metrics-card-energia {
  background: rgba(0,0,0,0.3);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px;
  margin: 16px 0;
}
.metric-row-energia {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 8px 0;
  border-bottom: 1px solid var(--border);
}
.metric-row-energia:last-child { border-bottom: none; }
.metric-label-energia {
  font-size: 11px;
  color: var(--muted);
}
.metric-value-energia {
  font-family: var(--mono);
  font-size: 14px;
  font-weight: 600;
  color: var(--purple);
}
.metric-value-energia.accent { color: var(--accent); }
.metric-value-energia.green { color: var(--green); }
.metric-value-energia.gold { color: var(--gold); }
.metric-value-energia.red { color: var(--red); }
.metric-value-energia.orange { color: var(--orange); }

/* Barra de energia */
.energy-bar-energia {
  background: rgba(0,0,0,0.3);
  border-radius: 10px;
  padding: 12px;
  margin: 16px 0;
}
.energy-bar-label {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  margin-bottom: 8px;
}
.energy-bar-track {
  height: 8px;
  background: rgba(255,255,255,0.1);
  border-radius: 4px;
  overflow: hidden;
  display: flex;
}
.energy-bar-kinetic {
  background: var(--green);
  transition: width 0.1s ease;
}
.energy-bar-potential {
  background: var(--orange);
  transition: width 0.1s ease;
}
.energy-bar-total {
  background: var(--accent);
  width: 100%;
  height: 2px;
  margin-top: 6px;
  border-radius: 1px;
}

/* Checkbox */
.toggle-row-energia {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 12px 0;
  cursor: pointer;
}
.toggle-row-energia input {
  width: 16px;
  height: 16px;
  accent-color: var(--accent);
  cursor: pointer;
}
.toggle-label-energia {
  font-size: 12px;
  color: var(--muted);
}

/* Eq blocks na sidebar direita */
.eq-block-energia {
  background: var(--surface);
  border: 1px solid var(--border);
  border-left: 3px solid var(--accent);
  border-radius: 0 10px 10px 0;
  padding: 12px 14px;
  margin-bottom: 10px;
  font-family: var(--mono);
  font-size: 11px;
  line-height: 1.8;
  color: var(--text);
}
.eq-block-energia .eq-title-energia {
  font-family: var(--sans);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 6px;
}
.eq-block-energia .sym { color: var(--gold); }
.eq-block-energia .op { color: var(--purple); }
.eq-block-energia .cmt { color: var(--muted); font-style: italic; }
`;

// ─── Componente principal ────────────────────────────────────────────────────
export default function ExperimentoEnergia() {
  const [activeTab, setActiveTab] = useState("sim");
  const [massa, setMassa] = useState(2);
  const [altura, setAltura] = useState(10);
  const [velocidade, setVelocidade] = useState(0);
  const [gravidade, setGravidade] = useState(9.81);
  const [atrito, setAtrito] = useState(0);
  const [tempo, setTempo] = useState(0);
  const [rodando, setRodando] = useState(false);
  const [showVectors, setShowVectors] = useState(true);
  const [conservativo, setConservativo] = useState(true);

  // Cálculos energéticos
  const energiaPotencial = massa * gravidade * Math.max(0, altura);
  const energiaCinetica = 0.5 * massa * velocidade * velocidade;
  const energiaTotal = energiaPotencial + energiaCinetica;
  const energiaInicial = massa * gravidade * 10;
  const trabalhoAtrito = atrito * Math.abs(altura - 10);
  const eficiencia = energiaInicial > 0 ? (energiaTotal / energiaInicial) * 100 : 100;

  // Animação
  const rafRef = useRef(null);
  const lastTimeRef = useRef(null);

  const loop = useCallback(
    (now) => {
      if (!rodando) return;
      if (lastTimeRef.current === null) {
        lastTimeRef.current = now;
        rafRef.current = requestAnimationFrame(loop);
        return;
      }
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = now;

      setAltura((prev) => {
        let novaAltura = prev;
        let novaVelocidade = velocidade;
        
        if (conservativo) {
          novaAltura = Math.max(0, altura - velocidade * dt - 0.5 * gravidade * dt * dt);
          novaVelocidade = velocidade + gravidade * dt;
        } else {
          const aceleracaoEfetiva = gravidade - atrito / massa;
          novaAltura = Math.max(0, altura - velocidade * dt - 0.5 * aceleracaoEfetiva * dt * dt);
          novaVelocidade = velocidade + aceleracaoEfetiva * dt;
        }
        
        setVelocidade(novaVelocidade);
        
        if (novaAltura <= 0) {
          setRodando(false);
          return 0;
        }
        return novaAltura;
      });
      
      setTempo((prev) => prev + dt);
      rafRef.current = requestAnimationFrame(loop);
    },
    [rodando, altura, velocidade, gravidade, atrito, massa, conservativo]
  );

  useEffect(() => {
    if (rodando) {
      lastTimeRef.current = null;
      rafRef.current = requestAnimationFrame(loop);
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [rodando, loop]);

  const handleReset = () => {
    setRodando(false);
    setAltura(10);
    setVelocidade(0);
    setTempo(0);
  };

  const handleLancar = () => {
    setVelocidade(0);
    setAltura(10);
    setTempo(0);
    setRodando(true);
  };

  const barraCinética = (energiaCinetica / (energiaTotal || 1)) * 100;
  const barraPotencial = (energiaPotencial / (energiaTotal || 1)) * 100;

  return (
    <>
      <style>{STYLES}</style>
      <div className="app-energia">
        <header className="header-energia">
          <div>
            <div className="header-title-energia">Trabalho e Energia Mecânica</div>
            <div className="header-sub-energia">Conservação · Dissipação · Teorema Trabalho-Energia</div>
          </div>
          <span className="header-tag-energia">v2.0 · Interativo</span>
        </header>

        <nav className="tabs-energia">
          <button
            className={`tab-energia ${activeTab === "sim" ? "active" : ""}`}
            onClick={() => setActiveTab("sim")}
          >
            🎮 Simulação
          </button>
          <button
            className={`tab-energia ${activeTab === "calculus" ? "active" : ""}`}
            onClick={() => setActiveTab("calculus")}
          >
            📚 Teoria & Cálculo
          </button>
        </nav>

        {/* ABA DE SIMULAÇÃO - com sidebar direita apenas para equações rápidas */}
        {activeTab === "sim" && (
          <div className="content-energia">
            {/* Sidebar esquerda - controles */}
            <div className="sidebar-left-energia">
              <div className="section-label-energia">Parâmetros do Sistema</div>

              <div className="ctrl-energia">
                <div className="ctrl-head-energia">
                  <span className="ctrl-name-energia">Massa (m)</span>
                  <span className="ctrl-num-energia">{massa.toFixed(1)} kg</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="20"
                  step="0.5"
                  value={massa}
                  onChange={(e) => {
                    setMassa(Number(e.target.value));
                    handleReset();
                  }}
                />
              </div>

              <div className="ctrl-energia">
                <div className="ctrl-head-energia">
                  <span className="ctrl-name-energia">Altura inicial (h₀)</span>
                  <span className="ctrl-num-energia special">{altura.toFixed(1)} m</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="0.5"
                  value={altura}
                  onChange={(e) => {
                    setAltura(Number(e.target.value));
                    handleReset();
                  }}
                />
              </div>

              <div className="ctrl-energia">
                <div className="ctrl-head-energia">
                  <span className="ctrl-name-energia">Gravidade (g)</span>
                  <span className="ctrl-num-energia">{gravidade.toFixed(2)} m/s²</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="0.1"
                  value={gravidade}
                  onChange={(e) => {
                    setGravidade(Number(e.target.value));
                    handleReset();
                  }}
                />
              </div>

              <div className="ctrl-energia">
                <div className="ctrl-head-energia">
                  <span className="ctrl-name-energia">Força de atrito (F<sub>at</sub>)</span>
                  <span className="ctrl-num-energia risk">{atrito.toFixed(1)} N</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  value={atrito}
                  onChange={(e) => {
                    setAtrito(Number(e.target.value));
                    handleReset();
                  }}
                />
              </div>

              <div className="section-label-energia">Configurações</div>

              <label className="toggle-row-energia">
                <input
                  type="checkbox"
                  checked={conservativo}
                  onChange={(e) => setConservativo(e.target.checked)}
                />
                <span className="toggle-label-energia">Sistema conservativo (sem perdas)</span>
              </label>

              <label className="toggle-row-energia">
                <input
                  type="checkbox"
                  checked={showVectors}
                  onChange={(e) => setShowVectors(e.target.checked)}
                />
                <span className="toggle-label-energia">Mostrar vetores de força</span>
              </label>

              <div className="section-label-energia">Controles</div>

              <div className="btn-row-energia">
                <button className="btn-energia btn-primary-energia" onClick={handleLancar} disabled={altura <= 0}>
                  ▶ Lançar
                </button>
                <button className="btn-energia btn-secondary-energia" onClick={() => setRodando(false)}>
                  ⏸ Pausar
                </button>
                <button className="btn-energia btn-reset-energia" onClick={handleReset}>
                  ⟳ Reset
                </button>
              </div>

              <div className="section-label-energia">Energias Instantâneas</div>

              <div className="energy-bar-energia">
                <div className="energy-bar-label">
                  <span style={{ color: "#34d399" }}>Energia Cinética (E<sub>c</sub>)</span>
                  <span style={{ color: "#34d399" }}>{energiaCinetica.toFixed(2)} J</span>
                </div>
                <div className="energy-bar-track">
                  <div className="energy-bar-kinetic" style={{ width: `${barraCinética}%` }} />
                </div>
                <div className="energy-bar-label" style={{ marginTop: 8 }}>
                  <span style={{ color: "#f97316" }}>Energia Potencial (E<sub>p</sub>)</span>
                  <span style={{ color: "#f97316" }}>{energiaPotencial.toFixed(2)} J</span>
                </div>
                <div className="energy-bar-track">
                  <div className="energy-bar-potential" style={{ width: `${barraPotencial}%` }} />
                </div>
                <div className="energy-bar-label" style={{ marginTop: 8 }}>
                  <span style={{ color: "#10b981" }}>Energia Total (E<sub>mec</sub>)</span>
                  <span style={{ color: "#10b981" }}>{energiaTotal.toFixed(2)} J</span>
                </div>
                <div className="energy-bar-total" />
              </div>

              <div className="metrics-card-energia">
                <div className="metric-row-energia">
                  <span className="metric-label-energia">Eficiência</span>
                  <span className="metric-value-energia accent">{eficiencia.toFixed(1)}%</span>
                </div>
                <div className="metric-row-energia">
                  <span className="metric-label-energia">Trabalho do peso</span>
                  <span className="metric-value-energia gold">{(massa * gravidade * (10 - altura)).toFixed(2)} J</span>
                </div>
              </div>
            </div>

            {/* Área central - canvas */}
            <div className="main-area-energia">
              <div className="canvas-wrap-energia">
                <CanvasEnergia
                  massa={massa}
                  altura={altura}
                  velocidade={velocidade}
                  gravidade={gravidade}
                  energiaPotencial={energiaPotencial}
                  energiaCinetica={energiaCinetica}
                  energiaTotal={energiaTotal}
                  showVectors={showVectors}
                  conservativo={conservativo}
                  atrito={atrito}
                />
              </div>

              <div className="status-bar-energia">
                <span>⏱ Tempo: {tempo.toFixed(2)} s</span>
                <span>📏 Altura: {altura.toFixed(2)} m</span>
                <span>⚡ Velocidade: {velocidade.toFixed(2)} m/s</span>
              </div>
            </div>

            {/* Sidebar direita - apenas equações fundamentais de referência rápida */}
            <div className="sidebar-right-energia">
              <div className="section-label-energia">Equações Fundamentais</div>

              <div className="eq-block-energia">
                <div className="eq-title-energia">Energia Cinética</div>
                <span className="sym">E</span><sub>c</sub> <span className="op">=</span> <span className="op">½</span> <span className="op">·</span> m <span className="op">·</span> v²
              </div>

              <div className="eq-block-energia">
                <div className="eq-title-energia">Energia Potencial</div>
                <span className="sym">E</span><sub>p</sub> <span className="op">=</span> m <span className="op">·</span> g <span className="op">·</span> h
              </div>

              <div className="eq-block-energia">
                <div className="eq-title-energia">Energia Mecânica</div>
                <span className="sym">E</span><sub>mec</sub> <span className="op">=</span> <span className="sym">E</span><sub>c</sub> <span className="op">+</span> <span className="sym">E</span><sub>p</sub>
              </div>

              <div className="eq-block-energia">
                <div className="eq-title-energia">Teorema Trabalho-Energia</div>
                <span className="sym">W</span><sub>total</sub> <span className="op">=</span> <span className="sym">ΔE</span><sub>c</sub>
              </div>

              <div className="eq-block-energia">
                <div className="eq-title-energia">Conservação (sist. conservativo)</div>
                <span className="sym">E</span><sub>mec</sub> <span className="op">=</span> constante
              </div>

              <div className="eq-block-energia">
                <div className="eq-title-energia">Potência</div>
                <span className="sym">P</span> <span className="op">=</span> <span className="sym">W</span><span className="op">/</span><span className="sym">Δt</span> <span className="op">=</span> <span className="sym">F⃗</span> <span className="op">·</span> <span className="sym">v⃗</span>
              </div>

              <div className="section-label-energia" style={{ marginTop: 20 }}>
                Valores atuais
              </div>

              <div className="metrics-card-energia">
                <div className="metric-row-energia">
                  <span className="metric-label-energia">E<sub>c</sub></span>
                  <span className="metric-value-energia green">{energiaCinetica.toFixed(2)} J</span>
                </div>
                <div className="metric-row-energia">
                  <span className="metric-label-energia">E<sub>p</sub></span>
                  <span className="metric-value-energia orange">{energiaPotencial.toFixed(2)} J</span>
                </div>
                <div className="metric-row-energia">
                  <span className="metric-label-energia">E<sub>mec</sub></span>
                  <span className="metric-value-energia accent">{energiaTotal.toFixed(2)} J</span>
                </div>
                <div className="metric-row-energia">
                  <span className="metric-label-energia">v</span>
                  <span className="metric-value-energia gold">{velocidade.toFixed(2)} m/s</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA DE TEORIA & CÁLCULO - centralizada, sem sidebars */}
        {activeTab === "calculus" && (
          <div className="theory-container">
            <EnergiaCalculus
              massa={massa}
              altura={altura}
              velocidade={velocidade}
              gravidade={gravidade}
              atrito={atrito}
              energiaPotencial={energiaPotencial}
              energiaCinetica={energiaCinetica}
              energiaTotal={energiaTotal}
              conservativo={conservativo}
            />
          </div>
        )}
      </div>
    </>
  );
}