// src/pages/Home.jsx
import React, { useState, useEffect, useRef } from 'react';

const DATA = {
  f1: {
    label: 'FÍSICA 1',
    sub: 'MECÂNICA · CINEMÁTICA · DINÂMICA',
    cor: '#00D4FF',
    corRgb: '100,100,100',
    chapters: [
      {
        title: 'CINEMÁTICA',
        topics: [
          { id: 'lancamento', title: 'Lançamento de Projéteis', desc: 'Decomposição vetorial 2D, trajetória parabólica e vetores de velocidade em tempo real.', tags: ['2D', 'Vetores', 'Disponível'], disponivel: true },
          { id: 'mru', title: 'Movimento Retilíneo Uniforme', desc: 'Posição, velocidade constante e gráficos de movimento sem aceleração.', tags: ['MRU', 'Gráficos'], disponivel: false },
          { id: 'mruv', title: 'Movimento Uniformemente Variado', desc: 'Equações horárias, aceleração constante e queda livre.', tags: ['MRUV', 'Aceleração'], disponivel: false },
          { id: 'circular', title: 'Movimento Circular', desc: 'Velocidade angular, aceleração centrípeta e período de rotação.', tags: ['ω', 'Centrípeta'], disponivel: false },
        ],
      },
      {
        title: 'DINÂMICA',
        topics: [
          { id: 'newton', title: 'Leis de Newton', desc: 'Inércia, força resultante e ação-reação com sistemas de corpos.', tags: ['Newton', 'Força'], disponivel: false },
          { id: 'atrito', title: 'Forças de Atrito', desc: 'Atrito estático e cinético, coeficientes e dinâmica de corpos.', tags: ['Atrito', 'μ'], disponivel: false },
          { id: 'energia', title: 'Trabalho e Energia', desc: 'Teorema trabalho-energia, conservação e potência.', tags: ['Energia', 'Joule'], disponivel: false },
          { id: 'momentum', title: 'Quantidade de Movimento', desc: 'Impulso, momentum e colisões elásticas e inelásticas.', tags: ['Momentum', 'Colisão'], disponivel: false },
        ],
      },
    ],
  },
  f2: {
    label: 'FÍSICA 2',
    sub: 'TERMODINÂMICA · FLUIDOS · ONDAS',
    cor: '#FF6B9D',
    corRgb: '255,107,157',
    chapters: [
      {
        title: 'TERMODINÂMICA',
        topics: [
          { id: 'gases', title: 'Gases Ideais', desc: 'Lei dos gases, transformações isotérmica, isobárica e adiabática.', tags: ['PVT', 'Gás'], disponivel: false },
          { id: 'leis-termo', title: '1ª e 2ª Lei da Termodinâmica', desc: 'Energia interna, entropia, ciclo de Carnot e rendimento máximo.', tags: ['Carnot', 'Entropia'], disponivel: false },
        ],
      },
      {
        title: 'ONDAS',
        topics: [
          { id: 'mhs', title: 'Oscilações Harmônicas', desc: 'MHS — posição, velocidade, energia e amortecimento.', tags: ['MHS', 'Amplitude'], disponivel: false },
          { id: 'som', title: 'Ondas Sonoras e Doppler', desc: 'Velocidade do som, intensidade, decibéis e efeito Doppler.', tags: ['Som', 'Doppler'], disponivel: false },
        ],
      },
    ],
  },
  f3: {
    label: 'FÍSICA 3',
    sub: 'ELETROMAGNETISMO · RELATIVIDADE · QUÂNTICA',
    cor: '#00F5C4',
    corRgb: '167,139,250',
    chapters: [
      {
        title: 'ELETROSTÁTICA',
        topics: [
          { id: 'coulomb', title: 'Lei de Coulomb e Campo Elétrico', desc: 'Força eletrostática, campo de cargas pontuais e lei de Gauss.', tags: ['Coulomb', 'Campo'], disponivel: false },
          { id: 'maxwell', title: 'Equações de Maxwell', desc: 'Síntese do eletromagnetismo em 4 equações fundamentais.', tags: ['Maxwell', 'EM'], disponivel: false },
        ],
      },
      {
        title: 'FÍSICA MODERNA',
        topics: [
          { id: 'relatividade', title: 'Relatividade Especial', desc: 'Postulados de Einstein, dilatação temporal e E=mc².', tags: ['Einstein', 'γ'], disponivel: false },
          { id: 'quantica', title: 'Mecânica Quântica', desc: 'Dualidade onda-partícula, Heisenberg e Schrödinger.', tags: ['Planck', 'ℏ'], disponivel: false },
        ],
      },
    ],
  },
};

