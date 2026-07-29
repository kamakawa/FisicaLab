// src/components/PainelExplicativo.jsx
// Painel flutuante de ajuda contextual: mostra o que está acontecendo agora
// (com base nos parâmetros atuais) e responde perguntas pré-definidas sobre
// os parâmetros/resultados, em formato de chat. Sem IA — todo o texto é
// gerado por template a partir do estado que o experimento já calcula.
//
// Estilos autocontidos (cores fixas, não dependem de variáveis CSS do tema
// da página) para funcionar de forma idêntica em Física 1, 2 e 3, cujos
// temas usam nomes de variáveis diferentes entre si.
import React, { useState, useRef, useEffect } from 'react';

const ESTILOS = `
.pe-botao {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: none;
  background: #6366F1;
  color: #fff;
  font-size: 20px;
  font-weight: 700;
  font-family: 'Inter', system-ui, sans-serif;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0,0,0,0.4);
  z-index: 1000;
  transition: transform 0.2s ease;
}
.pe-botao:hover { transform: scale(1.08); }

.pe-painel {
  position: fixed;
  bottom: 88px;
  right: 24px;
  width: 360px;
  max-height: 65vh;
  display: flex;
  flex-direction: column;
  background: rgba(15, 20, 30, 0.94);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(99, 102, 241, 0.35);
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.5);
  z-index: 999;
  overflow: hidden;
}
.pe-header {
  padding: 14px 16px;
  border-bottom: 1px solid rgba(99, 102, 241, 0.25);
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #F3F4F6;
  letter-spacing: 0.03em;
}
.pe-corpo {
  flex: 1;
  overflow-y: auto;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.pe-corpo::-webkit-scrollbar { width: 6px; }
.pe-corpo::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
.pe-corpo::-webkit-scrollbar-thumb { background: #6366F1; border-radius: 4px; }

.pe-bolha {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 12.5px;
  line-height: 1.55;
  padding: 10px 12px;
  border-radius: 12px;
  max-width: 92%;
}
.pe-bolha-fixa {
  background: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.4);
  align-self: stretch;
  max-width: 100%;
}
.pe-bolha-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #818CF8;
  margin-bottom: 4px;
  font-weight: 700;
}
.pe-bolha-usuario {
  align-self: flex-end;
  background: #6366F1;
  color: #fff;
}
.pe-bolha-assistente {
  align-self: flex-start;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  color: #F3F4F6;
}
.pe-opcoes {
  padding: 10px 12px;
  border-top: 1px solid rgba(255,255,255,0.12);
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.pe-opcao {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 11px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.15);
  background: transparent;
  color: #9CA3AF;
  cursor: pointer;
  transition: all 0.15s ease;
}
.pe-opcao:hover { color: #818CF8; border-color: #818CF8; }
`;

export default function PainelExplicativo({ situacao, perguntas }) {
  const [aberto, setAberto] = useState(false);
  const [historico, setHistorico] = useState([]);
  const corpoRef = useRef(null);

  useEffect(() => {
    if (corpoRef.current) corpoRef.current.scrollTop = corpoRef.current.scrollHeight;
  }, [historico, aberto]);

  const perguntar = (p) => {
    setHistorico(h => [...h, { pergunta: p.pergunta, resposta: p.resposta }]);
  };

  return (
    <>
      <style>{ESTILOS}</style>
      <button className="pe-botao" onClick={() => setAberto(a => !a)} title="Assistente do experimento">
        {aberto ? '✕' : '?'}
      </button>
      {aberto && (
        <div className="pe-painel">
          <div className="pe-header">💬 Assistente do Experimento</div>
          <div className="pe-corpo" ref={corpoRef}>
            <div className="pe-bolha pe-bolha-fixa">
              <div className="pe-bolha-label">Agora, com os parâmetros atuais</div>
              {situacao}
            </div>
            {historico.map((h, i) => (
              <React.Fragment key={i}>
                <div className="pe-bolha pe-bolha-usuario">{h.pergunta}</div>
                <div className="pe-bolha pe-bolha-assistente">{h.resposta}</div>
              </React.Fragment>
            ))}
          </div>
          <div className="pe-opcoes">
            {perguntas.map(p => (
              <button key={p.id} className="pe-opcao" onClick={() => perguntar(p)}>{p.pergunta}</button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
