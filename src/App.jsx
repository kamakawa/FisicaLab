// src/App.jsx
import React, { useState } from 'react';
import './App.css';
import Home from './pages/Home';
import ExperimentoLancamento from './pages/ExperimentoLancamento';
import LogoFisicaLab from './components/LogoFisicaLab';

export default function App() {
  const [pagina, setPagina] = useState('home');
  const [experimento, setExperimento] = useState(null);

  const navegarPara = (exp) => {
    setExperimento(exp);
    setPagina('experimento');
  };

  const voltarHome = () => {
    setPagina('home');
    setExperimento(null);
  };

  return (
    <div className="app-container">
      <header className="header">
        <div style={{ width: '40px', height: '40px', cursor: 'pointer' }} onClick={voltarHome}>
          <LogoFisicaLab />
        </div>
        <h1 onClick={voltarHome} style={{ cursor: 'pointer' }}>
          FísicaLab{' '}
          <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>
            | Laboratório Virtual
          </span>
        </h1>
        {pagina !== 'home' && (
          <button onClick={voltarHome} style={{ marginLeft: 'auto', maxWidth: '120px', padding: '8px 16px' }}>
            ← Início
          </button>
        )}
      </header>

      {pagina === 'home' && <Home onNavegar={navegarPara} />}
      {pagina === 'experimento' && experimento === 'lancamento' && <ExperimentoLancamento />}
    </div>
  );
}