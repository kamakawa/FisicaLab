// ExperimentoMUV.jsx — versão profissional para ensino superior

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";

import MUVGraph from "../components/Muvgraph";
import MUVEquations from "../components/Muvequations";
import MUVTheory from "../components/Muvtheory";
import MUVTable from "../components/Muvtable";
import MUVAnalysis from "../components/Muvanalysis";
import MUVCalculus from "../components/MuvCalculus";

const MODES = [
  {
    value: "geral",
    label: "MRUV Geral",
    desc: "Aceleração constante qualquer no eixo x",
  },
  {
    value: "queda",
    label: "Queda Livre",
    desc: "g = 9,8 m/s² (vertical, sentido negativo)",
  },
];

const TABS = [
  { id: "sim", label: "Simulação", icon: "" },
  { id: "graphs", label: "Gráficos", icon: "" },
  { id: "equations", label: "Equações", icon: "" },
  { id: "calculus", label: "Cálculo Diferencial e Integral", icon: "" },
  { id: "analysis", label: "Análise Física", icon: "" },
  { id: "table", label: "Tabela de Dados", icon: "" },
];

export default function ExperimentoMUV() {
  const [tab, setTab] = useState("sim");
  const [modo, setModo] = useState("geral");

  const [v0, setV0] = useState(8);
  const [a, setA] = useState(2);
  const [s0, setS0] = useState(0);
  const [tmax, setTmax] = useState(10);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);

  const [showVectors, setShowVectors] = useState(true);

  const rafRef = useRef(null);
  const lastTimeRef = useRef(null);

  const calcV = (v0, a, t) => v0 + a * t;
  const calcS = (v0, a, t, s0) => s0 + v0 * t + 0.5 * a * t * t;

  const v = calcV(v0, a, t);
  const s = calcS(v0, a, t, s0);

  const energia = Math.abs(0.5 * v * v);

  const handleModeChange = (newMode) => {
    setModo(newMode);
    setT(0);
    setPlaying(false);

    if (newMode === "queda") {
      setV0(0);
      setA(-9.8);
      setS0(50);
    } else {
      setV0(8);
      setA(2);
      setS0(0);
    }
    setTmax(5);
  };

  const loop = useCallback(
    (ts) => {
      if (!playing) return;

      if (lastTimeRef.current === null) lastTimeRef.current = ts;

      const dt = Math.min((ts - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = ts;

      setT((prev) => {
        let next = prev + dt;
        
        // Para queda livre: quando atinge o solo (s ≤ 0), para no solo
        if (modo === "queda") {
          const nextS = calcS(v0, a, next, s0);
          if (nextS <= 0) {
            setPlaying(false);
            // Encontra o tempo exato em que atinge o solo
            const tStop = solveQuadratic(0.5 * a, v0, s0);
            return tStop > 0 && tStop < next ? tStop : next;
          }
        }
        
        if (next >= tmax) {
          setPlaying(false);
          return tmax;
        }
        return next;
      });
      
      rafRef.current = requestAnimationFrame(loop);
    },
    [playing, tmax, modo, v0, a, s0]
  );

  // Resolve equação quadrática para encontrar tempo de impacto
  const solveQuadratic = (A, B, C) => {
    const delta = B * B - 4 * A * C;
    if (delta < 0) return null;
    const t1 = (-B - Math.sqrt(delta)) / (2 * A);
    const t2 = (-B + Math.sqrt(delta)) / (2 * A);
    return t1 > 0 ? t1 : t2 > 0 ? t2 : null;
  };

  useEffect(() => {
    if (playing) {
      lastTimeRef.current = null;
      rafRef.current = requestAnimationFrame(loop);
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, loop]);

  const handleStart = () => setPlaying(true);
  const handlePause = () => setPlaying(false);
  const handleReset = () => {
    setPlaying(false);
    setT(0);
  };

  const sharedProps = {
    v0,
    a,
    s0,
    t,
    tmax,
    modo,
    showVectors,
  };

  return (
    <div className="exp-container">
      <div className="exp-header">
        <h1>MRU<span>V</span></h1>
        <p>Movimento Retilíneo Uniformemente Variado — Simulador Interativo</p>
      </div>

      <div className="exp-grid">
        {/* Sidebar com Cards */}
        <div className="exp-sidebar">
          
          <div className="exp-card">
            <div className="exp-card-title">Modo de Simulação</div>
            <div className="exp-mode-selector">
              {MODES.map((m) => (
                <button
                  key={m.value}
                  className={`exp-mode-btn ${modo === m.value ? "active" : ""}`}
                  onClick={() => handleModeChange(m.value)}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
              {MODES.find((m) => m.value === modo)?.desc}
            </p>
          </div>

          <div className="exp-card">
            <div className="exp-card-title">Parâmetros Físicos</div>

            <div className="exp-control">
              <div className="exp-control-label">
                <span>Velocidade inicial (v₀)</span>
                <span className="exp-value">{v0.toFixed(1)} m/s</span>
              </div>
              <input type="range" className="exp-range" min={modo === "queda" ? 0 : -20} max="30" step="0.5" value={v0}
                onChange={(e) => { setV0(Number(e.target.value)); setT(0); setPlaying(false); }} disabled={modo === "queda"} />
            </div>

            <div className="exp-control">
              <div className="exp-control-label">
                <span>Aceleração (a)</span>
                <span className="exp-value" style={{ color: "var(--accent)" }}>{a.toFixed(1)} m/s²</span>
              </div>
              <input type="range" className="exp-range" min="-15" max="15" step="0.5" value={a}
                onChange={(e) => { setA(Number(e.target.value)); setT(0); setPlaying(false); }} disabled={modo === "queda"} />
            </div>

            <div className="exp-control">
              <div className="exp-control-label">
                <span>Posição inicial (s₀)</span>
                <span className="exp-value">{s0.toFixed(0)} m</span>
              </div>
              <input type="range" className="exp-range" min={modo === "queda" ? 0 : -30} max={modo === "queda" ? 100 : 50} step="1" value={s0}
                onChange={(e) => { setS0(Number(e.target.value)); setT(0); setPlaying(false); }} />
            </div>
          </div>

          <div className="exp-card">
             <div className="exp-btn-group">
                <button className="exp-btn primary" onClick={handleStart}>▶ Iniciar</button>
                <button className="exp-btn" onClick={handlePause}>⏸ Pausar</button>
                <button className="exp-btn" onClick={handleReset}>⟳ Reset</button>
              </div>
          </div>

          <div className="exp-card">
            <div className="exp-card-title">Valores Instantâneos</div>
            <div className="exp-stats-grid">
              <div className="exp-stat">
                <div className="exp-stat-label">Tempo (s)</div>
                <div className="exp-stat-val">{t.toFixed(2)}</div>
              </div>
              <div className="exp-stat">
                <div className="exp-stat-label">Velocidade (m/s)</div>
                <div className="exp-stat-val" style={{ color: v >= 0 ? 'var(--secondary)' : 'var(--accent)' }}>{v.toFixed(2)}</div>
              </div>
              <div className="exp-stat">
                <div className="exp-stat-label">Posição (m)</div>
                <div className="exp-stat-val">{s.toFixed(2)}</div>
              </div>
            </div>
          </div>

        </div>

        {/* Viewer Area */}
        <div className="exp-viewer">
          <div className="exp-tabs">
            {TABS.map((tb) => (
              <button key={tb.id} className={`exp-tab ${tab === tb.id ? "active" : ""}`} onClick={() => setTab(tb.id)}>
                {tb.label}
              </button>
            ))}
          </div>
          
          {/* Conteúdo das abas... */}
          <div style={{ padding: '20px', height: '100%' }}>
            {tab === "sim" && <MUVGraph {...sharedProps} animated />}
            {tab === "graphs" && <MUVGraph {...sharedProps} showAllCharts />} 
            {tab === "equations" && <MUVEquations {...sharedProps} />}
            {tab === "calculus" && <MUVCalculus {...sharedProps} />}
            {tab === "analysis" && <MUVAnalysis {...sharedProps} />}
            {tab === "table" && <MUVTable {...sharedProps} />}          
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, unit, color = "#3b82f6" }) {
  return (
    <div className="muv-metric">
      <div className="muv-metric-label">{label}</div>
      <div className="muv-metric-value" style={{ color }}>
        {value}
        <span className="muv-metric-unit">{unit}</span>
      </div>
    </div>
  );
}