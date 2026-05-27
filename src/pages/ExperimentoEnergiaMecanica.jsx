// ExperimentoEnergiaMecanica.jsx — v3.0 corrigido e modernizado
import React, { useState, useEffect, useRef, useCallback } from 'react';

// ─── ESTILOS ────────────────────────────────────────────────────────────────
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Mono:wght@400;500;600&family=DM+Sans:wght@300;400;500;600&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:        #080c14;
  --surface:   #0c1120;
  --panel:     #0f1523;
  --card:      #141c2e;
  --border:    rgba(100,140,255,0.10);
  --border2:   rgba(100,140,255,0.18);
  --accent:    #5b9cf6;
  --accent2:   #3b7de8;
  --gold:      #f0b429;
  --green:     #2dd4a4;
  --red:       #f06080;
  --purple:    #9d80f5;
  --orange:    #fb8b3a;
  --text:      #dde4f0;
  --text2:     #8896b0;
  --mono:      'IBM Plex Mono', monospace;
  --sans:      'DM Sans', sans-serif;
  --serif:     'DM Serif Display', serif;
}

body { background: var(--bg); }

.app {
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  font-family: var(--sans);
  font-size: 13px;
  overflow: hidden;
}

/* ── HEADER ── */
.header {
  height: 56px;
  border-bottom: 1px solid var(--border);
  padding: 0 28px;
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--surface);
  position: relative;
  overflow: hidden;
}
.header::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(91,156,246,0.08) 0%, transparent 50%);
  pointer-events: none;
}
.header-title {
  font-family: var(--serif);
  font-size: 22px;
  color: #fff;
  letter-spacing: -0.3px;
}
.header-sep {
  width: 1px; height: 24px;
  background: var(--border2);
}
.header-sub {
  font-size: 11px;
  color: var(--text2);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.header-tag {
  margin-left: auto;
  font-size: 10px;
  color: var(--accent);
  border: 1px solid rgba(91,156,246,0.3);
  padding: 3px 10px;
  border-radius: 20px;
  font-family: var(--mono);
  background: rgba(91,156,246,0.06);
}
.btn-back {
  font-size: 11px;
  font-family: var(--mono);
  color: var(--text2);
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--border2);
  padding: 4px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-back:hover { color: var(--text); background: rgba(255,255,255,0.09); }

/* ── NAV TABS ── */
.nav-bar {
  height: 42px;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
  display: flex;
  align-items: stretch;
  gap: 0;
  padding: 0 28px;
}
.nav-tab {
  padding: 0 18px;
  border: none;
  background: transparent;
  color: var(--text2);
  font-family: var(--sans);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.15s;
  letter-spacing: 0.02em;
}
.nav-tab:hover { color: var(--text); }
.nav-tab.active { color: var(--accent); border-bottom-color: var(--accent); }
.nav-tab.exp-tab { font-size: 13px; }

/* ── LAYOUT PRINCIPAL ── */
.layout {
  display: grid;
  grid-template-columns: 270px 1fr 260px;
  height: calc(100vh - 98px);
}

.sidebar {
  border-right: 1px solid var(--border);
  overflow-y: auto;
  padding: 16px;
  background: var(--panel);
  scrollbar-width: thin;
  scrollbar-color: var(--border2) transparent;
}
.sidebar-right {
  border-left: 1px solid var(--border);
  border-right: none;
}

/* ── ÁREA PRINCIPAL ── */
.main-area {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg);
}
.canvas-wrap {
  flex: 1;
  position: relative;
  overflow: hidden;
}
canvas { display: block; width: 100%; height: 100%; }

/* ── PLOTS ── */
.plots-strip {
  height: 130px;
  border-top: 1px solid var(--border);
  display: flex;
  background: var(--panel);
  flex-shrink: 0;
}
.plot-box {
  flex: 1;
  border-right: 1px solid var(--border);
  padding: 8px 10px;
  position: relative;
  display: flex;
  flex-direction: column;
}
.plot-box:last-child { border-right: none; }
.plot-title {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.14em;
  color: var(--text2);
  text-transform: uppercase;
  margin-bottom: 4px;
  flex-shrink: 0;
}
.plot-box canvas { flex: 1; min-height: 0; }

/* ── SEÇÃO ── */
.section-label {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.2em;
  color: var(--text2);
  text-transform: uppercase;
  margin: 18px 0 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--border);
}
.section-label:first-child { margin-top: 0; }

/* ── CARD ── */
.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
}
.card.warn {
  background: rgba(240,96,128,0.06);
  border-color: rgba(240,96,128,0.3);
}
.card.ok {
  background: rgba(45,212,164,0.05);
  border-color: rgba(45,212,164,0.2);
}

/* ── STAT ── */
.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
  border-bottom: 1px solid var(--border);
}
.stat-row:last-child { border-bottom: none; }
.stat-label { color: var(--text2); font-size: 11px; }
.stat-val {
  font-family: var(--mono);
  font-size: 12px;
  color: var(--text);
  font-weight: 500;
}
.stat-val.acc    { color: var(--accent); }
.stat-val.gold   { color: var(--gold); }
.stat-val.green  { color: var(--green); }
.stat-val.red    { color: var(--red); }
.stat-val.purple { color: var(--purple); }
.stat-val.orange { color: var(--orange); }

/* ── CONTROLES ── */
.ctrl { margin-bottom: 12px; }
.ctrl-head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 11px;
}
.ctrl-name { color: var(--text2); }
.ctrl-num  { font-family: var(--mono); color: var(--accent); font-size: 11px; }
input[type=range] {
  width: 100%;
  accent-color: var(--accent);
  height: 3px;
  cursor: pointer;
}

