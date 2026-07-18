import React, { useState, useRef, useEffect } from "react";

function Frac({ num, den, color = "#E2E8F0", size = 14 }) {
  return (
    <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", verticalAlign: "middle", lineHeight: 1, margin: "0 2px" }}>
      <span style={{ fontSize: size * 0.85, color, borderBottom: `1px solid ${color}`, paddingBottom: 1, lineHeight: 1.2 }}>{num}</span>
      <span style={{ fontSize: size * 0.85, color, paddingTop: 1, lineHeight: 1.2 }}>{den}</span>
    </span>
  );
}

function IntSymbol({ from, to, color = "#A855F7", size = 28 }) {
  return (
    <span style={{ position: "relative", display: "inline-flex", flexDirection: "column", alignItems: "center", verticalAlign: "middle", margin: "0 2px" }}>
      <span style={{ fontSize: size * 0.5, color, lineHeight: 1, position: "relative", top: 2 }}>{to}</span>
      <span style={{ fontSize: size * 1.1, color, lineHeight: 0.9, fontFamily: "serif", fontStyle: "italic" }}>∫</span>
      <span style={{ fontSize: size * 0.5, color, lineHeight: 1, position: "relative", bottom: 2 }}>{from}</span>
    </span>
  );
}

function Deriv({ num, den, color = "#38BDF8" }) {
  return (
    <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", verticalAlign: "middle", lineHeight: 1, margin: "0 2px" }}>
      <span style={{ fontSize: 12, color, borderBottom: `1px solid ${color}`, paddingBottom: 1, lineHeight: 1.3 }}>d{num}</span>
      <span style={{ fontSize: 12, color, paddingTop: 1, lineHeight: 1.3 }}>d{den}</span>
    </span>
  );
}

function FormulaBlock({ title, color = "#60A5FA", children, note }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.025)", border: `1px solid rgba(255,255,255,0.07)`, borderLeft: `3px solid ${color}`, borderRadius: 12, padding: "14px 16px", marginBottom: 12 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>{title}</div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13.5, lineHeight: 2, color: "#CBD5E1" }}>{children}</div>
      {note && <div style={{ fontSize: 11, color: "#475569", marginTop: 8, lineHeight: 1.6 }}>{note}</div>}
    </div>
  );
}

function SectionTitle({ children, color }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color, marginBottom: 10, marginTop: 18, display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 1, background: color + "30" }} />
      {children}
      <div style={{ flex: 1, height: 1, background: color + "30" }} />
    </div>
  );
}

function Pill({ label, value, unit, color }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "8px 12px", minWidth: 90 }}>
      <span style={{ fontSize: 10, color: "#475569", marginBottom: 3 }}>{label}</span>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: color || "#E2E8F0", fontWeight: 600 }}>
        {value} <span style={{ fontSize: 10, color: "#475569" }}>{unit}</span>
      </span>
    </div>
  );
}

