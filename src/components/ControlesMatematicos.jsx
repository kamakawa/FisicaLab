// src/components/ControlesMatematicos.jsx
import React from 'react';

export default function ControlesMatematicos({ v0, setV0, angle, setAngle, time, setTime, isPlaying, setIsPlaying }) {
  const g = 9.81;
  const rad = (angle * Math.PI) / 180;
  
  // Cálculos Instantâneos
  const vx = (v0 * Math.cos(rad)).toFixed(2);
  const vy0 = (v0 * Math.sin(rad)).toFixed(2);
  const vyAtual = (vy0 - g * time).toFixed(2);
  
  // Cálculos Totais
  const tempoTotal = ((2 * vy0) / g).toFixed(2);
  const alturaMax = ((vy0 * vy0) / (2 * g)).toFixed(2);
  const alcanceMax = (vx * tempoTotal).toFixed(2);

  // Posição Atual
  const posX = (vx * time).toFixed(2);
  const posY = Math.max(0, (vy0 * time - 0.5 * g * time * time)).toFixed(2);

  return (
    <div className="glass-panel">
      <div className="control-group">
        <label>Velocidade Inicial (v0) <span>{v0} m/s</span></label>
        <input type="range" min="5" max="40" value={v0} onChange={(e) => setV0(Number(e.target.value))} />
      </div>

      <div className="control-group">
        <label>Ângulo de Lançamento (θ) <span>{angle}°</span></label>
        <input type="range" min="0" max="90" value={angle} onChange={(e) => setAngle(Number(e.target.value))} />
      </div>

      <div className="control-group">
        <label style={{color: 'var(--neon-orange)'}}>Linha do Tempo (t) <span>{time.toFixed(2)} s</span></label>
        <input 
          type="range" 
          min="0" 
          max={tempoTotal > 0 ? tempoTotal : 10} 
          step="0.01" 
          value={time > tempoTotal ? tempoTotal : time} 
          onChange={(e) => setTime(Number(e.target.value))} 
        />
      </div>

      <div className="play-controls">
        <button onClick={() => setIsPlaying(!isPlaying)}>
          {isPlaying ? 'Pausar Simulação' : 'Iniciar Simulação'}
        </button>
        <button className="stop" onClick={() => { setIsPlaying(false); setTime(0); }}>
          Resetar
        </button>
      </div>

      <h3 style={{marginTop: '30px', borderBottom: '1px solid #333', paddingBottom: '10px'}}>Equações Dinâmicas</h3>
      <p style={{fontSize: '0.9rem', color: 'var(--text-muted)'}}>Posição no eixo Y:</p>
      <div className="math-font">
        y(t) = ({vy0})t - 4.9t² = {posY}m
      </div>
      
      <p style={{fontSize: '0.9rem', color: 'var(--text-muted)'}}>Posição no eixo X:</p>
      <div className="math-font">
        x(t) = ({vx})t = {posX}m
      </div>

      <h3 style={{marginTop: '20px', borderBottom: '1px solid #333', paddingBottom: '10px'}}>Métricas do Voo</h3>
      <div className="analytics-grid">
        <div className="metric cyan">
          <p>Alcance Máximo</p>
          <h3>{alcanceMax} m</h3>
        </div>
        <div className="metric">
          <p>Altura Máxima</p>
          <h3>{alturaMax} m</h3>
        </div>
        <div className="metric">
          <p>Tempo de Voo</p>
          <h3>{tempoTotal} s</h3>
        </div>
        <div className="metric cyan">
          <p>Vy Instantâneo</p>
          <h3>{vyAtual} m/s</h3>
        </div>
      </div>
    </div>
  );
}