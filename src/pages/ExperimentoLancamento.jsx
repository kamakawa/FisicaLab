// src/pages/ExperimentoLancamento.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import CanvasAnimacao from '../components/CanvasAnimacao';
import LancamentoCalculus from '../components/LancamentoCalculus';

export default function ExperimentoLancamento() {
  const [v0, setV0] = useState(25);
  const [angle, setAngle] = useState(45);
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState("sim");

  const rafRef = useRef(null);
  const lastTimeRef = useRef(null);

  const g = 9.81;
  const rad = (angle * Math.PI) / 180;
  
  // Decomposição vetorial e constantes físicas do lançamento
  const vx = v0 * Math.cos(rad);
  const vy0 = v0 * Math.sin(rad);
  const tempoTotal = (2 * vy0) / g;
  const alturaMax = (vy0 * vy0) / (2 * g);
  const alcanceMax = vx * tempoTotal;

  // Valores Instantâneos dinâmicos
  const vyAtual = vy0 - g * time;
  const vModulo = Math.hypot(vx, vyAtual);
  const posX = vx * time;
  const posY = Math.max(0, vy0 * time - 0.5 * g * time * time);

  // Laço de animação de alta precisão temporal
  const loop = useCallback((ts) => {
    if (!isPlaying) return;

    if (lastTimeRef.current === null) lastTimeRef.current = ts;
    const dt = Math.min((ts - lastTimeRef.current) / 1000, 0.03);
    lastTimeRef.current = ts;

    setTime((prev) => {
      let next = prev + dt;
      if (next >= tempoTotal) {
        setIsPlaying(false);
        return tempoTotal; // Impacto no solo
      }
      return next;
    });

    rafRef.current = requestAnimationFrame(loop);
  }, [isPlaying, tempoTotal]);

  useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = null;
      rafRef.current = requestAnimationFrame(loop);
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, loop]);

  const handleStart = () => {
    if (time >= tempoTotal) setTime(0);
    setIsPlaying(true);
  };

  const handlePause = () => setIsPlaying(false);
  
  const handleReset = () => {
    setIsPlaying(false);
    setTime(0);
  };

  return (
    <div className="exp-container">
      {/* Cabeçalho Padronizado */}
      <div className="exp-header">
        <h1>LANÇAMENTO DE PROJÉTEIS</h1>
        <p>Cinemática Bidimensional • Análise de Trajetória Parabólica e Vetores</p>
      </div>

      <div className="exp-grid">
        {/* Painel Lateral Esquerdo (Sidebar) */}
        <div className="exp-sidebar">
          
          {/* Card 1: Parâmetros Físicos */}
          <div className="exp-card">
            <div className="exp-card-title">🎯 Parâmetros Iniciais</div>
            
            <div className="exp-control">
              <div className="exp-control-label">
                <span>Velocidade Inicial (v₀)</span>
                <span className="exp-value">{v0} m/s</span>
              </div>
              <input 
                type="range" 
                className="exp-range"
                min="5" 
                max="40" 
                value={v0} 
                onChange={(e) => { setV0(Number(e.target.value)); handleReset(); }} 
              />
            </div>

            <div className="exp-control">
              <div className="exp-control-label">
                <span>Ângulo de Disparo (θ)</span>
                <span className="exp-value" style={{ color: 'var(--accent)' }}>{angle}°</span>
              </div>
              <input 
                type="range" 
                className="exp-range"
                min="10" 
                max="85" 
                value={angle} 
                onChange={(e) => { setAngle(Number(e.target.value)); handleReset(); }} 
              />
            </div>
          </div>

          {/* Card 2: Controles Universais da Simulação */}
          <div className="exp-card">
            <div className="exp-btn-group">
              {isPlaying ? (
                <button className="exp-btn" onClick={handlePause}>⏸ PAUSAR</button>
              ) : (
                <button className="exp-btn primary" onClick={handleStart}>▶ INICIAR</button>
              )}
              <button className="exp-btn" onClick={handleReset}>⟳ RESET</button>
            </div>
          </div>

          {/* Card 3: Métricas em Tempo Real */}
          <div className="exp-card">
            <div className="exp-card-title">📊 Valores Instantâneos</div>
            <div className="exp-stats-grid">
              <div className="exp-stat">
                <div className="exp-stat-label">Tempo de Voo</div>
                <div className="exp-stat-val">{time.toFixed(2)} s</div>
              </div>
              <div className="exp-stat">
                <div className="exp-stat-label">Velocidade (v)</div>
                <div className="exp-stat-val" style={{ color: 'var(--secondary)' }}>{vModulo.toFixed(1)} m/s</div>
              </div>
              <div className="exp-stat">
                <div className="exp-stat-label">Alcance (x)</div>
                <div className="exp-stat-val">{posX.toFixed(1)} m</div>
              </div>
              <div className="exp-stat">
                <div className="exp-stat-label">Altura (y)</div>
                <div className="exp-stat-val">{posY.toFixed(1)} m</div>
              </div>
            </div>
          </div>

          {/* Card 4: Limites Teóricos Máximos */}
          <div className="exp-card">
            <div className="exp-card-title">📐 Fronteiras da Trajetória</div>
            <div className="exp-stats-grid">
              <div className="exp-stat">
                <div className="exp-stat-label">Altura Máx. (h_max)</div>
                <div className="exp-stat-val" style={{ color: 'var(--accent)' }}>{alturaMax.toFixed(2)} m</div>
              </div>
              <div className="exp-stat">
                <div className="exp-stat-label">Alcance Máx. (R)</div>
                <div className="exp-stat-val">{alcanceMax.toFixed(2)} m</div>
              </div>
            </div>
            <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Equação Cartesiana</div>
              <div style={{ fontFamily: 'var(--font-math)', fontSize: '11px', color: 'var(--secondary)', marginTop: '4px' }}>
                y(x) = x·tan(θ) - [g·x² / (2v₀²·cos²θ)]
              </div>
            </div>
          </div>

        </div>

        {/* Painel Central de Visualização (Viewer) */}
        <div className="exp-viewer">
          <div className="exp-tabs">
            <button 
              className={`exp-tab ${activeTab === "sim" ? "active" : ""}`} 
              onClick={() => setActiveTab("sim")}
            >
              🌌 Simulação Dinâmica
            </button>
            <button 
              className={`exp-tab ${activeTab === "calculus" ? "active" : ""}`} 
              onClick={() => setActiveTab("calculus")}
            >
              ∫ Análise de Cálculo
            </button>
          </div>

          <div style={{ position: 'relative', flex: 1, minHeight: '500px', display: 'flex', flexDirection: 'column' }}>
            {activeTab === "sim" && (
              <>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-viewer)' }}>
                  <CanvasAnimacao v0={v0} angle={angle} time={time} />
                </div>
                <TheoryPanelProjectile v0={v0} angle={angle} time={time} vx={vx} vy0={vy0} vyAtual={vyAtual} />
              </>
            )}

            {activeTab === "calculus" && (
              <div style={{ pading: '20px', overflowY: 'auto', flex: 1 }}>
                <LancamentoCalculus v0={v0} angle={angle} time={time} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* Painel Teórico Flutuante Interno do Gráfico */
function TheoryPanelProjectile({ v0, angle, time, vx, vy0, vyAtual }) {
  return (
    <div style={{
      position: 'absolute',
      top: 16,
      right: 16,
      width: 260,
      background: 'rgba(8, 12, 20, 0.9)',
      backdropFilter: 'blur(14px)',
      borderRadius: 12,
      border: '1px solid var(--border-glass)',
      padding: '14px',
      fontFamily: 'var(--font-math)',
      zIndex: 20,
      color: 'var(--text-main)',
      fontSize: '11px'
    }}>
      <div style={{ fontSize: '10px', letterSpacing: '1.5px', color: 'var(--secondary)', marginBottom: '8px', fontWeight: 'bold' }}>
        📘 COMPORTAMENTO DOS VETORES
      </div>
      <div style={{ color: 'var(--text-muted)', marginBottom: '8px', lineHeight: 1.4 }}>
        O movimento é a composição de um MRU horizontal e um MUV vertical acelerado pela gravidade.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div>→ vₓ (Constante): <span style={{ color: 'var(--primary)' }}>{vx.toFixed(2)} m/s</span></div>
        <div>→ v_y₀ (Inicial): <span style={{ color: 'var(--secondary)' }}>{vy0.toFixed(2)} m/s</span></div>
        <div>→ v_y (Instantânea): <span style={{ color: vyAtual >= 0 ? 'var(--secondary)' : 'var(--accent)' }}>{vyAtual.toFixed(2)} m/s</span></div>
        <div style={{ marginTop: '6px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '6px', color: 'var(--text-muted)' }}>
          Status: {vyAtual > 0.1 ? " Ascendente ↗" : vyAtual < -0.1 ? " Descendente ↘" : " Ápice (V_y = 0) ↔"}
        </div>
      </div>
    </div>
  );
}