import React from "react";

const calcV = (v0, a, t) => v0 + a * t;
const calcS = (v0, a, t, s0) => s0 + v0 * t + 0.5 * a * t * t;

function Badge({ children, color }) {
  const colors = {
    blue: { bg: "rgba(96,165,250,0.15)", text: "#60A5FA", border: "rgba(96,165,250,0.3)" },
    green: { bg: "rgba(34,197,94,0.15)", text: "#22C55E", border: "rgba(34,197,94,0.3)" },
    red: { bg: "rgba(239,68,68,0.15)", text: "#EF4444", border: "rgba(239,68,68,0.3)" },
    amber: { bg: "rgba(245,158,11,0.15)", text: "#F59E0B", border: "rgba(245,158,11,0.3)" },
    purple: { bg: "rgba(168,85,247,0.15)", text: "#A855F7", border: "rgba(168,85,247,0.3)" },
  };
  const c = colors[color] || colors.blue;
  return (
    <span style={{
      display: "inline-block",
      background: c.bg,
      color: c.text,
      border: `1px solid ${c.border}`,
      borderRadius: 20,
      fontSize: 11,
      padding: "2px 10px",
      marginRight: 6,
      marginBottom: 6,
      fontWeight: 500,
    }}>
      {children}
    </span>
  );
}

function InfoCard({ title, children, accent = "#60A5FA" }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 12,
      padding: "14px 16px",
      marginBottom: 10,
    }}>
      <div style={{
        fontSize: 11,
        color: "#475569",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        marginBottom: 8,
      }}>
        {title}
      </div>
      <div style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.7 }}>
        {children}
      </div>
    </div>
  );
}

