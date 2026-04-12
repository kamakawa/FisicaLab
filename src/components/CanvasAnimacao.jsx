// src/components/CanvasAnimacao.jsx
import React from 'react';
import Sketch from 'react-p5';

export default function CanvasAnimacao({ v0, angle, time }) {
  const g = 9.81;
  const scale = 12; // 1 metro = 12 pixels na tela

  const setup = (p5, canvasParentRef) => {
    // Cria um canvas que se ajusta ao painel
    p5.createCanvas(750, 450).parent(canvasParentRef);
  };

  const draw = (p5) => {
    p5.background('#0B0F19');
    
    // Move a origem para o canto inferior esquerdo e inverte o eixo Y
    p5.translate(40, p5.height - 40);
    p5.scale(1, -1);

    // Desenhar plano cartesiano (Grid)
    p5.stroke('rgba(255, 255, 255, 0.05)');
    p5.strokeWeight(1);
    for(let i = 0; i < 800; i += scale * 5) {
      p5.line(i, 0, i, 400);
      p5.line(0, i, 800, i);
    }

    // Eixos X e Y principais
    p5.stroke('#06B6D4'); // Neon Cyan
    p5.strokeWeight(2);
    p5.line(0, 0, 700, 0); // X
    p5.line(0, 0, 0, 400); // Y

    // Cálculos Físicos Base
    let rad = p5.radians(angle);
    let vx = v0 * p5.cos(rad);
    let vy0 = v0 * p5.sin(rad);

    let currentX = vx * time;
    let currentY = vy0 * time - 0.5 * g * time * time;
    let tempoTotal = (2 * vy0) / g;

    // Trava a animação quando toca o chão
    if (time >= tempoTotal) {
      currentX = vx * tempoTotal;
      currentY = 0;
    }

    // Desenhar Trajetória (Rastro)
    p5.noFill();
    p5.stroke('rgba(249, 115, 22, 0.4)'); // Laranja translúcido
    p5.strokeWeight(2);
    p5.beginShape();
    let limitTime = Math.min(time, tempoTotal);
    for(let t = 0; t <= limitTime; t += 0.05) {
      let px = vx * t;
      let py = vy0 * t - 0.5 * g * t * t;
      if (py >= 0) p5.vertex(px * scale, py * scale);
    }
    p5.endShape();

    // Desenhar Partícula
    p5.fill('#F97316'); // Neon Orange
    p5.noStroke();
    p5.circle(currentX * scale, currentY * scale, 16);

    // Desenhar Vetores de Velocidade (Apenas se estiver voando)
    if (time < tempoTotal || time === 0) {
      let vyCurrent = vy0 - g * time;
      
      // Vetor Vx (Azul)
      p5.stroke('#06B6D4');
      p5.strokeWeight(3);
      p5.line(currentX * scale, currentY * scale, (currentX + vx) * scale, currentY * scale);
      
      // Vetor Vy (Verde Limão)
      p5.stroke('#4ADE80');
      p5.line(currentX * scale, currentY * scale, currentX * scale, (currentY + vyCurrent) * scale);
    }
  };

  return <Sketch setup={setup} draw={draw} />;
}