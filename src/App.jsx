import React, { useState } from 'react';
import './App.css';
import Home from './pages/Home';
import ExperimentoLancamento from './pages/ExperimentoLancamento';
import LogoFisicaLab from './components/LogoFisicaLab';

const TITULOS = {
  lancamento: 'Lançamento de Projéteis',
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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Share+Tech+Mono&display=swap');

        /* ===== BASE ===== */
        .app-container {
          background: #0B0F1A;
          min-height: 100vh;
          color: white;
        }

        /* ===== HEADER GRID (CORREÇÃO PRINCIPAL) ===== */
        .header {
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          padding: 10px 16px;
        }

        /* ===== CENTRO ===== */
        .app-header-inner {
          display: flex;
          align-items: center;
          gap: 14px;
          justify-content: center;
        }

        .app-logo-text {
          font-family: 'Orbitron', monospace;
          font-size: 15px;
          font-weight: 900;
          letter-spacing: 4px;
          color: #00D4FF;
          text-shadow: 0 0 18px rgba(0,212,255,0.5);
          cursor: pointer;
          white-space: nowrap;
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
          white-space: nowrap;
        }

        /* ===== BOTÃO VOLTAR (SEM SOBREPOSIÇÃO) ===== */
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

        /* ===== LOGO ===== */
        .logo-container {
          width: 38px;
          height: 38px;
          cursor: pointer;
          flex-shrink: 0;
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
            <div className="logo-container" onClick={voltarHome}>
              <LogoFisicaLab />
            </div>

            <span className="app-logo-text" onClick={voltarHome}>
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

          {/* DIREITA (ESPAÇO) */}
          <div></div>

        </header>

        {/* PÁGINAS */}
        {pagina === 'home' && (
          <Home onNavegar={navegarPara} />
        )}

        {pagina === 'experimento' && experimento === 'lancamento' && (
          <ExperimentoLancamento />
        )}
      </div>
    </>
  );
}