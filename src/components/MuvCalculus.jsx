import React, { useState, useRef, useEffect } from "react";

// ─── helpers ──────────────────────────────────────────────────────────────────
const calcV  = (v0, a, t)      => v0 + a * t;
const calcS  = (v0, a, t, s0) => s0 + v0 * t + 0.5 * a * t * t;

// ─── SVG fraction helper ──────────────────────────────────────────────────────
function Frac({ num, den, color = "#E2E8F0", size = 14 }) {
  return (
    <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", verticalAlign: "middle", lineHeight: 1, margin: "0 2px" }}>
      <span style={{ fontSize: size * 0.85, color, borderBottom: `1px solid ${color}`, paddingBottom: 1, lineHeight: 1.2 }}>{num}</span>
      <span style={{ fontSize: size * 0.85, color, paddingTop: 1, lineHeight: 1.2 }}>{den}</span>
    </span>
  );
}

// ─── Integral symbol ──────────────────────────────────────────────────────────
function IntSymbol({ from, to, color = "#A855F7", size = 28 }) {
  return (
    <span style={{ position: "relative", display: "inline-flex", flexDirection: "column", alignItems: "center", verticalAlign: "middle", margin: "0 2px" }}>
      <span style={{ fontSize: size * 0.5, color, lineHeight: 1, position: "relative", top: 2 }}>{to}</span>
      <span style={{ fontSize: size * 1.1, color, lineHeight: 0.9, fontFamily: "serif", fontStyle: "italic" }}>∫</span>
      <span style={{ fontSize: size * 0.5, color, lineHeight: 1, position: "relative", bottom: 2 }}>{from}</span>
    </span>
  );
}

// ─── Derivative symbol ────────────────────────────────────────────────────────
function Deriv({ num, den, color = "#38BDF8" }) {
  return (
    <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", verticalAlign: "middle", lineHeight: 1, margin: "0 2px" }}>
      <span style={{ fontSize: 12, color, borderBottom: `1px solid ${color}`, paddingBottom: 1, lineHeight: 1.3 }}>d{num}</span>
      <span style={{ fontSize: 12, color, paddingTop: 1, lineHeight: 1.3 }}>d{den}</span>
    </span>
  );
}

// ─── Canvas for live integral area ────────────────────────────────────────────
function IntegralCanvas({ v0, a, t, tmax, color, width = 420, height = 140 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    const PAD = { top: 16, bottom: 28, left: 32, right: 16 };
    const plotW = W - PAD.left - PAD.right;
    const plotH = H - PAD.top - PAD.bottom;

    ctx.clearRect(0, 0, W, H);

    // Compute velocity range
    const pts = Array.from({ length: 200 }, (_, i) => {
      const ti = (i / 199) * tmax;
      return calcV(v0, a, ti);
    });
    const minV = Math.min(0, ...pts);
    const maxV = Math.max(0, ...pts);
    const rangeV = maxV - minV || 1;

    const toX = (ti) => PAD.left + (ti / tmax) * plotW;
    const toY = (v)  => PAD.top  + (1 - (v - minV) / rangeV) * plotH;

    // Zero line
    const y0 = toY(0);
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(PAD.left, y0);
    ctx.lineTo(PAD.left + plotW, y0);
    ctx.stroke();
    ctx.setLineDash([]);

    // Shaded area under v(t) from 0 to t
    const tEnd = Math.min(t, tmax);
    const steps = 160;
    ctx.beginPath();
    ctx.moveTo(toX(0), y0);
    for (let i = 0; i <= steps; i++) {
      const ti = (i / steps) * tEnd;
      ctx.lineTo(toX(ti), toY(calcV(v0, a, ti)));
    }
    ctx.lineTo(toX(tEnd), y0);
    ctx.closePath();
    const grad = ctx.createLinearGradient(PAD.left, 0, PAD.left + plotW, 0);
    grad.addColorStop(0, color + "55");
    grad.addColorStop(1, color + "22");
    ctx.fillStyle = grad;
    ctx.fill();

    // Full v(t) curve
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    for (let i = 0; i <= 200; i++) {
      const ti = (i / 200) * tmax;
      const vi = calcV(v0, a, ti);
      i === 0 ? ctx.moveTo(toX(ti), toY(vi)) : ctx.lineTo(toX(ti), toY(vi));
    }
    ctx.stroke();

    // Current t marker
    const vNow = calcV(v0, a, tEnd);
    ctx.beginPath();
    ctx.arc(toX(tEnd), toY(vNow), 5, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Axes labels
    ctx.fillStyle = "rgba(148,163,184,0.7)";
    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.fillText("v(t)", PAD.left + 4, PAD.top + 12);
    ctx.fillText(`t=${tEnd.toFixed(1)}s`, toX(tEnd) - 18, H - 6);
    ctx.fillText("0", PAD.left - 12, y0 + 4);
  }, [v0, a, t, tmax, color]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ width: "100%", height: height, display: "block", borderRadius: 8 }}
    />
  );
}

