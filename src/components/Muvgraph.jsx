import React, { useRef, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ScatterChart,
  Scatter,
} from "recharts";

const calcV = (v0, a, t) => v0 + a * t;
const calcS = (v0, a, t, s0) => s0 + v0 * t + 0.5 * a * t * t;

function SimCanvas({ v0, a, s0, t, tmax, modo, showVectors = true }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth;
    const H = 420;

    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.clearRect(0, 0, W, H);

    // Background profissional
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#0a0a0a");
    bg.addColorStop(1, "#141414");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Grid sutil
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 12; i++) {
      const y = (i / 12) * H;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    const sNow = calcS(v0, a, t, s0);
    const vNow = calcV(v0, a, t);
    const isVertical = modo === "queda";

    if (isVertical) {
      // Queda Livre - Visualização Vertical
      let maxHeight = Math.max(
        40,
        Math.abs(s0),
        ...Array.from({ length: 50 }, (_, i) =>
          Math.abs(calcS(v0, a, (i / 50) * tmax, s0))
        )
      );

      const padTop = 40;
      const padBottom = 70;
      const usableH = H - padTop - padBottom;

      // Solo
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(0, H - padBottom, W, padBottom);

      const floorGlow = ctx.createLinearGradient(0, H - padBottom, 0, H);
      floorGlow.addColorStop(0, "rgba(59,130,246,0.06)");
      floorGlow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = floorGlow;
      ctx.fillRect(0, H - padBottom - 15, W, 15);

      // Régua vertical
      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(70, padTop);
      ctx.lineTo(70, H - padBottom);
      ctx.stroke();

      ctx.fillStyle = "#666";
      ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.textAlign = "right";

      for (let i = 0; i <= 5; i++) {
        const y = padTop + (i / 5) * usableH;
        ctx.beginPath();
        ctx.moveTo(60, y);
        ctx.lineTo(80, y);
        ctx.stroke();

        const value = (maxHeight * (1 - i / 5)).toFixed(0);
        ctx.fillText(`${value} m`, 50, y + 3);
      }

      // Posição atual (limitada ao solo)
      let yObj;
      if (sNow <= 0) {
        yObj = H - padBottom;
      } else {
        const normalized = Math.min(1, sNow / maxHeight);
        yObj = H - padBottom - normalized * usableH;
      }
      const xObj = W * 0.52;

      // Rastro
      if (sNow > 0) {
        for (let i = 0; i < 12; i++) {
          const alpha = 0.1 - i * 0.008;
          const trailY = yObj - i * (Math.sign(vNow) || 1) * 6;
          ctx.beginPath();
          ctx.arc(xObj, trailY, 10 - i * 0.3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(59,130,246,${Math.max(0, alpha)})`;
          ctx.fill();
        }
      }

      // Glow
      const glow = ctx.createRadialGradient(xObj, yObj, 0, xObj, yObj, 40);
      glow.addColorStop(0, "rgba(59,130,246,0.4)");
      glow.addColorStop(1, "rgba(59,130,246,0)");
      ctx.beginPath();
      ctx.arc(xObj, yObj, 40, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      // Objeto
      ctx.beginPath();
      ctx.arc(xObj, yObj, 16, 0, Math.PI * 2);
      const gradBody = ctx.createRadialGradient(xObj - 5, yObj - 5, 4, xObj, yObj, 16);
      gradBody.addColorStop(0, "#3b82f6");
      gradBody.addColorStop(1, "#1d4ed8");
      ctx.fillStyle = gradBody;
      ctx.fill();
      ctx.strokeStyle = "#60a5fa";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Vetor velocidade
      if (showVectors && Math.abs(vNow) > 0.1 && sNow > 0) {
        const velSize = Math.min(100, Math.abs(vNow) * 3.5);
        const velDir = vNow >= 0 ? -1 : 1;

        ctx.beginPath();
        ctx.moveTo(xObj, yObj);
        ctx.lineTo(xObj, yObj + velDir * velSize);
        ctx.strokeStyle = "#22c55e";
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(xObj, yObj + velDir * velSize);
        ctx.lineTo(xObj - 8, yObj + velDir * velSize - velDir * 14);
        ctx.lineTo(xObj + 8, yObj + velDir * velSize - velDir * 14);
        ctx.closePath();
        ctx.fillStyle = "#22c55e";
        ctx.fill();
      }

      // Vetor gravidade
      if (showVectors) {
        ctx.beginPath();
        ctx.moveTo(xObj + 80, yObj - 30);
        ctx.lineTo(xObj + 80, yObj + 50);
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(xObj + 80, yObj + 50);
        ctx.lineTo(xObj + 70, yObj + 32);
        ctx.lineTo(xObj + 90, yObj + 32);
        ctx.closePath();
        ctx.fillStyle = "#ef4444";
        ctx.fill();
      }

      // Labels
      ctx.font = "500 11px 'JetBrains Mono', monospace";
      ctx.fillStyle = "#22c55e";
      ctx.fillText(`v = ${vNow.toFixed(2)} m/s`, xObj + 20, yObj - 18);

      if (showVectors) {
        ctx.fillStyle = "#ef4444";
        ctx.fillText(`g = ${Math.abs(a).toFixed(1)} m/s²`, xObj + 94, yObj + 12);
      }

      ctx.fillStyle = "#888";
      ctx.fillText(`h = ${Math.max(0, sNow).toFixed(2)} m`, xObj - 50, H - 26);

      ctx.fillStyle = "#555";
      ctx.font = "500 10px 'Inter', sans-serif";
      ctx.fillText("SOLO", 20, H - 28);
    } else {
      // Movimento Horizontal
      const pts = Array.from({ length: 101 }, (_, i) => {
        const ti = (i / 100) * tmax;
        return { t: ti, s: calcS(v0, a, ti, s0) };
      });

      const sVals = pts.map((p) => p.s);
      const sMin = Math.min(...sVals) - 5;
      const sMax = Math.max(...sVals) + 5;
      const sRange = Math.max(sMax - sMin, 1);

      const trackY = H * 0.58;
      const pad = 70;

      // Pista
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(0, trackY + 25, W, H - trackY);

      ctx.fillStyle = "rgba(59,130,246,0.08)";
      ctx.fillRect(pad, trackY - 6, W - pad * 2, 12);

      // Rastro
      for (let i = 0; i < pts.length - 1; i++) {
        const x1 = pad + ((pts[i].s - sMin) / sRange) * (W - pad * 2);
        const alpha = 0.05 + 0.35 * (i / 100);
        ctx.beginPath();
        ctx.arc(x1, trackY, 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59,130,246,${alpha})`;
        ctx.fill();
      }

      // Régua horizontal
      ctx.fillStyle = "#666";
      ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";

      for (let pos = Math.floor(sMin / 10) * 10; pos <= sMax; pos += 10) {
        const x = pad + ((pos - sMin) / sRange) * (W - pad * 2);
        if (x >= pad && x <= W - pad) {
          ctx.beginPath();
          ctx.moveTo(x, trackY - 10);
          ctx.lineTo(x, trackY + 10);
          ctx.strokeStyle = "rgba(255,255,255,0.08)";
          ctx.stroke();
          ctx.fillText(`${pos} m`, x, trackY - 16);
        }
      }

      const xNow = pad + ((sNow - sMin) / sRange) * (W - pad * 2);

      // Glow
      const glow = ctx.createRadialGradient(xNow, trackY, 0, xNow, trackY, 40);
      glow.addColorStop(0, "rgba(59,130,246,0.4)");
      glow.addColorStop(1, "rgba(59,130,246,0)");
      ctx.beginPath();
      ctx.arc(xNow, trackY, 40, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      // Objeto
      ctx.beginPath();
      ctx.arc(xNow, trackY, 16, 0, Math.PI * 2);
      const gradBody = ctx.createRadialGradient(xNow - 5, trackY - 5, 4, xNow, trackY, 16);
      gradBody.addColorStop(0, "#3b82f6");
      gradBody.addColorStop(1, "#1d4ed8");
      ctx.fillStyle = gradBody;
      ctx.fill();
      ctx.strokeStyle = "#60a5fa";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Vetor velocidade
      if (showVectors && Math.abs(vNow) > 0.1) {
        const arrowLen = Math.min(Math.abs(vNow) * 4.5, W * 0.22);
        const dir = vNow >= 0 ? 1 : -1;

        ctx.beginPath();
        ctx.moveTo(xNow, trackY - 45);
        ctx.lineTo(xNow + dir * arrowLen, trackY - 45);
        ctx.strokeStyle = "#22c55e";
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(xNow + dir * arrowLen, trackY - 45);
        ctx.lineTo(xNow + dir * arrowLen - dir * 12, trackY - 54);
        ctx.lineTo(xNow + dir * arrowLen - dir * 12, trackY - 36);
        ctx.closePath();
        ctx.fillStyle = "#22c55e";
        ctx.fill();

        ctx.fillStyle = "#22c55e";
        ctx.font = "500 10px 'JetBrains Mono', monospace";
        ctx.fillText(`${Math.abs(vNow).toFixed(1)} m/s`, (xNow + xNow + dir * arrowLen) / 2 - 20, trackY - 52);
      }

      // Vetor aceleração
      if (showVectors && Math.abs(a) > 0.1) {
        const accDir = a >= 0 ? 1 : -1;
        ctx.beginPath();
        ctx.moveTo(xNow, trackY + 50);
        ctx.lineTo(xNow + accDir * 60, trackY + 50);
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(xNow + accDir * 60, trackY + 50);
        ctx.lineTo(xNow + accDir * 60 - accDir * 10, trackY + 40);
        ctx.lineTo(xNow + accDir * 60 - accDir * 10, trackY + 60);
        ctx.closePath();
        ctx.fillStyle = "#f59e0b";
        ctx.fill();

        ctx.fillStyle = "#f59e0b";
        ctx.font = "10px 'JetBrains Mono', monospace";
        ctx.fillText(`a = ${a.toFixed(2)} m/s²`, xNow + 18, trackY + 74);
      }

      ctx.fillStyle = "#888";
      ctx.font = "11px 'JetBrains Mono', monospace";
      ctx.fillText(`s = ${sNow.toFixed(2)} m`, xNow - 30, trackY + 110);
    }

    // HUD
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(12, 12, 200, 36);
    ctx.fillStyle = "#3b82f6";
    ctx.font = "500 11px 'JetBrains Mono', monospace";
    ctx.textAlign = "left";
    ctx.fillText(`t = ${t.toFixed(2)} s`, 20, 30);
    ctx.fillStyle = "#555";
    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.fillText(`Δt = ${tmax.toFixed(1)} s`, 20, 44);

    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(W - 210, 12, 198, 36);
    ctx.textAlign = "right";
    ctx.fillStyle = "#3b82f6";
    ctx.font = "500 11px 'JetBrains Mono', monospace";
    ctx.fillText(`v₀ = ${v0.toFixed(2)} m/s`, W - 20, 30);
    ctx.fillStyle = "#f59e0b";
    ctx.fillText(`a = ${a.toFixed(2)} m/s²`, W - 20, 44);
    ctx.textAlign = "left";
  }, [v0, a, s0, t, tmax, modo, showVectors]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100%",
        height: 420,
        display: "block",
        borderRadius: 16,
        background: "#0a0a0a",
      }}
    />
  );
}

