import React, { useState, useRef, useEffect } from "react";

// ─── helpers ──────────────────────────────────────────────────────────────────
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

function SectionTitle({ children, color }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color, marginBottom: 10, marginTop: 18, display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 1, background: color + "30" }} />
      {children}
      <div style={{ flex: 1, height: 1, background: color + "30" }} />
    </div>
  );
}

function FormulaBlock({ title, color = "#60A5FA", children, note }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.025)", border: `1px solid rgba(255,255,255,0.07)`, borderLeft: `3px solid ${color}`, borderRadius: 12, padding: "14px 16px", marginBottom: 12 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>{title}</div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, lineHeight: 2, color: "#CBD5E1" }}>{children}</div>
      {note && <div style={{ fontSize: 11, color: "#475569", marginTop: 8, lineHeight: 1.6 }}>{note}</div>}
    </div>
  );
}

function Pill({ label, value, unit, color }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "8px 12px", minWidth: 90 }}>
      <span style={{ fontSize: 10, color: "#475569", marginBottom: 3 }}>{label}</span>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, color: color || "#E2E8F0", fontWeight: 600 }}>
        {value} <span style={{ fontSize: 10, color: "#475569" }}>{unit}</span>
      </span>
    </div>
  );
}

// ─── Live canvas: position x(t) for MRU ──────────────────────────────────────
function MRUCanvas({ v, x0, t, tmax, color, height = 130 }) {
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
    const PAD = { top: 16, bottom: 28, left: 36, right: 16 };
    const plotW = W - PAD.left - PAD.right;
    const plotH = H - PAD.top - PAD.bottom;
    ctx.clearRect(0, 0, W, H);

    const pts = Array.from({ length: 200 }, (_, i) => {
      const ti = (i / 199) * tmax;
      return x0 + v * ti;
    });
    const minX = Math.min(...pts) - 0.5;
    const maxX = Math.max(...pts) + 0.5;
    const rangeX = maxX - minX || 1;
    const toX = (ti) => PAD.left + (ti / tmax) * plotW;
    const toY = (xi) => PAD.top + (1 - (xi - minX) / rangeX) * plotH;
    const tEnd = Math.min(t, tmax);

    // Grid
    ctx.strokeStyle = "rgba(255,255,255,0.07)";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    for (let i = 0; i <= 4; i++) {
      const yi = PAD.top + (i / 4) * plotH;
      ctx.beginPath(); ctx.moveTo(PAD.left, yi); ctx.lineTo(PAD.left + plotW, yi); ctx.stroke();
    }
    ctx.setLineDash([]);

    // Shaded area 0 to t (integral = displacement)
    ctx.beginPath();
    ctx.moveTo(toX(0), toY(x0));
    for (let i = 0; i <= 160; i++) {
      const ti = (i / 160) * tEnd;
      ctx.lineTo(toX(ti), toY(x0 + v * ti));
    }
    ctx.lineTo(toX(tEnd), toY(x0));
    ctx.closePath();
    const grad = ctx.createLinearGradient(PAD.left, 0, PAD.left + plotW, 0);
    grad.addColorStop(0, color + "55");
    grad.addColorStop(1, color + "18");
    ctx.fillStyle = grad;
    ctx.fill();

    // x(t) line
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.moveTo(toX(0), toY(x0));
    ctx.lineTo(toX(tmax), toY(x0 + v * tmax));
    ctx.stroke();

    // Point
    ctx.beginPath();
    ctx.arc(toX(tEnd), toY(x0 + v * tEnd), 5, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Labels
    ctx.fillStyle = "rgba(148,163,184,0.7)";
    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.fillText("x(t)", PAD.left + 4, PAD.top + 12);
    ctx.fillText(`t=${tEnd.toFixed(1)}s`, toX(tEnd) - 18, H - 6);
    ctx.fillText(x0.toFixed(0), PAD.left - 28, toY(x0) + 4);
  }, [v, x0, t, tmax, color]);

  return (
    <canvas ref={canvasRef} width={500} height={height}
      style={{ width: "100%", height, display: "block", borderRadius: 8 }} />
  );
}

