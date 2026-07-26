// src/pages/ExperimentoOndasSonoras.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FISICA2_BASE_STYLES } from '../styles/fisica2Theme';

const fmt = (n, d = 2) => (typeof n === 'number' && isFinite(n) ? n.toFixed(d) : '—');
const I0 = 1e-12; // W/m² — limiar de audição
// Velocidade visual das ondas (fração da largura do canvas por segundo). A fonte se
// move na mesma escala multiplicada por (vs/vSom), preservando a proporção real entre
// as duas velocidades — só assim a compressão das ondas continua fisicamente correta.
const VISUAL_WAVE_SPEED_FRAC = 0.5;

const STYLES = FISICA2_BASE_STYLES + `
.db-scale {
  position: relative;
  width: 100%;
  height: 220px;
  border-radius: 10px;
  background: linear-gradient(180deg, #EF4444 0%, #FBBF24 45%, #00F5C4 80%, #0F141E 100%);
  overflow: hidden;
}
.db-marker {
  position: absolute;
  left: 0; right: 0;
  height: 2px;
  background: #fff;
  box-shadow: 0 0 8px rgba(255,255,255,0.8);
}
.db-ref {
  position: absolute;
  left: 6px;
  font-size: 9px;
  font-family: var(--mono);
  color: rgba(0,0,0,0.6);
  transform: translateY(-50%);
}
`;

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════
export default function ExperimentoOndasSonoras() {
  const [tab, setTab] = useState('sim');

  return (
    <>
      <style>{STYLES}</style>
      <div className="app">
        <header className="header">
          <div className="header-title">Ondas Sonoras e Doppler</div>
          <div className="header-sub">Física 2 · Ondas</div>
          <span className="header-tag">f_obs = f·(v±v₀)/(v∓v_s)</span>
        </header>

        <nav className="tabs">
          {[
            ['sim', 'Efeito Doppler'],
            ['intensidade', 'Intensidade & Decibéis'],
            ['calc', 'Cálculo & Derivações'],
          ].map(([id, label]) => (
            <button key={id} className={`tab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </nav>

        {tab === 'sim' && <DopplerTab />}
        {tab === 'intensidade' && <IntensidadeTab />}
        {tab === 'calc' && <CalcTab />}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ABA 1 — EFEITO DOPPLER
// ═══════════════════════════════════════════════════════════════════════════
function DopplerTab() {
  const [freq, setFreq] = useState(500);
  const [vs, setVs] = useState(15);     // velocidade da fonte (+ = aproximando do observador)
  const [vo, setVo] = useState(0);      // velocidade do observador (+ = aproximando da fonte)
  const [temp, setTemp] = useState(20); // °C
  const [rodando, setRodando] = useState(true);

  const vSom = 331 + 0.6 * temp;
  const fObs = freq * (vSom + vo) / (vSom - vs);
  const comprimentoOnda = vSom / freq;

  const stateRef = useRef({ vs, vSom });
  useEffect(() => { stateRef.current = { vs, vSom }; }, [vs, vSom]);

  const sourceXRef = useRef(0.3); // fração 0-1 da largura do canvas
  const pulsesRef = useRef([]); // { emitX, emitT }
  const tRef = useRef(0);
  const lastEmitRef = useRef(0);
  const rafRef = useRef(null);
  const lastRef = useRef(null);

  useEffect(() => {
    sourceXRef.current = 0.3;
    pulsesRef.current = [];
    tRef.current = 0;
    lastEmitRef.current = 0;
    setRodando(true);
  }, [vs, temp]);

  const EMIT_RATE = 2.2; // ondas visuais emitidas por segundo (não é o f real — só ilustrativo)

  useEffect(() => {
    if (!rodando) { lastRef.current = null; return; }
    const step = (now) => {
      if (lastRef.current !== null) {
        const dt = Math.min((now - lastRef.current) / 1000, 0.05);
        const s = stateRef.current;
        tRef.current += dt;
        sourceXRef.current += (s.vs / s.vSom) * VISUAL_WAVE_SPEED_FRAC * dt;
        if (sourceXRef.current > 0.85) sourceXRef.current = 0.85;
        if (sourceXRef.current < 0.02) sourceXRef.current = 0.02;

        if (tRef.current - lastEmitRef.current >= 1 / EMIT_RATE) {
          pulsesRef.current.push({ emitX: sourceXRef.current, emitT: tRef.current });
          lastEmitRef.current = tRef.current;
        }
        pulsesRef.current = pulsesRef.current.filter(p => (tRef.current - p.emitT) < 3.5);
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

      const trackY = H * 0.5;
      const obsX = W * 0.92;
      const pxPerVisualSec = W * VISUAL_WAVE_SPEED_FRAC;

      // Trilho
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.beginPath(); ctx.moveTo(0, trackY); ctx.lineTo(W, trackY); ctx.stroke();
      ctx.setLineDash([]);

      // Ondas (círculos em expansão)
      pulsesRef.current.forEach(p => {
        const age = tRef.current - p.emitT;
        const r = age * pxPerVisualSec;
        const alpha = Math.max(0, 1 - age / 3.5);
        ctx.beginPath();
        ctx.arc(p.emitX * W, trackY, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(56,189,248,${alpha * 0.7})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // Observador
      ctx.beginPath();
      ctx.arc(obsX, trackY, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#00F5C4';
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.textAlign = 'center';
      ctx.fillText('ouvinte', obsX, trackY + 28);

      // Fonte
      const srcX = sourceXRef.current * W;
      const gradS = ctx.createRadialGradient(srcX - 4, trackY - 4, 1, srcX, trackY, 14);
      gradS.addColorStop(0, '#ff9d9d');
      gradS.addColorStop(1, '#EF4444');
      ctx.beginPath();
      ctx.arc(srcX, trackY, 12, 0, Math.PI * 2);
      ctx.fillStyle = gradS;
      ctx.shadowBlur = 14;
      ctx.shadowColor = 'rgba(239,68,68,0.7)';
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillText('fonte', srcX, trackY - 24);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="content">
      <div className="sidebar-l">
        <div className="section-label">Fonte Sonora</div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Frequência emitida f</span><span className="ctrl-num">{fmt(freq, 0)} Hz</span></div>
          <input type="range" min="200" max="1000" step="10" value={freq} onChange={e => setFreq(+e.target.value)} />
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Velocidade da fonte v_s</span><span className="ctrl-num">{fmt(vs, 1)} m/s</span></div>
          <input type="range" min="-30" max="30" step="1" value={vs} onChange={e => setVs(+e.target.value)} />
        </div>
        <p style={{ fontSize: 11, color: 'var(--muted)' }}>v_s &gt; 0: fonte se aproximando do ouvinte · v_s &lt; 0: se afastando</p>

        <div className="section-label">Observador</div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Velocidade do observador v₀</span><span className="ctrl-num">{fmt(vo, 1)} m/s</span></div>
          <input type="range" min="-20" max="20" step="1" value={vo} onChange={e => setVo(+e.target.value)} />
        </div>

        <div className="section-label">Meio</div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Temperatura do ar</span><span className="ctrl-num">{fmt(temp, 0)}°C</span></div>
          <input type="range" min="-10" max="40" step="1" value={temp} onChange={e => setTemp(+e.target.value)} />
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
        <div className="section-label">Meio de Propagação</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">Velocidade do som v</span><span className="stat-val accent">{fmt(vSom, 1)} m/s</span></div>
          <div className="stat-row"><span className="stat-label">Comprimento de onda λ</span><span className="stat-val warm">{fmt(comprimentoOnda, 3)} m</span></div>
        </div>

        <div className="section-label">Frequência Percebida</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">f emitida</span><span className="stat-val">{fmt(freq, 0)} Hz</span></div>
          <div className="stat-row"><span className="stat-label">f observada</span><span className="stat-val cool">{fmt(fObs, 1)} Hz</span></div>
          <div className="stat-row"><span className="stat-label">Variação</span><span className={`stat-val ${fObs >= freq ? 'accent' : 'danger'}`}>{fObs >= freq ? '+' : ''}{fmt(fObs - freq, 1)} Hz</span></div>
        </div>

        <div className="section-label">Equação</div>
        <div className="eq-block">
          <div className="eq-title">Efeito Doppler</div>
          <span className="sym">f</span>_obs <span className="op">=</span> f·(v+v₀)/(v−v_s)
          <br /><span className="cmt">v_s, v₀ &gt; 0 quando se aproximam</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ABA 2 — INTENSIDADE & DECIBÉIS
// ═══════════════════════════════════════════════════════════════════════════
function IntensidadeTab() {
  const [P, setP] = useState(1);     // Watts
  const [r, setR] = useState(5);     // metros

  const I = P / (4 * Math.PI * r * r);
  const beta = 10 * Math.log10(I / I0);

  const referencias = [
    { db: 0, label: 'Limiar de audição' },
    { db: 20, label: 'Sussurro' },
    { db: 60, label: 'Conversa normal' },
    { db: 90, label: 'Trânsito intenso' },
    { db: 120, label: 'Show de rock' },
    { db: 130, label: 'Limiar da dor' },
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

    const cx = W * 0.5, cy = H * 0.5;
    const maxR = Math.min(W, H) * 0.44;
    const rNorm = Math.min(1, r / 50);

    for (let i = 5; i >= 1; i--) {
      const frac = i / 5;
      ctx.beginPath();
      ctx.arc(cx, cy, maxR * frac, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(239,68,68,${0.5 - i * 0.07})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Fonte central
    ctx.beginPath();
    ctx.arc(cx, cy, 12, 0, Math.PI * 2);
    const gradS = ctx.createRadialGradient(cx - 4, cy - 4, 1, cx, cy, 12);
    gradS.addColorStop(0, '#ff9d9d'); gradS.addColorStop(1, '#EF4444');
    ctx.fillStyle = gradS;
    ctx.shadowBlur = 16; ctx.shadowColor = 'rgba(239,68,68,0.7)';
    ctx.fill();
    ctx.shadowBlur = 0;

    // Marcador na distância r
    const markerR = rNorm * maxR;
    const angle = -Math.PI / 4;
    const mx = cx + Math.cos(angle) * markerR, my = cy + Math.sin(angle) * markerR;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(mx, my);
    ctx.strokeStyle = 'rgba(56,189,248,0.6)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(mx, my, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#38BDF8';
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = "11px 'JetBrains Mono', monospace";
    ctx.textAlign = 'left';
    ctx.fillText(`r = ${fmt(r, 1)}m`, mx + 12, my);
    ctx.fillText(`${fmt(beta, 0)} dB`, mx + 12, my + 16);
  }, [P, r, beta]);

  return (
    <div className="content">
      <div className="sidebar-l">
        <div className="section-label">Fonte Sonora</div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Potência sonora P</span><span className="ctrl-num">{fmt(P, 2)} W</span></div>
          <input type="range" min="0.01" max="50" step="0.01" value={P} onChange={e => setP(+e.target.value)} />
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Distância r</span><span className="ctrl-num">{fmt(r, 1)} m</span></div>
          <input type="range" min="0.5" max="50" step="0.5" value={r} onChange={e => setR(+e.target.value)} />
        </div>

        <div className="section-label">Escala de Referência</div>
        <div className="db-scale">
          {referencias.map(ref => (
            <div key={ref.db} className="db-ref" style={{ top: `${100 - (ref.db / 140) * 100}%` }}>
              {ref.db}dB {ref.label}
            </div>
          ))}
          <div className="db-marker" style={{ top: `${100 - Math.min(140, Math.max(0, beta)) / 140 * 100}%` }} />
        </div>
      </div>

      <div className="main-area">
        <div className="canvas-wrap"><canvas ref={canvasRef} /></div>
      </div>

      <div className="sidebar-r">
        <div className="section-label">Resultado</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">Intensidade I</span><span className="stat-val accent">{I < 0.001 ? I.toExponential(2) : fmt(I, 4)} W/m²</span></div>
          <div className="stat-row"><span className="stat-label">Nível sonoro β</span><span className="stat-val warm">{fmt(beta, 1)} dB</span></div>
        </div>

        <div className="section-label">Equações</div>
        <div className="eq-block">
          <div className="eq-title">Lei do Inverso do Quadrado</div>
          <span className="sym">I</span> <span className="op">=</span> P / (4πr²)
        </div>
        <div className="eq-block">
          <div className="eq-title">Escala de Decibéis</div>
          <span className="sym">β</span> <span className="op">=</span> 10·log₁₀(I/I₀)
          <br /><span className="cmt">I₀ = 10⁻¹² W/m² (limiar de audição)</span>
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
          <div className="calc-h2">1. Velocidade do Som e Comprimento de Onda</div>
          <p className="calc-p">
            No ar, a velocidade do som depende da temperatura (relação empírica, válida perto de 0-40°C):
          </p>
          <div className="big-eq">
            <span className="hi-acc">v = 331 + 0,6·T</span> (m/s, T em °C)
          </div>
          <p className="calc-p">Como toda onda periódica, o som satisfaz a relação fundamental:</p>
          <div className="big-eq">
            <span className="hi-acc">v = λ·f</span>
            <span className="cmt">   ← velocidade = comprimento de onda × frequência</span>
          </div>
        </div>

        <div className="calc-section">
          <div className="calc-h2">2. Intensidade e a Lei do Inverso do Quadrado</div>
          <p className="calc-p">
            Uma fonte sonora pontual de potência P espalha essa energia igualmente em todas as direções.
            A uma distância r, a energia está distribuída pela área de uma esfera de raio r:
          </p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">I = potência / área = P / (4πr²)</span><span className="step-desc">área da esfera = 4πr²</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq"><span className="hi-acc">I ∝ 1/r²</span></span><span className="step-desc">dobrar a distância → intensidade cai 4×</span></div>
          </div>
        </div>

        <div className="calc-section">
          <div className="calc-h2">3. Por que a Escala de Decibéis é Logarítmica</div>
          <p className="calc-p">
            O ouvido humano percebe intensidades numa faixa enorme — de 10⁻¹² W/m² (limiar de audição) a
            mais de 1 W/m² (limiar da dor), uma razão de 10¹². Uma escala logarítmica comprime essa faixa
            em números manejáveis, e também combina com a percepção humana (aproximadamente logarítmica):
          </p>
          <div className="big-eq">
            <span className="hi-acc">β = 10·log₁₀(I/I₀)</span>, I₀ = 10⁻¹² W/m²
          </div>
          <p className="calc-p">Cada aumento de 10 dB corresponde a multiplicar a intensidade física por 10×.</p>
        </div>

        <div className="calc-section">
          <div className="calc-h2">4. Dedução do Efeito Doppler</div>
          <p className="calc-p">
            <strong>Fonte em movimento, observador parado:</strong> se a fonte se move a v_s em direção ao
            observador, cada nova frente de onda é emitida de um ponto mais próximo do observador, comprimindo
            o comprimento de onda percebido:
          </p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">λ' = (v−v_s)/f</span><span className="step-desc">comprimento de onda comprimido</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq">f_obs = v/λ' = f·v/(v−v_s)</span><span className="step-desc">nova frequência percebida</span></div>
          </div>
          <p className="calc-p">
            <strong>Observador em movimento, fonte parada:</strong> o observador encontra as frentes de onda
            mais rapidamente se estiver se movendo em direção à fonte, percebendo mais cristas por segundo:
          </p>
          <div className="big-eq">
            <span className="hi-acc">f_obs = f·(v+v₀)/v</span>
          </div>
          <p className="calc-p">Combinando os dois efeitos (caso mais geral, ambos em movimento):</p>
          <div className="big-eq">
            <span className="hi-acc">f_obs = f·(v ± v₀)/(v ∓ v_s)</span>
            <span className="cmt">   ← sinais escolhidos conforme aproximação (+num/−denom) ou afastamento</span>
          </div>
        </div>

        <div className="calc-section">
          <div className="calc-h2">5. Exemplo Numérico</div>
          <p className="calc-p">
            Uma ambulância com sirene de 700 Hz se aproxima a 25 m/s de um pedestre parado, com T=20°C.
          </p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">v = 331 + 0,6·20 = 343 m/s</span><span className="step-desc">velocidade do som</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq">f_obs = 700·343/(343−25) = 754,7 Hz</span><span className="step-desc">frequência percebida (mais aguda)</span></div>
            <div className="derivation-step"><span className="step-num">③</span><span className="step-eq">Após passar: f_obs = 700·343/(343+25) = 653,3 Hz</span><span className="step-desc">frequência percebida ao se afastar (mais grave)</span></div>
          </div>
        </div>

      </div>
    </div>
  );
}
