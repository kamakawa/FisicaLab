// src/pages/ExperimentoLeiCoulomb.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FISICA3_BASE_STYLES, ELETRO } from '../styles/fisica3Theme';

const { K } = ELETRO;
const fmt = (n, d = 2) => (typeof n === 'number' && isFinite(n) ? n.toFixed(d) : '—');
const fmtSci = (n) => {
  if (!isFinite(n)) return '—';
  if (Math.abs(n) < 1000 && Math.abs(n) >= 0.01) return n.toFixed(3);
  return n.toExponential(2);
};

const STYLES = FISICA3_BASE_STYLES + ``;

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════
export default function ExperimentoLeiCoulomb() {
  const [tab, setTab] = useState('sim');

  return (
    <>
      <style>{STYLES}</style>
      <div className="app">
        <header className="header">
          <div className="header-title">Lei de Coulomb</div>
          <div className="header-sub">Física 3 · Eletrostática</div>
          <span className="header-tag">F = k·|q₁q₂|/r²</span>
        </header>

        <nav className="tabs">
          {[
            ['sim', 'Simulação'],
            ['grafico', 'Força × Distância'],
            ['calc', 'Cálculo & Derivações'],
          ].map(([id, label]) => (
            <button key={id} className={`tab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </nav>

        {tab === 'sim' && <SimTab />}
        {tab === 'grafico' && <GraficoTab />}
        {tab === 'calc' && <CalcTab />}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ABA 1 — SIMULAÇÃO (força entre duas cargas)
// ═══════════════════════════════════════════════════════════════════════════
function SimTab() {
  const [q1, setQ1] = useState(10);   // μC
  const [q2, setQ2] = useState(-10);  // μC
  const [r0, setR0] = useState(30);   // cm — separação inicial/de referência
  const [massa, setMassa] = useState(5); // g — só usada no modo "soltar"
  const [solto, setSolto] = useState(false);

  const stateRef = useRef({ q1, q2, massa });
  useEffect(() => { stateRef.current = { q1, q2, massa }; }, [q1, q2, massa]);

  const rAtualRef = useRef(r0); // cm, distância atual (muda só quando "solto")
  const velRef = useRef(0);     // cm/s, taxa de variação da separação
  const [rDisp, setRDisp] = useState(r0);
  const rafRef = useRef(null);
  const lastRef = useRef(null);

  const handleReset = () => {
    setSolto(false);
    rAtualRef.current = r0;
    velRef.current = 0;
    setRDisp(r0);
  };

  // Reinicia a separação quando os parâmetros mudam
  useEffect(() => {
    rAtualRef.current = r0;
    velRef.current = 0;
    setRDisp(r0);
    setSolto(false);
  }, [q1, q2, r0, massa]);

  const calcF = (q1uC, q2uC, rCm) => {
    const q1C = q1uC * 1e-6, q2C = q2uC * 1e-6, rM = Math.max(rCm, 0.5) / 100;
    return (K * Math.abs(q1C * q2C)) / (rM * rM);
  };

  useEffect(() => {
    if (!solto) { lastRef.current = null; return; }
    const step = (now) => {
      if (lastRef.current !== null) {
        const dt = Math.min((now - lastRef.current) / 1000, 0.02);
        const s = stateRef.current;
        const atracao = (s.q1 > 0 && s.q2 < 0) || (s.q1 < 0 && s.q2 > 0);
        const F = calcF(s.q1, s.q2, rAtualRef.current);
        const massaKg = s.massa / 1000;
        const aCm = ((F / massaKg) * 100) * (atracao ? -1 : 1); // cm/s² — sinal define se r cresce ou diminui
        velRef.current += aCm * dt;
        rAtualRef.current += velRef.current * dt;

        if (rAtualRef.current <= 1.5) {
          rAtualRef.current = 1.5;
          setSolto(false);
        }
        if (rAtualRef.current >= 90) {
          rAtualRef.current = 90;
          setSolto(false);
        }
        setRDisp(rAtualRef.current);
      }
      lastRef.current = now;
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [solto]);

  const F = calcF(q1, q2, rDisp);
  const atracao = (q1 > 0 && q2 < 0) || (q1 < 0 && q2 > 0);
  const mesmoSinal = !atracao && q1 !== 0 && q2 !== 0;

  const canvasRef = useRef(null);
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    let raf;
    const ctx = cv.getContext('2d');
    let tLocal = 0;
    const draw = () => {
      tLocal += 0.016;
      const dpr = window.devicePixelRatio || 1;
      const W = cv.clientWidth, H = cv.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      const midY = H * 0.5;
      const cx = W / 2;
      const pxPerCm = Math.min(6, (W * 0.4) / rAtualRef.current);
      const halfSep = (rAtualRef.current * pxPerCm) / 2;
      const x1 = cx - halfSep, x2 = cx + halfSep;

      // Linha de conexão
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 5]);
      ctx.beginPath(); ctx.moveTo(x1, midY); ctx.lineTo(x2, midY); ctx.stroke();
      ctx.setLineDash([]);

      const s = stateRef.current;
      const desenhaCarga = (x, qVal, label) => {
        const raio = 16 + Math.min(14, Math.abs(qVal) * 0.6);
        const positiva = qVal >= 0;
        const cor = positiva ? '#EF4444' : '#38BDF8';
        const pulso = 0.9 + 0.1 * Math.sin(tLocal * 3 + x * 0.01);
        const grad = ctx.createRadialGradient(x - 5, midY - 5, 2, x, midY, raio);
        grad.addColorStop(0, positiva ? '#ff9d9d' : '#93c5fd');
        grad.addColorStop(1, cor);
        ctx.beginPath();
        ctx.arc(x, midY, raio * pulso, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.shadowBlur = 16;
        ctx.shadowColor = cor + '99';
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(positiva ? '+' : '−', x, midY);
        ctx.font = "11px 'JetBrains Mono', monospace";
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.fillText(`${label}=${fmt(qVal, 1)}μC`, x, midY + raio + 18);
      };
      desenhaCarga(x1, s.q1, 'q₁');
      desenhaCarga(x2, s.q2, 'q₂');

      // Vetores de força (Newton 3 — iguais e opostos)
      const atracaoAtual = (s.q1 > 0 && s.q2 < 0) || (s.q1 < 0 && s.q2 > 0);
      const FAtual = calcF(s.q1, s.q2, rAtualRef.current);
      const setaLen = Math.min(70, 14 + Math.log10(FAtual + 1) * 22);
      const dir1 = atracaoAtual ? 1 : -1; // q1 aponta pra dentro (atração) ou fora (repulsão)

      const desenhaSeta = (x0, dir, cor) => {
        const xf = x0 + dir * setaLen;
        ctx.beginPath();
        ctx.moveTo(x0, midY - 40);
        ctx.lineTo(x0 + dir * setaLen, midY - 40);
        ctx.strokeStyle = cor;
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(xf, midY - 40);
        ctx.lineTo(xf - dir * 8, midY - 46);
        ctx.lineTo(xf - dir * 8, midY - 34);
        ctx.closePath();
        ctx.fillStyle = cor;
        ctx.fill();
      };
      if (FAtual > 1e-6) {
        desenhaSeta(x1, dir1, '#FBBF24');
        desenhaSeta(x2, -dir1, '#FBBF24');
        ctx.fillStyle = '#FBBF24';
        ctx.font = "bold 11px 'JetBrains Mono', monospace";
        ctx.textAlign = 'center';
        ctx.fillText(`F = ${fmtSci(FAtual)} N`, cx, midY - 56);
      }

      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.fillText(`r = ${fmt(rAtualRef.current, 1)} cm`, cx, midY + 60);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="content">
      <div className="sidebar-l">
        <div className="section-label">Cargas</div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Carga q₁</span><span className="ctrl-num">{fmt(q1, 1)} μC</span></div>
          <input type="range" min="-20" max="20" step="0.5" value={q1} onChange={e => setQ1(+e.target.value)} />
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Carga q₂</span><span className="ctrl-num">{fmt(q2, 1)} μC</span></div>
          <input type="range" min="-20" max="20" step="0.5" value={q2} onChange={e => setQ2(+e.target.value)} />
        </div>

        <div className="section-label">Separação</div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Distância r</span><span className="ctrl-num">{fmt(r0, 1)} cm</span></div>
          <input type="range" min="5" max="80" step="1" value={r0} onChange={e => setR0(+e.target.value)} />
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Massa de cada carga (p/ soltar)</span><span className="ctrl-num">{fmt(massa, 1)} g</span></div>
          <input type="range" min="1" max="50" step="1" value={massa} onChange={e => setMassa(+e.target.value)} />
        </div>

        <div className="btn-row">
          <button className="btn btn-primary" onClick={() => setSolto(true)} disabled={q1 === 0 || q2 === 0}>▶ Soltar</button>
          <button className="btn btn-danger" onClick={handleReset}>↩ Reset</button>
        </div>
        <p style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5, marginTop: 8 }}>
          "Soltar" deixa as cargas livres para se mover sob a própria força (F=ma) — se atraem, colidem;
          se repelem, se afastam até sair de vista.
        </p>
      </div>

      <div className="main-area">
        <div className="canvas-wrap"><canvas ref={canvasRef} /></div>
      </div>

      <div className="sidebar-r">
        <div className="section-label">Resultado</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">Força F</span><span className="stat-val accent">{fmtSci(F)} N</span></div>
          <div className="stat-row"><span className="stat-label">Distância r</span><span className="stat-val">{fmt(rDisp, 1)} cm</span></div>
          <div className="stat-row">
            <span className="stat-label">Natureza</span>
            <span className={`stat-val ${atracao ? 'negativo' : mesmoSinal ? 'positivo' : ''}`}>
              {q1 === 0 || q2 === 0 ? 'sem força (carga nula)' : atracao ? 'atração' : 'repulsão'}
            </span>
          </div>
        </div>

        <div className="section-label">Cargas</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">q₁</span><span className="stat-val positivo">{fmt(q1, 2)} μC</span></div>
          <div className="stat-row"><span className="stat-label">q₂</span><span className="stat-val negativo">{fmt(q2, 2)} μC</span></div>
        </div>

        <div className="section-label">Equação</div>
        <div className="eq-block">
          <div className="eq-title">Lei de Coulomb</div>
          <span className="sym">F</span> <span className="op">=</span> k·|q₁·q₂| / r²
          <br /><span className="cmt">k = 8,99×10⁹ N·m²/C²</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ABA 2 — GRÁFICO FORÇA × DISTÂNCIA
// ═══════════════════════════════════════════════════════════════════════════
function GraficoTab() {
  const [q1, setQ1] = useState(10);
  const [q2, setQ2] = useState(10);
  const [r, setR] = useState(20);

  const calcF = (rCm) => {
    const q1C = q1 * 1e-6, q2C = q2 * 1e-6, rM = Math.max(rCm, 0.5) / 100;
    return (K * Math.abs(q1C * q2C)) / (rM * rM);
  };
  const Fatual = calcF(r);

  const canvasRef = useRef(null);
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    let raf;
    let t = 0;
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
    const rMax = 100;
    const fMax = calcF(5) * 1.1; // força na menor distância plotada define o topo da escala
    const toX = rv => pad.l + (rv / rMax) * plotW;
    const toY = fv => pad.t + plotH - (Math.min(fv, fMax) / fMax) * plotH;

    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, pad.t + plotH); ctx.lineTo(pad.l + plotW, pad.t + plotH); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = "11px 'JetBrains Mono', monospace";
    ctx.textAlign = 'center';
    ctx.fillText('r (cm)', pad.l + plotW / 2, H - 12);
    ctx.save();
    ctx.translate(20, pad.t + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('F (N)', 0, 0);
    ctx.restore();

    ctx.beginPath();
    for (let i = 5; i <= rMax; i += 0.5) {
      const fv = calcF(i);
      const x = toX(i), y = toY(fv);
      i === 5 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#A855F7';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Ponto atual (com brilho pulsante)
    const px = toX(r), py = toY(Math.min(Fatual, fMax));
    const pulso = 1 + 0.25 * Math.sin(t * 3);
    ctx.beginPath();
    ctx.arc(px, py, 6 * pulso, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#A855F7';
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 8 + 6 * pulso;
    ctx.shadowColor = 'rgba(168,85,247,0.7)';
    ctx.stroke();
    ctx.shadowBlur = 0;

      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      ctx.beginPath(); ctx.moveTo(px, pad.t + plotH); ctx.lineTo(px, py); ctx.stroke();
      ctx.setLineDash([]);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [q1, q2, r]);

  return (
    <div className="content">
      <div className="sidebar-l">
        <div className="section-label">Cargas</div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Carga q₁</span><span className="ctrl-num">{fmt(q1, 1)} μC</span></div>
          <input type="range" min="-20" max="20" step="0.5" value={q1} onChange={e => setQ1(+e.target.value)} />
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Carga q₂</span><span className="ctrl-num">{fmt(q2, 1)} μC</span></div>
          <input type="range" min="-20" max="20" step="0.5" value={q2} onChange={e => setQ2(+e.target.value)} />
        </div>

        <div className="section-label">Ponto Analisado</div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Distância r</span><span className="ctrl-num">{fmt(r, 1)} cm</span></div>
          <input type="range" min="5" max="100" step="1" value={r} onChange={e => setR(+e.target.value)} />
        </div>
        <p style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.6 }}>
          A curva é uma hipérbole (F ∝ 1/r²): dobrar a distância reduz a força para ¼; triplicar reduz para 1/9.
        </p>
      </div>

      <div className="main-area">
        <div className="canvas-wrap"><canvas ref={canvasRef} /></div>
      </div>

      <div className="sidebar-r">
        <div className="section-label">No Ponto Atual</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">r</span><span className="stat-val">{fmt(r, 1)} cm</span></div>
          <div className="stat-row"><span className="stat-label">F(r)</span><span className="stat-val accent">{fmtSci(Fatual)} N</span></div>
        </div>

        <div className="section-label">Sensibilidade ao Dobrar r</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">F(r)</span><span className="stat-val warm">{fmtSci(calcF(r))} N</span></div>
          <div className="stat-row"><span className="stat-label">F(2r)</span><span className="stat-val cool">{fmtSci(calcF(r * 2))} N</span></div>
          <div className="stat-row"><span className="stat-label">Razão</span><span className="stat-val">{fmt(calcF(r) / calcF(r * 2), 2)}× (≈4×)</span></div>
        </div>

        <div className="section-label">Equação</div>
        <div className="eq-block">
          <div className="eq-title">Lei do Inverso do Quadrado</div>
          <span className="sym">F</span> <span className="op">∝</span> 1/r²
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
          <div className="calc-h2">1. A Lei de Coulomb</div>
          <p className="calc-p">
            Charles-Augustin de Coulomb mediu experimentalmente (1785, com uma balança de torção) que a
            força entre duas cargas puntiformes é proporcional ao produto das cargas e inversamente
            proporcional ao quadrado da distância entre elas:
          </p>
          <div className="big-eq">
            <span className="hi-acc">F = k·|q₁·q₂| / r²</span>
            <span className="cmt">   ← k = 1/(4πε₀) ≈ 8,99×10⁹ N·m²/C²</span>
          </div>
          <p className="calc-p">
            A direção da força é sempre ao longo da linha que une as duas cargas: <strong>atração</strong> se
            os sinais forem opostos, <strong>repulsão</strong> se forem iguais — em ambos os casos, pela 3ª
            Lei de Newton, as forças em cada carga têm mesmo módulo e sentidos opostos.
          </p>
        </div>

        <div className="calc-section">
          <div className="calc-h2">2. Comparação com a Gravitação Universal</div>
          <p className="calc-p">
            A forma matemática é idêntica à Lei da Gravitação de Newton (F=Gm₁m₂/r²) — ambas são forças
            centrais com dependência 1/r². A diferença fundamental é a escala:
          </p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">k ≈ 8,99×10⁹ N·m²/C²  (Coulomb)</span><span className="step-desc">constante elétrica</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq">G ≈ 6,67×10⁻¹¹ N·m²/kg²  (gravitação)</span><span className="step-desc">constante gravitacional</span></div>
            <div className="derivation-step"><span className="step-num">③</span><span className="step-eq">k/G ≈ 1,35×10²⁰</span><span className="step-desc">a força elétrica é ~10²⁰ vezes mais intensa</span></div>
          </div>
          <p className="calc-p">
            Por isso a força elétrica domina em escala atômica, enquanto a gravidade só se torna relevante
            em escalas planetárias — onde a matéria é eletricamente neutra em grande escala.
          </p>
        </div>

        <div className="calc-section">
          <div className="calc-h2">3. Princípio de Superposição</div>
          <p className="calc-p">
            Quando mais de duas cargas estão presentes, a força resultante sobre uma carga é a{' '}
            <strong>soma vetorial</strong> das forças individuais de cada uma das outras cargas — as forças
            elétricas obedecem ao princípio de superposição linear:
          </p>
          <div className="big-eq">
            <span className="hi-acc">F⃗_total = F⃗₁ + F⃗₂ + F⃗₃ + ...</span>
            <span className="cmt">   ← cada F⃗ᵢ calculada independentemente pela Lei de Coulomb</span>
          </div>
        </div>

        <div className="calc-section">
          <div className="calc-h2">4. Exemplo Numérico</div>
          <p className="calc-p">
            Duas cargas de +10μC e −10μC estão separadas por 30cm no vácuo.
          </p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">q₁=10×10⁻⁶ C, q₂=10×10⁻⁶ C, r=0,3m</span><span className="step-desc">convertendo para unidades SI</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq">F = 8,99×10⁹ × (10⁻⁵×10⁻⁵) / 0,3²</span><span className="step-desc">substituindo na fórmula</span></div>
            <div className="derivation-step"><span className="step-num">③</span><span className="step-eq"><span className="hi-acc">F ≈ 9,99 N</span></span><span className="step-desc">força de atração (sinais opostos)</span></div>
          </div>
        </div>

      </div>
    </div>
  );
}
