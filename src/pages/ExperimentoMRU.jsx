// src/pages/ExperimentoMRU.jsx
import React, { useState, useEffect } from "react";
import MRU3D from "../components/MRU3D";

export default function ExperimentoMRU() {
  const [velocidade, setVelocidade] = useState(5);
  const [posInicial, setPosInicial] = useState(-5);
  const [tempo, setTempo] = useState(0);
  const [rodando, setRodando] = useState(false);
  const [modo, setModo] = useState("2D");

  // Controles 3D separados
  const [posInicialX, setPosInicialX] = useState(-3);
  const [posInicialY, setPosInicialY] = useState(0);
  const [posInicialZ, setPosInicialZ] = useState(-2);
  const [velocidadeX, setVelocidadeX] = useState(4);
  const [velocidadeY, setVelocidadeY] = useState(2.5);
  const [velocidadeZ, setVelocidadeZ] = useState(1.8);

  useEffect(() => {
    if (!rodando) return;
    const interval = setInterval(() => setTempo(t => t + 0.05), 50);
    return () => clearInterval(interval);
  }, [rodando]);

  // Cálculos de posição 2D
  const x = posInicial + velocidade * tempo;
  const deslocamento = x - posInicial;

  // Para 3D, usamos componentes independentes
  const velocidade3D = {
    x: velocidadeX,
    y: velocidadeY,
    z: velocidadeZ
  };
  const posInicial3D = {
    x: posInicialX,
    y: posInicialY,
    z: posInicialZ
  };

  return (
    <div className="mru-container">
      <style>{`
        .mru-container {
          padding: 20px;
          max-width: 1600px;
          margin: 0 auto;
        }

        .mru-grid {
          display: grid;
          grid-template-columns: 340px 1fr;
          gap: 24px;
        }

        /* Painel de Controle Moderno */
        .mru-panel {
          background: rgba(12, 16, 24, 0.95);
          backdrop-filter: blur(12px);
          border-radius: 24px;
          border: 1px solid rgba(0, 212, 255, 0.25);
          padding: 24px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          transition: all 0.3s ease;
          height: fit-content;
          max-height: calc(100vh - 100px);
          overflow-y: auto;
        }

        .mru-panel::-webkit-scrollbar {
          width: 4px;
        }

        .mru-panel::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.05);
          border-radius: 4px;
        }

        .mru-panel::-webkit-scrollbar-thumb {
          background: #00D4FF;
          border-radius: 4px;
        }

        .mru-panel:hover {
          border-color: rgba(0, 212, 255, 0.5);
          box-shadow: 0 8px 32px rgba(0, 212, 255, 0.1);
        }

        .mru-panel h3 {
          font-family: 'Orbitron', monospace;
          font-size: 1.2rem;
          color: #00D4FF;
          margin: 0 0 8px 0;
          letter-spacing: 2px;
        }

        .mru-panel-sub {
          font-size: 0.7rem;
          color: rgba(255,255,255,0.4);
          font-family: monospace;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .mru-control-group {
          margin-bottom: 18px;
        }

        .mru-control-group label {
          display: flex;
          justify-content: space-between;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #9CA3AF;
          margin-bottom: 6px;
        }

        .mru-control-group input {
          width: 100%;
          background: rgba(0,0,0,0.4);
          border: 1px solid rgba(0,212,255,0.3);
          border-radius: 8px;
          padding: 8px 12px;
          color: white;
          font-family: monospace;
        }

        input[type="range"] {
          padding: 0;
          accent-color: #00D4FF;
        }

        .mru-value {
          color: #00F5C4;
          font-family: monospace;
          font-size: 0.8rem;
        }

        .mru-button-group {
          display: flex;
          gap: 10px;
          margin: 20px 0;
        }

        .mru-btn {
          flex: 1;
          background: rgba(0, 212, 255, 0.1);
          border: 1px solid rgba(0, 212, 255, 0.3);
          color: #00D4FF;
          padding: 10px;
          border-radius: 10px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s;
          font-family: monospace;
          text-transform: uppercase;
          font-size: 0.7rem;
          letter-spacing: 1px;
        }

        .mru-btn:hover {
          background: rgba(0, 212, 255, 0.2);
          border-color: #00D4FF;
          transform: translateY(-2px);
        }

        .mru-btn-primary {
          background: #00D4FF;
          color: #0B0F19;
          border: none;
        }

        .mru-btn-primary:hover {
          background: #00e5ff;
          box-shadow: 0 0 15px rgba(0,212,255,0.4);
        }

        .mru-equation {
          background: rgba(0,0,0,0.5);
          border-radius: 12px;
          padding: 14px;
          margin-top: 16px;
          border-left: 3px solid #00F5C4;
        }

        .mru-equation p {
          margin: 6px 0;
          font-family: 'Fira Code', monospace;
          font-size: 0.8rem;
        }

        .mru-equation .eq-title {
          color: #00F5C4;
          font-size: 0.65rem;
          letter-spacing: 1.5px;
          margin-bottom: 10px;
        }

        .mru-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 16px;
        }

        .mru-stat-card {
          background: rgba(0,0,0,0.3);
          border-radius: 10px;
          padding: 10px;
          text-align: center;
        }

        .mru-stat-label {
          font-size: 0.6rem;
          color: #9CA3AF;
          text-transform: uppercase;
        }

        .mru-stat-value {
          font-family: monospace;
          font-size: 1rem;
          color: #00D4FF;
          font-weight: bold;
        }

        .section-title {
          font-size: 0.7rem;
          color: #00F5C4;
          margin: 16px 0 12px 0;
          letter-spacing: 1.5px;
          border-left: 2px solid #00F5C4;
          padding-left: 10px;
        }

        /* Área de Visualização - MAIOR */
        .mru-viewer {
          background: #05070D;
          border-radius: 24px;
          border: 1px solid rgba(0,212,255,0.2);
          overflow: hidden;
          position: relative;
          height: 70vh;
          min-height: 600px;
        }

        .mru-mode-badge {
          position: absolute;
          top: 16px;
          right: 16px;
          background: rgba(0,0,0,0.75);
          backdrop-filter: blur(8px);
          padding: 6px 14px;
          border-radius: 20px;
          font-family: monospace;
          font-size: 0.7rem;
          letter-spacing: 1.5px;
          color: #00D4FF;
          border: 1px solid rgba(0,212,255,0.3);
          z-index: 10;
          pointer-events: none;
        }

        .mru-mode-selector {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
        }

        .mru-mode-btn {
          flex: 1;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 10px;
          border-radius: 10px;
          cursor: pointer;
          text-align: center;
          font-size: 0.8rem;
          transition: all 0.2s;
        }

        .mru-mode-btn.active {
          background: rgba(0,212,255,0.2);
          border-color: #00D4FF;
          color: #00D4FF;
        }

        .coord-group {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 8px;
          margin-bottom: 12px;
        }

        .coord-input {
          text-align: center;
        }

        .coord-input label {
          font-size: 0.6rem;
          justify-content: center;
          gap: 5px;
        }

        .coord-input input {
          text-align: center;
        }
      `}</style>

      <div className="mru-grid">
        {/* Painel de Controle */}
        <div className="mru-panel">
          <h3>MRU • MOVIMENTO RETILÍNEO UNIFORME</h3>
          <div className="mru-panel-sub">Cinemática Vetorial em 2D e 3D</div>

          <div className="mru-mode-selector">
            <div 
              className={`mru-mode-btn ${modo === '2D' ? 'active' : ''}`}
              onClick={() => { setModo('2D'); setTempo(0); setRodando(false); }}
            >
              📐 2D (Posição × Tempo)
            </div>
            <div 
              className={`mru-mode-btn ${modo === '3D' ? 'active' : ''}`}
              onClick={() => { setModo('3D'); setTempo(0); setRodando(false); }}
            >
              🌍 3D (Espaço Tridimensional)
            </div>
          </div>

          {modo === '2D' ? (
            <>
              <div className="mru-control-group">
                <label>VELOCIDADE (v) <span className="mru-value">{velocidade.toFixed(2)} m/s</span></label>
                <input 
                  type="range" 
                  min="-12" 
                  max="12" 
                  step="0.5"
                  value={velocidade} 
                  onChange={e => { setVelocidade(Number(e.target.value)); setTempo(0); setRodando(false); }}
                />
              </div>

              <div className="mru-control-group">
                <label>POSIÇÃO INICIAL (s₀) <span className="mru-value">{posInicial.toFixed(2)} m</span></label>
                <input 
                  type="range" 
                  min="-15" 
                  max="15" 
                  step="0.5"
                  value={posInicial} 
                  onChange={e => { setPosInicial(Number(e.target.value)); setTempo(0); setRodando(false); }}
                />
              </div>

              <div className="mru-equation">
                <div className="eq-title">📐 EQUAÇÃO HORÁRIA</div>
                <p style={{ fontSize: '0.9rem', textAlign: 'center' }}>
                  s(t) = s₀ + v · t
                </p>
                <p style={{ fontSize: '0.75rem', color: '#aaa', textAlign: 'center' }}>
                  {x.toFixed(2)} = {posInicial.toFixed(2)} + {velocidade.toFixed(2)} · {tempo.toFixed(2)}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="section-title">🎯 POSIÇÃO INICIAL (x₀, y₀, z₀)</div>
              <div className="coord-group">
                <div className="coord-input">
                  <label>X₀ <span style={{ color: '#ff8888' }}>→</span></label>
                  <input 
                    type="range" 
                    min="-8" 
                    max="8" 
                    step="0.5"
                    value={posInicialX} 
                    onChange={e => { setPosInicialX(Number(e.target.value)); setTempo(0); setRodando(false); }}
                  />
                  <span className="mru-value">{posInicialX.toFixed(2)}</span>
                </div>
                <div className="coord-input">
                  <label>Y₀ <span style={{ color: '#88ff88' }}>↑</span></label>
                  <input 
                    type="range" 
                    min="-5" 
                    max="8" 
                    step="0.5"
                    value={posInicialY} 
                    onChange={e => { setPosInicialY(Number(e.target.value)); setTempo(0); setRodando(false); }}
                  />
                  <span className="mru-value">{posInicialY.toFixed(2)}</span>
                </div>
                <div className="coord-input">
                  <label>Z₀ <span style={{ color: '#8888ff' }}>↗</span></label>
                  <input 
                    type="range" 
                    min="-8" 
                    max="8" 
                    step="0.5"
                    value={posInicialZ} 
                    onChange={e => { setPosInicialZ(Number(e.target.value)); setTempo(0); setRodando(false); }}
                  />
                  <span className="mru-value">{posInicialZ.toFixed(2)}</span>
                </div>
              </div>

              <div className="section-title">⚡ VELOCIDADE (vₓ, vᵧ, v_z)</div>
              <div className="coord-group">
                <div className="coord-input">
                  <label>vₓ</label>
                  <input 
                    type="range" 
                    min="-8" 
                    max="8" 
                    step="0.5"
                    value={velocidadeX} 
                    onChange={e => { setVelocidadeX(Number(e.target.value)); setTempo(0); setRodando(false); }}
                  />
                  <span className="mru-value">{velocidadeX.toFixed(2)} m/s</span>
                </div>
                <div className="coord-input">
                  <label>vᵧ</label>
                  <input 
                    type="range" 
                    min="-6" 
                    max="8" 
                    step="0.5"
                    value={velocidadeY} 
                    onChange={e => { setVelocidadeY(Number(e.target.value)); setTempo(0); setRodando(false); }}
                  />
                  <span className="mru-value">{velocidadeY.toFixed(2)} m/s</span>
                </div>
                <div className="coord-input">
                  <label>v_z</label>
                  <input 
                    type="range" 
                    min="-6" 
                    max="8" 
                    step="0.5"
                    value={velocidadeZ} 
                    onChange={e => { setVelocidadeZ(Number(e.target.value)); setTempo(0); setRodando(false); }}
                  />
                  <span className="mru-value">{velocidadeZ.toFixed(2)} m/s</span>
                </div>
              </div>

              <div className="mru-equation">
                <div className="eq-title">📐 FORMA VETORIAL</div>
                <p style={{ fontSize: '0.8rem', textAlign: 'center' }}>
                  r(t) = ({posInicialX.toFixed(1)}, {posInicialY.toFixed(1)}, {posInicialZ.toFixed(1)}) + ({velocidadeX.toFixed(1)}, {velocidadeY.toFixed(1)}, {velocidadeZ.toFixed(1)})·t
                </p>
                <p style={{ fontSize: '0.7rem', color: '#00D4FF', textAlign: 'center' }}>
                  Posição atual: ({ (posInicialX + velocidadeX * tempo).toFixed(2) }, { (posInicialY + velocidadeY * tempo).toFixed(2) }, { (posInicialZ + velocidadeZ * tempo).toFixed(2) })
                </p>
              </div>
            </>
          )}

          <div className="mru-button-group">
            <button className="mru-btn mru-btn-primary" onClick={() => setRodando(true)}>▶ INICIAR</button>
            <button className="mru-btn" onClick={() => setRodando(false)}>⏸ PAUSAR</button>
            <button className="mru-btn" onClick={() => { setTempo(0); setRodando(false); }}>⟳ RESET</button>
          </div>

          <div className="mru-stats">
            <div className="mru-stat-card">
              <div className="mru-stat-label">TEMPO</div>
              <div className="mru-stat-value">{tempo.toFixed(2)} s</div>
            </div>
            <div className="mru-stat-card">
              <div className="mru-stat-label">VELOCIDADE MÓDULO</div>
              <div className="mru-stat-value">
                {modo === '2D' 
                  ? `${Math.abs(velocidade).toFixed(2)} m/s`
                  : `${Math.hypot(velocidadeX, velocidadeY, velocidadeZ).toFixed(2)} m/s`
                }
              </div>
            </div>
          </div>
        </div>

        {/* Área de Visualização - MAIOR */}
        <div className="mru-viewer">
          <div className="mru-mode-badge">
            {modo === '2D' ? '📈 GRÁFICO ESPAÇO × TEMPO' : '🌍 ESPAÇO TRIDIMENSIONAL • MRU'}
          </div>
          {modo === "3D" ? (
            <MRU3D
              velocidade={velocidade3D}
              posInicial={posInicial3D}
              tempo={tempo}
            />
          ) : (
            <MRU2DGraph 
              posInicial={posInicial}
              velocidade={velocidade}
              tempo={tempo}
              rodando={rodando}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Componente 2D profissional com gráfico dinâmico - TAMANHO AJUSTADO
function MRU2DGraph({ posInicial, velocidade, tempo, rodando }) {
  const [viewBox, setViewBox] = useState({ minX: -8, maxX: 20, minY: -10, maxY: 12 });

  useEffect(() => {
    const xAtual = posInicial + velocidade * tempo;
    const margin = 4;
    let newMinX = viewBox.minX;
    let newMaxX = viewBox.maxX;

    if (xAtual < viewBox.minX + margin) {
      newMinX = xAtual - margin;
      newMaxX = newMinX + (viewBox.maxX - viewBox.minX);
    }
    if (xAtual > viewBox.maxX - margin) {
      newMaxX = xAtual + margin;
      newMinX = newMaxX - (viewBox.maxX - viewBox.minX);
    }

    if (newMinX !== viewBox.minX || newMaxX !== viewBox.maxX) {
      setViewBox(prev => ({ ...prev, minX: newMinX, maxX: newMaxX }));
    }
  }, [tempo, posInicial, velocidade]);

  const tMax = Math.min(tempo, 12);
  const points = [];
  for (let t = 0; t <= tMax; t += 0.1) {
    points.push({ x: posInicial + velocidade * t, t });
  }

  const fullPoints = [];
  for (let t = 0; t <= 14; t += 0.2) {
    fullPoints.push({ x: posInicial + velocidade * t, t });
  }

  const width = 1000;
  const height = 580;
  const padding = { top: 50, right: 60, bottom: 60, left: 70 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  const mapX = (x) => padding.left + ((x - viewBox.minX) / (viewBox.maxX - viewBox.minX)) * graphWidth;
  const mapY = (y) => padding.top + graphHeight - ((y - viewBox.minY) / (viewBox.maxY - viewBox.minY)) * graphHeight;

  const xTicks = [];
  const startTick = Math.ceil(viewBox.minX);
  for (let i = startTick; i <= viewBox.maxX; i += 2) {
    xTicks.push(i);
  }

  const yTicks = [];
  const startYTick = Math.ceil(viewBox.minY);
  for (let i = startYTick; i <= viewBox.maxY; i += 2) {
    yTicks.push(i);
  }

  return (
    <div style={{ width: '100%', height: '100%', background: '#05070D', position: 'relative' }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%', fontFamily: 'monospace' }}>
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00D4FF" />
            <stop offset="100%" stopColor="#00F5C4" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <rect x={padding.left} y={padding.top} width={graphWidth} height={graphHeight} fill="rgba(0,0,0,0.3)" />

        {/* Grid linhas verticais */}
        {xTicks.map(tick => {
          const x = mapX(tick);
          if (x >= padding.left && x <= width - padding.right) {
            return (
              <g key={`v-${tick}`}>
                <line x1={x} y1={padding.top} x2={x} y2={padding.top + graphHeight} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                <text x={x} y={padding.top + graphHeight + 22} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10">
                  {tick}
                </text>
              </g>
            );
          }
          return null;
        })}

        {/* Grid linhas horizontais */}
        {yTicks.map(tick => {
          const y = mapY(tick);
          if (y >= padding.top && y <= padding.top + graphHeight) {
            return (
              <g key={`h-${tick}`}>
                <line x1={padding.left} y1={y} x2={padding.left + graphWidth} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                <text x={padding.left - 10} y={y + 4} textAnchor="end" fill="rgba(255,255,255,0.4)" fontSize="10">
                  {tick}
                </text>
              </g>
            );
          }
          return null;
        })}

        {/* Eixos */}
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + graphHeight} stroke="#00D4FF" strokeWidth="2.5" opacity="0.8" />
        <line x1={padding.left} y1={padding.top + graphHeight} x2={padding.left + graphWidth} y2={padding.top + graphHeight} stroke="#00D4FF" strokeWidth="2.5" opacity="0.8" />

        {/* Labels dos eixos maiores */}
        <text x={padding.left + graphWidth / 2} y={height - 14} textAnchor="middle" fill="#00D4FF" fontSize="13" fontWeight="bold">
          POSIÇÃO (s) → metros
        </text>
        <text x={22} y={padding.top + graphHeight / 2} textAnchor="middle" fill="#00D4FF" fontSize="13" fontWeight="bold" transform={`rotate(-90, 22, ${padding.top + graphHeight / 2})`}>
          TEMPO (t) → segundos
        </text>

        {/* Linha completa (previsão) */}
        <polyline
          points={fullPoints.map(p => `${mapX(p.x)},${mapY(p.t)}`).join(' ')}
          fill="none"
          stroke="rgba(0,212,255,0.12)"
          strokeWidth="2"
          strokeDasharray="8,5"
        />

        {/* Linha percorrida */}
        {points.length > 1 && (
          <polyline
            points={points.map(p => `${mapX(p.x)},${mapY(p.t)}`).join(' ')}
            fill="none"
            stroke="url(#lineGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
          />
        )}

        {/* Ponto atual */}
        {tempo >= 0 && (
          <circle
            cx={mapX(posInicial + velocidade * tempo)}
            cy={mapY(tempo)}
            r="8"
            fill="#F97316"
            stroke="#fff"
            strokeWidth="2.5"
            filter="url(#glow)"
          />
        )}

        {/* Linhas de projeção */}
        {tempo >= 0 && (
          <>
            <line
              x1={padding.left}
              y1={mapY(tempo)}
              x2={mapX(posInicial + velocidade * tempo)}
              y2={mapY(tempo)}
              stroke="rgba(249,115,22,0.35)"
              strokeWidth="1.2"
              strokeDasharray="4,4"
            />
            <line
              x1={mapX(posInicial + velocidade * tempo)}
              y1={mapY(tempo)}
              x2={mapX(posInicial + velocidade * tempo)}
              y2={padding.top + graphHeight}
              stroke="rgba(249,115,22,0.35)"
              strokeWidth="1.2"
              strokeDasharray="4,4"
            />
          </>
        )}

        {/* Legenda */}
        <g transform={`translate(${width - 150}, 15)`}>
          <rect x="0" y="0" width="140" height="55" rx="8" fill="rgba(0,0,0,0.7)" stroke="rgba(0,212,255,0.35)" />
          <circle cx="16" cy="20" r="5" fill="#00D4FF" />
          <text x="28" y="24" fill="#ccc" fontSize="10">Trajetória MRU</text>
          <circle cx="16" cy="40" r="5" fill="#F97316" stroke="#fff" strokeWidth="1.5" />
          <text x="28" y="44" fill="#ccc" fontSize="10">Posição atual</text>
        </g>

        {/* Fórmula */}
        <g transform={`translate(${padding.left}, 12)`}>
          <rect x="0" y="0" width="240" height="28" rx="6" fill="rgba(0,0,0,0.7)" stroke="rgba(0,245,196,0.35)" />
          <text x="12" y="19" fill="#00F5C4" fontSize="12" fontFamily="monospace" fontWeight="bold">
            s(t) = {posInicial.toFixed(1)} + {velocidade.toFixed(1)}·t
          </text>
        </g>
      </svg>
    </div>
  );
}