import React, { useState, useEffect } from "react";
import MRU3D from "../components/MRU3D";

export default function ExperimentoMRU() {
  const [velocidade, setVelocidade] = useState(10);
  const [posInicial, setPosInicial] = useState(0);
  const [tempo, setTempo] = useState(0);
  const [rodando, setRodando] = useState(false);
  const [modo, setModo] = useState("2D");

  useEffect(() => {
    if (!rodando) return;
    const interval = setInterval(() => setTempo(t => t + 0.05), 50);
    return () => clearInterval(interval);
  }, [rodando]);

  // 🔥 COMPONENTES VETORIAIS
  const vx = velocidade;
  const vy = velocidade / 2;
  const vz = velocidade / 3;

  const x = posInicial + vx * tempo;
  const y = vy * tempo;
  const z = vz * tempo;

  const dx = x - posInicial;
  const dy = y;
  const dz = z;

  // 🔥 NORMALIZAÇÃO 2D
  const normX = (t) => t * 5;
  const normY = (p) => 50 - p;

  return (
    <div style={{ padding: 30 }}>
      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 30 }}>

        {/* PAINEL */}
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(0,212,255,0.2)",
          borderRadius: 16,
          padding: 20
        }}>
          <h3 style={{ color: "#00D4FF" }}>MRU Vetorial</h3>

          <label>Modo</label>
          <select value={modo} onChange={e => setModo(e.target.value)}>
            <option value="2D">2D</option>
            <option value="3D">3D</option>
          </select>

          <label>Velocidade</label>
          <input type="range" min="-20" max="20"
            value={velocidade}
            onChange={e => setVelocidade(Number(e.target.value))}
          />

          <label>Posição inicial (x₀)</label>
          <input type="range" min="-50" max="50"
            value={posInicial}
            onChange={e => setPosInicial(Number(e.target.value))}
          />

          {/* BOTÕES */}
          <button onClick={() => setRodando(true)}>Iniciar</button>
          <button onClick={() => setRodando(false)}>Pausar</button>
          <button onClick={() => { setTempo(0); setRodando(false); }}>Reset</button>

          {/* 🔥 EQUAÇÕES */}
          <div style={{ marginTop: 20, fontFamily: "monospace", color: "#00F5C4" }}>
            r(t) = (x₀ + vₓt, vᵧt, v_z t)
          </div>

          <div style={{ fontFamily: "monospace" }}>
            r(t) = ({x.toFixed(2)}, {y.toFixed(2)}, {z.toFixed(2)})
          </div>

          {/* 🔥 DESLOCAMENTO */}
          <div style={{ marginTop: 10 }}>
            Δx = {dx.toFixed(2)} <br/>
            Δy = {dy.toFixed(2)} <br/>
            Δz = {dz.toFixed(2)}
          </div>
        </div>

        {/* SIMULAÇÃO */}
        <div style={{ background: "#05070D", borderRadius: 16, padding: 20, height: 420 }}>

          {modo === "3D" ? (
            <MRU3D
              velocidade={{ x: vx/10, y: vy/10, z: vz/10 }}
              posInicial={{ x: posInicial/10, y: 0, z: 0 }}
              tempo={tempo}
            />
          ) : (
            <svg viewBox="0 0 200 100">

              {/* EIXOS */}
              <line x1="0" y1="50" x2="200" y2="50" stroke="white"/>
              <line x1="0" y1="0" x2="0" y2="100" stroke="white"/>

              {/* LABELS */}
              <text x="190" y="45" fill="white">X</text>
              <text x="5" y="10" fill="white">Y</text>

              {/* RASTRO */}
              <line
                x1={normX(0)}
                y1={normY(posInicial)}
                x2={normX(tempo)}
                y2={normY(x)}
                stroke="#00D4FF"
              />

              {/* PONTO */}
              <circle cx={normX(tempo)} cy={normY(x)} r="3" fill="#00F5C4"/>

            </svg>
          )}

        </div>

      </div>
    </div>
  );
}