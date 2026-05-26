// src/App.jsx
import React, { useState } from 'react';
import './App.css';
import Home from './pages/Home';
import ExperimentoLancamento from './pages/ExperimentoLancamento';
import LogoFisicaLab from './components/LogoFisicaLab';
import ExperimentoMRU from './pages/ExperimentoMRU';
import ExperimentoMRUV from './pages/ExperimentoMUV';
import ExperimentoCircular from './pages/ExperimentoCircular';
import ExperimentoLeisNewton from './pages/ExperimentoLeisNewton';

const TITULOS = {
  lancamento: 'Lançamento de Projéteis',
  mru: 'Movimento Retilíneo Uniforme',
  mruv: 'Movimento Retilíneo Uniformemente Variado',
  circular: 'Movimento Circular',
  'leis-newton': 'Leis de Newton e Sistemas Acoplados',
};

const CORES_FISICA = {
  fisica1: "#00D4FF",
  fisica2: "#FF6B9D",
  fisica3: "#00F5C4",
};

const EXPERIMENTO_FISICA = {
  lancamento: "fisica1",
  mru: "fisica1",
  mruv: "fisica1",
  circular: 'fisica1',
  'leis-newton': 'fisica1',
};

export default function App() {
  const [pagina, setPagina] = useState('home');
  const [experimento, setExperimento] = useState(null);

  const navegarPara = (idExp) => {
    setPagina('experimento');
    setExperimento(idExp);
  };

  const voltarHome = () => {
    setPagina('home');
    setExperimento(null);
  };

  const idFisica = experimento ? EXPERIMENTO_FISICA[experimento] : null;
  const corAtual = idFisica ? CORES_FISICA[idFisica] : "#00D4FF";

  return (
    <div className="app-container">
      <header className="header" style={{ borderColor: `${corAtual}40` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            className="logo-container"
            onClick={voltarHome}
            style={{ color: corAtual }}
          >
            <LogoFisicaLab />
          </div>

          <span
            className="app-logo-text"
            onClick={voltarHome}
            style={{
              color: corAtual,
              textShadow: `0 0 18px ${corAtual}80`
            }}
          >
            FÍSICALAB
          </span>

          {pagina !== 'home' && experimento && (
            <>
              <span className="app-breadcrumb-sep">/</span>
              <span className="app-breadcrumb-exp">
                {TITULOS[experimento] ?? experimento}
              </span>
            </>
          )}
        </div>

        <div></div>
      </header>

      {pagina === 'home' && <Home onNavegar={navegarPara} />}

      {pagina === 'experimento' && (
        <>
          {experimento === 'lancamento' && <ExperimentoLancamento />}
          {experimento === 'mru' && <ExperimentoMRU />}
          {experimento === 'mruv' && <ExperimentoMRUV />}
          {experimento === 'circular' && <ExperimentoCircular />}
          {experimento === 'leis-newton' && <ExperimentoLeisNewton />}
        </>
      )}
    </div>
  );
}