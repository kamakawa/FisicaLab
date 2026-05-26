// ExperimentoPlanoInclinado.jsx — VERSÃO DEFINITIVA CORRIGIDA
import React, { useState, useEffect, useRef, useCallback } from 'react';

// ─── CONSTANTES ───────────────────────────────────────────────────────────────
const G = 9.81;
const toRad = d => (d * Math.PI) / 180;
const toDeg = r => (r * 180) / Math.PI;

// ─── HOOK: canvas responsivo com DPI correto ─────────────────────────────────
function useResponsiveCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const resize = () => {
      const container = canvas.parentElement;
      const w = container?.clientWidth || 520;
      const h = container?.clientHeight || 340;
      const ratio = window.devicePixelRatio || 1;
      canvas.width = w * ratio;
      canvas.height = h * ratio;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const ctx = canvas.getContext('2d');
      ctx.scale(ratio, ratio);
      return { w, h };
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);
  return ref;
}

// ─── TOKENS DE DESIGN ─────────────────────────────────────────────────────────
const T = {
  bg: '#0A0C12',
  card: '#131724',
  panel: '#0F131A',
  neon: '#00D4FF',
  emerald: '#10B981',
  amber: '#F59E0B',
  rose: '#EF4444',
  purple: '#8B5CF6',
  white: '#F1F5F9',
  muted: '#64748B',
  border: 'rgba(0,212,255,0.08)',
  glow: 'rgba(0,212,255,0.15)',
};