// ─── Canvas for acceleration → velocity integral ───────────────────────────
function AccelCanvas({ v0, a, t, tmax, color, width = 420, height = 100 }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const PAD = { top: 16, bottom: 28, left: 32, right: 16 };
    const plotW = W - PAD.left - PAD.right;
    const plotH = H - PAD.top - PAD.bottom;
    ctx.clearRect(0, 0, W, H);

    const aVal = a;
    const minA = Math.min(0, aVal) - 1;
    const maxA = Math.max(0, aVal) + 1;
    const range = maxA - minA || 1;
    const toX = (ti) => PAD.left + (ti / tmax) * plotW;
    const toY = (v)  => PAD.top + (1 - (v - minA) / range) * plotH;
    const y0 = toY(0);
    const tEnd = Math.min(t, tmax);

    // Grid
    ctx.strokeStyle = "rgba(255,255,255,0.07)";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(PAD.left, y0); ctx.lineTo(PAD.left + plotW, y0); ctx.stroke();
    ctx.setLineDash([]);

    // Shaded rectangle from 0 to t
    ctx.fillStyle = color + "40";
    const ay = toY(aVal);
    ctx.fillRect(PAD.left, Math.min(ay, y0), toX(tEnd) - PAD.left, Math.abs(ay - y0));

    // a(t) = constant line
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.moveTo(PAD.left, toY(aVal));
    ctx.lineTo(PAD.left + plotW, toY(aVal));
    ctx.stroke();

    // Arrow at current t
    ctx.beginPath();
    ctx.arc(toX(tEnd), toY(aVal), 4, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "rgba(148,163,184,0.7)";
    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.fillText("a(t)", PAD.left + 4, PAD.top + 12);
    ctx.fillText(`a=${aVal.toFixed(1)}`, PAD.left + plotW - 40, toY(aVal) - 6);
  }, [v0, a, t, tmax, color]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ width: "100%", height: height, display: "block", borderRadius: 8 }}
    />
  );
}

// ─── Section title ─────────────────────────────────────────────────────────────
function SectionTitle({ children, color }) {
  return (
    <div style={{
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color,
      marginBottom: 10,
      marginTop: 18,
      display: "flex",
      alignItems: "center",
      gap: 8,
    }}>
      <div style={{ flex: 1, height: 1, background: color + "30" }} />
      {children}
      <div style={{ flex: 1, height: 1, background: color + "30" }} />
    </div>
  );
}

// ─── Formula block ─────────────────────────────────────────────────────────────
function FormulaBlock({ title, color = "#60A5FA", children, note }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.025)",
      border: `1px solid rgba(255,255,255,0.07)`,
      borderLeft: `3px solid ${color}`,
      borderRadius: 12,
      padding: "14px 16px",
      marginBottom: 12,
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>
        {title}
      </div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, lineHeight: 2, color: "#CBD5E1" }}>
        {children}
      </div>
      {note && (
        <div style={{ fontSize: 11, color: "#475569", marginTop: 8, lineHeight: 1.6 }}>{note}</div>
      )}
    </div>
  );
}

