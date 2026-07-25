// src/pages/ExperimentoHidrostatica.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FISICA2_BASE_STYLES } from '../styles/fisica2Theme';

const G = 9.8;
const fmt = (n, d = 2) => (typeof n === 'number' && isFinite(n) ? n.toFixed(d) : '—');

const STYLES = FISICA2_BASE_STYLES + `
.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  font-family: var(--mono);
}
`;

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════
export default function ExperimentoHidrostatica() {
  const [tab, setTab] = useState('sim');

  return (
    <>
      <style>{STYLES}</style>
      <div className="app">
        <header className="header">
          <div className="header-title">Hidrostática e Empuxo</div>
          <div className="header-sub">Física 2 · Fluidos</div>
          <span className="header-tag">E = ρ·g·V</span>
        </header>

        <nav className="tabs">
          {[
            ['sim', 'Simulação'],
            ['pascal', 'Prensa Hidráulica'],
            ['calc', 'Cálculo & Derivações'],
          ].map(([id, label]) => (
            <button key={id} className={`tab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </nav>

        {tab === 'sim' && <SimTab />}
        {tab === 'pascal' && <PascalTab />}
        {tab === 'calc' && <CalcTab />}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ABA 1 — SIMULAÇÃO (empuxo, flutuação e afundamento)
// ═══════════════════════════════════════════════════════════════════════════
function SimTab() {
  const [rhoObj, setRhoObj] = useState(600);
  const [rhoFluido, setRhoFluido] = useState(1000);
  const [volL, setVolL] = useState(8);
  const [rodando, setRodando] = useState(true);

  const Vm3 = volL / 1000;
  const peso = rhoObj * Vm3 * G;
  const empuxoMax = rhoFluido * Vm3 * G;
  const flutua = rhoObj < rhoFluido;
  const fracaoEquilibrio = Math.min(1, rhoObj / rhoFluido);

  const stateRef = useRef({ rhoObj, rhoFluido, Vm3 });
  useEffect(() => { stateRef.current = { rhoObj, rhoFluido, Vm3 }; }, [rhoObj, rhoFluido, Vm3]);

  // submersaoRef: fração do objeto submersa no fluido (0 a 1)
  const submersaoRef = useRef(0);
  const velRef = useRef(0);
  const [submersaoDisp, setSubmersaoDisp] = useState(0);
  const rafRef = useRef(null);
  const lastRef = useRef(null);

  useEffect(() => {
    if (!rodando) { lastRef.current = null; return; }
    const step = (now) => {
      if (lastRef.current !== null) {
        const dt = Math.min((now - lastRef.current) / 1000, 0.03);
        const s = stateRef.current;
        const empuxoAtual = s.rhoFluido * s.Vm3 * submersaoRef.current;
        const pesoAtual = s.rhoObj * s.Vm3;
        // Força relativa adimensional (peso-empuxo)/peso, escalada por uma
        // constante de "rigidez" K para a animação assentar suavemente —
        // não usamos G aqui pois submersão é uma fração (0-1), não uma distância física.
        const forcaRelativa = (pesoAtual - empuxoAtual) / pesoAtual;
        const K = 6;
        velRef.current += forcaRelativa * K * dt;
        velRef.current *= 0.9; // amortecimento — assenta no equilíbrio
        submersaoRef.current += velRef.current * dt;
        if (submersaoRef.current < 0) { submersaoRef.current = 0; velRef.current = 0; }
        if (submersaoRef.current > 1) { submersaoRef.current = 1; velRef.current = Math.min(0, velRef.current); }
        setSubmersaoDisp(submersaoRef.current);
      }
      lastRef.current = now;
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [rodando]);

  // Reinicia a queda quando os parâmetros mudam — e retoma a animação
  // automaticamente mesmo se estava pausada, sem precisar clicar em "Soltar".
  useEffect(() => {
    submersaoRef.current = 0;
    velRef.current = 0;
    setRodando(true);
  }, [rhoObj, rhoFluido, volL]);

  const empuxoAtualDisp = rhoFluido * G * Vm3 * submersaoDisp;
  const pressaoFundo = rhoFluido * G * 1.2; // pressão no fundo do recipiente (h≈1,2m)

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

      const contW = Math.min(W * 0.5, 320);
      const contLeft = W / 2 - contW / 2;
      const contRight = W / 2 + contW / 2;
      const fluidTopY = H * 0.22;
      const floorY = H * 0.88;

      // Recipiente
      ctx.strokeStyle = 'rgba(239,68,68,0.35)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(contLeft, H * 0.06);
      ctx.lineTo(contLeft, floorY);
      ctx.lineTo(contRight, floorY);
      ctx.lineTo(contRight, H * 0.06);
      ctx.stroke();

      // Fluido (gradiente com régua de profundidade)
      const gradFluido = ctx.createLinearGradient(0, fluidTopY, 0, floorY);
      gradFluido.addColorStop(0, 'rgba(56,189,248,0.28)');
      gradFluido.addColorStop(1, 'rgba(56,189,248,0.5)');
      ctx.fillStyle = gradFluido;
      ctx.fillRect(contLeft, fluidTopY, contW, floorY - fluidTopY);
      ctx.strokeStyle = 'rgba(56,189,248,0.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(contLeft, fluidTopY); ctx.lineTo(contRight, fluidTopY); ctx.stroke();

      // Régua de profundidade / pressão
      const s = stateRef.current;
      for (let i = 0; i <= 4; i++) {
        const y = fluidTopY + (i / 4) * (floorY - fluidTopY);
        const hFrac = i / 4;
        const hMeters = hFrac * 1.0;
        const pKPa = (s.rhoFluido * G * hMeters) / 1000;
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(contLeft, y); ctx.lineTo(contLeft - 8, y); ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.45)';
        ctx.font = "9px 'JetBrains Mono', monospace";
        ctx.textAlign = 'right';
        ctx.fillText(`${fmt(pKPa, 1)} kPa`, contLeft - 12, y + 3);
      }

      // Objeto (cubo)
      const objSize = 20 + Math.cbrt(s.Vm3 * 1000) * 12;
      const submersao = submersaoRef.current;
      const objBottomY = fluidTopY + submersao * objSize;
      const objTopY = objBottomY - objSize;
      const objX = W / 2 - objSize / 2;

      const corObj = rhoObj < rhoFluido ? '#FBBF24' : '#EF4444';
      const gradObj = ctx.createLinearGradient(0, objTopY, 0, objBottomY);
      gradObj.addColorStop(0, corObj + 'DD');
      gradObj.addColorStop(1, corObj + '88');
      ctx.fillStyle = gradObj;
      ctx.fillRect(objX, objTopY, objSize, objSize);
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(objX, objTopY, objSize, objSize);

      const centroX = W / 2, centroY = (objTopY + objBottomY) / 2;

      // Vetor peso (vermelho, para baixo)
      const pesoLen = Math.min(60, (rhoObj * s.Vm3 * G) * 0.8);
      ctx.beginPath();
      ctx.moveTo(centroX - 14, centroY);
      ctx.lineTo(centroX - 14, centroY + pesoLen);
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(centroX - 14, centroY + pesoLen);
      ctx.lineTo(centroX - 19, centroY + pesoLen - 8);
      ctx.lineTo(centroX - 9, centroY + pesoLen - 8);
      ctx.closePath();
      ctx.fillStyle = '#EF4444';
      ctx.fill();

      // Vetor empuxo (azul, para cima) — só se houver submersão
      if (submersao > 0.01) {
        const empLen = Math.min(60, (rhoFluido * G * s.Vm3 * submersao) * 0.8);
        ctx.beginPath();
        ctx.moveTo(centroX + 14, centroY);
        ctx.lineTo(centroX + 14, centroY - empLen);
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(centroX + 14, centroY - empLen);
        ctx.lineTo(centroX + 9, centroY - empLen + 8);
        ctx.lineTo(centroX + 19, centroY - empLen + 8);
        ctx.closePath();
        ctx.fillStyle = '#38BDF8';
        ctx.fill();
      }

      ctx.fillStyle = '#EF4444';
      ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.textAlign = 'center';
      ctx.fillText('P', centroX - 14, centroY + pesoLen + 14);
      if (submersao > 0.01) {
        ctx.fillStyle = '#38BDF8';
        ctx.fillText('E', centroX + 14, centroY - Math.min(60, (rhoFluido * G * s.Vm3 * submersao) * 0.8) - 8);
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [rhoObj, rhoFluido]);

  return (
    <div className="content">
      <div className="sidebar-l">
        <div className="section-label">Objeto</div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Densidade do objeto ρ_obj</span><span className="ctrl-num">{fmt(rhoObj, 0)} kg/m³</span></div>
          <input type="range" min="100" max="2000" step="10" value={rhoObj} onChange={e => setRhoObj(+e.target.value)} />
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Volume do objeto</span><span className="ctrl-num">{fmt(volL, 1)} L</span></div>
          <input type="range" min="1" max="20" step="0.5" value={volL} onChange={e => setVolL(+e.target.value)} />
        </div>

        <div className="section-label">Fluido</div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Densidade do fluido ρ_fluido</span><span className="ctrl-num">{fmt(rhoFluido, 0)} kg/m³</span></div>
          <input type="range" min="500" max="1500" step="10" value={rhoFluido} onChange={e => setRhoFluido(+e.target.value)} />
        </div>
        <p style={{ fontSize: 11, color: 'var(--muted)' }}>Água ≈ 1000 kg/m³ · Óleo ≈ 900 kg/m³ · Mercúrio ≈ 13600 kg/m³ (fora da escala)</p>

        <div className="btn-row">
          <button className="btn btn-primary" onClick={() => setRodando(true)}>▶ Soltar</button>
          <button className="btn btn-secondary" onClick={() => setRodando(false)}>⏸ Pausar</button>
        </div>

        <div className="section-label">Status</div>
        <div className="card">
          <span className="status-badge" style={{
            background: flutua ? 'rgba(56,189,248,0.15)' : 'rgba(239,68,68,0.15)',
            color: flutua ? '#38BDF8' : '#EF4444',
          }}>
            {flutua ? '🟦 FLUTUA' : '🟥 AFUNDA'}
          </span>
        </div>
      </div>

      <div className="main-area">
        <div className="canvas-wrap"><canvas ref={canvasRef} /></div>
      </div>

      <div className="sidebar-r">
        <div className="section-label">Forças</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">Peso P</span><span className="stat-val accent">{fmt(peso, 2)} N</span></div>
          <div className="stat-row"><span className="stat-label">Empuxo atual E</span><span className="stat-val cool">{fmt(empuxoAtualDisp, 2)} N</span></div>
          <div className="stat-row"><span className="stat-label">Empuxo máx. (submerso)</span><span className="stat-val cool">{fmt(empuxoMax, 2)} N</span></div>
          <div className="stat-row"><span className="stat-label">Fração submersa</span><span className="stat-val warm">{fmt(submersaoDisp * 100, 0)}%</span></div>
        </div>

        <div className="section-label">Equilíbrio Teórico</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">Densidade relativa ρ_obj/ρ_fluido</span><span className="stat-val purple">{fmt(rhoObj / rhoFluido, 3)}</span></div>
          <div className="stat-row"><span className="stat-label">Fração submersa no equilíbrio</span><span className="stat-val purple">{flutua ? `${fmt(fracaoEquilibrio * 100, 0)}%` : '100% (afunda)'}</span></div>
        </div>

        <div className="section-label">Equações</div>
        <div className="eq-block">
          <div className="eq-title">Princípio de Arquimedes</div>
          <span className="sym">E</span> <span className="op">=</span> ρ_fluido·g·V_submerso
        </div>
        <div className="eq-block">
          <div className="eq-title">Condição de Flutuação</div>
          ρ_obj <span className="op">&lt;</span> ρ_fluido <span className="op">→</span> flutua<br />
          <span className="cmt">fração submersa = ρ_obj / ρ_fluido</span>
        </div>
        <div className="eq-block">
          <div className="eq-title">Pressão Hidrostática</div>
          <span className="sym">P</span>(h) <span className="op">=</span> P₀ <span className="op">+</span> ρ_fluido·g·h
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ABA 2 — PRENSA HIDRÁULICA (Princípio de Pascal)
// ═══════════════════════════════════════════════════════════════════════════
function PascalTab() {
  const [A1, setA1] = useState(10);   // cm²
  const [A2, setA2] = useState(120);  // cm²
  const [F1, setF1] = useState(50);   // N
  const [d1, setD1] = useState(8);    // cm — deslocamento do pistão pequeno

  const A1m2 = A1 / 10000, A2m2 = A2 / 10000;
  const P = F1 / A1m2;               // Pa
  const F2 = P * A2m2;               // N
  const vantagemMecanica = A2 / A1;
  const d2 = d1 * (A1 / A2);         // cm — deslocamento do pistão grande

  const canvasRef = useRef(null);
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const W = cv.clientWidth, H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    const baseY = H * 0.78;
    const tubeH = 30;
    const cylBottomY = baseY - tubeH / 2; // "fundo" de cada cilindro = topo do tubo
    const c1X = W * 0.28, c1W = Math.max(28, Math.min(70, A1 * 1.4));
    const c2X = W * 0.68, c2W = Math.max(60, Math.min(180, A2 * 0.9));
    const cyl1Top = H * 0.2;
    const cyl2Top = H * 0.08;

    // Tubo conectando a base dos dois cilindros (borda a borda, não centro a centro)
    const tubeX1 = c1X - c1W / 2, tubeX2 = c2X + c2W / 2;
    ctx.fillStyle = 'rgba(56,189,248,0.35)';
    ctx.fillRect(tubeX1, cylBottomY, tubeX2 - tubeX1, tubeH);
    ctx.strokeStyle = 'rgba(239,68,68,0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(tubeX1, cylBottomY); ctx.lineTo(tubeX2, cylBottomY);
    ctx.moveTo(tubeX1, cylBottomY + tubeH); ctx.lineTo(tubeX2, cylBottomY + tubeH);
    ctx.stroke();

    // Cilindro 1 (pequeno) — paredes laterais, do topo até o tubo
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(c1X - c1W / 2, cyl1Top); ctx.lineTo(c1X - c1W / 2, cylBottomY);
    ctx.moveTo(c1X + c1W / 2, cyl1Top); ctx.lineTo(c1X + c1W / 2, cylBottomY);
    ctx.stroke();

    // Cilindro 2 (grande) — paredes laterais, do topo até o tubo
    ctx.beginPath();
    ctx.moveTo(c2X - c2W / 2, cyl2Top); ctx.lineTo(c2X - c2W / 2, cylBottomY);
    ctx.moveTo(c2X + c2W / 2, cyl2Top); ctx.lineTo(c2X + c2W / 2, cylBottomY);
    ctx.stroke();

    // Posição dos pistões — pistão 1 desce conforme d1 aumenta, pistão 2 sobe conforme d2 aumenta.
    // Ambos limitados para nunca ultrapassar o fundo do cilindro (junção com o tubo).
    const pxPerCm = 6;
    const nivel1Y = Math.min(cyl1Top + 22 + d1 * pxPerCm, cylBottomY - 6);
    const nivel2Y = Math.max(cylBottomY - 10 - d2 * pxPerCm, cyl2Top + 20);

    // Fluido dentro dos cilindros
    ctx.fillStyle = 'rgba(56,189,248,0.35)';
    ctx.fillRect(c1X - c1W / 2, nivel1Y, c1W, cylBottomY - nivel1Y);
    ctx.fillRect(c2X - c2W / 2, nivel2Y, c2W, cylBottomY - nivel2Y);

    // Pistão 1
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(c1X - c1W / 2 - 3, nivel1Y - 12, c1W + 6, 12);
    // Seta de força F1
    ctx.beginPath();
    ctx.moveTo(c1X, nivel1Y - 50);
    ctx.lineTo(c1X, nivel1Y - 14);
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(c1X, nivel1Y - 14);
    ctx.lineTo(c1X - 6, nivel1Y - 24);
    ctx.lineTo(c1X + 6, nivel1Y - 24);
    ctx.closePath();
    ctx.fillStyle = '#EF4444';
    ctx.fill();
    ctx.font = "bold 12px 'JetBrains Mono', monospace";
    ctx.textAlign = 'center';
    ctx.fillText(`F₁=${fmt(F1, 0)}N`, c1X, nivel1Y - 56);

    // Pistão 2
    ctx.fillStyle = '#38BDF8';
    ctx.fillRect(c2X - c2W / 2 - 3, nivel2Y - 12, c2W + 6, 12);
    // Seta de força F2 (para cima, resultado)
    ctx.beginPath();
    ctx.moveTo(c2X, nivel2Y - 14);
    ctx.lineTo(c2X, nivel2Y - 60);
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(c2X, nivel2Y - 60);
    ctx.lineTo(c2X - 7, nivel2Y - 48);
    ctx.lineTo(c2X + 7, nivel2Y - 48);
    ctx.closePath();
    ctx.fillStyle = '#38BDF8';
    ctx.fill();
    ctx.fillText(`F₂=${fmt(F2, 0)}N`, c2X, nivel2Y - 66);

    // Labels de área
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.fillText(`A₁=${fmt(A1, 0)}cm²`, c1X, cylBottomY + tubeH + 20);
    ctx.fillText(`A₂=${fmt(A2, 0)}cm²`, c2X, cylBottomY + tubeH + 20);
  }, [A1, A2, F1, d1]);

  return (
    <div className="content">
      <div className="sidebar-l">
        <div className="section-label">Pistão Pequeno</div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Área A₁</span><span className="ctrl-num">{fmt(A1, 0)} cm²</span></div>
          <input type="range" min="5" max="50" step="1" value={A1} onChange={e => setA1(+e.target.value)} />
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Força aplicada F₁</span><span className="ctrl-num">{fmt(F1, 0)} N</span></div>
          <input type="range" min="10" max="500" step="5" value={F1} onChange={e => setF1(+e.target.value)} />
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Deslocamento d₁</span><span className="ctrl-num">{fmt(d1, 1)} cm</span></div>
          <input type="range" min="1" max="15" step="0.5" value={d1} onChange={e => setD1(+e.target.value)} />
        </div>

        <div className="section-label">Pistão Grande</div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Área A₂</span><span className="ctrl-num">{fmt(A2, 0)} cm²</span></div>
          <input type="range" min="50" max="500" step="10" value={A2} onChange={e => setA2(+e.target.value)} />
        </div>
      </div>

      <div className="main-area">
        <div className="canvas-wrap"><canvas ref={canvasRef} /></div>
      </div>

      <div className="sidebar-r">
        <div className="section-label">Resultado</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">Pressão transmitida P</span><span className="stat-val accent">{fmt(P / 1000, 2)} kPa</span></div>
          <div className="stat-row"><span className="stat-label">Força de saída F₂</span><span className="stat-val cool">{fmt(F2, 1)} N</span></div>
          <div className="stat-row"><span className="stat-label">Vantagem mecânica</span><span className="stat-val warm">{fmt(vantagemMecanica, 2)}×</span></div>
          <div className="stat-row"><span className="stat-label">Deslocamento d₂</span><span className="stat-val purple">{fmt(d2, 2)} cm</span></div>
        </div>

        <div className="section-label">Conservação de Energia</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">Trabalho em 1 (F₁·d₁)</span><span className="stat-val">{fmt(F1 * d1 / 100, 2)} J</span></div>
          <div className="stat-row"><span className="stat-label">Trabalho em 2 (F₂·d₂)</span><span className="stat-val">{fmt(F2 * d2 / 100, 2)} J</span></div>
        </div>

        <div className="section-label">Equações</div>
        <div className="eq-block">
          <div className="eq-title">Princípio de Pascal</div>
          <span className="sym">P</span> <span className="op">=</span> F₁/A₁ <span className="op">=</span> F₂/A₂
        </div>
        <div className="eq-block">
          <div className="eq-title">Conservação de Volume</div>
          A₁·d₁ <span className="op">=</span> A₂·d₂
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
          <div className="calc-h2">1. Pressão Hidrostática</div>
          <p className="calc-p">
            Considere uma coluna de fluido de área A e altura h. O peso dessa coluna é sustentado pela
            diferença de pressão entre o topo e a base:
          </p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">P(h)·A − P₀·A = peso da coluna = ρ·g·h·A</span><span className="step-desc">equilíbrio de forças</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq"><span className="hi-acc">P(h) = P₀ + ρ·g·h</span></span><span className="step-desc">cancelando A</span></div>
          </div>
          <p className="calc-p">A pressão depende apenas da profundidade — não da forma do recipiente (paradoxo hidrostático).</p>
        </div>

        <div className="calc-section">
          <div className="calc-h2">2. Princípio de Pascal</div>
          <p className="calc-p">
            Um fluido incompressível transmite integralmente qualquer variação de pressão para todos os pontos.
            Numa prensa hidráulica com dois pistões de áreas A₁ e A₂:
          </p>
          <div className="big-eq">
            <span className="hi-acc">P</span> = F₁/A₁ = F₂/A₂ <span className="op">→</span> <span className="hi-warm">F₂ = F₁·(A₂/A₁)</span>
            <span className="cmt">   ← quanto maior A₂/A₁, maior a força de saída</span>
          </div>
          <p className="calc-p">
            Isso não viola a conservação de energia: o pistão maior se move proporcionalmente menos
            (A₁·d₁ = A₂·d₂), então o trabalho F₁·d₁ = F₂·d₂ é o mesmo dos dois lados.
          </p>
        </div>

        <div className="calc-section">
          <div className="calc-h2">3. Dedução do Princípio de Arquimedes</div>
          <p className="calc-p">
            Considere um cubo de aresta L totalmente submerso, com a face superior a uma profundidade h e a
            face inferior a h+L. A pressão em cada face gera uma força; as forças laterais se cancelam, mas
            as forças verticais não:
          </p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">F_baixo = P(h+L)·L² = (P₀+ρg(h+L))·L²</span><span className="step-desc">força para cima na face inferior</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq">F_cima = P(h)·L² = (P₀+ρgh)·L²</span><span className="step-desc">força para baixo na face superior</span></div>
            <div className="derivation-step"><span className="step-num">③</span><span className="step-eq">E = F_baixo − F_cima = ρ·g·L³ = ρ·g·V</span><span className="step-desc">resultante para cima — o empuxo</span></div>
          </div>
          <p className="calc-p">
            Note que o resultado <strong>não depende da profundidade</strong> h, apenas do volume submerso —
            e vale para qualquer forma de objeto, não só cubos (pode-se generalizar por integração de superfície).
          </p>
        </div>

        <div className="calc-section">
          <div className="calc-h2">4. Condição de Flutuação</div>
          <p className="calc-p">
            No equilíbrio (objeto parado), o empuxo iguala o peso. Se o objeto flutua parcialmente submerso
            com fração f = V_submerso/V_total:
          </p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">E = P  →  ρ_fluido·g·(f·V) = ρ_obj·g·V</span><span className="step-desc">equilíbrio</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq"><span className="hi-acc">f = ρ_obj / ρ_fluido</span></span><span className="step-desc">fração submersa no equilíbrio</span></div>
          </div>
          <p className="calc-p">
            Se ρ_obj &gt; ρ_fluido, não existe f≤1 que satisfaça a equação — o objeto afunda até o fundo do recipiente,
            onde a força normal do fundo completa o equilíbrio.
          </p>
        </div>

        <div className="calc-section">
          <div className="calc-h2">5. Exemplo Numérico</div>
          <p className="calc-p">
            Um bloco de madeira (ρ=600 kg/m³) de volume V=0,008 m³ (8L) flutua em água (ρ=1000 kg/m³).
          </p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">P = 600·9,8·0,008 = 47,04 N</span><span className="step-desc">peso do bloco</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq">f = 600/1000 = 0,6 → 60% submerso</span><span className="step-desc">fração submersa</span></div>
            <div className="derivation-step"><span className="step-num">③</span><span className="step-eq">E = 1000·9,8·(0,6·0,008) = 47,04 N</span><span className="step-desc">empuxo = peso ✓</span></div>
          </div>
        </div>

      </div>
    </div>
  );
}
