import React from 'react';

const LogoFisicaLab = () => {
  return (
    <svg 
      viewBox="0 0 260 260" 
      width="100%" 
      height="100%" 
      style={{ maxWidth: '200px' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M 60 50 L 60 150" stroke="#1E3A8A" strokeWidth="16" strokeLinecap="round" fill="none" />
      <path d="M 60 50 L 110 50" stroke="#1E3A8A" strokeWidth="16" strokeLinecap="round" fill="none" />
      <path d="M 60 100 L 95 100" stroke="#F97316" strokeWidth="12" strokeLinecap="round" fill="none" />
      <polygon points="90,92 105,100 90,108" fill="#F97316" />
      <path d="M 140 50 L 140 150 L 210 150" stroke="#1E3A8A" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M 140 150 Q 170 150 200 70" stroke="#F97316" strokeWidth="10" strokeLinecap="round" fill="none" />
      <text x="130" y="215" textAnchor="middle" fontFamily="system-ui, -apple-system, sans-serif" fontSize="34" fontWeight="800" fill="#1E3A8A">
        FísicaLab
      </text>
    </svg>
  );
};

export default LogoFisicaLab;