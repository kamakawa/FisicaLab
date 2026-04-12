// src/App.jsx
import React, { useState, useEffect } from 'react';
import './App.css';
import CanvasAnimacao from './components/CanvasAnimacao';
import ControlesMatematicos from './components/ControlesMatematicos';
import LogoFisicaLab from './components/LogoFisicaLab';

export default function App() {
  const [v0, setV0] = useState(25);
  const [angle, setAngle] = useState(60);
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Motor do tempo da simulação
  useEffect(() => {
    let intervalId;
    if (isPlaying) {
      intervalId = setInterval(() => {
        setTime((prevTime) => prevTime + 0.05);
      }, 50); // Atualiza a cada 50ms para 20fps de cálculo
    }
    return () => clearInterval(intervalId);
  }, [isPlaying]);

  return (
    <div className="app-container">
      <header className="header">
        <div style={{ width: '40px', height: '40px' }}>
          {/* Se você já tem o LogoFisicaLab.jsx criado, ele vai aparecer aqui */}
          <LogoFisicaLab /> 
        </div>
        <h1>FísicaLab <span style={{fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 'normal'}}>| Cinemática e Lançamento de Projéteis</span></h1>
      </header>

      <main className="dashboard">
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CanvasAnimacao v0={v0} angle={angle} time={time} />
        </div>
        
        <ControlesMatematicos 
          v0={v0} setV0={setV0}
          angle={angle} setAngle={setAngle}
          time={time} setTime={setTime}
          isPlaying={isPlaying} setIsPlaying={setIsPlaying}
        />
      </main>
    </div>
  );
}