// Parabola canvas
function ParabolaCanvas({ vx, vy0, g, t, color, height = 160 }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.clientWidth || canvas.width;
    const H = canvas.clientHeight || canvas.height;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const PAD = { top: 16, bottom: 24, left: 36, right: 16 };
    const plotW = W - PAD.left - PAD.right;
    const plotH = H - PAD.top - PAD.bottom;
    ctx.clearRect(0, 0, W, H);

    const tTotal = vy0 > 0 ? 2 * vy0 / g : Math.abs(vy0 / g) + 2;
    const pts = Array.from({ length: 200 }, (_, i) => {
      const ti = (i / 199) * tTotal;
      return { x: vx * ti, y: vy0 * ti - 0.5 * g * ti * ti };
    }).filter(p => p.y >= 0);

    if (pts.length === 0) return;
    const minX = 0, maxX = Math.max(...pts.map(p => p.x)) || 1;
    const maxY = Math.max(...pts.map(p => p.y)) || 1;
    const toX = (xi) => PAD.left + (xi / maxX) * plotW;
    const toY = (yi) => PAD.top + (1 - yi / maxY) * plotH;

    // Ground line
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 1; ctx.setLineDash([3,3]);
    ctx.beginPath(); ctx.moveTo(PAD.left, toY(0)); ctx.lineTo(PAD.left + plotW, toY(0)); ctx.stroke();
    ctx.setLineDash([]);

    // Trajectory
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    pts.forEach((p, i) => i === 0 ? ctx.moveTo(toX(p.x), toY(p.y)) : ctx.lineTo(toX(p.x), toY(p.y)));
    ctx.stroke();

    // Current point
    const tEnd = Math.min(t, tTotal);
    const cx = vx * tEnd;
    const cy = Math.max(0, vy0 * tEnd - 0.5 * g * tEnd * tEnd);
    ctx.beginPath();
    ctx.arc(toX(cx), toY(cy), 5, 0, Math.PI * 2);
    ctx.fillStyle = "#fff"; ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();

    // Velocity vector
    const vxt = vx;
    const vyt = vy0 - g * tEnd;
    const scale = 6;
    const startX = toX(cx), startY = toY(cy);
    const endX = startX + vxt * scale / maxX * plotW;
    const endY = startY - vyt * scale / maxY * plotH;
    const arrowLen = 8;
    const arrowAngle = Math.atan2(endY - startY, endX - startX);

    ctx.strokeStyle = "#F59E0B";
    ctx.fillStyle = "#F59E0B";
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - arrowLen * Math.cos(arrowAngle - Math.PI / 6), endY - arrowLen * Math.sin(arrowAngle - Math.PI / 6));
    ctx.lineTo(endX - arrowLen * Math.cos(arrowAngle + Math.PI / 6), endY - arrowLen * Math.sin(arrowAngle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "rgba(148,163,184,0.7)";
    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.fillText("y", PAD.left + 4, PAD.top + 12);
    ctx.fillText("x", PAD.left + plotW - 12, toY(0) + 14);
  }, [vx, vy0, g, t, color]);

  return (
    <canvas ref={canvasRef} width={500} height={height}
      style={{ width: "100%", height, display: "block", borderRadius: 8 }} />
  );
}

