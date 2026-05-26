// src/components/EnergiaCalculus.jsx
import React from 'react';

export default function EnergiaCalculus({ 
  massa, 
  altura, 
  velocidade, 
  gravidade, 
  atrito, 
  energiaPotencial, 
  energiaCinetica, 
  energiaTotal,
  conservativo 
}) {
  
  const energiaInicial = massa * gravidade * 10;
  const trabalhoPeso = massa * gravidade * (10 - altura);
  const trabalhoAtrito = atrito * (10 - altura);
  const energiaDissipada = energiaInicial - energiaTotal;
  const potencia = atrito > 0 && velocidade > 0 ? atrito * velocidade : 0;

  return (
    <div style={{ padding: '0 8px', maxHeight: 'calc(100vh - 180px)', overflowY: 'auto' }}>
      <h2 style={{ fontSize: '1.2rem', color: '#10b981', marginBottom: '20px', fontFamily: "'Space Grotesk', sans-serif" }}>
        Teorema Trabalho-Energia e Conservação
      </h2>

      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '10px 16px', background: 'rgba(0,0,0,0.3)', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b', borderLeft: '4px solid #10b981' }}>
          1. Definições Fundamentais
        </div>
        <div style={{ padding: '16px', fontSize: '13px', color: '#cbd5e1', lineHeight: 1.8 }}>
          <strong>Energia Cinética:</strong> E<sub>c</sub> = ½·m·v²<br/>
          <strong>Energia Potencial Gravitacional:</strong> E<sub>p</sub> = m·g·h<br/>
          <strong>Energia Mecânica Total:</strong> E<sub>mec</sub> = E<sub>c</sub> + E<sub>p</sub>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '10px 16px', background: 'rgba(0,0,0,0.3)', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b', borderLeft: '4px solid #f97316' }}>
          2. Teorema Trabalho-Energia Cinética
        </div>
        <div style={{ padding: '16px', fontSize: '13px', color: '#cbd5e1', lineHeight: 1.8 }}>
          O trabalho total realizado sobre um corpo é igual à variação de sua energia cinética:
          <br/><br/>
          <strong style={{ color: '#f97316' }}>W<sub>total</sub> = ΔE<sub>c</sub> = E<sub>cf</sub> - E<sub>ci</sub></strong>
          <br/><br/>
          No nosso caso, partindo do repouso (E<sub>ci</sub> = 0):
          <br/>
          W<sub>total</sub> = <strong>{energiaCinetica.toFixed(2)} J</strong>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '10px 16px', background: 'rgba(0,0,0,0.3)', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b', borderLeft: '4px solid #34d399' }}>
          3. Princípio da Conservação da Energia Mecânica
        </div>
        <div style={{ padding: '16px', fontSize: '13px', color: '#cbd5e1', lineHeight: 1.8 }}>
          Em sistemas <strong>conservativos</strong> (sem atrito ou outras forças dissipativas):
          <br/><br/>
          <strong style={{ color: '#34d399' }}>E<sub>mec</sub> = E<sub>c</sub> + E<sub>p</sub> = constante</strong>
          <br/><br/>
          <strong style={{ color: '#34d399' }}>E<sub>ci</sub> + E<sub>pi</sub> = E<sub>cf</sub> + E<sub>pf</sub></strong>
          <br/><br/>
          {conservativo ? (
            <span style={{ color: '#34d399' }}>✓ Sistema conservativo — energia mecânica constante: {energiaTotal.toFixed(2)} J</span>
          ) : (
            <span style={{ color: '#f87171' }}>✗ Sistema dissipativo — há perda de energia mecânica</span>
          )}
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '10px 16px', background: 'rgba(0,0,0,0.3)', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b', borderLeft: '4px solid #f87171' }}>
          4. Trabalho de Forças Conservativas e Dissipativas
        </div>
        <div style={{ padding: '16px', fontSize: '13px', color: '#cbd5e1', lineHeight: 1.8 }}>
          <strong>Força Peso (conservativa):</strong> W<sub>peso</sub> = m·g·Δh<br/>
          → Trabalho independente da trajetória: <strong>{trabalhoPeso.toFixed(2)} J</strong>
          <br/><br/>
          <strong>Força de Atrito (dissipativa):</strong> W<sub>atrito</sub> = -F<sub>at</sub>·d<br/>
          → Trabalho que dissipa energia: <strong>{trabalhoAtrito.toFixed(2)} J</strong>
          <br/><br/>
          <strong>Trabalho total:</strong> W<sub>total</sub> = {trabalhoPeso.toFixed(2)} + ({trabalhoAtrito.toFixed(2)}) = <strong>{(trabalhoPeso + trabalhoAtrito).toFixed(2)} J</strong>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '10px 16px', background: 'rgba(0,0,0,0.3)', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b', borderLeft: '4px solid #10b981' }}>
          5. Potência Mecânica
        </div>
        <div style={{ padding: '16px', fontSize: '13px', color: '#cbd5e1', lineHeight: 1.8 }}>
          A potência mede a taxa de realização de trabalho:
          <br/><br/>
          <strong style={{ color: '#10b981' }}>P = W/Δt = F⃗·v⃗</strong>
          <br/><br/>
          Potência instantânea (força × velocidade): <strong>{potencia.toFixed(2)} W</strong>
          <br/>
          <span className="cmt">A potência do atrito é sempre negativa (dissipação)</span>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '10px 16px', background: 'rgba(0,0,0,0.3)', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b', borderLeft: '4px solid #a78bfa' }}>
          6. Derivada da Energia — Taxa de Variação
        </div>
        <div style={{ padding: '16px', fontSize: '13px', color: '#cbd5e1', lineHeight: 1.8 }}>
          A derivada temporal da energia cinética relaciona-se com a potência:
          <br/><br/>
          <strong>dE<sub>c</sub>/dt = F⃗·v⃗ = P</strong>
          <br/>
          Para a energia potencial: dE<sub>p</sub>/dt = m·g·dh/dt = m·g·v
          <br/><br/>
          No sistema conservativo: <strong>d(E<sub>c</sub> + E<sub>p</sub>)/dt = 0</strong>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '10px 16px', background: 'rgba(0,0,0,0.3)', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b', borderLeft: '4px solid #fbbf24' }}>
          7. Balanço Energético do Sistema
        </div>
        <div style={{ padding: '16px', fontSize: '13px', color: '#cbd5e1', lineHeight: 1.8 }}>
          <strong>Energia inicial:</strong> E<sub>inicial</sub> = {energiaInicial.toFixed(2)} J (E<sub>p</sub> máxima, E<sub>c</sub> = 0)<br/>
          <strong>Energia atual:</strong> E<sub>atual</sub> = {energiaTotal.toFixed(2)} J<br/>
          <strong>Energia dissipada:</strong> ΔE = {energiaDissipada.toFixed(2)} J
          <br/><br/>
          {conservativo ? (
            <span style={{ color: '#34d399' }}>
              ✓ A energia mecânica se conserva — toda energia potencial se converte em cinética e vice-versa
            </span>
          ) : (
            <span style={{ color: '#f87171' }}>
              ⚠ Há dissipação de energia — parte da energia mecânica se converte em térmica (calor) devido ao atrito
            </span>
          )}
        </div>
      </div>
    </div>
  );
}