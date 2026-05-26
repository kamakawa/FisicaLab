// src/components/CanvasNewton.jsx
import React, { useRef, useEffect } from 'react';

export default function CanvasNewton({ massA, massB, deslocamento, aceleracao, muK, showVectors = true }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const W = canvas.width = 700;
    const H = canvas.height = 320;

    // Fundo com gradiente
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#0a0c12');
    grad.addColorStop(1, '#07090f');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Elementos da mesa
    const mesaX = 50;
    const mesaY = 190;
    const mesaW = 480;

    // Tampo da mesa
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(mesaX, mesaY);
    ctx.lineTo(mesaX + mesaW, mesaY);
    ctx.stroke();

    // Pés da mesa
    ctx.strokeStyle = 'rgba(96, 165, 250, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(mesaX + 40, mesaY);
    ctx.lineTo(mesaX + 40, H - 30);
    ctx.moveTo(mesaX + mesaW - 40, mesaY);
    ctx.lineTo(mesaX + mesaW - 40, H - 30);
    ctx.stroke();

    // Roldana
    const roldanaX = mesaX + mesaW;
    const roldanaY = mesaY - 14;
    const raioRoldana = 14;

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(roldanaX, roldanaY, raioRoldana, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Cálculo de posições
    const maxDeslocamento = 4.0;
    const maxPixelsMesa = 270;
    const proporcao = maxPixelsMesa / maxDeslocamento;
    const pixelsMovidos = Math.min(deslocamento * proporcao, maxPixelsMesa);

    const inicialA_X = 120;
    const inicialA_Y = mesaY - 42;
    const atualA_X = inicialA_X + pixelsMovidos;
    const atualA_Y = inicialA_Y;

    const inicialB_X = roldanaX + raioRoldana - 18;
    const inicialB_Y = roldanaY + 45;
    const atualB_X = inicialB_X;
    const atualB_Y = inicialB_Y + pixelsMovidos;

    // Cabo
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(atualA_X + 45, atualA_Y + 21);
    ctx.lineTo(roldanaX, roldanaY - raioRoldana);
    ctx.moveTo(roldanaX + raioRoldana, roldanaY);
    ctx.lineTo(atualB_X + 18, atualB_Y);
    ctx.stroke();

    // Bloco A
    ctx.fillStyle = 'rgba(96, 165, 250, 0.2)';
    ctx.fillRect(atualA_X, atualA_Y, 55, 45);
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 2;
    ctx.strokeRect(atualA_X, atualA_Y, 55, 45);

    ctx.fillStyle = '#60a5fa';
    ctx.font = 'bold 13px "Space Grotesk"';
    ctx.textAlign = 'center';
    ctx.fillText(`A (${massA} kg)`, atualA_X + 27, atualA_Y + 27);

    // Bloco B
    ctx.fillStyle = 'rgba(251, 191, 36, 0.2)';
    ctx.fillRect(atualB_X, atualB_Y, 38, 50);
    ctx.strokeStyle = '#fbbf24';
    ctx.strokeRect(atualB_X, atualB_Y, 38, 50);

    ctx.fillStyle = '#fbbf24';
    ctx.fillText(`B (${massB} kg)`, atualB_X + 19, atualB_Y + 28);

    // Vetores de força
    if (showVectors && aceleracao >= 0.01) {
      const drawArrow = (x1, y1, x2, y2, color) => {
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
      };

      const centroA_X = atualA_X + 27;
      const centroA_Y = atualA_Y + 22;

      // Tração (verde)
      drawArrow(centroA_X + 28, centroA_Y, centroA_X + 75, centroA_Y, '#34d399');
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('T', centroA_X + 60, centroA_Y - 10);

      // Atrito (vermelho)
      if (muK > 0) {
        drawArrow(centroA_X - 28, centroA_Y, centroA_X - 75, centroA_Y, '#f87171');
        ctx.fillStyle = '#f87171';
        ctx.fillText('fₐₜ', centroA_X - 60, centroA_Y - 10);
      }

      const centroB_X = atualB_X + 19;
      const centroB_Y = atualB_Y + 25;

      // Peso (roxo)
      drawArrow(centroB_X, centroB_Y + 25, centroB_X, centroB_Y + 80, '#a78bfa');
      ctx.fillStyle = '#a78bfa';
      ctx.fillText('P_B', centroB_X + 18, centroB_Y + 65);

      // Tração (verde)
      drawArrow(centroB_X, centroB_Y - 25, centroB_X, centroB_Y - 70, '#34d399');
      ctx.fillStyle = '#34d399';
      ctx.fillText('T', centroB_X + 12, centroB_Y - 55);
    }

    ctx.textAlign = 'left';
  }, [massA, massB, deslocamento, aceleracao, muK, showVectors]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', borderRadius: '12px', overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }} />
    </div>
  );
}