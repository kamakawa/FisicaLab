// src/pages/ExperimentoLeisNewton.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import CanvasNewton from '../components/CanvasNewton';
import NewtonCalculus from '../components/NewtonCalculus';

// ─── Estilos globais ─────────────────────────────────────────────────────────
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

.app-newton {
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  font-family: var(--sans);
  font-size: 14px;
}

/* Header */
.header-newton {
  border-bottom: 1px solid var(--border);
  padding: 18px 32px;
  display: flex;
  align-items: baseline;
  gap: 20px;
  background: linear-gradient(90deg, rgba(96,165,250,0.06) 0%, transparent 60%);
}
.header-title-newton {
  font-family: 'Playfair Display', serif;
  font-size: 26px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.5px;
}
.header-sub-newton {
  font-size: 12px;
  color: var(--muted);
  letter-spacing: 0.15em;
  text-transform: uppercase;
}
.header-tag-newton {
  margin-left: auto;
  font-size: 11px;
  color: var(--accent);
  border: 1px solid rgba(96,165,250,0.3);
  padding: 3px 10px;
  border-radius: 20px;
  font-family: var(--mono);
}

/* Tabs */
.tabs-newton {
  display: flex;
  gap: 2px;
  padding: 12px 32px 0;
  border-bottom: 1px solid var(--border);
}
.tab-newton {
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
.tab-newton:hover { color: var(--text); }
.tab-newton.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}

/* Layout grid principal */
.content-newton {
  display: grid;
  grid-template-columns: 320px 1fr 320px;
  gap: 0;
  height: calc(100vh - 104px);
}

/* Sidebars */
.sidebar-left-newton, .sidebar-right-newton {
  overflow-y: auto;
  padding: 20px;
  background: var(--panel);
}
.sidebar-left-newton {
  border-right: 1px solid var(--border);
}
.sidebar-right-newton {
  border-left: 1px solid var(--border);
}

