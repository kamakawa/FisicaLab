// src/pages/ExperimentoCampoEletrico3D.jsx
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { FISICA3_BASE_STYLES, ELETRO } from '../styles/fisica3Theme';
import PainelExplicativo from '../components/PainelExplicativo';

const { K } = ELETRO;
const fmt = (n, d = 2) => (typeof n === 'number' && isFinite(n) ? n.toFixed(d) : '—');
const fmtSci = (n) => (isFinite(n) ? (Math.abs(n) < 1000 && Math.abs(n) >= 0.01 ? n.toFixed(2) : n.toExponential(2)) : '—');

const STYLES = FISICA3_BASE_STYLES + `
.viewer-3d { width: 100%; height: 100%; position: relative; background: #05070D; }
.overlay-panel {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 240px;
  background: rgba(8, 12, 20, 0.9);
  backdrop-filter: blur(14px);
  border-radius: 12px;
  border: 1px solid rgba(168, 85, 247, 0.25);
  padding: 14px;
  font-family: var(--mono);
  z-index: 20;
  color: var(--text);
  font-size: 11px;
}
`;

// Campo elétrico total (superposição) num ponto, dado um array de cargas {pos: Vector3, q: Coulombs}
function calcCampo(pos, cargas) {
  const E = new THREE.Vector3(0, 0, 0);
  cargas.forEach(c => {
    const rVec = new THREE.Vector3().subVectors(pos, c.pos);
    const rMag = rVec.length();
    if (rMag < 0.12) return;
    const mag = (K * c.q) / (rMag * rMag);
    E.add(rVec.normalize().multiplyScalar(mag));
  });
  return E;
}

function corPorMagnitude(mag) {
  if (mag > 2e5) return 0xef4444;
  if (mag > 2e4) return 0xa855f7;
  return 0x38bdf8;
}

// ─── Cena 3D ──────────────────────────────────────────────────────────────
function Cargas({ cargas }) {
  return (
    <>
      {cargas.map((c, i) => {
        const positiva = c.q >= 0;
        const cor = positiva ? '#EF4444' : '#38BDF8';
        const raio = 0.16 + Math.min(0.14, Math.abs(c.q) * 1e6 * 0.008);
        return (
          <group key={i} position={[c.pos.x, c.pos.y, c.pos.z]}>
            <mesh>
              <sphereGeometry args={[raio, 32, 32]} />
              <meshStandardMaterial color={cor} emissive={cor} emissiveIntensity={0.7} metalness={0.5} roughness={0.3} />
            </mesh>
            <pointLight color={cor} intensity={1} distance={2} />
            <Text position={[0, raio + 0.22, 0]} fontSize={0.18} color={cor} anchorX="center" anchorY="middle">
              {positiva ? '+' : '−'}{fmt(Math.abs(c.q) * 1e6, 1)}μC
            </Text>
          </group>
        );
      })}
    </>
  );
}

function CampoVetorial({ cargas }) {
  const arrows = useMemo(() => {
    const lista = [];
    const range = 2.4, step = 0.8;
    for (let x = -range; x <= range; x += step) {
      for (let y = -range; y <= range; y += step) {
        for (let z = -range; z <= range; z += step) {
          const pos = new THREE.Vector3(x, y, z);
          if (cargas.some(c => pos.distanceTo(c.pos) < 0.4)) continue;
          const E = calcCampo(pos, cargas);
          const mag = E.length();
          if (mag < 300) continue;
          const len = THREE.MathUtils.clamp(0.14 + 0.09 * Math.log10(mag / 1000), 0.1, 0.45);
          lista.push({ pos, dir: E.clone().normalize(), len, cor: corPorMagnitude(mag) });
        }
      }
    }
    return lista;
  }, [cargas]);

  return (
    <>
      {arrows.map((a, i) => (
        <primitive key={i} object={new THREE.ArrowHelper(a.dir, a.pos, a.len, a.cor, a.len * 0.35, a.len * 0.22)} />
      ))}
    </>
  );
}