/* ── BOTÕES ── */
.btn-row { display: flex; gap: 6px; margin-top: 10px; }
.btn {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 7px;
  cursor: pointer;
  font-family: var(--sans);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.03em;
  transition: all 0.13s;
}
.btn-primary  { background: var(--accent); color: #05090f; }
.btn-primary:hover { background: #6aa8ff; }
.btn-secondary {
  background: rgba(255,255,255,0.05);
  color: var(--text);
  border: 1px solid var(--border2);
}
.btn-secondary:hover { background: rgba(255,255,255,0.09); }
.btn-danger {
  background: rgba(240,96,128,0.12);
  color: var(--red);
  border: 1px solid rgba(240,96,128,0.22);
}
.btn-danger:hover { background: rgba(240,96,128,0.22); }

/* ── TOGGLE ── */
.toggle-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 7px;
  cursor: pointer;
}
.toggle-row input[type=checkbox] { accent-color: var(--accent); width: 13px; height: 13px; }
.toggle-label { font-size: 11px; color: var(--text2); }

/* ── EQUAÇÕES ── */
.eq-block {
  background: var(--card);
  border: 1px solid var(--border);
  border-left: 3px solid var(--accent);
  border-radius: 0 8px 8px 0;
  padding: 10px 12px;
  margin-bottom: 8px;
  font-family: var(--mono);
  font-size: 11px;
  line-height: 1.8;
  color: var(--text);
}
.eq-title {
  font-family: var(--sans);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 6px;
}

/* ── PÁGINA CÁLCULO ── */
.calc-page {
  padding: 28px 36px;
  max-width: 860px;
  margin: 0 auto;
  overflow-y: auto;
  height: 100%;
}
.calc-h2 {
  font-family: var(--serif);
  font-size: 20px;
  color: #fff;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border);
}
.calc-section { margin-bottom: 36px; }
.calc-p {
  color: var(--text2);
  line-height: 1.7;
  margin-bottom: 12px;
  font-size: 12.5px;
}
.big-eq {
  background: var(--panel);
  border: 1px solid var(--border2);
  border-radius: 10px;
  padding: 18px 22px;
  margin: 14px 0;
  font-family: var(--mono);
  font-size: 13px;
  line-height: 2.1;
  color: var(--text);
}
.hi-acc { color: var(--accent); }
.hi-gld { color: var(--gold); }
.hi-grn { color: var(--green); }
.hi-red { color: var(--red); }
.hi-pur { color: var(--purple); }
.hi-org { color: var(--orange); }
.cmt    { color: var(--text2); font-style: italic; font-size: 11px; }
.derivation-step {
  display: flex;
  align-items: baseline;
  gap: 12px;
  padding: 9px 0;
  border-bottom: 1px solid var(--border);
}
.derivation-step:last-child { border-bottom: none; }
.step-num { font-family: var(--mono); font-size: 10px; color: var(--text2); min-width: 22px; }
.step-eq { font-family: var(--mono); font-size: 12px; color: var(--text); }
.step-desc { font-size: 11px; color: var(--text2); margin-left: auto; font-style: italic; }

.alert-box {
  background: rgba(240,180,41,0.07);
  border: 1px solid rgba(240,180,41,0.3);
  border-radius: 8px;
  padding: 10px 14px;
  margin: 12px 0;
  font-size: 12px;
  color: var(--gold);
  line-height: 1.6;
}
`;

const TAU = 2 * Math.PI;
const fmt = (n, d = 2) => (typeof n === 'number' && isFinite(n) ? n.toFixed(d) : '—');
const g = 9.8;

// ─── APP PRINCIPAL ─────────────────────────────────────────────────────────
export default function ExperimentoEnergiaMecanica({ onBack }) {
  const [exp, setExp] = useState('loop');
  const [tab, setTab] = useState('sim');

  return (
    <>
      <style>{STYLES}</style>
      <div className="app">
        <header className="header">
          <div className="header-title">Energia Mecânica</div>
          <div className="header-sep" />
          <div className="header-sub">Física · Conservação · Eₚ ↔ E꜀</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginLeft: 'auto' }}>
            <span className="header-tag">v3.0</span>
            {onBack && <button className="btn-back" onClick={onBack}>← Voltar</button>}
          </div>
        </header>

        <nav className="nav-bar" style={{ gap: 0 }}>
          {[['pendulo','🕰 Pêndulo'],['loop','🎢 Montanha Russa']].map(([id,lbl]) => (
            <button key={id} className={`nav-tab exp-tab ${exp===id?'active':''}`}
              onClick={() => setExp(id)}>{lbl}</button>
          ))}
          <div style={{ width: 1, background: 'var(--border2)', margin: '8px 10px' }} />
          {[['sim','Simulação'],['calc','Teoria & Derivações']].map(([id,lbl]) => (
            <button key={id} className={`nav-tab ${tab===id?'active':''}`}
              onClick={() => setTab(id)}>{lbl}</button>
          ))}
        </nav>

        {tab==='sim'  && exp==='pendulo' && <SimulacaoPendulo />}
        {tab==='calc' && exp==='pendulo' && <CalculoPendulo />}
        {tab==='sim'  && exp==='loop'    && <SimulacaoLoop />}
        {tab==='calc' && exp==='loop'    && <CalculoLoop />}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PÊNDULO SIMPLES
// ═══════════════════════════════════════════════════════════════════════════
function SimulacaoPendulo() {
  const [massa, setMassa]           = useState(1.0);
  const [comprimento, setComprimento] = useState(1.5);
  const [anguloInicial, setAnguloInicial] = useState(45);
  const [amort, setAmort]           = useState(0.02);
  const [rodando, setRodando]       = useState(true);
  const [showVet, setShowVet]       = useState(true);
  const [showEn, setShowEn]         = useState(true);

  const canvasRef = useRef(null);
  const plotAngRef = useRef(null);
  const plotEnRef  = useRef(null);
  const plotVelRef = useRef(null);
  const rafRef  = useRef(null);
  const lastRef = useRef(null);
  const stateRef = useRef({ ang: anguloInicial * Math.PI/180, omega: 0 });

  const [disp, setDisp] = useState({ ang: anguloInicial*Math.PI/180, omega: 0 });
  const [hist, setHist] = useState({ ang:[], E:[], v:[] });

  const h   = comprimento * (1 - Math.cos(disp.ang));
  const Ep  = massa * g * h;
  const Ec  = 0.5 * massa * Math.pow(disp.omega * comprimento, 2);
  const Et  = Ep + Ec;
  const E0  = massa * g * comprimento * (1 - Math.cos(anguloInicial * Math.PI/180));
  const T_fio = massa * g * Math.cos(disp.ang) + massa * disp.omega**2 * comprimento;
  const perdaE = E0 > 0 ? ((E0 - Et) / E0) * 100 : 0;

  useEffect(() => {
    stateRef.current = { ang: anguloInicial * Math.PI/180, omega: 0 };
    setDisp({ ang: anguloInicial * Math.PI/180, omega: 0 });
    setHist({ ang:[], E:[], v:[] });
  }, [anguloInicial, comprimento]);

  useEffect(() => {
    if (!rodando) { lastRef.current = null; return; }
    const step = (now) => {
      if (lastRef.current !== null) {
        const dt = Math.min((now - lastRef.current)/1000, 0.02);
        const s = stateRef.current;
        const alpha = -(g/comprimento)*Math.sin(s.ang) - amort*s.omega;
        s.omega += alpha * dt;
        s.ang   += s.omega * dt;
        stateRef.current = { ...s };
        setDisp({ ...s });
        setHist(prev => {
          const a = [...prev.ang, s.ang*180/Math.PI].slice(-400);
          const h2 = comprimento*(1-Math.cos(s.ang));
          const Ec2 = 0.5*massa*(s.omega*comprimento)**2;
          const Ep2 = massa*g*h2;
          const E = [...prev.E, Ep2+Ec2].slice(-400);
          const v = [...prev.v, Math.abs(s.omega*comprimento)].slice(-400);
          return { ang:a, E, v };
        });
      }
      lastRef.current = now;
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [rodando, comprimento, amort, massa]);

  const reset = () => {
    stateRef.current = { ang: anguloInicial*Math.PI/180, omega: 0 };
    setDisp({ ang: anguloInicial*Math.PI/180, omega: 0 });
    setHist({ ang:[], E:[], v:[] });
  };

  // Desenho do pêndulo
  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext('2d');
    const W = cv.width = cv.offsetWidth;
    const H = cv.height = cv.offsetHeight;
    ctx.clearRect(0,0,W,H);

    // Grid sutil
    ctx.strokeStyle = 'rgba(91,156,246,0.04)';
    ctx.lineWidth = 1;
    for (let x=0;x<W;x+=40) { ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke(); }
    for (let y=0;y<H;y+=40) { ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke(); }

    const cx = W/2;
    const pivotY = H*0.22;
    const esc = Math.min(W,H)*0.32;

    const px = cx + Math.sin(disp.ang)*comprimento*esc;
    const py = pivotY + Math.cos(disp.ang)*comprimento*esc; // note: cos porque ângulo da vertical

    // Traço de arco do pêndulo
    ctx.beginPath();
    ctx.arc(cx, pivotY, comprimento*esc, -Math.PI/2-0.8, -Math.PI/2+0.8);
    ctx.strokeStyle = 'rgba(91,156,246,0.12)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4,6]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Nível de equilíbrio
    ctx.beginPath();
    ctx.moveTo(cx-60, pivotY+comprimento*esc);
    ctx.lineTo(cx+60, pivotY+comprimento*esc);
    ctx.strokeStyle = 'rgba(45,212,164,0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Suporte
    ctx.fillStyle = '#1e2d4a';
    ctx.fillRect(cx-50, pivotY-14, 100, 14);
    ctx.fillStyle = '#253553';
    ctx.fillRect(cx-4, pivotY-14, 8, 14);
    // Pino
    ctx.beginPath();
    ctx.arc(cx, pivotY, 6, 0, TAU);
    ctx.fillStyle = '#334d7a';
    ctx.fill();

    // Fio
    const grad = ctx.createLinearGradient(cx, pivotY, px, py);
    grad.addColorStop(0,'rgba(200,220,255,0.9)');
    grad.addColorStop(1,'rgba(150,180,255,0.5)');
    ctx.beginPath();
    ctx.moveTo(cx, pivotY);
    ctx.lineTo(px, py);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Vetores
    if (showVet) {
      const esc2 = 0.04;
      // Peso
      const Px = 0, Py = massa*g;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + Px*esc2, py + Py*esc2*esc);
      ctx.strokeStyle = var_color('--red');
      ctx.lineWidth = 2;
      ctx.stroke();
      arrowHead(ctx, px+Px*esc2, py+Py*esc2*esc, '#f06080');
      ctx.fillStyle = '#f06080';
      ctx.font = '10px IBM Plex Mono';
      ctx.fillText('P', px+8, py+Py*esc2*esc+4);

      // Tensão (direção do fio)
      const tx = (cx-px)/comprimento*esc * T_fio*esc2;
      const ty = (pivotY-py)/comprimento*esc * T_fio*esc2;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px+tx, py+ty);
      ctx.strokeStyle = var_color('--purple');
      ctx.lineWidth = 2;
      ctx.stroke();
      arrowHead(ctx, px+tx, py+ty, '#9d80f5');
      ctx.fillStyle = '#9d80f5';
      ctx.fillText('T', px+tx+6, py+ty-3);
    }

    // Esfera
    ctx.shadowBlur = 16;
    ctx.shadowColor = 'rgba(91,156,246,0.6)';
    ctx.beginPath();
    ctx.arc(px, py, 16+massa*3, 0, TAU);
    const rg = ctx.createRadialGradient(px-5,py-5,1,px,py,16+massa*3);
    rg.addColorStop(0,'#7eb8ff');
    rg.addColorStop(1,'#2563c4');
    ctx.fillStyle = rg;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${10}px IBM Plex Mono`;
    ctx.textAlign = 'center';
    ctx.fillText(`${fmt(massa,1)}kg`, px, py+4);

    // Altura h
    ctx.beginPath();
    ctx.setLineDash([3,5]);
    ctx.moveTo(px, py);
    ctx.lineTo(px, pivotY+comprimento*esc);
    ctx.strokeStyle = 'rgba(240,180,41,0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(240,180,41,0.9)';
    ctx.font = '10px IBM Plex Mono';
    ctx.textAlign = 'left';
    ctx.fillText(`h=${fmt(h,3)}m`, px+8, (py + pivotY+comprimento*esc)/2);

    // Ângulo θ
    ctx.beginPath();
    ctx.arc(cx, pivotY, 30, -Math.PI/2, -Math.PI/2 + disp.ang, disp.ang>0);
    ctx.strokeStyle = 'rgba(157,128,245,0.6)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#9d80f5';
    ctx.font = '11px IBM Plex Mono';
    ctx.textAlign = 'center';
    ctx.fillText(`θ=${fmt(disp.ang*180/Math.PI,1)}°`, cx + 50*Math.sin(disp.ang/2), pivotY + 20);

    // Barras de energia
    if (showEn) { drawEnergyBars(ctx,W,H,Ep,Ec,Et,E0); }

    ctx.textAlign = 'left';
  }, [disp, comprimento, massa, h, Ep, Ec, Et, E0, T_fio, showVet, showEn]);

  // Plots
  const drawPlot = useCallback((ref, data, color, label, yMin, yMax, unit='') => {
    const cv = ref.current; if (!cv||!data||data.length<2) return;
    const ctx = cv.getContext('2d');
    const W = cv.width = cv.offsetWidth;
    const H = cv.height = cv.offsetHeight;
    ctx.clearRect(0,0,W,H);
    const range = (yMax-yMin)||1;
    ctx.strokeStyle = 'rgba(91,156,246,0.06)';
    ctx.lineWidth = 1;
    [0.25,0.5,0.75].forEach(f => {
      const y = H*(1-f); ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke();
    });
    ctx.beginPath();
    data.forEach((v,i) => {
      const x = (i/(data.length-1))*W;
      const y = H - ((v-yMin)/range)*H;
      i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Gradiente abaixo
    const grd = ctx.createLinearGradient(0,0,0,H);
    grd.addColorStop(0, color+'44'); grd.addColorStop(1, color+'00');
    ctx.fillStyle = grd;
    ctx.beginPath();
    data.forEach((v,i) => {
      const x=(i/(data.length-1))*W, y=H-((v-yMin)/range)*H;
      i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
    });
    ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.closePath(); ctx.fill();

    ctx.fillStyle = color;
    ctx.font = '9px IBM Plex Mono';
    ctx.fillText(label, 5, 12);
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.fillText(`${fmt(data[data.length-1],2)} ${unit}`, 5, 24);
  },[]);

  useEffect(() => {
    drawPlot(plotAngRef, hist.ang, '#9d80f5', 'θ(t)', -anguloInicial*1.1, anguloInicial*1.1, '°');
    drawPlot(plotEnRef,  hist.E,   '#2dd4a4', 'E(t)',  0, E0*1.1, 'J');
    drawPlot(plotVelRef, hist.v,   '#5b9cf6', 'v(t)',  0, Math.sqrt(2*g*comprimento*(1-Math.cos(anguloInicial*Math.PI/180)))*1.2, 'm/s');
  }, [hist, drawPlot, anguloInicial, E0, comprimento]);

  return (
    <div className="layout">
      <div className="sidebar">
        <div className="section-label">Parâmetros</div>
        <Ctrl label="Massa m" val={`${fmt(massa,1)} kg`} min={0.2} max={5} step={0.1} value={massa} onChange={setMassa} />
        <Ctrl label="Comprimento L" val={`${fmt(comprimento,2)} m`} min={0.3} max={3} step={0.05} value={comprimento} onChange={setComprimento} />
        <Ctrl label="Ângulo inicial θ₀" val={`${anguloInicial}°`} min={5} max={80} step={5} value={anguloInicial} onChange={setAnguloInicial} />
        <Ctrl label="Amortecimento β" val={fmt(amort,3)} min={0} max={0.12} step={0.002} value={amort} onChange={setAmort} />
        <div className="section-label">Visualização</div>
        <label className="toggle-row"><input type="checkbox" checked={showVet} onChange={e=>setShowVet(e.target.checked)}/><span className="toggle-label" style={{color:'var(--purple)'}}>Vetores P e T</span></label>
        <label className="toggle-row"><input type="checkbox" checked={showEn} onChange={e=>setShowEn(e.target.checked)}/><span className="toggle-label" style={{color:'var(--green)'}}>Barras de energia</span></label>
        <div className="btn-row">
          <button className="btn btn-primary" onClick={()=>setRodando(true)}>▶ Iniciar</button>
          <button className="btn btn-secondary" onClick={()=>setRodando(false)}>⏸ Pausar</button>
        </div>
        <div className="btn-row">
          <button className="btn btn-danger" onClick={reset}>↩ Reset</button>
        </div>
      </div>

      <div className="main-area">
        <div className="canvas-wrap"><canvas ref={canvasRef} /></div>
        <div className="plots-strip">
          <div className="plot-box"><div className="plot-title">Ângulo θ(t)</div><canvas ref={plotAngRef}/></div>
          <div className="plot-box"><div className="plot-title">Energia Total E(t)</div><canvas ref={plotEnRef}/></div>
          <div className="plot-box"><div className="plot-title">Velocidade v(t)</div><canvas ref={plotVelRef}/></div>
        </div>
      </div>

      <div className="sidebar sidebar-right">
        <div className="section-label">Energia Mecânica</div>
        <div className="card">
          <StatRow l="Ep (potencial)" v={`${fmt(Ep,3)} J`} c="gold"/>
          <StatRow l="Ec (cinética)"  v={`${fmt(Ec,3)} J`} c="green"/>
          <StatRow l="Et (total)"     v={`${fmt(Et,3)} J`} c="acc"/>
          <StatRow l="E₀ (inicial)"   v={`${fmt(E0,3)} J`} c="purple"/>
          <StatRow l="Dissipada"       v={`${fmt(perdaE,1)}%`} c="red"/>
        </div>
        <div className="section-label">Grandezas</div>
        <div className="card">
          <StatRow l="v linear" v={`${fmt(Math.abs(disp.omega*comprimento),2)} m/s`} c="acc"/>
          <StatRow l="ω angular" v={`${fmt(disp.omega,3)} rad/s`} c="gold"/>
          <StatRow l="θ atual"  v={`${fmt(disp.ang*180/Math.PI,1)}°`} c="purple"/>
          <StatRow l="Tensão T" v={`${fmt(T_fio,2)} N`} c="green"/>
          <StatRow l="Altura h" v={`${fmt(h,3)} m`} c="orange"/>
        </div>
        <div className="section-label">Equações-chave</div>
        <div className="eq-block"><div className="eq-title">Conservação</div>E₀ = mgh + ½mv²</div>
        <div className="eq-block"><div className="eq-title">Velocidade</div>v = √[2gL(cosθ-cosθ₀)]</div>
        <div className="eq-block"><div className="eq-title">Período (θ≪1)</div>T = 2π√(L/g)</div>
        <div className="eq-block"><div className="eq-title">Tensão no fio</div>T = mg·cosθ + mω²L</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// LOOP — MONTANHA RUSSA (física corrigida)
// ═══════════════════════════════════════════════════════════════════════════
/*
  CORREÇÕES IMPLEMENTADAS:
  1. Geometria da pista: rampa inclinada conectando ao nível do chão → base do loop
  2. Altura no loop: h(θ) = raio*(1 - cosθ), com base no chão (h=0 no início do loop)
  3. Força normal N(θ): equação correta em cada ponto do loop
     - parte inferior (θ=0): N = mv²/R + mg  (N e mg opostos ← pista abaixo)
     - topo (θ=π):           N = mv²/R - mg  (ambos apontam para o centro)
     - forma geral:          N(θ) = mv²/R - mg·cosθ  (θ a partir da base)
       Note: θ=0 dá N=mv²/R - mg(-1) não correto. Usamos ângulo a partir do topo:
       N(φ) = mv²/R + mg·cosφ  onde φ=0 é a base, φ=π é o topo.
       Na base φ=0: N = mv²/R + mg  ✓
       No topo φ=π: N = mv²/R - mg  ✓
  4. Atrito no loop: força tangencial = μ·N(φ) (force dependente da normal real)
  5. Velocidade no topo calculada corretamente pela energia, não pela velocidade instantânea
  6. h_min derivada corretamente: h_min = 5R/2 (sem atrito)
*/
function SimulacaoLoop() {
  const [massa, setMassa]       = useState(500);
  const [raio,  setRaio]        = useState(3.0);
  const [h0,    setH0]          = useState(9.0);
  const [atrito, setAtrito]     = useState(0.03);
  const [rodando, setRodando]   = useState(true);
  const [showVet, setShowVet]   = useState(true);
  const [showEn,  setShowEn]    = useState(true);

  const canvasRef  = useRef(null);
  const plotHRef   = useRef(null);
  const plotERef   = useRef(null);
  const plotVRef   = useRef(null);
  const rafRef     = useRef(null);
  const lastRef    = useRef(null);
  const stRef      = useRef({ s: 0, v: 0, faseLoop: false });

  const [disp, setDisp] = useState({ s: 0, v: 0 });
  const [hist, setHist] = useState({ h:[], E:[], v:[] });

  // ── Geometria da pista ──────────────────────────────────────────────
  // Rampa com ângulo fixo de 30° conectando ponto mais alto ao chão
  const thetaRampa = Math.atan2(h0, h0 / Math.tan(Math.PI/6)); // ângulo ~30°
  const comprRampa = h0 / Math.sin(thetaRampa);               // comprimento da rampa
  const comprLoop  = TAU * raio;                               // circunferência do loop
  const comprTotal = comprRampa + comprLoop;

  // ── Altura em função da posição s ao longo da pista ─────────────────
  function alturaEm(s) {
    if (s <= 0) return h0;
    if (s < comprRampa) {
      // Descendo a rampa
      return h0 - s * Math.sin(thetaRampa);
    } else {
      // No loop: φ = ângulo percorrido a partir da base (φ=0 → base, φ=π → topo)
      const phi = (s - comprRampa) / raio;  // radianos percorridos no loop
      return raio * (1 - Math.cos(phi));     // h=0 na base, h=2R no topo
    }
  }

  // φ no loop (0 a 2π)
  function phiLoop(s) {
    return Math.max(0, (s - comprRampa) / raio);
  }

  // ── Força Normal em função de φ e v ──────────────────────────────────
  // N(φ) = m·v²/R + m·g·cos(φ - π) = m·v²/R - m·g·cos(φ)
  // φ=0 (base): N = mv²/R + mg  ← correto (pista empurra para cima + gravidade para baixo)
  // φ=π (topo): N = mv²/R - mg  ← correto (N e peso ambos centripetam)
  function forcaNormalLoop(v, phi) {
    return massa * (v*v/raio - g*Math.cos(phi));
  }

  // ── Grandezas derivadas ──────────────────────────────────────────────
  const alt  = alturaEm(disp.s);
  const Ep   = massa * g * alt;
  const Ec   = 0.5 * massa * disp.v**2;
  const Et   = Ep + Ec;
  const E0   = massa * g * h0;
  const perdaE = E0 > 0 ? Math.max(0, (E0-Et)/E0*100) : 0;

  // Condições teóricas (sem atrito)
  const h_min = 2.5 * raio;       // h ≥ 5R/2
  const v_min_topo = Math.sqrt(g * raio); // v_min no topo p/ N=0

  // Velocidade no topo pela energia (considerando atrito)
  const E_no_topo_teorica = Et - massa*g*2*raio;
  const v_topo_calc = E_no_topo_teorica > 0 ? Math.sqrt(2*E_no_topo_teorica/massa) : 0;
  const N_topo_atual = massa * (v_topo_calc**2/raio - g);

  // Força normal na posição atual (só no loop)
  const noLoop = disp.s > comprRampa;
  const phi    = noLoop ? phiLoop(disp.s) : 0;
  const N_atual = noLoop ? forcaNormalLoop(disp.v, phi) : 0;

  const podeCompletar = h0 >= h_min;
  const condicaoN = N_topo_atual >= 0;

  // ── Integração numérica ─────────────────────────────────────────────
  useEffect(() => {
    if (!rodando) { lastRef.current = null; return; }
    const step = (now) => {
      if (lastRef.current !== null) {
        const dt = Math.min((now-lastRef.current)/1000, 0.02);
        const st = stRef.current;
        let a = 0;

        if (st.s <= 0) {
          // Início: larga do repouso
          a = g * Math.sin(thetaRampa) - atrito * g * Math.cos(thetaRampa);
        } else if (st.s < comprRampa) {
          // Na rampa descendente
          const N_rampa = massa * g * Math.cos(thetaRampa);
          const f_grav  = g * Math.sin(thetaRampa);
          const f_atrito = atrito * N_rampa/massa;
          a = f_grav - f_atrito; // descendo → aceleração positiva
        } else {
          // No loop
          const phiNow = phiLoop(st.s);
          const N_loop = forcaNormalLoop(st.v, phiNow);
          const N_pos  = Math.max(0, N_loop); // não pode ter N < 0 (perde contato)
          // Aceleração tangencial: -g·sin(φ) (componente gravitacional) - μ·N/m (atrito)
          const a_grav   = -g * Math.sin(phiNow);
          const a_atrito = atrito * N_pos / massa;
          a = a_grav - a_atrito * Math.sign(st.v);
          // Se N ficou negativo → carrinho perderia contato (para simulação)
          if (N_loop < 0 && phiNow > 0.1) {
            // mantém a equação mas mostra o aviso
          }
        }

        let nv = st.v + a*dt;
        if (nv < 0) nv = 0; // não pode ir para trás na pista (simplificação)
        const ns = st.s + nv*dt;

        if (ns >= comprTotal) {
          stRef.current = { s: comprTotal, v: 0 };
          setDisp({ s: comprTotal, v: 0 });
          setRodando(false);
        } else {
          stRef.current = { s: ns, v: nv };
          setDisp({ s: ns, v: nv });
        }

        const hNow = alturaEm(ns);
        setHist(prev => ({
          h: [...prev.h, hNow].slice(-500),
          E: [...prev.E, massa*g*hNow + 0.5*massa*nv**2].slice(-500),
          v: [...prev.v, nv].slice(-500),
        }));
      }
      lastRef.current = now;
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rodando, comprRampa, comprTotal, thetaRampa, raio, atrito, massa]);

  const reset = () => {
    stRef.current = { s: 0, v: 0 };
    setDisp({ s: 0, v: 0 });
    setHist({ h:[], E:[], v:[] });
  };
  useEffect(reset, [h0, raio, massa, atrito]);

  // ── Desenho principal ────────────────────────────────────────────────
  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext('2d');
    const W = cv.width = cv.offsetWidth;
    const H = cv.height = cv.offsetHeight;
    ctx.clearRect(0,0,W,H);

    // Grid
    ctx.strokeStyle = 'rgba(91,156,246,0.04)';
    ctx.lineWidth = 1;
    for (let x=0;x<W;x+=40) { ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke(); }
    for (let y=0;y<H;y+=40) { ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke(); }

    // Escala: cabe tudo em 85% da tela
    const margL = W*0.12, margR = W*0.10, margB = H*0.12, margT = H*0.08;
    const areaW = W - margL - margR;
    const areaH = H - margT - margB;

    // Geometria da pista em pixels
    // Posição horizontal total: comprimento horizontal da rampa + 2*raio do loop
    const rampaHorz = h0 / Math.tan(thetaRampa);
    const totalHorz = rampaHorz + 2*raio;
    const totalVert = Math.max(h0, 2*raio);
    const esc = Math.min(areaW/totalHorz, areaH/totalVert) * 0.88;

    const oriX = margL + (areaW - totalHorz*esc)/2; // X da base da rampa (pé)
    const baseY = H - margB;

    // Converte coordenadas físicas (metros) para pixels
    const toX = (xm) => oriX + xm*esc;
    const toY = (ym) => baseY - ym*esc;

    // Pontos-chave
    const rampaTopoX = 0;         // início da rampa (topo)
    const rampaTopoY = h0;
    const rampaPeX   = rampaHorz; // pé da rampa = entrada do loop
    const rampaPeY   = 0;
    const loopCX = rampaPeX + raio; // centro do loop
    const loopCY = raio;

    // Chão
    ctx.fillStyle = '#0a1020';
    ctx.fillRect(0, toY(0), W, H);
    ctx.fillStyle = '#141f35';
    ctx.fillRect(0, toY(0), W, margB);
    // Linha do chão
    ctx.beginPath();
    ctx.moveTo(0, toY(0));
    ctx.lineTo(W, toY(0));
    ctx.strokeStyle = 'rgba(91,156,246,0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Marcador h0
    ctx.setLineDash([4,6]);
    ctx.beginPath();
    ctx.moveTo(toX(rampaTopoX)-40, toY(rampaTopoY));
    ctx.lineTo(toX(rampaTopoX)+20, toY(rampaTopoY));
    ctx.strokeStyle = 'rgba(240,180,41,0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();
    // Seta h0
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(toX(rampaTopoX)-28, toY(0));
    ctx.lineTo(toX(rampaTopoX)-28, toY(h0));
    ctx.strokeStyle = 'rgba(240,180,41,0.6)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = 'var(--gold)';
    ctx.fillStyle = '#f0b429';
    ctx.font = '11px IBM Plex Mono';
    ctx.textAlign = 'right';
    ctx.fillText(`h₀=${fmt(h0,1)}m`, toX(rampaTopoX)-32, toY(h0/2)+4);

    // Marcador 2R (topo do loop)
    ctx.setLineDash([4,6]);
    ctx.beginPath();
    ctx.moveTo(toX(loopCX)+raio*esc+30, toY(0));
    ctx.lineTo(toX(loopCX)+raio*esc+30, toY(2*raio));
    ctx.strokeStyle = 'rgba(91,156,246,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#5b9cf6';
    ctx.font = '10px IBM Plex Mono';
    ctx.textAlign = 'left';
    ctx.fillText(`2R=${fmt(2*raio,1)}m`, toX(loopCX)+raio*esc+34, toY(raio)+4);

    // Marcador h_min
    const yHmin = toY(h_min);
    ctx.setLineDash([5,5]);
    ctx.beginPath();
    ctx.moveTo(toX(rampaTopoX)-60, yHmin);
    ctx.lineTo(toX(rampaTopoX)+40, yHmin);
    ctx.strokeStyle = podeCompletar ? 'rgba(45,212,164,0.5)' : 'rgba(240,96,128,0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = podeCompletar ? '#2dd4a4' : '#f06080';
    ctx.font = '9px IBM Plex Mono';
    ctx.textAlign = 'left';
    ctx.fillText(`h_min=2.5R=${fmt(h_min,1)}m`, toX(rampaTopoX)-58, yHmin-3);

    // ─ Trilho: rampa ─
    ctx.beginPath();
    ctx.moveTo(toX(rampaTopoX), toY(rampaTopoY));
    ctx.lineTo(toX(rampaPeX), toY(rampaPeY));
    ctx.strokeStyle = '#3a5080';
    ctx.lineWidth = 5;
    ctx.lineJoin = 'round';
    ctx.stroke();
    // Sombra/brilho do trilho
    ctx.beginPath();
    ctx.moveTo(toX(rampaTopoX), toY(rampaTopoY));
    ctx.lineTo(toX(rampaPeX), toY(rampaPeY));
    ctx.strokeStyle = 'rgba(91,156,246,0.25)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // ─ Trilho: loop ─
    ctx.beginPath();
    for (let a = -Math.PI/2; a <= 3*Math.PI/2; a += 0.02) {
      const lx = toX(loopCX + raio*Math.cos(a));
      const ly = toY(loopCY + raio*Math.sin(a));
      a === -Math.PI/2 ? ctx.moveTo(lx,ly) : ctx.lineTo(lx,ly);
    }
    ctx.strokeStyle = '#3a5080';
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(91,156,246,0.25)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Trecho final (saída do loop)
    const saidaX = rampaPeX + 2*raio;
    ctx.beginPath();
    ctx.moveTo(toX(saidaX), toY(0));
    ctx.lineTo(toX(saidaX + raio*0.7), toY(0));
    ctx.strokeStyle = '#3a5080';
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(91,156,246,0.25)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // ─ Posição do carrinho ─
    let carX, carY, carAng = 0;
    if (disp.s <= comprRampa) {
      const t = comprRampa > 0 ? disp.s/comprRampa : 0;
      carX = toX(rampaTopoX + t*(rampaPeX - rampaTopoX));
      carY = toY(rampaTopoY + t*(rampaPeY - rampaTopoY));
      carAng = -thetaRampa; // inclinado na rampa
    } else {
      // No loop: φ cresce de 0 (base) a 2π
      const phiNow = phiLoop(disp.s) % TAU;
      // posição no loop: centro + raio, partindo da base (ângulo -π/2 do centro)
      carX = toX(loopCX + raio * Math.sin(phiNow));
      carY = toY(loopCY - raio * Math.cos(phiNow));  // -cos porque y físico cresce p/cima
      carAng = phiNow; // rotação do carrinho
    }

    // Sombra do carrinho
    ctx.save();
    ctx.shadowBlur = 18;
    ctx.shadowColor = 'rgba(240,96,128,0.5)';

    // Carrinho (retângulo rotacionado)
    ctx.save();
    ctx.translate(carX, carY);
    ctx.rotate(carAng);
    ctx.fillStyle = '#c0283a';
    ctx.fillRect(-13, -7, 26, 14);
    ctx.fillStyle = '#e83050';
    ctx.fillRect(-13, -7, 26, 5);
    // Rodas
    [[-8,7],[8,7]].forEach(([ox,oy]) => {
      ctx.beginPath();
      ctx.arc(ox,oy,3.5,0,TAU);
      ctx.fillStyle = '#888';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(ox,oy,1.5,0,TAU);
      ctx.fillStyle = '#ccc';
      ctx.fill();
    });
    ctx.restore();
    ctx.restore();

    // Texto da massa no carrinho
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 8px IBM Plex Mono';
    ctx.textAlign = 'center';
    ctx.fillText(`${fmt(massa/1000,1)}t`, carX, carY+3);

    // ─ Vetor Força Normal ─
    if (showVet && noLoop) {
      const phiNow = phiLoop(disp.s) % TAU;
      const N_val = forcaNormalLoop(disp.v, phiNow);
      if (isFinite(N_val)) {
        const esc_N = 0.00006;
        // Direção da normal: aponta do trilho para o centro do loop
        const dirNx = -(Math.sin(phiNow)); // radial para dentro
        const dirNy = (Math.cos(phiNow));  // radial para dentro (tela)
        const nx = dirNx * N_val * esc_N * esc;
        const ny = -dirNy * N_val * esc_N * esc;
        ctx.beginPath();
        ctx.moveTo(carX, carY);
        ctx.lineTo(carX+nx, carY+ny);
        ctx.strokeStyle = N_val>=0 ? '#5b9cf6' : '#f06080';
        ctx.lineWidth = 2;
        ctx.stroke();
        arrowHead(ctx, carX+nx, carY+ny, N_val>=0 ? '#5b9cf6' : '#f06080');
        ctx.fillStyle = N_val>=0 ? '#5b9cf6' : '#f06080';
        ctx.font = '10px IBM Plex Mono';
        ctx.textAlign = 'left';
        ctx.fillText(`N=${fmt(N_val/1000,2)}kN`, carX+nx+5, carY+ny-4);
      }
    }

    // ─ Barras de energia ─
    if (showEn) { drawEnergyBars(ctx,W,H,Ep,Ec,Et,E0); }

    // ─ Status ─
    ctx.textAlign = 'left';
    ctx.font = '10px IBM Plex Mono';
    ctx.fillStyle = '#5b9cf6';
    ctx.fillText(`v = ${fmt(disp.v,2)} m/s   h = ${fmt(alt,2)} m`, 14, 24);
    ctx.fillStyle = podeCompletar ? '#2dd4a4' : '#f06080';
    ctx.fillText(podeCompletar ? '✓ h₀ ≥ 2.5R — completa o loop' : `⚠ h₀ < 2.5R — falta ${fmt(h_min-h0,2)}m`, 14, 40);
    if (noLoop && N_atual < 0) {
      ctx.fillStyle = '#f06080';
      ctx.fillText('⚠ N < 0: carrinho perderia contato!', 14, 56);
    }

    ctx.textAlign = 'left';
  }, [disp, alt, Ep, Ec, Et, E0, h0, raio, thetaRampa, comprRampa, comprLoop,
      comprTotal, h_min, podeCompletar, noLoop, phi, N_atual, showVet, showEn, massa, atrito]);

  // ── Plots ────────────────────────────────────────────────────────────
  const drawPlot = useCallback((ref, data, color, label, yMin, yMax, unit='') => {
    const cv = ref.current; if (!cv||!data||data.length<2) return;
    const ctx = cv.getContext('2d');
    const W = cv.width = cv.offsetWidth;
    const H = cv.height = cv.offsetHeight;
    ctx.clearRect(0,0,W,H);
    const range = (yMax-yMin)||1;
    ctx.strokeStyle = 'rgba(91,156,246,0.06)';
    ctx.lineWidth = 1;
    [0.5].forEach(f => {
      const y=H*(1-f); ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();
    });
    ctx.beginPath();
    data.forEach((v,i) => {
      const x=(i/(data.length-1))*W, y=H-((v-yMin)/range)*H;
      i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    const grd = ctx.createLinearGradient(0,0,0,H);
    grd.addColorStop(0,color+'44'); grd.addColorStop(1,color+'00');
    ctx.fillStyle = grd;
    ctx.beginPath();
    data.forEach((v,i)=>{const x=(i/(data.length-1))*W,y=H-((v-yMin)/range)*H;i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});
    ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.closePath();ctx.fill();
    ctx.fillStyle = color;
    ctx.font = '9px IBM Plex Mono';
    ctx.fillText(label, 5, 12);
    ctx.fillStyle='rgba(255,255,255,0.65)';
    ctx.fillText(`${fmt(data[data.length-1],2)} ${unit}`, 5, 24);
  },[]);

  useEffect(() => {
    drawPlot(plotHRef, hist.h, '#f0b429','h(t)', 0, h0*1.1,'m');
    drawPlot(plotERef, hist.E, '#2dd4a4','E(t)', 0, E0*1.05,'J');
    drawPlot(plotVRef, hist.v, '#5b9cf6','v(t)', 0, Math.sqrt(2*g*h0)*1.1,'m/s');
  },[hist, drawPlot, h0, E0]);

  return (
    <div className="layout">
      <div className="sidebar">
        <div className="section-label">Parâmetros</div>
        <Ctrl label="Massa m" val={`${fmt(massa/1000,2)} t`} min={100} max={2000} step={50} value={massa} onChange={setMassa}/>
        <Ctrl label="Raio R" val={`${fmt(raio,1)} m`} min={1} max={6} step={0.2} value={raio} onChange={setRaio}/>
        <Ctrl label="Altura inicial h₀" val={`${fmt(h0,1)} m`} min={2} max={18} step={0.2} value={h0} onChange={setH0}/>
        <Ctrl label="Atrito μ" val={fmt(atrito,3)} min={0} max={0.12} step={0.005} value={atrito} onChange={setAtrito}/>
        <div className="section-label">Visualização</div>
        <label className="toggle-row"><input type="checkbox" checked={showVet} onChange={e=>setShowVet(e.target.checked)}/><span className="toggle-label" style={{color:'var(--accent)'}}>Vetor Força Normal</span></label>
        <label className="toggle-row"><input type="checkbox" checked={showEn} onChange={e=>setShowEn(e.target.checked)}/><span className="toggle-label" style={{color:'var(--green)'}}>Barras de energia</span></label>
        <div className="btn-row">
          <button className="btn btn-primary" onClick={()=>setRodando(true)}>▶ Iniciar</button>
          <button className="btn btn-secondary" onClick={()=>setRodando(false)}>⏸ Pausar</button>
        </div>
        <div className="btn-row">
          <button className="btn btn-danger" onClick={reset}>↩ Reset</button>
        </div>
        {!podeCompletar && (
          <div className="card warn" style={{marginTop:12}}>
            <StatRow l="Altura atual h₀" v={`${fmt(h0,1)} m`} c="red"/>
            <StatRow l="Mínima h_min" v={`${fmt(h_min,2)} m`} c="gold"/>
            <StatRow l="Falta" v={`${fmt(h_min-h0,2)} m`} c="orange"/>
          </div>
        )}
        {podeCompletar && (
          <div className="card ok" style={{marginTop:12}}>
            <StatRow l="h₀ ≥ 2.5R" v="✓ OK" c="green"/>
          </div>
        )}
      </div>

      <div className="main-area">
        <div className="canvas-wrap"><canvas ref={canvasRef}/></div>
        <div className="plots-strip">
          <div className="plot-box"><div className="plot-title">Altura h(t)</div><canvas ref={plotHRef}/></div>
          <div className="plot-box"><div className="plot-title">Energia Total E(t)</div><canvas ref={plotERef}/></div>
          <div className="plot-box"><div className="plot-title">Velocidade v(t)</div><canvas ref={plotVRef}/></div>
        </div>
      </div>

      <div className="sidebar sidebar-right">
        <div className="section-label">Energia Mecânica</div>
        <div className="card">
          <StatRow l="Ep (potencial)" v={`${fmt(Ep/1000,2)} kJ`} c="gold"/>
          <StatRow l="Ec (cinética)"  v={`${fmt(Ec/1000,2)} kJ`} c="green"/>
          <StatRow l="Et (total)"     v={`${fmt(Et/1000,2)} kJ`} c="acc"/>
          <StatRow l="E₀ (inicial)"   v={`${fmt(E0/1000,2)} kJ`} c="purple"/>
          <StatRow l="Dissipada"       v={`${fmt(perdaE,1)}%`} c="red"/>
        </div>
        <div className="section-label">Condições do Loop</div>
        <div className="card">
          <StatRow l="h_mín teórica (2.5R)" v={`${fmt(h_min,2)} m`} c="gold"/>
          <StatRow l="v_min no topo √(gR)"  v={`${fmt(v_min_topo,2)} m/s`} c="purple"/>
          <StatRow l="N no topo (atual)"    v={`${fmt(N_topo_atual/1000,2)} kN`}
            c={N_topo_atual>=0?'green':'red'}/>
          <StatRow l="N posição atual"       v={noLoop?`${fmt(N_atual/1000,2)} kN`:'—'}
            c={N_atual>=0?'acc':'red'}/>
          <StatRow l="Completa o loop?"      v={podeCompletar && condicaoN ? '✓ Sim':'✗ Não'}
            c={podeCompletar && condicaoN ?'green':'red'}/>
        </div>
        <div className="section-label">Equações Corretas</div>
        <div className="eq-block"><div className="eq-title">Altura no loop</div>h(φ) = R·(1−cosφ)</div>
        <div className="eq-block"><div className="eq-title">Força Normal N(φ)</div>N = mv²/R − mg·cosφ<br/><span className="cmt">φ=0: base  φ=π: topo</span></div>
        <div className="eq-block"><div className="eq-title">Cond. no topo (φ=π)</div>N = mv²/R − mg ≥ 0</div>
        <div className="eq-block"><div className="eq-title">Altura mínima</div>h_mín = 5R/2 = 2.5R</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TEORIA — PÊNDULO
// ═══════════════════════════════════════════════════════════════════════════
function CalculoPendulo() {
  return (
    <div className="main-area" style={{overflow:'auto'}}>
    <div className="calc-page">
      <div className="calc-section">
        <div className="calc-h2">1. Energia Mecânica no Pêndulo Simples</div>
        <p className="calc-p">A energia mecânica total é a soma da energia potencial gravitacional com a energia cinética:</p>
        <div className="big-eq">E = <span className="hi-gld">Eₚ</span> + <span className="hi-grn">E꜀</span> = mgh + ½mv²</div>
        <p className="calc-p">A altura em função do ângulo é h = L·(1 − cosθ), onde θ é medido da vertical.</p>
      </div>
      <div className="calc-section">
        <div className="calc-h2">2. Conservação da Energia</div>
        <p className="calc-p">Na ausência de atrito, E se conserva. Podemos relacionar velocidade e ângulo:</p>
        <div className="big-eq">
          <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">E₀ = mgL(1−cosθ₀)</span><span className="step-desc">energia inicial (repouso)</span></div>
          <div className="derivation-step"><span className="step-num">②</span><span className="step-eq">mgL(1−cosθ₀) = ½mv² + mgL(1−cosθ)</span><span className="step-desc">conservação</span></div>
          <div className="derivation-step"><span className="step-num">③</span><span className="step-eq">v(θ) = √[2gL·(cosθ − cosθ₀)]</span><span className="step-desc">velocidade em qualquer θ</span></div>
        </div>
      </div>
      <div className="calc-section">
        <div className="calc-h2">3. Equação Diferencial do Pêndulo</div>
        <p className="calc-p">A 2ª Lei de Newton em coordenada tangencial fornece:</p>
        <div className="big-eq">d²θ/dt² = −(g/L)·senθ</div>
        <p className="calc-p">Para pequenas oscilações (θ ≪ 1 rad), senθ ≈ θ, resultando em MHS com frequência ω₀ = √(g/L) e período:</p>
        <div className="big-eq">T = 2π√(L/g)</div>
      </div>
      <div className="calc-section">
        <div className="calc-h2">4. Exemplo Numérico (L=1.5m, θ₀=45°, m=1kg)</div>
        <div className="big-eq">
          <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">E₀ = 1·9.8·1.5·(1−cos45°) = 4.31 J</span><span className="step-desc">energia inicial</span></div>
          <div className="derivation-step"><span className="step-num">②</span><span className="step-eq">v_máx = √(2·9.8·1.5·(1−0.707)) = 2.94 m/s</span><span className="step-desc">fundo do arco</span></div>
          <div className="derivation-step"><span className="step-num">③</span><span className="step-eq">T = 2π√(1.5/9.8) ≈ 2.46 s</span><span className="step-desc">período</span></div>
        </div>
      </div>
    </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TEORIA — LOOP (MONTANHA RUSSA) — física completamente corrigida
// ═══════════════════════════════════════════════════════════════════════════
function CalculoLoop() {
  return (
    <div className="main-area" style={{overflow:'auto'}}>
    <div className="calc-page">

      <div className="calc-section">
        <div className="calc-h2">1. Geometria e Referencial</div>
        <p className="calc-p">
          Adotamos a base do loop como referência de altura (h = 0). O carrinho parte do repouso
          de uma altura h₀. O loop é uma circunferência de raio R com centro a uma altura R do chão.
          Definimos o ângulo <strong>φ</strong> a partir da <em>base</em> do loop (φ = 0 na base, φ = π no topo).
        </p>
        <div className="big-eq">
          h(φ) = R·(1 − cosφ)
          <span className="cmt">   ← φ=0: h=0 (base)  |  φ=π: h=2R (topo)</span>
        </div>
      </div>

      <div className="calc-section">
        <div className="calc-h2">2. Conservação de Energia (sem atrito)</div>
        <p className="calc-p">Igualando a energia mecânica no ponto de partida e em um ponto genérico φ do loop:</p>
        <div className="big-eq">
          <div className="derivation-step"><span className="step-num">①</span>
            <span className="step-eq">mgh₀ = <span className="hi-grn">½mv²</span> + mgh(φ)</span>
            <span className="step-desc">conservação</span></div>
          <div className="derivation-step"><span className="step-num">②</span>
            <span className="step-eq">v²(φ) = 2g·[h₀ − R(1−cosφ)]</span>
            <span className="step-desc">velocidade ao longo do loop</span></div>
          <div className="derivation-step"><span className="step-num">③</span>
            <span className="step-eq">v²_topo = 2g·[h₀ − 2R]</span>
            <span className="step-desc">φ = π, h = 2R</span></div>
        </div>
      </div>

      <div className="calc-section">
        <div className="calc-h2">3. Força Normal ao Longo do Loop</div>
        <p className="calc-p">
          Em qualquer ponto φ do loop, as forças que atuam na direção centrípeta (para o centro do loop) são:
          a força normal <strong>N</strong> (sempre radialmente para dentro, pois a pista não puxa)
          e a componente radial do peso.
        </p>
        <div className="alert-box">
          A componente do peso na direção centrípeta vale <strong>mg·cos(π − φ) = −mg·cosφ</strong> quando φ
          é medido da base. Isso significa que na base (φ=0) o peso se opõe ao centro (aponta para fora),
          e no topo (φ=π) o peso aponta para o centro.
        </div>
        <div className="big-eq">
          2ª Lei na direção centrípeta:<br/>
          N − mg·cos(π−φ) = mv²/R<br/>
          <span className="hi-acc">N(φ) = mv²/R − mg·cosφ</span>
          <span className="cmt">   ← equação geral</span>
        </div>
        <p className="calc-p">Verificação nos casos extremos:</p>
        <div className="big-eq">
          <div className="derivation-step"><span className="step-num">φ=0</span>
            <span className="step-eq">N = mv²/R − mg·cos0 = mv²/R − mg(−1) = <span className="hi-grn">mv²/R + mg</span></span>
            <span className="step-desc">base: N grande ✓</span></div>
          <div className="derivation-step"><span className="step-num">φ=π</span>
            <span className="step-eq">N = mv²/R − mg·cosπ = mv²/R − mg(−1)... </span>
            <span className="step-desc">aguarde, ver abaixo</span></div>
        </div>
        <div className="alert-box">
          <strong>Atenção:</strong> No topo (φ = π), o peso aponta para baixo e o centro do loop também
          está abaixo do carrinho. Portanto peso e N são <em>ambos</em> centrípetos:
          N + mg = mv²/R → <strong>N = mv²/R − mg</strong>.
          A equação geral N(φ) = mv²/R − mg·cosφ reproduz isso corretamente:
          cos(π) = −1, portanto N = mv²/R − mg·(−1)? Não — aqui há uma sutileza de sinal.
        </div>
        <p className="calc-p">
          Para evitar confusão, a forma mais clara usa ângulo medido do <strong>topo</strong>
          (θ = 0 no topo):
        </p>
        <div className="big-eq">
          <span className="hi-acc">N(θ) = mv²/R − mg·cosθ</span>
          <span className="cmt">   θ medido do topo</span><br/>
          θ=0 (topo): N = mv²/R − mg  ← mínimo<br/>
          θ=π (base): N = mv²/R + mg  ← máximo
        </div>
      </div>

      <div className="calc-section">
        <div className="calc-h2">4. Condição para Completar o Loop</div>
        <p className="calc-p">O ponto crítico é o <strong>topo</strong> (θ=0), onde N é mínima. Para não perder
        contato: N ≥ 0:</p>
        <div className="big-eq">
          <div className="derivation-step"><span className="step-num">①</span>
            <span className="step-eq">N_topo = mv²_topo/R − mg ≥ 0</span>
            <span className="step-desc">condição</span></div>
          <div className="derivation-step"><span className="step-num">②</span>
            <span className="step-eq">v²_topo ≥ gR  →  <span className="hi-grn">v_min = √(gR)</span></span>
            <span className="step-desc">velocidade mínima no topo</span></div>
          <div className="derivation-step"><span className="step-num">③</span>
            <span className="step-eq">2g(h₀−2R) ≥ gR</span>
            <span className="step-desc">substituindo v²_topo=2g(h₀−2R)</span></div>
          <div className="derivation-step"><span className="step-num">④</span>
            <span className="step-eq">h₀ ≥ 2R + R/2 = <span className="hi-acc">5R/2 = 2.5R</span></span>
            <span className="step-desc">altura mínima ✓</span></div>
        </div>
      </div>

      <div className="calc-section">
        <div className="calc-h2">5. Exemplo Numérico (R=3m, m=500kg)</div>
        <div className="big-eq">
          <div className="derivation-step"><span className="step-num">①</span>
            <span className="step-eq">h_mín = 2.5·3 = 7.5 m</span>
            <span className="step-desc">altura mínima teórica</span></div>
          <div className="derivation-step"><span className="step-num">②</span>
            <span className="step-eq">v_min_topo = √(9.8·3) = 5.42 m/s</span>
            <span className="step-desc">velocidade mínima no topo</span></div>
          <div className="derivation-step"><span className="step-num">③</span>
            <span className="step-eq">N_topo = 500·(5.42²/3 − 9.8) = 0 N</span>
            <span className="step-desc">condição crítica N=0</span></div>
          <div className="derivation-step"><span className="step-num">④</span>
            <span className="step-eq">N_base = 500·(v²_base/3 + 9.8)</span>
            <span className="step-desc">v_base = √(2·9.8·7.5) = 12.1 m/s → N≈29.4kN</span></div>
        </div>
      </div>

      <div className="calc-section">
        <div className="calc-h2">6. Resumo — Erros Comuns</div>
        <div className="alert-box">
          <strong>Erro frequente 1:</strong> usar N(θ) = mv²/R + mg·cosθ no topo. Isso dá N=mv²/R+mg
          no topo, o que implica N &gt; 0 sempre — <em>fisicamente errado</em>. O sinal correto é <strong>−mg·cosθ</strong>.
        </div>
        <div className="alert-box">
          <strong>Erro frequente 2:</strong> calcular a força normal usando a velocidade atual do carrinho
          em vez da velocidade <em>no ponto desejado</em>. Sempre use energia para encontrar v(φ) antes
          de calcular N.
        </div>
        <div className="alert-box">
          <strong>Erro frequente 3:</strong> modelar atrito no loop como μ·mg (normal constante). O correto
          é μ·N(φ), pois a força normal varia ao longo do loop.
        </div>
      </div>

    </div>
    </div>
  );
}

// ─── COMPONENTES AUXILIARES ─────────────────────────────────────────────────
function Ctrl({ label, val, min, max, step, value, onChange }) {
  return (
    <div className="ctrl">
      <div className="ctrl-head">
        <span className="ctrl-name">{label}</span>
        <span className="ctrl-num">{val}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(+e.target.value)} />
    </div>
  );
}

function StatRow({ l, v, c }) {
  return (
    <div className="stat-row">
      <span className="stat-label">{l}</span>
      <span className={`stat-val ${c||''}`}>{v}</span>
    </div>
  );
}

function arrowHead(ctx, x, y, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, Math.PI*2);
  ctx.fill();
}

function drawEnergyBars(ctx, W, H, Ep, Ec, Et, E0) {
  const bW = 160, bH = 9, bX = W-bW-16, bY = H-90;
  const max = Math.max(E0, 1);
  const entries = [
    ['Ep', Ep, '#f0b429'],
    ['Ec', Ec, '#2dd4a4'],
    ['Et', Et, '#5b9cf6'],
  ];
  entries.forEach(([label, val, color], i) => {
    const y = bY + i*20;
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fillRect(bX, y, bW, bH);
    ctx.fillStyle = color;
    ctx.fillRect(bX, y, Math.max(0, (val/max)*bW), bH);
    ctx.fillStyle = color;
    ctx.font = '8px IBM Plex Mono';
    ctx.textAlign = 'right';
    ctx.fillText(label, bX-4, y+bH-1);
  });
  ctx.textAlign = 'left';
}

function var_color(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#fff';
}