export default function MUVTheory({ v0, a, s0, t, tmax, modo }) {
  const v = calcV(v0, a, t);
  const s = calcS(v0, a, t, s0);
  const ds = s - s0;
  const m = 1;
  const ek = 0.5 * m * v * v;
  const ek0 = 0.5 * m * v0 * v0;
  const deltaEk = ek - ek0;

  const isAccelerated = Math.abs(a) > 0.01 && v0 * a > 0;
  const isDecelerated = Math.abs(a) > 0.01 && v0 * a < 0;
  const isMRU = Math.abs(a) < 0.01;
  const isGravity = Math.abs(Math.abs(a) - 9.8) < 0.3;

  const tStop = Math.abs(a) > 0.01 ? -v0 / a : null;
  const sAtStop = tStop !== null && tStop > 0 ? calcS(v0, a, tStop, s0) : null;

  const modeTexts = {
    geral: "Movimento retilíneo com aceleração constante não nula (MRUV geral).",
    queda: "Queda livre: objeto em queda sob a ação exclusiva da gravidade (g ≈ 9,8 m/s²), sem resistência do ar.",
    vertical: "Lançamento vertical: objeto lançado para cima com velocidade inicial positiva, desacelerando até parar e depois retornando.",
    horizontal: "Lançamento horizontal: componente horizontal em MRU, componente vertical em queda livre.",
  };

  const vf = calcV(v0, a, tmax);
  const areaTrap = ((v0 + vf) / 2) * tmax;

  return (
    <div style={{ padding: 20, overflowY: "auto", height: "100%" }}>

      {/* Badges */}
      <div style={{ marginBottom: 14 }}>
        {isMRU && <Badge color="blue">MRU</Badge>}
        {!isMRU && <Badge color="blue">MRUV</Badge>}
        {isAccelerated && <Badge color="green">Acelerado</Badge>}
        {isDecelerated && <Badge color="amber">Retardado</Badge>}
        {isGravity && <Badge color="red">Gravitacional</Badge>}
        {v0 === 0 && <Badge color="purple">Repouso inicial</Badge>}
        {v < 0 && <Badge color="red">Sentido negativo</Badge>}
        {v > 0 && <Badge color="green">Sentido positivo</Badge>}
        {v === 0 && <Badge color="amber">Repouso instantâneo</Badge>}
      </div>

      <InfoCard title="Tipo de movimento">
        <strong style={{ color: "#E2E8F0" }}>
          {isMRU
            ? "MRU — Movimento Retilíneo Uniforme"
            : isAccelerated
            ? "MRUV Acelerado — v₀ e a no mesmo sentido"
            : isDecelerated
            ? "MRUV Retardado — v₀ e a em sentidos opostos"
            : "MRUV — partindo do repouso"}
        </strong>
        <br />
        <br />
        {modeTexts[modo]}
      </InfoCard>

      <InfoCard title="Descrição do modo">
        {modo === "queda" && (
          <>
            Na queda livre, a aceleração é <strong style={{ color: "#EF4444" }}>g = −9,8 m/s²</strong> (negativa, para baixo).
            A velocidade aumenta em módulo continuamente. O deslocamento cresce com o quadrado do tempo (s ∝ t²).
          </>
        )}
        {modo === "vertical" && (
          <>
            No lançamento vertical, o corpo sobe enquanto <strong style={{ color: "#22C55E" }}>v &gt; 0</strong> e desce quando <strong style={{ color: "#EF4444" }}>v &lt; 0</strong>.
            No ponto mais alto, <strong style={{ color: "#F59E0B" }}>v = 0</strong> e o tempo é t = v₀/g.
          </>
        )}
        {modo === "horizontal" && (
          <>
            O lançamento horizontal combina MRU no eixo x (velocidade constante) com queda livre no eixo y.
            A trajetória resultante é uma <strong style={{ color: "#A855F7" }}>parábola</strong>.
          </>
        )}
        {modo === "geral" && (
          <>
            No MRUV geral, a aceleração <strong style={{ color: "#60A5FA" }}>a = {a.toFixed(2)} m/s²</strong> é constante.
            A velocidade varia linearmente e a posição varia de forma quadrática com o tempo.
          </>
        )}
      </InfoCard>

      <InfoCard title="Ponto de inversão de sentido">
        {tStop !== null && tStop > 0 && tStop <= tmax ? (
          <>
            O objeto inverte o sentido em{" "}
            <strong style={{ color: "#F59E0B" }}>t = {tStop.toFixed(3)} s</strong>,
            na posição{" "}
            <strong style={{ color: "#F59E0B" }}>s = {sAtStop?.toFixed(3)} m</strong>.
            <br />
            Nesse instante, v = 0 momentaneamente.
          </>
        ) : tStop !== null && tStop <= 0 ? (
          <>
            A inversão de sentido ocorreu antes de t = 0 (no passado). No intervalo simulado, o movimento é monotônico.
          </>
        ) : (
          <>
            {isMRU
              ? "MRU: não há inversão de sentido."
              : "v₀ e a têm o mesmo sinal: o objeto não para no intervalo simulado."}
          </>
        )}
      </InfoCard>

      <InfoCard title="Energia cinética (m = 1 kg)">
        Ek₀ = ½mv₀² = <strong style={{ color: "#E2E8F0" }}>{ek0.toFixed(3)} J</strong>
        <br />
        Ek(t) = ½mv² = <strong style={{ color: "#E2E8F0" }}>{ek.toFixed(3)} J</strong>
        <br />
        ΔEk ={" "}
        <strong style={{ color: deltaEk >= 0 ? "#22C55E" : "#EF4444" }}>
          {deltaEk >= 0 ? "+" : ""}{deltaEk.toFixed(3)} J
        </strong>
        {" "}({deltaEk >= 0 ? "energia ganhou" : "energia perdeu"} com o movimento)
      </InfoCard>

      <InfoCard title="Área sob v(t) = Deslocamento">
        A área do trapézio formado sob o gráfico v(t) entre 0 e {tmax.toFixed(0)} s é igual ao deslocamento:
        <br />
        <strong style={{ color: "#E2E8F0" }}>
          Δs = (v₀ + v_f)/2 × Δt = {areaTrap.toFixed(3)} m
        </strong>
        <br />
        Deslocamento calculado diretamente: <strong style={{ color: "#E2E8F0" }}>{ds.toFixed(3)} m</strong>
      </InfoCard>

      <InfoCard title="Gravitação — comparação com g">
        {isGravity ? (
          <>
            A aceleração configurada (<strong style={{ color: "#EF4444" }}>{a.toFixed(2)} m/s²</strong>) é
            aproximadamente igual à aceleração da gravidade terrestre (<strong style={{ color: "#EF4444" }}>g = 9,8 m/s²</strong>).
            Esse cenário representa queda ou lançamento gravitacional.
          </>
        ) : (
          <>
            A aceleração configurada (<strong style={{ color: "#60A5FA" }}>{a.toFixed(2)} m/s²</strong>) é diferente
            de g = 9,8 m/s². Para simular queda livre, use o modo "Queda Livre" ou ajuste a para −9,8 m/s².
          </>
        )}
      </InfoCard>
    </div>
  );
}