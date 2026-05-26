// src/components/NewtonCalculus.jsx
import React from 'react';

export default function NewtonCalculus({ massA, massB, muK, g, aceleracao, tracao }) {
  const pesoB = massB * g;
  const fat = muK * massA * g;

  return (
    <div style={{ padding: '0 8px', maxHeight: 'calc(100vh - 180px)', overflowY: 'auto' }}>
      <h2 style={{ fontSize: '1.2rem', color: '#a78bfa', marginBottom: '20px', fontFamily: "'Space Grotesk', sans-serif" }}>
        Análise Matricial de Forças e Vínculos
      </h2>

      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '10px 16px', background: 'rgba(0,0,0,0.3)', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b', borderLeft: '4px solid #60a5fa' }}>
          1. Equação de Vínculo Holônomo
        </div>
        <div style={{ padding: '16px', fontSize: '13px', color: '#cbd5e1', lineHeight: 1.8 }}>
          O fio é ideal (inextensível e massa desprezível). Se x<sub>A</sub> é a posição de A na mesa e y<sub>B</sub> a queda de B:<br/>
          <strong style={{ color: '#60a5fa' }}>x<sub>A</sub>(t) + y<sub>B</sub>(t) = L</strong> (comprimento do fio constante)<br/>
          Derivando duas vezes: <strong>a<sub>A</sub> = a<sub>B</sub> = a</strong>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '10px 16px', background: 'rgba(0,0,0,0.3)', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b', borderLeft: '4px solid #a78bfa' }}>
          2. Formulação Matricial (2ª Lei)
        </div>
        <div style={{ padding: '16px', fontSize: '13px', color: '#cbd5e1', lineHeight: 1.8 }}>
          Sistema na forma [M]·a = F<sub>ext</sub>:
          <pre style={{ background: '#0a0c12', padding: '10px', borderRadius: '6px', margin: '10px 0', fontFamily: "'Fira Code', monospace", fontSize: '12px' }}>
{`[ ${massA}    0 ] [a] = [ T - ${fat.toFixed(2)} ]
[ 0    ${massB} ] [a]   [ ${pesoB.toFixed(2)} - T ]`}
          </pre>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '10px 16px', background: 'rgba(0,0,0,0.3)', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b', borderLeft: '4px solid #34d399' }}>
          3. Aceleração do Sistema
        </div>
        <div style={{ padding: '16px', fontSize: '13px', color: '#cbd5e1', lineHeight: 1.8 }}>
          Somando as equações para eliminar T:<br/>
          <strong>(m<sub>A</sub> + m<sub>B</sub>)·a = m<sub>B</sub>·g - μ<sub>k</sub>·m<sub>A</sub>·g</strong><br/><br/>
          a = (m<sub>B</sub>·g - μ<sub>k</sub>·m<sub>A</sub>·g) / (m<sub>A</sub> + m<sub>B</sub>)<br/>
          a = ({pesoB.toFixed(2)} - {fat.toFixed(2)}) / {massA + massB}<br/><br/>
          <strong style={{ color: '#34d399', fontSize: '16px' }}>a = {aceleracao.toFixed(4)} m/s²</strong>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '10px 16px', background: 'rgba(0,0,0,0.3)', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b', borderLeft: '4px solid #fbbf24' }}>
          4. Força de Tração (Multiplicador de Lagrange)
        </div>
        <div style={{ padding: '16px', fontSize: '13px', color: '#cbd5e1', lineHeight: 1.8 }}>
          Isolando T na equação do Bloco B: T = m<sub>B</sub>·(g - a)<br/><br/>
          T = {massB} · ({g} - {aceleracao.toFixed(4)})<br/><br/>
          <strong style={{ color: '#fbbf24', fontSize: '16px' }}>T = {tracao.toFixed(4)} N</strong>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '10px 16px', background: 'rgba(0,0,0,0.3)', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b', borderLeft: '4px solid #f87171' }}>
          5. Condição de Movimento (1ª Lei de Newton)
        </div>
        <div style={{ padding: '16px', fontSize: '13px', color: '#cbd5e1', lineHeight: 1.8 }}>
          O sistema só se move se a força motora superar o atrito cinético:<br/>
          <strong>m<sub>B</sub>·g &gt; μ<sub>k</sub>·m<sub>A</sub>·g</strong><br/><br/>
          {pesoB.toFixed(2)} &gt; {fat.toFixed(2)}?<br/><br/>
          {pesoB > fat ? (
            <span style={{ color: '#34d399', fontWeight: 'bold', display: 'inline-block', padding: '4px 12px', background: 'rgba(52, 211, 153, 0.1)', borderRadius: '6px' }}>
              ✓ MOVIMENTO ACELERADO (F<sub>res</sub> ≠ 0)
            </span>
          ) : (
            <span style={{ color: '#f87171', fontWeight: 'bold', display: 'inline-block', padding: '4px 12px', background: 'rgba(248, 113, 113, 0.1)', borderRadius: '6px' }}>
              ✗ REPOUSO INERCIAL (F<sub>res</sub> = 0)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}