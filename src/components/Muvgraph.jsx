import React, { useRef, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ScatterChart, Scatter
} from "recharts";

const calcV = (v0, a, t) => v0 + a * t;
const calcS = (v0, a, t, s0) => s0 + v0 * t + 0.5 * a * t * t;

function SimCanvas({ v0, a, s0, t, tmax }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.offsetWidth;
    const H = canvas.height;
    canvas.width = W;

    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = isDark ? "#0D1117" : "#F1F5F9";
    ctx.fillRect(0, 0, W, H);

    const pts = Array.from({ length: 101 }, (_, i) => {
      const ti = (i / 100) * tmax;
      return { t: ti, s: calcS(v0, a, ti, s0) };
    });

    const sVals = pts.map((p) => p.s);
    const sMin = Math.min(...sVals) - 5;
    const sMax = Math.max(...sVals) + 5;
    const sRange = Math.max(sMax - sMin, 1);

    const trackY = H * 0.55;
    const pad = 50;

    ctx.fillStyle = isDark ? "#1E293B" : "#E2E8F0";
    ctx.fillRect(0, trackY - 6, W, 12);

    for (let i = 0; i < pts.length - 1; i++) {
      const x1 = pad + ((pts[i].s - sMin) / sRange) * (W - pad * 2);
      const x2 = pad + ((pts[i + 1].s - sMin) / sRange) * (W - pad * 2);
      const alpha = 0.15 + 0.6 * (i / 100);
      ctx.fillStyle = `rgba(96,165,250,${alpha})`;
      ctx.beginPath();
      ctx.arc(x1, trackY, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    const sNow = calcS(v0, a, t, s0);
    const vNow = calcV(v0, a, t);
    const xNow = pad + ((sNow - sMin) / sRange) * (W - pad * 2);

    const radius = 18;
    ctx.beginPath();
    ctx.arc(xNow, trackY, radius + 4, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(96,165,250,0.15)";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(xNow, trackY, radius, 0, Math.PI * 2);
    ctx.fillStyle = "#2563EB";
    ctx.fill();
    ctx.strokeStyle = "#60A5FA";
    ctx.lineWidth = 2;
    ctx.stroke();

    const arrowLen = Math.min(Math.abs(vNow) * 5, W * 0.3);
    const dir = vNow >= 0 ? 1 : -1;
    const arrowColor = vNow >= 0 ? "#22C55E" : "#EF4444";
    const arrowY = trackY - 36;

    if (Math.abs(vNow) > 0.05) {
      ctx.beginPath();
      ctx.moveTo(xNow, arrowY);
      ctx.lineTo(xNow + dir * arrowLen, arrowY);
      ctx.strokeStyle = arrowColor;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(xNow + dir * arrowLen, arrowY);
      ctx.lineTo(xNow + dir * arrowLen - dir * 10, arrowY - 6);
      ctx.lineTo(xNow + dir * arrowLen - dir * 10, arrowY + 6);
      ctx.closePath();
      ctx.fillStyle = arrowColor;
      ctx.fill();

      ctx.fillStyle = arrowColor;
      ctx.font = "11px 'JetBrains Mono', monospace";
      ctx.textAlign = dir > 0 ? "left" : "right";
      ctx.fillText(`v = ${vNow.toFixed(2)} m/s`, xNow + dir * (arrowLen + 8), arrowY + 4);
    }

    ctx.fillStyle = "#94A3B8";
    ctx.font = "11px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(`s = ${sNow.toFixed(2)} m`, xNow, trackY + 36);

    ctx.fillStyle = "#475569";
    ctx.font = "11px 'Sora', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`t = ${t.toFixed(2)} s`, 12, H - 10);
    ctx.textAlign = "right";
    ctx.fillText(`s₀ = ${s0} m  |  v₀ = ${v0} m/s  |  a = ${a} m/s²`, W - 12, H - 10);
  }, [v0, a, s0, t, tmax]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: 150, display: "block" }}
      height={150}
    />
  );
}

function buildPoints(v0, a, s0, tmax, n = 80) {
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
  background: "rgba(255,255,255,0.02)",
  borderRadius: 12,
  padding: "12px 8px 8px",
  marginBottom: 12,
};

const axisStyle = { fill: "#475569", fontSize: 11 };
const gridStyle = { stroke: "rgba(255,255,255,0.05)" };