function Eixos() {
  const L = 3;
  return (
    <group>
      <primitive object={new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), L, 0x475569, 0.15, 0.08)} />
      <primitive object={new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), L, 0x475569, 0.15, 0.08)} />
      <primitive object={new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), L, 0x475569, 0.15, 0.08)} />
      <gridHelper args={[6, 12, '#A855F7', '#222233']} position={[0, -2.4, 0]} />
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════
export default function ExperimentoCampoEletrico3D() {
  const [tab, setTab] = useState('sim');

  return (
    <>
      <style>{STYLES}</style>
      <div className="app">
        <header className="header">
          <div className="header-title">Campo Elétrico em 3D</div>
          <div className="header-sub">Física 3 · Eletrostática</div>
          <span className="header-tag">E⃗ = Σ k·qᵢ/rᵢ² · r̂ᵢ</span>
        </header>

        <nav className="tabs">
          {[
            ['sim', 'Simulação 3D'],
            ['eixo', 'Campo no Eixo'],
            ['calc', 'Cálculo & Derivações'],
          ].map(([id, label]) => (
            <button key={id} className={`tab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </nav>

        {tab === 'sim' && <SimTab />}
        {tab === 'eixo' && <EixoTab />}
        {tab === 'calc' && <CalcTab />}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ABA 1 — SIMULAÇÃO 3D
// ═══════════════════════════════════════════════════════════════════════════
function SimTab() {
  const [q1, setQ1] = useState(10);   // μC
  const [q2, setQ2] = useState(-10);  // μC
  const [d, setD] = useState(1.6);    // separação (unidades de cena, ~metros)

  const cargas = useMemo(() => [
    { pos: new THREE.Vector3(-d / 2, 0, 0), q: q1 * 1e-6 },
    { pos: new THREE.Vector3(d / 2, 0, 0), q: q2 * 1e-6 },
  ], [q1, q2, d]);

  const p = Math.abs(q1 * 1e-6) * d; // momento de dipolo aproximado (só bem definido se |q1|=|q2|)
  const ehDipolo = Math.abs(Math.abs(q1) - Math.abs(q2)) < 0.01 && q1 * q2 < 0;

  const situacaoAtual = ehDipolo
    ? `Com q₁=${fmt(q1, 1)}μC e q₂=${fmt(q2, 1)}μC (cargas opostas de mesmo módulo) separadas por d=${fmt(d, 2)}m, você tem um dipolo elétrico com momento p=${fmtSci(p)}C·m. As setas mostram o campo saindo de q₁ e entrando em q₂.`
    : `Com q₁=${fmt(q1, 1)}μC e q₂=${fmt(q2, 1)}μC separadas por d=${fmt(d, 2)}m, as setas mostram o campo elétrico resultante (soma vetorial das duas cargas) em cada ponto do espaço — azul fraco, roxo médio, vermelho forte.`;

  const perguntasAssistente = [
    {
      id: 'setas',
      pergunta: 'O que são as setas na cena?',
      resposta: 'Cada seta é o vetor campo elétrico resultante naquele ponto do espaço — a soma vetorial do campo de q₁ com o de q₂. A direção da seta é a direção do campo; a cor indica a intensidade (azul fraco, roxo médio, vermelho forte).',
    },
    {
      id: 'cargas',
      pergunta: 'O que são q₁ e q₂?',
      resposta: `São as duas cargas puntuais da cena. Agora q₁=${fmt(q1, 1)}μC e q₂=${fmt(q2, 1)}μC — os sliders controlam magnitude e sinal de cada uma independentemente.`,
    },
    {
      id: 'd',
      pergunta: 'O que é a separação d?',
      resposta: `d é a distância entre as duas cargas, em metros. Agora vale ${fmt(d, 2)}m. Aumentar d afasta as cargas e espalha mais a região onde o campo delas se sobrepõe de forma perceptível.`,
    },
    {
      id: 'dipolo',
      pergunta: 'O que é o momento de dipolo p?',
      resposta: ehDipolo
        ? `p=q·d mede "quão forte" é o dipolo formado pelas duas cargas opostas. Com os valores atuais, p=${fmtSci(p)}C·m.`
        : 'p=q·d só é um dipolo bem definido quando as duas cargas têm o mesmo módulo e sinais opostos — não é o caso agora (tente a configuração rápida "Dipolo" para ver).',
    },
    {
      id: 'cores',
      pergunta: 'Como interpreto as cores das setas?',
      resposta: 'Azul = campo fraco, roxo = campo médio, vermelho = campo forte — a cor é definida pela magnitude do vetor naquele ponto, não pela carga que o originou.',
    },
    {
      id: 'perto',
      pergunta: 'Por que não há setas bem perto das cargas?',
      resposta: 'Perto de uma carga puntual, o campo (∝1/r²) tende ao infinito — setas ali teriam tamanho absurdo. Por isso a simulação omite pontos muito próximos das cargas (raio<0,4) e limita o comprimento visual das setas.',
    },
  ];

  return (
    <div className="content">
      <PainelExplicativo situacao={situacaoAtual} perguntas={perguntasAssistente} />
      <div className="sidebar-l">
        <div className="section-label">Cargas</div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Carga q₁ (esquerda)</span><span className="ctrl-num">{fmt(q1, 1)} μC</span></div>
          <input type="range" min="-20" max="20" step="0.5" value={q1} onChange={e => setQ1(+e.target.value)} />
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Carga q₂ (direita)</span><span className="ctrl-num">{fmt(q2, 1)} μC</span></div>
          <input type="range" min="-20" max="20" step="0.5" value={q2} onChange={e => setQ2(+e.target.value)} />
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Separação d</span><span className="ctrl-num">{fmt(d, 2)} m</span></div>
          <input type="range" min="0.6" max="3" step="0.1" value={d} onChange={e => setD(+e.target.value)} />
        </div>

        <p style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.6 }}>
          Arraste para orbitar a câmera e role para dar zoom. As setas mostram a direção do campo
          resultante (soma vetorial das duas cargas) em cada ponto — cor indica intensidade:
          <span style={{ color: '#38BDF8' }}> fraco</span>,
          <span style={{ color: '#A855F7' }}> médio</span>,
          <span style={{ color: '#EF4444' }}> forte</span>.
        </p>

        <div className="section-label">Configurações Rápidas</div>
        <div className="btn-row">
          <button className="btn btn-secondary" onClick={() => { setQ1(10); setQ2(-10); }}>Dipolo</button>
          <button className="btn btn-secondary" onClick={() => { setQ1(10); setQ2(10); }}>Iguais</button>
        </div>
      </div>

      <div className="main-area">
        <div className="viewer-3d">
          <Canvas camera={{ position: [3.2, 2.4, 4.2], fov: 55 }} gl={{ antialias: true }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[4, 5, 4]} intensity={1} />
            <directionalLight position={[3, 6, 2]} intensity={0.6} />
            <OrbitControls enablePan enableZoom rotateSpeed={1} makeDefault />
            <Eixos />
            <Cargas cargas={cargas} />
            <CampoVetorial cargas={cargas} />
          </Canvas>

          <div className="overlay-panel">
            <div style={{ fontSize: 10, letterSpacing: '1.5px', color: '#A855F7', marginBottom: 8, fontWeight: 'bold' }}>
              📐 CONFIGURAÇÃO
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div>q₁ = <span style={{ color: '#EF4444' }}>{fmt(q1, 1)} μC</span></div>
              <div>q₂ = <span style={{ color: '#38BDF8' }}>{fmt(q2, 1)} μC</span></div>
              <div>d = {fmt(d, 2)} m</div>
              {Math.abs(Math.abs(q1) - Math.abs(q2)) < 0.01 && q1 * q2 < 0 && (
                <div style={{ marginTop: 6, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 6, color: '#9CA3AF' }}>
                  momento de dipolo p = {fmtSci(p)} C·m
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="sidebar-r">
        <div className="section-label">Cargas</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">q₁</span><span className="stat-val positivo">{fmt(q1, 2)} μC</span></div>
          <div className="stat-row"><span className="stat-label">q₂</span><span className="stat-val negativo">{fmt(q2, 2)} μC</span></div>
          <div className="stat-row"><span className="stat-label">Separação d</span><span className="stat-val">{fmt(d, 2)} m</span></div>
        </div>

        <div className="section-label">Equações</div>
        <div className="eq-block">
          <div className="eq-title">Superposição de Campos</div>
          <span className="sym">E⃗</span>_total <span className="op">=</span> Σᵢ k·qᵢ/rᵢ² · r̂ᵢ
        </div>
        <div className="eq-block">
          <div className="eq-title">Momento de Dipolo</div>
          <span className="sym">p</span> <span className="op">=</span> q·d
          <br /><span className="cmt">válido quando |q₁|=|q₂|</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ABA 2 — CAMPO AO LONGO DO EIXO
// ═══════════════════════════════════════════════════════════════════════════
function EixoTab() {
  const [q1, setQ1] = useState(10);
  const [q2, setQ2] = useState(-10);
  const [d, setD] = useState(1.6);
  const [posX, setPosX] = useState(3);

  const cargaEsq = { pos: new THREE.Vector3(-d / 2, 0, 0), q: q1 * 1e-6 };
  const cargaDir = { pos: new THREE.Vector3(d / 2, 0, 0), q: q2 * 1e-6 };
  const cargas = [cargaEsq, cargaDir];

  const campoEmX = (x) => calcCampo(new THREE.Vector3(x, 0, 0), cargas).x;
  const Eatual = campoEmX(posX);

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

      const pad = { l: 70, r: 24, t: 24, b: 46 };
      const plotW = W - pad.l - pad.r;
      const plotH = H - pad.t - pad.b;
      const xMax = 5;
      const eMaxRef = Math.max(Math.abs(campoEmX(d / 2 + 0.15)), Math.abs(campoEmX(-d / 2 - 0.15)));
      const toX = xv => pad.l + ((xv + xMax) / (2 * xMax)) * plotW;
      const toY = ev => pad.t + plotH / 2 - (THREE.MathUtils.clamp(ev, -eMaxRef, eMaxRef) / eMaxRef) * (plotH / 2);

      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(pad.l, pad.t + plotH / 2); ctx.lineTo(pad.l + plotW, pad.t + plotH / 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, pad.t + plotH); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = "11px 'JetBrains Mono', monospace";
      ctx.textAlign = 'center';
      ctx.fillText('x (m)', pad.l + plotW / 2, H - 12);

      // Curva de E(x), com descontinuidade nas cargas
      const desenhaTrecho = (xIni, xFim) => {
        ctx.beginPath();
        let first = true;
        for (let x = xIni; x <= xFim; x += 0.02) {
          const ev = campoEmX(x);
          const px = toX(x), py = toY(ev);
          first ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
          first = false;
        }
        ctx.strokeStyle = '#A855F7';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      };
      desenhaTrecho(-xMax, -d / 2 - 0.05);
      desenhaTrecho(-d / 2 + 0.05, d / 2 - 0.05);
      desenhaTrecho(d / 2 + 0.05, xMax);

      // Marcadores das cargas
      [[-d / 2, q1], [d / 2, q2]].forEach(([xc, qv]) => {
        ctx.beginPath();
        ctx.arc(toX(xc), pad.t + plotH / 2, 5, 0, Math.PI * 2);
        ctx.fillStyle = qv >= 0 ? '#EF4444' : '#38BDF8';
        ctx.fill();
      });

      // Ponto atual (pulsante)
      const pulso = 1 + 0.25 * Math.sin(t * 3);
      const px = toX(posX), py = toY(Eatual);
      ctx.beginPath();
      ctx.arc(px, py, 6 * pulso, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.strokeStyle = '#FBBF24';
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 8 + 6 * pulso;
      ctx.shadowColor = 'rgba(251,191,36,0.7)';
      ctx.stroke();
      ctx.shadowBlur = 0;

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [q1, q2, d, posX]);

  return (
    <div className="content">
      <div className="sidebar-l">
        <div className="section-label">Cargas</div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Carga q₁ (esquerda)</span><span className="ctrl-num">{fmt(q1, 1)} μC</span></div>
          <input type="range" min="-20" max="20" step="0.5" value={q1} onChange={e => setQ1(+e.target.value)} />
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Carga q₂ (direita)</span><span className="ctrl-num">{fmt(q2, 1)} μC</span></div>
          <input type="range" min="-20" max="20" step="0.5" value={q2} onChange={e => setQ2(+e.target.value)} />
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Separação d</span><span className="ctrl-num">{fmt(d, 2)} m</span></div>
          <input type="range" min="0.6" max="3" step="0.1" value={d} onChange={e => setD(+e.target.value)} />
        </div>

        <div className="section-label">Ponto de Análise</div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Posição x (no eixo)</span><span className="ctrl-num">{fmt(posX, 2)} m</span></div>
          <input type="range" min="-5" max="5" step="0.05" value={posX} onChange={e => setPosX(+e.target.value)} />
        </div>
      </div>

      <div className="main-area">
        <div className="canvas-wrap"><canvas ref={canvasRef} /></div>
      </div>

      <div className="sidebar-r">
        <div className="section-label">Campo no Ponto</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">x</span><span className="stat-val">{fmt(posX, 2)} m</span></div>
          <div className="stat-row"><span className="stat-label">Eₓ(x)</span><span className="stat-val accent">{fmtSci(Eatual)} N/C</span></div>
        </div>

        <div className="section-label">Equação</div>
        <div className="eq-block">
          <div className="eq-title">Campo Resultante no Eixo</div>
          <span className="sym">E</span>(x) <span className="op">=</span> k·q₁/(x−x₁)² + k·q₂/(x−x₂)²
          <br /><span className="cmt">soma com sinal — cada termo aponta na direção de r̂ᵢ</span>
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
          <div className="calc-h2">1. Definição de Campo Elétrico</div>
          <p className="calc-p">
            O campo elétrico num ponto é definido como a força por unidade de carga que uma carga de
            teste q₀ sentiria naquele ponto:
          </p>
          <div className="big-eq">
            <span className="hi-acc">E⃗ = F⃗/q₀ = k·q/r² · r̂</span>
            <span className="cmt">   ← r̂ aponta da carga fonte para o ponto onde o campo é medido</span>
          </div>
          <p className="calc-p">
            O campo existe independentemente de haver uma carga de teste ali — é uma propriedade do
            espaço criada pela carga fonte.
          </p>
        </div>

        <div className="calc-section">
          <div className="calc-h2">2. Princípio de Superposição de Campos</div>
          <p className="calc-p">
            Assim como as forças, os campos elétricos de múltiplas cargas se somam vetorialmente:
          </p>
          <div className="big-eq">
            <span className="hi-acc">E⃗_total(r⃗) = Σᵢ k·qᵢ/|r⃗−r⃗ᵢ|² · (r⃗−r⃗ᵢ)/|r⃗−r⃗ᵢ|</span>
          </div>
          <p className="calc-p">
            É esse princípio que a simulação 3D calcula em cada ponto da grade: soma o campo de q₁ com
            o campo de q₂, vetor a vetor.
          </p>
        </div>

        <div className="calc-section">
          <div className="calc-h2">3. O Dipolo Elétrico</div>
          <p className="calc-p">
            Um dipolo é um par de cargas +q e −q separadas por uma distância d. Define-se o{' '}
            <strong>momento de dipolo</strong> como p=q·d, um vetor apontando da carga negativa para a positiva.
          </p>
          <p className="calc-p">Para pontos distantes (r≫d), o campo se aproxima de duas formas simples:</p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">Eixo</span><span className="step-eq">E_axial ≈ 2kp/r³</span><span className="step-desc">no prolongamento da linha que une as cargas</span></div>
            <div className="derivation-step"><span className="step-num">Perpendicular</span><span className="step-eq">E_perp ≈ kp/r³</span><span className="step-desc">na mediatriz do dipolo — metade do valor axial</span></div>
          </div>
          <p className="calc-p">
            Note que o campo do dipolo cai com 1/r³ (mais rápido que 1/r² de uma carga isolada) — as
            cargas quase se cancelam à distância, restando só o efeito da separação finita entre elas.
          </p>
        </div>

        <div className="calc-section">
          <div className="calc-h2">4. Dedução do Campo Axial</div>
          <p className="calc-p">
            Num ponto a distância r do centro, no eixo, com r≫d (carga +q mais perto, −q mais longe):
          </p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">E = kq/(r−d/2)² − kq/(r+d/2)²</span><span className="step-desc">campo das duas cargas, mesma direção</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq">E = kq·[(r+d/2)²−(r−d/2)²] / (r²−d²/4)²</span><span className="step-desc">tirando o mmc</span></div>
            <div className="derivation-step"><span className="step-num">③</span><span className="step-eq">E = kq·2rd / (r²−d²/4)² ≈ 2kqd/r³ = 2kp/r³</span><span className="step-desc">expandindo e aproximando r≫d</span></div>
          </div>
        </div>

        <div className="calc-section">
          <div className="calc-h2">5. Exemplo Numérico</div>
          <p className="calc-p">
            Um dipolo com q=5μC e d=2cm. Qual o campo a 50cm de distância, no eixo?
          </p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">p = 5×10⁻⁶ × 0,02 = 1×10⁻⁷ C·m</span><span className="step-desc">momento de dipolo</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq">E ≈ 2×8,99×10⁹×10⁻⁷/0,5³ = 14.384 N/C</span><span className="step-desc">campo axial aproximado</span></div>
          </div>
        </div>

      </div>
    </div>
  );
}
