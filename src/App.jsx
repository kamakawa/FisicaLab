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
import ExperimentoLeisNewton from './pages/ExperimentoLeisNewton';
import ExperimentoEnergiaMecanica from './pages/ExperimentoEnergiaMecanica';
import ExperimentoGasesIdeais from './pages/ExperimentoGasesIdeais';
import ExperimentoLeisTermo from './pages/ExperimentoLeisTermo';
import ExperimentoHidrostatica from './pages/ExperimentoHidrostatica';
import ExperimentoDinamicaFluidos from './pages/ExperimentoDinamicaFluidos';
import ExperimentoMHS from './pages/ExperimentoMHS';
import ExperimentoOndasSonoras from './pages/ExperimentoOndasSonoras';
import ExperimentoCalorimetria from './pages/ExperimentoCalorimetria';
import ExperimentoOndasEstacionarias from './pages/ExperimentoOndasEstacionarias';
import ExperimentoDilatacaoTermica from './pages/ExperimentoDilatacaoTermica';
import ExperimentoTubosSonoros from './pages/ExperimentoTubosSonoros';

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

  'energia-mecanica': 'Energia Mecânica',

  gases: 'Gases Ideais',

  'leis-termo': '1ª e 2ª Lei da Termodinâmica',

  hidrostatica: 'Hidrostática e Empuxo',

  'dinamica-fluidos': 'Dinâmica dos Fluidos',

  mhs: 'Oscilações Harmônicas',

  som: 'Ondas Sonoras e Doppler',

  calorimetria: 'Calorimetria e Transferência de Calor',

  'ondas-estacionarias': 'Ondas Estacionárias em Cordas',

  'dilatacao-termica': 'Dilatação Térmica',

  'tubos-sonoros': 'Ondas Sonoras em Tubos',
};

/* ========================================================= */
/* CORES */
/* ========================================================= */

const CORES_FISICA = {
  fisica1: '#00D4FF',

  fisica2: '#EF4444',

  fisica3: '#00F5C4',
};

const CORES_FISICA_RGB = {
  fisica1: '0,212,255',

  fisica2: '239,68,68',

  fisica3: '0,245,196',
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

  'energia-mecanica': 'fisica1',

  gases: 'fisica2',

  'leis-termo': 'fisica2',

  hidrostatica: 'fisica2',

  'dinamica-fluidos': 'fisica2',

  mhs: 'fisica2',

  som: 'fisica2',

  calorimetria: 'fisica2',

  'ondas-estacionarias': 'fisica2',

  'dilatacao-termica': 'fisica2',

  'tubos-sonoros': 'fisica2',
};

const FISICA_PARA_TAB_HOME = {
  fisica1: 'f1',
  fisica2: 'f2',
  fisica3: 'f3',
};

export default function App() {
  const [pagina, setPagina] = useState('home');

  const [experimento, setExperimento] = useState(null);

  const [homeTab, setHomeTab] = useState('f1');

  /* ========================================================= */
  /* NAVEGAÇÃO */
  /* ========================================================= */

  const navegarPara = (exp) => {
    setExperimento(exp);

    setPagina('experimento');
  };

  const voltarHome = () => {
    const fisica = EXPERIMENTO_FISICA[experimento];

    if (fisica) setHomeTab(FISICA_PARA_TAB_HOME[fisica] || 'f1');

    setPagina('home');

    setExperimento(null);
  };

  /* ========================================================= */
  /* COR DINÂMICA */
  /* ========================================================= */

  const corAtual = experimento
    ? CORES_FISICA[EXPERIMENTO_FISICA[experimento]]
    : '#FFFFFF';

  const corAtualRgb = experimento
    ? CORES_FISICA_RGB[EXPERIMENTO_FISICA[experimento]]
    : '255,255,255';

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

          border:1px solid rgba(var(--fisica-color-rgb),0.25);

          color:rgba(var(--fisica-color-rgb),0.7);

          border-radius:8px;

          cursor:pointer;

          display:flex;

          align-items:center;

          gap:6px;

          transition:all 0.25s ease;
        }

        .app-back-btn:hover{
          background:rgba(var(--fisica-color-rgb),0.08);

          border-color:var(--fisica-color);

          color:var(--fisica-color);

          box-shadow:
            0 0 10px rgba(var(--fisica-color-rgb),0.2);
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

      <div className="app-container" style={{ '--fisica-color': corAtual, '--fisica-color-rgb': corAtualRgb }}>

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
          <Home onNavegar={navegarPara} tabInicial={homeTab} />
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
          experimento === 'leis-newton' && (
            <ExperimentoLeisNewton />
          )}

        {pagina === 'experimento' &&
          experimento === 'plano-inclinado' && (
            <ExperimentoPlanoInclinado />
          )}

        {pagina === 'experimento' &&
          experimento === 'energia-mecanica' && (
            <ExperimentoEnergiaMecanica />
          )}

        {pagina === 'experimento' &&
          experimento === 'colisoes' && (
            <ExperimentoColisoes />
          )}

        {pagina === 'experimento' &&
          experimento === 'gases' && (
            <ExperimentoGasesIdeais />
          )}

        {pagina === 'experimento' &&
          experimento === 'leis-termo' && (
            <ExperimentoLeisTermo />
          )}

        {pagina === 'experimento' &&
          experimento === 'hidrostatica' && (
            <ExperimentoHidrostatica />
          )}

        {pagina === 'experimento' &&
          experimento === 'dinamica-fluidos' && (
            <ExperimentoDinamicaFluidos />
          )}

        {pagina === 'experimento' &&
          experimento === 'mhs' && (
            <ExperimentoMHS />
          )}

        {pagina === 'experimento' &&
          experimento === 'som' && (
            <ExperimentoOndasSonoras />
          )}

        {pagina === 'experimento' &&
          experimento === 'calorimetria' && (
            <ExperimentoCalorimetria />
          )}

        {pagina === 'experimento' &&
          experimento === 'ondas-estacionarias' && (
            <ExperimentoOndasEstacionarias />
          )}

        {pagina === 'experimento' &&
          experimento === 'dilatacao-termica' && (
            <ExperimentoDilatacaoTermica />
          )}

        {pagina === 'experimento' &&
          experimento === 'tubos-sonoros' && (
            <ExperimentoTubosSonoros />
          )}

      </div>
    </>
  );
}