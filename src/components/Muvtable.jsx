import React from "react";

const calcV = (v0, a, t) => v0 + a * t;
const calcS = (v0, a, t, s0) => s0 + v0 * t + 0.5 * a * t * t;

export default function MUVTable({ v0, a, s0, t, tmax }) {
  const steps = Math.min(Math.floor(tmax), 30);
  const dt = tmax / steps;

  const rows = Array.from({ length: steps + 1 }, (_, i) => {
    const ti = i * dt;
    const si = calcS(v0, a, ti, s0);
    const vi = calcV(v0, a, ti);
    const dsi = si - s0;
    return { ti, si, vi, dsi };
  });

  const isCurrent = (ti) => Math.abs(ti - t) < dt * 0.6;

  const thStyle = {
    textAlign: "left",
    fontSize: 11,
    color: "#475569",
    padding: "8px 12px",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
    whiteSpace: "nowrap",
  };

  const tdBase = {
    padding: "7px 12px",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12,
    borderBottom: "1px solid rgba(255,255,255,0.04)",
    whiteSpace: "nowrap",
  };

  return (
    <div style={{ padding: 20, overflowY: "auto", height: "100%" }}>
      <div style={{ fontSize: 11, color: "#475569", marginBottom: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
        Valores tabulados — passo Δt = {dt.toFixed(3)} s
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.03)" }}>
              <th style={thStyle}>#</th>
              <th style={thStyle}>t (s)</th>
              <th style={thStyle}>s (m)</th>
              <th style={thStyle}>v (m/s)</th>
              <th style={thStyle}>a (m/s²)</th>
              <th style={thStyle}>Δs (m)</th>
              <th style={thStyle}>|v| (m/s)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ ti, si, vi, dsi }, idx) => {
              const highlight = isCurrent(ti);
              const rowBg = highlight
                ? "rgba(96,165,250,0.12)"
                : idx % 2 === 0
                ? "transparent"
                : "rgba(255,255,255,0.015)";
              const textColor = highlight ? "#60A5FA" : "#94A3B8";

              return (
                <tr key={idx} style={{ background: rowBg }}>
                  <td style={{ ...tdBase, color: "#475569" }}>{idx}</td>
                  <td style={{ ...tdBase, color: highlight ? "#60A5FA" : "#CBD5E1", fontWeight: highlight ? 600 : 400 }}>
                    {ti.toFixed(3)}
                    {highlight && " ◀"}
                  </td>
                  <td style={{ ...tdBase, color: textColor }}>{si.toFixed(4)}</td>
                  <td style={{
                    ...tdBase,
                    color: vi > 0 ? "#22C55E" : vi < 0 ? "#EF4444" : "#F59E0B",
                    fontWeight: 500,
                  }}>
                    {vi.toFixed(4)}
                  </td>
                  <td style={{ ...tdBase, color: textColor }}>{a.toFixed(4)}</td>
                  <td style={{
                    ...tdBase,
                    color: dsi > 0 ? "#22C55E" : dsi < 0 ? "#EF4444" : "#94A3B8",
                  }}>
                    {dsi.toFixed(4)}
                  </td>
                  <td style={{ ...tdBase, color: textColor }}>{Math.abs(vi).toFixed(4)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{
        marginTop: 16,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 10,
        padding: "12px 16px",
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 12,
      }}>
        {[
          { label: "v_max", value: `${Math.max(...rows.map(r => r.vi)).toFixed(4)} m/s` },
          { label: "v_min", value: `${Math.min(...rows.map(r => r.vi)).toFixed(4)} m/s` },
          { label: "s_max", value: `${Math.max(...rows.map(r => r.si)).toFixed(4)} m` },
          { label: "s_min", value: `${Math.min(...rows.map(r => r.si)).toFixed(4)} m` },
          { label: "Δs total", value: `${(calcS(v0, a, tmax, s0) - s0).toFixed(4)} m` },
          { label: "dist. total", value: `${rows.reduce((acc, r, i) => i === 0 ? 0 : acc + Math.abs(r.si - rows[i-1].si), 0).toFixed(4)} m` },
        ].map(({ label, value }) => (
          <div key={label}>
            <div style={{ fontSize: 10, color: "#475569", marginBottom: 2 }}>{label}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#E2E8F0", fontWeight: 500 }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}