/* Área central */
.main-area-newton {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: radial-gradient(ellipse at 50% 50%, #0f1829 0%, #07090f 80%);
}

.canvas-wrap-newton {
  flex: 1;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.canvas-wrap-newton canvas {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

/* Status bar na área central */
.status-bar-newton {
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
.status-bar-newton span {
  color: var(--accent);
}
.status-bar-newton span:first-child { color: var(--gold); }
.status-bar-newton span:last-child { color: var(--green); }

/* Seção de teoria */
.theory-note-newton {
  margin: 0 20px 20px 20px;
  padding: 16px 20px;
  background: rgba(96,165,250,0.05);
  border-left: 3px solid var(--accent);
  border-radius: 10px;
}
.theory-note-newton h4 {
  font-size: 13px;
  color: var(--accent);
  margin-bottom: 8px;
}
.theory-note-newton p {
  font-size: 12px;
  color: var(--muted);
  line-height: 1.6;
}

/* Cards e controles */
.section-label-newton {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.18em;
  color: var(--muted);
  text-transform: uppercase;
  margin-bottom: 12px;
  margin-top: 20px;
}
.section-label-newton:first-child { margin-top: 0; }

.ctrl-newton {
  margin-bottom: 18px;
}
.ctrl-head-newton {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 12px;
}
.ctrl-name-newton {
  color: var(--muted);
}
.ctrl-num-newton {
  font-family: var(--mono);
  color: var(--accent);
}
.ctrl-num-newton.special { color: var(--gold); }
.ctrl-num-newton.risk { color: var(--red); }

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
.btn-row-newton {
  display: flex;
  gap: 10px;
  margin: 16px 0;
}
.btn-newton {
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
.btn-primary-newton {
  background: var(--accent);
  color: #07090f;
}
.btn-primary-newton:hover {
  background: #3b82f6;
  transform: translateY(-1px);
}
.btn-secondary-newton {
  background: rgba(255,255,255,0.06);
  color: var(--text);
  border: 1px solid var(--border);
}
.btn-secondary-newton:hover {
  background: rgba(255,255,255,0.1);
}
.btn-reset-newton {
  background: rgba(248,113,113,0.15);
  color: var(--red);
  border: 1px solid rgba(248,113,113,0.2);
}
.btn-reset-newton:hover {
  background: rgba(248,113,113,0.25);
}

/* Card de métricas */
.metrics-card-newton {
  background: rgba(0,0,0,0.3);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px;
  margin: 16px 0;
}
.metric-row-newton {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 8px 0;
  border-bottom: 1px solid var(--border);
}
.metric-row-newton:last-child { border-bottom: none; }
.metric-label-newton {
  font-size: 11px;
  color: var(--muted);
}
.metric-value-newton {
  font-family: var(--mono);
  font-size: 14px;
  font-weight: 600;
  color: var(--purple);
}
.metric-value-newton.accent { color: var(--accent); }
.metric-value-newton.green { color: var(--green); }
.metric-value-newton.gold { color: var(--gold); }
.metric-value-newton.red { color: var(--red); }

/* Checkbox */
.toggle-row-newton {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 12px 0;
  cursor: pointer;
}
.toggle-row-newton input {
  width: 16px;
  height: 16px;
  accent-color: var(--accent);
  cursor: pointer;
}
.toggle-label-newton {
  font-size: 12px;
  color: var(--muted);
}

/* Eq blocks na sidebar direita */
.eq-block-newton {
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
.eq-block-newton .eq-title-newton {
  font-family: var(--sans);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 6px;
}
.eq-block-newton .sym { color: var(--gold); }
.eq-block-newton .op { color: var(--purple); }
.eq-block-newton .cmt { color: var(--muted); font-style: italic; }
`;

// ─── Componente principal ────────────────────────────────────────────────────
export default function ExperimentoLeisNewton() {
  const [activeTab, setActiveTab] = useState("sim");
  const [massA, setMassA] = useState(5);
  const [massB, setMassB] = useState(3);
  const [muK, setMuK] = useState(0.2);
  const [tempo, setTempo] = useState(0);
  const [rodando, setRodando] = useState(false);
  const [showVectors, setShowVectors] = useState(true);

  const g = 9.81;

  // Cálculos físicos
  const pesoB = massB * g;
  const atritoMax = muK * massA * g;
  const podeMover = pesoB > atritoMax;
  const aceleracao = podeMover ? (pesoB - atritoMax) / (massA + massB) : 0;
  const tracao = podeMover ? massB * (g - aceleracao) : pesoB;

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

      setTempo((prev) => {
        const proxTempo = prev + dt;
        const deslocamento = 0.5 * aceleracao * proxTempo * proxTempo;
        if (deslocamento >= 4.0) {
          setRodando(false);
          return prev;
        }
        return proxTempo;
      });
      rafRef.current = requestAnimationFrame(loop);
    },
    [rodando, aceleracao]
  );

  useEffect(() => {
    if (rodando && podeMover) {
      lastTimeRef.current = null;
      rafRef.current = requestAnimationFrame(loop);
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [rodando, loop, podeMover]);

  const handleReset = () => {
    setRodando(false);
    setTempo(0);
  };

  const deslocamento = 0.5 * aceleracao * tempo * tempo;
  const velocidade = aceleracao * tempo;

  // Status do movimento
  const movimentoStatus = !podeMover ? "REPOUSO INERCIAL" : aceleracao > 0 ? "ACELERADO" : "VELOCIDADE CONSTANTE";

  return (
    <>
      <style>{STYLES}</style>
      <div className="app-newton">
        <header className="header-newton">
          <div>
            <div className="header-title-newton">Leis de Newton</div>
            <div className="header-sub-newton">Dinâmica · Sistemas Acoplados</div>
          </div>
          <span className="header-tag-newton">v2.0 · Interativo</span>
        </header>

        <nav className="tabs-newton">
          <button
            className={`tab-newton ${activeTab === "sim" ? "active" : ""}`}
            onClick={() => setActiveTab("sim")}
          >
            Simulação
          </button>
          <button
            className={`tab-newton ${activeTab === "calculus" ? "active" : ""}`}
            onClick={() => setActiveTab("calculus")}
          >
            Análise Matricial
          </button>
        </nav>

        <div className="content-newton">
          {/* ─── SIDEBAR ESQUERDA — CONTROLES ─── */}
          <div className="sidebar-left-newton">
            <div className="section-label-newton">Parâmetros do Sistema</div>

            <div className="ctrl-newton">
              <div className="ctrl-head-newton">
                <span className="ctrl-name-newton">Massa do Bloco A (mesa)</span>
                <span className="ctrl-num-newton">{massA.toFixed(1)} kg</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                step="0.5"
                value={massA}
                onChange={(e) => {
                  setMassA(Number(e.target.value));
                  handleReset();
                }}
              />
            </div>

            <div className="ctrl-newton">
              <div className="ctrl-head-newton">
                <span className="ctrl-name-newton">Massa do Bloco B (suspenso)</span>
                <span className="ctrl-num-newton special">{massB.toFixed(1)} kg</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                step="0.5"
                value={massB}
                onChange={(e) => {
                  setMassB(Number(e.target.value));
                  handleReset();
                }}
              />
            </div>

            <div className="ctrl-newton">
              <div className="ctrl-head-newton">
                <span className="ctrl-name-newton">Coeficiente de Atrito μ<sub>k</sub></span>
                <span className="ctrl-num-newton risk">{muK.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.8"
                step="0.01"
                value={muK}
                onChange={(e) => {
                  setMuK(Number(e.target.value));
                  handleReset();
                }}
              />
            </div>

            <div className="section-label-newton">Controles</div>

            <div className="btn-row-newton">
              <button
                className="btn-newton btn-primary-newton"
                onClick={() => setRodando(true)}
                disabled={!podeMover}
              >
                ▶ Iniciar
              </button>
              <button
                className="btn-newton btn-secondary-newton"
                onClick={() => setRodando(false)}
              >
                ⏸ Pausar
              </button>
              <button
                className="btn-newton btn-reset-newton"
                onClick={handleReset}
              >
                ⟳ Reset
              </button>
            </div>

            <label className="toggle-row-newton">
              <input
                type="checkbox"
                checked={showVectors}
                onChange={(e) => setShowVectors(e.target.checked)}
              />
              <span className="toggle-label-newton">Mostrar vetores de força</span>
            </label>

            <div className="section-label-newton">Métricas Instantâneas</div>

            <div className="metrics-card-newton">
              <div className="metric-row-newton">
                <span className="metric-label-newton">Tempo</span>
                <span className="metric-value-newton gold">{tempo.toFixed(2)} s</span>
              </div>
              <div className="metric-row-newton">
                <span className="metric-label-newton">Velocidade</span>
                <span className="metric-value-newton green">{velocidade.toFixed(2)} m/s</span>
              </div>
              <div className="metric-row-newton">
                <span className="metric-label-newton">Deslocamento</span>
                <span className="metric-value-newton">{deslocamento.toFixed(2)} m / 4.00 m</span>
              </div>
              <div className="metric-row-newton">
                <span className="metric-label-newton">Aceleração</span>
                <span className="metric-value-newton accent">{aceleracao.toFixed(4)} m/s²</span>
              </div>
              <div className="metric-row-newton">
                <span className="metric-label-newton">Tração no fio</span>
                <span className="metric-value-newton purple">{tracao.toFixed(2)} N</span>
              </div>
              <div className="metric-row-newton">
                <span className="metric-label-newton">Força Motora (P<sub>B</sub>)</span>
                <span className="metric-value-newton">{pesoB.toFixed(2)} N</span>
              </div>
              <div className="metric-row-newton">
                <span className="metric-label-newton">Força de Atrito (f<sub>at</sub>)</span>
                <span className="metric-value-newton red">{atritoMax.toFixed(2)} N</span>
              </div>
            </div>

            <div className="metrics-card-newton">
              <div className="metric-row-newton">
                <span className="metric-label-newton">Status do movimento</span>
                <span
                  className={`metric-value-newton ${podeMover ? "green" : "red"}`}
                  style={{ fontWeight: "bold" }}
                >
                  {movimentoStatus}
                </span>
              </div>
              {!podeMover && (
                <div className="metric-row-newton">
                  <span className="metric-label-newton" style={{ fontSize: 11, color: "#f87171" }}>
                    ⚠ A força motora não vence o atrito — sistema em repouso
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ─── ÁREA CENTRAL — SIMULAÇÃO ─── */}
          <div className="main-area-newton">
            {activeTab === "sim" && (
              <>
                <div className="canvas-wrap-newton">
                  <CanvasNewton
                    massA={massA}
                    massB={massB}
                    deslocamento={Math.min(deslocamento, 4.0)}
                    aceleracao={aceleracao}
                    muK={muK}
                    showVectors={showVectors}
                  />
                </div>

                <div className="status-bar-newton">
                  <span>⏱ Tempo: {tempo.toFixed(2)} s</span>
                  <span>📏 Deslocamento: {Math.min(deslocamento, 4.0).toFixed(2)} m / 4.00 m</span>
                  <span>⚡ Velocidade: {velocidade.toFixed(2)} m/s</span>
                </div>

                <div className="theory-note-newton">
                  <h4>⚡ Ação e Reação Manifesta (3ª Lei de Newton)</h4>
                  <p>
                    A força que o cabo exerce no Bloco A é exatamente igual em magnitude à força que exerce no Bloco B:
                    <strong style={{ color: "#a78bfa" }}> T<sub>A</sub> = T<sub>B</sub> = {tracao.toFixed(1)} N</strong>.
                    As forças internas do par cabo-bloco se cancelam quando analisamos o sistema como um todo,
                    restando apenas as forças externas de gravidade sobre B e o atrito sobre A para ditar a aceleração total.
                  </p>
                </div>
              </>
            )}

            {activeTab === "calculus" && (
              <div style={{ overflowY: "auto", height: "100%", padding: "20px" }}>
                <NewtonCalculus
                  massA={massA}
                  massB={massB}
                  muK={muK}
                  g={g}
                  aceleracao={aceleracao}
                  tracao={tracao}
                />
              </div>
            )}
          </div>

          {/* ─── SIDEBAR DIREITA — EQUAÇÕES ─── */}
          <div className="sidebar-right-newton">
            <div className="section-label-newton">Equações Fundamentais</div>

            <div className="eq-block-newton">
              <div className="eq-title-newton">1ª Lei de Newton — Inércia</div>
              <span className="sym">ΣF⃗</span> <span className="op">=</span> 0 <span className="op">⇔</span> <span className="sym">v⃗</span> = constante
              <br />
              <span className="cmt">// Corpo tende a manter seu estado de movimento</span>
            </div>

            <div className="eq-block-newton">
              <div className="eq-title-newton">2ª Lei de Newton — Princípio Fundamental</div>
              <span className="sym">F⃗</span><sub>res</sub> <span className="op">=</span> m<span className="op">·</span><span className="sym">a⃗</span>
              <br />
              <span className="cmt">Relação fundamental entre força resultante e aceleração</span>
            </div>

            <div className="eq-block-newton">
              <div className="eq-title-newton">3ª Lei de Newton — Ação e Reação</div>
              <span className="sym">F⃗</span><sub>AB</sub> <span className="op">=</span> -<span className="sym">F⃗</span><sub>BA</sub>
              <br />
              <span className="cmt">As forças atuam em pares, sempre em corpos diferentes</span>
            </div>

            <div className="section-label-newton" style={{ marginTop: 20 }}>
              Sistema Acoplado
            </div>

            <div className="eq-block-newton">
              <div className="eq-title-newton">Equações dinâmicas</div>
              Bloco A: <span className="sym">T</span> <span className="op">-</span> <span className="sym">f</span><sub>at</sub> <span className="op">=</span> m<sub>A</sub><span className="op">·</span>a
              <br />
              Bloco B: <span className="sym">P</span><sub>B</sub> <span className="op">-</span> <span className="sym">T</span> <span className="op">=</span> m<sub>B</sub><span className="op">·</span>a
              <br />
              <span className="sym">f</span><sub>at</sub> <span className="op">=</span> μ<sub>k</sub><span className="op">·</span>m<sub>A</sub><span className="op">·</span>g
            </div>

            <div className="eq-block-newton">
              <div className="eq-title-newton">Aceleração do sistema</div>
              a <span className="op">=</span> <span className="op">(</span>m<sub>B</sub>·g <span className="op">-</span> μ<sub>k</sub>·m<sub>A</sub>·g<span className="op">)</span> <span className="op">/</span> <span className="op">(</span>m<sub>A</sub> + m<sub>B</sub><span className="op">)</span>
            </div>

            <div className="eq-block-newton">
              <div className="eq-title-newton">Força de tração</div>
              <span className="sym">T</span> <span className="op">=</span> m<sub>B</sub> <span className="op">·</span> <span className="op">(</span>g <span className="op">-</span> a<span className="op">)</span>
            </div>

            <div className="eq-block-newton">
              <div className="eq-title-newton">Condição de movimento</div>
              m<sub>B</sub>·g <span className="op">&gt;</span> μ<sub>k</sub>·m<sub>A</sub>·g
              <br />
              <span className="cmt">{podeMover ? "✓ Satisfeita → sistema acelera" : "✗ Não satisfeita → sistema em repouso"}</span>
            </div>

            <div className="section-label-newton" style={{ marginTop: 20 }}>
              Valores atuais
            </div>

            <div className="metrics-card-newton">
              <div className="metric-row-newton">
                <span className="metric-label-newton">Peso de B</span>
                <span className="metric-value-newton gold">P<sub>B</sub> = {pesoB.toFixed(2)} N</span>
              </div>
              <div className="metric-row-newton">
                <span className="metric-label-newton">Atrito máximo</span>
                <span className="metric-value-newton red">f<sub>at</sub> = {atritoMax.toFixed(2)} N</span>
              </div>
              <div className="metric-row-newton">
                <span className="metric-label-newton">Razão P<sub>B</sub> / f<sub>at</sub></span>
                <span className="metric-value-newton accent">
                  {(pesoB / (atritoMax || 1)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}