function buildPoints(v0, a, s0, tmax, n = 100) {
  return Array.from({ length: n + 1 }, (_, i) => {
    const ti = (i / n) * tmax;
    return {
      t: parseFloat(ti.toFixed(3)),
      s: parseFloat(calcS(v0, a, ti, s0).toFixed(3)),
      v: parseFloat(calcV(v0, a, ti).toFixed(3)),
      a: parseFloat(a.toFixed(3)),
    };
  });
}

const chartStyle = {
  background: "rgba(20,20,20,0.8)",
  borderRadius: 14,
  padding: "14px 12px 10px",
  marginBottom: 16,
  border: "1px solid rgba(100,100,100,0.1)",
};

const axisStyle = {
  fill: "#666",
  fontSize: 11,
  fontWeight: 500,
};

const gridStyle = {
  stroke: "rgba(255,255,255,0.05)",
  strokeDasharray: "4 4",
};

const TooltipStyle = ({ active, payload, label, unit, color }) => {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        background: "#1a1a1a",
        border: `1px solid ${color || "#3b82f6"}`,
        borderRadius: 10,
        padding: "8px 12px",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 12,
        color: "#e0e0e0",
      }}
    >
      <div style={{ color: "#3b82f6", marginBottom: 4, fontSize: 10 }}>
        t = {label} s
      </div>
      <div style={{ color: color || "#e0e0e0" }}>
        {payload[0].name} = {payload[0].value} {unit}
      </div>
    </div>
  );
};

