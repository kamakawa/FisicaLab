import React, { useState, useEffect, useRef, useCallback } from "react";
import MUVGraph from "../components/Muvgraph";
import MUVEquations from "../components/Muvequations";
import MUVTheory from "../components/Muvtheory";
import MUVTable from "../components/Muvtable";
import MUVAnalysis from "../components/Muvanalysis";
import MUVCalculus from "../components/MuvCalculus";

const MODES = [
  { value: "geral", label: "Movimento Geral (MRUV)" },
  { value: "queda", label: "Queda Livre" },
  { value: "vertical", label: "Lançamento Vertical" },
  { value: "horizontal", label: "Lançamento Horizontal" },
];

const TABS = [
  { id: "sim", label: "Simulação" },
  { id: "graphs", label: "Gráficos" },
  { id: "equations", label: "Equações" },
  { id: "calculus", label: "∫ Cálculo" },
  { id: "analysis", label: "Análise" },
  { id: "table", label: "Tabela" },
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

  const rafRef = useRef(null);
  const lastTimeRef = useRef(null);

  const calcV = (v0, a, t) => v0 + a * t;
  const calcS = (v0, a, t, s0) => s0 + v0 * t + 0.5 * a * t * t;

  const v = calcV(v0, a, t);
  const s = calcS(v0, a, t, s0);

  const handleModeChange = (newMode) => {
    setModo(newMode);
    setT(0);
    setPlaying(false);
    if (newMode === "queda") {
      setV0(0);
      setA(-9.8);
    } else if (newMode === "vertical") {
      setV0(15);
      setA(-9.8);
    }
  };

  const loop = useCallback(
    (ts) => {
      if (!playing) return;
      if (lastTimeRef.current === null) lastTimeRef.current = ts;
      const dt = (ts - lastTimeRef.current) / 1000;
      lastTimeRef.current = ts;
      setT((prev) => {
        const next = prev + dt;
        if (next >= tmax) {
          setPlaying(false);
          return tmax;
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(loop);
    },
    [playing, tmax]
  );

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

  const sharedProps = { v0, a, s0, t, tmax };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Sora:wght@400;500;600&display=swap');

        .muv-root {
          font-family: 'Sora', sans-serif;
          background: #0B0E18;
          min-height: 100vh;
          color: #E2E8F0;
        }

        .muv-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px 0;
        }

        .muv-logo {
          font-family: 'JetBrains Mono', monospace;
          font-size: 22px;
          font-weight: 700;
          color: #60A5FA;
          letter-spacing: -0.5px;
        }

        .muv-logo span { color: #38BDF8; }

        .muv-tabs {
          display: flex;
          gap: 2px;
          padding: 12px 20px 0;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .muv-tab {
          font-family: 'Sora', sans-serif;
          font-size: 13px;
          padding: 8px 16px;
          border-radius: 8px 8px 0 0;
          border: none;
          cursor: pointer;
          background: transparent;
          color: #64748B;
          transition: all 0.15s;
        }

        .muv-tab:hover { color: #94A3B8; }

        .muv-tab.active {
          color: #60A5FA;
          background: rgba(96,165,250,0.08);
          border-bottom: 2px solid #60A5FA;
        }

        .muv-body {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 16px;
          padding: 16px 20px;
          min-height: calc(100vh - 120px);
        }

        .muv-sidebar {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .muv-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 16px;
        }

        .muv-card-title {
          font-size: 11px;
          font-weight: 600;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 12px;
        }

        .muv-select {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 8px 10px;
          color: #E2E8F0;
          font-size: 13px;
          font-family: 'Sora', sans-serif;
          outline: none;
        }

        .muv-ctrl { margin-bottom: 14px; }

        .muv-ctrl-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }

        .muv-ctrl-name {
          font-size: 12px;
          color: #64748B;
        }

        .muv-ctrl-val {
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          color: #60A5FA;
          font-weight: 500;
        }

        .muv-range {
          width: 100%;
          -webkit-appearance: none;
          appearance: none;
          height: 4px;
          border-radius: 2px;
          background: rgba(255,255,255,0.1);
          outline: none;
        }

        .muv-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #60A5FA;
          cursor: pointer;
          border: 2px solid #0B0E18;
          box-shadow: 0 0 0 3px rgba(96,165,250,0.2);
        }

        .muv-metrics {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .muv-metric {
          background: rgba(255,255,255,0.04);
          border-radius: 10px;
          padding: 10px 12px;
        }

        .muv-metric-label {
          font-size: 10px;
          color: #475569;
          margin-bottom: 4px;
        }

        .muv-metric-value {
          font-family: 'JetBrains Mono', monospace;
          font-size: 16px;
          font-weight: 500;
          color: #E2E8F0;
        }

        .muv-metric-unit {
          font-size: 10px;
          color: #475569;
          margin-left: 2px;
        }

        .muv-btn-row {
          display: flex;
          gap: 6px;
        }

        .muv-btn {
          flex: 1;
          padding: 9px 0;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          color: #94A3B8;
          font-size: 13px;
          font-family: 'Sora', sans-serif;
          cursor: pointer;
          transition: all 0.15s;
        }

        .muv-btn:hover { background: rgba(255,255,255,0.08); color: #E2E8F0; }

        .muv-btn.primary {
          background: rgba(96,165,250,0.15);
          border-color: rgba(96,165,250,0.3);
          color: #60A5FA;
        }

        .muv-btn.primary:hover { background: rgba(96,165,250,0.25); }

        .muv-ctrl.disabled { opacity: 0.35; pointer-events: none; }

        .muv-viewer {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          overflow: hidden;
          position: relative;
          min-height: 400px;
        }
      `}</style>

      <div className="muv-root">
        <div className="muv-header">
          <div className="muv-logo">MRU<span>V</span></div>
          <span style={{ color: "#334155", fontSize: 13 }}>
            Simulador de Movimento Retilíneo Uniformemente Variado
          </span>
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
          {/* SIDEBAR */}
          <div className="muv-sidebar">
            <div className="muv-card">
              <div className="muv-card-title">Modo</div>
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
            </div>

            <div className="muv-card">
              <div className="muv-card-title">Parâmetros</div>

              <div className={`muv-ctrl ${modo === "queda" ? "disabled" : ""}`}>
                <div className="muv-ctrl-label">
                  <span className="muv-ctrl-name">Velocidade inicial v₀</span>
                  <span className="muv-ctrl-val">{v0.toFixed(1)} m/s</span>
                </div>
                <input
                  type="range" className="muv-range"
                  min="-20" max="20" step="0.5" value={v0}
                  onChange={(e) => { setV0(Number(e.target.value)); setT(0); setPlaying(false); }}
                />
              </div>

              <div className={`muv-ctrl ${modo === "queda" || modo === "vertical" ? "disabled" : ""}`}>
                <div className="muv-ctrl-label">
                  <span className="muv-ctrl-name">Aceleração a</span>
                  <span className="muv-ctrl-val">{a.toFixed(1)} m/s²</span>
                </div>
                <input
                  type="range" className="muv-range"
                  min="-15" max="15" step="0.5" value={a}
                  onChange={(e) => { setA(Number(e.target.value)); setT(0); setPlaying(false); }}
                />
              </div>

              <div className="muv-ctrl">
                <div className="muv-ctrl-label">
                  <span className="muv-ctrl-name">Posição inicial s₀</span>
                  <span className="muv-ctrl-val">{s0.toFixed(0)} m</span>
                </div>
                <input
                  type="range" className="muv-range"
                  min="-50" max="50" step="1" value={s0}
                  onChange={(e) => { setS0(Number(e.target.value)); setT(0); setPlaying(false); }}
                />
              </div>

              <div className="muv-ctrl">
                <div className="muv-ctrl-label">
                  <span className="muv-ctrl-name">Tempo máximo</span>
                  <span className="muv-ctrl-val">{tmax.toFixed(0)} s</span>
                </div>
                <input
                  type="range" className="muv-range"
                  min="2" max="30" step="1" value={tmax}
                  onChange={(e) => { setTmax(Number(e.target.value)); setT(0); setPlaying(false); }}
                />
              </div>
            </div>

            <div className="muv-card">
              <div className="muv-card-title">Instantâneo</div>
              <div className="muv-metrics">
                <div className="muv-metric">
                  <div className="muv-metric-label">Tempo</div>
                  <div className="muv-metric-value">
                    {t.toFixed(2)}<span className="muv-metric-unit">s</span>
                  </div>
                </div>
                <div className="muv-metric">
                  <div className="muv-metric-label">Velocidade</div>
                  <div className="muv-metric-value">
                    {v.toFixed(2)}<span className="muv-metric-unit">m/s</span>
                  </div>
                </div>
                <div className="muv-metric">
                  <div className="muv-metric-label">Posição</div>
                  <div className="muv-metric-value">
                    {s.toFixed(2)}<span className="muv-metric-unit">m</span>
                  </div>
                </div>
                <div className="muv-metric">
                  <div className="muv-metric-label">Deslocamento</div>
                  <div className="muv-metric-value">
                    {(s - s0).toFixed(2)}<span className="muv-metric-unit">m</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="muv-card">
              <div className="muv-btn-row">
                <button className="muv-btn primary" onClick={handleStart}>▶ Iniciar</button>
                <button className="muv-btn" onClick={handlePause}>⏸ Pausar</button>
                <button className="muv-btn" onClick={handleReset}>↺ Reset</button>
              </div>
            </div>
          </div>

          {/* VIEWER */}
          <div className="muv-viewer">
            {tab === "sim" && <MUVGraph {...sharedProps} modo={modo} animated />}
            {tab === "graphs" && <MUVGraph {...sharedProps} modo={modo} showAllCharts />}
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