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

Cada experimento possui duas abas:
- **Simulação** — animação interativa com parâmetros ajustáveis em tempo real
- **Teoria / Cálculo** — derivações passo a passo com valores numéricos atualizados

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
└── src/
    ├── main.jsx               # entry point
    ├── App.jsx                # roteamento entre experimentos
    ├── App.css                # estilos globais + design tokens
    │
    ├── pages/                 # cada experimento = uma página
    │   ├── Home.jsx
    │   ├── ExperimentoLancamento.jsx
    │   ├── ExperimentoMRU.jsx
    │   ├── ExperimentoMUV.jsx
    │   ├── ExperimentoCircular.jsx
    │   ├── ExperimentoLeisNewton.jsx
    │   ├── Experimentoplanoinclinado.jsx
    │   ├── ExperimentoColisoes.jsx
    │   └── ExperimentoEnergiaMecanica.jsx
    │
    └── components/            # componentes reutilizáveis
        ├── LogoFisicaLab.jsx
        ├── CanvasAnimacao.jsx       # canvas do lançamento
        ├── CanvasNewton.jsx         # canvas das Leis de Newton
        ├── ControlesMatematicos.jsx # sliders globais
        ├── MRU3D.jsx                # cena Three.js do MRU
        ├── MRUCalculus.jsx          # derivações do MRU
        ├── MuvCalculus.jsx          # derivações do MRUV
        ├── MuvGraph.jsx             # gráficos do MRUV
        ├── MuvTable.jsx             # tabela de dados MRUV
        ├── MuvTheory.jsx            # teoria do MRUV
        ├── Muvequations.jsx         # equações MRUV
        ├── Muvanalysis.jsx
        ├── LancamentoCalculus.jsx   # derivações do lançamento
        └── NewtonCalculus.jsx       # derivações das Leis de Newton
```

---

## 🗺 Roadmap

```
v1.0  ✅  8 experimentos de Física 1 — Mecânica
v1.1  🔄  Correções físicas (força normal no loop, atrito variável)
v1.2  🔲  Física 2 — Ondulatória (superposição, interferência)
v1.3  🔲  Física 3 — Eletromagnetismo (campo elétrico, potencial)
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

<table>
<tr>
<td align="center" width="200">
<b>Eric Naoki Sugauara Kamakawa</b><br>
<sub>Engenharia de Computação</sub>
</td>
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
