// src/pages/ExperimentoParadoxoGemeos.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FISICA3_BASE_STYLES } from '../styles/fisica3Theme';
import PainelExplicativo from '../components/PainelExplicativo';

const fmt = (n, d = 2) => (typeof n === 'number' && isFinite(n) ? n.toFixed(d) : '—');
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const gammaOf = (beta) => 1 / Math.sqrt(1 - beta * beta);

const STYLES = FISICA3_BASE_STYLES + `
.pill-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 18px; }
.pill {
  font-family: var(--sans);
  font-size: 12px;
  font-weight: 600;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.2s;
}
.pill:hover { color: var(--text); }
.pill.on {
  border-color: var(--accent);
  color: var(--accent);
  background: rgba(168,85,247,0.1);
}
`;

export default function ExperimentoParadoxoGemeos() {
  const [tab, setTab] = useState('viagem');
  return (
    <>
      <style>{STYLES}</style>
      <div className="app">
        <header className="header">
          <div className="header-title">Paradoxo dos Gêmeos</div>
          <div className="header-sub">Física 3 · Relatividade Especial</div>
          <span className="header-tag">Δidade = T(1 − 1/γ)</span>
        </header>
        <nav className="tabs">
          {[['viagem', 'A Viagem'], ['diagrama', 'Diagrama Espaço-Tempo'], ['calc', 'Cálculo & Derivações']].map(([id, label]) => (
            <button key={id} className={`tab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>{label}</button>
          ))}
        </nav>
        {tab === 'viagem' && <ViagemTab />}
        {tab === 'diagrama' && <DiagramaTab />}
        {tab === 'calc' && <CalcTab />}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ABA 1 — A VIAGEM (unidades naturais: distância em anos-luz, tempo em anos, c=1)
// ═══════════════════════════════════════════════════════════════════════════
const ANIM_SPEED = 0.5; // "anos" de tempo-Terra por segundo real

function ViagemTab() {
  const [D, setD] = useState(6);
  const [beta, setBeta] = useState(0.8);
  const gamma = gammaOf(clamp(beta, 0.01, 0.995));
  const Tearth = (2 * D) / beta;
  const Ttraveler = Tearth / gamma;
  const ageDiff = Tearth - Ttraveler;

  const ntRef = useRef(0);
  const [display, setDisplay] = useState({ nt: 0, xTrav: 0, fase: 'ida' });
  const canvasRef = useRef(null);

  useEffect(() => { ntRef.current = 0; }, [D, beta]);

  useEffect(() => {
    let raf, last = null;
    const draw = (now) => {
      if (last !== null) {
        const dt = Math.min((now - last) / 1000, 0.05);
        ntRef.current += dt * ANIM_SPEED;
        if (ntRef.current > Tearth + 1.5) ntRef.current = 0;
      }
      last = now;
      const nt = clamp(ntRef.current, 0, Tearth);
      const meio = Tearth / 2;
      const xTrav = nt <= meio ? beta * nt : D - beta * (nt - meio);
      const fase = nt <= meio ? 'ida' : 'volta';
      setDisplay({ nt, xTrav, fase });

      const cv = canvasRef.current;
      if (cv) {
        const dpr = window.devicePixelRatio || 1;
        const W = cv.clientWidth, H = cv.clientHeight;
        cv.width = W * dpr; cv.height = H * dpr;
        const ctx = cv.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);

        const cy = H / 2;
        const margin = 60;
        const escala = (W - 2 * margin) / D;
        const xEarth = margin, xStar = margin + D * escala;

        // trilho
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(xEarth, cy); ctx.lineTo(xStar, cy); ctx.stroke();

        // Terra
        ctx.beginPath();
        ctx.arc(xEarth, cy, 10, 0, Math.PI * 2);
        ctx.fillStyle = '#38BDF8';
        ctx.shadowBlur = 12; ctx.shadowColor = '#38BDF8';
        ctx.fill(); ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = "11px 'JetBrains Mono', monospace";
        ctx.textAlign = 'center';
        ctx.fillText('Terra', xEarth, cy + 30);

        // estrela destino
        ctx.beginPath();
        ctx.arc(xStar, cy, 9, 0, Math.PI * 2);
        ctx.fillStyle = '#FBBF24';
        ctx.shadowBlur = 12; ctx.shadowColor = '#FBBF24';
        ctx.fill(); ctx.shadowBlur = 0;
        ctx.fillText(`Estrela (${fmt(D, 1)} a.l.)`, xStar, cy + 30);

        // viajante
        const xPx = margin + xTrav * escala;
        const pulso = 0.9 + 0.1 * Math.sin(nt * 6);
        ctx.beginPath();
        ctx.arc(xPx, cy, 8 * pulso, 0, Math.PI * 2);
        ctx.fillStyle = '#A855F7';
        ctx.shadowBlur = 14; ctx.shadowColor = '#A855F7';
        ctx.fill(); ctx.shadowBlur = 0;
        ctx.fillStyle = '#C084FC';
        ctx.fillText('Viajante', xPx, cy - 20);

        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.textAlign = 'center';
        ctx.fillText(fase === 'ida' ? '→ indo' : '← voltando', W / 2, 28);
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [D, beta, Tearth]);

  const situacaoAtual = `Com D=${fmt(D, 1)} anos-luz e β=${fmt(beta, 2)}c (γ=${fmt(gamma, 3)}), a viagem toda dura T_Terra=${fmt(Tearth, 2)} anos para o gêmeo terrestre, mas só T_viajante=${fmt(Ttraveler, 2)} anos para quem viaja — uma diferença de ${fmt(ageDiff, 2)} anos ao reencontro.`;

  const perguntasAssistente = [
    {
      id: 'D',
      pergunta: 'O que é a distância D?',
      resposta: `D é a distância até a estrela de destino, em anos-luz (medida no referencial da Terra). Agora vale ${fmt(D, 1)} anos-luz — a viagem é de ida e volta, então a distância total percorrida é 2D.`,
    },
    {
      id: 'paradoxo',
      pergunta: 'Qual é o "paradoxo" exatamente?',
      resposta: 'Como o movimento é relativo, cada gêmeo poderia achar que é o OUTRO quem está se movendo e envelhecendo mais devagar. Mas só o viajante muda de referencial inercial (na volta) — essa assimetria quebra a simetria aparente e torna o resultado (viajante mais jovem) absoluto, sem ambiguidade.',
    },
    {
      id: 'idades',
      pergunta: 'Por que as idades ficam diferentes?',
      resposta: `T_Terra = 2D/(βc) é calculado no referencial inercial da Terra. O relógio do viajante, em movimento, sofre dilatação do tempo: T_viajante = T_Terra/γ. Com os valores atuais, isso dá ${fmt(ageDiff, 2)} anos de diferença ao reencontro.`,
    },
    {
      id: 'fase',
      pergunta: 'O que muda entre "indo" e "voltando"?',
      resposta: 'Nada muda na física durante a viagem em si — o relógio do viajante sempre atrasa na mesma proporção γ. A troca de fase só marca o instante em que o viajante inverte a velocidade (a virada), que é o evento crucial para resolver o paradoxo (veja a aba "Diagrama Espaço-Tempo").',
    },
  ];

  return (
    <div className="content">
      <PainelExplicativo situacao={situacaoAtual} perguntas={perguntasAssistente} />
      <div className="sidebar-l">
        <div className="section-label">A Viagem</div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Distância D</span><span className="ctrl-num">{fmt(D, 1)} anos-luz</span></div>
          <input type="range" min="1" max="15" step="0.5" value={D} onChange={e => setD(+e.target.value)} />
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">v / c (β)</span><span className="ctrl-num">{fmt(beta, 2)}c</span></div>
          <input type="range" min="0.1" max="0.95" step="0.01" value={beta} onChange={e => setBeta(+e.target.value)} />
        </div>

        <div className="btn-row">
          <button className="btn btn-danger" onClick={() => { ntRef.current = 0; }}>↩ Reiniciar Viagem</button>
        </div>

        <div className="section-label">O "Paradoxo"</div>
        <div className="card">
          <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.6 }}>
            Do ponto de vista do viajante, é a Terra que se afasta e volta — então por que não é o
            gêmeo terrestre quem envelhece menos? A assimetria está na aceleração: só o viajante muda
            de referencial inercial na volta.
          </p>
        </div>
      </div>

      <div className="main-area">
        <div className="canvas-wrap"><canvas ref={canvasRef} /></div>
      </div>

      <div className="sidebar-r">
        <div className="section-label">Fator de Lorentz</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">γ</span><span className="stat-val accent">{fmt(gamma, 4)}</span></div>
        </div>

        <div className="section-label">Relógios (agora)</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">Idade Terra (Δ)</span><span className="stat-val cool">{fmt(display.nt, 3)} anos</span></div>
          <div className="stat-row"><span className="stat-label">Idade Viajante (Δ)</span><span className="stat-val" style={{ color: '#A855F7' }}>{fmt(display.nt / gamma, 3)} anos</span></div>
          <div className="stat-row"><span className="stat-label">Fase</span><span className="stat-val">{display.fase === 'ida' ? 'indo →' : '← voltando'}</span></div>
        </div>

        <div className="section-label">Ao Reencontro</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">T Terra (total)</span><span className="stat-val cool">{fmt(Tearth, 3)} anos</span></div>
          <div className="stat-row"><span className="stat-label">T Viajante (total)</span><span className="stat-val" style={{ color: '#A855F7' }}>{fmt(Ttraveler, 3)} anos</span></div>
          <div className="stat-row"><span className="stat-label">Diferença de idade</span><span className="stat-val warm">{fmt(ageDiff, 3)} anos</span></div>
        </div>

        <div className="alert-box">
          Quando os gêmeos se reencontram, os dois concordam: o viajante é mais jovem. Não há
          ambiguidade — a assimetria da aceleração torna esse resultado absoluto, não relativo.
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ABA 2 — DIAGRAMA ESPAÇO-TEMPO (o "salto" de simultaneidade na virada)
// ═══════════════════════════════════════════════════════════════════════════
function DiagramaTab() {
  const [D, setD] = useState(6);
  const [beta, setBeta] = useState(0.8);
  const [fracao, setFracao] = useState(0.5);

  const gamma = gammaOf(clamp(beta, 0.01, 0.995));
  const Tearth = (2 * D) / beta;
  const Ttraveler = Tearth / gamma;

  const tau = fracao * Ttraveler;
  const meioTau = Ttraveler / 2;
  let x, ct, v;
  if (tau <= meioTau) { ct = gamma * tau; x = beta * gamma * tau; v = beta; }
  else { const tau2 = tau - meioTau; ct = Tearth / 2 + gamma * tau2; x = D - beta * gamma * tau2; v = -beta; }

  // reta de simultaneidade do viajante, avaliada em x=0 (linha de mundo da Terra)
  const ctEarthAgora = ct - v * x;

  const canvasRef = useRef(null);
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const W = cv.clientWidth, H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    const margin = 55;
    const escalaX = (W - 2 * margin) / (D * 1.15);
    const escalaCt = (H - 2 * margin) / (Tearth * 1.1);
    const x0px = margin, ct0px = H - margin;
    const toXY = (p) => ({ x: x0px + p.x * escalaX, y: ct0px - p.ct * escalaCt });

    // eixos
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x0px, margin * 0.4); ctx.lineTo(x0px, ct0px); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x0px, ct0px); ctx.lineTo(W - margin * 0.4, ct0px); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = "11px 'JetBrains Mono', monospace";
    ctx.textAlign = 'left';
    ctx.fillText('x (anos-luz)', W - margin * 0.4 - 70, ct0px - 8);
    ctx.fillText('ct (anos)', x0px + 6, margin * 0.4 + 10);

    // linha de mundo da Terra
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 2.5;
    let p1 = toXY({ x: 0, ct: 0 }), p2 = toXY({ x: 0, ct: Tearth });
    ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();

    // linha de mundo do viajante (ida + volta)
    ctx.strokeStyle = '#A855F7';
    ctx.lineWidth = 2.5;
    const pO0 = toXY({ x: 0, ct: 0 }), pO1 = toXY({ x: D, ct: Tearth / 2 });
    ctx.beginPath(); ctx.moveTo(pO0.x, pO0.y); ctx.lineTo(pO1.x, pO1.y); ctx.stroke();
    const pR1 = toXY({ x: 0, ct: Tearth });
    ctx.beginPath(); ctx.moveTo(pO1.x, pO1.y); ctx.lineTo(pR1.x, pR1.y); ctx.stroke();

    // ponto de virada
    ctx.beginPath();
    ctx.arc(pO1.x, pO1.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#FBBF24';
    ctx.fill();

    // posição atual do viajante (controlada pelo slider de fração da viagem)
    const pAtual = toXY({ x, ct });
    ctx.beginPath();
    ctx.arc(pAtual.x, pAtual.y, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.shadowBlur = 10; ctx.shadowColor = '#fff';
    ctx.fill(); ctx.shadowBlur = 0;

    // reta de simultaneidade do viajante nesse instante, até a linha de mundo da Terra
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = 'rgba(192,132,252,0.8)';
    ctx.lineWidth = 1.5;
    const pSimA = toXY({ x: 0, ct: ctEarthAgora });
    ctx.beginPath(); ctx.moveTo(pAtual.x, pAtual.y); ctx.lineTo(pSimA.x, pSimA.y); ctx.stroke();
    ctx.setLineDash([]);

    // marcador na linha de mundo da Terra ("agora" segundo o viajante)
    ctx.beginPath();
    ctx.arc(pSimA.x, pSimA.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#FBBF24';
    ctx.shadowBlur = 10; ctx.shadowColor = '#FBBF24';
    ctx.fill(); ctx.shadowBlur = 0;

    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.textAlign = 'left';
    ctx.fillText('Terra', pR1.x + 8, toXY({ x: 0, ct: Tearth * 0.05 }).y);
    ctx.fillText('Viajante', pO1.x + 8, pO1.y);
  }, [D, beta, fracao, gamma, Tearth]);

  return (
    <div className="content">
      <div className="sidebar-l">
        <div className="section-label">Cenário</div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">Distância D</span><span className="ctrl-num">{fmt(D, 1)} a.l.</span></div>
          <input type="range" min="1" max="15" step="0.5" value={D} onChange={e => setD(+e.target.value)} />
        </div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">v / c (β)</span><span className="ctrl-num">{fmt(beta, 2)}c</span></div>
          <input type="range" min="0.1" max="0.95" step="0.01" value={beta} onChange={e => setBeta(+e.target.value)} />
        </div>

        <div className="section-label">Posição do Viajante</div>
        <div className="ctrl">
          <div className="ctrl-head"><span className="ctrl-name">fração da viagem (tempo próprio)</span><span className="ctrl-num">{fmt(fracao * 100, 0)}%</span></div>
          <input type="range" min="0" max="1" step="0.005" value={fracao} onChange={e => setFracao(+e.target.value)} />
        </div>

        <div className="card">
          <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.6 }}>
            Arraste o slider pela virada (50%) e observe: o ponto amarelo na linha de mundo da Terra —
            o instante que o viajante considera "agora" — <strong>salta</strong> para frente quando a
            velocidade do viajante inverte de sinal.
          </p>
        </div>
      </div>

      <div className="main-area">
        <div className="canvas-wrap"><canvas ref={canvasRef} /></div>
      </div>

      <div className="sidebar-r">
        <div className="section-label">Estado do Viajante</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">τ (tempo próprio decorrido)</span><span className="stat-val" style={{ color: '#A855F7' }}>{fmt(tau, 3)} anos</span></div>
          <div className="stat-row"><span className="stat-label">Fase</span><span className="stat-val">{v > 0 ? 'ida →' : '← volta'}</span></div>
        </div>

        <div className="section-label">"Agora" na Terra (segundo o viajante)</div>
        <div className="card">
          <div className="stat-row"><span className="stat-label">ct (Terra)</span><span className="stat-val warm">{fmt(ctEarthAgora, 3)} anos</span></div>
          <div className="stat-row"><span className="stat-label">% do total decorrido na Terra</span><span className="stat-val cool">{fmt(clamp(ctEarthAgora / Tearth, 0, 1) * 100, 1)}%</span></div>
        </div>

        <div className="alert-box">
          Repare que antes da virada esse valor cresce bem devagar (o viajante mal vê o tempo passar na
          Terra) — e na virada ele salta de repente para perto do fim. É exatamente esse salto que
          "contabiliza" toda a diferença de idade ao reencontro.
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ABA 3 — CÁLCULO & DERIVAÇÕES
// ═══════════════════════════════════════════════════════════════════════════
function CalcTab() {
  const D = 6, beta = 0.8;
  const gamma = gammaOf(beta);
  const Tearth = (2 * D) / beta;
  const Ttraveler = Tearth / gamma;

  return (
    <div className="main-area" style={{ overflow: 'auto' }}>
      <div className="calc-page">

        <div className="calc-section">
          <div className="calc-h2">1. O "Paradoxo"</div>
          <p className="calc-p">
            Dois gêmeos se separam: um fica na Terra, o outro viaja a uma estrela a distância D com
            velocidade v e retorna. Pela dilatação do tempo, o gêmeo terrestre conclui que o viajante
            envelheceu menos. Mas o movimento é relativo — do ponto de vista do viajante, é a Terra que
            se afasta e retorna. Por simetria, não deveria o viajante concluir que é o gêmeo terrestre
            quem envelheceu menos?
          </p>
        </div>

        <div className="calc-section">
          <div className="calc-h2">2. A Resolução: a Assimetria da Aceleração</div>
          <p className="calc-p">
            A situação não é simétrica. O gêmeo da Terra permanece em um único referencial inercial do
            início ao fim. O viajante, para retornar, precisa desacelerar, inverter o sentido e
            acelerar novamente — ele muda de referencial inercial na virada. Essa assimetria física
            (só um dos dois sente a aceleração) quebra a simetria aparente e torna o resultado absoluto:
            todos os observadores concordam que o viajante envelhece menos.
          </p>
        </div>

        <div className="calc-section">
          <div className="calc-h2">3. Cálculo Quantitativo</div>
          <p className="calc-p">
            No referencial da Terra (inercial o tempo todo), o cálculo é direto — o viajante percorre a
            distância D de ida e D de volta à velocidade v=βc:
          </p>
          <div className="big-eq">
            <div className="derivation-step"><span className="step-num">①</span><span className="step-eq">T_Terra = 2D/(βc)</span><span className="step-desc">tempo total decorrido na Terra</span></div>
            <div className="derivation-step"><span className="step-num">②</span><span className="step-eq">T_viajante = T_Terra/γ</span><span className="step-desc">dilatação do tempo aplicada ao relógio em movimento</span></div>
            <div className="derivation-step"><span className="step-num">③</span><span className="step-eq"><span className="hi-acc">Δidade = T_Terra(1 − 1/γ)</span></span><span className="step-desc">diferença de idade ao reencontro</span></div>
          </div>
          <p className="calc-p">
            Exemplo: D={D} anos-luz, β={beta}c (γ≈{fmt(gamma, 3)}) → T_Terra≈{fmt(Tearth, 2)} anos,
            T_viajante≈{fmt(Ttraveler, 2)} anos, diferença≈{fmt(Tearth - Ttraveler, 2)} anos.
          </p>
        </div>

        <div className="calc-section">
          <div className="calc-h2">4. A Resolução via Simultaneidade (o "salto")</div>
          <p className="calc-p">
            O diagrama espaço-tempo mostra isso geometricamente: a reta de simultaneidade do viajante
            (o que ele considera "agora" na Terra) tem inclinação +β durante a ida e −β durante a
            volta. Como essas inclinações têm sinais opostos, no instante exato da virada essa reta
            "gira" de repente — e o ponto onde ela cruza a linha de mundo da Terra salta para frente no
            tempo. Esse salto, somado ao acúmulo lento de "tempo terrestre simultâneo" durante as pernas
            de ida e volta, fecha exatamente a conta de T_Terra.
          </p>
          <div className="alert-box">
            Não há nada de misterioso fisicamente acontecendo na Terra durante a virada — o salto é só
            uma mudança na <em>definição</em> de simultaneidade do viajante ao trocar de referencial
            inercial, não um evento físico que os terráqueos percebem.
          </div>
        </div>

        <div className="calc-section">
          <div className="calc-h2">5. Uma Visão Alternativa: Efeito Doppler Relativístico</div>
          <p className="calc-p">
            Outra forma de entender a assimetria: se cada gêmeo envia um sinal de luz por ano (medido
            no seu próprio relógio), o gêmeo terrestre recebe os sinais do viajante fortemente
            desviados para o vermelho durante a ida (poucos sinais chegam) e para o azul durante a
            volta (muitos sinais chegam rapidamente) — mas o viajante passa mais tempo próprio
            "recebendo poucos sinais" (ida, a fase mais longa em tempo próprio) do que "recebendo
            muitos" (volta), reproduzindo exatamente a mesma diferença de idade sem precisar analisar
            aceleração ou simultaneidade diretamente.
          </p>
        </div>

      </div>
    </div>
  );
}
