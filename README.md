<div align="center">

```
███████╗██╗███████╗██╗ ██████╗ █████╗ ██╗      █████╗ ██████╗
██╔════╝██║██╔════╝██║██╔════╝██╔══██╗██║     ██╔══██╗██╔══██╗
█████╗  ██║███████╗██║██║     ███████║██║     ███████║██████╔╝
██╔══╝  ██║╚════██║██║██║     ██╔══██║██║     ██╔══██║██╔══██╗
██║     ██║███████║██║╚██████╗██║  ██║███████╗██║  ██║██████╔╝
╚═╝     ╚═╝╚══════╝╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝
```

**Plataforma interativa de simulação de fenômenos físicos**  
*Física com rigor matemático. Visualização em tempo real. Interface moderna.*

---

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Three.js](https://img.shields.io/badge/Three.js-r183-black?style=flat-square&logo=threedotjs&logoColor=white)](https://threejs.org)
[![mathjs](https://img.shields.io/badge/math.js-15.2-00A8E8?style=flat-square)](https://mathjs.org)
[![License](https://img.shields.io/badge/Licença-MIT-green?style=flat-square)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Em%20desenvolvimento-orange?style=flat-square)]()

</div>

---

## 📐 O que é o FísicaLab?

> *Simulações físicas não deveriam exigir MATLAB.*

O **FísicaLab** é uma plataforma web de simulação física desenvolvida para estudantes de Engenharia. Cada experimento combina visualização interativa em tempo real com derivações matemáticas completas — da equação à animação — diretamente no navegador.

O projeto nasceu de uma necessidade real: ferramentas profissionais como MATLAB são poderosas, mas têm curva de aprendizado íngreme e acesso limitado. Simuladores web comuns sacrificam precisão por simplicidade. O FísicaLab propõe um caminho alternativo: **rigor matemático com acessibilidade**.

---

## ✦ Experimentos Disponíveis

### 🔵 Física 1 — Mecânica

| Experimento | Conteúdo | Recursos |
|---|---|---|
| **Lançamento de Projéteis** | Decomposição vetorial 2D, trajetória parabólica | Canvas animado, vetores de velocidade, rastro |
| **MRU** | Movimento Retilíneo Uniforme | Visualização 2D/3D, gráficos x(t) e v(t) |
| **MRUV** | Movimento Uniformemente Variado | Equações horárias, queda livre, análise de aceleração |
| **Movimento Circular** | Velocidade angular, aceleração centrípeta | Animação com ω e período variáveis |
| **Leis de Newton** | Sistemas acoplados, tração, atrito | Diagrama de forças vetoriais em tempo real |
| **Plano Inclinado** | Decomposição gravitatória, ângulo crítico | Força normal variável, coeficiente de atrito |
| **Colisões** | Pêndulo balístico, colisões 1D elásticas/inelásticas | Conservação de momento e energia |
| **Energia Mecânica** | Pêndulo simples, montanha russa (loop) | Ep ↔ Ec, força normal ao longo do loop |

### 🔴 Física 2 — Termodinâmica, Fluidos e Ondas

| Experimento | Conteúdo | Recursos |
|---|---|---|
| **Gases Ideais** | Equação de Clapeyron, transformações isotérmica/isobárica/isocórica | Diagrama p-V animado |
| **1ª e 2ª Lei da Termodinâmica** | Trabalho, calor, entropia, ciclo de Carnot | Diagrama p-V do ciclo, rendimento |
| **Hidrostática e Empuxo** | Pressão hidrostática, princípio de Pascal, Arquimedes | Prensa hidráulica, corpo flutuante/submerso |
| **Dinâmica dos Fluidos** | Equação da continuidade, Bernoulli, Torricelli | Tanque furado com jato d'água, tubo Venturi |
| **Oscilações Harmônicas (MHS)** | Mola, pêndulo, amortecimento (sub/crítico/super) | Gráfico x(t) em tempo real, espaço de fase |
| **Ondas Sonoras e Doppler** | Frequência percebida, fonte/observador em movimento | Frentes de onda animadas, efeito Doppler visual |
| **Ondas Estacionárias em Cordas** | Harmônicos, nós e ventres, ressonância | Corda vibrante, múltiplos harmônicos |
| **Ondas Sonoras em Tubos** | Tubos abertos e fechados, harmônicos permitidos | Coluna de ar animada |
| **Calorimetria e Transferência de Calor** | Calor específico, calor latente, curva de aquecimento | Condução/convecção/radiação, mudança de fase |
| **Dilatação Térmica** | Dilatação linear/superficial/volumétrica, lâmina bimetálica | Barra e lâmina bimetálica se deformando |

### 🟣 Física 3 — Eletromagnetismo e Física Moderna

#### Eletrostática

| Experimento | Conteúdo | Recursos |
|---|---|---|
| **Lei de Coulomb** | Força elétrica entre cargas, atração/repulsão | Simulação de soltar cargas, gráfico F(r) |
| **Campo Elétrico em 3D** | Superposição vetorial, configuração de dipolo | Cena 3D interativa (Three.js), vetores de campo |
| **Linhas de Campo e Potencial** | Linhas de campo, equipotenciais, carga de teste | Mapa de potencial, carga deslizando pelo campo |
| **Lei de Gauss** | Fluxo elétrico, simetrias (esférica/cilíndrica/planar) | Superfície gaussiana interativa, fluxo numérico ao vivo |

#### Relatividade Especial

| Experimento | Conteúdo | Recursos |
|---|---|---|
| **Dilatação do Tempo e Contração do Espaço** | Postulados de Einstein, fator de Lorentz | Relógio de luz animado (dois referenciais), régua contraída |
| **Diagrama de Minkowski e Simultaneidade** | Linhas de mundo, cone de luz, transformação de Lorentz | Diagrama espaço-tempo interativo, trem de Einstein |
| **Paradoxo dos Gêmeos** | Assimetria da aceleração, viagem interestelar | Diagrama espaço-tempo com salto de simultaneidade na virada |
| **Energia e Momento Relativísticos** | E=γmc², p=γmv, relação energia-momento | Gráfico E/K vs β, hipérbole E-p universal |

#### Mecânica Quântica

| Experimento | Conteúdo | Recursos |
|---|---|---|
| **Efeito Fotoelétrico** | E=hf, função trabalho, frequência de corte | Simulação de ejeção de elétrons, gráfico K_max vs f |
| **Dualidade Onda-Partícula** | Comprimento de onda de de Broglie, fenda dupla | Régua log de escalas, acumulação de partículas em franjas |
| **Princípio da Incerteza de Heisenberg** | Δx·Δp≥ℏ/2, pacote de onda | Espaço de posição vs momento, difração em fenda única |
| **Poço de Potencial e Tunelamento Quântico** | Equação de Schrödinger, níveis quantizados, tunelamento | Diagrama de níveis de energia, barreira de potencial animada |

> Física 1, 2 e 3 somam **30 experimentos completos** — Mecânica, Termodinâmica/Fluidos/Ondas e Eletromagnetismo/Física Moderna.

Cada experimento possui, em geral, três abas:
- **Simulação** — animação interativa com parâmetros ajustáveis em tempo real
- **Gráficos / Aplicações** — visualizações complementares (gráficos, casos clássicos, comparações)
- **Cálculo & Derivações** — derivações passo a passo com valores numéricos atualizados

---

## 💬 Assistente do Experimento

Todo experimento tem um painel flutuante de ajuda contextual (botão "?" no canto da tela) que:
- Mostra, em tempo real, uma explicação de **o que está acontecendo agora** com base nos parâmetros atuais ajustados nos sliders;
- Responde perguntas rápidas pré-definidas sobre os parâmetros e resultados daquele experimento específico, em formato de chat.

Não usa IA nem chamadas externas — todo o texto é gerado por template a partir dos mesmos valores que o experimento já calcula (`src/components/PainelExplicativo.jsx`). Isso mantém o app **100% client-side, sem custo por uso e sem risco de a explicação errar a física**.

---

## 🛠 Stack Tecnológica

```
Frontend
├── React 18.3          — UI reativa com hooks
├── Vite 5.4            — build ultrarrápido (HMR nativo)
├── Canvas API (2D)     — renderização das simulações
├── Three.js r183       — visualizações 3D (MRU 3D)
├── @react-three/fiber  — bridge React ↔ Three.js
├── @react-three/drei   — helpers Three.js (câmera, iluminação)
├── Recharts 3.8        — gráficos (v(t), x(t), energia)
└── math.js 15.2        — computação simbólica e numérica
```

Sem backend. Sem banco de dados. Toda a física roda no cliente.

---

## 🚀 Como Rodar

### Pré-requisitos

- **Node.js** ≥ 18
- **npm** ≥ 9 (ou yarn / pnpm)

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/kamakawa/FisicaLab.git
cd FisicaLab

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev
```

Abra [http://localhost:5173](http://localhost:5173) no navegador.

### Outros scripts

```bash
npm run build     # build de produção → dist/
npm run preview   # preview do build de produção
```

---

## 📁 Estrutura do Projeto

```
FísicaLab/
├── index.html
├── package.json
├── vite.config.js
├── public/
│   └── favicon.svg        # ícone da aba do navegador
└── src/
    ├── main.jsx               # entry point
    ├── App.jsx                # roteamento entre experimentos
    ├── App.css                # estilos globais + design tokens (Física 1)
    │
    ├── styles/                # temas compartilhados por subárea
    │   ├── fisica2Theme.js    # paleta vermelha + constantes de gases (R, γ, Cv, Cp)
    │   └── fisica3Theme.js    # paleta roxa + constantes de eletrostática/relatividade/quântica (k, ε₀, c, h, ℏ)
    │
    ├── pages/                 # cada experimento = uma página
    │   ├── Home.jsx
    │   │
    │   │   # Física 1 — Mecânica
    │   ├── ExperimentoLancamento.jsx
    │   ├── ExperimentoMRU.jsx
    │   ├── ExperimentoMUV.jsx
    │   ├── ExperimentoCircular.jsx
    │   ├── ExperimentoLeisNewton.jsx
    │   ├── Experimentoplanoinclinado.jsx
    │   ├── ExperimentoColisoes.jsx
    │   ├── ExperimentoEnergiaMecanica.jsx
    │   │
    │   │   # Física 2 — Termodinâmica, Fluidos e Ondas
    │   ├── ExperimentoGasesIdeais.jsx
    │   ├── ExperimentoLeisTermo.jsx
    │   ├── ExperimentoHidrostatica.jsx
    │   ├── ExperimentoDinamicaFluidos.jsx
    │   ├── ExperimentoMHS.jsx
    │   ├── ExperimentoOndasSonoras.jsx
    │   ├── ExperimentoOndasEstacionarias.jsx
    │   ├── ExperimentoTubosSonoros.jsx
    │   ├── ExperimentoCalorimetria.jsx
    │   ├── ExperimentoDilatacaoTermica.jsx
    │   │
    │   │   # Física 3 — Eletrostática
    │   ├── ExperimentoLeiCoulomb.jsx
    │   ├── ExperimentoCampoEletrico3D.jsx
    │   ├── ExperimentoLinhasCampo.jsx
    │   ├── ExperimentoLeiGauss.jsx
    │   │
    │   │   # Física 3 — Relatividade Especial
    │   ├── ExperimentoDilatacaoTempoEspaco.jsx
    │   ├── ExperimentoDiagramaMinkowski.jsx
    │   ├── ExperimentoParadoxoGemeos.jsx
    │   ├── ExperimentoEnergiaMomentoRelativistico.jsx
    │   │
    │   │   # Física 3 — Mecânica Quântica
    │   ├── ExperimentoFotoeletrico.jsx
    │   ├── ExperimentoDualidadeOnda.jsx
    │   ├── ExperimentoIncertezaHeisenberg.jsx
    │   └── ExperimentoPocoPotencial.jsx
    │
    └── components/            # componentes reutilizáveis
        ├── PainelExplicativo.jsx    # assistente flutuante de ajuda contextual (compartilhado por todos os experimentos)
        ├── LogoFisicaLab.jsx
        ├── CanvasAnimacao.jsx       # canvas do lançamento
        ├── CanvasNewton.jsx         # canvas das Leis de Newton
        ├── ControlesMatematicos.jsx # sliders globais
        ├── MRU3D.jsx                # cena Three.js do MRU
        ├── MRUCalculus.jsx          # derivações do MRU
        ├── MuvCalculus.jsx          # derivações do MRUV
        ├── Muvgraph.jsx             # gráficos do MRUV
        ├── Muvtable.jsx             # tabela de dados MRUV
        ├── Muvtheory.jsx            # teoria do MRUV
        ├── Muvequations.jsx         # equações MRUV
        ├── Muvanalysis.jsx
        ├── LancamentoCalculus.jsx   # derivações do lançamento
        └── NewtonCalculus.jsx       # derivações das Leis de Newton
```

---

## 🗺 Roadmap

```
v1.0  ✅  8 experimentos de Física 1 — Mecânica
v1.1  ✅  Correções físicas e modernização de layout (Física 1)
v1.2  ✅  Física 2 — Termodinâmica, Fluidos e Ondas (10 experimentos)
v1.3  ✅  Física 3 — Eletrostática (4 experimentos)
v1.4  ✅  Física 3 — Relatividade Especial (4 experimentos)
v1.5  ✅  Física 3 — Mecânica Quântica (4 experimentos)
v1.6  ✅  Assistente do Experimento (painel de ajuda contextual em todos os 30 experimentos)
v2.0  🔲  Compilação WebAssembly para simulações mais pesadas
v2.1  🔲  Modo educacional com guia passo a passo
v2.2  🔲  Exportação de dados (CSV / JSON)
```

---

## 🌟 Visão de Futuro

O FisicaLab nasceu como um projeto acadêmico, mas possui potencial para evoluir para uma plataforma educacional completa voltada ao ensino de Física, Engenharia e Ciências Exatas.

Nossa missão é transformar conceitos complexos em experiências visuais intuitivas e interativas.

---

## 👨‍💻 Equipe

Projeto desenvolvido para a disciplina de **Oficina de Integração** — Engenharia de Computação.

<table align="center">
<tr>
<td align="center" colspan="2">
<b>Eric Naoki Sugauara Kamakawa</b><br>
<sub>Engenharia de Computação</sub><br>
<sub>💻 Desenvolvimento e Implementação</sub>
</td>
</tr>
<tr>
<td align="center" width="200">
<b>Iago Leonardo Sitta</b><br>
<sub>Engenharia de Computação</sub>
</td>
<td align="center" width="200">
<b>Felipe Rochoel</b><br>
<sub>Engenharia de Computação</sub>
</td>
</tr>
</table>

---

## 📄 Licença

Distribuído sob a licença **MIT**. Veja [`LICENSE`](LICENSE) para mais informações.

---

<div align="center">
<sub>Feito com React, física e muita cafeína ☕</sub>
</div>
