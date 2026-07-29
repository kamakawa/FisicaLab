// src/pages/ExperimentoDiagramaMinkowski.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FISICA3_BASE_STYLES, RELATIVIDADE } from '../styles/fisica3Theme';
import PainelExplicativo from '../components/PainelExplicativo';

const { C } = RELATIVIDADE;
const fmt = (n, d = 2) => (typeof n === 'number' && isFinite(n) ? n.toFixed(d) : '—');
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const gammaOf = (beta) => 1 / Math.sqrt(1 - beta * beta);

const STYLES = FISICA3_BASE_STYLES + `
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
  background: rgba(168,85,247,0.1);
}
`;

export default function ExperimentoDiagramaMinkowski() {
  const [tab, setTab] = useState('minkowski');
  return (
    <>
      <style>{STYLES}</style>
      <div className="app">
        <header className="header">
          <div className="header-title">Diagrama de Minkowski e Simultaneidade</div>
          <div className="header-sub">Física 3 · Relatividade Especial</div>
          <span className="header-tag">ct' = γ(ct − βx)</span>
        </header>
        <nav className="tabs">
          {[['minkowski', 'Diagrama de Minkowski'], ['trem', 'Trem de Einstein'], ['calc', 'Cálculo & Derivações']].map(([id, label]) => (
            <button key={id} className={`tab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>{label}</button>
          ))}
        </nav>
        {tab === 'minkowski' && <MinkowskiTab />}
        {tab === 'trem' && <TremTab />}
        {tab === 'calc' && <CalcTab />}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ABA 1 — DIAGRAMA DE MINKOWSKI (unidades naturais, c=1)
// ═══════════════════════════════════════════════════════════════════════════
function lorentz(x, ct, beta, gamma) {
  return { x: gamma * (x - beta * ct), ct: gamma * (ct - beta * x) };
}

function MinkowskiTab() {
  const [beta, setBeta] = useState(0.6);
  const [xA, setXA] = useState(2);
  const [ctA, setCtA] = useState(1);
  const [mostrarB, setMostrarB] = useState(true);
  const [xB, setXB] = useState(-1.5);
  const [ctB, setCtB] = useState(1);
  const [mostrarHiperboles, setMostrarHiperboles] = useState(false);

  const gamma = gammaOf(clamp(Math.abs(beta), 0, 0.995));
  const A = { x: xA, ct: ctA };
  const B = { x: xB, ct: ctB };
  const Al = lorentz(A.x, A.ct, beta, gamma);
  const Bl = lorentz(B.x, B.ct, beta, gamma);

  const s2AB = Math.pow(ctA - ctB, 2) - Math.pow(xA - xB, 2);
  const tipoAB = s2AB > 1e-6 ? 'temporal (causal)' : s2AB < -1e-6 ? 'espacial (não-causal)' : 'luminoide';

  const situacaoAtual = `Com β=${fmt(beta, 3)} (γ=${fmt(gamma, 3)}), o evento A em (x=${fmt(xA)}, ct=${fmt(ctA)}) tem coordenadas (x'=${fmt(Al.x)}, ct'=${fmt(Al.ct)}) no referencial S'.${mostrarB ? ` A separação entre A e B é do tipo ${tipoAB}.` : ''}`;

  const perguntasAssistente = [
    {
      id: 'diagrama',
      pergunta: 'O que é um diagrama de Minkowski?',
      resposta: 'É um gráfico com posição (x) no eixo horizontal e tempo×c (ct) no eixo vertical — cada ponto é um "evento" (um lugar e um instante). Retas inclinadas a 45° representam a trajetória da luz (o cone de luz).',
    },
    {
      id: 'eixosS',
      pergunta: "O que são os eixos x' e ct' (roxos)?",
      resposta: `São os eixos do referencial S' — um observador se movendo a β=${fmt(beta, 3)}c em relação a S. Eles aparecem inclinados (não perpendiculares na tela) porque S' está em movimento; o ângulo de inclinação cresce com β.`,
    },
    {
      id: 'simultaneidade',
      pergunta: 'O que são as retas tracejadas?',
      resposta: 'São as retas de simultaneidade do evento A: a branca (horizontal) mostra tudo que é simultâneo a A em S; a roxa (inclinada, paralela ao eixo x") mostra o que é simultâneo a A em S\'. Elas são diferentes retas — por isso simultaneidade depende do referencial.',
    },
    {
      id: 'intervalo',
      pergunta: 'O que é o intervalo s²?',
      resposta: 's²=(Δct)²−(Δx)² é o intervalo espaço-temporal entre dois eventos — um número que não muda ao trocar de referencial. Se s²>0, a separação é temporal (causal); se s²<0, é espacial (sem ordem causal definida); se s²=0, é luminoide (conectados pela luz).',
    },
    {
      id: 'cone',
      pergunta: 'O que é o cone de luz (linhas amarelas)?',
      resposta: 'São as trajetórias possíveis de um raio de luz partindo da origem — a velocidade máxima permitida. Nenhum evento causalmente ligado à origem pode estar fora desse cone.',
    },
  ];

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

    const cx = W / 2, cy = H / 2;
    const escala = Math.min(W, H) / 9;
    const toXY = (p) => ({ x: cx + p.x * escala, y: cy - p.ct * escala });
    const limite = Math.max(W, H) / escala;

    // grade de fundo
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let i = -8; i <= 8; i++) {
      const p1 = toXY({ x: i, ct: -limite }), p2 = toXY({ x: i, ct: limite });
      ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
      const q1 = toXY({ x: -limite, ct: i }), q2 = toXY({ x: limite, ct: i });
      ctx.beginPath(); ctx.moveTo(q1.x, q1.y); ctx.lineTo(q2.x, q2.y); ctx.stroke();
    }

    // eixos originais (x, ct) do referencial S
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1.5;
    let p1 = toXY({ x: -limite, ct: 0 }), p2 = toXY({ x: limite, ct: 0 });
    ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
    p1 = toXY({ x: 0, ct: -limite }); p2 = toXY({ x: 0, ct: limite });
    ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = "12px 'JetBrains Mono', monospace";
    ctx.fillText('x', toXY({ x: limite * 0.96, ct: 0 }).x - 14, toXY({ x: limite * 0.96, ct: 0 }).y - 8);
    ctx.fillText('ct', toXY({ x: 0, ct: limite * 0.96 }).x + 8, toXY({ x: 0, ct: limite * 0.96 }).y + 4);

    // cone de luz
    ctx.strokeStyle = 'rgba(251,191,36,0.55)';
    ctx.setLineDash([6, 5]);
    ctx.lineWidth = 1.5;
    p1 = toXY({ x: -limite, ct: -limite }); p2 = toXY({ x: limite, ct: limite });
    ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
    p1 = toXY({ x: -limite, ct: limite }); p2 = toXY({ x: limite, ct: -limite });
    ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
    ctx.setLineDash([]);

    // eixos do referencial S' (boosted), tilt simétrico ao redor do cone de luz
    ctx.strokeStyle = '#A855F7';
    ctx.lineWidth = 2;
    p1 = toXY({ x: -limite, ct: -limite * beta }); p2 = toXY({ x: limite, ct: limite * beta });
    ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
    p1 = toXY({ x: -limite * beta, ct: -limite }); p2 = toXY({ x: limite * beta, ct: limite });
    ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
    ctx.fillStyle = '#C084FC';
    ctx.fillText("x'", toXY({ x: limite * 0.9, ct: limite * 0.9 * beta }).x, toXY({ x: limite * 0.9, ct: limite * 0.9 * beta }).y - 10);
    ctx.fillText("ct'", toXY({ x: limite * 0.9 * beta, ct: limite * 0.9 }).x + 10, toXY({ x: limite * 0.9 * beta, ct: limite * 0.9 }).y);

    // hipérboles de calibração (opcional)
    if (mostrarHiperboles) {
      ctx.strokeStyle = 'rgba(192,132,252,0.4)';
      ctx.setLineDash([2, 4]);
      ctx.lineWidth = 1;
      [1, 2].forEach(k => {
        // hipérbole espacial x²-ct²=k² (calibra eixos x/x')
        ctx.beginPath();
        for (let u = -2; u <= 2; u += 0.05) {
          const pt = toXY({ x: k * Math.cosh(u), ct: k * Math.sinh(u) });
          u === -2 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
        ctx.beginPath();
        for (let u = -2; u <= 2; u += 0.05) {
          const pt = toXY({ x: -k * Math.cosh(u), ct: k * Math.sinh(u) });
          u === -2 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
        // hipérbole temporal ct²-x²=k² (calibra eixos ct/ct')
        ctx.beginPath();
        for (let u = -2; u <= 2; u += 0.05) {
          const pt = toXY({ x: k * Math.sinh(u), ct: k * Math.cosh(u) });
          u === -2 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
      });
      ctx.setLineDash([]);
    }

    // linhas de simultaneidade pelo evento A: horizontal (S) e paralela a x' (S')
    const pA = toXY(A);
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = 1.3;
    p1 = toXY({ x: -limite, ct: ctA }); p2 = toXY({ x: limite, ct: ctA });
    ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();

    ctx.strokeStyle = 'rgba(192,132,252,0.75)';
    p1 = toXY({ x: -limite, ct: beta * (-limite - xA) + ctA });
    p2 = toXY({ x: limite, ct: beta * (limite - xA) + ctA });
    ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
    ctx.setLineDash([]);

    // evento A
    ctx.beginPath();
    ctx.arc(pA.x, pA.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#FBBF24';
    ctx.shadowBlur = 10; ctx.shadowColor = '#FBBF24';
    ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = '#FBBF24';
    ctx.fillText('A', pA.x + 10, pA.y - 8);

    // evento B (opcional)
    if (mostrarB) {
      const pB = toXY(B);
      ctx.beginPath();
      ctx.arc(pB.x, pB.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#38BDF8';
      ctx.shadowBlur = 10; ctx.shadowColor = '#38BDF8';
      ctx.fill(); ctx.shadowBlur = 0;
      ctx.fillStyle = '#38BDF8';
      ctx.fillText('B', pB.x + 10, pB.y - 8);
    }
  }, [beta, xA, ctA, mostrarB, xB, ctB, mostrarHiperboles]);

  return (
    <div className="content">
      <PainelExplicativo situacao={situacaoAtual} perguntas={perguntasAssistente} />
      <div className="sidebar-l">
        <div className="section-label">Referencial S' (boost)</div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">v / c (β)</span><span className="ctrl-num">{fmt(beta, 3)}c</span></div>
          <input type="range" min="-0.95" max="0.95" step="0.01" value={beta} onChange={e => setBeta(+e.target.value)} />
        </div>

        <div className="section-label">Evento A</div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">x_A</span><span className="ctrl-num">{fmt(xA, 2)}</span></div>
          <input type="range" min="-4" max="4" step="0.1" value={xA} onChange={e => setXA(+e.target.value)} />
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">ct_A</span><span className="ctrl-num">{fmt(ctA, 2)}</span></div>
          <input type="range" min="-4" max="4" step="0.1" value={ctA} onChange={e => setCtA(+e.target.value)} />
        </div>

        <label className="toggle-row">
          <input type="checkbox" checked={mostrarB} onChange={e => setMostrarB(e.target.checked)} />
          <span className="toggle-label">Mostrar evento B</span>
        </label>
        {mostrarB && (
          <>
            <div className="ctrl">
              <div className="ctrl-head"><span className="ctrl-name">x_B</span><span className="ctrl-num">{fmt(xB, 2)}</span></div>
              <input type="range" min="-4" max="4" step="0.1" value={xB} onChange={e => setXB(+e.target.value)} />
            </div>
            <div className="ctrl">
              <div className="ctrl-head"><span className="ctrl-name">ct_B</span><span className="ctrl-num">{fmt(ctB, 2)}</span></div>
              <input type="range" min="-4" max="4" step="0.1" value={ctB} onChange={e => setCtB(+e.target.value)} />
            </div>
            <div className="pill-row">
              <button className="pill" onClick={() => setCtB(ctA)}>Igualar ct_B = ct_A (simultâneos em S)</button>
            </div>
          </>
        )}

        <label className="toggle-row">
          <input type="checkbox" checked={mostrarHiperboles} onChange={e => setMostrarHiperboles(e.target.checked)} />
          <span className="toggle-label">Mostrar hipérboles de calibração</span>
        </label>
      </div>

      <div className="main-area">
        <div className="canvas-wrap"><canvas ref={canvasRef} /></div>
      </div>

      <div className="sidebar-r">
        <div className="section-label">Fator de Lorentz</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">γ</span><span className="stat-val accent">{fmt(gamma, 4)}</span></div>
        </div>

        <div className="section-label">Evento A</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">(x, ct) em S</span><span className="stat-val warm">({fmt(xA)}, {fmt(ctA)})</span></div>
          <div className="stat-row"><span className="stat-label">(x', ct') em S'</span><span className="stat-val cool">({fmt(Al.x)}, {fmt(Al.ct)})</span></div>
        </div>

        {mostrarB && (
          <>
            <div className="section-label">Evento B</div>
            <div className="card">
              <div className="stat-row"><span className="stat-label">(x, ct) em S</span><span className="stat-val warm">({fmt(xB)}, {fmt(ctB)})</span></div>
              <div className="stat-row"><span className="stat-label">(x', ct') em S'</span><span className="stat-val cool">({fmt(Bl.x)}, {fmt(Bl.ct)})</span></div>
            </div>

            <div className="section-label">Separação A—B</div>
            <div className="card">
              <div className="stat-row"><span className="stat-label">s² = (Δct)²−(Δx)²</span><span className="stat-val">{fmt(s2AB, 3)}</span></div>
              <div className="stat-row"><span className="stat-label">tipo</span><span className="stat-val accent">{tipoAB}</span></div>
            </div>

            <div className="alert-box">
              Se ct_A = ct_B, os eventos são simultâneos em S (mesma reta horizontal tracejada) — mas
              repare que ct'_A ≠ ct'_B em S': a simultaneidade não sobrevive à troca de referencial.
            </div>
          </>
        )}

        <div className="section-label">Equações</div>
        <div className="eq-block">
          <div className="eq-title">Transformação de Lorentz</div>
          x' <span className="op">=</span> γ(x − βct)
          <br />ct' <span className="op">=</span> γ(ct − βx)
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ABA 2 — TREM DE EINSTEIN (relatividade da simultaneidade)
// ═══════════════════════════════════════════════════════════════════════════
const ANIM_SPEED = 0.55; // unidades naturais de tempo por segundo real

function TremTab() {
  const [beta, setBeta] = useState(0.7);
  const [L0, setL0] = useState(8);

  const gamma = gammaOf(clamp(beta, 0.01, 0.995));
  const L = L0 / gamma;
  const tFront = (L / 2) / (1 + beta);
  const tBack = (L / 2) / (1 - beta);
  const deltaT = tBack - tFront;

  const tAnimRef = useRef(0);
  const flashRef = useRef({ front: false, back: false });
  const canvasRef = useRef(null);

  useEffect(() => {
    tAnimRef.current = 0;
    flashRef.current = { front: false, back: false };
  }, [beta, L0]);

  useEffect(() => {
    let raf, last = null;
    const draw = (now) => {
      if (last !== null) {
        const dt = Math.min((now - last) / 1000, 0.05);
        tAnimRef.current += dt * ANIM_SPEED;
        if (tAnimRef.current > tBack + 1.2) {
          tAnimRef.current = 0;
          flashRef.current = { front: false, back: false };
        }
      }
      last = now;
      const nt = tAnimRef.current;
      if (nt >= tFront) flashRef.current.front = true;
      if (nt >= tBack) flashRef.current.back = true;

      const cv = canvasRef.current;
      if (cv) {
        const dpr = window.devicePixelRatio || 1;
        const W = cv.clientWidth, H = cv.clientHeight;
        cv.width = W * dpr; cv.height = H * dpr;
        const ctx = cv.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);

        const cy = H / 2;
        const escala = Math.min(60, (W * 0.35) / Math.max(L, 1));

        // trilho
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, cy + 40); ctx.lineTo(W, cy + 40); ctx.stroke();

        const xPassageiro = W / 2 + beta * escala * nt;
        const xTremFrente = xPassageiro + (L / 2) * escala;
        const xTremTras = xPassageiro - (L / 2) * escala;

        // corpo do trem
        ctx.fillStyle = 'rgba(168,85,247,0.18)';
        ctx.strokeStyle = '#A855F7';
        ctx.lineWidth = 2;
        ctx.fillRect(xTremTras, cy - 26, xTremFrente - xTremTras, 52);
        ctx.strokeRect(xTremTras, cy - 26, xTremFrente - xTremTras, 52);

        // passageiro (centro do trem)
        ctx.beginPath();
        ctx.arc(xPassageiro, cy, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();

        // posições fixas de emissão (no referencial da plataforma)
        const xEmissaoFrente = W / 2 + (L / 2) * escala;
        const xEmissaoTras = W / 2 - (L / 2) * escala;

        // luz vindo da frente (viaja para -x)
        if (nt < tFront + 0.001) {
          const xLuz = xEmissaoFrente - escala * nt;
          ctx.beginPath();
          ctx.arc(xLuz, cy - 60, 5, 0, Math.PI * 2);
          ctx.fillStyle = '#FBBF24';
          ctx.shadowBlur = 10; ctx.shadowColor = '#FBBF24';
          ctx.fill(); ctx.shadowBlur = 0;
        }
        // luz vindo de trás (viaja para +x)
        if (nt < tBack + 0.001) {
          const xLuz = xEmissaoTras + escala * nt;
          ctx.beginPath();
          ctx.arc(xLuz, cy + 60, 5, 0, Math.PI * 2);
          ctx.fillStyle = '#38BDF8';
          ctx.shadowBlur = 10; ctx.shadowColor = '#38BDF8';
          ctx.fill(); ctx.shadowBlur = 0;
        }

        // marcadores de emissão fixos
        [[xEmissaoFrente, cy - 60, '#FBBF24'], [xEmissaoTras, cy + 60, '#38BDF8']].forEach(([x, y, cor]) => {
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fillStyle = cor;
          ctx.fill();
        });

        // flashes de chegada no passageiro
        if (flashRef.current.front && nt < tFront + 0.5) {
          const raio = 8 + (nt - tFront) * 60;
          ctx.beginPath();
          ctx.arc(xPassageiro, cy, raio, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(251,191,36,${Math.max(0, 1 - (nt - tFront) * 2)})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        if (flashRef.current.back && nt < tBack + 0.5) {
          const raio = 8 + (nt - tBack) * 60;
          ctx.beginPath();
          ctx.arc(xPassageiro, cy, raio, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(56,189,248,${Math.max(0, 1 - (nt - tBack) * 2)})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = "11px 'JetBrains Mono', monospace";
        ctx.textAlign = 'center';
        ctx.fillText('referencial da plataforma (chão)', W / 2, H - 12);
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [beta, L, tFront, tBack]);

  return (
    <div className="content">
      <div className="sidebar-l">
        <div className="section-label">Trem</div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">v / c (β)</span><span className="ctrl-num">{fmt(beta, 2)}c</span></div>
          <input type="range" min="0.05" max="0.95" step="0.01" value={beta} onChange={e => setBeta(+e.target.value)} />
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Comprimento próprio L₀</span><span className="ctrl-num">{fmt(L0, 1)}</span></div>
          <input type="range" min="2" max="14" step="0.5" value={L0} onChange={e => setL0(+e.target.value)} />
        </div>

        <div className="btn-row">
          <button className="btn btn-primary" onClick={() => { tAnimRef.current = 0; flashRef.current = { front: false, back: false }; }}>↩ Disparar Novamente</button>
        </div>

        <div className="section-label">O Experimento Mental</div>
        <div className="card">
          <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.6 }}>
            Dois raios atingem simultaneamente as extremidades do trem, <strong>no referencial da
            plataforma</strong> (marcadores fixos amarelo/azul). O passageiro está sempre no centro do
            trem em movimento — por isso ele encontra a luz da frente antes da luz de trás.
          </p>
        </div>
      </div>

      <div className="main-area">
        <div className="canvas-wrap"><canvas ref={canvasRef} /></div>
      </div>

      <div className="sidebar-r">
        <div className="section-label">Comprimentos</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">L₀ (repouso)</span><span className="stat-val warm">{fmt(L0, 2)}</span></div>
          <div className="stat-row"><span className="stat-label">L (contraído, na plataforma)</span><span className="stat-val cool">{fmt(L, 2)}</span></div>
        </div>

        <div className="section-label">Chegada dos Flashes ao Passageiro</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">t (flash da frente)</span><span className="stat-val" style={{ color: '#FBBF24' }}>{fmt(tFront, 3)}</span></div>
          <div className="stat-row"><span className="stat-label">t (flash de trás)</span><span className="stat-val" style={{ color: '#38BDF8' }}>{fmt(tBack, 3)}</span></div>
          <div className="stat-row"><span className="stat-label">Δt</span><span className="stat-val accent">{fmt(deltaT, 3)}</span></div>
        </div>

        <div className="alert-box">
          Os dois flashes chegam ao passageiro em momentos diferentes — um fato físico real, que todos
          os observadores concordam ter acontecido. Por isso, o passageiro conclui que os flashes NÃO
          foram simultâneos no referencial do trem, mesmo tendo sido programados para disparar
          simultaneamente no referencial da plataforma.
        </div>

        <div className="section-label">Equações</div>
        <div className="eq-block">
          <div className="eq-title">Tempos de Chegada (c=1)</div>
          t_frente <span className="op">=</span> (L/2)/(1+β)
          <br />t_trás <span className="op">=</span> (L/2)/(1−β)
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ABA 3 — CÁLCULO & DERIVAÇÕES
// ═══════════════════════════════════════════════════════════════════════════
function CalcTab() {
  const beta = 0.7, L0 = 8;
  const gamma = gammaOf(beta);
  const L = L0 / gamma;
  const deltaT = (L / 2) / (1 - beta) - (L / 2) / (1 + beta);

  return (
    <div className="main-area" style={{ overflow: 'auto' }}>
      <div className="calc-page">

        <div className="calc-section">
          <div className="calc-h2">1. As Transformações de Lorentz</div>
          <p className="calc-p">
            Enquanto a transformação de Galileu (x'=x−vt, t'=t) descreve bem o dia a dia, ela viola a
            constância de c. As transformações de Lorentz a substituem, respeitando os dois postulados
            (em unidades naturais onde c=1):
          </p>
          <div className="big-eq">
            <span className="hi-acc">x' = γ(x − βct)</span>
            <br /><span className="hi-acc">ct' = γ(ct − βx)</span>
            <span className="cmt">   ← reduz à transformação de Galileu quando β≪1 (γ≈1)</span>
          </div>
        </div>

        <div className="calc-section">
          <div className="calc-h2">2. O Intervalo Invariante</div>
          <p className="calc-p">
            Diferente da distância euclidiana, o intervalo espaço-temporal entre dois eventos é o
            mesmo em todos os referenciais inerciais — é a grandeza que "sobrevive" à troca de referencial:
          </p>
          <div className="big-eq">
            <span className="hi-acc">s² = (cΔt)² − (Δx)²</span>
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">s² &gt; 0 → separação temporal</span><span className="step-desc">ordem causal é a mesma em todos os referenciais</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq">s² &lt; 0 → separação espacial</span><span className="step-desc">a ordem no tempo pode diferir entre referenciais</span></div>
            <div className="derivation-step"><span className="step-num">③</span><span className="step-eq">s² = 0 → separação luminoide</span><span className="step-desc">eventos conectados exatamente pela velocidade da luz</span></div>
          </div>
        </div>

        <div className="calc-section">
          <div className="calc-h2">3. Derivando a Relatividade da Simultaneidade</div>
          <p className="calc-p">
            Considere dois eventos simultâneos no referencial S (Δt=0) mas separados no espaço (Δx≠0).
            Aplicando a transformação de Lorentz para o tempo:
          </p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">Δt' = γ(Δt − βΔx/c)</span><span className="step-desc">transformação de Lorentz do tempo</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq">Δt = 0 (simultâneos em S)</span><span className="step-desc">hipótese</span></div>
            <div className="derivation-step"><span className="step-num">③</span><span className="step-eq"><span className="hi-acc">Δt' = −γβΔx/c ≠ 0</span></span><span className="step-desc">não são simultâneos em S', a menos que Δx=0</span></div>
          </div>
          <p className="calc-p">
            Isso é exatamente o que o diagrama de Minkowski mostra geometricamente: a reta de
            simultaneidade de S' (paralela ao eixo x') é inclinada em relação à de S, então dois
            eventos na mesma "horizontal" em S caem em alturas diferentes ao longo do eixo ct' de S'.
          </p>
        </div>

        <div className="calc-section">
          <div className="calc-h2">4. O Trem de Einstein — Resumo Numérico</div>
          <p className="calc-p">
            Trem com L₀={L0} (comprimento próprio) viajando a β={beta}c (γ≈{fmt(gamma, 3)}):
          </p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">L = L₀/γ ≈ {fmt(L, 3)}</span><span className="step-desc">comprimento contraído, medido na plataforma</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq">Δt = Lβγ²  ≈ {fmt(deltaT, 3)}</span><span className="step-desc">defasagem de chegada dos flashes ao passageiro</span></div>
            <div className="derivation-step"><span className="step-num">③</span><span className="step-eq">Δt → 0 quando β → 0</span><span className="step-desc">no limite não-relativístico, a simultaneidade é absoluta — por isso não notamos isso no dia a dia</span></div>
          </div>
        </div>

        <div className="calc-section">
          <div className="calc-h2">5. Estrutura Causal e o Cone de Luz</div>
          <p className="calc-p">
            O cone de luz de um evento divide o espaço-tempo em três regiões: o <strong>futuro</strong>
            (eventos que esse evento pode influenciar), o <strong>passado</strong> (eventos que podem
            tê-lo influenciado) e o <strong>alhures</strong> (separação espacial — fora do alcance
            causal, em qualquer direção do tempo).
          </p>
          <div className="alert-box">
            É exatamente porque eventos espacialmente separados (fora do cone de luz um do outro) não
            têm ordem temporal absoluta que a relatividade da simultaneidade não viola causalidade:
            nenhum sinal mais rápido que a luz seria necessário para que observadores discordem sobre
            "quem aconteceu primeiro" nesses casos.
          </div>
        </div>

      </div>
    </div>
  );
}
