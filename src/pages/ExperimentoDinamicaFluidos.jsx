// src/pages/ExperimentoDinamicaFluidos.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FISICA2_BASE_STYLES } from '../styles/fisica2Theme';
import PainelExplicativo from '../components/PainelExplicativo';

const G = 9.8;
const TIME_SCALE = 25; // aceleração do "relógio" só na aba do tanque furado (ver comentário no loop de física)
const fmt = (n, d = 2) => (typeof n === 'number' && isFinite(n) ? n.toFixed(d) : '—');

const STYLES = FISICA2_BASE_STYLES + `
`;

// Largura local do tubo de Venturi (0=entrada larga, 0.5=garganta estreita, 1=saída larga)
function venturiRaio(xFrac, r1, r2) {
  const center = 0.5, halfWidth = 0.18;
  const d = Math.abs(xFrac - center);
  if (d >= halfWidth) return r1;
  const t = d / halfWidth;
  const blend = 0.5 * (1 + Math.cos(t * Math.PI)); // 1 no centro, 0 na borda da garganta
  return r2 * blend + r1 * (1 - blend);
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════
export default function ExperimentoDinamicaFluidos() {
  const [tab, setTab] = useState('sim');

  return (
    <>
      <style>{STYLES}</style>
      <div className="app">
        <header className="header">
          <div className="header-title">Dinâmica dos Fluidos</div>
          <div className="header-sub">Física 2 · Continuidade · Bernoulli</div>
          <span className="header-tag">A₁v₁ = A₂v₂</span>
        </header>

        <nav className="tabs">
          {[
            ['sim', 'Tubo de Venturi'],
            ['torricelli', 'Tanque Furado (Torricelli)'],
            ['calc', 'Cálculo & Derivações'],
          ].map(([id, label]) => (
            <button key={id} className={`tab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </nav>

        {tab === 'sim' && <VenturiTab />}
        {tab === 'torricelli' && <TorricelliTab />}
        {tab === 'calc' && <CalcTab />}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ABA 1 — TUBO DE VENTURI (continuidade + Bernoulli)
// ═══════════════════════════════════════════════════════════════════════════
function VenturiTab() {
  const [A1, setA1] = useState(40);   // cm²
  const [A2, setA2] = useState(12);   // cm²
  const [v1, setV1] = useState(2);    // m/s
  const [rho, setRho] = useState(1000); // kg/m³
  const [rodando, setRodando] = useState(true);

  const v2 = v1 * (A1 / A2);
  const Q = (A1 / 10000) * v1; // m³/s
  const P0 = 101325; // Pa, referência atmosférica
  const P1 = P0;
  const P2 = P1 + 0.5 * rho * (v1 * v1 - v2 * v2);
  const deltaP = P1 - P2;

  const stateRef = useRef({ A1, A2, v1, rho });
  useEffect(() => { stateRef.current = { A1, A2, v1, rho }; }, [A1, A2, v1, rho]);

  const particlesRef = useRef(Array.from({ length: 16 }, (_, i) => ({ x: i / 16 })));
  const rafRef = useRef(null);
  const lastRef = useRef(null);

  useEffect(() => {
    if (!rodando) { lastRef.current = null; return; }
    const step = (now) => {
      if (lastRef.current !== null) {
        const dt = Math.min((now - lastRef.current) / 1000, 0.05);
        const s = stateRef.current;
        const r1 = 1, r2 = s.A2 / s.A1; // raio relativo (1 = entrada larga)
        particlesRef.current.forEach(p => {
          const localR = venturiRaio(p.x % 1, r1, r2);
          const localV = s.v1 * (r1 / localR);
          p.x += localV * 0.12 * dt;
          if (p.x > 1.05) p.x -= 1.05;
        });
      }
      lastRef.current = now;
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [rodando]);

  const canvasRef = useRef(null);
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    let raf;
    const ctx = cv.getContext('2d');
    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const W = cv.clientWidth, H = cv.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      const s = stateRef.current;
      const pipeLeft = W * 0.08, pipeRight = W * 0.92;
      const pipeMidY = H * 0.55;
      const r1px = Math.min(60, H * 0.16);
      const r2ratio = s.A2 / s.A1;

      // Paredes do tubo (superior e inferior, espelhadas)
      const wallPts = [];
      for (let i = 0; i <= 60; i++) {
        const xFrac = i / 60;
        const r = venturiRaio(xFrac, 1, r2ratio) * r1px;
        wallPts.push({ x: pipeLeft + xFrac * (pipeRight - pipeLeft), r });
      }
      ctx.beginPath();
      wallPts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, pipeMidY - p.r) : ctx.lineTo(p.x, pipeMidY - p.r));
      ctx.strokeStyle = 'rgba(239,68,68,0.5)';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.beginPath();
      wallPts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, pipeMidY + p.r) : ctx.lineTo(p.x, pipeMidY + p.r));
      ctx.stroke();

      // Preenchimento do fluido
      ctx.beginPath();
      wallPts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, pipeMidY - p.r) : ctx.lineTo(p.x, pipeMidY - p.r));
      for (let i = wallPts.length - 1; i >= 0; i--) ctx.lineTo(wallPts[i].x, pipeMidY + wallPts[i].r);
      ctx.closePath();
      ctx.fillStyle = 'rgba(56,189,248,0.18)';
      ctx.fill();

      // Partículas fluindo (mais rápidas na garganta)
      particlesRef.current.forEach(p => {
        const xFrac = p.x % 1;
        const r = venturiRaio(xFrac, 1, r2ratio) * r1px;
        const px = pipeLeft + xFrac * (pipeRight - pipeLeft);
        const speed = s.v1 * (1 / (r / r1px));
        const glow = Math.min(1, 0.4 + speed / (s.v1 * 4));
        ctx.beginPath();
        ctx.arc(px, pipeMidY, 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251,191,36,${glow})`;
        ctx.shadowBlur = 6;
        ctx.shadowColor = 'rgba(251,191,36,0.6)';
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Manômetros (3 pontos: entrada, garganta, saída)
      const pontos = [0.15, 0.5, 0.85];
      pontos.forEach(xFrac => {
        const r = venturiRaio(xFrac, 1, r2ratio) * r1px;
        const vLocal = s.v1 * (1 / (r / r1px));
        const pLocal = P0 + 0.5 * s.rho * (s.v1 * s.v1 - vLocal * vLocal);
        const deltaKPa = (pLocal - P0) / 1000;
        const px = pipeLeft + xFrac * (pipeRight - pipeLeft);
        const tubeTopY = pipeMidY - r1px - 70;
        const colH = Math.max(2, Math.min(60, 30 + deltaKPa * 3));

        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px, pipeMidY - r);
        ctx.lineTo(px, tubeTopY);
        ctx.stroke();

        ctx.fillStyle = 'rgba(56,189,248,0.6)';
        ctx.fillRect(px - 6, tubeTopY + (60 - colH), 12, colH);

        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.font = "9px 'JetBrains Mono', monospace";
        ctx.textAlign = 'center';
        ctx.fillText(`${fmt(deltaKPa, 1)}kPa`, px, tubeTopY - 6);
      });

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  const situacaoAtual = `Com A₁=${fmt(A1, 0)}cm² e A₂=${fmt(A2, 0)}cm², a continuidade dá v₂=${fmt(v2, 2)}m/s (entrando a v₁=${fmt(v1, 2)}m/s). Bernoulli então prevê uma queda de pressão ΔP=${fmt(deltaP, 0)}Pa no estreitamento — onde o fluido é mais rápido, a pressão é menor.`;

  const perguntasAssistente = [
    {
      id: 'areas',
      pergunta: 'O que são A₁ e A₂?',
      resposta: `São as áreas da seção transversal do tubo antes (A₁=${fmt(A1, 0)}cm²) e no estreitamento (A₂=${fmt(A2, 0)}cm²). Quanto mais estreito for A₂ em relação a A₁, mais o fluido acelera ali.`,
    },
    {
      id: 'continuidade',
      pergunta: 'O que é a equação da continuidade?',
      resposta: `A₁v₁=A₂v₂ — como o fluido é incompressível, a mesma quantidade de volume por segundo (vazão Q) precisa passar por qualquer seção do tubo. Onde a área é menor, a velocidade tem que ser maior para manter a vazão constante.`,
    },
    {
      id: 'bernoulli',
      pergunta: 'O que Bernoulli tem a ver com pressão?',
      resposta: `A equação de Bernoulli (P+½ρv²+ρgh=constante) diz que, no mesmo nível, onde a velocidade é maior, a pressão é menor. É por isso que a região estreita (v₂ alto) tem pressão menor que a região larga.`,
    },
    {
      id: 'deltaP',
      pergunta: 'O que é a queda de pressão ΔP?',
      resposta: `ΔP=P₁−P₂=½ρ(v₂²−v₁²) é a diferença de pressão entre a entrada larga e o estreitamento, causada pela diferença de velocidade. Agora ΔP=${fmt(deltaP, 0)}Pa — esse é o princípio usado em medidores de vazão do tipo Venturi.`,
    },
  ];

  return (
    <div className="content">
      <PainelExplicativo situacao={situacaoAtual} perguntas={perguntasAssistente} />
      <div className="sidebar-l">
        <div className="section-label">Geometria do Tubo</div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Área larga A₁</span><span className="ctrl-num">{fmt(A1, 0)} cm²</span></div>
          <input type="range" min="20" max="60" step="1" value={A1} onChange={e => setA1(+e.target.value)} />
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Área da garganta A₂</span><span className="ctrl-num">{fmt(A2, 0)} cm²</span></div>
          <input type="range" min="4" max="40" step="1" value={A2} onChange={e => setA2(+e.target.value)} />
        </div>

        <div className="section-label">Escoamento</div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Velocidade de entrada v₁</span><span className="ctrl-num">{fmt(v1, 1)} m/s</span></div>
          <input type="range" min="0.5" max="6" step="0.1" value={v1} onChange={e => setV1(+e.target.value)} />
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Densidade do fluido ρ</span><span className="ctrl-num">{fmt(rho, 0)} kg/m³</span></div>
          <input type="range" min="800" max="1200" step="10" value={rho} onChange={e => setRho(+e.target.value)} />
        </div>

        <div className="btn-row">
          <button className="btn btn-primary" onClick={() => setRodando(true)}>▶ Iniciar</button>
          <button className="btn btn-secondary" onClick={() => setRodando(false)}>⏸ Pausar</button>
        </div>
      </div>

      <div className="main-area">
        <div className="canvas-wrap"><canvas ref={canvasRef} /></div>
      </div>

      <div className="sidebar-r">
        <div className="section-label">Velocidades (Continuidade)</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">v₁ (seção larga)</span><span className="stat-val accent">{fmt(v1, 2)} m/s</span></div>
          <div className="stat-row"><span className="stat-label">v₂ (garganta)</span><span className="stat-val warm">{fmt(v2, 2)} m/s</span></div>
          <div className="stat-row"><span className="stat-label">Vazão Q</span><span className="stat-val cool">{fmt(Q * 1000, 2)} L/s</span></div>
        </div>

        <div className="section-label">Pressões (Bernoulli)</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">P₁ (referência)</span><span className="stat-val">{fmt(P1 / 1000, 1)} kPa</span></div>
          <div className="stat-row"><span className="stat-label">P₂ (garganta)</span><span className="stat-val purple">{fmt(P2 / 1000, 1)} kPa</span></div>
          <div className="stat-row"><span className="stat-label">Queda de pressão ΔP</span><span className="stat-val danger">{fmt(deltaP / 1000, 2)} kPa</span></div>
        </div>

        <div className="section-label">Equações</div>
        <div className="eq-block">
          <div className="eq-title">Equação da Continuidade</div>
          <span className="sym">A</span>₁·v₁ <span className="op">=</span> A₂·v₂
        </div>
        <div className="eq-block">
          <div className="eq-title">Equação de Bernoulli</div>
          P₁ + ½ρv₁² <span className="op">=</span> P₂ + ½ρv₂²
          <br /><span className="cmt">(mesma altura: h₁=h₂)</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ABA 2 — TANQUE FURADO (Teorema de Torricelli)
// ═══════════════════════════════════════════════════════════════════════════
function TorricelliTab() {
  const [h0, setH0] = useState(1.5);       // altura inicial do fluido (m)
  const [furoY, setFuroY] = useState(0.3); // altura do furo desde o fundo (m)
  const [Atanque, setAtanque] = useState(0.25); // m²
  const [Afuro, setAfuro] = useState(2);   // cm²
  const [rodando, setRodando] = useState(true);

  const nivelRef = useRef(h0);
  const [nivelDisp, setNivelDisp] = useState(h0);
  const stateRef = useRef({ furoY, Atanque, Afuro });
  useEffect(() => { stateRef.current = { furoY, Atanque, Afuro }; }, [furoY, Atanque, Afuro]);

  // Garante que o furo nunca fique acima do nível inicial escolhido
  useEffect(() => {
    const max = Math.max(0, h0 - 0.1);
    if (furoY > max) setFuroY(max);
  }, [h0]);

  useEffect(() => { nivelRef.current = h0; setNivelDisp(h0); setRodando(true); }, [h0, furoY, Atanque, Afuro]);

  const rafRef = useRef(null);
  const lastRef = useRef(null);
  useEffect(() => {
    if (!rodando) { lastRef.current = null; return; }
    const step = (now) => {
      if (lastRef.current !== null) {
        const dt = Math.min((now - lastRef.current) / 1000, 0.05);
        const s = stateRef.current;
        const hEfetivo = Math.max(0, nivelRef.current - s.furoY);
        const v = Math.sqrt(2 * G * hEfetivo);
        const Qm3 = (s.Afuro / 10000) * v;
        // Com áreas realistas, esvaziar o tanque levaria minutos no tempo real —
        // aceleramos o "relógio" da simulação (TIME_SCALE) só para a visualização.
        // v e Q continuam fisicamente corretos para a altura atual.
        nivelRef.current = Math.max(s.furoY, nivelRef.current - (Qm3 / s.Atanque) * dt * TIME_SCALE);
        setNivelDisp(nivelRef.current);
      }
      lastRef.current = now;
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [rodando]);

  const hEfetivoDisp = Math.max(0, nivelDisp - furoY);
  const vEffluxDisp = Math.sqrt(2 * G * hEfetivoDisp);
  const QDisp = (Afuro / 10000) * vEffluxDisp;
  const alcance = Math.sqrt(Math.max(0, 2 * furoY / G)) * vEffluxDisp; // alcance horizontal do jato até o chão

  const H0eff = Math.max(0, h0 - furoY);
  const tempoDrenagemTotal = H0eff > 0
    ? (2 * Math.sqrt(H0eff) * Atanque) / ((Afuro / 10000) * Math.sqrt(2 * G))
    : 0;

  const canvasRef = useRef(null);
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    let raf;
    const ctx = cv.getContext('2d');
    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const W = cv.clientWidth, H = cv.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      const tankLeft = W * 0.12, tankRight = W * 0.42;
      const tankFloorY = H * 0.85;
      const pxPerM = (tankFloorY - H * 0.1) / Math.max(h0, 1.5);

      const toY = (heightM) => tankFloorY - heightM * pxPerM;

      // Parede do tanque
      ctx.strokeStyle = 'rgba(239,68,68,0.5)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(tankLeft, H * 0.08);
      ctx.lineTo(tankLeft, tankFloorY);
      ctx.lineTo(tankRight, tankFloorY);
      const furoPxY = toY(stateRef.current.furoY);
      ctx.lineTo(tankRight, furoPxY + 6);
      ctx.moveTo(tankRight, furoPxY - 6);
      ctx.lineTo(tankRight, H * 0.08);
      ctx.stroke();

      // Fluido no tanque
      const nivelPxY = toY(nivelRef.current);
      const gradFluido = ctx.createLinearGradient(0, nivelPxY, 0, tankFloorY);
      gradFluido.addColorStop(0, 'rgba(56,189,248,0.3)');
      gradFluido.addColorStop(1, 'rgba(56,189,248,0.5)');
      ctx.fillStyle = gradFluido;
      ctx.fillRect(tankLeft, nivelPxY, tankRight - tankLeft, tankFloorY - nivelPxY);
      ctx.strokeStyle = 'rgba(56,189,248,0.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(tankLeft, nivelPxY); ctx.lineTo(tankRight, nivelPxY); ctx.stroke();

      // Régua de altura
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = "9px 'JetBrains Mono', monospace";
      ctx.textAlign = 'right';
      ctx.fillText(`h=${fmt(nivelRef.current, 2)}m`, tankLeft - 8, nivelPxY + 4);
      ctx.fillStyle = 'rgba(239,68,68,0.8)';
      ctx.fillText(`furo`, tankLeft - 8, furoPxY + 4);

      // Jato saindo do furo (trajetória parabólica)
      const s = stateRef.current;
      const hEf = Math.max(0, nivelRef.current - s.furoY);
      const vJato = Math.sqrt(2 * G * hEf);
      if (vJato > 0.05) {
        ctx.beginPath();
        const steps = 30;
        for (let i = 0; i <= steps; i++) {
          const t = (i / steps) * 0.6;
          const jx = tankRight + vJato * t * pxPerM * 0.5;
          const jy = furoPxY + 0.5 * G * t * t * pxPerM;
          if (jy > tankFloorY + 30) break;
          i === 0 ? ctx.moveTo(jx, jy) : ctx.lineTo(jx, jy);
        }
        ctx.strokeStyle = 'rgba(251,191,36,0.8)';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.textAlign = 'left';
      ctx.fillText(`v = ${fmt(vJato, 2)} m/s`, tankRight + 10, furoPxY - 8);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [h0]);

  return (
    <div className="content">
      <div className="sidebar-l">
        <div className="section-label">Tanque</div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Nível inicial h₀</span><span className="ctrl-num">{fmt(h0, 2)} m</span></div>
          <input type="range" min="0.5" max="2" step="0.05" value={h0} onChange={e => setH0(+e.target.value)} />
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Altura do furo</span><span className="ctrl-num">{fmt(furoY, 2)} m</span></div>
          <input type="range" min="0" max={Math.max(0, h0 - 0.1)} step="0.05" value={furoY} onChange={e => setFuroY(+e.target.value)} />
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Área do tanque</span><span className="ctrl-num">{fmt(Atanque, 2)} m²</span></div>
          <input type="range" min="0.1" max="0.5" step="0.01" value={Atanque} onChange={e => setAtanque(+e.target.value)} />
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Área do furo</span><span className="ctrl-num">{fmt(Afuro, 1)} cm²</span></div>
          <input type="range" min="0.5" max="10" step="0.1" value={Afuro} onChange={e => setAfuro(+e.target.value)} />
        </div>

        <div className="btn-row">
          <button className="btn btn-primary" onClick={() => setRodando(true)}>▶ Abrir Furo</button>
          <button className="btn btn-secondary" onClick={() => setRodando(false)}>⏸ Pausar</button>
        </div>
        <div className="btn-row">
          <button className="btn btn-danger" onClick={() => { nivelRef.current = h0; setNivelDisp(h0); }}>↩ Encher de Novo</button>
        </div>
      </div>

      <div className="main-area">
        <div className="canvas-wrap"><canvas ref={canvasRef} /></div>
      </div>

      <div className="sidebar-r">
        <div className="section-label">Escoamento Atual</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">Altura efetiva (h−h_furo)</span><span className="stat-val accent">{fmt(hEfetivoDisp, 2)} m</span></div>
          <div className="stat-row"><span className="stat-label">Velocidade de saída v</span><span className="stat-val warm">{fmt(vEffluxDisp, 2)} m/s</span></div>
          <div className="stat-row"><span className="stat-label">Vazão Q</span><span className="stat-val cool">{fmt(QDisp * 1000, 2)} L/s</span></div>
          <div className="stat-row"><span className="stat-label">Alcance horizontal</span><span className="stat-val purple">{fmt(alcance, 2)} m</span></div>
        </div>

        <div className="section-label">Estimativa</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">Tempo real até esvaziar</span><span className="stat-val">{tempoDrenagemTotal > 90 ? `${fmt(tempoDrenagemTotal / 60, 1)} min` : `${fmt(tempoDrenagemTotal, 1)} s`}</span></div>
          <div className="stat-row"><span className="stat-label">Tempo nesta simulação</span><span className="stat-val warm">{fmt(tempoDrenagemTotal / TIME_SCALE, 1)} s</span></div>
        </div>
        <p style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>
          ⏱ Esta simulação roda {TIME_SCALE}× mais rápido que o tempo real, só para visualização —
          v e Q continuam fisicamente corretos a cada instante.
        </p>

        <div className="section-label">Equações</div>
        <div className="eq-block">
          <div className="eq-title">Teorema de Torricelli</div>
          <span className="sym">v</span> <span className="op">=</span> √(2·g·h)
          <br /><span className="cmt">h = altura do fluido acima do furo</span>
        </div>
        <div className="eq-block">
          <div className="eq-title">Vazão</div>
          <span className="sym">Q</span> <span className="op">=</span> A_furo · v
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ABA 3 — CÁLCULO & DERIVAÇÕES
// ═══════════════════════════════════════════════════════════════════════════
function CalcTab() {
  return (
    <div className="main-area" style={{ overflow: 'auto' }}>
      <div className="calc-page">

        <div className="calc-section">
          <div className="calc-h2">1. Equação da Continuidade</div>
          <p className="calc-p">
            Para um fluido incompressível em regime permanente, a massa que entra num tubo por unidade
            de tempo deve ser igual à massa que sai — não há acúmulo nem perda de matéria.
          </p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">ṁ₁ = ṁ₂  →  ρ·A₁·v₁ = ρ·A₂·v₂</span><span className="step-desc">conservação de massa</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq"><span className="hi-acc">A₁·v₁ = A₂·v₂</span></span><span className="step-desc">ρ constante (incompressível) cancela</span></div>
          </div>
          <p className="calc-p">Onde a seção é menor, a velocidade precisa ser maior para manter a mesma vazão Q=A·v.</p>
        </div>

        <div className="calc-section">
          <div className="calc-h2">2. Dedução da Equação de Bernoulli</div>
          <p className="calc-p">
            Aplicando o teorema trabalho-energia a um elemento de fluido que se move de um ponto 1 para um
            ponto 2 dentro do tubo, considerando o trabalho da pressão e da gravidade:
          </p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">W_pressão = P₁·A₁·dx₁ − P₂·A₂·dx₂ = (P₁−P₂)·dV</span><span className="step-desc">trabalho líquido da pressão</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq">W = ΔEc + ΔEp = ½ρdV(v₂²−v₁²) + ρdV·g(h₂−h₁)</span><span className="step-desc">teorema trabalho-energia</span></div>
            <div className="derivation-step"><span className="step-num">③</span><span className="step-eq"><span className="hi-acc">P₁ + ½ρv₁² + ρgh₁ = P₂ + ½ρv₂² + ρgh₂</span></span><span className="step-desc">equação de Bernoulli</span></div>
          </div>
          <p className="calc-p">
            É essencialmente a conservação de energia mecânica por unidade de volume, aplicada a um fluido
            em movimento sem viscosidade.
          </p>
        </div>

        <div className="calc-section">
          <div className="calc-h2">3. Efeito Venturi</div>
          <p className="calc-p">
            Numa tubulação horizontal (h₁=h₂), a equação de Bernoulli se reduz a:
          </p>
          <div className="big-eq">
            P₁ + ½ρv₁² <span className="op">=</span> P₂ + ½ρv₂²
          </div>
          <p className="calc-p">
            Pela continuidade, na garganta estreita v₂ &gt; v₁. Para a equação acima se manter válida,
            <strong> P₂ deve ser menor que P₁</strong> — onde o fluido é mais rápido, a pressão é menor.
            Esse é o princípio por trás de carburadores, spray de perfume, e a sustentação de asas de avião.
          </p>
        </div>

        <div className="calc-section">
          <div className="calc-h2">4. Teorema de Torricelli</div>
          <p className="calc-p">
            Aplicando Bernoulli entre a superfície livre do tanque (ponto 1) e o furo (ponto 2), com
            P₁=P₂=P_atm (ambos expostos à atmosfera) e v₁≈0 (a área do tanque é muito maior que a do furo):
          </p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">P_atm + 0 + ρ·g·h = P_atm + ½ρv² + 0</span><span className="step-desc">Bernoulli, referência no furo</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq">g·h = ½v²</span><span className="step-desc">cancelando P_atm e ρ</span></div>
            <div className="derivation-step"><span className="step-num">③</span><span className="step-eq"><span className="hi-acc">v = √(2gh)</span></span><span className="step-desc">velocidade de efluxo — igual à queda livre de altura h!</span></div>
          </div>
        </div>

        <div className="calc-section">
          <div className="calc-h2">5. Exemplo Numérico</div>
          <p className="calc-p">
            Um tanque tem água até h=1,2m acima de um furo de área 2cm². A área do tanque é 0,25m².
          </p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">v = √(2·9,8·1,2) = 4,85 m/s</span><span className="step-desc">velocidade de saída</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq">Q = 2×10⁻⁴·4,85 = 9,7×10⁻⁴ m³/s ≈ 0,97 L/s</span><span className="step-desc">vazão</span></div>
            <div className="derivation-step"><span className="step-num">③</span><span className="step-eq">t_esvaziar = 2√h·A_tanque/(A_furo·√(2g)) ≈ 154 s</span><span className="step-desc">tempo até o nível chegar ao furo</span></div>
          </div>
        </div>

      </div>
    </div>
  );
}