export default function LancamentoCalculus({ v0, angle, time }) {
  const [activeSection, setActiveSection] = useState("deriv");
  const g   = 9.81;
  const rad = (angle * Math.PI) / 180;
  const vx  = v0 * Math.cos(rad);
  const vy0 = v0 * Math.sin(rad);

  const t   = time;
  const xt  = vx * t;
  const yt  = vy0 * t - 0.5 * g * t * t;
  const vxt = vx;
  const vyt = vy0 - g * t;
  const vMod = Math.sqrt(vxt**2 + vyt**2);
  const theta = Math.atan2(vyt, vxt) * 180 / Math.PI;

  const tApex  = vy0 / g;
  const yApex  = vy0 * tApex - 0.5 * g * tApex**2;
  const tRange = 2 * vy0 / g;
  const xRange = vx * tRange;

  const BLUE   = "#60A5FA";
  const GREEN  = "#22C55E";
  const PURPLE = "#A855F7";
  const CYAN   = "#38BDF8";
  const AMBER  = "#F59E0B";
  const CORAL  = "#F87171";
  const ORANGE = "#FB923C";

  const SECTIONS = [
    { id: "deriv", label: "Derivadas" },
    { id: "integ", label: "Integrais" },
    { id: "demo",  label: "Demonstrações" },
  ];

  return (
    <div style={{ padding: "18px 20px", overflowY: "auto", height: "100%", fontFamily: "'Sora', sans-serif", maxHeight: 600 }}>

      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 4 }}>
        {SECTIONS.map(sec => (
          <button key={sec.id} onClick={() => setActiveSection(sec.id)}
            style={{
              flex: 1, border: "none", borderRadius: 7, padding: "7px 4px",
              background: activeSection === sec.id ? "rgba(251,146,60,0.12)" : "transparent",
              color: activeSection === sec.id ? ORANGE : "#475569",
              fontSize: 11, fontFamily: "'Sora', sans-serif", cursor: "pointer",
              fontWeight: activeSection === sec.id ? 600 : 400,
              borderBottom: activeSection === sec.id ? `2px solid ${ORANGE}` : "2px solid transparent",
              transition: "all 0.15s",
            }}>{sec.label}</button>
        ))}
      </div>

      {activeSection === "deriv" && (
        <>
          <SectionTitle color={ORANGE}>Derivadas no Lançamento de Projéteis</SectionTitle>

          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "12px 14px", marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
              Trajetória — t = {t.toFixed(2)} s, θ = {angle}°
            </div>
            <ParabolaCanvas vx={vx} vy0={vy0} g={g} t={t} color={ORANGE} />
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              <Pill label="x(t)" value={xt.toFixed(2)} unit="m" color={CYAN} />
              <Pill label="y(t)" value={Math.max(0, yt).toFixed(2)} unit="m" color={GREEN} />
              <Pill label="|v(t)|" value={vMod.toFixed(2)} unit="m/s" color={ORANGE} />
              <Pill label="θ(t)" value={theta.toFixed(1)} unit="°" color={AMBER} />
            </div>
          </div>

          <FormulaBlock title="Decomposição vetorial — eixo X (MRU)" color={CYAN}
            note="A componente horizontal é MRU: velocidade constante, sem aceleração.">
            <span style={{ color: CYAN }}>x(t)</span>{" = vₓ·t = v₀·cos(θ)·t"}<br />
            <Deriv num="x" den="t" color={CYAN} />{" = vₓ = v₀·cos(θ) = "}<span style={{ color: GREEN }}>{vx.toFixed(4)} m/s</span><br />
            <Deriv num="²x" den="t²" color="#475569" />{" = 0 (MRU)"}
          </FormulaBlock>

          <FormulaBlock title="Decomposição vetorial — eixo Y (MRUV)" color={GREEN}
            note="A componente vertical é MRUV com aceleração gravitacional g = 9,81 m/s².">
            <span style={{ color: GREEN }}>y(t)</span>{" = vᵧ₀·t − "}<Frac num="g" den="2" color="#94A3B8" /><span>t²</span><br />
            <Deriv num="y" den="t" color={GREEN} />{" = vᵧ(t) = vᵧ₀ − g·t = "}<span style={{ color: AMBER }}>{vyt.toFixed(4)} m/s</span><br />
            <Deriv num="²y" den="t²" color={CORAL} />{" = −g = "}<span style={{ color: CORAL }}>−{g.toFixed(2)} m/s²</span>
          </FormulaBlock>

          <FormulaBlock title="Velocidade resultante — vetor r(t)" color={ORANGE}>
            <span style={{ color: "#94A3B8" }}>|v(t)| = √(vₓ² + vᵧ²) = </span><span style={{ color: ORANGE }}>{vMod.toFixed(4)} m/s</span><br />
            <span style={{ color: "#94A3B8" }}>θ(t) = arctan(vᵧ/vₓ) = arctan({vyt.toFixed(2)}/{vx.toFixed(2)}) = </span><span style={{ color: AMBER }}>{theta.toFixed(4)}°</span>
          </FormulaBlock>
        </>
      )}

      {activeSection === "integ" && (
        <>
          <SectionTitle color={PURPLE}>Integrais no Lançamento de Projéteis</SectionTitle>

          <FormulaBlock title="Posição X via integral da velocidade horizontal" color={CYAN}>
            <span style={{ color: CYAN }}>x(t)</span>{" = "}
            <IntSymbol from="0" to="t" color={CYAN} size={24} />
            <span style={{ color: "#94A3B8" }}>vₓ dτ = vₓ·t = {vx.toFixed(2)}·{t.toFixed(2)}</span>
            {" = "}<span style={{ color: CYAN }}>{xt.toFixed(4)} m</span>
          </FormulaBlock>

          <FormulaBlock title="Posição Y via integral da velocidade vertical" color={GREEN}>
            <span style={{ color: GREEN }}>y(t)</span>{" = y₀ + "}
            <IntSymbol from="0" to="t" color={GREEN} size={24} />
            <span style={{ color: "#94A3B8" }}>(vᵧ₀ − gτ) dτ</span>
            <br />
            <span style={{ color: "#94A3B8" }}>= [vᵧ₀τ − </span>
            <Frac num="gτ²" den="2" color="#94A3B8" />
            <span style={{ color: "#94A3B8" }}>]₀ᵗ</span>
            {" = "}<span style={{ color: GREEN }}>{Math.max(0, yt).toFixed(4)} m</span>
          </FormulaBlock>

          <FormulaBlock title="Variação de velocidade vertical — integral de −g" color={AMBER}>
            <span style={{ color: AMBER }}>vᵧ(t)</span>{" = vᵧ₀ + "}
            <IntSymbol from="0" to="t" color={AMBER} size={24} />
            <span style={{ color: CORAL }}>(−g) dτ</span>
            {" = vᵧ₀ − gt"}<br />
            <span style={{ color: "#94A3B8" }}>= {vy0.toFixed(2)} − {g.toFixed(2)}×{t.toFixed(2)} = </span>
            <span style={{ color: AMBER }}>{vyt.toFixed(4)} m/s</span>
          </FormulaBlock>

          <FormulaBlock title="Alcance total — integral até o solo (y = 0)" color={PURPLE}
            note="O alcance é obtido integrando vx pelo tempo total de voo (quando y = 0 novamente).">
            <span style={{ color: "#94A3B8" }}>T_voo = </span>
            <Frac num="2vᵧ₀" den="g" color="#94A3B8" />{" = "}
            <Frac num={`2×${vy0.toFixed(2)}`} den={g.toFixed(2)} color="#94A3B8" />
            {" = "}<span style={{ color: PURPLE }}>{tRange.toFixed(4)} s</span><br />
            <span style={{ color: "#94A3B8" }}>R = vₓ·T_voo = {vx.toFixed(2)}×{tRange.toFixed(2)} = </span>
            <span style={{ color: PURPLE }}>{xRange.toFixed(4)} m</span>
          </FormulaBlock>
        </>
      )}

      {activeSection === "demo" && (
        <>
          <SectionTitle color={ORANGE}>Demonstrações — Equação da Trajetória</SectionTitle>

          <FormulaBlock title="Dedução da equação da parábola (y em função de x)" color={ORANGE}
            note="Eliminando t das equações paramétricas, obtemos y(x) — a equação da trajetória.">
            <span style={{ color: "#94A3B8" }}>x = vₓ·t → t = </span>
            <Frac num="x" den="vₓ" color="#94A3B8" /><br />
            <span style={{ color: "#94A3B8" }}>y = vᵧ₀·</span>
            <Frac num="x" den="vₓ" color="#94A3B8" />
            <span style={{ color: "#94A3B8" }}> − </span>
            <Frac num="g" den="2vₓ²" color="#94A3B8" />
            <span style={{ color: "#94A3B8" }}>x²</span><br />
            <span style={{ color: ORANGE }}>y = tan(θ)·x − </span>
            <Frac num="g" den={`2v₀²cos²(θ)`} color={ORANGE} />
            <span style={{ color: ORANGE }}>·x²</span>
          </FormulaBlock>

          <FormulaBlock title="Ponto mais alto — derivada igualada a zero" color={GREEN}
            note="O ponto mais alto ocorre quando dy/dt = 0, ou seja, vᵧ = 0.">
            <Deriv num="y" den="t" color={GREEN} />{" = vᵧ₀ − g·t = 0 → t* = "}<Frac num="vᵧ₀" den="g" color={GREEN} /><br />
            <span style={{ color: "#94A3B8" }}>t* = {tApex.toFixed(4)} s</span><br />
            <span style={{ color: GREEN }}>y_max = {yApex.toFixed(4)} m</span>
          </FormulaBlock>

          <FormulaBlock title="Comprimento de arco da trajetória (integral de linha)" color={PURPLE}
            note="O comprimento real do caminho percorrido envolve a integral de |v(t)| dt.">
            <span style={{ color: "#94A3B8 "}}>L = </span>
            <IntSymbol from="0" to="T" color={PURPLE} size={24} />
            <span style={{ color: "#94A3B8" }}>|v(t)| dt = </span>
            <IntSymbol from="0" to="T" color={PURPLE} size={24} />
            <span style={{ color: "#94A3B8" }}>√(vₓ² + (vᵧ₀−gt)²) dt</span><br />
            <span style={{ fontSize: 11, color: "#475569" }}>
              (Requer integração numérica — não tem forma fechada simples.)
            </span>
          </FormulaBlock>

          <FormulaBlock title="Ângulo ótimo de alcance máximo" color={AMBER}>
            <Deriv num="R" den="θ" color={AMBER} />{" = "}<Deriv num="" den="θ" color="#94A3B8" />
            <Frac num="v₀²·sin(2θ)" den="g" color="#94A3B8" />{" = "}<Frac num="2v₀²·cos(2θ)" den="g" color="#94A3B8" />{" = 0"}<br />
            <span style={{ color: AMBER }}>cos(2θ) = 0 → 2θ = 90° → θ* = 45°</span><br />
            <span style={{ color: "#94A3B8" }}>R_max = </span>
            <Frac num="v₀²" den="g" color="#94A3B8" />
            {" = "}<span style={{ color: AMBER }}>{(v0**2 / g).toFixed(4)} m</span>
          </FormulaBlock>
        </>
      )}
    </div>
  );
}
