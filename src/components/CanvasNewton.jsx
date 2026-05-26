import React, { useRef, useEffect } from 'react';

export default function CanvasNewton({ massA, massB, deslocamento, aceleração, muK }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const W = canvas.width = 700;
    const H = canvas.height = 300;

    // Limpar o fundo com a identidade visual dark do FísicaLab
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, W, H);

    // ─── 1. DESENHAR A MESA E A ROLDANA ──────────────────────────────────────
    const mesaX = 50;
    const mesaY = 180;
    const mesaW = 450;
    
    // Tampo da mesa
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(mesaX, mesaY);
    ctx.lineTo(mesaX + mesaW, mesaY);
    ctx.stroke();

    // Suporte da mesa (pés)
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(mesaX + 40, mesaY); ctx.lineTo(mesaX + 40, H - 40);
    ctx.moveTo(mesaX + mesaW - 40, mesaY); ctx.lineTo(mesaX + mesaW - 40, H - 40);
    ctx.stroke();

    // Roldana (Centro fixo no canto da mesa)
    const roldanaX = mesaX + mesaW;
    const roldanaY = mesaY - 12;
    const raioRoldana = 12;

    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(roldanaX, roldanaY, raioRoldana, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.stroke();

    // ─── 2. CÁLCULO DE POSIÇÃO ESCALADA ─────────────────────────────────────
    // O deslocamento físico máximo vai até 4 metros. Mapeamos isso para pixels.
    const maxDeslocamentoFisico = 4.0;
    const maxPixelsMesa = 250; // Limite de movimento na mesa
    const proporcao = maxPixelsMesa / maxDeslocamentoFisico;

    const pixelsMovidos = deslocamento * proporcao;

    // Posições iniciais dos blocos
    const inicialA_X = 120; 
    const inicialA_Y = mesaY - 40; // Bloco apoiado na mesa (altura 40)
    
    const atualA_X = inicialA_X + pixelsMovidos;
    const atualA_Y = inicialA_Y;

    const inicialB_X = roldanaX + raioRoldana - 15; // Alinhado com a borda da roldana
    const inicialB_Y = roldanaY + 40;
    
    const atualB_X = inicialB_X;
    const atualB_Y = inicialB_Y + pixelsMovidos;

    // ─── 3. DESENHAR O CABO DE CONEXÃO ───────────────────────────────────────
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    // Do Bloco A até o topo da roldana
    ctx.moveTo(atualA_X + 40, atualA_Y + 20); 
    ctx.lineTo(roldanaX, roldanaY - raioRoldana);
    // Tangenciando a roldana até descer para o Bloco B
    ctx.moveTo(roldanaX + raioRoldana, roldanaY);
    ctx.lineTo(atualB_X + 15, atualB_Y);
    ctx.stroke();

    // ─── 4. DESENHAR BLOCO A (Mesa) ──────────────────────────────────────────
    ctx.fillStyle = 'rgba(96, 165, 250, 0.2)'; // Azul translúcido
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 2;
    ctx.fillRect(atualA_X, atualA_Y, 50, 40);
    ctx.strokeRect(atualA_X, atualA_Y, 50, 40);
    
    // Label Massa A
    ctx.fillStyle = '#60a5fa';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`A (${massA}kg)`, atualA_X + 25, atualA_Y + 20);

    // ─── 5. DESENHAR BLOCO B (Suspenso) ──────────────────────────────────────
    ctx.fillStyle = 'rgba(251, 191, 36, 0.2)'; // Âmbar translúcido
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.fillRect(atualB_X, atualB_Y, 30, 45);
    ctx.strokeRect(atualB_X, atualB_Y, 30, 45);

    // Label Massa B
    ctx.fillStyle = '#fbbf24';
    ctx.font = '12px monospace';
    ctx.fillText(`B`, atualB_X + 15, atualB_Y + 22);

    // ─── 6. VETORES DE FORÇA (DIAGRAMA DE CORPO LIVRE EM TEMPO REAL) ──────────
    // Função auxiliar para desenhar as setas dos vetores
    const drawArrow = (x1, y1, x2, y2, color) => {
      const headlen = 8;
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

    if (aceleração >= 0) {
      // Forças no Bloco A
      const centroA_X = atualA_X + 25;
      const centroA_Y = atualA_Y + 20;

      // Tração para a direita (verde)
      drawArrow(centroA_X + 25, centroA_Y, centroA_X + 65, centroA_Y, '#34d399');
      ctx.fillStyle = '#34d399';
      ctx.fillText('T', centroA_X + 55, centroA_Y - 12);

      // Força de Atrito para a esquerda (vermelha) se muK > 0
      if (muK > 0) {
        drawArrow(centroA_X - 25, centroA_Y, centroA_X - 65, centroA_Y, '#f87171');
        ctx.fillStyle = '#f87171';
        ctx.fillText('fat', centroA_X - 55, centroA_Y - 12);
      }

      // Forças no Bloco B
      const centroB_X = atualB_X + 15;
      const centroB_Y = atualB_Y + 22;

      // Peso de B para baixo (roxo/azul)
      drawArrow(centroB_X, centroB_Y + 22, centroB_X, centroB_Y + 67, '#a78bfa');
      ctx.fillStyle = '#a78bfa';
      ctx.fillText('P_B', centroB_X + 18, centroB_Y + 55);

      // Tração de B para cima (verde)
      drawArrow(centroB_X, centroB_Y - 22, centroB_X, centroB_Y - 62, '#34d399');
      ctx.fillStyle = '#34d399';
      ctx.fillText('T', centroB_X + 12, centroB_Y - 50);
    }

  }, [massA, massB, deslocamento, aceleração, muK]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', background: '#0d1117', borderRadius: '12px', padding: '10px', border: '1px solid rgba(255,255,255,0.03)' }}>
      <canvas ref={canvasRef} style={{ maxWidth: '100%', height: 'auto' }} />
    </div>
  );
}