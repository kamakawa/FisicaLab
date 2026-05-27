import React, { useState } from 'react';
import './App.css';

import Home from './pages/Home';

import LogoFisicaLab from './components/LogoFisicaLab';

import ExperimentoLancamento from './pages/ExperimentoLancamento';
import ExperimentoMRU from './pages/ExperimentoMRU';
import ExperimentoMRUV from './pages/ExperimentoMUV';
import ExperimentoCircular from './pages/ExperimentoCircular';
import ExperimentoPlanoInclinado from './pages/ExperimentoPlanoInclinado';
import ExperimentoColisoes from './pages/ExperimentoColisoes';

/* ========================================================= */
/* TITULOS */
/* ========================================================= */

const TITULOS = {
  lancamento: 'Lançamento de Projéteis',

  mru: 'Movimento Retilíneo Uniforme',

  mruv: 'Movimento Retilíneo Uniformemente Variado',

  circular: 'Movimento Circular',

  'leis-newton': 'Leis de Newton e Sistemas Acoplados',

  'plano-inclinado': 'Planos Inclinados e Atrito',

  'colisoes': 'Colisões',
};

/* ========================================================= */
/* CORES */
/* ========================================================= */

const CORES_FISICA = {
  fisica1: '#00D4FF',

  fisica2: '#FF6B9D',

  fisica3: '#00F5C4',
};

/* ========================================================= */
/* MAPEAMENTO */
/* ========================================================= */

const EXPERIMENTO_FISICA = {
  lancamento: 'fisica1',

  mru: 'fisica1',

  mruv: 'fisica1',

  circular: 'fisica1',

  'leis-newton': 'fisica1',

  'plano-inclinado': 'fisica1',

  'colisoes': 'fisica1',
};

export default function App() {
  const [pagina, setPagina] = useState('home');

  const [experimento, setExperimento] = useState(null);

  /* ========================================================= */
  /* NAVEGAÇÃO */
  /* ========================================================= */

  const navegarPara = (exp) => {
    setExperimento(exp);

    setPagina('experimento');
  };

  const voltarHome = () => {
    setPagina('home');

    setExperimento(null);
  };

  /* ========================================================= */
  /* COR DINÂMICA */
  /* ========================================================= */

  const corAtual = experimento
    ? CORES_FISICA[EXPERIMENTO_FISICA[experimento]]
    : '#FFFFFF';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Share+Tech+Mono&display=swap');

        *{
          box-sizing:border-box;
        }

        body{
          margin:0;
          background:#05070B;
        }

        .app-container{
          background:#05070B;
          min-height:100vh;
          color:white;
        }

        /* ========================================================= */
        /* HEADER */
        /* ========================================================= */

        .header{
          display:grid;

          grid-template-columns:auto 1fr auto;

          align-items:center;

          padding:14px 24px;

          border-bottom:1px solid rgba(255,255,255,0.04);

          background:
            linear-gradient(
              180deg,
              rgba(255,255,255,0.02),
              transparent
            );

          backdrop-filter: blur(12px);

          position:sticky;

          top:0;

          z-index:999;
        }

        /* ========================================================= */
        /* ESQUERDA */
        /* ========================================================= */

        .app-back-btn{
          font-family:'Share Tech Mono', monospace;

          font-size:11px;

          letter-spacing:1.5px;

          padding:8px 12px;

          background:transparent;

          border:1px solid rgba(0,212,255,0.25);

          color:rgba(0,212,255,0.7);

          border-radius:8px;

          cursor:pointer;

          display:flex;

          align-items:center;

          gap:6px;

          transition:all 0.25s ease;
        }

        .app-back-btn:hover{
          background:rgba(0,212,255,0.08);

          border-color:#00D4FF;

          color:#00D4FF;

          box-shadow:
            0 0 10px rgba(0,212,255,0.2);
        }

        /* ========================================================= */
        /* CENTRO */
        /* ========================================================= */

        .app-header-inner{
          display:flex;

          align-items:center;

          justify-content:center;

          gap:14px;
        }

        .logo-container{
          width:34px;

          height:34px;

          display:flex;

          align-items:center;

          justify-content:center;

          cursor:pointer;

          transition:0.25s;
        }

        .logo-container:hover{
          transform:scale(1.05);
        }

        /* ========================================================= */
        /* TEXTO LOGO */
        /* ========================================================= */

        .app-logo-text{
          font-family:'Orbitron', monospace;

          font-size:18px;

          font-weight:900;

          letter-spacing:3px;

          cursor:pointer;

          transition:all 0.3s ease;

          color:#FFFFFF;

          text-transform:uppercase;

          user-select:none;
        }

        .app-logo-text:hover{
          transform:translateY(-1px);
        }

        /* ========================================================= */
        /* BREADCRUMB */
        /* ========================================================= */

        .app-breadcrumb-sep{
          color:rgba(255,255,255,0.12);

          font-size:1rem;
        }

        .app-breadcrumb-exp{
          font-family:'Share Tech Mono', monospace;

          font-size:11px;

          letter-spacing:2px;

          color:#7C3AED;

          opacity:0.8;
        }

        /* ========================================================= */
        /* RESPONSIVO */
        /* ========================================================= */

        @media(max-width:768px){

          .header{
            padding:12px;
          }

          .app-logo-text{
            font-size:14px;

            letter-spacing:2px;
          }

          .app-breadcrumb-exp{
            display:none;
          }

          .logo-container{
            width:28px;
            height:28px;
          }
        }
      `}</style>

      <div className="app-container">

        {/* ========================================================= */}
        {/* HEADER */}
        {/* ========================================================= */}

        <header className="header">

          {/* ESQUERDA */}

          <div>
            {pagina !== 'home' && (
              <button
                className="app-back-btn"
                onClick={voltarHome}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 12 12"
                  fill="none"
                >
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
              style={{
                color: corAtual,
              }}
            >
              <LogoFisicaLab />
            </div>

            <span
              className="app-logo-text"
              onClick={voltarHome}
              style={{
                color: corAtual,

                textShadow: `0 0 18px ${corAtual}55`,
              }}
            >
              FISICALAB
            </span>

            {pagina !== 'home' && experimento && (
              <>
                <span className="app-breadcrumb-sep">
                  /
                </span>

                <span className="app-breadcrumb-exp">
                  {TITULOS[experimento] ?? experimento}
                </span>
              </>
            )}
          </div>

          {/* DIREITA */}

          <div />

        </header>

        {/* ========================================================= */}
        {/* HOME */}
        {/* ========================================================= */}

        {pagina === 'home' && (
          <Home onNavegar={navegarPara} />
        )}

        {/* ========================================================= */}
        {/* EXPERIMENTOS */}
        {/* ========================================================= */}

        {pagina === 'experimento' &&
          experimento === 'lancamento' && (
            <ExperimentoLancamento />
          )}

        {pagina === 'experimento' &&
          experimento === 'mru' && (
            <ExperimentoMRU />
          )}

        {pagina === 'experimento' &&
          experimento === 'mruv' && (
            <ExperimentoMRUV />
          )}

        {pagina === 'experimento' &&
          experimento === 'circular' && (
            <ExperimentoCircular />
          )}

        {pagina === 'experimento' &&
          experimento === 'plano-inclinado' && (
            <ExperimentoPlanoInclinado />
          )}

        {pagina === 'experimento' &&
          experimento === 'colisoes' && (
            <ExperimentoColisoes />
          )}

      </div>
    </>
  );
}