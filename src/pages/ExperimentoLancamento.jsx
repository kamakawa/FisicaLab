// src/pages/ExperimentoLancamento.jsx
import React, { useState, useEffect } from 'react';
import CanvasAnimacao from '../components/CanvasAnimacao';
import ControlesMatematicos from '../components/ControlesMatematicos';

export default function ExperimentoLancamento() {
  const [v0, setV0] = useState(25);
  const [angle, setAngle] = useState(45);
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let intervalId;
    if (isPlaying) {
      intervalId = setInterval(() => {
        setTime((prev) => prev + 0.05);
      }, 50);
    }
    return () => clearInterval(intervalId);
  }, [isPlaying]);

  // Auto-pause when projectile lands
  useEffect(() => {
    const rad = (angle * Math.PI) / 180;
    const vy0 = v0 * Math.sin(rad);
    const g = 9.81;
    const tempoTotal = (2 * vy0) / g;
    if (time >= tempoTotal && isPlaying) {
      setIsPlaying(false);
    }
  }, [time, v0, angle, isPlaying]);

  return (
    <main className="dashboard">
      <div
        className="glass-panel"
        style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      >
        <div style={{
          padding: '12px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <span style={{ color: '#06B6D4', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Lançamento de Projéteis
          </span>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Cinemática 2D</span>
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CanvasAnimacao v0={v0} angle={angle} time={time} />
        </div>
      </div>

      <ControlesMatematicos
        v0={v0} setV0={setV0}
        angle={angle} setAngle={setAngle}
        time={time} setTime={setTime}
        isPlaying={isPlaying} setIsPlaying={setIsPlaying}
      />
    </main>
  );
}
