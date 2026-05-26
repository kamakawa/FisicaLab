// src/components/CanvasEnergia.jsx
import React, { useRef, useEffect } from 'react';

export default function CanvasEnergia({ 
  massa, 
  altura, 
  velocidade, 
  gravidade, 
  energiaPotencial, 
  energiaCinetica, 
  energiaTotal,
  showVectors,
  conservativo,
  atrito
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const W = canvas.width = 700;
    const H = canvas.height = 400;

    // Fundo com gradiente
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#0a0c12');
    grad.addColorStop(1, '#07090f');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Chão
    const soloY = H - 50;
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, soloY, W, 50);
    
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, soloY);
    ctx.lineTo(W, soloY);
    ctx.stroke();

    // Escala vertical
    const alturaMax = 12;
    const escalaY = (soloY - 60) / alturaMax;
    
    // Bloco (esfera) na posição atual
    const cx = W / 2;
    const cy = soloY - Math.min(altura, alturaMax) * escalaY;
    const raio = Math.min(25, 20 + massa / 5);

    // Sombra
    ctx.shadowColor = 'rgba(16,185,129,0.3)';
    ctx.shadowBlur = 20;
    
    // Glow de energia
    const intensidadeGlow = Math.min(0.5, (energiaTotal / 500) * 0.5);
    const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, raio + 20);
    glowGrad.addColorStop(0, `rgba(16,185,129,${0.3 + intensidadeGlow})`);
    glowGrad.addColorStop(1, 'rgba(16,185,129,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, raio + 20, 0, Math.PI * 2);
    ctx.fillStyle = glowGrad;
    ctx.fill();
    
    ctx.shadowBlur = 0;

    // Corpo da esfera (gradiente baseado na energia)
    const gradBody = ctx.createRadialGradient(cx - 8, cy - 8, 5, cx, cy, raio);
    const intensidadeVerde = Math.min(0.8, energiaCinetica / 500);
    gradBody.addColorStop(0, `rgba(52, 211, 153, ${0.5 + intensidadeVerde})`);
    gradBody.addColorStop(1, `rgba(16, 185, 129, ${0.3 + intensidadeVerde})`);
    
    ctx.beginPath();
    ctx.arc(cx, cy, raio, 0, Math.PI * 2);
    ctx.fillStyle = gradBody;
    ctx.fill();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Texto da massa
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px "Space Grotesk"';
    ctx.textAlign = 'center';
    ctx.fillText(`${massa.toFixed(1)} kg`, cx, cy + 4);

    // Vetores de força
    if (showVectors) {
      const drawArrow = (x1, y1, x2, y2, color, label) => {
        const headlen = 10;
        const angle = Math.atan2(y2 - y1, x2 - x1);
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - headlen * Math.cos(angle - Math.PI / 6), y2 - headlen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(x2 - headlen * Math.cos(angle + Math.PI / 6), y2 - headlen * Math.sin(angle + Math.PI / 6));
        ctx.fill();
        
        ctx.fillStyle = color;
        ctx.font = '10px monospace';
        ctx.fillText(label, x2 + 8, y2 - 4);
      };

      // Peso (para baixo)
      const peso = massa * gravidade;
      const escalaPeso = Math.min(60, peso / 5);
      drawArrow(cx, cy + raio, cx, cy + raio + escalaPeso, '#f87171', `P = ${peso.toFixed(1)}N`);

      // Se houver atrito e movimento
      if (atrito > 0 && velocidade > 0) {
        drawArrow(cx + raio, cy, cx + raio + Math.min(40, atrito * 2), cy, '#f97316', `Fₐₜ = ${atrito.toFixed(1)}N`);
      }
    }

    // Réguas de altura
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const h = i * 2;
      const y = soloY - h * escalaY;
      if (y > 40 && y < soloY) {
        ctx.beginPath();
        ctx.moveTo(cx - 40, y);
        ctx.lineTo(cx - 20, y);
        ctx.stroke();
        ctx.fillStyle = '#64748b';
        ctx.font = '10px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`${h} m`, cx - 45, y + 3);
      }
    }

    ctx.textAlign = 'left';
    
    // Labels de energia
    ctx.fillStyle = '#34d399';
    ctx.font = '10px monospace';
    ctx.fillText(`Eₚ = ${energiaPotencial.toFixed(1)} J`, 20, 40);
    ctx.fillStyle = '#f97316';
    ctx.fillText(`E꜀ = ${energiaCinetica.toFixed(1)} J`, 20, 60);
    ctx.fillStyle = '#10b981';
    ctx.fillText(`Eₘₑ꜀ = ${energiaTotal.toFixed(1)} J`, 20, 80);
    
    ctx.fillStyle = '#64748b';
    ctx.fillText(`v = ${velocidade.toFixed(2)} m/s`, 20, 110);
    
    if (!conservativo && atrito > 0) {
      ctx.fillStyle = '#f87171';
      ctx.fillText(`⚠ Sistema dissipativo`, W - 120, 40);
    }

    // Pequeno gráfico de energia na lateral
    const barWidth = 8;
    const barMaxHeight = 100;
    const barX = W - 30;
    
    // Barra de energia potencial
    const epHeight = (energiaPotencial / (energiaTotal || 1)) * barMaxHeight;
    ctx.fillStyle = '#f97316';
    ctx.fillRect(barX, 150 + barMaxHeight - epHeight, barWidth, epHeight);
    
    // Barra de energia cinética
    const ecHeight = (energiaCinetica / (energiaTotal || 1)) * barMaxHeight;
    ctx.fillStyle = '#34d399';
    ctx.fillRect(barX + 10, 150 + barMaxHeight - ecHeight, barWidth, ecHeight);
    
    // Linha da energia total
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(barX - 5, 150 + barMaxHeight - barMaxHeight);
    ctx.lineTo(barX + 23, 150 + barMaxHeight - barMaxHeight);
    ctx.stroke();
    ctx.setLineDash([]);
    
    ctx.fillStyle = '#64748b';
    ctx.font = '8px monospace';
    ctx.fillText('Eₚ', barX, 165 + barMaxHeight);
    ctx.fillText('E꜀', barX + 10, 165 + barMaxHeight);
    
  }, [massa, altura, velocidade, gravidade, energiaPotencial, energiaCinetica, energiaTotal, showVectors, conservativo, atrito]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', borderRadius: '12px', overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }} />
    </div>
  );
}