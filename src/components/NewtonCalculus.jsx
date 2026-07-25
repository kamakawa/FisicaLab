// src/components/NewtonCalculus.jsx
import React from 'react';

const BLUE   = "#00D4FF";
const TEAL   = "#00F5C4";
const ORANGE = "#F97316";
const PURPLE = "#A855F7";
const CORAL  = "#f87171";
const MUTED  = "#9CA3AF";

function Frac({ num, den, color = "#F3F4F6" }) {
  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', verticalAlign: 'middle', padding: '0 4px' }}>
      <span style={{ borderBottom: `1px solid ${color}`, paddingBottom: '2px', fontSize: '0.9em', color }}>{num}</span>
      <span style={{ paddingTop: '2px', fontSize: '0.9em', color }}>{den}</span>
    </span>
  );
}

function FormulaBlock({ title, color, children }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderLeft: `3px solid ${color}`,
      borderRadius: '0 14px 14px 0',
      padding: '16px',
      marginBottom: '14px',
      transition: 'border-color 0.3s ease',
    }}>
      <div style={{ fontSize: '10px', color: MUTED, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.1em' }}>{title}</div>
      <div style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: '13.5px', color: '#CBD5E1', lineHeight: '1.9' }}>{children}</div>
    </div>
  );
}

export default function NewtonCalculus({ massA, massB, muK, g, aceleracao, tracao }) {
  const pesoB = massB * g;
  const fat = muK * massA * g;

  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: PURPLE, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1, height: 1, background: PURPLE + '30' }} />
        Análise Lagrangeana / Matricial de Forças
        <div style={{ flex: 1, height: 1, background: PURPLE + '30' }} />
      </div>

      {/* 1. O Vínculo Geométrico */}
      <FormulaBlock title="1. Equação de Vínculo Holônomo" color={BLUE}>
        O fio é ideal (inextensível e de massa desprezível). Se x_A é a posição de A na mesa e y_B a queda de B:<br/>
        <span style={{ color: BLUE }}>x_A(t) + y_B(t) = L  (// comprimento do fio constante)</span><br/>
        Derivando duas vezes em relação ao tempo t:<br/>
        ẍ_A + ÿ_B = 0 ⟹ a_A = a_B = a
      </FormulaBlock>

      {/* 2. Formulação do Sistema Linear */}
      <FormulaBlock title="2. Formulação Matricial (2ª Lei Restrita)" color={PURPLE}>
        Escrevendo o sistema acoplado na forma de matriz de massa [M]a⃗ = F⃗_ext:<br/>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '12px 0', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px' }}>
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
      <FormulaBlock title="3. Isolamento da Aceleração do Centro de Massa" color={TEAL}>
        Somando as equações lineares para eliminar a força interna de restrição (Tração T):<br/>
        (m_A + m_B) · a = m_B·g - μ_k·m_A·g<br/>
        a = <Frac num="m_B·g - μ_k·m_A·g" den="m_A + m_B" color={TEAL} /><br/>
        a = <Frac num={`${pesoB.toFixed(2)} - ${fat.toFixed(2)}`} den={`${massA} + ${massB}`} color={TEAL} />
        {" = "}<strong style={{ color: TEAL }}>{aceleracao.toFixed(4)} m/s²</strong>
      </FormulaBlock>

      {/* 4. Força de Reação/Vínculo */}
      <FormulaBlock title="4. Determinação do Multiplicador de Lagrange (Tração)" color={ORANGE}>
        Substituindo a aceleração de volta na EDO do Bloco B para achar a restrição de tração:<br/>
        T = m_B·(g - a)<br/>
        T = {massB} · ({g} - {aceleracao.toFixed(2)}) = <strong style={{ color: ORANGE }}>{tracao.toFixed(4)} N</strong>
      </FormulaBlock>

      {/* 5. Verificação da 1ª Lei de Newton */}
      <FormulaBlock title="5. Critério de Equilíbrio Estático (1ª Lei)" color={CORAL}>
        O sistema só sairá do repouso se a componente motora externa superar a barreira de atrito estático:<br/>
        Condição de Movimento: m_B·g &gt; μ_k·m_A·g<br/>
        Status Atual: {pesoB > fat ? (
          <span style={{ color: TEAL, fontWeight: 'bold' }}>MOVIMENTO VARIADO (F_res ≠ 0)</span>
        ) : (
          <span style={{ color: CORAL, fontWeight: 'bold' }}>INÉRCIA PRESENCIAL (F_res = 0, sistema travado)</span>
        )}
      </FormulaBlock>
    </div>
  );
}