const TABS = [
  { key: 'f1', label: 'FÍSICA 1' },
  { key: 'f2', label: 'FÍSICA 2' },
  { key: 'f3', label: 'FÍSICA 3' },
];

export default function Home({ onNavegar }) {
  const [tabAtiva, setTabAtiva] = useState('f1');
  const [inkStyle, setInkStyle] = useState({});
  const [heroVisible, setHeroVisible] = useState(true);
  const [panelKey, setPanelKey] = useState(0);
  const tabRefs = useRef({});
  const tabsBarRef = useRef(null);
  const canvasRef = useRef(null);

  // ── Canvas background ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, particles = [], animId;

    const resize = () => {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
      initParticles();
    };

    const cor = DATA[tabAtiva].corRgb;

    const initParticles = () => {
      particles = [];
      const count = Math.floor((W * H) / 14000);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
          r: Math.random() * 1.4 + 0.3,
          op: Math.random() * 0.45 + 0.08,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      // grid
      ctx.strokeStyle = `rgba(${cor},0.04)`;
      ctx.lineWidth = 0.5;
      for (let x = 0; x < W; x += 55) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 55) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      // particles
      particles.forEach(p => {
        p.x = (p.x + p.vx + W) % W;
        p.y = (p.y + p.vy + H) % H;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${cor},${p.op})`;
        ctx.fill();
      });
      // connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const d = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
          if (d < 90) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${cor},${0.07 * (1 - d / 90)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, [tabAtiva]);

  // ── Ink indicator ──
  const moveInk = (key) => {
    const btn = tabRefs.current[key];
    const bar = tabsBarRef.current;
    if (!btn || !bar) return;
    const br = btn.getBoundingClientRect();
    const tr = bar.getBoundingClientRect();
    setInkStyle({ left: br.left - tr.left, width: br.width });
  };

  useEffect(() => {
    setTimeout(() => moveInk(tabAtiva), 50);
  }, []);

  const mudarTab = (key) => {
    if (key === tabAtiva) return;
    setHeroVisible(false);
    setTimeout(() => {
      setTabAtiva(key);
      setHeroVisible(true);
      setPanelKey(k => k + 1);
      setTimeout(() => moveInk(key), 20);
    }, 180);
  };

  const d = DATA[tabAtiva];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&family=DM+Sans:wght@300;400;500&display=swap');

        .fl-home { position: relative; min-height: 80vh; font-family: 'DM Sans', sans-serif; padding-bottom: 80px; }

        .fl-canvas {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          width: 100%; height: 100%;
        }

        /* scanlines */
        .fl-home::before {
          content: '';
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px);
        }

        .fl-inner { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; }

        /* ── STATUS BAR ── */
        .fl-status {
          width: 100%; display: flex; justify-content: flex-end;
          padding: 0 0 20px;
          font-family: 'Share Tech Mono', monospace;
          font-size: 10px; color: var(--neon-dim);
          gap: 20px;
        }
        .fl-status-dot {
          display: inline-block; width: 5px; height: 5px;
          border-radius: 50%; background: var(--neon);
          margin-right: 5px; vertical-align: middle;
          animation: fl-blink 2s ease-in-out infinite;
        }
        @keyframes fl-blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

        /* ── TABS ── */
        .fl-tab-label {
          font-family: 'Share Tech Mono', monospace;
          font-size: 10px; letter-spacing: 3px;
          color: var(--neon); opacity: 0.5;
          margin-bottom: 12px;
        }
        .fl-tabs-bar {
          position: relative;
          display: flex; gap: 0;
          background: rgba(13,14,20,0.9);
          border: 1px solid var(--border);
          border-radius: 7px; overflow: hidden;
        }
        .fl-tab-ink {
          position: absolute; top: 0; bottom: 0;
          background: rgba(var(--neon-rgb), 0.07);
          border-left: 2px solid var(--neon);
          border-right: 2px solid var(--neon);
          transition: left 0.35s cubic-bezier(.4,0,.2,1), width 0.35s cubic-bezier(.4,0,.2,1);
          pointer-events: none;
        }
        .fl-tab-btn {
          font-family: 'Orbitron', monospace;
          font-size: 12px; font-weight: 700;
          letter-spacing: 2.5px;
          padding: 15px 42px;
          background: transparent; border: none;
          cursor: pointer; color: rgba(255,255,255,0.25);
          transition: color 0.25s, text-shadow 0.25s;
          position: relative; z-index: 1;
          white-space: nowrap;
        }
        .fl-tab-btn:hover { color: rgba(255,255,255,0.5); }
        .fl-tab-btn.active {
          color: var(--neon);
          text-shadow: 0 0 18px rgba(var(--neon-rgb), 0.8);
        }

        /* ── HERO ── */
        .fl-hero {
          margin-top: 12px; text-align: center;
          transition: opacity 0.18s ease, transform 0.18s ease;
        }
        .fl-hero.hidden { opacity: 0; transform: translateY(8px); }
        .fl-hero-title {
          font-family: 'Orbitron', monospace;
          font-size: clamp(52px, 8vw, 80px);
          font-weight: 900;
          color: transparent;
          background: linear-gradient(135deg, var(--neon) 0%, color-mix(in srgb, var(--neon) 50%, #fff) 50%, rgba(var(--neon-rgb),0.4) 100%);
          -webkit-background-clip: text; background-clip: text;
          letter-spacing: 6px; line-height: 1;
          filter: drop-shadow(0 0 28px rgba(var(--neon-rgb), 0.35));
        }
        .fl-hero-sub {
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px; letter-spacing: 4px;
          color: var(--neon); opacity: 0.55;
          margin-top: 10px;
        }

        /* ── CONTENT ── */
        .fl-content {
          width: 100%; max-width: 1100px;
          padding: 52px 0 0;
          animation: fl-in 0.45s ease forwards;
        }
        @keyframes fl-in {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .fl-chapter-div {
          display: flex; align-items: center; gap: 14px;
          margin: 36px 0 22px;
        }
        .fl-chapter-div::before, .fl-chapter-div::after {
          content: ''; flex: 1; height: 1px;
        }
        .fl-chapter-div::before { background: linear-gradient(90deg, transparent, var(--border)); }
        .fl-chapter-div::after  { background: linear-gradient(90deg, var(--border), transparent); }
        .fl-chapter-div span {
          font-family: 'Share Tech Mono', monospace;
          font-size: 10px; letter-spacing: 3px;
          color: var(--neon); opacity: 0.6; white-space: nowrap;
        }

        .fl-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 14px;
        }

        .fl-card {
          background: rgba(13,14,20,0.8);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 20px 22px;
          cursor: pointer;
          position: relative; overflow: hidden;
          transition: border-color 0.25s, transform 0.2s, box-shadow 0.25s;
          display: flex; flex-direction: column; gap: 8px;
        }
        .fl-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, var(--neon), transparent);
          opacity: 0; transition: opacity 0.3s;
        }
        .fl-card::after {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at 50% 0%, rgba(var(--neon-rgb),0.07) 0%, transparent 70%);
          opacity: 0; transition: opacity 0.3s;
        }
        .fl-card:hover {
          border-color: rgba(var(--neon-rgb), 0.5);
          transform: translateY(-3px);
          box-shadow: 0 8px 30px rgba(var(--neon-rgb), 0.1);
        }
        .fl-card:hover::before, .fl-card:hover::after { opacity: 1; }
        .fl-card.locked { cursor: default; opacity: 0.45; }
        .fl-card.locked:hover { transform: none; box-shadow: none; border-color: var(--border); }
        .fl-card.locked:hover::before, .fl-card.locked:hover::after { opacity: 0; }

        .fl-card-idx {
          font-family: 'Share Tech Mono', monospace;
          font-size: 9px; letter-spacing: 2px;
          color: var(--neon); opacity: 0.5;
        }
        .fl-card-title {
          font-family: 'Orbitron', monospace;
          font-size: 12px; font-weight: 700;
          color: var(--neon); line-height: 1.4;
        }
        .fl-card-desc {
          font-size: 11.5px; color: rgba(255,255,255,0.35);
          line-height: 1.6;
        }
        .fl-card-tags { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 4px; }
        .fl-tag {
          font-family: 'Share Tech Mono', monospace;
          font-size: 9px; letter-spacing: 0.5px;
          padding: 2px 7px; border-radius: 3px;
          background: rgba(var(--neon-rgb), 0.1);
          color: var(--neon);
          border: 1px solid rgba(var(--neon-rgb), 0.22);
        }
        .fl-tag.avail {
          background: rgba(var(--neon-rgb), 0.18);
          border-color: rgba(var(--neon-rgb), 0.5);
          color: var(--neon);
          font-weight: bold;
        }
        .fl-card-arrow {
          position: absolute; right: 18px; bottom: 18px;
          font-size: 13px; color: var(--neon);
          opacity: 0; transform: translateX(-6px);
          transition: opacity 0.25s, transform 0.25s;
          z-index: 2;
        }
        .fl-card:not(.locked):hover .fl-card-arrow { opacity: 1; transform: translateX(0); }
      `}</style>

      {/* Canvas fixo */}
      <canvas
        ref={canvasRef}
        className="fl-canvas"
        style={{
          '--neon': d.cor,
          '--neon-rgb': d.corRgb,
          '--border': `rgba(${d.corRgb},0.14)`,
        }}
      />

      <div
        className="fl-home"
        style={{
          '--neon': d.cor,
          '--neon-dim': `rgba(${d.corRgb},0.45)`,
          '--neon-rgb': d.corRgb,
          '--border': `rgba(${d.corRgb},0.14)`,
        }}
      >
        <div className="fl-inner">
          {/* Status bar */}
          <div className="fl-status">
            <span><span className="fl-status-dot" />ENGINE ONLINE</span>
            <span>FISICALAB v3</span>
            <span>REACT · VITE</span>
          </div>

          {/* Tab label */}
          <div className="fl-tab-label">// selecione o módulo</div>

          {/* Tabs */}
          <div className="fl-tabs-bar" ref={tabsBarRef}>
            <div className="fl-tab-ink" style={inkStyle} />
            {TABS.map(t => (
              <button
                key={t.key}
                ref={el => (tabRefs.current[t.key] = el)}
                className={`fl-tab-btn${tabAtiva === t.key ? ' active' : ''}`}
                onClick={() => mudarTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Hero */}
          <div className={`fl-hero${heroVisible ? '' : ' hidden'}`}>
            <div className="fl-hero-title">{d.label}</div>
            <div className="fl-hero-sub">{d.sub}</div>
          </div>

          {/* Content */}
          <div className="fl-content" key={panelKey}>
            {d.chapters.map((ch, ci) => (
              <div key={ci}>
                <div className="fl-chapter-div"><span>{ch.title}</span></div>
                <div className="fl-grid">
                  {ch.topics.map((t, ti) => (
                    <div
                      key={t.id}
                      className={`fl-card${t.disponivel ? '' : ' locked'}`}
                      onClick={() => t.disponivel && onNavegar(t.id)}
                    >
                      <div className="fl-card-idx">{tabAtiva.toUpperCase()}-{String(ci * 10 + ti + 1).padStart(2, '0')}</div>
                      <div className="fl-card-title">{t.title}</div>
                      <div className="fl-card-desc">{t.desc}</div>
                      <div className="fl-card-tags">
                        {t.tags.map(tag => (
                          <span key={tag} className={`fl-tag${tag === 'Disponível' ? ' avail' : ''}`}>{tag}</span>
                        ))}
                      </div>
                      {t.disponivel && <span className="fl-card-arrow">→</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
