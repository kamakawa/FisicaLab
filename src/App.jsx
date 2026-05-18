import React, { useState } from 'react';
import './App.css';
import Home from './pages/Home';
import ExperimentoLancamento from './pages/ExperimentoLancamento';
import LogoFisicaLab from './components/LogoFisicaLab';
import ExperimentoMRU from './pages/ExperimentoMRU';
import ExperimentoMRUV from './pages/ExperimentoMUV';
import ExperimentoCircular from './pages/ExperimentoCircular';

const TITULOS = {
  lancamento: 'Lançamento de Projéteis',
  mru: 'Movimento Retilíneo Uniforme',
  mruv: 'Movimento RetilíneoUniformemente Variado',
  circular: 'Movimento Circular',
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
};

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

  /* ===================================== */
  /* 🔥 NOVO: DEFINE COR ATUAL DINAMICAMENTE */
  /* ===================================== */
  const corAtual = experimento
    ? CORES_FISICA[EXPERIMENTO_FISICA[experimento]]
    : "#white";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Share+Tech+Mono&display=swap');

        .app-container {
          background: #0B0F1A;
          min-height: 100vh;
          color: white;
        }

        .header {
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          padding: 10px 16px;
        }

        .app-header-inner {
          display: flex;
          align-items: center;
          gap: 14px;
          justify-content: center;
        }

        /* 🔥 ALTERADO: removido color fixo */
        .app-logo-text {
          font-family: 'Orbitron', monospace;
          font-size: 15px;
          font-weight: 900;
          letter-spacing: 4px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .app-breadcrumb-sep {
          color: rgba(255,255,255,0.15);
          font-size: 1rem;
        }

        .app-breadcrumb-exp {
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px;
          letter-spacing: 2px;
          color: #7C3AED;
          opacity: 0.85;
        }

        .app-back-btn {
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px;
          letter-spacing: 1.5px;
          padding: 6px 10px;
          background: transparent;
          border: 1px solid rgba(0,212,255,0.35);
          color: rgba(0,212,255,0.7);
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 5px;
          transition: all 0.2s ease;
        }

        .app-back-btn:hover {
          background: rgba(0,212,255,0.08);
          border-color: #00D4FF;
          color: #00D4FF;
          box-shadow: 0 0 10px rgba(0,212,255,0.2);
        }

        .logo-container {
          width: 38px;
          height: 38px;
          cursor: pointer;
        }
      `}</style>

      <div className="app-container">
        <header className="header">

          {/* ESQUERDA */}
          <div>
            {pagina !== 'home' && (
              <button className="app-back-btn" onClick={voltarHome}>
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M7.5 1.5L3 6L7.5 10.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                VOLTAR
              </button>
            )}
          </div>

          {/* CENTRO */}
          <div className="app-header-inner">
            <div
              className="logo-container"
              onClick={voltarHome}
              style={{ color: corAtual }}
            >
              <LogoFisicaLab />
            </div>

            {/* 🔥 ALTERADO: cor dinâmica */}
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

        {pagina === 'home' && <Home onNavegar={navegarPara} />}

        {pagina === 'experimento' &&
          experimento === 'lancamento' && (
            <ExperimentoLancamento />
          )}

          {pagina === 'experimento' && experimento === 'mru' && (
          <ExperimentoMRU />
        )}

        {pagina === 'experimento' && experimento === 'mruv' && (
          <ExperimentoMRUV />
        )}

        {pagina === 'experimento' && experimento === 'circular' && (
          <ExperimentoCircular />
        )}
      </div>
    </>
  );
}