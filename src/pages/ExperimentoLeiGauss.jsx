// src/pages/ExperimentoLeiGauss.jsx
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { FISICA3_BASE_STYLES, ELETRO } from '../styles/fisica3Theme';
import PainelExplicativo from '../components/PainelExplicativo';

const { K, EPSILON0 } = ELETRO;
const fmt = (n, d = 2) => (typeof n === 'number' && isFinite(n) ? n.toFixed(d) : '—');
const fmtSci = (n) => (isFinite(n) ? (Math.abs(n) < 1000 && Math.abs(n) >= 0.01 ? n.toFixed(2) : n.toExponential(2)) : '—');
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

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
.charge-block {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 14px;
}
`;

// ─── Campo 3D de um conjunto de cargas puntuais (posições no plano z=0) ───
function campoEm3D(pos, cargas) {
  let Ex = 0, Ey = 0, Ez = 0;
  cargas.forEach(c => {
    const dx = pos.x - c.x, dy = pos.y - c.y, dz = pos.z - c.z;
    const r2 = dx * dx + dy * dy + dz * dz;
    if (r2 < 0.0009) return;
    const r = Math.sqrt(r2);
    const mag = (K * c.q) / r2;
    Ex += (mag * dx) / r; Ey += (mag * dy) / r; Ez += (mag * dz) / r;
  });
  return { x: Ex, y: Ey, z: Ez };
}

// Traça uma linha de campo no plano z=0, a partir de um ponto, seguindo o campo local
function tracaLinha(cargas, start, limite) {
  const pontos = [{ ...start }];
  let pos = { ...start };
  const passo = 0.05;
  for (let i = 0; i < 400; i++) {
    const E = campoEm3D({ x: pos.x, y: pos.y, z: 0 }, cargas);
    const mag = Math.hypot(E.x, E.y);
    if (mag < 1e-3) break;
    pos = { x: pos.x + (E.x / mag) * passo, y: pos.y + (E.y / mag) * passo };
    pontos.push({ ...pos });
    if (cargas.some(c => c.q < 0 && Math.hypot(pos.x - c.x, pos.y - c.y) < 0.14)) break;
    if (Math.abs(pos.x) > limite || Math.abs(pos.y) > limite) break;
  }
  return pontos;
}

// Integral numérica do fluxo sobre a superfície esférica de raio R (Nθ×Nφ amostras)
function fluxoNumerico(cargas, R, Ntheta = 30, Nphi = 60) {
  let soma = 0;
  const dTheta = Math.PI / Ntheta;
  const dPhi = (2 * Math.PI) / Nphi;
  for (let i = 0; i < Ntheta; i++) {
    const theta = (i + 0.5) * dTheta;
    const sinT = Math.sin(theta), cosT = Math.cos(theta);
    for (let j = 0; j < Nphi; j++) {
      const phi = (j + 0.5) * dPhi;
      const pos = { x: R * sinT * Math.cos(phi), y: R * sinT * Math.sin(phi), z: R * cosT };
      const E = campoEm3D(pos, cargas);
      const nx = pos.x / R, ny = pos.y / R, nz = pos.z / R;
      const En = E.x * nx + E.y * ny + E.z * nz;
      const dA = R * R * sinT * dTheta * dPhi;
      soma += En * dA;
    }
  }
  return soma;
}

export default function ExperimentoLeiGauss() {
  const [tab, setTab] = useState('sim');
  return (
    <>
      <style>{STYLES}</style>
      <div className="app">
        <header className="header">
          <div className="header-title">Lei de Gauss</div>
          <div className="header-sub">Física 3 · Eletrostática</div>
          <span className="header-tag">Φ = Q_enc / ε₀</span>
        </header>
        <nav className="tabs">
          {[['sim', 'Simulação'], ['aplic', 'Aplicações Clássicas'], ['calc', 'Cálculo & Derivações']].map(([id, label]) => (
            <button key={id} className={`tab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>{label}</button>
          ))}
        </nav>
        {tab === 'sim' && <SimTab />}
        {tab === 'aplic' && <AplicTab />}
        {tab === 'calc' && <CalcTab />}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ABA 1 — SIMULAÇÃO (fluxo através de uma superfície gaussiana esférica)
