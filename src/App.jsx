import React, { useState } from 'react';
import './App.css';
import Home from './pages/Home';
import ExperimentoLancamento from './pages/ExperimentoLancamento';
import LogoFisicaLab from './components/LogoFisicaLab';
import ExperimentoMRU from './pages/ExperimentoMRU';
import ExperimentoMRUV from './pages/ExperimentoMUV';
import ExperimentoCircular from './pages/ExperimentoCircular';
import ExperimentoLeisNewton from './pages/ExperimentoLeisNewton'; // 1. IMPORTAR A NOVA PÁGINA
import ExperimentoPlanoInclinado from './pages/ExperimentoPlanoInclinado';

const TITULOS = {
  lancamento: 'Lançamento de Projéteis',
  mru: 'Movimento Retilíneo Uniforme',
  mruv: 'Movimento Retilíneo Uniformemente Variado',
  circular: 'Movimento Circular',
  'leis-newton': 'Leis de Newton e Sistemas Acoplados',
  'plano-inclinado': 'Planos Inclinados e Atrito',
};

/* ========================= */
/* 🔥 NOVO: CORES POR FÍSICA */
/* ========================= */
const CORES_FISICA = {
  fisica1: "#00D4FF",
  fisica2: "#FF6B9D",
  fisica3: "#00F5C4",
};

/* =============================== */
/* 🔥 NOVO: MAPEAMENTO EXPERIMENTO */
/* =============================== */
const EXPERIMENTO_FISICA = {
  lancamento: "fisica1",
  mru: "fisica1",
  mruv: "fisica1",
  circular: 'fisica1',
  'leis-newton': 'fisica1',
  'plano-inclinado': 'fisica1',
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

  // Determinar a cor atual com base no experimento ativo
  const idFisica = experimento ? EXPERIMENTO_FISICA[experimento] : null;
  const corAtual = idFisica ? CORES_FISICA[idFisica] : "#00D4FF"; // Cor padrão (Ciano) para a Home

  return (
    <div className="app-container">
      <header className="header" style={{ borderColor: `${corAtual}40` }}>
        {/* ESQUERDA: Logo e Breadcrumbs */}
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

        {/* DIREITA */}
        <div></div>
      </header>

      {/* RENDERIZAÇÃO CONDICIONAL DAS PÁGINAS */}
      {pagina === 'home' && <Home onNavegar={navegarPara} />}

      {pagina === 'experimento' && (
        <>
          {experimento === 'lancamento' && <ExperimentoLancamento />}
          {experimento === 'mru' && <ExperimentoMRU />}
          {experimento === 'mruv' && <ExperimentoMRUV />}
          {experimento === 'circular' && <ExperimentoCircular />}
          {experimento === 'leis-newton' && <ExperimentoLeisNewton />}
          {experimento === 'plano-inclinado' && <ExperimentoPlanoInclinado />}
        </>
      )}
    </div>
  );
}