const TooltipStyle = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#0F172A",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 8,
      padding: "6px 10px",
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 12,
      color: "#E2E8F0",
    }}>
      <div style={{ color: "#64748B", marginBottom: 2 }}>t = {label} s</div>
      <div>{payload[0].name} = {payload[0].value} {unit}</div>
    </div>
  );
};

export default function MUVGraph({ v0, a, s0, t, tmax, modo, animated, showAllCharts }) {
  const pts = buildPoints(v0, a, s0, tmax);
  const tLine = parseFloat(t.toFixed(3));

  if (animated) {
    return (
      <div style={{ padding: 16, height: "100%" }}>
        <SimCanvas v0={v0} a={a} s0={s0} t={t} tmax={tmax} />

        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 11, color: "#475569", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Posição × Tempo
          </div>
          <div style={chartStyle}>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={pts} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" {...gridStyle} />
                <XAxis dataKey="t" tick={axisStyle} label={{ value: "t (s)", position: "insideRight", fill: "#475569", fontSize: 11 }} />
                <YAxis tick={axisStyle} width={50} label={{ value: "s (m)", angle: -90, position: "insideLeft", fill: "#475569", fontSize: 11 }} />
                <Tooltip content={<TooltipStyle unit="m" />} />
                <ReferenceLine x={tLine} stroke="#60A5FA" strokeDasharray="4 3" strokeWidth={1.5} />
                <Line type="monotone" dataKey="s" stroke="#60A5FA" strokeWidth={2} dot={false} name="s" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ marginTop: 4 }}>
          <div style={{ fontSize: 11, color: "#475569", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Velocidade × Tempo
          </div>
          <div style={chartStyle}>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={pts} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" {...gridStyle} />
                <XAxis dataKey="t" tick={axisStyle} />
                <YAxis tick={axisStyle} width={50} label={{ value: "v (m/s)", angle: -90, position: "insideLeft", fill: "#475569", fontSize: 11 }} />
                <Tooltip content={<TooltipStyle unit="m/s" />} />
                <ReferenceLine x={tLine} stroke="#60A5FA" strokeDasharray="4 3" strokeWidth={1.5} />
                <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
                <Line type="monotone" dataKey="v" stroke="#22C55E" strokeWidth={2} dot={false} name="v" />
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
      <div style={{ padding: 16, overflowY: "auto", height: "100%" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { key: "s", color: "#60A5FA", label: "s (m)", title: "Posição × Tempo s(t)" },
            { key: "v", color: "#22C55E", label: "v (m/s)", title: "Velocidade × Tempo v(t)" },
            { key: "a", color: "#F59E0B", label: "a (m/s²)", title: "Aceleração × Tempo a(t)" },
          ].map(({ key, color, label, title }) => (
            <div key={key}>
              <div style={{ fontSize: 11, color: "#475569", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {title}
              </div>
              <div style={chartStyle}>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={pts} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" {...gridStyle} />
                    <XAxis dataKey="t" tick={axisStyle} />
                    <YAxis tick={axisStyle} width={50} label={{ value: label, angle: -90, position: "insideLeft", fill: "#475569", fontSize: 11 }} />
                    <Tooltip content={<TooltipStyle unit={label.split(" ")[0]} />} />
                    <ReferenceLine y={0} stroke="rgba(255,255,255,0.08)" />
                    <Line type="monotone" dataKey={key} stroke={color} strokeWidth={2} dot={false} name={key} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}

          <div>
            <div style={{ fontSize: 11, color: "#475569", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Hodógrafo v(s)
            </div>
            <div style={chartStyle}>
              <ResponsiveContainer width="100%" height={180}>
                <ScatterChart margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" {...gridStyle} />
                  <XAxis dataKey="s" tick={axisStyle} name="s" label={{ value: "s (m)", position: "insideRight", fill: "#475569", fontSize: 11 }} />
                  <YAxis dataKey="v" tick={axisStyle} width={50} name="v" label={{ value: "v (m/s)", angle: -90, position: "insideLeft", fill: "#475569", fontSize: 11 }} />
                  <Tooltip cursor={{ strokeDasharray: "3 3" }} content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div style={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "6px 10px", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#E2E8F0" }}>
                        <div>s = {payload[0]?.value} m</div>
                        <div>v = {payload[1]?.value} m/s</div>
                      </div>
                    );
                  }} />
                  <Scatter data={vsData} fill="#A855F7" line={{ stroke: "#A855F7", strokeWidth: 2 }} shape="circle" />
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