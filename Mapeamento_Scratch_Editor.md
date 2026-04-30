# Mapeamento do Repositório `scratch-editor`

Este documento apresenta a estrutura do repositório `scratch-editor`, que adota uma arquitetura de *monorepo* (vários pacotes no mesmo repositório) para agrupar as bibliotecas centrais do ecossistema Scratch 3.0.

## 📁 Estrutura de Diretórios Principal

O código-fonte está dividido maioritariamente dentro da pasta `packages/`, que contém os submódulos do projeto:

### 1. `packages/scratch-gui/` (Interface Gráfica)
Contém a interface gráfica principal construída em React e Redux. É aqui que os utilizadores interagem com a plataforma.
* **`src/components/`**: Componentes visuais puros (*Dumb Components/UI*). Inclui elementos como `menu-bar`, `stage`, `sprite-selector`, `blocks` e modais.
* **`src/containers/`**: Componentes inteligentes (*Smart Components*) que ligam o estado do Redux aos componentes visuais. Ex: `stage-wrapper.jsx` e `paint-editor-wrapper.jsx` (que integra o editor de desenho).
* **`src/reducers/`**: Gestão do estado global da aplicação (via Redux). Lida com o estado do palco, *sprites*, ferramentas ativas e menus.
* **`src/lib/`**: Utilitários essenciais, como a gestão de bibliotecas de sons e fantasias, *wrappers* para áudio e gestão de drag-and-drop.
* **`src/playground/`**: Ficheiros de teste e exemplos para executar a interface de forma isolada do resto do site.

### 2. `packages/scratch-vm/` (Máquina Virtual / Motor lógico)
É o "cérebro" do Scratch. Representa o estado do projeto, executa o código dos blocos e faz a gestão dos eventos.
* **`src/engine/`**: O núcleo de execução (`runtime.js`, `execute.js`, `target.js`, `thread.js`). Lida com a *loop* principal e a execução concorrente de guiões (scripts).
* **`src/blocks/`**: Implementação das lógicas primárias dos blocos (movimento, controlo, aparência, operadores, etc.).
* **`src/sprites/`**: Lógica de gestão de clones, propriedades dos *sprites* e metadados de renderização.
* **`src/extensions/`**: Extensões oficiais do Scratch (Pen, Music, Video Sensing, Text to Speech, integrações de hardware como o Micro:bit e EV3).
* **`src/serialization/`**: Lógica de conversão (importação/exportação) de projetos nos formatos legado (`.sb2`) e atual (`.sb3`).

### 3. `packages/scratch-render/` (Motor de Renderização WebGL)
O motor gráfico responsável por desenhar o palco e as personagens utilizando a aceleração WebGL no elemento `<canvas>`.
* **`src/RenderWebGL.js`**: O orquestrador principal da renderização.
* **`src/Skin.js`** / **`src/*Skin.js`**: Lida com os diferentes tipos de texturas e imagens:
    * `SVGSkin.js`: Renderização de vetores matemáticos (SVGs).
    * `BitmapSkin.js`: Renderização de imagens rasterizadas em píxeis (PNGs e JPGs).
    * `PenSkin.js`: Renderização da camada de caneta (desenhos gerados dinamicamente pelos blocos).

### 4. `packages/scratch-svg-renderer/` (Processador de SVGs)
Um módulo crítico e frequentemente subestimado, responsável por importar, limpar e compatibilizar ficheiros SVG.
* **`src/sanitize-svg.js`** / **`src/fixup-svg-string.js`**: Limpa marcações (tags) SVG malformadas que possam causar erros no motor WebGL.
* **`src/font-inliner.js`**: Converte e embebe fontes de texto diretamente no ficheiro SVG para garantir que o texto não se desconfigura quando a imagem é desenhada noutros contextos.

### 5. `packages/task-herder/` (Gestão de Tarefas Assíncronas)
Um pequeno utilitário (`QueueManager`, `TaskQueue`) usado para fazer a gestão de concorrência e filas de tarefas assíncronas no browser.

---

## 🔄 Fluxo de Dados e Integração (Foco: Edição Visual vs. Palco)

Considerando o seu contexto de recriação do **Editor de Fantasias e Cenários**, este é o caminho que uma imagem percorre dentro desta estrutura:

1.  **Edição Visual (`scratch-gui`)**: O utilizador desenha a imagem num componente contido em `paint-editor-wrapper.jsx` (que atua como contentor para o pacote de pintura). O estado do Pincel, Borracha, etc., vive aqui.
2.  **Tratamento e Normalização (`scratch-svg-renderer`)**: Assim que o utilizador conclui um traço ou termina a edição vetorial, o pacote gera um SVG temporário. Este SVG é imediatamente processado por este módulo para garantir a correta renderização e conversão das *bounding boxes*.
3.  **Atualização de Estado Lógico (`scratch-vm`)**: O `scratch-gui` avisa a Máquina Virtual de que a fantasia com ID `xyz` foi alterada. A VM atualiza os dados na lista de fantasias do `Target` (Personagem) em causa.
4.  **Renderização no Palco (`scratch-render`)**: A VM dispara um evento para informar o motor WebGL de que a textura de uma fantasia foi mudada. O `scratch-render` recria as propriedades do respetivo `SVGSkin` ou `BitmapSkin` e empurra os novos dados para a placa gráfica, refrescando a imagem no palco do jogo.
