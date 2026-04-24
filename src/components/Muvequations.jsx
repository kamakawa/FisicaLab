import React from "react";

const calcV = (v0, a, t) => v0 + a * t;
const calcS = (v0, a, t, s0) => s0 + v0 * t + 0.5 * a * t * t;

const mono = { fontFamily: "'JetBrains Mono', monospace" };

function EqBlock({ title, formula, substitution, result, color = "#60A5FA" }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: `1px solid rgba(255,255,255,0.07)`,
      borderLeft: `3px solid ${color}`,
      borderRadius: 12,
      padding: "14px 16px",
      marginBottom: 10,
    }}>
      <div style={{ fontSize: 11, color: "#475569", marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {title}
      </div>
      <div style={{ ...mono, fontSize: 15, color: "#CBD5E1", marginBottom: 6 }}>
        {formula}
      </div>
      {substitution && (
        <div style={{ ...mono, fontSize: 12, color: color, marginBottom: 4 }}>
          → {substitution}
        </div>
      )}
      {result && (
        <div style={{ ...mono, fontSize: 14, color: "#E2E8F0", fontWeight: 600 }}>
          = {result}
        </div>
      )}
    </div>
  );
}

export default function MUVEquations({ v0, a, s0, t, tmax }) {
  const v = calcV(v0, a, t);
  const s = calcS(v0, a, t, s0);
  const ds = s - s0;
  const vm = (v0 + v) / 2;
  const v2 = v * v;
  const v02 = v0 * v0;
  const torr = v02 + 2 * a * ds;

  const tStop = Math.abs(a) > 0.01 ? -v0 / a : null;
  const sStop = Math.abs(a) > 0.01 ? s0 + (v0 * v0) / (2 * a) : null;
  const vf = calcV(v0, a, tmax);
  const areaTrapezio = ((v0 + vf) / 2) * tmax;

  return (
    <div style={{ padding: 20, overflowY: "auto", height: "100%" }}>
      <EqBlock
        title="Lei horária da velocidade"
        formula="v(t) = v₀ + a · t"
        substitution={`v = ${v0.toFixed(2)} + ${a.toFixed(2)} × ${t.toFixed(2)}`}
        result={`${v.toFixed(4)} m/s`}
        color="#60A5FA"
      />
      <EqBlock
        title="Lei horária da posição"
        formula="s(t) = s₀ + v₀·t + ½·a·t²"
        substitution={`s = ${s0.toFixed(2)} + ${v0.toFixed(2)}×${t.toFixed(2)} + 0.5×${a.toFixed(2)}×${t.toFixed(2)}²`}
        result={`${s.toFixed(4)} m`}
        color="#22C55E"
      />
      <EqBlock
        title="Equação de Torricelli (sem t)"
        formula="v² = v₀² + 2·a·Δs"
        substitution={`${v2.toFixed(3)} = ${v02.toFixed(3)} + 2×${a.toFixed(2)}×${ds.toFixed(3)}`}
        result={`${v2.toFixed(4)} ≈ ${torr.toFixed(4)} ✓`}
        color="#A855F7"
      />
      <EqBlock
        title="Velocidade média"
        formula="v_m = (v₀ + v) / 2 = Δs / Δt"
        substitution={`v_m = (${v0.toFixed(2)} + ${v.toFixed(2)}) / 2`}
        result={`${vm.toFixed(4)} m/s`}
        color="#F59E0B"
      />
      <EqBlock
        title="Tempo para parar (v = 0)"
        formula="t_stop = −v₀ / a   (somente se a ≠ 0)"
        substitution={
          tStop !== null
            ? `t_stop = −(${v0.toFixed(2)}) / ${a.toFixed(2)}`
            : "a = 0 → MRU, nunca para"
        }
        result={
          tStop !== null
            ? tStop >= 0
              ? `${tStop.toFixed(4)} s`
              : `${tStop.toFixed(4)} s (no passado — sem inversão futura)`
            : "indefinido"
        }
        color="#EF4444"
      />
      <EqBlock
        title="Posição no ponto de parada"
        formula="s_max = s₀ + v₀² / (2a)   (a ≠ 0)"
        substitution={
          sStop !== null
            ? `s_max = ${s0.toFixed(2)} + ${v02.toFixed(2)} / (2×${a.toFixed(2)})`
            : "a = 0 → posição cresce linearmente"
        }
        result={sStop !== null ? `${sStop.toFixed(4)} m` : "—"}
        color="#EF4444"
      />
      <EqBlock
        title="Deslocamento (área sob v×t)"
        formula="Δs = (v₀ + v_f) / 2 · Δt   [trapézio]"
        substitution={`Δs = (${v0.toFixed(2)} + ${vf.toFixed(2)}) / 2 × ${tmax.toFixed(1)}`}
        result={`${areaTrapezio.toFixed(4)} m`}
        color="#38BDF8"
      />

      <div style={{
        background: "rgba(96,165,250,0.05)",
        border: "1px solid rgba(96,165,250,0.15)",
        borderRadius: 12,
        padding: "12px 16px",
        marginTop: 8,
      }}>
        <div style={{ fontSize: 11, color: "#475569", marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Resumo no instante t = {t.toFixed(2)} s
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[
            { label: "v(t)", value: `${v.toFixed(3)} m/s` },
            { label: "s(t)", value: `${s.toFixed(3)} m` },
            { label: "Δs", value: `${ds.toFixed(3)} m` },
            { label: "v_m", value: `${vm.toFixed(3)} m/s` },
            { label: "v²", value: `${v2.toFixed(3)} m²/s²` },
            { label: "v₀²", value: `${v02.toFixed(3)} m²/s²` },
          ].map(({ label, value }) => (
            <div key={label}>
              <div style={{ fontSize: 10, color: "#475569", marginBottom: 2 }}>{label}</div>
              <div style={{ ...mono, fontSize: 13, color: "#E2E8F0", fontWeight: 500 }}>{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}