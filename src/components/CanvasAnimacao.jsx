// src/components/CanvasAnimacao.jsx
import React from 'react';
import Sketch from 'react-p5';

export default function CanvasAnimacao({ v0, angle, time }) {
  const g = 9.81;

  const setup = (p5, canvasParentRef) => {
    p5.createCanvas(750, 450).parent(canvasParentRef);
  };

  // Desenha uma seta com ponta de verdade
  const drawArrow = (p5, x1, y1, x2, y2, col, weight = 2.5) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 2) return; // vetor muito curto, não desenha

    const headLen = Math.min(14, len * 0.4);
    const ang = Math.atan2(dy, dx);

    p5.stroke(col);
    p5.strokeWeight(weight);
    p5.fill(col);

    // Linha do corpo
    p5.line(x1, y1, x2, y2);

    // Ponta da seta (triângulo preenchido)
    p5.push();
    p5.translate(x2, y2);
    p5.rotate(ang);
    p5.noStroke();
    p5.triangle(0, 0, -headLen, headLen * 0.4, -headLen, -headLen * 0.4);
    p5.pop();
  };

  const draw = (p5) => {
    const MARGIN_L = 60; // espaço para labels do eixo Y
    const MARGIN_B = 45; // espaço para labels do eixo X
    const W = p5.width - MARGIN_L - 20;
    const H = p5.height - MARGIN_B - 20;

    p5.background('#0B0F19');

    // ---- Cálculos físicos ----
    const rad = p5.radians(angle);
    const vx = v0 * p5.cos(rad);
    const vy0 = v0 * p5.sin(rad);
    const tempoTotal = (2 * vy0) / g;
    const alcanceTotal = vx * tempoTotal;
    const alturaMax = (vy0 * vy0) / (2 * g);

    // Escala automática para caber tudo na tela
    const scaleX = alcanceTotal > 0 ? (W * 0.9) / alcanceTotal : 12;
    const scaleY = alturaMax > 0 ? (H * 0.85) / alturaMax : 12;
    const scale = Math.min(scaleX, scaleY);

    // Origem no canto inferior esquerdo da área útil
    const ox = MARGIN_L;
    const oy = p5.height - MARGIN_B;

    // Converte metros para pixels
    const toX = (m) => ox + m * scale;
    const toY = (m) => oy - m * scale;

    // ---- Grid ----
    // Calcula espaçamento do grid em metros para ficar bonito
    const gridMetros = (() => {
      const candidatos = [1, 2, 5, 10, 20, 25, 50, 100, 200];
      const idealPixels = 60;
      for (const c of candidatos) {
        if (c * scale >= idealPixels) return c;
      }
      return candidatos[candidatos.length - 1];
    })();

    p5.strokeWeight(1);
    // linhas verticais (eixo X / distância)
    for (let m = 0; m <= alcanceTotal + gridMetros; m += gridMetros) {
      const px = toX(m);
      if (px > p5.width - 10) break;
      p5.stroke('rgba(255,255,255,0.05)');
      p5.line(px, oy, px, 20);
      // label de distância
      p5.noStroke();
      p5.fill('rgba(255,255,255,0.3)');
      p5.textSize(10);
      p5.textAlign(p5.CENTER);
      p5.scale(1, 1); // garantir sem inversão
      p5.text(`${m}m`, px, oy + 16);
    }
    // linhas horizontais (eixo Y / altura)
    for (let m = 0; m <= alturaMax + gridMetros; m += gridMetros) {
      const py = toY(m);
      if (py < 20) break;
      p5.stroke('rgba(255,255,255,0.05)');
      p5.line(ox, py, p5.width - 10, py);
      // label de altura
      p5.noStroke();
      p5.fill('rgba(255,255,255,0.3)');
      p5.textSize(10);
      p5.textAlign(p5.RIGHT);
      p5.text(`${m}m`, ox - 6, py + 4);
    }

    // ---- Eixos ----
    p5.stroke('#06B6D4');
    p5.strokeWeight(2);
    p5.line(ox, oy, p5.width - 10, oy); // X
    p5.line(ox, oy, ox, 20);             // Y

    // Labels dos eixos
    p5.noStroke();
    p5.fill('#06B6D4');
    p5.textSize(12);
    p5.textAlign(p5.CENTER);
    p5.text('Distância (m) →', ox + W / 2, p5.height - 4);

    p5.push();
    p5.translate(16, oy - H / 2);
    p5.rotate(-p5.HALF_PI);
    p5.textAlign(p5.CENTER);
    p5.text('Altura (m) →', 0, 0);
    p5.pop();

    // ---- Trajetória completa (pontilhada) ----
    p5.stroke('rgba(249,115,22,0.18)');
    p5.strokeWeight(1.5);
    p5.drawingContext.setLineDash([6, 5]);
    p5.noFill();
    p5.beginShape();
    for (let t = 0; t <= tempoTotal; t += 0.02) {
      const px = vx * t;
      const py = vy0 * t - 0.5 * g * t * t;
      if (py >= 0) p5.vertex(toX(px), toY(py));
    }
    p5.endShape();
    p5.drawingContext.setLineDash([]);

    // ---- Trajetória percorrida (sólida) ----
    const limitTime = Math.min(time, tempoTotal);
    p5.stroke('#F97316');
    p5.strokeWeight(2.5);
    p5.noFill();
    p5.beginShape();
    for (let t = 0; t <= limitTime; t += 0.02) {
      const px = vx * t;
      const py = vy0 * t - 0.5 * g * t * t;
      if (py >= 0) p5.vertex(toX(px), toY(py));
    }
    p5.endShape();

    // ---- Posição atual ----
    let currentX = vx * time;
    let currentY = vy0 * time - 0.5 * g * time * time;
    if (time >= tempoTotal) {
      currentX = alcanceTotal;
      currentY = 0;
    }
    const px = toX(currentX);
    const py = toY(currentY);

    // Glow da partícula
    p5.noStroke();
    p5.fill('rgba(249,115,22,0.15)');
    p5.circle(px, py, 32);
    p5.fill('#F97316');
    p5.circle(px, py, 14);

    // ---- Vetores de velocidade (com seta real) ----
    if (time <= tempoTotal) {
      const vyCurrent = vy0 - g * time;
      // Escala dos vetores: proporcional ao canvas, mas com comprimento razoável
      const vecScale = scale * 0.6;

      // Vetor Vx (cyan)
      drawArrow(p5, px, py, px + vx * vecScale, py, '#06B6D4', 2.5);

      // Vetor Vy (verde)
      drawArrow(p5, px, py, px, py - vyCurrent * vecScale, '#4ADE80', 2.5);

      // Labels dos vetores
      p5.noStroke();
      p5.textSize(11);
      p5.fill('#06B6D4');
      p5.textAlign(p5.CENTER);
      p5.text('Vx', px + vx * vecScale * 0.5, py - 8);

      p5.fill('#4ADE80');
      const vyLabel = vyCurrent >= 0 ? 'Vy' : 'Vy';
      p5.text(vyLabel, px + 14, py - vyCurrent * vecScale * 0.5);
    }

    // ---- Marca o alcance máximo ----
    if (time >= tempoTotal && alcanceTotal > 0) {
      p5.stroke('rgba(249,115,22,0.4)');
      p5.strokeWeight(1);
      p5.drawingContext.setLineDash([4, 4]);
      p5.line(toX(alcanceTotal), oy - 5, toX(alcanceTotal), oy + 5);
      p5.drawingContext.setLineDash([]);
      p5.noStroke();
      p5.fill('rgba(249,115,22,0.8)');
      p5.textSize(11);
      p5.textAlign(p5.CENTER);
      p5.text(`${alcanceTotal.toFixed(1)}m`, toX(alcanceTotal), oy + 30);
    }
  };

  return <Sketch setup={setup} draw={draw} />;
}