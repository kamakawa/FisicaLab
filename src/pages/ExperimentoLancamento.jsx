// src/pages/ExperimentoLancamento.jsx
import React, { useState, useEffect } from 'react';
import CanvasAnimacao from '../components/CanvasAnimacao';
import ControlesMatematicos from '../components/ControlesMatematicos';
import LancamentoCalculus from '../components/LancamentoCalculus';

function TheoryPanelProjectile({ v0, angle, time }) {
  const rad = (angle * Math.PI) / 180;

  const vx = v0 * Math.cos(rad);
  const vy = v0 * Math.sin(rad);

  const g = 9.81;

  const y = vy * time - 0.5 * g * time * time;

  const movingUp = vy - g * time > 0;
  const isFalling = vy - g * time < 0;

  return (
    <div style={{
      position: 'absolute',
      top: 16,
      right: 16,
      width: 280,
      background: 'rgba(8, 12, 20, 0.9)',
      backdropFilter: 'blur(14px)',
      borderRadius: 16,
      border: '1px solid rgba(0, 212, 255, 0.25)',
      padding: '14px 16px',
      fontFamily: 'monospace',
      zIndex: 20,
      color: '#fff'
    }}>
      <div style={{
        fontSize: '0.7rem',
        letterSpacing: '2px',
        color: '#00F5C4',
        marginBottom: 10
      }}>
        🚀 LANÇAMENTO DE PROJÉTEIS
      </div>

      <div style={{ fontSize: '0.75rem', color: '#ccc', lineHeight: 1.4 }}>
        Movimento composto por:
        <br />
        → MRU no eixo X
        <br />
        → MRUV no eixo Y (gravidade)
      </div>

      <div style={{ marginTop: 10, fontSize: '0.75rem' }}>
        <div>→ vₓ (constante): <span style={{ color: '#00D4FF' }}>{vx.toFixed(2)} m/s</span></div>
        <div>→ vᵧ (variável): <span style={{ color: '#F97316' }}>{(vy - g * time).toFixed(2)} m/s</span></div>
      </div>

      <div style={{ marginTop: 10, fontSize: '0.75rem' }}>
        <div>📈 Estado:</div>
        <div style={{ color: movingUp ? '#00F5C4' : isFalling ? '#ff5555' : '#aaa' }}>
          {movingUp && "Subindo"}
          {isFalling && "Descendo"}
          {!movingUp && !isFalling && "Ponto mais alto"}
        </div>
      </div>

      <div style={{ marginTop: 10, fontSize: '0.7rem', color: '#aaa' }}>
        Altura atual: {Math.max(0, y).toFixed(2)} m
      </div>

      <div style={{ marginTop: 10, fontSize: '0.7rem', color: '#aaa' }}>
        Ângulo: {angle}°
      </div>
    </div>
  );
}

export default function ExperimentoLancamento() {
  const [v0, setV0] = useState(25);
  const [angle, setAngle] = useState(45);
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState("sim");

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
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
            {[{ id: "sim", label: "Simulação" }, { id: "calculus", label: "∫ Cálculo" }].map(tb => (
              <button key={tb.id} onClick={() => setActiveTab(tb.id)}
                style={{
                  border: "none", borderRadius: 6, padding: "4px 12px", cursor: "pointer",
                  background: activeTab === tb.id ? "rgba(251,146,60,0.15)" : "transparent",
                  color: activeTab === tb.id ? "#FB923C" : "#475569",
                  fontSize: 11, fontFamily: "'Sora', sans-serif",
                  borderBottom: activeTab === tb.id ? "2px solid #FB923C" : "2px solid transparent",
                }}>{tb.label}</button>
            ))}
          </div>
        </div>

        {activeTab === "sim" && (
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
            <CanvasAnimacao v0={v0} angle={angle} time={time} />
            <TheoryPanelProjectile v0={v0} angle={angle} time={time} />
          </div>
        )}

        {activeTab === "calculus" && (
          <div style={{ flex: 1, overflowY: "auto" }}>
            <LancamentoCalculus v0={v0} angle={angle} time={time} />
          </div>
        )}
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
