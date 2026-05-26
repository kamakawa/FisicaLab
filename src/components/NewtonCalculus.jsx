// src/components/NewtonCalculus.jsx
import React from 'react';

// Auxiliares de estilização matemática customizada
function Frac({ num, den, color = "#e2e8f0" }) {
  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', verticalAlign: 'middle', padding: '0 4px' }}>
      <span style={{ borderBottom: `1px solid ${color}`, paddingBottom: '2px', fontSize: '0.9em', color }}>{num}</span>
      <span style={{ paddingTop: '2px', fontSize: '0.9em', color }}>{den}</span>
    </span>
  );
}

function FormulaBlock({ title, color, children }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderLeft: `4px solid ${color}`, borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>{title}</div>
      <div style={{ fontFamily: "'Fira Code', monospace", fontSize: '14px', color: '#cbd5e1', lineHeight: '1.8' }}>{children}</div>
    </div>
  );
}

export default function NewtonCalculus({ massA, massB, muK, g, aceleração, tração }) {
  const pesoB = massB * g;
  const fat = muK * massA * g;

  return (
    <div style={{ overflowY: 'auto', maxHeight: '550px', paddingRight: '8px' }}>
      <h2 style={{ fontSize: '1.2rem', color: '#a78bfa', marginBottom: '16px' }}>Análise Lagrangeana / Matricial de Forças</h2>

      {/* 1. O Vínculo Geométrico */}
      <FormulaBlock title="1. Equação de Vínculo Holônomo" color="#60a5fa">
        O fio é ideal (inextensível e de massa desprezível). Se x_A é a posição de A na mesa e y_B a queda de B:<br/>
        <span style={{ color: '#60a5fa' }}>x_A(t) + y_B(t) = L  (// comprimento do fio constante)</span><br/>
        Derivando duas vezes em relação ao tempo t:<br/>
        ẍ_A + ÿ_B = 0 ⟹ a_A = a_B = a
      </FormulaBlock>

      {/* 2. Formulação do Sistema Linear */}
      <FormulaBlock title="2. Formulação Matricial (2ª Lei Restrita)" color="#a78bfa">
        Escrevendo o sistema acoplado na forma de matriz de massa [M]a⃗ = F⃗_ext:<br/>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '12px 0', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '6px' }}>
          <span>
            [m_A  0] [a] = [T - f_at]<br/>
            [ 0  m_B] [a]   [m_B·g - T]
          </span>
        </div>
        Substituindo os valores definidos:<br/>
        [{massA}  0] [a] = [T - {fat.toFixed(2)}]<br/>
        [ 0  {massB}] [a]   [{pesoB.toFixed(2)} - T]
      </FormulaBlock>

      {/* 3. Resolução Analítica */}
      <FormulaBlock title="3. Isolamento da Aceleração do Centro de Massa" color="#34d399">
        Somando as equações lineares para eliminar a força interna de restrição (Tração T):<br/>
        (m_A + m_B) · a = m_B·g - μ_k·m_A·g<br/>
        a = <Frac num="m_B·g - μ_k·m_A·g" den="m_A + m_B" color="#34d399" /><br/>
        a = <Frac num={`${pesoB.toFixed(2)} - ${fat.toFixed(2)}`} den={`${massA} + ${massB}`} color="#34d399" /> 
        = <strong style={{ color: '#34d399' }}>{aceleração.toFixed(4)} m/s²</strong>
      </FormulaBlock>

      {/* 4. Força de Reação/Vínculo */}
      <FormulaBlock title="4. Determinação do Multiplicador de Lagrange (Tração)" color="#fbbf24">
        Substituindo a aceleração de volta na EDO do Bloco B para achar a restrição de tração:<br/>
        T = m_B·(g - a)<br/>
        T = {massB} · ({g} - {aceleração.toFixed(2)}) = <strong style={{ color: '#fbbf24' }}>{tração.toFixed(4)} N</strong>
      </FormulaBlock>

      {/* 5. Verificação da 1ª Lei de Newton */}
      <FormulaBlock title="5. Critério de Equilíbrio Estático (1ª Lei)" color="#f87171">
        O sistema só sairá do repouso se a componente motora externa superar a barreira de atrito estático:<br/>
        Condição de Movimento: m_B·g &gt; μ_k·m_A·g<br/>
        Status Atual: {pesoB > fat ? (
          <span style={{ color: '#34d399', fontWeight: 'bold' }}>MOVIMENTO VARIADO (F_res ≠ 0)</span>
        ) : (
          <span style={{ color: '#f87171', fontWeight: 'bold' }}>INÉRCIA PRESENCIAL (F_res = 0, sistema travado)</span>
        )}
      </FormulaBlock>
    </div>
  );
}