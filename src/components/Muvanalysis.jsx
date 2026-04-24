import React from "react";
import MUVTheory from "./MUVTheory";

export default function MUVAnalysis({ v0, a, s0, t, tmax, modo }) {
  return <MUVTheory v0={v0} a={a} s0={s0} t={t} tmax={tmax} modo={modo} />;
}