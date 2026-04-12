import React from 'react';

const LogoFisicaLab = () => {
  return (
    <svg viewBox="0 0 260 260" width="100%" height="100%">
      <path d="M 60 50 L 60 150" stroke="currentColor" strokeWidth="16" fill="none" />
      <path d="M 60 50 L 110 50" stroke="currentColor" strokeWidth="16" fill="none" />

      <path d="M 60 100 L 95 100" stroke="currentColor" strokeWidth="12" fill="none" />
      <polygon points="90,92 105,100 90,108" fill="currentColor" />

      <path d="M 140 50 L 140 150 L 210 150" stroke="currentColor" strokeWidth="16" fill="none" />

      <path d="M 140 150 Q 170 150 200 70" stroke="currentColor" strokeWidth="10" fill="none" />

      <text x="130" y="215" textAnchor="middle" fontSize="34" fill="currentColor">
        FísicaLab
      </text>
    </svg>
  );
};

export default LogoFisicaLab;