// ─── Velocity canvas for MRU (constant) ───────────────────────────────────────
function VelCanvas({ v, t, tmax, color, height = 90 }) {
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

    const minV = Math.min(0, v) - 0.5;
    const maxV = Math.max(0, v) + 0.5;
    const range = maxV - minV || 1;
    const toX = (ti) => PAD.left + (ti / tmax) * plotW;
    const toY = (vi) => PAD.top + (1 - (vi - minV) / range) * plotH;
    const y0 = toY(0);
    const tEnd = Math.min(t, tmax);

    // Zero line
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(PAD.left, y0); ctx.lineTo(PAD.left + plotW, y0); ctx.stroke();
    ctx.setLineDash([]);

    // Shaded area = displacement
    ctx.fillStyle = color + "40";
    const ay = toY(v);
    ctx.fillRect(PAD.left, Math.min(ay, y0), toX(tEnd) - PAD.left, Math.abs(ay - y0));

    // Constant v line
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.moveTo(PAD.left, toY(v));
    ctx.lineTo(PAD.left + plotW, toY(v));
    ctx.stroke();

    // Point
    ctx.beginPath();
    ctx.arc(toX(tEnd), toY(v), 4, 0, Math.PI * 2);
    ctx.fillStyle = "#fff"; ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.stroke();

    ctx.fillStyle = "rgba(148,163,184,0.7)";
    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.fillText("v(t)", PAD.left + 4, PAD.top + 12);
    ctx.fillText(`v=${v.toFixed(1)}`, PAD.left + plotW - 50, toY(v) - 6);
  }, [v, t, tmax, color]);

  return (
    <canvas ref={canvasRef} width={500} height={height}
      style={{ width: "100%", height, display: "block", borderRadius: 8 }} />
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function MRUCalculus({ velocidade, posInicial, tempo }) {
  const [activeSection, setActiveSection] = useState("deriv");

  const v   = velocidade;
  const x0  = posInicial;
  const t   = tempo;
  const T   = 20; // tmax reference
  const x   = x0 + v * t;
  const ds  = v * t;

  const BLUE   = "#60A5FA";
  const GREEN  = "#22C55E";
  const PURPLE = "#A855F7";
  const CYAN   = "#38BDF8";
  const AMBER  = "#F59E0B";
  const CORAL  = "#F87171";

  const SECTIONS = [
    { id: "deriv",       label: "Derivadas" },
    { id: "integ",       label: "Integrais" },
    { id: "fundamental", label: "Teorema Fund." },
    { id: "demo",        label: "Demonstrações" },
  ];

  return (
    <div style={{ padding: "18px 20px", overflowY: "auto", height: "100%", fontFamily: "'Sora', sans-serif" }}>

      {/* Sub-nav */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 4 }}>
        {SECTIONS.map(sec => (
          <button key={sec.id} onClick={() => setActiveSection(sec.id)}
            style={{
              flex: 1, border: "none", borderRadius: 7, padding: "7px 4px",
              background: activeSection === sec.id ? "rgba(0,212,255,0.12)" : "transparent",
              color: activeSection === sec.id ? CYAN : "#475569",
              fontSize: 11, fontFamily: "'Sora', sans-serif", cursor: "pointer",
              fontWeight: activeSection === sec.id ? 600 : 400,
              borderBottom: activeSection === sec.id ? `2px solid ${CYAN}` : "2px solid transparent",
              transition: "all 0.15s",
            }}>{sec.label}</button>
        ))}
      </div>

      {/* ══ DERIVADAS ═══════════════════════════════════════════════════════ */}
      {activeSection === "deriv" && (
        <>
          <SectionTitle color={CYAN}>Cálculo Diferencial no MRU</SectionTitle>

          <FormulaBlock title="Velocidade como derivada da posição" color={CYAN}
            note="No MRU, a posição varia linearmente com o tempo. Sua derivada é a velocidade constante v.">
            <span style={{ color: CYAN }}>v</span>{" = "}
            <Deriv num="x" den="t" color={CYAN} />{" = "}
            <Deriv num="" den="t" color="#94A3B8" />
            <span style={{ color: "#94A3B8" }}>(x₀ + vt)</span>{" = "}
            <span style={{ color: GREEN }}>v = {v.toFixed(2)} m/s</span>
            <br />
            <span style={{ fontSize: 12, color: "#475569" }}>
              A derivada de uma função linear é sempre constante.
            </span>
          </FormulaBlock>

          <FormulaBlock title="Aceleração no MRU" color={BLUE}
            note="No MRU, a velocidade é constante. Portanto, sua derivada (aceleração) é zero.">
            <span style={{ color: BLUE }}>a(t)</span>{" = "}
            <Deriv num="v" den="t" color={BLUE} />{" = "}
            <Deriv num="²x" den="t²" color={BLUE} />{" = "}
            <span style={{ color: "#475569" }}>0</span>
            <br />
            <span style={{ fontSize: 12, color: "#475569" }}>
              MRU: velocidade constante → aceleração nula → jerk nulo.
            </span>
          </FormulaBlock>

          <div style={{ background: "rgba(56,189,248,0.05)", border: "1px solid rgba(56,189,248,0.15)", borderRadius: 12, padding: "14px 16px", marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
              Derivadas em t = {t.toFixed(2)} s
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Pill label="dx/dt = v" value={v.toFixed(3)} unit="m/s" color={CYAN} />
              <Pill label="dv/dt = a" value={"0.000"} unit="m/s²" color={BLUE} />
              <Pill label="d²x/dt² = 0" value={"0.000"} unit="m/s²" color="#475569" />
            </div>
          </div>

          <FormulaBlock title="Inclinação (slope) = velocidade" color={AMBER}
            note="No gráfico x(t) do MRU, a inclinação da reta é exatamente a velocidade — interpretação geométrica da derivada.">
            <span style={{ color: AMBER }}>slope</span>{" = "}
            <Frac num="Δx" den="Δt" color={AMBER} />{" = "}
            <Deriv num="x" den="t" color={AMBER} />{" = v = "}
            <span style={{ color: GREEN }}>{v.toFixed(2)} m/s</span>
          </FormulaBlock>
        </>
      )}

      {/* ══ INTEGRAIS ═══════════════════════════════════════════════════════ */}
      {activeSection === "integ" && (
        <>
          <SectionTitle color={PURPLE}>Cálculo Integral no MRU</SectionTitle>

          <FormulaBlock title="Posição como integral da velocidade" color={PURPLE}
            note="Integrando a velocidade constante v em relação ao tempo obtemos o deslocamento.">
            <span style={{ color: PURPLE }}>x(t)</span>{" = x₀ + "}
            <IntSymbol from="0" to="t" color={PURPLE} size={26} />
            <span style={{ color: CYAN }}> v </span>
            <span style={{ color: "#94A3B8" }}>dτ</span>
            {" = x₀ + v·t"}
            <br />
            <span style={{ color: PURPLE }}>x(t) = {x0.toFixed(2)} + {v.toFixed(2)}·t</span>
          </FormulaBlock>

          <div style={{ background: "rgba(168,85,247,0.05)", border: "1px solid rgba(168,85,247,0.15)", borderRadius: 12, padding: "12px 14px", marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
              Gráfico x(t) — área sob v(t) = deslocamento
            </div>
            <div style={{ fontSize: 11, color: "#475569", marginBottom: 8 }}>Gráfico de posição x(t):</div>
            <MRUCanvas v={v} x0={x0} t={t} tmax={T} color={PURPLE} />
            <div style={{ fontSize: 11, color: "#475569", margin: "8px 0" }}>Gráfico de velocidade v(t) — área = deslocamento:</div>
            <VelCanvas v={v} t={t} tmax={T} color={CYAN} />
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              <Pill label="∫₀ᵗ v dτ = Δx(t)" value={ds.toFixed(3)} unit="m" color={PURPLE} />
              <Pill label="x(t)" value={x.toFixed(3)} unit="m" color={CYAN} />
            </div>
          </div>

          <FormulaBlock title="Integral definida do deslocamento" color={GREEN}>
            <IntSymbol from="0" to="T" color={GREEN} size={26} />
            <span style={{ color: "#94A3B8" }}>v dτ</span>{" = v·"}
            <IntSymbol from="0" to="T" color={GREEN} size={26} />
            <span style={{ color: "#94A3B8" }}>dτ</span>
            {" = v·T = [vτ]₀ᵀ"}
            <br />
            <span style={{ color: "#94A3B8" }}>= {v.toFixed(2)} × {T.toFixed(0)} = </span>
            <span style={{ color: GREEN }}>{(v * T).toFixed(4)} m</span>
          </FormulaBlock>

          <FormulaBlock title="Integral da aceleração = variação de velocidade" color={CORAL}
            note="Como a = 0 no MRU, a integral da aceleração é zero — a velocidade não muda.">
            <IntSymbol from="0" to="t" color={CORAL} size={26} />
            <span style={{ color: "#94A3B8" }}>a dτ</span>
            {" = "}
            <IntSymbol from="0" to="t" color={CORAL} size={26} />
            <span style={{ color: "#94A3B8" }}>0 dτ</span>{" = "}
            <span style={{ color: CORAL }}>0</span>
            <br />
            <span style={{ fontSize: 12, color: "#475569" }}>
              Δv = 0 → velocidade constante, conforme esperado no MRU.
            </span>
          </FormulaBlock>
        </>
      )}

      {/* ══ TEOREMA FUNDAMENTAL ═════════════════════════════════════════════ */}
      {activeSection === "fundamental" && (
        <>
          <SectionTitle color={AMBER}>Teorema Fundamental do Cálculo no MRU</SectionTitle>

          <FormulaBlock title="1ª Parte — derivada da integral de posição" color={AMBER}>
            <Deriv num="" den="t" color={AMBER} />
            <span style={{ color: "#94A3B8" }}>[</span>
            <IntSymbol from="0" to="t" color={AMBER} size={24} />
            <span style={{ color: CYAN }}>v dτ</span>
            <span style={{ color: "#94A3B8" }}>]</span>{" = "}
            <span style={{ color: AMBER }}>v(t) = {v.toFixed(2)} m/s</span>
            <br />
            <span style={{ fontSize: 12, color: "#475569" }}>
              Derivar ∫₀ᵗ v dτ = x(t)−x₀ retorna v(t). ✓
            </span>
          </FormulaBlock>

          <FormulaBlock title="2ª Parte — integral da derivada" color={CORAL}>
            <IntSymbol from="0" to="T" color={CORAL} size={24} />
            <Deriv num="x" den="t" color={CORAL} />
            <span style={{ color: "#94A3B8" }}>dt</span>{" = "}
            <span style={{ color: CORAL }}>x(T) − x(0) = {(x0 + v * T).toFixed(2)} − {x0.toFixed(2)} = {(v * T).toFixed(4)} m</span>
          </FormulaBlock>

          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "16px", marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>
              Hierarquia cinemática MRU — t = {t.toFixed(2)} s
            </div>
            {[
              { label: "x(t)",    val: x.toFixed(4) + " m",    color: PURPLE, desc: "Posição" },
              { label: "v = dx/dt", val: v.toFixed(4) + " m/s",  color: CYAN, desc: "Velocidade" },
              { label: "a = dv/dt", val: "0.0000 m/s²", color: "#475569", desc: "Aceleração" },
            ].map((row, i, arr) => (
              <div key={row.label}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: row.color, flexShrink: 0 }} />
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: row.color, flex: 1 }}>{row.label}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#E2E8F0" }}>{row.val}</div>
                  <div style={{ fontSize: 10, color: "#475569", minWidth: 70, textAlign: "right" }}>{row.desc}</div>
                </div>
                {i < arr.length - 1 && (
                  <div style={{ paddingLeft: 16, color: "#334155", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>↑ ∫ dt  /  ↓ d/dt</div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ══ DEMONSTRAÇÕES ════════════════════════════════════════════════════ */}
      {activeSection === "demo" && (
        <>
          <SectionTitle color={GREEN}>Demonstrações — MRU via Cálculo</SectionTitle>

          <FormulaBlock title="MRU como caso limite do MRUV (a → 0)" color={GREEN}
            note="O MRU é obtido quando a aceleração tende a zero na equação do MRUV.">
            <span style={{ color: "#94A3B8" }}>lim</span>
            <span style={{ fontSize: 10, color: "#475569" }}>a→0</span>
            <span style={{ color: "#94A3B8" }}> [x₀ + v₀t + </span>
            <Frac num="at²" den="2" color="#94A3B8" />
            <span style={{ color: "#94A3B8" }}>]</span>{" = "}
            <span style={{ color: GREEN }}>x₀ + vt</span>
            <br />
            <span style={{ fontSize: 12, color: "#475569" }}>O termo quadrático desaparece e obtemos a equação do MRU.</span>
          </FormulaBlock>

          <FormulaBlock title="EDO do MRU — equação diferencial ordinária" color={PURPLE}
            note="O MRU satisfaz uma EDO de 1ª ordem com condição inicial x(0) = x₀.">
            <span style={{ color: "#94A3B8" }}>EDO: </span>
            <Deriv num="x" den="t" color={PURPLE} />{" = v (constante)"}
            <br />
            <span style={{ color: "#94A3B8" }}>Solução: x(t) = C + vt</span>
            <br />
            <span style={{ color: "#94A3B8" }}>C.I.: x(0) = x₀ → C = x₀</span>
            <br />
            <span style={{ color: PURPLE }}>x(t) = {x0.toFixed(1)} + {v.toFixed(1)}·t</span>
          </FormulaBlock>

          <FormulaBlock title="Média temporal de x(t) no intervalo [0, T]" color={AMBER}>
            <span style={{ color: AMBER }}>⟨x⟩</span>{" = "}
            <Frac num={<><IntSymbol from="0" to="T" color={AMBER} size={18} /><span> x(t) dt</span></>} den="T" color={AMBER} />
            {" = "}
            <Frac num="x₀T + vT²/2" den="T" color="#94A3B8" />
            {" = x₀ + "}
            <Frac num="vT" den="2" color={AMBER} />
            <br />
            <span style={{ color: AMBER }}>⟨x⟩ = {(x0 + v * T / 2).toFixed(4)} m</span>
            <br />
            <span style={{ fontSize: 12, color: "#475569" }}>A posição média é o ponto médio entre x(0) e x(T).</span>
          </FormulaBlock>

          <FormulaBlock title="Velocidade média = velocidade instantânea (MRU)" color={CORAL}
            note="No MRU, a velocidade não varia, logo v_m = v para qualquer intervalo.">
            <span style={{ color: CORAL }}>v_m</span>{" = "}
            <Frac num="Δx" den="Δt" color="#94A3B8" />{" = "}
            <Frac num={<><IntSymbol from="0" to="T" color={CORAL} size={18} /><span>v dt</span></>} den="T" color={CORAL} />
            {" = "}
            <Frac num="vT" den="T" color={CORAL} />{" = v = "}
            <span style={{ color: GREEN }}>{v.toFixed(2)} m/s</span>
          </FormulaBlock>
        </>
      )}
    </div>
  );
}
