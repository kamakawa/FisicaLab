// src/pages/ExperimentoMRU.jsx
import React, { useState, useEffect } from "react";
import MRU3D from "../components/MRU3D";

export default function ExperimentoMRU() {
  const [velocidade, setVelocidade] = useState(5);
  const [posInicial, setPosInicial] = useState(-5);
  const [tempo, setTempo] = useState(0);
  const [rodando, setRodando] = useState(false);
  const [modo, setModo] = useState("2D");

  useEffect(() => {
    if (!rodando) return;
    const interval = setInterval(() => setTempo(t => t + 0.05), 50);
    return () => clearInterval(interval);
  }, [rodando]);

  // Cálculos de posição
  const x = posInicial + velocidade * tempo;
  const deslocamento = x - posInicial;

  // Para 3D, definimos componentes de velocidade e posição inicial
  const velocidade3D = {
    x: velocidade,
    y: velocidade * 0.6,
    z: velocidade * 0.4
  };
  const posInicial3D = {
    x: posInicial,
    y: -2,
    z: -1
  };

  return (
    <div className="mru-container">
      <style>{`
        .mru-container {
          padding: 24px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .mru-grid {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 28px;
        }

        /* Painel de Controle Moderno */
        .mru-panel {
          background: rgba(12, 16, 24, 0.9);
          backdrop-filter: blur(12px);
          border-radius: 24px;
          border: 1px solid rgba(0, 212, 255, 0.25);
          padding: 24px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          transition: all 0.3s ease;
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
          font-size: 0.75rem;
          color: rgba(255,255,255,0.4);
          font-family: monospace;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .mru-control-group {
          margin-bottom: 20px;
        }

        .mru-control-group label {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #9CA3AF;
          margin-bottom: 8px;
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
          font-size: 0.85rem;
        }

        .mru-button-group {
          display: flex;
          gap: 12px;
          margin: 24px 0;
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
          font-size: 0.75rem;
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
          padding: 16px;
          margin-top: 20px;
          border-left: 3px solid #00F5C4;
        }

        .mru-equation p {
          margin: 8px 0;
          font-family: 'Fira Code', monospace;
          font-size: 0.85rem;
        }

        .mru-equation .eq-title {
          color: #00F5C4;
          font-size: 0.7rem;
          letter-spacing: 1.5px;
          margin-bottom: 12px;
        }

        .mru-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 20px;
        }

        .mru-stat-card {
          background: rgba(0,0,0,0.3);
          border-radius: 12px;
          padding: 12px;
          text-align: center;
        }

        .mru-stat-label {
          font-size: 0.65rem;
          color: #9CA3AF;
          text-transform: uppercase;
        }

        .mru-stat-value {
          font-family: monospace;
          font-size: 1.1rem;
          color: #00D4FF;
          font-weight: bold;
        }

        /* Área de Visualização */
        .mru-viewer {
          background: #05070D;
          border-radius: 24px;
          border: 1px solid rgba(0,212,255,0.2);
          overflow: hidden;
          position: relative;
          height: 520px;
        }

        .mru-mode-badge {
          position: absolute;
          top: 16px;
          right: 16px;
          background: rgba(0,0,0,0.7);
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
          padding: 8px;
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
      `}</style>

      <div className="mru-grid">
        {/* Painel de Controle */}
        <div className="mru-panel">
          <h3>MRU • 3D VETORIAL</h3>
          <div className="mru-panel-sub">Movimento Retilíneo Uniforme</div>

          <div className="mru-mode-selector">
            <div 
              className={`mru-mode-btn ${modo === '2D' ? 'active' : ''}`}
              onClick={() => setModo('2D')}
            >
              📐 2D (X vs T)
            </div>
            <div 
              className={`mru-mode-btn ${modo === '3D' ? 'active' : ''}`}
              onClick={() => setModo('3D')}
            >
              🌍 3D Espacial
            </div>
          </div>

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

          <div className="mru-button-group">
            <button className="mru-btn mru-btn-primary" onClick={() => setRodando(true)}>▶ INICIAR</button>
            <button className="mru-btn" onClick={() => setRodando(false)}>⏸ PAUSAR</button>
            <button className="mru-btn" onClick={() => { setTempo(0); setRodando(false); }}>⟳ RESET</button>
          </div>

          <div className="mru-equation">
            <div className="eq-title">📐 EQUAÇÃO HORÁRIA (2D)</div>
            <p style={{ fontSize: '0.9rem', textAlign: 'center' }}>
              s(t) = s₀ + v · t
            </p>
            <p style={{ fontSize: '0.8rem', color: '#aaa', textAlign: 'center' }}>
              {x.toFixed(2)} = {posInicial.toFixed(2)} + {velocidade.toFixed(2)} · {tempo.toFixed(2)}
            </p>
          </div>

          <div className="mru-stats">
            <div className="mru-stat-card">
              <div className="mru-stat-label">POSIÇÃO ATUAL</div>
              <div className="mru-stat-value">{x.toFixed(2)} m</div>
            </div>
            <div className="mru-stat-card">
              <div className="mru-stat-label">DESLOCAMENTO</div>
              <div className="mru-stat-value">Δs = {deslocamento.toFixed(2)} m</div>
            </div>
            <div className="mru-stat-card">
              <div className="mru-stat-label">TEMPO DECORRIDO</div>
              <div className="mru-stat-value">{tempo.toFixed(2)} s</div>
            </div>
            <div className="mru-stat-card">
              <div className="mru-stat-label">VELOCIDADE CONST.</div>
              <div className="mru-stat-value">{Math.abs(velocidade).toFixed(2)} m/s</div>
            </div>
          </div>
        </div>

        {/* Área de Visualização */}
        <div className="mru-viewer">
          <div className="mru-mode-badge">
            {modo === '2D' ? 'GRÁFICO ESPAÇO x TEMPO' : 'ESPAÇO TRIDIMENSIONAL • MRU'}
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

// Componente 2D profissional com gráfico dinâmico
function MRU2DGraph({ posInicial, velocidade, tempo, rodando }) {
  const [viewBox, setViewBox] = useState({ minX: -5, maxX: 15, minY: -8, maxY: 8 });

  // Atualiza viewBox dinamicamente para manter o ponto na tela
  useEffect(() => {
    const xAtual = posInicial + velocidade * tempo;
    const margin = 3;
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

    // Ajuste fino para manter proporção
    if (newMinX !== viewBox.minX || newMaxX !== viewBox.maxX) {
      setViewBox(prev => ({ ...prev, minX: newMinX, maxX: newMaxX }));
    }
  }, [tempo, posInicial, velocidade, viewBox.minX, viewBox.maxX]);

  // Dados para a reta do MRU
  const tMax = Math.min(tempo, 8);
  const points = [];
  for (let t = 0; t <= tMax; t += 0.1) {
    points.push({ x: posInicial + velocidade * t, t });
  }

  // Pontos para a linha completa (previsão)
  const fullPoints = [];
  for (let t = 0; t <= 10; t += 0.2) {
    fullPoints.push({ x: posInicial + velocidade * t, t });
  }

  const width = 800;
  const height = 480;
  const padding = { top: 40, right: 50, bottom: 50, left: 60 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  const mapX = (x) => padding.left + ((x - viewBox.minX) / (viewBox.maxX - viewBox.minX)) * graphWidth;
  const mapY = (y) => padding.top + graphHeight - ((y - viewBox.minY) / (viewBox.maxY - viewBox.minY)) * graphHeight;

  // Gerar ticks dos eixos
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

  const tTicks = [];
  for (let i = 0; i <= 10; i += 2) {
    tTicks.push(i);
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
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Fundo com grid */}
        <rect x={padding.left} y={padding.top} width={graphWidth} height={graphHeight} fill="rgba(0,0,0,0.3)" />

        {/* Linhas verticais do grid (X) */}
        {xTicks.map(tick => {
          const x = mapX(tick);
          if (x >= padding.left && x <= width - padding.right) {
            return (
              <g key={`v-${tick}`}>
                <line x1={x} y1={padding.top} x2={x} y2={padding.top + graphHeight} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                <text x={x} y={padding.top + graphHeight + 20} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9">
                  {tick}
                </text>
              </g>
            );
          }
          return null;
        })}

        {/* Linhas horizontais do grid (Y) */}
        {yTicks.map(tick => {
          const y = mapY(tick);
          if (y >= padding.top && y <= padding.top + graphHeight) {
            return (
              <g key={`h-${tick}`}>
                <line x1={padding.left} y1={y} x2={padding.left + graphWidth} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                <text x={padding.left - 8} y={y + 4} textAnchor="end" fill="rgba(255,255,255,0.4)" fontSize="9">
                  {tick}
                </text>
              </g>
            );
          }
          return null;
        })}

        {/* Eixos */}
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + graphHeight} stroke="#00D4FF" strokeWidth="2" opacity="0.7" />
        <line x1={padding.left} y1={padding.top + graphHeight} x2={padding.left + graphWidth} y2={padding.top + graphHeight} stroke="#00D4FF" strokeWidth="2" opacity="0.7" />

        {/* Labels dos eixos */}
        <text x={padding.left + graphWidth / 2} y={height - 12} textAnchor="middle" fill="#00D4FF" fontSize="11" fontWeight="bold">
          POSIÇÃO (s) → metros
        </text>
        <text x={20} y={padding.top + graphHeight / 2} textAnchor="middle" fill="#00D4FF" fontSize="11" fontWeight="bold" transform={`rotate(-90, 20, ${padding.top + graphHeight / 2})`}>
          TEMPO (t) → segundos
        </text>

        {/* Linha completa (previsão) */}
        <polyline
          points={fullPoints.map(p => `${mapX(p.x)},${mapY(p.t)}`).join(' ')}
          fill="none"
          stroke="rgba(0,212,255,0.15)"
          strokeWidth="2"
          strokeDasharray="6,4"
        />

        {/* Linha percorrida */}
        {points.length > 1 && (
          <polyline
            points={points.map(p => `${mapX(p.x)},${mapY(p.t)}`).join(' ')}
            fill="none"
            stroke="url(#lineGrad)"
            strokeWidth="3"
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
            r="6"
            fill="#F97316"
            stroke="#fff"
            strokeWidth="2"
            filter="url(#glow)"
          />
        )}

        {/* Marcador do tempo atual no eixo X */}
        {tempo >= 0 && (
          <>
            <line
              x1={padding.left}
              y1={mapY(tempo)}
              x2={mapX(posInicial + velocidade * tempo)}
              y2={mapY(tempo)}
              stroke="rgba(249,115,22,0.4)"
              strokeWidth="1"
              strokeDasharray="3,3"
            />
            <line
              x1={mapX(posInicial + velocidade * tempo)}
              y1={mapY(tempo)}
              x2={mapX(posInicial + velocidade * tempo)}
              y2={padding.top + graphHeight}
              stroke="rgba(249,115,22,0.4)"
              strokeWidth="1"
              strokeDasharray="3,3"
            />
          </>
        )}

        {/* Legenda */}
        <g transform={`translate(${width - 140}, 15)`}>
          <rect x="0" y="0" width="130" height="50" rx="6" fill="rgba(0,0,0,0.6)" stroke="rgba(0,212,255,0.3)" />
          <circle cx="15" cy="18" r="4" fill="#00D4FF" />
          <text x="25" y="22" fill="#aaa" fontSize="9">Trajetória MRU</text>
          <circle cx="15" cy="36" r="4" fill="#F97316" />
          <text x="25" y="40" fill="#aaa" fontSize="9">Posição atual</text>
        </g>

        {/* Fórmula no canto superior esquerdo */}
        <g transform={`translate(${padding.left}, 12)`}>
          <rect x="0" y="0" width="200" height="24" rx="4" fill="rgba(0,0,0,0.6)" stroke="rgba(0,245,196,0.3)" />
          <text x="10" y="16" fill="#00F5C4" fontSize="11" fontFamily="monospace">
            s(t) = {posInicial.toFixed(1)} + {velocidade.toFixed(1)}·t
          </text>
        </g>
      </svg>
    </div>
  );
}