export default function MUVGraph({
  v0,
  a,
  s0,
  t,
  tmax,
  modo,
  animated,
  showAllCharts,
  showVectors = true,
}) {
  const pts = buildPoints(v0, a, s0, tmax);
  const tLine = parseFloat(t.toFixed(3));

  if (animated) {
    return (
      <div style={{ padding: 20, height: "100%", overflowY: "auto" }}>
        <SimCanvas
          v0={v0}
          a={a}
          s0={s0}
          t={t}
          tmax={tmax}
          modo={modo}
          showVectors={showVectors}
        />

        <div style={{ marginTop: 20 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#3b82f6",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 10,
            }}
          >
            Posição × Tempo — s(t)
          </div>
          <div style={chartStyle}>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={pts} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid {...gridStyle} />
                <XAxis
                  dataKey="t"
                  tick={axisStyle}
                  label={{ value: "t (s)", position: "insideRight", fill: "#666", fontSize: 11, dy: 10 }}
                />
                <YAxis
                  tick={axisStyle}
                  width={60}
                  label={{ value: "s (m)", angle: -90, position: "insideLeft", fill: "#666", fontSize: 11 }}
                />
                <Tooltip content={<TooltipStyle unit="m" color="#3b82f6" />} />
                <ReferenceLine
                  x={tLine}
                  stroke="#3b82f6"
                  strokeDasharray="6 4"
                  strokeWidth={1.5}
                  label={{ value: "agora", fill: "#3b82f6", fontSize: 10, position: "top" }}
                />
                <Line type="monotone" dataKey="s" stroke="#3b82f6" strokeWidth={2.5} dot={false} name="s(t)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ marginTop: 8 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#22c55e",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 10,
            }}
          >
            Velocidade × Tempo — v(t)
          </div>
          <div style={chartStyle}>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={pts} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid {...gridStyle} />
                <XAxis dataKey="t" tick={axisStyle} label={{ value: "t (s)", position: "insideRight", fill: "#666", fontSize: 11 }} />
                <YAxis
                  tick={axisStyle}
                  width={60}
                  label={{ value: "v (m/s)", angle: -90, position: "insideLeft", fill: "#666", fontSize: 11 }}
                />
                <Tooltip content={<TooltipStyle unit="m/s" color="#22c55e" />} />
                <ReferenceLine x={tLine} stroke="#3b82f6" strokeDasharray="6 4" strokeWidth={1.5} />
                <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
                <Line type="monotone" dataKey="v" stroke="#22c55e" strokeWidth={2.5} dot={false} name="v(t)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  }

  if (showAllCharts) {
    const vsData = pts.map((p) => ({ s: p.s, v: p.v }));

    return (
      <div style={{ padding: 20, overflowY: "auto", height: "100%" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: 20 }}>
          <div>
            <div style={chartStyle}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#3b82f6", marginBottom: 12 }}>
                Posição s(t)
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={pts}>
                  <CartesianGrid {...gridStyle} />
                  <XAxis dataKey="t" tick={axisStyle} />
                  <YAxis tick={axisStyle} width={50} />
                  <Tooltip content={<TooltipStyle unit="m" color="#3b82f6" />} />
                  <Line type="monotone" dataKey="s" stroke="#3b82f6" strokeWidth={2.5} dot={false} name="s" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <div style={chartStyle}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#22c55e", marginBottom: 12 }}>
                Velocidade v(t)
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={pts}>
                  <CartesianGrid {...gridStyle} />
                  <XAxis dataKey="t" tick={axisStyle} />
                  <YAxis tick={axisStyle} width={50} />
                  <Tooltip content={<TooltipStyle unit="m/s" color="#22c55e" />} />
                  <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
                  <Line type="monotone" dataKey="v" stroke="#22c55e" strokeWidth={2.5} dot={false} name="v" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <div style={chartStyle}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#f59e0b", marginBottom: 12 }}>
                Aceleração a(t)
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={pts}>
                  <CartesianGrid {...gridStyle} />
                  <XAxis dataKey="t" tick={axisStyle} />
                  <YAxis tick={axisStyle} width={50} />
                  <Tooltip content={<TooltipStyle unit="m/s²" color="#f59e0b" />} />
                  <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
                  <Line type="monotone" dataKey="a" stroke="#f59e0b" strokeWidth={2.5} dot={false} name="a" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <div style={chartStyle}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#a855f7", marginBottom: 12 }}>
                Hodógrafo v(s)
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <ScatterChart margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                  <CartesianGrid {...gridStyle} />
                  <XAxis
                    dataKey="s"
                    tick={axisStyle}
                    name="s"
                    label={{ value: "s (m)", position: "bottom", fill: "#666", fontSize: 11, dy: 10 }}
                  />
                  <YAxis
                    dataKey="v"
                    tick={axisStyle}
                    width={50}
                    name="v"
                    label={{ value: "v (m/s)", angle: -90, position: "insideLeft", fill: "#666", fontSize: 11 }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div
                          style={{
                            background: "#1a1a1a",
                            border: "1px solid #a855f7",
                            borderRadius: 10,
                            padding: "8px 12px",
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 12,
                          }}
                        >
                          <div style={{ color: "#a855f7" }}>s = {payload[0]?.value} m</div>
                          <div>v = {payload[1]?.value} m/s</div>
                        </div>
                      );
                    }}
                  />
                  <Scatter data={vsData} fill="#a855f7" line={{ stroke: "#a855f7", strokeWidth: 2 }} shape="circle" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}