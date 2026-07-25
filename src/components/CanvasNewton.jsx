import React, { useRef, useEffect } from 'react';

export default function CanvasNewton({ massA, massB, deslocamento, aceleracao, muK, showVectors = true }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.clientWidth || 700;
    const H = canvas.clientHeight || 300;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Fundo com a identidade visual dark do FísicaLab
    ctx.fillStyle = '#05070D';
    ctx.fillRect(0, 0, W, H);

    const scaleX = W / 700;
    const scaleY = H / 300;

    // ─── 1. MESA E ROLDANA ───────────────────────────────────────────────────
    const mesaX = 50 * scaleX;
    const mesaY = 180 * scaleY;
    const mesaW = 450 * scaleX;

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(mesaX, mesaY);
    ctx.lineTo(mesaX + mesaW, mesaY);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(mesaX + 40 * scaleX, mesaY); ctx.lineTo(mesaX + 40 * scaleX, H - 40 * scaleY);
    ctx.moveTo(mesaX + mesaW - 40 * scaleX, mesaY); ctx.lineTo(mesaX + mesaW - 40 * scaleX, H - 40 * scaleY);
    ctx.stroke();

    const roldanaX = mesaX + mesaW;
    const roldanaY = mesaY - 12 * scaleY;
    const raioRoldana = 12 * scaleY;

    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(roldanaX, roldanaY, raioRoldana, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.stroke();

    // ─── 2. POSIÇÃO ESCALADA ─────────────────────────────────────────────────
    const maxDeslocamentoFisico = 4.0;
    const maxPixelsMesa = 250 * scaleX;
    const proporcao = maxPixelsMesa / maxDeslocamentoFisico;

    const pixelsMovidos = deslocamento * proporcao;

    const inicialA_X = 120 * scaleX;
    const inicialA_Y = mesaY - 40 * scaleY;

    const atualA_X = inicialA_X + pixelsMovidos;
    const atualA_Y = inicialA_Y;

    const inicialB_X = roldanaX + raioRoldana - 15 * scaleX;
    const inicialB_Y = roldanaY + 40 * scaleY;

    const atualB_X = inicialB_X;
    const atualB_Y = inicialB_Y + pixelsMovidos;

    // ─── 3. CABO DE CONEXÃO ──────────────────────────────────────────────────
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(atualA_X + 40 * scaleX, atualA_Y + 20 * scaleY);
    ctx.lineTo(roldanaX, roldanaY - raioRoldana);
    ctx.moveTo(roldanaX + raioRoldana, roldanaY);
    ctx.lineTo(atualB_X + 15 * scaleX, atualB_Y);
    ctx.stroke();

    // ─── 4. BLOCO A (mesa) ───────────────────────────────────────────────────
    const blocoA_W = 50 * scaleX, blocoA_H = 40 * scaleY;
    const gradA = ctx.createLinearGradient(atualA_X, atualA_Y, atualA_X, atualA_Y + blocoA_H);
    gradA.addColorStop(0, 'rgba(0, 212, 255, 0.28)');
    gradA.addColorStop(1, 'rgba(0, 212, 255, 0.08)');
    ctx.fillStyle = gradA;
    ctx.strokeStyle = '#00D4FF';
    ctx.lineWidth = 2;
    ctx.fillRect(atualA_X, atualA_Y, blocoA_W, blocoA_H);
    ctx.strokeRect(atualA_X, atualA_Y, blocoA_W, blocoA_H);

    ctx.fillStyle = '#00D4FF';
    ctx.font = `${12 * scaleY}px 'JetBrains Mono', monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`A (${massA}kg)`, atualA_X + blocoA_W / 2, atualA_Y + blocoA_H / 2);

    // ─── 5. BLOCO B (suspenso) ───────────────────────────────────────────────
    const blocoB_W = 30 * scaleX, blocoB_H = 45 * scaleY;
    const gradB = ctx.createLinearGradient(atualB_X, atualB_Y, atualB_X + blocoB_W, atualB_Y);
    gradB.addColorStop(0, 'rgba(249, 115, 22, 0.28)');
    gradB.addColorStop(1, 'rgba(249, 115, 22, 0.08)');
    ctx.fillStyle = gradB;
    ctx.strokeStyle = '#F97316';
    ctx.lineWidth = 2;
    ctx.fillRect(atualB_X, atualB_Y, blocoB_W, blocoB_H);
    ctx.strokeRect(atualB_X, atualB_Y, blocoB_W, blocoB_H);

    ctx.fillStyle = '#F97316';
    ctx.font = `${12 * scaleY}px 'JetBrains Mono', monospace`;
    ctx.fillText('B', atualB_X + blocoB_W / 2, atualB_Y + blocoB_H / 2);

    // ─── 6. VETORES DE FORÇA (DIAGRAMA DE CORPO LIVRE) ──────────────────────
    const drawArrow = (x1, y1, x2, y2, color) => {
      const headlen = 8 * scaleY;
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

    if (showVectors && aceleracao >= 0) {
      ctx.textAlign = 'center';
      const centroA_X = atualA_X + blocoA_W / 2;
      const centroA_Y = atualA_Y + blocoA_H / 2;

      // Tração para a direita (verde-água)
      drawArrow(centroA_X + 25 * scaleX, centroA_Y, centroA_X + 65 * scaleX, centroA_Y, '#00F5C4');
      ctx.fillStyle = '#00F5C4';
      ctx.fillText('T', centroA_X + 55 * scaleX, centroA_Y - 12 * scaleY);

      if (muK > 0) {
        drawArrow(centroA_X - 25 * scaleX, centroA_Y, centroA_X - 65 * scaleX, centroA_Y, '#f87171');
        ctx.fillStyle = '#f87171';
        ctx.fillText('fat', centroA_X - 55 * scaleX, centroA_Y - 12 * scaleY);
      }

      const centroB_X = atualB_X + blocoB_W / 2;
      const centroB_Y = atualB_Y + blocoB_H / 2;

      // Peso de B para baixo (roxo)
      drawArrow(centroB_X, centroB_Y + 22 * scaleY, centroB_X, centroB_Y + 67 * scaleY, '#A855F7');
      ctx.fillStyle = '#A855F7';
      ctx.fillText('P_B', centroB_X + 18 * scaleX, centroB_Y + 55 * scaleY);

      // Tração de B para cima (verde-água)
      drawArrow(centroB_X, centroB_Y - 22 * scaleY, centroB_X, centroB_Y - 62 * scaleY, '#00F5C4');
      ctx.fillStyle = '#00F5C4';
      ctx.fillText('T', centroB_X + 12 * scaleX, centroB_Y - 50 * scaleY);
    }

  }, [massA, massB, deslocamento, aceleracao, muK, showVectors]);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <canvas ref={canvasRef} style={{ width: '100%', maxWidth: 760, height: '100%', maxHeight: 340, display: 'block' }} />
    </div>
  );
}