// ═══════════════════════════════════════════════════════════════════════════
function SimTab() {
  const [R, setR] = useState(1.0);
  const [ativoA, setAtivoA] = useState(true);
  const [xA, setXA] = useState(0);
  const [yA, setYA] = useState(0);
  const [qA, setQA] = useState(5);
  const [ativoB, setAtivoB] = useState(true);
  const [xB, setXB] = useState(1.7);
  const [yB, setYB] = useState(0.5);
  const [qB, setQB] = useState(-4);

  const cargas = useMemo(() => {
    const arr = [];
    if (ativoA) arr.push({ x: xA, y: yA, z: 0, q: qA * 1e-6 });
    if (ativoB) arr.push({ x: xB, y: yB, z: 0, q: qB * 1e-6 });
    return arr;
  }, [ativoA, xA, yA, qA, ativoB, xB, yB, qB]);

  const linhasCampo = useMemo(() => {
    const limite = 2.3;
    const linhas = [];
    cargas.filter(c => c.q > 0).forEach(c => {
      const n = 10;
      for (let i = 0; i < n; i++) {
        const ang = (i / n) * Math.PI * 2;
        const start = { x: c.x + Math.cos(ang) * 0.16, y: c.y + Math.sin(ang) * 0.16 };
        linhas.push(tracaLinha(cargas, start, limite));
      }
    });
    return linhas;
  }, [cargas]);

  const Qenc = useMemo(() => cargas.filter(c => Math.hypot(c.x, c.y, c.z) < R).reduce((s, c) => s + c.q, 0), [cargas, R]);
  const fluxoTeorico = Qenc / EPSILON0;
  const fluxoNum = useMemo(() => fluxoNumerico(cargas, R), [cargas, R]);
  const diffPct = fluxoTeorico !== 0 ? Math.abs((fluxoNum - fluxoTeorico) / fluxoTeorico) * 100 : Math.abs(fluxoNum) < 1 ? 0 : 100;

  const aplicarPreset = (nome) => {
    if (nome === 'dentro') { setR(1.0); setAtivoA(true); setXA(0); setYA(0); setQA(5); setAtivoB(false); }
    if (nome === 'dentrofora') { setR(0.9); setAtivoA(true); setXA(-0.3); setYA(0); setQA(5); setAtivoB(true); setXB(1.6); setYB(0.5); setQB(-4); }
    if (nome === 'fora') { setR(0.7); setAtivoA(true); setXA(1.8); setYA(0); setQA(5); setAtivoB(true); setXB(-1.7); setYB(0.6); setQB(8); }
  };

  const canvasRef = useRef(null);
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    let raf, t = 0;
    const ctx = cv.getContext('2d');
    const draw = () => {
      t += 0.016;
      const dpr = window.devicePixelRatio || 1;
      const W = cv.clientWidth, H = cv.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      const cx = W / 2, cy = H / 2;
      const escala = Math.min(W, H) / 4.4;
      const toXY = (p) => ({ x: cx + p.x * escala, y: cy - p.y * escala });

      // Linhas de campo (traçadas uma vez via useMemo, redesenhadas a cada quadro)
      linhasCampo.forEach(linha => {
        ctx.beginPath();
        linha.forEach((p, idx) => {
          const sp = toXY(p);
          idx === 0 ? ctx.moveTo(sp.x, sp.y) : ctx.lineTo(sp.x, sp.y);
        });
        ctx.strokeStyle = 'rgba(255,255,255,0.22)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      });

      // Partículas de fluxo fluindo ao longo das linhas de campo
      linhasCampo.forEach((linha, li) => {
        if (linha.length < 2) return;
        const nParticulas = 3;
        for (let k = 0; k < nParticulas; k++) {
          const fase = (t * 0.18 + k / nParticulas + li * 0.07) % 1;
          const idx = Math.floor(fase * (linha.length - 1));
          const p = toXY(linha[idx]);
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2.4, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(216,180,254,0.9)';
          ctx.shadowBlur = 6;
          ctx.shadowColor = 'rgba(216,180,254,0.8)';
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // Superfície gaussiana (corte equatorial da esfera) — contorno em movimento
      ctx.beginPath();
      ctx.arc(cx, cy, R * escala, 0, Math.PI * 2);
      ctx.setLineDash([6, 5]);
      ctx.lineDashOffset = -t * 14;
      ctx.strokeStyle = 'rgba(168,85,247,0.65)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.lineDashOffset = 0;

      // Tiques de fluxo local ao longo do equador (E·n̂ em cada ponto da superfície)
      const Nticks = 48;
      for (let i = 0; i < Nticks; i++) {
        const ang = (i / Nticks) * Math.PI * 2;
        const pos = { x: R * Math.cos(ang), y: R * Math.sin(ang), z: 0 };
        const E = campoEm3D(pos, cargas);
        const n = { x: Math.cos(ang), y: Math.sin(ang) };
        const En = E.x * n.x + E.y * n.y;
        const p = toXY(pos);
        const comprimento = clamp(Math.abs(En) / 5e4, 3, 16);
        const dir = En >= 0 ? 1 : -1;
        const p2 = { x: p.x + n.x * escala * 0.001 * comprimento * dir * 10, y: p.y - n.y * escala * 0.001 * comprimento * dir * 10 };
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + n.x * comprimento * dir, p.y - n.y * comprimento * dir);
        ctx.strokeStyle = En >= 0 ? 'rgba(74,222,128,0.85)' : 'rgba(248,113,113,0.85)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Cargas
      cargas.forEach(c => {
        const p = toXY(c);
        const dentro = Math.hypot(c.x, c.y) < R;
        const positiva = c.q >= 0;
        const corBase = positiva ? '#EF4444' : '#38BDF8';
        const pulso = 0.92 + 0.08 * Math.sin(t * 3 + c.x * 2);
        ctx.globalAlpha = dentro ? 1 : 0.4;
        const grad = ctx.createRadialGradient(p.x - 4, p.y - 4, 1, p.x, p.y, 18);
        grad.addColorStop(0, positiva ? '#ff9d9d' : '#93c5fd');
        grad.addColorStop(1, corBase);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 15 * pulso, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.shadowBlur = dentro ? 14 : 0;
        ctx.shadowColor = corBase + '99';
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(positiva ? '+' : '−', p.x, p.y);
        ctx.globalAlpha = 1;
        ctx.font = "600 11px 'JetBrains Mono', monospace";
        ctx.fillStyle = dentro ? '#4ade80' : '#f87171';
        ctx.fillText(dentro ? 'dentro' : 'fora', p.x, p.y + 26);
      });

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [R, cargas, linhasCampo]);

  const situacaoAtual = `Com R=${fmt(R, 2)}m, a carga encerrada pela superfície é Q_enc=${fmtSci(Qenc * 1e6)}μC — dando fluxo teórico Φ=${fmtSci(fluxoTeorico)} e fluxo numérico (calculado por integração real sobre a esfera) de ${fmtSci(fluxoNum)}, uma diferença de ${fmt(diffPct, 2)}%.`;

  const perguntasAssistente = [
    {
      id: 'raioR',
      pergunta: 'O que é o raio R da superfície?',
      resposta: `R define o tamanho da esfera gaussiana (imaginária) centrada na origem. Agora vale ${fmt(R, 2)}m — só cargas com distância à origem menor que R contam para Q_enc.`,
    },
    {
      id: 'qenc',
      pergunta: 'O que é Q_enc?',
      resposta: `Q_enc é a soma das cargas que estão fisicamente dentro da superfície gaussiana (r<R) — agora vale ${fmtSci(Qenc * 1e6)}μC. Cargas fora da superfície não entram nessa soma, mesmo influenciando o campo local.`,
    },
    {
      id: 'fluxo',
      pergunta: 'O que é o fluxo elétrico Φ?',
      resposta: 'Φ mede quantas linhas de campo atravessam a superfície fechada, líquidas (saindo menos entrando). A Lei de Gauss diz que Φ=Q_enc/ε₀ — só depende da carga interna, não da posição exata dela nem das cargas de fora.',
    },
    {
      id: 'numerico',
      pergunta: 'Por que tem um Φ "teórico" e um "numérico"?',
      resposta: `O teórico vem direto da fórmula Q_enc/ε₀. O numérico é calculado de verdade, integrando E·dA em ~1800 pontos da esfera — os dois devem bater (agora diferem só ${fmt(diffPct, 2)}%), confirmando a Lei de Gauss na prática.`,
    },
    {
      id: 'ticks',
      pergunta: 'O que são os tiques verdes/vermelhos na esfera?',
      resposta: 'Cada tique mostra a direção do campo elétrico local naquele ponto da superfície: verde = fluxo saindo, vermelho = fluxo entrando. O saldo de todos eles é o que vira Φ.',
    },
  ];

  return (
    <div className="content">
      <PainelExplicativo situacao={situacaoAtual} perguntas={perguntasAssistente} />
      <div className="sidebar-l">
        <div className="section-label">Superfície Gaussiana</div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Raio R</span><span className="ctrl-num">{fmt(R, 2)} m</span></div>
          <input type="range" min="0.3" max="2.0" step="0.05" value={R} onChange={e => setR(+e.target.value)} />
        </div>

        <div className="section-label">Cenários Rápidos</div>
        <div className="pill-row">
          <button className="pill" onClick={() => aplicarPreset('dentro')}>1 carga dentro</button>
          <button className="pill" onClick={() => aplicarPreset('dentrofora')}>Dentro + Fora</button>
          <button className="pill" onClick={() => aplicarPreset('fora')}>2 cargas fora</button>
        </div>

        <div className="section-label">Carga A</div>
        <div className="charge-block">
          <label className="toggle-row">
            <input type="checkbox" checked={ativoA} onChange={e => setAtivoA(e.target.checked)} />
            <span className="toggle-label">Ativa</span>
          </label>
          <div className="ctrl">
            <div className="ctrl-head"><span className="ctrl-name">q_A</span><span className="ctrl-num">{fmt(qA, 1)} μC</span></div>
            <input type="range" min="-15" max="15" step="0.5" value={qA} onChange={e => setQA(+e.target.value)} disabled={!ativoA} />
          </div>
          <div className="ctrl">
            <div className="ctrl-head"><span className="ctrl-name">x_A</span><span className="ctrl-num">{fmt(xA, 2)}</span></div>
            <input type="range" min="-2.2" max="2.2" step="0.05" value={xA} onChange={e => setXA(+e.target.value)} disabled={!ativoA} />
          </div>
          <div className="ctrl">
            <div className="ctrl-head"><span className="ctrl-name">y_A</span><span className="ctrl-num">{fmt(yA, 2)}</span></div>
            <input type="range" min="-2.2" max="2.2" step="0.05" value={yA} onChange={e => setYA(+e.target.value)} disabled={!ativoA} />
          </div>
        </div>

        <div className="section-label">Carga B</div>
        <div className="charge-block">
          <label className="toggle-row">
            <input type="checkbox" checked={ativoB} onChange={e => setAtivoB(e.target.checked)} />
            <span className="toggle-label">Ativa</span>
          </label>
          <div className="ctrl">
            <div className="ctrl-head"><span className="ctrl-name">q_B</span><span className="ctrl-num">{fmt(qB, 1)} μC</span></div>
            <input type="range" min="-15" max="15" step="0.5" value={qB} onChange={e => setQB(+e.target.value)} disabled={!ativoB} />
          </div>
          <div className="ctrl">
            <div className="ctrl-head"><span className="ctrl-name">x_B</span><span className="ctrl-num">{fmt(xB, 2)}</span></div>
            <input type="range" min="-2.2" max="2.2" step="0.05" value={xB} onChange={e => setXB(+e.target.value)} disabled={!ativoB} />
          </div>
          <div className="ctrl">
            <div className="ctrl-head"><span className="ctrl-name">y_B</span><span className="ctrl-num">{fmt(yB, 2)}</span></div>
            <input type="range" min="-2.2" max="2.2" step="0.05" value={yB} onChange={e => setYB(+e.target.value)} disabled={!ativoB} />
          </div>
        </div>
      </div>

      <div className="main-area">
        <div className="canvas-wrap"><canvas ref={canvasRef} /></div>
      </div>

      <div className="sidebar-r">
        <div className="section-label">Carga Encerrada</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">Q_enc</span><span className="stat-val accent">{fmtSci(Qenc * 1e6)} μC</span></div>
        </div>

        <div className="section-label">Fluxo Elétrico</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">Φ teórico (Q_enc/ε₀)</span><span className="stat-val warm">{fmtSci(fluxoTeorico)}</span></div>
          <div className="stat-row"><span className="stat-label">Φ numérico (∮E·dA)</span><span className="stat-val cool">{fmtSci(fluxoNum)}</span></div>
          <div className="stat-row"><span className="stat-label">Diferença</span><span className="stat-val">{fmt(diffPct, 2)}%</span></div>
        </div>

        <div className="alert-box">
          Repare: mova a carga B para fora e para dentro da superfície. O campo em cada ponto muda,
          mas o fluxo total só muda quando a carga <strong>cruza</strong> a superfície — cargas que
          permanecem fora sempre contribuem fluxo líquido zero (o que entra, sai).
        </div>

        <div className="section-label">Legenda</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">Tique verde</span><span className="stat-val" style={{ color: '#4ade80' }}>fluxo saindo</span></div>
          <div className="stat-row"><span className="stat-label">Tique vermelho</span><span className="stat-val" style={{ color: '#f87171' }}>fluxo entrando</span></div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ABA 2 — APLICAÇÕES CLÁSSICAS (simetrias resolvidas pela Lei de Gauss)
// ═══════════════════════════════════════════════════════════════════════════
const SIMETRIAS = {
  ponto: { label: 'Carga Puntual', unidadeCarga: 'μC' },
  linha: { label: 'Linha Infinita', unidadeCarga: 'μC/m' },
  plano: { label: 'Plano Infinito', unidadeCarga: 'μC/m²' },
  casca: { label: 'Casca Esférica', unidadeCarga: 'μC' },
};

const SIMETRIA_INFO = {
  ponto: {
    gaussiana: 'esfera concêntrica',
    porque: 'Por simetria esférica, |E| é igual em qualquer ponto a uma distância r do centro, e E é sempre radial — paralelo a dA⃗ em toda a superfície gaussiana.',
    derivacao: [
      ['Φ = E · 4πr²', 'E constante e paralelo a dA sobre toda a esfera'],
      ['E · 4πr² = Q/ε₀', 'Lei de Gauss'],
      ['E = k·Q/r²', 'isolando E — a própria Lei de Coulomb'],
    ],
  },
  linha: {
    gaussiana: 'cilindro coaxial',
    porque: 'Por simetria cilíndrica, |E| é igual em qualquer ponto a uma distância r do fio, e aponta radialmente para fora do eixo — perpendicular à superfície lateral do cilindro.',
    derivacao: [
      ['Φ = E · (2πr·L)', 'área lateral do cilindro de raio r e comprimento L; as tampas não contribuem (E ∥ tampas)'],
      ['E · 2πr·L = λL/ε₀', 'carga encerrada = λ·L'],
      ['E = λ/(2πε₀r) = 2k·λ/r', 'isolando E'],
    ],
  },
  plano: {
    gaussiana: 'caixa (pillbox)',
    porque: 'Por simetria planar não existe direção privilegiada ao longo do plano infinito, então E só pode ser perpendicular a ele — com a mesma magnitude a qualquer distância r.',
    derivacao: [
      ['Φ = EA + EA = 2EA', 'pillbox com duas tampas de área A, uma de cada lado; as laterais não contribuem'],
      ['2EA = σA/ε₀', 'carga encerrada = σ·A'],
      ['E = σ/(2ε₀)', 'isolando E — não depende de r!'],
    ],
  },
  casca: {
    gaussiana: 'esfera concêntrica',
    porque: 'Fora da casca, ela se comporta como se toda a carga estivesse concentrada no centro (mesma simetria de uma carga puntual). Dentro, qualquer superfície gaussiana encerra Q_enc=0.',
    derivacao: [
      ['r ≥ R: Φ = E·4πr² = Q/ε₀', 'idêntico ao caso da carga puntual'],
      ['E = k·Q/r²  (r ≥ R)', 'campo externo, como se Q estivesse no centro'],
      ['Q_enc=0 (r<R) → Φ=0 → E=0', 'campo nulo em todo ponto interno'],
    ],
  },
};

function calcE(sim, r, carga, Rcasca) {
  const q = carga * 1e-6;
  switch (sim) {
    case 'ponto': return (K * q) / (r * r);
    case 'linha': return (2 * K * q) / r;
    case 'plano': return q / (2 * EPSILON0);
    case 'casca': return r < Rcasca ? 0 : (K * q) / (r * r);
    default: return 0;
  }
}

function formulaLabel(sim) {
  switch (sim) {
    case 'ponto': return 'E = k·Q / r²';
    case 'linha': return 'E = 2k·λ / r  (=  λ / 2πε₀r)';
    case 'plano': return 'E = σ / 2ε₀   (constante, não depende de r!)';
    case 'casca': return 'E = 0 (r<R)  |  E = k·Q/r² (r≥R)';
    default: return '';
  }
}

// Desenha uma seta de (x0,y0) até (x1,y1); se sentido<0 a ponta fica na origem (campo entrando)
function desenhaSeta(ctx, x0, y0, x1, y1, sentido, cor) {
  const [ax0, ay0, ax1, ay1] = sentido >= 0 ? [x0, y0, x1, y1] : [x1, y1, x0, y0];
  ctx.beginPath();
  ctx.moveTo(ax0, ay0); ctx.lineTo(ax1, ay1);
  ctx.strokeStyle = cor;
  ctx.lineWidth = 1.6;
  ctx.stroke();
  const ang = Math.atan2(ay1 - ay0, ax1 - ax0);
  const tam = 7;
  ctx.beginPath();
  ctx.moveTo(ax1, ay1);
  ctx.lineTo(ax1 - tam * Math.cos(ang - Math.PI / 6), ay1 - tam * Math.sin(ang - Math.PI / 6));
  ctx.lineTo(ax1 - tam * Math.cos(ang + Math.PI / 6), ay1 - tam * Math.sin(ang + Math.PI / 6));
  ctx.closePath();
  ctx.fillStyle = cor;
  ctx.fill();
}

// Gera os "raios" (segmentos fonte→borda) usados para desenhar setas de campo e partículas fluindo
function gerarRaios(sim, cx, cy, escala, W, H, Rcasca, r) {
  const raios = [];
  const margem = 0.92;
  if (sim === 'ponto' || (sim === 'casca' && r >= Rcasca)) {
    const start = sim === 'casca' ? Rcasca * escala : 0;
    const N = 8;
    for (let i = 0; i < N; i++) {
      const ang = (i / N) * Math.PI * 2;
      const borda = Math.min(W, H) / 2 * margem;
      raios.push({
        x0: cx + Math.cos(ang) * start, y0: cy + Math.sin(ang) * start,
        x1: cx + Math.cos(ang) * borda, y1: cy + Math.sin(ang) * borda,
      });
    }
  } else if (sim === 'linha') {
    const ys = [0.18, 0.36, 0.5, 0.64, 0.82].map(f => H * f);
    ys.forEach(y => {
      raios.push({ x0: cx, y0: y, x1: W * margem, y1: y });
      raios.push({ x0: cx, y0: y, x1: W * (1 - margem), y1: y });
    });
  } else if (sim === 'plano') {
    const xs = [0.14, 0.3, 0.5, 0.7, 0.86].map(f => W * f);
    xs.forEach(x => {
      raios.push({ x0: x, y0: cy, x1: x, y1: H * (1 - margem) });
      raios.push({ x0: x, y0: cy, x1: x, y1: H * margem });
    });
  }
  return raios;
}

function AplicTab() {
  const [sim, setSim] = useState('ponto');
  const [carga, setCarga] = useState(5);
  const [r, setR] = useState(1.2);
  const [Rcasca, setRcasca] = useState(0.8);

  const rMax = 3.0;
  const Er = calcE(sim, Math.max(r, 0.05), carga, Rcasca);
  const sentido = carga >= 0 ? 1 : -1;
  const corCampo = carga >= 0 ? 'rgba(239,68,68,0.85)' : 'rgba(56,189,248,0.85)';

  // ── Esquema animado (carga/fio/plano/casca + gaussiana + setas + partículas) ──
  const esquemaRef = useRef(null);
  useEffect(() => {
    const cv = esquemaRef.current;
    if (!cv) return;
    let raf, t = 0;
    const ctx = cv.getContext('2d');
    const draw = () => {
      t += 0.016;
      const dpr = window.devicePixelRatio || 1;
      const W = cv.clientWidth, H = cv.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      const cx = W / 2, cy = H / 2;
      const rMaxVisual = 3.2;
      const escala = Math.min(W, H) / (2 * rMaxVisual);

      const raios = gerarRaios(sim, cx, cy, escala, W, H, Rcasca, r);
      const dentroCasca = sim === 'casca' && r < Rcasca;

      // Fonte geométrica (fio / plano / carga central / casca)
      if (sim === 'linha') {
        ctx.beginPath();
        ctx.moveTo(cx, 0); ctx.lineTo(cx, H);
        ctx.strokeStyle = '#A855F7'; ctx.lineWidth = 3;
        ctx.stroke();
        for (let i = 0; i < 12; i++) {
          const y = (i + 0.5) * (H / 12);
          ctx.beginPath();
          ctx.arc(cx, y, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = carga >= 0 ? '#EF4444' : '#38BDF8';
          ctx.fill();
        }
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = "13px 'JetBrains Mono', monospace";
        ctx.textAlign = 'center';
        ctx.fillText('∞', cx, 16); ctx.fillText('∞', cx, H - 8);
      } else if (sim === 'plano') {
        ctx.beginPath();
        ctx.moveTo(0, cy); ctx.lineTo(W, cy);
        ctx.strokeStyle = '#A855F7'; ctx.lineWidth = 3;
        ctx.stroke();
        for (let i = 0; i < 20; i++) {
          const x = (i + 0.5) * (W / 20);
          ctx.beginPath();
          ctx.moveTo(x, cy); ctx.lineTo(x - 6, cy + 10);
          ctx.strokeStyle = carga >= 0 ? 'rgba(239,68,68,0.6)' : 'rgba(56,189,248,0.6)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = "13px 'JetBrains Mono', monospace";
        ctx.textAlign = 'center';
        ctx.fillText('∞', 14, cy + 4); ctx.fillText('∞', W - 14, cy + 4);
      } else if (sim === 'casca') {
        ctx.beginPath();
        ctx.arc(cx, cy, Rcasca * escala, 0, Math.PI * 2);
        ctx.strokeStyle = carga >= 0 ? '#EF4444' : '#38BDF8';
        ctx.lineWidth = 3;
        ctx.stroke();
        if (dentroCasca) {
          ctx.fillStyle = 'rgba(255,255,255,0.03)';
          ctx.fill();
        }
      } else {
        const pulso = 0.92 + 0.08 * Math.sin(t * 3);
        const grad = ctx.createRadialGradient(cx - 4, cy - 4, 1, cx, cy, 16);
        const corBase = carga >= 0 ? '#EF4444' : '#38BDF8';
        grad.addColorStop(0, carga >= 0 ? '#ff9d9d' : '#93c5fd');
        grad.addColorStop(1, corBase);
        ctx.beginPath();
        ctx.arc(cx, cy, 14 * pulso, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.shadowBlur = 14; ctx.shadowColor = corBase + '99';
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(carga >= 0 ? '+' : '−', cx, cy);
        ctx.textBaseline = 'alphabetic';
      }

      // Setas de campo + partículas fluindo (não desenha dentro da casca, onde E=0)
      if (!dentroCasca) {
        raios.forEach((raio, ri) => {
          desenhaSeta(ctx, raio.x0, raio.y0, raio.x1, raio.y1, sentido, corCampo);
          const nPart = 2;
          for (let k = 0; k < nPart; k++) {
            const fase = (t * 0.22 + k / nPart + ri * 0.05) % 1;
            const f = sentido >= 0 ? fase : 1 - fase;
            const px = raio.x0 + (raio.x1 - raio.x0) * f;
            const py = raio.y0 + (raio.y1 - raio.y0) * f;
            ctx.beginPath();
            ctx.arc(px, py, 2.3, 0, Math.PI * 2);
            ctx.fillStyle = corCampo;
            ctx.shadowBlur = 6; ctx.shadowColor = corCampo;
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        });
      } else {
        const pulsoTxt = 0.5 + 0.5 * Math.sin(t * 2);
        ctx.fillStyle = `rgba(255,255,255,${0.35 + 0.25 * pulsoTxt})`;
        ctx.font = "bold 13px 'JetBrains Mono', monospace";
        ctx.textAlign = 'center';
        ctx.fillText('E = 0 aqui dentro', cx, cy - Rcasca * escala * 0.4);
      }

      // Superfície gaussiana (contorno tracejado, com "marching ants")
      ctx.setLineDash([6, 5]);
      ctx.lineDashOffset = -t * 14;
      ctx.strokeStyle = 'rgba(168,85,247,0.75)';
      ctx.lineWidth = 2;
      if (sim === 'linha') {
        [cx - r * escala, cx + r * escala].forEach(x => {
          ctx.beginPath(); ctx.moveTo(x, 6); ctx.lineTo(x, H - 6); ctx.stroke();
        });
      } else if (sim === 'plano') {
        [cy - r * escala, cy + r * escala].forEach(y => {
          ctx.beginPath(); ctx.moveTo(6, y); ctx.lineTo(W - 6, y); ctx.stroke();
        });
      } else {
        ctx.beginPath();
        ctx.arc(cx, cy, r * escala, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.lineDashOffset = 0;

      ctx.fillStyle = '#C084FC';
      ctx.font = "11px 'JetBrains Mono', monospace";
      ctx.textAlign = 'left';
      ctx.fillText(`gaussiana · r = ${r.toFixed(2)} m`, 10, H - 10);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [sim, carga, r, Rcasca, sentido, corCampo]);

  // ── Gráfico E(r) ──
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

    const padL = 55, padB = 36, padT = 20, padR = 20;
    const plotW = W - padL - padR, plotH = H - padT - padB;

    const Npts = 200;
    const pontos = [];
    let maxE = 1e-9;
    for (let i = 0; i <= Npts; i++) {
      const rr = 0.08 + (rMax - 0.08) * (i / Npts);
      const e = calcE(sim, rr, carga, Rcasca);
      pontos.push({ r: rr, e });
      if (isFinite(e) && Math.abs(e) < 1e12) maxE = Math.max(maxE, Math.abs(e));
    }
    // clamp topo do gráfico em percentil alto pra não deixar a curva 1/r² esmagada
    const eixoMax = maxE * 1.1;

    const toPx = (p) => ({
      x: padL + (p.r / rMax) * plotW,
      y: padT + plotH - clamp(p.e / eixoMax, 0, 1) * plotH,
    });

    // eixos
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, padT); ctx.lineTo(padL, padT + plotH); ctx.lineTo(padL + plotW, padT + plotH);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = "11px 'JetBrains Mono', monospace";
    ctx.textAlign = 'center';
    ctx.fillText('r (m)', padL + plotW / 2, H - 8);
    ctx.save();
    ctx.translate(16, padT + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('E (N/C)', 0, 0);
    ctx.restore();

    // marca R da casca, se aplicável
    if (sim === 'casca') {
      const px = padL + (Rcasca / rMax) * plotW;
      ctx.beginPath();
      ctx.moveTo(px, padT); ctx.lineTo(px, padT + plotH);
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(251,191,36,0.5)';
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#FBBF24';
      ctx.textAlign = 'left';
      ctx.fillText('R', px + 4, padT + 12);
    }

    // curva
    ctx.beginPath();
    pontos.forEach((p, idx) => {
      const sp = toPx(p);
      idx === 0 ? ctx.moveTo(sp.x, sp.y) : ctx.lineTo(sp.x, sp.y);
    });
    ctx.strokeStyle = '#A855F7';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // marcador do r atual
    const atual = toPx({ r, e: Er });
    ctx.beginPath();
    ctx.arc(atual.x, atual.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#FBBF24';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#FBBF24';
    ctx.fill();
    ctx.shadowBlur = 0;
  }, [sim, carga, r, Rcasca]);

  const info = SIMETRIA_INFO[sim];

  return (
    <div className="content">
      <div className="sidebar-l">
        <div className="section-label">Simetria</div>
        <div className="pill-row">
          {Object.entries(SIMETRIAS).map(([id, s]) => (
            <button key={id} className={`pill ${sim === id ? 'on' : ''}`} onClick={() => setSim(id)}>{s.label}</button>
          ))}
        </div>

        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">{sim === 'linha' ? 'λ (carga/comprimento)' : sim === 'plano' ? 'σ (carga/área)' : 'Q'}</span><span className="ctrl-num">{fmt(carga, 1)} {SIMETRIAS[sim].unidadeCarga}</span></div>
          <input type="range" min="-15" max="15" step="0.5" value={carga} onChange={e => setCarga(+e.target.value)} />
        </div>

        {sim === 'casca' && (
          <div className="ctrl">
            <div className="ctrl-head"><span className="ctrl-name">Raio da casca R</span><span className="ctrl-num">{fmt(Rcasca, 2)} m</span></div>
            <input type="range" min="0.2" max="1.8" step="0.05" value={Rcasca} onChange={e => setRcasca(+e.target.value)} />
          </div>
        )}

        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Ponto de observação r</span><span className="ctrl-num">{fmt(r, 2)} m</span></div>
          <input type="range" min="0.08" max="3.0" step="0.02" value={r} onChange={e => setR(+e.target.value)} />
        </div>

        <div className="section-label">Por que essa simetria?</div>
        <div className="card"><p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.6 }}>{info.porque}</p></div>
      </div>

      <div className="main-area" style={{ flexDirection: 'row', overflow: 'hidden' }}>
        <div style={{ flex: 1.15, display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border)', overflow: 'hidden' }}>
          <div className="plot-title" style={{ padding: '12px 16px 0' }}>Esquema — {SIMETRIAS[sim].label}</div>
          <div className="canvas-wrap"><canvas ref={esquemaRef} /></div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div className="plot-title" style={{ padding: '12px 16px 0' }}>Gráfico E(r)</div>
          <div className="canvas-wrap"><canvas ref={canvasRef} /></div>
        </div>
      </div>

      <div className="sidebar-r">
        <div className="section-label">Superfície Gaussiana Usada</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">Simetria</span><span className="stat-val accent">{SIMETRIAS[sim].label}</span></div>
          <div className="stat-row"><span className="stat-label">Gaussiana</span><span className="stat-val">{info.gaussiana}</span></div>
        </div>

        <div className="section-label">Campo no Ponto</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">E(r)</span><span className="stat-val warm">{fmtSci(Er)} N/C</span></div>
        </div>

        <div className="section-label">Fórmula</div>
        <div className="eq-block">
          <div className="eq-title">{SIMETRIAS[sim].label}</div>
          {formulaLabel(sim)}
        </div>

        <div className="section-label">Dedução Rápida</div>
        <div className="big-eq" style={{ padding: 14, fontSize: 12.5 }}>
          {info.derivacao.map(([eq, desc], i) => (
            <div className="derivation-step" key={i}>
              <span className="step-num">{i + 1}</span>
              <span className="step-eq">{eq}</span>
              <span className="step-desc">{desc}</span>
            </div>
          ))}
        </div>

        {sim === 'plano' && (
          <div className="alert-box">
            Note que E não depende de r — o campo de um plano infinito é uniforme em qualquer distância.
          </div>
        )}
        {sim === 'casca' && (
          <div className="alert-box">
            Dentro da casca (r&lt;R) o campo é sempre zero, não importa quanta carga a casca tenha —
            consequência direta de Q_enc=0 para qualquer superfície gaussiana interna.
          </div>
        )}
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
          <div className="calc-h2">1. Fluxo Elétrico</div>
          <p className="calc-p">
            O fluxo elétrico mede quantas "linhas de campo" atravessam uma superfície. Para uma
            superfície fechada dividida em elementos infinitesimais dA com normal n̂ apontando para fora:
          </p>
          <div className="big-eq">
            <span className="hi-acc">Φ_E = ∮ E⃗ · dA⃗</span>
            <span className="cmt">   ← integral de superfície fechada</span>
          </div>
        </div>

        <div className="calc-section">
          <div className="calc-h2">2. A Lei de Gauss</div>
          <p className="calc-p">
            A Lei de Gauss afirma que o fluxo elétrico através de qualquer superfície fechada depende
            apenas da carga líquida encerrada por ela — não importa a forma da superfície, nem onde
            exatamente a carga está posicionada dentro dela:
          </p>
          <div className="big-eq">
            <span className="hi-acc">Φ_E = Q_enc / ε₀</span>
          </div>
        </div>

        <div className="calc-section">
          <div className="calc-h2">3. Derivando a Lei de Coulomb a partir de Gauss</div>
          <p className="calc-p">
            Considere uma carga puntual q e uma superfície gaussiana esférica de raio r centrada nela.
            Por simetria, E⃗ tem a mesma magnitude em toda a esfera e é sempre paralelo a dA⃗ (radial):
          </p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">Φ_E = E · (área da esfera) = E · 4πr²</span><span className="step-desc">E constante e paralelo a dA em toda a superfície</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq">E · 4πr² = q/ε₀</span><span className="step-desc">Lei de Gauss</span></div>
            <div className="derivation-step"><span className="step-num">③</span><span className="step-eq"><span className="hi-acc">E = q / (4πε₀r²) = k·q/r²</span></span><span className="step-desc">recupera a Lei de Coulomb! com k = 1/4πε₀</span></div>
          </div>
          <p className="calc-p">
            Isso mostra que a Lei de Gauss e a Lei de Coulomb são <strong>equivalentes</strong> para
            cargas puntuais — Gauss é a forma mais geral, válida mesmo quando a simetria é complexa
            demais para aplicar Coulomb diretamente.
          </p>
        </div>

        <div className="calc-section">
          <div className="calc-h2">4. Por que só a Carga Interna Importa</div>
          <p className="calc-p">
            Uma carga fora da superfície gaussiana contribui campo em todos os pontos da superfície,
            mas o fluxo líquido dela é sempre zero: toda linha de campo que entra pela superfície em
            algum ponto necessariamente sai por outro (já que as linhas de uma carga externa não têm
            onde "terminar" dentro da região). O saldo do fluxo dessa carga através da superfície
            fechada se cancela exatamente.
          </p>
          <div className="alert-box">
            Isso é o que a simulação da aba "Simulação" demonstra: mover uma carga enquanto ela
            permanece fora da esfera muda o campo local em cada ponto (os tiques verdes/vermelhos se
            movem), mas a integral total ∮E·dA permanece constante.
          </div>
        </div>

        <div className="calc-section">
          <div className="calc-h2">5. Resumo das Simetrias Clássicas</div>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">Carga puntual / casca esférica: E = k·Q/r²</span><span className="step-desc">gaussiana esférica</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq">Fio infinito: E = 2k·λ/r = λ/(2πε₀r)</span><span className="step-desc">gaussiana cilíndrica</span></div>
            <div className="derivation-step"><span className="step-num">③</span><span className="step-eq">Plano infinito: E = σ/(2ε₀)</span><span className="step-desc">gaussiana em caixa (pillbox), E não depende de r</span></div>
            <div className="derivation-step"><span className="step-num">④</span><span className="step-eq">Casca esférica condutora: E = 0 para r&lt;R</span><span className="step-desc">Q_enc = 0 para qualquer gaussiana interna à casca</span></div>
          </div>
        </div>

      </div>
    </div>
  );
}
