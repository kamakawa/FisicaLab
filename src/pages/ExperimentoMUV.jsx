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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap');

        * {
          box-sizing: border-box;
        }

        .muv-root {
          position: relative;
          overflow: hidden;
          font-family: 'Inter', sans-serif;
          background: linear-gradient(135deg, #0a0a0a 0%, #141414 100%);
          min-height: 100vh;
          color: #e0e0e0;
        }

        .muv-header {
          background: rgba(10, 10, 10, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(100, 100, 100, 0.15);
          padding: 20px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
        }

        .muv-logo {
          font-family: 'JetBrains Mono', monospace;
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #3b82f6;
        }

        .muv-logo span {
          color: #22c55e;
        }

        .muv-subtitle {
          color: #666;
          font-size: 13px;
          margin-top: 4px;
        }

        .muv-tabs {
          display: flex;
          gap: 4px;
          padding: 16px 24px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          flex-wrap: wrap;
        }

        .muv-tab {
          border: none;
          background: transparent;
          color: #666;
          padding: 10px 20px;
          border-radius: 8px 8px 0 0;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .muv-tab:hover {
          color: #aaa;
          background: rgba(59,130,246,0.05);
        }

        .muv-tab.active {
          color: #3b82f6;
          background: rgba(59,130,246,0.1);
          border-bottom: 2px solid #3b82f6;
        }

        .muv-body {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 20px;
          padding: 20px 24px;
          min-height: calc(100vh - 120px);
        }

        @media (max-width: 950px) {
          .muv-body {
            grid-template-columns: 1fr;
          }
        }

        .muv-sidebar {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .muv-card {
          background: rgba(20, 20, 20, 0.8);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(100, 100, 100, 0.1);
          border-radius: 16px;
          padding: 20px;
          transition: border-color 0.2s ease;
        }

        .muv-card:hover {
          border-color: rgba(59,130,246,0.25);
        }

        .muv-card-title {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
          font-size: 11px;
          font-weight: 600;
          color: #3b82f6;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .muv-select {
          width: 100%;
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(100,100,100,0.2);
          border-radius: 10px;
          padding: 12px;
          color: #e0e0e0;
          font-size: 14px;
          font-weight: 500;
          outline: none;
          transition: all 0.2s ease;
        }

        .muv-select:hover {
          border-color: #3b82f6;
        }

        .muv-select option {
          background: #1a1a1a;
        }

        .muv-mode-desc {
          margin-top: 10px;
          padding: 10px 12px;
          border-radius: 10px;
          background: rgba(59,130,246,0.05);
          color: #888;
          font-size: 12px;
        }

        .muv-ctrl {
          margin-bottom: 18px;
        }

        .muv-ctrl.disabled {
          opacity: 0.4;
          pointer-events: none;
        }

        .muv-ctrl-label {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .muv-ctrl-name {
          color: #aaa;
          font-size: 13px;
          font-weight: 500;
        }

        .muv-ctrl-val {
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          font-weight: 600;
          color: #3b82f6;
          background: rgba(59,130,246,0.1);
          padding: 2px 8px;
          border-radius: 20px;
        }

        .muv-range {
          width: 100%;
          appearance: none;
          height: 4px;
          border-radius: 2px;
          background: rgba(100,100,100,0.2);
          outline: none;
        }

        .muv-range::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3b82f6;
          border: 2px solid #0a0a0a;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .muv-range::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          background: #60a5fa;
        }

        .muv-checkbox {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 12px;
          padding: 10px;
          border-radius: 10px;
          background: rgba(59,130,246,0.03);
          cursor: pointer;
        }

        .muv-checkbox input {
          width: 18px;
          height: 18px;
          accent-color: #3b82f6;
        }

        .muv-checkbox span {
          color: #aaa;
          font-size: 12px;
        }

        .muv-metrics {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .muv-metric {
          background: rgba(0,0,0,0.3);
          border-radius: 12px;
          padding: 12px;
          border: 1px solid rgba(100,100,100,0.08);
          transition: border-color 0.2s ease;
        }

        .muv-metric:hover {
          border-color: rgba(59,130,246,0.2);
        }

        .muv-metric-label {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #666;
          margin-bottom: 6px;
        }

        .muv-metric-value {
          font-family: 'JetBrains Mono', monospace;
          font-size: 20px;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #3b82f6;
        }

        .muv-metric-unit {
          font-size: 11px;
          color: #666;
          margin-left: 4px;
          font-weight: 500;
        }

        .muv-btn-row {
          display: flex;
          gap: 10px;
          margin-bottom: 16px;
        }

        .muv-btn {
          flex: 1;
          padding: 12px 0;
          border-radius: 10px;
          border: 1px solid rgba(100,100,100,0.2);
          background: rgba(255,255,255,0.03);
          color: #aaa;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .muv-btn:hover {
          transform: translateY(-1px);
          background: rgba(59,130,246,0.1);
          color: #e0e0e0;
        }

        .muv-btn.primary {
          background: #3b82f6;
          border: none;
          color: white;
          box-shadow: 0 4px 15px rgba(59,130,246,0.3);
        }

        .muv-btn.primary:hover {
          background: #2563eb;
          transform: translateY(-1px);
        }

        .muv-viewer {
          background: rgba(20,20,20,0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(100,100,100,0.1);
          border-radius: 20px;
          overflow: hidden;
          min-height: 500px;
        }
      `}</style>

      <div className="muv-root">
        <div className="muv-header">
          <div>
            <div className="muv-logo">
              MRU<span>V</span>
            </div>
            <div className="muv-subtitle">
              Movimento Retilíneo Uniformemente Variado — Simulador Interativo
            </div>
          </div>
          <div style={{ color: "#555", fontSize: 11, letterSpacing: "0.05em" }}>
            CINEMÁTICA · CÁLCULO DIFERENCIAL E INTEGRAL
          </div>
        </div>

        <div className="muv-tabs">
          {TABS.map((tb) => (
            <button
              key={tb.id}
              className={`muv-tab ${tab === tb.id ? "active" : ""}`}
              onClick={() => setTab(tb.id)}
            >
              {tb.label}
            </button>
          ))}
        </div>

        <div className="muv-body">
          <div className="muv-sidebar">
            <div className="muv-card">
              <div className="muv-card-title">Modo de Simulação</div>
              <select
                className="muv-select"
                value={modo}
                onChange={(e) => handleModeChange(e.target.value)}
              >
                {MODES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              <div className="muv-mode-desc">
                {MODES.find((m) => m.value === modo)?.desc}
              </div>
            </div>

            <div className="muv-card">
              <div className="muv-card-title">Parâmetros Físicos</div>

              <div className={`muv-ctrl ${modo === "queda" ? "disabled" : ""}`}>
                <div className="muv-ctrl-label">
                  <span className="muv-ctrl-name">Velocidade inicial v₀</span>
                  <span className="muv-ctrl-val">{v0.toFixed(1)} m/s</span>
                </div>
                <input
                  type="range"
                  className="muv-range"
                  min={modo === "queda" ? 0 : -20}
                  max="30"
                  step="0.5"
                  value={v0}
                  onChange={(e) => {
                    setV0(Number(e.target.value));
                    setT(0);
                    setPlaying(false);
                  }}
                />
              </div>

              <div className={`muv-ctrl ${modo === "queda" ? "disabled" : ""}`}>
                <div className="muv-ctrl-label">
                  <span className="muv-ctrl-name">Aceleração a</span>
                  <span className="muv-ctrl-val">{a.toFixed(1)} m/s²</span>
                </div>
                <input
                  type="range"
                  className="muv-range"
                  min="-15"
                  max="15"
                  step="0.5"
                  value={a}
                  onChange={(e) => {
                    setA(Number(e.target.value));
                    setT(0);
                    setPlaying(false);
                  }}
                />
              </div>

              <div className="muv-ctrl">
                <div className="muv-ctrl-label">
                  <span className="muv-ctrl-name">Posição inicial s₀</span>
                  <span className="muv-ctrl-val">{s0.toFixed(0)} m</span>
                </div>
                <input
                  type="range"
                  className="muv-range"
                  min={modo === "queda" ? 0 : -30}
                  max={modo === "queda" ? 100 : 50}
                  step="1"
                  value={s0}
                  onChange={(e) => {
                    setS0(Number(e.target.value));
                    setT(0);
                    setPlaying(false);
                  }}
                />
              </div>

              <div className="muv-ctrl">
                <div className="muv-ctrl-label">
                  <span className="muv-ctrl-name">Tempo máximo de simulação</span>
                  <span className="muv-ctrl-val">{tmax.toFixed(0)} s</span>
                </div>
                <input
                  type="range"
                  className="muv-range"
                  min="3"
                  max="20"
                  step="0.5"
                  value={tmax}
                  onChange={(e) => {
                    setTmax(Number(e.target.value));
                    setT(0);
                    setPlaying(false);
                  }}
                />
              </div>

              <label className="muv-checkbox">
                <input
                  type="checkbox"
                  checked={showVectors}
                  onChange={(e) => setShowVectors(e.target.checked)}
                />
                <span>Visualizar vetores velocidade e aceleração</span>
              </label>
            </div>

            <div className="muv-card">
              <div className="muv-card-title">Valores Instantâneos</div>
              <div className="muv-metrics">
                <Metric label="Tempo" value={t.toFixed(2)} unit="s" />
                <Metric
                  label="Velocidade"
                  value={v.toFixed(2)}
                  unit="m/s"
                  color={v >= 0 ? "#22c55e" : "#ef4444"}
                />
                <Metric label="Posição" value={s.toFixed(2)} unit="m" />
                <Metric label="Deslocamento" value={(s - s0).toFixed(2)} unit="m" />
                <Metric label="Energia Cinética" value={energia.toFixed(1)} unit="J/kg" />
                <Metric label="Aceleração" value={a.toFixed(2)} unit="m/s²" />
              </div>
            </div>

            <div className="muv-card">
              <div className="muv-btn-row">
                <button className="muv-btn primary" onClick={handleStart}>
                  ▶ Iniciar
                </button>
                <button className="muv-btn" onClick={handlePause}>
                  ⏸ Pausar
                </button>
                <button className="muv-btn" onClick={handleReset}>
                  ⟳ Reset
                </button>
              </div>
              <div style={{ fontSize: 11, color: "#555", textAlign: "center" }}>
                Simulação em tempo real
              </div>
            </div>
          </div>

          <div className="muv-viewer">
            {tab === "sim" && <MUVGraph {...sharedProps} animated />}
            {tab === "graphs" && <MUVGraph {...sharedProps} showAllCharts />}
            {tab === "equations" && <MUVEquations {...sharedProps} />}
            {tab === "calculus" && <MUVCalculus {...sharedProps} />}
            {tab === "analysis" && <MUVAnalysis {...sharedProps} modo={modo} />}
            {tab === "table" && <MUVTable {...sharedProps} />}
          </div>
        </div>
      </div>
    </>
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