// ─── Numeric result pill ──────────────────────────────────────────────────────
function Pill({ label, value, unit, color }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      background: "rgba(255,255,255,0.04)",
      borderRadius: 10,
      padding: "8px 12px",
      minWidth: 90,
    }}>
      <span style={{ fontSize: 10, color: "#475569", marginBottom: 3 }}>{label}</span>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, color: color || "#E2E8F0", fontWeight: 600 }}>
        {value} <span style={{ fontSize: 10, color: "#475569" }}>{unit}</span>
      </span>
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function MuvCalculus({ v0, a, s0, t, tmax }) {
  const [activeSection, setActiveSection] = useState("deriv");

  const v   = calcV(v0, a, t);
  const s   = calcS(v0, a, t, s0);
  const ds  = s - s0;
  const vf  = calcV(v0, a, tmax);

  // Definite integrals
  const intV_ds   = s0 + v0 * tmax + 0.5 * a * tmax * tmax - s0; // ∫v dt = Δs
  const intA_dv   = v0 + a * tmax - v0; // ∫a dt = Δv
  const intV_0t   = s0 + v0 * t + 0.5 * a * t * t - s0; // ∫₀ᵗ v dt = s(t)−s0

  // Derivatives at current t
  const dvdt  = a;       // dv/dt = a
  const dsdt  = v;       // ds/dt = v
  const d2sdt2 = a;      // d²s/dt² = a

  const BLUE   = "#60A5FA";
  const GREEN  = "#22C55E";
  const PURPLE = "#A855F7";
  const CYAN   = "#38BDF8";
  const AMBER  = "#F59E0B";
  const CORAL  = "#F87171";

  const SECTIONS = [
    { id: "deriv", label: "Derivadas" },
    { id: "integ", label: "Integrais" },
    { id: "fundamental", label: "Teorema Fundamental" },
    { id: "demo", label: "Demonstrações" },
  ];

  return (
    <div style={{ padding: "18px 20px", overflowY: "auto", height: "100%", fontFamily: "'Sora', sans-serif" }}>

      {/* Sub-nav */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 4 }}>
        {SECTIONS.map(sec => (
          <button
            key={sec.id}
            onClick={() => setActiveSection(sec.id)}
            style={{
              flex: 1, border: "none", borderRadius: 7, padding: "7px 4px",
              background: activeSection === sec.id ? "rgba(96,165,250,0.15)" : "transparent",
              color: activeSection === sec.id ? BLUE : "#475569",
              fontSize: 11, fontFamily: "'Sora', sans-serif", cursor: "pointer",
              fontWeight: activeSection === sec.id ? 600 : 400,
              borderBottom: activeSection === sec.id ? `2px solid ${BLUE}` : "2px solid transparent",
              transition: "all 0.15s",
            }}
          >
            {sec.label}
          </button>
        ))}
      </div>

      {/* ══ DERIVADAS ═════════════════════════════════════════════════════════ */}
      {activeSection === "deriv" && (
        <>
          <SectionTitle color={CYAN}>Cálculo Diferencial na Cinemática</SectionTitle>

          <FormulaBlock title="Velocidade como derivada da posição" color={CYAN}
            note="A velocidade instantânea é a taxa de variação da posição no tempo — a derivada primeira de s(t).">
            <span style={{ color: CYAN }}>v(t)</span>{" = "}
            <Deriv num="s" den="t" color={CYAN} />{" = "}
            <Deriv num="" den="t" color="#94A3B8" />
            <span style={{ color: "#94A3B8" }}>(s₀ + v₀t + </span>
            <Frac num="1" den="2" color="#94A3B8" />
            <span style={{ color: "#94A3B8" }}>at²)</span>
            <br />
            <span style={{ color: CYAN }}>v(t)</span>{" = "}
            <span style={{ color: GREEN }}>v₀ + at</span>
          </FormulaBlock>

          <FormulaBlock title="Aceleração como derivada da velocidade" color={BLUE}
            note="A aceleração instantânea é a derivada primeira de v(t) — ou a derivada segunda de s(t).">
            <span style={{ color: BLUE }}>a(t)</span>{" = "}
            <Deriv num="v" den="t" color={BLUE} />{" = "}
            <Deriv num="²s" den="t²" color={BLUE} />{" = "}
            <span style={{ color: AMBER }}>constante = {a.toFixed(2)} m/s²</span>
          </FormulaBlock>

          <FormulaBlock title="Jerk — variação da aceleração" color={PURPLE}
            note="No MRUV, a aceleração é constante, logo o jerk (variação da aceleração) é zero.">
            <span style={{ color: PURPLE }}>j(t)</span>{" = "}
            <Deriv num="a" den="t" color={PURPLE} />{" = "}
            <Deriv num="³s" den="t³" color={PURPLE} />{" = "}
            <span style={{ color: "#475569" }}>0</span>
            <span style={{ fontSize: 11, color: "#475569", marginLeft: 8 }}>(MRUV → aceleração uniforme)</span>
          </FormulaBlock>

          {/* Live values */}
          <div style={{ background: "rgba(56,189,248,0.05)", border: "1px solid rgba(56,189,248,0.15)", borderRadius: 12, padding: "14px 16px", marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
              Valores das derivadas em t = {t.toFixed(2)} s
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Pill label="ds/dt = v(t)" value={dsdt.toFixed(3)} unit="m/s"  color={CYAN} />
              <Pill label="dv/dt = a(t)" value={dvdt.toFixed(3)} unit="m/s²" color={BLUE} />
              <Pill label="d²s/dt² = a"  value={d2sdt2.toFixed(3)} unit="m/s²" color={PURPLE} />
              <Pill label="d³s/dt³ = 0"  value={"0.000"} unit="m/s³" color="#475569" />
            </div>
          </div>

          <SectionTitle color={AMBER}>Notação de Leibniz vs. Newton</SectionTitle>
          <FormulaBlock title="Correspondência de notações" color={AMBER}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div>
                <div style={{ fontSize: 11, color: "#475569", marginBottom: 4 }}>Leibniz (dx/dt)</div>
                <div style={{ color: AMBER }}>ds/dt = v</div>
                <div style={{ color: AMBER }}>dv/dt = a</div>
                <div style={{ color: AMBER }}>d²s/dt² = a</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#475569", marginBottom: 4 }}>Newton (ṡ, s̈)</div>
                <div style={{ color: CORAL }}>ṡ = v</div>
                <div style={{ color: CORAL }}>v̇ = a</div>
                <div style={{ color: CORAL }}>s̈ = a</div>
              </div>
            </div>
          </FormulaBlock>
        </>
      )}

      {/* ══ INTEGRAIS ═════════════════════════════════════════════════════════ */}
      {activeSection === "integ" && (
        <>
          <SectionTitle color={PURPLE}>Cálculo Integral na Cinemática</SectionTitle>

          <FormulaBlock title="Posição como integral da velocidade" color={PURPLE}
            note="A posição s(t) é obtida integrando a velocidade v(t) = v₀ + at em relação ao tempo.">
            <span style={{ color: PURPLE }}>s(t)</span>{" = s₀ + "}
            <IntSymbol from="0" to="t" color={PURPLE} size={26} />
            <span style={{ color: GREEN }}> v(τ) </span>
            <span style={{ color: "#94A3B8" }}>dτ</span>
            <br />
            <span style={{ color: "#94A3B8" }}>= s₀ + </span>
            <IntSymbol from="0" to="t" color={PURPLE} size={26} />
            <span style={{ color: "#94A3B8" }}>(v₀ + aτ) dτ</span>
            <br />
            <span style={{ color: "#94A3B8" }}>= s₀ + [v₀τ + </span>
            <Frac num="aτ²" den="2" color="#94A3B8" />
            <span style={{ color: "#94A3B8" }}>]₀ᵗ</span>
            <br />
            <span style={{ color: PURPLE }}>s(t) = s₀ + v₀t + </span>
            <Frac num="1" den="2" color={PURPLE} />
            <span style={{ color: PURPLE }}>at²</span>
          </FormulaBlock>

          {/* Canvas: integral of v */}
          <div style={{ background: "rgba(168,85,247,0.05)", border: "1px solid rgba(168,85,247,0.15)", borderRadius: 12, padding: "12px 14px", marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
              Área sob v(t) = deslocamento Δs (visualização)
            </div>
            <IntegralCanvas v0={v0} a={a} t={t} tmax={tmax} color={PURPLE} />
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              <Pill label="∫₀ᵗ v dt = Δs(t)" value={intV_0t.toFixed(3)} unit="m"  color={PURPLE} />
              <Pill label="∫₀ᵀ v dt = Δs total" value={intV_ds.toFixed(3)} unit="m"  color={PURPLE} />
            </div>
          </div>

          <FormulaBlock title="Velocidade como integral da aceleração" color={CYAN}
            note="A velocidade é obtida integrando a aceleração constante a partir de v₀.">
            <span style={{ color: CYAN }}>v(t)</span>{" = v₀ + "}
            <IntSymbol from="0" to="t" color={CYAN} size={26} />
            <span style={{ color: BLUE }}> a(τ) </span>
            <span style={{ color: "#94A3B8" }}>dτ</span>
            <br />
            <span style={{ color: "#94A3B8" }}>= v₀ + a·</span>
            <IntSymbol from="0" to="t" color={CYAN} size={26} />
            <span style={{ color: "#94A3B8" }}>dτ = v₀ + a·t</span>
            <br />
            <span style={{ color: CYAN }}>v(t) = {v0.toFixed(2)} + {a.toFixed(2)}·t</span>
          </FormulaBlock>

          {/* Canvas: integral of a */}
          <div style={{ background: "rgba(56,189,248,0.05)", border: "1px solid rgba(56,189,248,0.15)", borderRadius: 12, padding: "12px 14px", marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
              Área sob a(t) = variação de velocidade Δv (visualização)
            </div>
            <AccelCanvas v0={v0} a={a} t={t} tmax={tmax} color={CYAN} />
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              <Pill label="∫₀ᵗ a dt = Δv(t)" value={(a * t).toFixed(3)} unit="m/s" color={CYAN} />
              <Pill label="∫₀ᵀ a dt = Δv total" value={intA_dv.toFixed(3)} unit="m/s" color={CYAN} />
            </div>
          </div>

          <FormulaBlock title="Integral definida — fórmula do deslocamento" color={GREEN}
            note="Usando o Teorema Fundamental, o deslocamento é calculado como primitiva avaliada nos limites.">
            <IntSymbol from="0" to="T" color={GREEN} size={26} />
            <span style={{ color: GREEN }}> v(t) dt</span>{" = "}
            <span style={{ color: "#94A3B8" }}>[v₀t + </span>
            <Frac num="at²" den="2" color="#94A3B8" />
            <span style={{ color: "#94A3B8" }}>]₀ᵀ</span>{" = "}
            <span style={{ color: GREEN }}>v₀T + </span>
            <Frac num="aT²" den="2" color={GREEN} />
            <br />
            <span style={{ color: "#94A3B8" }}>= {v0.toFixed(2)}·{tmax.toFixed(1)} + </span>
            <Frac num={`${a.toFixed(2)}·${tmax.toFixed(1)}²`} den="2" color="#94A3B8" />
            {" = "}
            <span style={{ color: GREEN }}>{intV_ds.toFixed(4)} m</span>
          </FormulaBlock>
        </>
      )}

      {/* ══ TEOREMA FUNDAMENTAL ══════════════════════════════════════════════ */}
      {activeSection === "fundamental" && (
        <>
          <SectionTitle color={AMBER}>Teorema Fundamental do Cálculo</SectionTitle>

          <FormulaBlock title="1ª Parte — Derivada da integral" color={AMBER}
            note="Se F(t) = ∫₀ᵗ f(τ)dτ, então F'(t) = f(t). Derivar desfaz a integração.">
            <Deriv num="" den="t" color={AMBER} />
            <span style={{ color: "#94A3B8" }}>[</span>
            <IntSymbol from="0" to="t" color={AMBER} size={24} />
            <span style={{ color: GREEN }}>v(τ) </span>
            <span style={{ color: "#94A3B8" }}>dτ</span>
            <span style={{ color: "#94A3B8" }}>]</span>{" = "}
            <span style={{ color: AMBER }}>v(t)</span>
            <br />
            <span style={{ fontSize: 12, color: "#475569" }}>
              Na prática: a derivada de s(t)−s₀ em relação a t é v(t). ✓
            </span>
          </FormulaBlock>

          <FormulaBlock title="2ª Parte — Integral da derivada" color={CORAL}
            note="∫ₐᵇ f'(x)dx = f(b) − f(a). Integrar a aceleração fornece a variação de velocidade.">
            <IntSymbol from="0" to="T" color={CORAL} size={24} />
            <Deriv num="v" den="t" color={CORAL} />
            <span style={{ color: "#94A3B8" }}>dt</span>{" = "}
            <span style={{ color: CORAL }}>v(T) − v(0)</span>
            <br />
            <IntSymbol from="0" to="T" color={CORAL} size={24} />
            <span style={{ color: BLUE }}>a </span>
            <span style={{ color: "#94A3B8" }}>dt</span>{" = "}
            <span style={{ color: CORAL }}>v(T) − v₀</span>
            <br />
            <span style={{ color: "#94A3B8" }}>= {vf.toFixed(2)} − {v0.toFixed(2)} = </span>
            <span style={{ color: CORAL }}>{(vf - v0).toFixed(4)} m/s</span>
          </FormulaBlock>

          <FormulaBlock title="Derivada e integral são operações inversas" color={PURPLE}
            note="Este é o teorema mais importante do Cálculo, unindo derivação e integração.">
            <span style={{ color: "#94A3B8" }}>s(t) </span>
            <span style={{ color: "#475569", fontSize: 11 }}>derivar →</span>
            <span style={{ color: CYAN }}> v(t) </span>
            <span style={{ color: "#475569", fontSize: 11 }}>derivar →</span>
            <span style={{ color: BLUE }}> a(t) </span>
            <span style={{ color: "#475569", fontSize: 11 }}>derivar →</span>
            <span style={{ color: "#475569" }}> 0</span>
            <br />
            <span style={{ color: "#475569" }}>0 </span>
            <span style={{ color: "#475569", fontSize: 11 }}>integrar →</span>
            <span style={{ color: BLUE }}> a(t) </span>
            <span style={{ color: "#475569", fontSize: 11 }}>integrar →</span>
            <span style={{ color: CYAN }}> v(t) </span>
            <span style={{ color: "#475569", fontSize: 11 }}>integrar →</span>
            <span style={{ color: PURPLE }}> s(t)</span>
          </FormulaBlock>

          {/* Hierarchy diagram */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "16px", marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>
              Hierarquia cinemática — valores instantâneos em t = {t.toFixed(2)} s
            </div>
            {[
              { label: "s(t)", val: s.toFixed(4) + " m",    color: PURPLE, desc: "Posição" },
              { label: "v(t) = ds/dt", val: v.toFixed(4) + " m/s",  color: CYAN, desc: "Velocidade" },
              { label: "a(t) = dv/dt", val: a.toFixed(4) + " m/s²", color: BLUE, desc: "Aceleração" },
              { label: "j(t) = da/dt", val: "0.0000 m/s³", color: "#475569", desc: "Jerk" },
            ].map((row, i, arr) => (
              <div key={row.label}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: row.color, flexShrink: 0 }} />
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: row.color, flex: 1 }}>{row.label}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#E2E8F0" }}>{row.val}</div>
                  <div style={{ fontSize: 10, color: "#475569", minWidth: 70, textAlign: "right" }}>{row.desc}</div>
                </div>
                {i < arr.length - 1 && (
                  <div style={{ paddingLeft: 16, color: "#334155", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
                    ↑ ∫ dt  /  ↓ d/dt
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ══ DEMONSTRAÇÕES ════════════════════════════════════════════════════ */}
      {activeSection === "demo" && (
        <>
          <SectionTitle color={GREEN}>Demonstrações via Cálculo</SectionTitle>

          <FormulaBlock title="Dedução da equação de Torricelli por eliminação de t" color={GREEN}
            note="Combinando as duas leis horárias para eliminar o tempo t, obtemos a equação de Torricelli.">
            <span style={{ color: "#94A3B8" }}>v = v₀ + at  →  t = </span>
            <Frac num="v − v₀" den="a" color="#94A3B8" />
            <br />
            <span style={{ color: "#94A3B8" }}>Δs = v₀t + </span>
            <Frac num="1" den="2" color="#94A3B8" />
            <span style={{ color: "#94A3B8" }}>at²</span>
            <br />
            <span style={{ color: "#94A3B8" }}>Substituindo t:</span>
            <br />
            <span style={{ color: GREEN }}>v² = v₀² + 2a·Δs</span>
            <br />
            <span style={{ fontSize: 11, color: "#475569" }}>
              Δs = {ds.toFixed(3)} m  →  v² = {(v0**2 + 2*a*ds).toFixed(3)} m²/s²  ✓
            </span>
          </FormulaBlock>

          <FormulaBlock title="Velocidade média como derivada — dedução pela regra do trapézio" color={AMBER}>
            <span style={{ color: "#94A3B8" }}>v_m = </span>
            <Frac num="Δs" den="Δt" color="#94A3B8" />{" = "}
            <Frac num={
              <><IntSymbol from="0" to="T" color={AMBER} size={18} /><span> v dt</span></>
            } den="T" color={AMBER} />
            <br />
            <span style={{ color: "#94A3B8" }}>= </span>
            <Frac num="v₀T + aT²/2" den="T" color="#94A3B8" />{" = v₀ + "}
            <Frac num="aT" den="2" color="#94A3B8" />{" = "}
            <Frac num="v₀ + v_f" den="2" color={AMBER} />
            <br />
            <span style={{ color: AMBER }}>v_m = {((v0 + vf) / 2).toFixed(4)} m/s</span>
          </FormulaBlock>

          <FormulaBlock title="Área sob a parábola s(t) — integral definida" color={PURPLE}
            note="A área sob a curva de posição entre 0 e T não tem significado físico direto, mas ilustra a integração de uma função quadrática.">
            <IntSymbol from="0" to="T" color={PURPLE} size={26} />
            <span style={{ color: "#94A3B8" }}>(s₀ + v₀t + </span>
            <Frac num="at²" den="2" color="#94A3B8" />
            <span style={{ color: "#94A3B8" }}>)dt</span>
            <br />
            <span style={{ color: "#94A3B8" }}>= [s₀t + </span>
            <Frac num="v₀t²" den="2" color="#94A3B8" />
            <span style={{ color: "#94A3B8" }}> + </span>
            <Frac num="at³" den="6" color="#94A3B8" />
            <span style={{ color: "#94A3B8" }}>]₀ᵀ</span>
            <br />
            <span style={{ color: PURPLE }}>
              = {(s0 * tmax + (v0 * tmax**2) / 2 + (a * tmax**3) / 6).toFixed(4)} m·s
            </span>
          </FormulaBlock>

          <FormulaBlock title="Princípio da superposição — soluções da EDO" color={CORAL}
            note="A cinemática do MRUV é solução de uma EDO de 2ª ordem com coeficientes constantes.">
            <span style={{ color: "#94A3B8" }}>EDO: </span>
            <Deriv num="²s" den="t²" color={CORAL} />
            <span style={{ color: CORAL }}> = a  (constante)</span>
            <br />
            <span style={{ color: "#94A3B8" }}>Solução geral: s(t) = C₁ + C₂t + </span>
            <Frac num="at²" den="2" color="#94A3B8" />
            <br />
            <span style={{ color: "#94A3B8" }}>C.I.: s(0) = s₀ → C₁ = s₀</span>
            <br />
            <span style={{ color: "#94A3B8" }}>      s'(0) = v₀ → C₂ = v₀</span>
            <br />
            <span style={{ color: CORAL }}>s(t) = {s0.toFixed(1)} + {v0.toFixed(1)}t + </span>
            <Frac num={`${a.toFixed(1)}t²`} den="2" color={CORAL} />
          </FormulaBlock>
        </>
      )}

    </div>
  );
}
