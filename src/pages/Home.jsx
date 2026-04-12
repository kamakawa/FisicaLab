// src/pages/Home.jsx
import React, { useState } from 'react';

const disciplinas = [
  {
    id: 'fisica1',
    titulo: 'Física 1',
    subtitulo: 'Mecânica Clássica',
    descricao: 'Cinemática, dinâmica, energia e momento.',
    cor: '#06B6D4',
    icone: '⚡',
    experimentos: [
      {
        id: 'lancamento',
        titulo: 'Lançamento de Projéteis',
        descricao: 'Simule trajetórias parabólicas com vetores de velocidade em tempo real.',
        tags: ['Cinemática', 'Vetores', '2D'],
      },
    ],
  },
  {
    id: 'fisica2',
    titulo: 'Física 2',
    subtitulo: 'Eletromagnetismo',
    descricao: 'Eletrostática, corrente elétrica, magnetismo e ondas EM.',
    cor: '#A78BFA',
    icone: '🔋',
    experimentos: [],
    emBreve: true,
  },
  {
    id: 'fisica3',
    titulo: 'Física 3',
    subtitulo: 'Óptica e Física Moderna',
    descricao: 'Óptica geométrica, ondulatória, relatividade e quântica.',
    cor: '#F97316',
    icone: '🌊',
    experimentos: [],
    emBreve: true,
  },
];

export default function Home({ onNavegar }) {
  const [disciplinaAberta, setDisciplinaAberta] = useState(null);

  const toggleDisciplina = (id) => {
    setDisciplinaAberta(disciplinaAberta === id ? null : id);
  };

  return (
    <div style={{ padding: '40px 0' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h2 style={{
          fontSize: '2.8rem',
          fontWeight: '700',
          margin: '0 0 16px',
          background: 'linear-gradient(90deg, #06B6D4, #A78BFA)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          Bem-vindo ao Laboratório
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', margin: 0 }}>
          Explore experimentos interativos de física com simulações em tempo real.
        </p>
      </div>

      {/* Disciplinas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '860px', margin: '0 auto' }}>
        {disciplinas.map((disc) => {
          const aberta = disciplinaAberta === disc.id;
          return (
            <div key={disc.id} style={{ borderRadius: '16px', overflow: 'hidden' }}>
              {/* Card da disciplina */}
              <div
                onClick={() => !disc.emBreve && toggleDisciplina(disc.id)}
                style={{
                  background: 'rgba(17, 25, 40, 0.85)',
                  border: `1px solid ${aberta ? disc.cor : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: aberta ? '16px 16px 0 0' : '16px',
                  padding: '24px 28px',
                  cursor: disc.emBreve ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  transition: 'border-color 0.2s, background 0.2s',
                  userSelect: 'none',
                }}
                onMouseEnter={(e) => {
                  if (!disc.emBreve) e.currentTarget.style.background = 'rgba(17, 25, 40, 1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(17, 25, 40, 0.85)';
                }}
              >
                {/* Ícone colorido */}
                <div style={{
                  width: '56px', height: '56px', borderRadius: '14px',
                  background: `${disc.cor}18`,
                  border: `1px solid ${disc.cor}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.6rem', flexShrink: 0,
                }}>
                  {disc.icone}
                </div>

                {/* Texto */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: '700', color: disc.cor }}>
                      {disc.titulo}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                      — {disc.subtitulo}
                    </span>
                    {disc.emBreve && (
                      <span style={{
                        fontSize: '0.7rem', fontWeight: '600', padding: '2px 8px',
                        borderRadius: '99px', background: 'rgba(255,255,255,0.06)',
                        color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.1)',
                      }}>
                        EM BREVE
                      </span>
                    )}
                  </div>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {disc.descricao}
                  </p>
                </div>

                {/* Seta */}
                {!disc.emBreve && (
                  <span style={{
                    color: disc.cor, fontSize: '1.2rem', flexShrink: 0,
                    transform: aberta ? 'rotate(90deg)' : 'rotate(0)',
                    transition: 'transform 0.25s',
                  }}>
                    ›
                  </span>
                )}
              </div>

              {/* Painel de experimentos */}
              {aberta && (
                <div style={{
                  background: 'rgba(11, 15, 25, 0.9)',
                  border: `1px solid ${disc.cor}`,
                  borderTop: 'none',
                  borderRadius: '0 0 16px 16px',
                  padding: '20px 24px',
                }}>
                  <p style={{ margin: '0 0 16px', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Experimentos disponíveis
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
                    {disc.experimentos.map((exp) => (
                      <div
                        key={exp.id}
                        onClick={() => onNavegar(exp.id)}
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '12px',
                          padding: '16px 18px',
                          cursor: 'pointer',
                          transition: 'background 0.15s, border-color 0.15s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = `${disc.cor}15`;
                          e.currentTarget.style.borderColor = `${disc.cor}50`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                        }}
                      >
                        <p style={{ margin: '0 0 6px', fontWeight: '600', color: 'var(--text-main)', fontSize: '0.95rem' }}>
                          {exp.titulo}
                        </p>
                        <p style={{ margin: '0 0 12px', color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: '1.4' }}>
                          {exp.descricao}
                        </p>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {exp.tags.map((tag) => (
                            <span key={tag} style={{
                              fontSize: '0.7rem', padding: '2px 8px',
                              borderRadius: '99px',
                              background: `${disc.cor}20`,
                              color: disc.cor,
                              border: `1px solid ${disc.cor}40`,
                            }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