// ─── CSS GLOBAL ───────────────────────────────────────────────────────────────
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&family=JetBrains+Mono:wght@400;500;600&family=Orbitron:wght@400;500;700;900&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  
  .exp-root {
    min-height: 100vh;
    background: radial-gradient(ellipse at 20% 30%, #0A0C12, #05070A);
    color: #F1F5F9;
    font-family: 'Inter', sans-serif;
  }
  
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: #0F131A; border-radius: 4px; }
  ::-webkit-scrollbar-thumb { background: #00D4FF; border-radius: 4px; opacity: 0.5; }
  
  input[type=range] {
    -webkit-appearance: none;
    width: 100%;
    background: transparent;
  }
  input[type=range]:focus { outline: none; }
  input[type=range]::-webkit-slider-runnable-track {
    height: 4px;
    background: rgba(255,255,255,0.06);
    border-radius: 4px;
  }
  input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    margin-top: -6px;
    cursor: pointer;
    transition: all 0.2s;
    border: 2px solid var(--thumb-color);
    background: var(--thumb-color);
    box-shadow: 0 0 0 0 var(--thumb-glow);
  }
  input[type=range]::-webkit-slider-thumb:hover {
    transform: scale(1.2);
    box-shadow: 0 0 0 6px var(--thumb-glow);
  }
  
  .formula-math {
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    background: rgba(0,0,0,0.3);
    padding: 4px 8px;
    border-radius: 6px;
    display: inline-block;
    margin: 2px 0;
  }
`;

// ─── COMPONENTES UI ───────────────────────────────────────────────────────────
const Slider = ({ label, value, onChange, min, max, step, unit, color = T.neon }) => (
  <div style={{ marginBottom: '1.25rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
      <span style={{ fontSize: '0.75rem', color: T.muted, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.5px' }}>
        {label}
      </span>
      <span style={{ 
        fontSize: '0.85rem', 
        color, 
        fontFamily: "'Orbitron', monospace", 
        fontWeight: 700,
        background: `${color}15`,
        padding: '0.15rem 0.5rem',
        borderRadius: '4px',
      }}>
        {typeof value === 'number' ? (step >= 1 ? value : value.toFixed(2)) : value}{unit}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={e => onChange(parseFloat(e.target.value))}
      style={{ '--thumb-color': color, '--thumb-glow': `${color}40` }}
    />
  </div>
);

const MetricCard = ({ label, value, unit, color = T.neon, description }) => (
  <div style={{
    background: 'rgba(0,0,0,0.3)',
    borderRadius: '0.75rem',
    padding: '0.8rem',
    borderLeft: `3px solid ${color}`,
    transition: 'all 0.2s',
  }}>
    <div style={{ fontSize: '0.65rem', color: T.muted, letterSpacing: '1px', fontFamily: "'JetBrains Mono', monospace" }}>
      {label}
    </div>
    <div style={{ fontSize: '1.3rem', fontWeight: 700, color, fontFamily: "'Orbitron', monospace", lineHeight: 1.2 }}>
      {value} <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>{unit}</span>
    </div>
    {description && <div style={{ fontSize: '0.6rem', color: T.muted, marginTop: '0.25rem' }}>{description}</div>}
  </div>
);

const TabButton = ({ active, onClick, children, color = T.neon }) => (
  <button
    onClick={onClick}
    style={{
      padding: '0.5rem 1.2rem',
      borderRadius: '0.5rem',
      border: 'none',
      background: active ? `${color}15` : 'transparent',
      color: active ? color : T.muted,
      cursor: 'pointer',
      fontSize: '0.7rem',
      fontFamily: "'JetBrains Mono', monospace",
      fontWeight: active ? 600 : 400,
      letterSpacing: '1px',
      transition: 'all 0.2s',
    }}
  >
    {children}
  </button>
);

const FormulaCard = ({ title, children, color = T.neon, icon }) => (
  <div style={{
    borderLeft: `3px solid ${color}`,
    background: `linear-gradient(90deg, ${color}08, transparent)`,
    borderRadius: '0.5rem',
    padding: '1rem',
    marginBottom: '1rem',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
      {icon && <span style={{ fontSize: '1rem' }}>{icon}</span>}
      <span style={{ fontSize: '0.7rem', color, letterSpacing: '2px', fontFamily: "'Orbitron', monospace", fontWeight: 600 }}>
        {title}
      </span>
    </div>
    <div style={{ fontSize: '0.85rem', lineHeight: '1.7', color: T.white }}>
      {children}
    </div>
  </div>
);

// ─── FUNÇÕES DE DESENHO ───────────────────────────────────────────────────────
function drawArrow(ctx, fromX, fromY, angleDeg, length, color, label, glow = true) {
  if (length < 5) return;
  const angle = toRad(angleDeg);
  const toX = fromX + length * Math.cos(angle);
  const toY = fromY + length * Math.sin(angle);

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  if (glow) {
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
  }
  ctx.stroke();

  const arrowAngle = Math.atan2(toY - fromY, toX - fromX);
  const headSize = 10;
  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(toX - headSize * Math.cos(arrowAngle - 0.5), toY - headSize * Math.sin(arrowAngle - 0.5));
  ctx.lineTo(toX - headSize * Math.cos(arrowAngle + 0.5), toY - headSize * Math.sin(arrowAngle + 0.5));
  ctx.fillStyle = color;
  ctx.fill();

  if (label) {
    ctx.shadowBlur = 0;
    ctx.font = 'bold 10px "JetBrains Mono", monospace';
    ctx.fillStyle = color;
    ctx.fillText(label, toX + 12 * Math.cos(arrowAngle), toY + 12 * Math.sin(arrowAngle));
  }
  ctx.restore();
}

function drawRamp(ctx, w, h, theta, color = T.neon) {
  const tR = toRad(theta);
  const baseX = 50;
  const baseY = h - 45;
  const length = w - 100;
  const topX = baseX + length * Math.cos(tR);
  const topY = baseY - length * Math.sin(tR);

  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.moveTo(baseX, baseY);
  ctx.lineTo(topX, topY);
  ctx.lineTo(topX, baseY);
  ctx.fillStyle = `${color}08`;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(baseX, baseY);
  ctx.lineTo(topX, topY);
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(baseX, baseY);
  ctx.lineTo(topX, baseY);
  ctx.strokeStyle = `${T.white}20`;
  ctx.lineWidth = 1;
  ctx.shadowBlur = 0;
  ctx.stroke();

  const arcRadius = 38;
  ctx.beginPath();
  ctx.arc(baseX, baseY, arcRadius, -tR, 0);
  ctx.strokeStyle = T.amber;
  ctx.lineWidth = 2;
  ctx.shadowColor = T.amber;
  ctx.shadowBlur = 6;
  ctx.stroke();

  ctx.fillStyle = T.amber;
  ctx.font = 'bold 12px "Orbitron", monospace';
  ctx.shadowBlur = 0;
  ctx.fillText(`${theta}°`, baseX + arcRadius + 6, baseY - 10);

  ctx.shadowBlur = 0;
  return { baseX, baseY, topX, topY, length, tR };
}

function drawBlock(ctx, cx, cy, tR, label, color = T.neon, isMoving = false) {
  const bw = 46, bh = 36;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-tR);

  if (isMoving) {
    ctx.shadowColor = color;
    ctx.shadowBlur = 20;
  }

  ctx.beginPath();
  ctx.roundRect(-bw / 2, -bh, bw, bh, 8);
  ctx.fillStyle = `${color}20`;
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = isMoving ? 2.5 : 1.8;
  ctx.stroke();

  ctx.strokeStyle = `${color}40`;
  ctx.lineWidth = 0.8;
  for (let i = -20; i <= 20; i += 7) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 4, -5);
    ctx.stroke();
  }

  ctx.fillStyle = color;
  ctx.font = 'bold 10px "Orbitron", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(label, 0, -bh / 2 + 6);
  ctx.restore();
}

// Extensão do canvas para roundRect
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.moveTo(x+r, y);
    this.lineTo(x+w-r, y);
    this.quadraticCurveTo(x+w, y, x+w, y+r);
    this.lineTo(x+w, y+h-r);
    this.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    this.lineTo(x+r, y+h);
    this.quadraticCurveTo(x, y+h, x, y+h-r);
    this.lineTo(x, y+r);
    this.quadraticCurveTo(x, y, x+r, y);
    return this;
  };
}

// ─── CANVAS PRINCIPAL ─────────────────────────────────────────────────────────
const MainCanvas = ({ theta, mu, massa, showVetores, isAnimating, position }) => {
  const canvasRef = useResponsiveCanvas();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const container = canvas.parentElement;
    
    const draw = () => {
      const w = container?.clientWidth || 520;
      const h = container?.clientHeight || 340;
      
      const ratio = window.devicePixelRatio || 1;
      canvas.width = w * ratio;
      canvas.height = h * ratio;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const ctx = canvas.getContext('2d');
      ctx.scale(ratio, ratio);
      
      ctx.clearRect(0, 0, w, h);
      
      const { baseX, baseY, length, tR } = drawRamp(ctx, w, h, theta);
      
      // CORREÇÃO: position = 0 (topo) → position = 0.92 (base)
      // O bloco DESCE o plano
      const px = baseX + length * position * Math.cos(tR);
      const py = baseY - length * position * Math.sin(tR);
      
      const P = massa * G;
      const N = massa * G * Math.cos(tR);
      const Px = massa * G * Math.sin(tR);
      const Fat = mu * N;
      const isMoving = Px > Fat;
      
      // Rastro de movimento (descendo)
      if (position > 0.02 && isAnimating) {
        for (let i = 0; i <= position; i += 0.03) {
          const tx = baseX + length * i * Math.cos(tR);
          const ty = baseY - length * i * Math.sin(tR);
          ctx.beginPath();
          ctx.arc(tx, ty, 3, 0, Math.PI * 2);
          ctx.fillStyle = `${T.neon}${Math.floor(40 * (1 - i / position))}`;
          ctx.fill();
        }
      }
      
      drawBlock(ctx, px, py, tR, `${massa} kg`, T.neon, isAnimating && isMoving);
      
      if (showVetores) {
        const centerY = py - 8;
        const scale = 0.45;
        
        drawArrow(ctx, px, centerY, 90, Math.min(85, P * scale), T.rose, `P = ${P.toFixed(0)} N`, true);
        
        const normalAngle = toDeg(-Math.PI / 2 + tR);
        drawArrow(ctx, px, centerY, normalAngle, Math.min(75, N * scale), T.emerald, `N = ${N.toFixed(0)} N`, true);
        
        const parallelAngle = toDeg(Math.PI - tR);
        drawArrow(ctx, px, centerY, parallelAngle, Math.min(85, Px * scale), T.amber, `P∥ = ${Px.toFixed(0)} N`, true);
        
        if (Fat > 0.5) {
          const frictionAngle = isMoving ? toDeg(tR) : toDeg(tR + Math.PI);
          drawArrow(ctx, px, centerY, frictionAngle, Math.min(75, Fat * scale), '#FF8C00', `f = ${Fat.toFixed(0)} N`, true);
        }
        
        const Fres = Px - Fat;
        if (Fres > 0.5 && isAnimating) {
          drawArrow(ctx, px, centerY - 15, parallelAngle, Math.min(90, Fres * scale * 0.7), '#FFFFFF', `F_res = ${Fres.toFixed(0)} N`, true);
        }
      }
      
      ctx.shadowBlur = 0;
    };
    
    draw();
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, [theta, mu, massa, showVetores, isAnimating, position, canvasRef]);
  
  return (
    <div style={{ width: '100%', minHeight: 340, background: 'rgba(0,0,0,0.2)', borderRadius: '12px', overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: 'auto', display: 'block' }} />
    </div>
  );
};

// ─── CANVAS FORÇA EXTERNA ──────────────────────────────────────────────────────
const ExternalForceCanvas = ({ theta, mu, massa, F_ext, anguloF, showVetores, isAnimating, position }) => {
  const canvasRef = useResponsiveCanvas();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const container = canvas.parentElement;
    
    const draw = () => {
      const w = container?.clientWidth || 520;
      const h = container?.clientHeight || 340;
      
      const ratio = window.devicePixelRatio || 1;
      canvas.width = w * ratio;
      canvas.height = h * ratio;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const ctx = canvas.getContext('2d');
      ctx.scale(ratio, ratio);
      
      ctx.clearRect(0, 0, w, h);
      
      const { baseX, baseY, length, tR } = drawRamp(ctx, w, h, theta, T.purple);
      
      const px = baseX + length * position * Math.cos(tR);
      const py = baseY - length * position * Math.sin(tR);
      
      const N = massa * G * Math.cos(tR);
      const Px = massa * G * Math.sin(tR);
      const Fat_max = mu * N;
      
      const angFRad = toRad(anguloF);
      const F_paralela = F_ext * Math.cos(angFRad - tR);
      const F_perpendicular = F_ext * Math.sin(angFRad - tR);
      
      const Fat = Math.min(Fat_max, Math.abs(Px - F_paralela));
      const Fres = Px - F_paralela - Fat;
      const isMoving = Math.abs(Px - F_paralela) > Fat_max;
      const acc = Fres / massa;
      
      drawBlock(ctx, px, py, tR, `${massa} kg`, T.purple, isAnimating && isMoving);
      
      if (showVetores) {
        const centerY = py - 8;
        const scale = 0.4;
        
        drawArrow(ctx, px, centerY, 90, Math.min(85, massa * G * scale), T.rose, `P = ${(massa*G).toFixed(0)} N`, true);
        
        const normalAngle = toDeg(-Math.PI / 2 + tR);
        drawArrow(ctx, px, centerY, normalAngle, Math.min(75, N * scale), T.emerald, `N = ${N.toFixed(0)} N`, true);
        
        const parallelAngle = toDeg(Math.PI - tR);
        drawArrow(ctx, px, centerY, parallelAngle, Math.min(85, Px * scale), T.amber, `P∥ = ${Px.toFixed(0)} N`, true);
        
        if (F_ext > 0.1) {
          drawArrow(ctx, px, centerY, anguloF, Math.min(90, F_ext * scale), T.neon, `F_ext = ${F_ext.toFixed(0)} N`, true);
          
          if (F_paralela > 0.1) {
            const compAngle = F_paralela > 0 ? parallelAngle : toDeg(Math.PI - tR + Math.PI);
            drawArrow(ctx, px, centerY - 12, compAngle, Math.min(60, Math.abs(F_paralela) * scale), `${T.neon}80`, `F∥ = ${F_paralela.toFixed(0)} N`, false);
          }
        }
        
        if (Fat > 0.5) {
          const frictionAngle = (Px - F_paralela) > 0 ? toDeg(tR) : toDeg(tR + Math.PI);
          drawArrow(ctx, px, centerY, frictionAngle, Math.min(75, Fat * scale), '#FF8C00', `f = ${Fat.toFixed(0)} N`, true);
        }
        
        if (Math.abs(Fres) > 0.5 && isAnimating) {
          const fresAngle = Fres > 0 ? parallelAngle : toDeg(Math.PI - tR + Math.PI);
          drawArrow(ctx, px, centerY - 20, fresAngle, Math.min(80, Math.abs(Fres) * scale * 0.8), '#FFFFFF', `F_res = ${Math.abs(Fres).toFixed(0)} N`, true);
        }
      }
      
      ctx.shadowBlur = 0;
    };
    
    draw();
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, [theta, mu, massa, showVetores, isAnimating, position, F_ext, anguloF, canvasRef]);
  
  return (
    <div style={{ width: '100%', minHeight: 340, background: 'rgba(0,0,0,0.2)', borderRadius: '12px', overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: 'auto', display: 'block' }} />
    </div>
  );
};

// ─── CANVAS ÂNGULO CRÍTICO ────────────────────────────────────────────────────
const CriticalCanvas = ({ theta, thetaCrit, estado }) => {
  const canvasRef = useResponsiveCanvas();
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const container = canvas.parentElement;
    
    const draw = () => {
      const w = container?.clientWidth || 520;
      const h = container?.clientHeight || 300;
      const ratio = window.devicePixelRatio || 1;
      canvas.width = w * ratio;
      canvas.height = h * ratio;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const ctx = canvas.getContext('2d');
      ctx.scale(ratio, ratio);
      
      ctx.clearRect(0, 0, w, h);
      
      const stateColor = { repouso: T.emerald, iminente: T.amber, deslizando: T.rose };
      const color = stateColor[estado];
      
      const { baseX, baseY, length, tR } = drawRamp(ctx, w, h, theta, color);
      
      const tRCrit = toRad(thetaCrit);
      const critX = baseX + length * Math.cos(tRCrit);
      const critY = baseY - length * Math.sin(tRCrit);
      ctx.beginPath();
      ctx.moveTo(baseX, baseY);
      ctx.lineTo(critX, critY);
      ctx.strokeStyle = T.amber;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 6]);
      ctx.stroke();
      ctx.setLineDash([]);
      
      ctx.beginPath();
      ctx.arc(baseX, baseY, 52, -tRCrit, 0);
      ctx.strokeStyle = T.amber;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = T.amber;
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillText(`θc = ${thetaCrit.toFixed(1)}°`, baseX + 60, baseY - 28);
      
      const blockX = baseX + length * 0.48 * Math.cos(tR);
      const blockY = baseY - length * 0.48 * Math.sin(tR);
      drawBlock(ctx, blockX, blockY, tR, estado.toUpperCase(), color, estado !== 'repouso');
      
      const statusText = {
        repouso: '⚖️ EQUILÍBRIO ESTÁTICO',
        iminente: '⚠️ DESLIZAMENTO IMINENTE',
        deslizando: '▶️ BLOCO DESLIZANDO'
      };
      ctx.fillStyle = color;
      ctx.font = 'bold 12px "Orbitron", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(statusText[estado], w / 2, 28);
      
      ctx.shadowBlur = 0;
    };
    
    draw();
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, [theta, thetaCrit, estado, canvasRef]);
  
  return (
    <div style={{ width: '100%', minHeight: 300, background: 'rgba(0,0,0,0.2)', borderRadius: '12px', overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: 'auto', display: 'block' }} />
    </div>
  );
};

// ─── GRÁFICO ─────────────────────────────────────────────────────────────────
const SimpleChart = ({ data, xLabel, yLabel, color = T.neon, highlight }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data.length) return;
    const container = canvas.parentElement;
    const w = container?.clientWidth || 480;
    const h = 180;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = w * ratio;
    canvas.height = h * ratio;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext('2d');
    ctx.scale(ratio, ratio);
    
    ctx.clearRect(0, 0, w, h);
    
    const pad = { l: 48, r: 24, t: 16, b: 40 };
    const gw = w - pad.l - pad.r;
    const gh = h - pad.t - pad.b;
    
    const xs = data.map(d => d.x);
    const ys = data.map(d => d.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(0, ...ys);
    const maxY = Math.max(...ys) || 1;
    
    const toX = x => pad.l + ((x - minX) / (maxX - minX)) * gw;
    const toY = y => h - pad.b - ((y - minY) / (maxY - minY)) * gh;
    
    ctx.strokeStyle = `${T.white}10`;
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad.t + i * gh / 4;
      ctx.beginPath();
      ctx.moveTo(pad.l, y);
      ctx.lineTo(w - pad.r, y);
      ctx.stroke();
    }
    
    ctx.beginPath();
    data.forEach((d, i) => i === 0 ? ctx.moveTo(toX(d.x), toY(d.y)) : ctx.lineTo(toX(d.x), toY(d.y)));
    ctx.lineTo(toX(data[data.length-1].x), toY(0));
    ctx.lineTo(toX(data[0].x), toY(0));
    ctx.fillStyle = `${color}15`;
    ctx.fill();
    
    ctx.beginPath();
    data.forEach((d, i) => i === 0 ? ctx.moveTo(toX(d.x), toY(d.y)) : ctx.lineTo(toX(d.x), toY(d.y)));
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    
    if (highlight !== undefined) {
      const hPoint = data.find(d => Math.abs(d.x - highlight) < 0.6);
      if (hPoint) {
        ctx.beginPath();
        ctx.arc(toX(hPoint.x), toY(hPoint.y), 6, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
    
    ctx.fillStyle = T.muted;
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(xLabel, w / 2, h - 6);
    ctx.save();
    ctx.translate(14, h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(yLabel, 0, 0);
    ctx.restore();
    
    ctx.textAlign = 'right';
    [minY, (minY + maxY) / 2, maxY].forEach(v => {
      ctx.fillText(v.toFixed(1), pad.l - 6, toY(v) + 3);
    });
  }, [data, xLabel, yLabel, color, highlight]);
  
  return <canvas ref={canvasRef} style={{ width: '100%', height: 'auto', borderRadius: '8px' }} />;
};

// ─── EXPERIMENTO 1: BLOCO SIMPLES (CORRIGIDO - DESCE) ──────────────────────────
const ExpBlocoSimples = () => {
  const [theta, setTheta] = useState(30);
  const [mu, setMu] = useState(0.25);
  const [massa, setMassa] = useState(5);
  const [showVetores, setShowVetores] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [position, setPosition] = useState(0);
  const [activeTab, setActiveTab] = useState('sim');
  const animRef = useRef(null);
  
  const tR = toRad(theta);
  const N = massa * G * Math.cos(tR);
  const Px = massa * G * Math.sin(tR);
  const Fat = mu * N;
  const acc = Math.max(0, (Px - Fat) / massa);
  const isMoving = Px > Fat;
  
  const chartData = Array.from({ length: 90 }, (_, i) => ({
    x: i,
    y: Math.max(0, G * (Math.sin(toRad(i)) - mu * Math.cos(toRad(i))))
  }));
  
  // CORREÇÃO: O BLOCO DESCE (position aumenta de 0 até 0.92)
  useEffect(() => {
    if (isAnimating && isMoving && position < 0.92) {
      animRef.current = setInterval(() => {
        setPosition(p => Math.min(0.92, p + 0.008)); // AUMENTA = descendo
      }, 25);
    } else if (position >= 0.92 && isAnimating) {
      setIsAnimating(false);
    }
    return () => clearInterval(animRef.current);
  }, [isAnimating, isMoving, position]);
  
  const resetAnimation = () => {
    setIsAnimating(false);
    setPosition(0);
    clearInterval(animRef.current);
  };
  
  const handleParamChange = (setter) => (val) => {
    setter(val);
    resetAnimation();
  };
  
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem' }}>
      <div style={{ background: T.panel, borderRadius: '1rem', padding: '1.25rem', border: `1px solid ${T.border}` }}>
        <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '0.7rem', color: T.neon, letterSpacing: '2px', marginBottom: '1.5rem' }}>
          ⚙️ PARÂMETROS
        </div>
        
        <Slider label="Ângulo de inclinação θ" value={theta} onChange={handleParamChange(setTheta)} min={1} max={85} step={1} unit="°" color={T.amber} />
        <Slider label="Coeficiente de atrito μ" value={mu} onChange={handleParamChange(setMu)} min={0} max={0.9} step={0.01} unit="" color="#FF8C00" />
        <Slider label="Massa do bloco m" value={massa} onChange={handleParamChange(setMassa)} min={1} max={30} step={0.5} unit=" kg" color={T.neon} />
        
        <div style={{ display: 'flex', gap: '0.5rem', margin: '1rem 0' }}>
          <button
            onClick={() => setShowVetores(!showVetores)}
            style={{
              flex: 1,
              padding: '0.6rem',
              borderRadius: '0.5rem',
              border: `1px solid ${showVetores ? T.neon : T.muted}`,
              background: showVetores ? `${T.neon}10` : 'transparent',
              color: showVetores ? T.neon : T.muted,
              cursor: 'pointer',
              fontSize: '0.7rem',
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 600,
            }}
          >
            {showVetores ? '◉ VETORES ON' : '○ VETORES OFF'}
          </button>
          <button
            onClick={() => isMoving && setIsAnimating(!isAnimating)}
            style={{
              flex: 1,
              padding: '0.6rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: isMoving && isAnimating ? T.neon : (isMoving ? `${T.neon}20` : T.muted),
              color: isMoving && isAnimating ? '#000' : (isMoving ? T.neon : T.muted),
              cursor: isMoving ? 'pointer' : 'not-allowed',
              fontWeight: 700,
              fontSize: '0.7rem',
            }}
          >
            {isAnimating ? '⏸ PAUSAR' : '▶ ANIMAR'}
          </button>
          <button
            onClick={resetAnimation}
            style={{
              padding: '0.6rem 0.8rem',
              borderRadius: '0.5rem',
              border: `1px solid ${T.border}`,
              background: 'transparent',
              color: T.white,
              cursor: 'pointer',
            }}
          >
            ↺
          </button>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
          <MetricCard label="ACELERAÇÃO" value={acc.toFixed(3)} unit="m/s²" color={isMoving ? T.neon : T.muted} />
          <MetricCard label="FORÇA NORMAL" value={N.toFixed(1)} unit="N" color={T.emerald} />
          <MetricCard label="PESO PARALELO" value={Px.toFixed(1)} unit="N" color={T.amber} />
          <MetricCard label="ATRITO" value={Fat.toFixed(1)} unit="N" color="#FF8C00" />
        </div>
        
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem',
          borderRadius: '0.5rem',
          background: isMoving ? `${T.neon}08` : `${T.rose}08`,
          border: `1px solid ${isMoving ? `${T.neon}30` : `${T.rose}30`}`,
          textAlign: 'center',
          fontSize: '0.7rem',
          fontFamily: "'JetBrains Mono', monospace",
          color: isMoving ? T.neon : T.rose,
        }}>
          {isMoving 
            ? `📐 DESLIZANDO — a = ${acc.toFixed(3)} m/s²`
            : `⚖️ EQUILÍBRIO ESTÁTICO — μ > tan(θ) (${mu.toFixed(2)} > ${Math.tan(tR).toFixed(2)})`}
        </div>
      </div>
      
      <div style={{ background: T.panel, borderRadius: '1rem', border: `1px solid ${T.border}`, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem 0 1.25rem', borderBottom: `1px solid ${T.border}` }}>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <TabButton active={activeTab === 'sim'} onClick={() => setActiveTab('sim')} color={T.neon}>🎬 SIMULAÇÃO</TabButton>
            <TabButton active={activeTab === 'teoria'} onClick={() => setActiveTab('teoria')} color={T.amber}>📖 TEORIA</TabButton>
            <TabButton active={activeTab === 'calculus'} onClick={() => setActiveTab('calculus')} color={T.purple}>∫ CÁLCULO</TabButton>
            <TabButton active={activeTab === 'grafico'} onClick={() => setActiveTab('grafico')} color={T.emerald}>📊 GRÁFICOS</TabButton>
          </div>
        </div>
        
        <div style={{ padding: '1.5rem' }}>
          {activeTab === 'sim' && (
            <>
              <MainCanvas 
                theta={theta} mu={mu} massa={massa} 
                showVetores={showVetores} 
                isAnimating={isAnimating} 
                position={position}
              />
              {isMoving && isAnimating && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                  <MetricCard label="POSIÇÃO" value={(position * 5).toFixed(2)} unit="m" color={T.muted} />
                  <MetricCard label="VELOCIDADE" value={(acc * (position / 0.008 * 0.025)).toFixed(2)} unit="m/s" color={T.neon} />
                </div>
              )}
            </>
          )}
          
          {activeTab === 'teoria' && (
            <div style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              <FormulaCard title="📐 DECOMPOSIÇÃO DO PESO" color={T.amber} icon="📐">
                <p>O peso <strong>P = m·g</strong> atua verticalmente para baixo. No plano inclinado, decompomos essa força em duas componentes:</p>
                <br/>
                <div className="formula-math">P∥ = m·g·sen(θ) = {Px.toFixed(2)} N</div>
                <div className="formula-math">P⊥ = m·g·cos(θ) = {N.toFixed(2)} N</div>
                <br/>
                <p>• <span style={{ color: T.amber }}>P∥</span> é a componente paralela ao plano — responsável pelo deslizamento</p>
                <p>• <span style={{ color: T.emerald }}>P⊥</span> é a componente perpendicular — comprime a superfície, gerando a força normal</p>
              </FormulaCard>
              
              <FormulaCard title="🔧 FORÇA NORMAL" color={T.emerald} icon="🔧">
                <p>Pela 2ª Lei de Newton na direção perpendicular ao plano (sem movimento nessa direção):</p>
                <div className="formula-math">ΣF⊥ = 0 ⇒ N - P⊥ = 0</div>
                <div className="formula-math">N = m·g·cos(θ)</div>
                <p>Para θ = {theta}° e m = {massa} kg: <strong style={{ color: T.emerald }}>N = {N.toFixed(2)} N</strong></p>
                <p>Observação: N &lt; m·g quando θ &gt; 0° e N → 0 quando θ → 90°.</p>
              </FormulaCard>
              
              <FormulaCard title="⚡ FORÇA DE ATRITO CINÉTICO" color="#FF8C00" icon="⚡">
                <p>Quando há deslizamento, o atrito cinético se opõe ao movimento:</p>
                <div className="formula-math">f_c = μ_c·N = μ_c·m·g·cos(θ)</div>
                <p>Com μ = {mu} e θ = {theta}°:</p>
                <div className="formula-math">f = {mu} × {N.toFixed(2)} = <strong style={{ color: '#FF8C00' }}>{Fat.toFixed(2)} N</strong></div>
              </FormulaCard>
              
              <FormulaCard title="📐 2ª LEI DE NEWTON (DIREÇÃO PARALELA)" color={T.neon} icon="📐">
                <p>Aplicando ΣF = m·a na direção do movimento:</p>
                <div className="formula-math">P∥ − f = m·a</div>
                <div className="formula-math">m·g·sen(θ) − μ·m·g·cos(θ) = m·a</div>
                <p>Cancelando a massa m (que não influencia a aceleração!):</p>
                <div className="formula-math">a = g·(sen(θ) − μ·cos(θ))</div>
                <p>Para os valores atuais:</p>
                <div className="formula-math">a = 9,81 × (sen({theta}°) − {mu}×cos({theta}°)) = <strong style={{ color: T.neon }}>{acc.toFixed(4)} m/s²</strong></div>
              </FormulaCard>
              
              <FormulaCard title="⚖️ ÂNGULO CRÍTICO" color={T.amber} icon="⚖️">
                <p>O ângulo onde o bloco começa a deslizar é obtido igualando P∥ ao atrito estático máximo:</p>
                <div className="formula-math">m·g·sen(θ_c) = μ_s·m·g·cos(θ_c)</div>
                <div className="formula-math">tan(θ_c) = μ_s</div>
                <div className="formula-math">θ_c = arctan(μ_s)</div>
                <p>Para μ_s = 0.6 (valor típico): θ_c ≈ 31.0°</p>
                <p><strong style={{ color: T.purple }}>Importante:</strong> O ângulo crítico é <strong>independente da massa</strong> do bloco!</p>
              </FormulaCard>
            </div>
          )}
          
          {activeTab === 'calculus' && (
            <div style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              <FormulaCard title="∫ EQUAÇÃO DIFERENCIAL DO MOVIMENTO" color={T.purple} icon="∫">
                <p>A posição s(t) ao longo do plano satisfaz a EDO de 2ª ordem:</p>
                <div className="formula-math">d²s/dt² = a = g·sen(θ) − μ·g·cos(θ) = constante</div>
                <p>Esta é uma EDO linear com coeficientes constantes:</p>
                <div className="formula-math">s''(t) = a,   a ∈ ℝ⁺</div>
                <p>Condições iniciais (partida do repouso na origem):</p>
                <div className="formula-math">s(0) = 0,   v(0) = s'(0) = 0</div>
              </FormulaCard>
              
              <FormulaCard title="∫ VELOCIDADE POR INTEGRAÇÃO" color={T.neon} icon="∫">
                <p>Integrando a aceleração em relação ao tempo:</p>
                <div className="formula-math">v(t) = ∫ a dt = a·t + C₁</div>
                <p>Com v(0) = 0 ⇒ C₁ = 0, portanto:</p>
                <div className="formula-math">v(t) = a·t = {acc.toFixed(3)}·t</div>
                <p>Em t = {isAnimating ? (position / 0.008 * 0.025).toFixed(2) : '0'} s: v = {isAnimating ? (acc * (position / 0.008 * 0.025)).toFixed(2) : '0'} m/s</p>
              </FormulaCard>
              
              <FormulaCard title="∫ POSIÇÃO POR INTEGRAÇÃO DUPLA" color={T.emerald} icon="∫">
                <p>Integrando a velocidade:</p>
                <div className="formula-math">s(t) = ∫ v(t) dt = ∫ (a·t) dt = ½·a·t² + C₂</div>
                <p>Com s(0) = 0 ⇒ C₂ = 0, finalmente:</p>
                <div className="formula-math">s(t) = ½·a·t² = {(acc / 2).toFixed(4)}·t²</div>
                <p>Esta é a conhecida equação horária do MUV (Movimento Uniformemente Variado).</p>
              </FormulaCard>
              
              <FormulaCard title="∂ OTIMIZAÇÃO: ÂNGULO DE MÁXIMA ACELERAÇÃO" color={T.amber} icon="∂">
                <p>Para um dado μ, queremos o θ que maximiza a aceleração:</p>
                <div className="formula-math">a(θ) = g·(sen θ − μ·cos θ)</div>
                <p>Derivando em relação a θ e igualando a zero:</p>
                <div className="formula-math">da/dθ = g·(cos θ + μ·sen θ) = 0</div>
                <p>Condição de máximo:</p>
                <div className="formula-math">cos θ + μ·sen θ = 0 ⇒ tan θ = 1/μ</div>
                <div className="formula-math">θ_max = arctan(1/μ) = arctan(1/{mu}) = <strong style={{ color: T.amber }}>{toDeg(Math.atan(1 / mu)).toFixed(1)}°</strong></div>
              </FormulaCard>
              
              <FormulaCard title="∫ TRABALHO E ENERGIA" color={T.rose} icon="∫">
                <p>O trabalho da força resultante é igual à variação da energia cinética:</p>
                <div className="formula-math">W_res = ∫₀ˢ F_res·ds = ΔEc</div>
                <p>Como F_res = m·a é constante ao longo do plano:</p>
                <div className="formula-math">W_res = m·a·s = ½·m·v² − 0</div>
                <p>Isolando a velocidade:</p>
                <div className="formula-math">v = √(2·a·s) = √(2 × {acc.toFixed(3)} × s)</div>
                <p>Para s = {((position || 0) * 5).toFixed(2)} m: v = {Math.sqrt(2 * acc * ((position || 0) * 5)).toFixed(2)} m/s</p>
              </FormulaCard>
            </div>
          )}
          
          {activeTab === 'grafico' && (
            <div>
              <SimpleChart 
                data={chartData} 
                xLabel="Ângulo θ (graus)" 
                yLabel="Aceleração a (m/s²)" 
                color={T.neon} 
                highlight={theta}
              />
              <div style={{ marginTop: '1rem', padding: '0.75rem', background: `${T.neon}08`, borderRadius: '0.5rem', fontSize: '0.75rem', lineHeight: 1.6 }}>
                <strong style={{ color: T.neon }}>📈 Interpretação do gráfico:</strong><br/>
                • Para θ {'<'} θ_c = arctan(μ) = {toDeg(Math.atan(mu)).toFixed(1)}°, a aceleração é <strong>zero</strong> (equilíbrio estático)<br/>
                • Após o ângulo crítico, a aceleração cresce com θ, tendendo a <strong>g = 9,81 m/s²</strong> quando θ → 90°<br/>
                • O ângulo ótimo para máxima aceleração (dado μ fixo) é θ_max = arctan(1/μ) = {toDeg(Math.atan(1 / mu)).toFixed(1)}°<br/>
                • Ponto atual: <strong style={{ color: T.neon }}>θ = {theta}° → a = {acc.toFixed(3)} m/s²</strong>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── EXPERIMENTO 2: FORÇA EXTERNA HORIZONTAL (NOVO) ───────────────────────────
const ExpForcaExterna = () => {
  const [theta, setTheta] = useState(30);
  const [mu, setMu] = useState(0.25);
  const [massa, setMassa] = useState(5);
  const [F_ext, setF_ext] = useState(20);
  const [anguloF, setAnguloF] = useState(0);
  const [showVetores, setShowVetores] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [position, setPosition] = useState(0);
  const [activeTab, setActiveTab] = useState('sim');
  const animRef = useRef(null);
  
  const tR = toRad(theta);
  const angFRad = toRad(anguloF);
  
  const N = massa * G * Math.cos(tR) - F_ext * Math.sin(angFRad - tR);
  const N_efetiva = Math.max(0, N);
  const Px = massa * G * Math.sin(tR);
  const F_paralela = F_ext * Math.cos(angFRad - tR);
  const Fat_max = mu * N_efetiva;
  const Fat = Math.min(Fat_max, Math.abs(Px - F_paralela));
  const Fres = Px - F_paralela - (Math.abs(Px - F_paralela) > Fat_max ? Math.sign(Px - F_paralela) * Fat : 0);
  const acc = Fres / massa;
  const isMoving = Math.abs(Px - F_paralela) > Fat_max;
  const sentido = Px - F_paralela > 0 ? "descendo" : "subindo";
  
  const chartData = Array.from({ length: 101 }, (_, i) => {
    const F = i * 2;
    const F_par = F * Math.cos(angFRad - tR);
    const N_temp = massa * G * Math.cos(tR) - F * Math.sin(angFRad - tR);
    const N_eff = Math.max(0, N_temp);
    const Fat_max_temp = mu * N_eff;
    const Fres_temp = Px - F_par - (Math.abs(Px - F_par) > Fat_max_temp ? Math.sign(Px - F_par) * Fat_max_temp : 0);
    return { x: F, y: Fres_temp / massa };
  });
  
  useEffect(() => {
    if (isAnimating && isMoving && position < 0.92 && position > 0) {
      animRef.current = setInterval(() => {
        setPosition(p => {
          const delta = (acc > 0 ? 0.008 : -0.008);
          const newPos = p + delta;
          if (newPos <= 0) return 0;
          if (newPos >= 0.92) return 0.92;
          return newPos;
        });
      }, 25);
    } else if ((position >= 0.92 || position <= 0) && isAnimating) {
      setIsAnimating(false);
    }
    return () => clearInterval(animRef.current);
  }, [isAnimating, isMoving, position, acc]);
  
  const resetAnimation = () => {
    setIsAnimating(false);
    setPosition(0.46);
    clearInterval(animRef.current);
  };
  
  const handleParamChange = (setter) => (val) => {
    setter(val);
    resetAnimation();
  };
  
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem' }}>
      <div style={{ background: T.panel, borderRadius: '1rem', padding: '1.25rem', border: `1px solid ${T.border}` }}>
        <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '0.7rem', color: T.purple, letterSpacing: '2px', marginBottom: '1.5rem' }}>
          🎯 FORÇA EXTERNA
        </div>
        
        <Slider label="Ângulo do plano θ" value={theta} onChange={handleParamChange(setTheta)} min={1} max={85} step={1} unit="°" color={T.amber} />
        <Slider label="Coeficiente de atrito μ" value={mu} onChange={handleParamChange(setMu)} min={0} max={0.9} step={0.01} unit="" color="#FF8C00" />
        <Slider label="Massa m" value={massa} onChange={handleParamChange(setMassa)} min={1} max={30} step={0.5} unit=" kg" color={T.neon} />
        <Slider label="Força externa F" value={F_ext} onChange={handleParamChange(setF_ext)} min={0} max={100} step={1} unit=" N" color={T.purple} />
        <Slider label="Ângulo da força α" value={anguloF} onChange={handleParamChange(setAnguloF)} min={-90} max={90} step={5} unit="°" color={T.purple} />
        
        <div style={{ display: 'flex', gap: '0.5rem', margin: '1rem 0' }}>
          <button
            onClick={() => setShowVetores(!showVetores)}
            style={{
              flex: 1,
              padding: '0.6rem',
              borderRadius: '0.5rem',
              border: `1px solid ${showVetores ? T.purple : T.muted}`,
              background: showVetores ? `${T.purple}10` : 'transparent',
              color: showVetores ? T.purple : T.muted,
              cursor: 'pointer',
              fontSize: '0.7rem',
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 600,
            }}
          >
            {showVetores ? '◉ VETORES ON' : '○ VETORES OFF'}
          </button>
          <button
            onClick={() => isMoving && setIsAnimating(!isAnimating)}
            style={{
              flex: 1,
              padding: '0.6rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: isMoving && isAnimating ? T.purple : (isMoving ? `${T.purple}20` : T.muted),
              color: isMoving && isAnimating ? '#000' : (isMoving ? T.purple : T.muted),
              cursor: isMoving ? 'pointer' : 'not-allowed',
              fontWeight: 700,
              fontSize: '0.7rem',
            }}
          >
            {isAnimating ? '⏸ PAUSAR' : '▶ ANIMAR'}
          </button>
          <button
            onClick={resetAnimation}
            style={{
              padding: '0.6rem 0.8rem',
              borderRadius: '0.5rem',
              border: `1px solid ${T.border}`,
              background: 'transparent',
              color: T.white,
              cursor: 'pointer',
            }}
          >
            ↺
          </button>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
          <MetricCard label="ACELERAÇÃO" value={Math.abs(acc).toFixed(3)} unit="m/s²" color={isMoving ? T.purple : T.muted} description={isMoving ? sentido : "em repouso"} />
          <MetricCard label="FORÇA NORMAL" value={N_efetiva.toFixed(1)} unit="N" color={T.emerald} />
          <MetricCard label="PESO PARALELO" value={Px.toFixed(1)} unit="N" color={T.amber} />
          <MetricCard label="F_ext PARALELA" value={F_paralela.toFixed(1)} unit="N" color={T.purple} />
          <MetricCard label="ATRITO MÁXIMO" value={Fat_max.toFixed(1)} unit="N" color="#FF8C00" />
          <MetricCard label="FORÇA RESULTANTE" value={Math.abs(Fres).toFixed(1)} unit="N" color={T.neon} />
        </div>
        
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem',
          borderRadius: '0.5rem',
          background: isMoving ? `${T.purple}08` : `${T.emerald}08`,
          border: `1px solid ${isMoving ? `${T.purple}30` : `${T.emerald}30`}`,
          textAlign: 'center',
          fontSize: '0.7rem',
          fontFamily: "'JetBrains Mono', monospace",
          color: isMoving ? T.purple : T.emerald,
        }}>
          {isMoving 
            ? `🔹 BLOCO ${sentido.toUpperCase()} — a = ${Math.abs(acc).toFixed(3)} m/s²`
            : `⚖️ EQUILÍBRIO ESTÁTICO — |P∥ − F_∥| ≤ μ·N`}
        </div>
      </div>
      
      <div style={{ background: T.panel, borderRadius: '1rem', border: `1px solid ${T.border}`, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem 0 1.25rem', borderBottom: `1px solid ${T.border}` }}>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <TabButton active={activeTab === 'sim'} onClick={() => setActiveTab('sim')} color={T.purple}>🎬 SIMULAÇÃO</TabButton>
            <TabButton active={activeTab === 'teoria'} onClick={() => setActiveTab('teoria')} color={T.amber}>📖 TEORIA</TabButton>
            <TabButton active={activeTab === 'calculus'} onClick={() => setActiveTab('calculus')} color={T.purple}>∫ CÁLCULO</TabButton>
            <TabButton active={activeTab === 'grafico'} onClick={() => setActiveTab('grafico')} color={T.emerald}>📊 GRÁFICOS</TabButton>
          </div>
        </div>
        
        <div style={{ padding: '1.5rem' }}>
          {activeTab === 'sim' && (
            <>
              <ExternalForceCanvas 
                theta={theta} mu={mu} massa={massa}
                F_ext={F_ext} anguloF={anguloF}
                showVetores={showVetores}
                isAnimating={isAnimating}
                position={position}
              />
              {isMoving && isAnimating && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                  <MetricCard label="POSIÇÃO" value={(Math.abs(position - 0.46) * 5).toFixed(2)} unit="m" color={T.muted} />
                  <MetricCard label="VELOCIDADE" value={(Math.abs(acc) * (Math.abs(position - 0.46) / 0.008 * 0.025)).toFixed(2)} unit="m/s" color={T.purple} />
                </div>
              )}
            </>
          )}
          
          {activeTab === 'teoria' && (
            <div style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              <FormulaCard title="🎯 FORÇA EXTERNA NO PLANO INCLINADO" color={T.purple} icon="🎯">
                <p>Uma força externa <strong>F</strong> aplicada ao bloco altera completamente o equilíbrio. Ela tem componentes:</p>
                <div className="formula-math">F_∥ = F·cos(α − θ)</div>
                <div className="formula-math">F_⊥ = F·sin(α − θ)</div>
                <p>Para α = {anguloF}°: F_∥ = {F_paralela.toFixed(1)} N, F_⊥ = {(F_ext * Math.sin(angFRad - tR)).toFixed(1)} N</p>
              </FormulaCard>
              
              <FormulaCard title="🔧 NOVA FORÇA NORMAL" color={T.emerald} icon="🔧">
                <p>A componente perpendicular da força externa altera a normal:</p>
                <div className="formula-math">N = m·g·cos(θ) − F·sin(α − θ)</div>
                <p>Com valores atuais:</p>
                <div className="formula-math">N = {massa}×9,81×cos({theta}°) − {F_ext}×sin({anguloF}° − {theta}°)</div>
                <div className="formula-math">N = <strong style={{ color: T.emerald }}>{N_efetiva.toFixed(2)} N</strong></div>
                {N_efetiva < 0 && <p style={{ color: T.rose }}>⚠️ NORMAL NEGATIVA — bloco perderia contato com o plano!</p>}
              </FormulaCard>
              
              <FormulaCard title="⚖️ NOVO EQUILÍBRIO" color={T.amber} icon="⚖️">
                <p>A força resultante na direção do plano é:</p>
                <div className="formula-math">F_res = P∥ − F_∥ − f</div>
                <p>Onde f = μ·N se |P∥ − F_∥| {'>'} μ·N, ou f = P∥ − F_∥ se em equilíbrio.</p>
                <p>Condição de equilíbrio estático:</p>
                <div className="formula-math">|P∥ − F_∥| ≤ μ·N</div>
              </FormulaCard>
              
              <FormulaCard title="🔬 CASOS PARTICULARES" color={T.neon} icon="🔬">
                <p><strong>• Força horizontal (α = 0°):</strong> F_∥ = F·cosθ, F_⊥ = −F·sinθ (aumenta a normal)</p>
                <p><strong>• Força paralela ao plano (α = θ):</strong> F_∥ = F, F_⊥ = 0 (não altera a normal)</p>
                <p><strong>• Força perpendicular ao plano (α = θ+90°):</strong> F_∥ = 0, F_⊥ = F (só altera a normal)</p>
              </FormulaCard>
            </div>
          )}
          
          {activeTab === 'calculus' && (
            <div style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              <FormulaCard title="∂ OTIMIZAÇÃO DA FORÇA" color={T.purple} icon="∂">
                <p>Para um dado θ e μ, qual F mínima para iniciar o movimento?</p>
                <div className="formula-math">|P∥ − F·cos(α−θ)| = μ·(m·g·cosθ − F·sin(α−θ))</div>
                <p>Resolvendo para F:</p>
                <div className="formula-math">F_min = (m·g·senθ − μ·m·g·cosθ) / (cos(α−θ) + μ·sin(α−θ))</div>
                <p>Para α = 0° (força horizontal): F_min = {((massa*G*Math.sin(tR) - mu*massa*G*Math.cos(tR)) / (Math.cos(-tR) + mu*Math.sin(-tR))).toFixed(1)} N</p>
              </FormulaCard>
              
              <FormulaCard title="∂ ÂNGULO ÓTIMO DA FORÇA" color={T.amber} icon="∂">
                <p>Para minimizar a força necessária, derivamos F em relação a α:</p>
                <div className="formula-math">dF/dα = 0 ⇒ tan(α − θ) = μ</div>
                <div className="formula-math">α_ótimo = θ + arctan(μ)</div>
                <p>Para μ = {mu}: α_ótimo = {theta + toDeg(Math.atan(mu)).toFixed(1)}°</p>
                <p>Neste ângulo, a força é mínima para iniciar o movimento.</p>
              </FormulaCard>
            </div>
          )}
          
          {activeTab === 'grafico' && (
            <div>
              <SimpleChart 
                data={chartData} 
                xLabel="Força Externa F (N)" 
                yLabel="Aceleração a (m/s²)" 
                color={T.purple} 
                highlight={F_ext}
              />
              <div style={{ marginTop: '1rem', padding: '0.75rem', background: `${T.purple}08`, borderRadius: '0.5rem', fontSize: '0.75rem', lineHeight: 1.6 }}>
                <strong style={{ color: T.purple }}>📈 Interpretação do gráfico:</strong><br/>
                • Aceleração <strong>zero</strong> na região de equilíbrio estático<br/>
                • Força negativa significa que F está <strong>ajudando o movimento</strong> para baixo<br/>
                • O limiar de movimento ocorre quando |P∥ − F_∥| = μ·N<br/>
                • Ponto atual: <strong style={{ color: T.purple }}>F = {F_ext} N → a = {acc.toFixed(3)} m/s²</strong>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── EXPERIMENTO 3: ÂNGULO CRÍTICO (MANTIDO) ───────────────────────────────────
const ExpAnguloCritico = () => {
  const [theta, setTheta] = useState(20);
  const [muEst, setMuEst] = useState(0.4);
  const [massa, setMassa] = useState(5);
  const [activeTab, setActiveTab] = useState('sim');
  
  const thetaCrit = toDeg(Math.atan(muEst));
  const estado = theta < thetaCrit - 0.5 ? 'repouso' : theta > thetaCrit + 0.5 ? 'deslizando' : 'iminente';
  
  const forceData = Array.from({ length: 90 }, (_, i) => {
    const tr = toRad(i);
    return { x: i, y: massa * G * Math.sin(tr) - muEst * massa * G * Math.cos(tr) };
  });
  
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem' }}>
      <div style={{ background: T.panel, borderRadius: '1rem', padding: '1.25rem', border: `1px solid ${T.border}` }}>
        <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '0.7rem', color: T.amber, letterSpacing: '2px', marginBottom: '1.5rem' }}>
          ⚠️ PARÂMETROS
        </div>
        
        <Slider label="Ângulo θ" value={theta} onChange={setTheta} min={1} max={89} step={1} unit="°" color={T.amber} />
        <Slider label="μₛ (atrito estático)" value={muEst} onChange={setMuEst} min={0.05} max={0.95} step={0.01} unit="" color="#FF8C00" />
        <Slider label="Massa m" value={massa} onChange={setMassa} min={1} max={30} step={1} unit=" kg" color={T.muted} />
        
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          background: `${T.amber}10`,
          borderRadius: '0.75rem',
          textAlign: 'center',
          border: `1px solid ${T.amber}30`,
        }}>
          <div style={{ fontSize: '0.65rem', color: T.muted, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '1px' }}>
            ÂNGULO CRÍTICO
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: T.amber, fontFamily: "'Orbitron', monospace", marginTop: '0.25rem' }}>
            {thetaCrit.toFixed(1)}°
          </div>
          <div style={{ fontSize: '0.7rem', color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
            θc = arctan(μₛ) = arctan({muEst})
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginTop: '1rem' }}>
          <MetricCard label="PESO PARALELO" value={(massa * G * Math.sin(toRad(theta))).toFixed(1)} unit="N" color={T.amber} />
          <MetricCard label="ATRITO MÁXIMO" value={(muEst * massa * G * Math.cos(toRad(theta))).toFixed(1)} unit="N" color="#FF8C00" />
        </div>
      </div>
      
      <div style={{ background: T.panel, borderRadius: '1rem', border: `1px solid ${T.border}`, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem 0 1.25rem', borderBottom: `1px solid ${T.border}` }}>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <TabButton active={activeTab === 'sim'} onClick={() => setActiveTab('sim')} color={T.amber}>🎬 SIMULAÇÃO</TabButton>
            <TabButton active={activeTab === 'teoria'} onClick={() => setActiveTab('teoria')} color={T.emerald}>📖 TEORIA</TabButton>
            <TabButton active={activeTab === 'calculus'} onClick={() => setActiveTab('calculus')} color={T.purple}>∫ CÁLCULO</TabButton>
            <TabButton active={activeTab === 'grafico'} onClick={() => setActiveTab('grafico')} color={T.rose}>📊 GRÁFICOS</TabButton>
          </div>
        </div>
        
        <div style={{ padding: '1.5rem' }}>
          {activeTab === 'sim' && (
            <CriticalCanvas theta={theta} thetaCrit={thetaCrit} estado={estado} />
          )}
          
          {activeTab === 'teoria' && (
            <div style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              <FormulaCard title="⚖️ CONDIÇÃO DE EQUILÍBRIO ESTÁTICO" color={T.emerald} icon="⚖️">
                <p>Para que o bloco permaneça em repouso, a força de atrito estático deve ser suficiente para equilibrar a componente paralela do peso:</p>
                <div className="formula-math">f_s ≥ P∥</div>
                <div className="formula-math">μ_s·N ≥ m·g·sen(θ)</div>
                <div className="formula-math">μ_s·m·g·cos(θ) ≥ m·g·sen(θ)</div>
                <p>Cancelando m·g (independente da massa!):</p>
                <div className="formula-math">μ_s ≥ tan(θ)</div>
              </FormulaCard>
              
              <FormulaCard title="⚠️ ÂNGULO CRÍTICO" color={T.amber} icon="⚠️">
                <p>No limite do equilíbrio (iminência de deslizamento):</p>
                <div className="formula-math">μ_s = tan(θ_c)</div>
                <div className="formula-math">θ_c = arctan(μ_s)</div>
                <p>Para μ_s = {muEst}:</p>
                <div className="formula-math">θ_c = arctan({muEst}) = <strong style={{ color: T.amber }}>{thetaCrit.toFixed(2)}°</strong></div>
                <p>Este é o ângulo máximo antes do deslizamento começar.</p>
              </FormulaCard>
              
              <FormulaCard title="📊 REGIÕES DE COMPORTAMENTO" color={T.rose} icon="📊">
                <p>• <span style={{ color: T.emerald }}>θ {'<'} θ_c</span>: Bloco em <strong>repouso estático</strong> — f_s {'<'} μ_s·N, atrito ajustável</p>
                <p>• <span style={{ color: T.amber }}>θ = θ_c</span>: <strong>Iminência de deslizamento</strong> — f_s = μ_s·N, situação instável</p>
                <p>• <span style={{ color: T.rose }}>θ {'>'} θ_c</span>: <strong>Bloco desliza</strong> — regime cinético, a {'>'} 0</p>
              </FormulaCard>
              
              <FormulaCard title="🎯 INDEPENDÊNCIA DA MASSA" color={T.purple} icon="🎯">
                <p>Uma consequência surpreendente: <strong>a massa do bloco não aparece</strong> na expressão final!</p>
                <p>Isso significa que blocos de massas diferentes, com o mesmo coeficiente de atrito estático, começam a deslizar no <strong>mesmo ângulo crítico</strong>.</p>
                <p>Na prática, isso é observado: uma caixa leve e uma pesada, sobre a mesma superfície, deslizam quando a inclinação atinge o mesmo valor.</p>
              </FormulaCard>
            </div>
          )}
          
          {activeTab === 'calculus' && (
            <div style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              <FormulaCard title="∂ FUNÇÃO FORÇA RESULTANTE" color={T.purple} icon="∂">
                <p>Definimos a força resultante na direção paralela ao plano:</p>
                <div className="formula-math">F_res(θ) = P∥ − f_s,máx</div>
                <div className="formula-math">F_res(θ) = m·g·sen(θ) − μ_s·m·g·cos(θ)</div>
                <div className="formula-math">F_res(θ) = m·g·(sen(θ) − μ_s·cos(θ))</div>
                <p>O sinal de F_res determina o estado do sistema.</p>
              </FormulaCard>
              
              <FormulaCard title="∂ ZEROS DA FUNÇÃO" color={T.amber} icon="∂">
                <p>O ângulo crítico é a raiz da equação F_res(θ) = 0:</p>
                <div className="formula-math">sen(θ_c) − μ_s·cos(θ_c) = 0</div>
                <div className="formula-math">sen(θ_c) = μ_s·cos(θ_c)</div>
                <div className="formula-math">tan(θ_c) = μ_s</div>
                <div className="formula-math">θ_c = arctan(μ_s)</div>
              </FormulaCard>
              
              <FormulaCard title="∂ ANÁLISE DE ESTABILIDADE" color={T.neon} icon="∂">
                <p>Analisando a derivada de F_res em torno do ponto crítico:</p>
                <div className="formula-math">F_res'(θ) = m·g·(cos(θ) + μ_s·sen(θ)) {'>'} 0 para θ ∈ [0, 90°]</div>
                <p>Como a derivada é sempre positiva, a função é estritamente crescente.</p>
                <p>Isso significa que:</p>
                <p>• θ {'<'} θ_c → F_res {'<'} 0 (equilíbrio estável)</p>
                <p>• θ = θ_c → F_res = 0 (equilíbrio instável)</p>
                <p>• θ {'>'} θ_c → F_res {'>'} 0 (movimento acelerado)</p>
              </FormulaCard>
            </div>
          )}
          
          {activeTab === 'grafico' && (
            <div>
              <SimpleChart 
                data={forceData} 
                xLabel="Ângulo θ (graus)" 
                yLabel="Força Resultante F_res (N)" 
                color={T.rose} 
                highlight={theta}
              />
              <div style={{ marginTop: '1rem', padding: '0.75rem', background: `${T.rose}08`, borderRadius: '0.5rem', fontSize: '0.75rem', lineHeight: 1.6 }}>
                <strong style={{ color: T.rose }}>📈 Interpretação do gráfico:</strong><br/>
                • <span style={{ color: T.emerald }}>F_res {'<'} 0</span>: Bloco em repouso — atrito estático suficiente<br/>
                • <span style={{ color: T.amber }}>F_res = 0</span>: Iminência de deslizamento — θ = θ_c<br/>
                • <span style={{ color: T.rose }}>F_res {'>'} 0</span>: Bloco desliza — aceleração positiva<br/>
                • Ponto atual: <strong style={{ color: T.rose }}>θ = {theta}° → F_res = {(massa * G * Math.sin(toRad(theta)) - muEst * massa * G * Math.cos(toRad(theta))).toFixed(2)} N</strong>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── COMPONENTE PRINCIPAL ────────────────────────────────────────────────────
export default function ExperimentoPlanoInclinado() {
  const [experimento, setExperimento] = useState('bloco');
  
  return (
    <div className="exp-root">
      <style>{globalStyles}</style>
      
      <div style={{ padding: '2rem 2rem 0 2rem', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: '2.2rem', 
            background: `linear-gradient(135deg, ${T.neon}, ${T.emerald}, ${T.amber})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontFamily: "'Orbitron', monospace",
            fontWeight: 900,
            letterSpacing: '-1px',
          }}>
            PLANO INCLINADO
          </h1>
          <p style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', marginTop: '0.5rem', letterSpacing: '1px' }}>
            DECOMPOSIÇÃO VETORIAL · ATRITO ESTÁTICO E CINÉTICO · FORÇA EXTERNA · ÂNGULO CRÍTICO
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setExperimento('bloco')}
            style={{
              padding: '0.6rem 1.5rem',
              borderRadius: '2rem',
              border: `1px solid ${experimento === 'bloco' ? T.neon : T.border}`,
              background: experimento === 'bloco' ? `${T.neon}10` : 'transparent',
              color: experimento === 'bloco' ? T.neon : T.muted,
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontFamily: "'Orbitron', monospace",
              fontWeight: experimento === 'bloco' ? 700 : 400,
              transition: 'all 0.2s',
            }}
          >
            🔷 BLOCO NO PLANO
          </button>
          <button
            onClick={() => setExperimento('forca')}
            style={{
              padding: '0.6rem 1.5rem',
              borderRadius: '2rem',
              border: `1px solid ${experimento === 'forca' ? T.purple : T.border}`,
              background: experimento === 'forca' ? `${T.purple}10` : 'transparent',
              color: experimento === 'forca' ? T.purple : T.muted,
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontFamily: "'Orbitron', monospace",
              fontWeight: experimento === 'forca' ? 700 : 400,
            }}
          >
            🎯 FORÇA EXTERNA
          </button>
          <button
            onClick={() => setExperimento('critico')}
            style={{
              padding: '0.6rem 1.5rem',
              borderRadius: '2rem',
              border: `1px solid ${experimento === 'critico' ? T.amber : T.border}`,
              background: experimento === 'critico' ? `${T.amber}10` : 'transparent',
              color: experimento === 'critico' ? T.amber : T.muted,
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontFamily: "'Orbitron', monospace",
              fontWeight: experimento === 'critico' ? 700 : 400,
            }}
          >
            ⚠️ ÂNGULO CRÍTICO
          </button>
        </div>
      </div>
      
      <div style={{ padding: '0 2rem 2rem 2rem', maxWidth: '1400px', margin: '0 auto' }}>
        {experimento === 'bloco' && <ExpBlocoSimples />}
        {experimento === 'forca' && <ExpForcaExterna />}
        {experimento === 'critico' && <ExpAnguloCritico />}
      </div>
      
      <div style={{
        borderTop: `1px solid ${T.border}`,
        padding: '1.5rem 2rem',
        textAlign: 'center',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.7rem',
        color: T.muted,
        letterSpacing: '1px',
      }}>
        g = 9,81 m/s² · Experimento Didático de Mecânica Clássica · Baseado nas Leis de Newton e no Cálculo Diferencial/Integral
      </div>
    </div>
  );
}