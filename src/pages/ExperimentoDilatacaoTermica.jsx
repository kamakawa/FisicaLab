// src/pages/ExperimentoDilatacaoTermica.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FISICA2_BASE_STYLES } from '../styles/fisica2Theme';

const fmt = (n, d = 2) => (typeof n === 'number' && isFinite(n) ? n.toFixed(d) : '—');

// α em /°C (coeficiente de dilatação linear)
const MATERIAIS = [
  { id: 'aluminio', label: 'Alumínio', alpha: 23e-6, cor: '#9CA3AF' },
  { id: 'latao', label: 'Latão', alpha: 19e-6, cor: '#FBBF24' },
  { id: 'cobre', label: 'Cobre', alpha: 17e-6, cor: '#F97316' },
  { id: 'aco', label: 'Aço', alpha: 12e-6, cor: '#38BDF8' },
  { id: 'vidro', label: 'Vidro', alpha: 9e-6, cor: '#00F5C4' },
];

const STYLES = FISICA2_BASE_STYLES + `
.pill-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 18px; }
.pill {
  font-family: var(--sans);
  font-size: 12px;
  font-weight: 600;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.2s;
}
.pill:hover { color: var(--text); }
.pill.on {
  border-color: var(--accent);
  color: var(--accent);
  background: rgba(239,68,68,0.1);
}
`;

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════
export default function ExperimentoDilatacaoTermica() {
  const [tab, setTab] = useState('sim');

  return (
    <>
      <style>{STYLES}</style>
      <div className="app">
        <header className="header">
          <div className="header-title">Dilatação Térmica</div>
          <div className="header-sub">Física 2 · Termodinâmica</div>
          <span className="header-tag">ΔL = L₀·α·ΔT</span>
        </header>

        <nav className="tabs">
          {[
            ['sim', 'Dilatação Linear'],
            ['bimetalica', 'Lâmina Bimetálica'],
            ['calc', 'Cálculo & Derivações'],
          ].map(([id, label]) => (
            <button key={id} className={`tab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </nav>

        {tab === 'sim' && <LinearTab />}
        {tab === 'bimetalica' && <BimetalicaTab />}
        {tab === 'calc' && <CalcTab />}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ABA 1 — DILATAÇÃO LINEAR (trilho)
// ═══════════════════════════════════════════════════════════════════════════
function LinearTab() {
  const [materialId, setMaterialId] = useState('aco');
  const [L0, setL0] = useState(20);      // m
  const [deltaT, setDeltaT] = useState(40); // °C

  const material = MATERIAIS.find(m => m.id === materialId);
  const deltaL = L0 * material.alpha * deltaT;
  const Lfinal = L0 + deltaL;
  const EXAGERO = 6000; // fator de exagero visual (a dilatação real é mm em dezenas de metros)

  const stateRef = useRef({ material, L0, deltaT, deltaL });
  useEffect(() => { stateRef.current = { material, L0, deltaT, deltaL }; }, [material, L0, deltaT, deltaL]);

  const easedWRef = useRef(0); // largura extra exibida (px) — suaviza até o alvo, dando a sensação de dilatar de verdade
  const tRef = useRef(0);      // fase da animação de tremulação de calor / brilho de frio

  const canvasRef = useRef(null);
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    let raf;
    let last = null;
    const ctx = cv.getContext('2d');
    const draw = (now) => {
      const dt = last !== null ? Math.min((now - last) / 1000, 0.05) : 0.016;
      last = now;
      tRef.current += dt;

      const dpr = window.devicePixelRatio || 1;
      const W = cv.clientWidth, H = cv.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      const s = stateRef.current;
      const railY = H * 0.5;
      const startX = W * 0.1;
      const baseW = W * 0.7;
      const targetExagW = Math.max(-baseW * 0.4, Math.min(W * 0.18, (s.deltaL / s.L0) * EXAGERO * (baseW / 10)));

      // Suaviza a transição até o alvo — a barra "cresce"/"encolhe" visivelmente em vez de saltar
      easedWRef.current += (targetExagW - easedWRef.current) * Math.min(1, dt * 2.2);
      const exagW = easedWRef.current;
      const totalW = Math.max(baseW * 0.5, baseW + exagW);

      // Dormentes (suportes fixos)
      for (let i = 0; i < 10; i++) {
        const x = startX + (i / 9) * (baseW + 40);
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(x - 6, railY + 18, 12, 20);
      }

      // Trilho original (contorno tracejado)
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 5]);
      ctx.beginPath(); ctx.moveTo(startX, railY - 20); ctx.lineTo(startX + baseW, railY - 20); ctx.stroke();
      ctx.setLineDash([]);

      // Tremulação de calor (aquecendo) ou brilho frio (esfriando), acima da barra
      const intensidade = Math.min(1, Math.abs(s.deltaT) / 80);
      if (intensidade > 0.02) {
        const corEfeito = s.deltaT > 0 ? '249,115,22' : '56,189,248';
        ctx.strokeStyle = `rgba(${corEfeito},${0.22 * intensidade})`;
        ctx.lineWidth = 1.5;
        for (let linha = 0; linha < 3; linha++) {
          ctx.beginPath();
          for (let x = 0; x <= totalW; x += 8) {
            const wob = Math.sin(x * 0.05 + tRef.current * (s.deltaT > 0 ? 4 : 1.5) + linha * 2) * 3 * intensidade;
            const y = railY - 26 - linha * 9 + wob;
            x === 0 ? ctx.moveTo(startX + x, y) : ctx.lineTo(startX + x, y);
          }
          ctx.stroke();
        }
      }

      // Trilho dilatado/contraído (exagerado visualmente, nunca some da tela), com brilho pulsante
      const pulso = 0.85 + 0.15 * Math.sin(tRef.current * 3);
      const grad = ctx.createLinearGradient(startX, 0, startX + totalW, 0);
      grad.addColorStop(0, s.material.cor);
      grad.addColorStop(1, s.material.cor + 'CC');
      ctx.fillStyle = grad;
      ctx.globalAlpha = pulso;
      ctx.fillRect(startX, railY - 8, totalW, 16);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(startX, railY - 8, totalW, 16);

      // Seta indicando o crescimento (baseada no valor já suavizado)
      if (Math.abs(exagW) > 2) {
        const arrowX = startX + baseW;
        ctx.beginPath();
        ctx.moveTo(arrowX, railY - 30);
        ctx.lineTo(arrowX + exagW, railY - 30);
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 2;
        ctx.stroke();
        const dir = exagW >= 0 ? 1 : -1;
        ctx.beginPath();
        ctx.moveTo(arrowX + exagW, railY - 30);
        ctx.lineTo(arrowX + exagW - dir * 7, railY - 34);
        ctx.lineTo(arrowX + exagW - dir * 7, railY - 26);
        ctx.closePath();
        ctx.fillStyle = '#EF4444';
        ctx.fill();
        ctx.font = "bold 11px 'JetBrains Mono', monospace";
        ctx.textAlign = 'left';
        ctx.fillText(`ΔL = ${fmt(s.deltaL * 1000, 2)} mm`, arrowX + 4, railY - 40);
      }

      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.textAlign = 'center';
      ctx.fillText(`(exibido com exagero de ${EXAGERO}× para visualização)`, W / 2, H * 0.85);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="content">
      <div className="sidebar-l">
        <div className="section-label">Material do Trilho</div>
        <div className="pill-row">
          {MATERIAIS.map(m => (
            <button key={m.id} className={`pill ${materialId === m.id ? 'on' : ''}`} onClick={() => setMaterialId(m.id)}>{m.label}</button>
          ))}
        </div>

        <div className="section-label">Parâmetros</div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Comprimento inicial L₀</span><span className="ctrl-num">{fmt(L0, 1)} m</span></div>
          <input type="range" min="1" max="50" step="1" value={L0} onChange={e => setL0(+e.target.value)} />
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Variação de temperatura ΔT</span><span className="ctrl-num">{fmt(deltaT, 0)}°C</span></div>
          <input type="range" min="-30" max="80" step="1" value={deltaT} onChange={e => setDeltaT(+e.target.value)} />
        </div>
        <p style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>
          É por isso que trilhos de trem e pontes têm juntas de dilatação — pequenos espaços vazios que
          absorvem essa variação, evitando que a estrutura empene ou trinque.
        </p>
      </div>

      <div className="main-area">
        <div className="canvas-wrap"><canvas ref={canvasRef} /></div>
      </div>

      <div className="sidebar-r">
        <div className="section-label">Resultado</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">Coeficiente α</span><span className="stat-val accent">{fmt(material.alpha * 1e6, 1)}×10⁻⁶ /°C</span></div>
          <div className="stat-row"><span className="stat-label">Comprimento inicial L₀</span><span className="stat-val">{fmt(L0, 2)} m</span></div>
          <div className="stat-row"><span className="stat-label">Variação ΔL</span><span className="stat-val warm">{fmt(deltaL * 1000, 2)} mm</span></div>
          <div className="stat-row"><span className="stat-label">Comprimento final</span><span className="stat-val cool">{fmt(Lfinal, 4)} m</span></div>
        </div>

        <div className="section-label">Dilatação Superficial e Volumétrica</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">β = 2α</span><span className="stat-val purple">{fmt(2 * material.alpha * 1e6, 1)}×10⁻⁶ /°C</span></div>
          <div className="stat-row"><span className="stat-label">γ = 3α</span><span className="stat-val purple">{fmt(3 * material.alpha * 1e6, 1)}×10⁻⁶ /°C</span></div>
        </div>

        <div className="section-label">Equações</div>
        <div className="eq-block">
          <div className="eq-title">Dilatação Linear</div>
          Δ<span className="sym">L</span> <span className="op">=</span> L₀·α·ΔT
        </div>
        <div className="eq-block">
          <div className="eq-title">Superficial / Volumétrica</div>
          Δ<span className="sym">A</span> <span className="op">=</span> A₀·2α·ΔT &nbsp;·&nbsp; Δ<span className="sym">V</span> <span className="op">=</span> V₀·3α·ΔT
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ABA 2 — LÂMINA BIMETÁLICA
// ═══════════════════════════════════════════════════════════════════════════
function BimetalicaTab() {
  const [mat1Id, setMat1Id] = useState('latao');
  const [mat2Id, setMat2Id] = useState('aco');
  const [comprimento, setComprimento] = useState(10); // cm
  const [deltaT, setDeltaT] = useState(50); // °C, relativo à temperatura de fabricação (reta)

  const mat1 = MATERIAIS.find(m => m.id === mat1Id); // camada de cima
  const mat2 = MATERIAIS.find(m => m.id === mat2Id); // camada de baixo
  const deltaAlpha = mat1.alpha - mat2.alpha;
  // Curvatura aproximada (proporcional a Δα·ΔT·L) — simplificação didática, não a
  // fórmula de engenharia completa (que também depende da espessura e módulo de Young).
  // Constante calibrada para que a faixa de sliders produza uma curva bem visível na tela.
  const curvaturaFator = deltaAlpha * deltaT * comprimento * 17000;

  const stateRef = useRef({ mat1, mat2, curvaturaFator });
  useEffect(() => { stateRef.current = { mat1, mat2, curvaturaFator }; }, [mat1, mat2, curvaturaFator]);

  const easedBendRef = useRef(0); // curvatura exibida — suaviza até o alvo em vez de saltar
  const tRef = useRef(0);

  const canvasRef = useRef(null);
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    let raf;
    let last = null;
    const ctx = cv.getContext('2d');
    const draw = (now) => {
      const dt = last !== null ? Math.min((now - last) / 1000, 0.05) : 0.016;
      last = now;
      tRef.current += dt;

      const dpr = window.devicePixelRatio || 1;
      const W = cv.clientWidth, H = cv.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      const s = stateRef.current;
      const baseX = W * 0.15, baseY = H * 0.2;
      const stripLen = W * 0.6;
      const thickness = 14;
      const targetBend = Math.max(-140, Math.min(140, s.curvaturaFator));

      easedBendRef.current += (targetBend - easedBendRef.current) * Math.min(1, dt * 2.2);
      const bend = easedBendRef.current;

      // Suporte fixo
      ctx.fillStyle = 'rgba(239,68,68,0.4)';
      ctx.fillRect(baseX - 14, baseY - 30, 14, 60);

      // Curva da lâmina (Bezier — controlPoint desloca conforme a curvatura)
      const endX = baseX + stripLen;
      const endY = baseY + bend;
      const ctrlX = baseX + stripLen * 0.5;
      const ctrlY = baseY + bend * 0.3;

      const pulso = 0.85 + 0.15 * Math.sin(tRef.current * 3);
      const drawLayer = (offset, color) => {
        ctx.beginPath();
        ctx.moveTo(baseX, baseY + offset);
        ctx.quadraticCurveTo(ctrlX, ctrlY + offset, endX, endY + offset);
        ctx.strokeStyle = color;
        ctx.lineWidth = thickness;
        ctx.lineCap = 'round';
        ctx.globalAlpha = pulso;
        ctx.stroke();
        ctx.globalAlpha = 1;
      };

      drawLayer(-thickness / 2, s.mat2.cor);
      drawLayer(thickness / 2, s.mat1.cor);

      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = "11px 'JetBrains Mono', monospace";
      ctx.textAlign = 'left';
      ctx.fillText(`${s.mat1.label} (cima)`, baseX, baseY - 40);
      ctx.fillText(`${s.mat2.label} (baixo)`, baseX, baseY - 24);

      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.fillText('curvatura ilustrativa (simplificação didática)', baseX, H * 0.85);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="content">
      <div className="sidebar-l">
        <div className="section-label">Camada de Cima</div>
        <div className="pill-row">
          {MATERIAIS.map(m => (
            <button key={m.id} className={`pill ${mat1Id === m.id ? 'on' : ''}`} onClick={() => setMat1Id(m.id)}>{m.label}</button>
          ))}
        </div>
        <div className="section-label">Camada de Baixo</div>
        <div className="pill-row">
          {MATERIAIS.map(m => (
            <button key={m.id} className={`pill ${mat2Id === m.id ? 'on' : ''}`} onClick={() => setMat2Id(m.id)}>{m.label}</button>
          ))}
        </div>

        <div className="section-label">Parâmetros</div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Comprimento da lâmina</span><span className="ctrl-num">{fmt(comprimento, 0)} cm</span></div>
          <input type="range" min="5" max="20" step="0.5" value={comprimento} onChange={e => setComprimento(+e.target.value)} />
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">ΔT (relativo à fabricação)</span><span className="ctrl-num">{fmt(deltaT, 0)}°C</span></div>
          <input type="range" min="-60" max="60" step="2" value={deltaT} onChange={e => setDeltaT(+e.target.value)} />
        </div>
        <p style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>
          A lâmina se curva para o lado do metal com <strong>menor</strong> α, pois o de maior α se
          expande mais e "sobra" comprimento no lado de fora da curva. É assim que funcionam termostatos
          mecânicos e disjuntores térmicos.
        </p>
      </div>

      <div className="main-area">
        <div className="canvas-wrap"><canvas ref={canvasRef} /></div>
      </div>

      <div className="sidebar-r">
        <div className="section-label">Coeficientes</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">α ({mat1.label})</span><span className="stat-val accent">{fmt(mat1.alpha * 1e6, 1)}×10⁻⁶ /°C</span></div>
          <div className="stat-row"><span className="stat-label">α ({mat2.label})</span><span className="stat-val cool">{fmt(mat2.alpha * 1e6, 1)}×10⁻⁶ /°C</span></div>
          <div className="stat-row"><span className="stat-label">Δα</span><span className="stat-val warm">{fmt(deltaAlpha * 1e6, 1)}×10⁻⁶ /°C</span></div>
        </div>

        <div className="section-label">Comportamento</div>
        <div className="card">
          <div className="stat-row">
            <span className="stat-label">Direção da curvatura</span>
            <span className="stat-val purple">
              {Math.abs(deltaAlpha) < 1e-8 ? 'sem curvatura (α iguais)' : curvaturaFator > 0 ? `para ${mat2.label} (baixo)` : `para ${mat1.label} (cima)`}
            </span>
          </div>
        </div>

        <div className="section-label">Equação</div>
        <div className="eq-block">
          <div className="eq-title">Curvatura (aproximação)</div>
          curvatura <span className="op">∝</span> Δα · ΔT · L / espessura
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
          <div className="calc-h2">1. Dilatação Linear</div>
          <p className="calc-p">
            Experimentalmente, observa-se que a variação de comprimento de um sólido é proporcional ao
            comprimento inicial e à variação de temperatura, para variações não muito grandes:
          </p>
          <div className="big-eq">
            <span className="hi-acc">ΔL = L₀·α·ΔT</span>
            <span className="cmt">   ← α = coeficiente de dilatação linear, característico do material (1/°C)</span>
          </div>
          <p className="calc-p">
            Assim, o comprimento final é L = L₀(1 + αΔT). Materiais diferentes têm α diferentes porque a
            intensidade das vibrações atômicas (e o quanto essas vibrações afastam os átomos em média) varia
            conforme a estrutura cristalina e o tipo de ligação química.
          </p>
        </div>

        <div className="calc-section">
          <div className="calc-h2">2. Dilatação Superficial e Volumétrica</div>
          <p className="calc-p">
            Para um objeto que se dilata igualmente em todas as direções, cada dimensão (comprimento,
            largura, altura) sofre a mesma dilatação linear. Para uma área A=L²:
          </p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">A = L² = [L₀(1+αΔT)]² = L₀²(1+2αΔT+α²ΔT²)</span><span className="step-desc">expandindo o quadrado</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq">A ≈ L₀²(1+2αΔT) = A₀(1+βΔT)</span><span className="step-desc">α²ΔT² é desprezível (α~10⁻⁵)</span></div>
            <div className="derivation-step"><span className="step-num">③</span><span className="step-eq"><span className="hi-acc">β = 2α</span></span><span className="step-desc">coeficiente de dilatação superficial</span></div>
          </div>
          <p className="calc-p">Repetindo o raciocínio para um volume V=L³, obtemos de forma análoga:</p>
          <div className="big-eq">
            <span className="hi-acc">γ = 3α</span>
            <span className="cmt">   ← coeficiente de dilatação volumétrica</span>
          </div>
        </div>

        <div className="calc-section">
          <div className="calc-h2">3. Por que a Lâmina Bimetálica se Curva</div>
          <p className="calc-p">
            Duas tiras de metais diferentes (com α₁≠α₂) são soldadas/rebitadas ao longo de todo o
            comprimento, de modo que ambas são forçadas a ter o mesmo comprimento no ponto de contato.
          </p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">Se aquecidas livremente: L₁'=L₀(1+α₁ΔT), L₂'=L₀(1+α₂ΔT)</span><span className="step-desc">dilatações livres seriam diferentes</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq">Como estão soldadas, a tira de maior α é comprimida e a de menor α é esticada</span><span className="step-desc">tensão interna resultante</span></div>
            <div className="derivation-step"><span className="step-num">③</span><span className="step-eq">O conjunto se curva, com o metal de maior α ficando na face externa (convexa)</span><span className="step-desc">só assim ele "cabe" com o comprimento extra</span></div>
          </div>
          <p className="calc-p">
            Esse efeito é usado em termostatos mecânicos: a curvatura fecha ou abre um contato elétrico
            conforme a temperatura muda.
          </p>
        </div>

        <div className="calc-section">
          <div className="calc-h2">4. Dilatação Anômala da Água</div>
          <p className="calc-p">
            A água é uma exceção notável: entre 0°C e 4°C, ela <strong>se contrai</strong> ao ser aquecida
            (em vez de se dilatar), atingindo densidade máxima em 4°C, e só passa a se dilatar normalmente
            acima disso. É por isso que o gelo (menos denso) flutua na água líquida, e que lagos congelam de
            cima para baixo — permitindo que a vida aquática sobreviva sob o gelo no inverno.
          </p>
        </div>

        <div className="calc-section">
          <div className="calc-h2">5. Exemplo Numérico</div>
          <p className="calc-p">
            Um trilho de aço (α=12×10⁻⁶/°C) tem 30m de comprimento a 10°C. Qual seu comprimento a 45°C?
          </p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">ΔT = 45−10 = 35°C</span><span className="step-desc">variação de temperatura</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq">ΔL = 30·12×10⁻⁶·35 = 0,0126 m = 12,6 mm</span><span className="step-desc">dilatação</span></div>
            <div className="derivation-step"><span className="step-num">③</span><span className="step-eq">L = 30 + 0,0126 = 30,0126 m</span><span className="step-desc">comprimento final</span></div>
          </div>
        </div>

      </div>
    </div>
  );
}
