// src/pages/ExperimentoLeisNewton.jsx
import React, { useState, useEffect } from 'react';
import NewtonCalculus from '../components/NewtonCalculus';
import CanvasNewton from '../components/CanvasNewton'; // 🌟 ADICIONE ESTA LINHA

// Configuração de um sistema clássico de corpos: Bloco A (na mesa) e Bloco B (suspenso)
export default function ExperimentoLeisNewton() {
  const [massA, setMassA] = useState(5); // kg
  const [massB, setMassB] = useState(3); // kg
  const [muK, setMuK] = useState(0.2);  // Coeficiente de atrito cinético
  const [tempo, setTempo] = useState(0);
  const [rodando, setRodando] = useState(false);
  const [activeTab, setActiveTab] = useState("sim");

  const g = 9.81;

  // --- Resolução Dinâmica do Sistema via Leis de Newton ---
  // Bloco A: T - f_at = m_A * a  => T - mu_k * m_A * g = m_A * a
  // Bloco B: m_B * g - T = m_B * a
  // Somando: m_B * g - mu_k * m_A * g = (m_A + m_B) * a
  const forçaAtritoMax = muK * massA * g;
  const forçaMotora = massB * g;
  
  // Condição da 1ª Lei (Inércia): Se a força motora não vence o atrito (estático/cinético aproximado aqui), não há aceleração
  const aceleração = forçaMotora > forçaAtritoMax 
    ? (forçaMotora - forçaAtritoMax) / (massA + massB) 
    : 0;

  const tração = aceleração > 0 
    ? massB * (g - aceleração) 
    : forçaMotora; // Em repouso, a tração iguala o peso de B

  useEffect(() => {
    if (!rodando) return;
    const interval = setInterval(() => {
      setTempo(t => {
        const proxTempo = t + 0.02;
        // Impedir que o bloco caia infinitamente (limite físico do cabo/mesa)
        const posB = 0.5 * aceleração * proxTempo * proxTempo;
        if (posB > 4) {
          setRodando(false);
          return t;
        }
        return proxTempo;
      });
    }, 20);
    return () => clearInterval(interval);
  }, [rodando, aceleração]);

  const handleReset = () => {
    setRodando(false);
    setTempo(0);
  };

  // Posições instantâneas baseadas na solução da EDO (d²x/dt² = a)
  const deslocamento = 0.5 * aceleração * tempo * tempo;
  const velocidade = aceleração * tempo;

  return (
    <div style={{ padding: '24px', background: '#07090f', color: '#e2e8f0', minHeight: '100vh', fontFamily: "'Space Grotesk', sans-serif" }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.8rem', color: '#60a5fa' }}>Dinâmica: Leis de Newton e Sistemas Acoplados</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Análise vetorial, forças de vínculo (tração) e dissipação por atrito.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>
        {/* Painel de Controles */}
        <div style={{ background: '#0d1117', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.07)' }}>
          <h3 style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', marginBottom: '16px' }}>Parâmetros do Sistema</h3>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px' }}>Massa do Bloco A: <span style={{ color: '#60a5fa' }}>{massA} kg</span></label>
            <input type="range" min="1" max="20" step="0.5" value={massA} onChange={(e) => setMassA(Number(e.target.value))} style={{ width: '100%' }} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px' }}>Massa do Bloco B (Suspenso): <span style={{ color: '#fbbf24' }}>{massB} kg</span></label>
            <input type="range" min="1" max="20" step="0.5" value={massB} onChange={(e) => setMassB(Number(e.target.value))} style={{ width: '100%' }} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px' }}>Coeficiente de Atrito ($\mu_k$): <span style={{ color: '#f87171' }}>{muK}</span></label>
            <input type="range" min="0" max="0.8" step="0.05" value={muK} onChange={(e) => setMuK(Number(e.target.value))} style={{ width: '100%' }} />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button onClick={() => setRodando(!rodando)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#34d399', color: '#07090f', fontWeight: 'bold', cursor: 'pointer' }}>
              {rodando ? '⏸ Pausar' : '▶ Iniciar'}
            </button>
            <button onClick={handleReset} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#fff', cursor: 'pointer' }}>
              ⟳ Reset
            </button>
          </div>

          {/* Métricas em Tempo Real */}
          <div style={{ background: '#111827', padding: '12px', borderRadius: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Aceleração</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#a78bfa' }}>{aceleração.toFixed(2)} m/s²</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Força de Tração</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#34d399' }}>{tração.toFixed(2)} N</div>
            </div>
          </div>
        </div>

        {/* Abas de Visualização (Simulação / Cálculo Avançado) */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: '8px' }}>
            <button onClick={() => setActiveTab("sim")} style={{ background: activeTab === 'sim' ? 'rgba(96,165,250,0.1)' : 'transparent', color: activeTab === 'sim' ? '#60a5fa' : '#64748b', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>
              Simulação Dinâmica
            </button>
            <button onClick={() => setActiveTab("calculus")} style={{ background: activeTab === 'calculus' ? 'rgba(167,139,250,0.1)' : 'transparent', color: activeTab === 'calculus' ? '#a78bfa' : '#64748b', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>
              Matriz Newtoniana & Vínculos
            </button>
          </div>

          <div style={{ flex: 1, background: '#0d1117', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.07)', padding: '20px', minHeight: '400px' }}>
            {activeTab === "sim" && (
                <div>
                    {/* 🌟 SUBSTITUA A DIV ANTIGA POR ESSA NOVA ESTRUTURA COM O CANVASNEWTON */}
                    <CanvasNewton 
                    massA={massA} 
                    massB={massB} 
                    deslocamento={deslocamento} 
                    aceleração={aceleração} 
                    muK={muK} 
                    />

                    <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', fontFamily: 'monospace', fontSize: '13px' }}>
                        <span style={{ color: '#60a5fa' }}>Tempo: {tempo.toFixed(2)}s</span>
                        <span style={{ color: '#64748b', margin: '0 12px' }}>|</span>
                        <span style={{ color: '#34d399' }}>Deslocamento: {deslocamento.toFixed(2)}m / 4.00m</span>
                        <span style={{ color: '#64748b', margin: '0 12px' }}>|</span>
                        <span style={{ color: '#a78bfa' }}>Velocidade: {velocidade.toFixed(2)}m/s</span>
                    </div>

                    <h3 style={{ fontSize: '14px', color: '#e2e8f0', marginBottom: '12px' }}>Ação e Reação Manifesta</h3>
                    <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.6' }}>
                    Note que a força que o cabo exerce no Bloco A é exatamente igual em magnitude à força que exerce no Bloco B (T_A = T_B = {tração.toFixed(1)} N). De acordo com a <strong>3ª Lei de Newton</strong>, as forças internas do par cabo-bloco se cancelam quando analisamos o sistema como um todo unificado, restando apenas as forças externas de gravidade sobre B e o atrito sobre A para ditar a aceleração total.
                    </p>
                </div>
                )}

            {activeTab === "calculus" && (
              <NewtonCalculus massA={massA} massB={massB} muK={muK} g={g} aceleração={aceleração} tração={tração} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}