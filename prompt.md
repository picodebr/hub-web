Atue como um Staff Software Engineer especialista em React, TypeScript, Clean Architecture e manipulação gráfica avançada (Canvas API, SVG e Paper.js). 

Estou trabalhando em uma grande refatoração no meu código novo (no arquivo principal `index.page.new.tsx`) de uma plataforma educacional de programação visual. Preciso construir um **Editor de Fantasias e Cenários (Paint Editor)** do zero, com suporte a Modo Vetor (SVG via Paper.js) e Modo Bitmap (Canvas 2D).

Para te dar contexto de arquitetura, quero que a solução se espelhe na forma como o ecossistema do Scratch 3.0 resolve esse problema. No repositório do Scratch, a responsabilidade é dividida nos seguintes pacotes:
- `scratch-gui/src/containers/paint-editor-wrapper.jsx`: O componente React de alto nível que injeta o estado e gerencia a montagem do editor.
- `scratch-svg-renderer/src/`: O módulo crucial que pega strings SVG sujas, limpa, ajusta fontes, insere namespaces corretos e as converte para exibição.
- `scratch-vm/src/import/load-costume.js`: A máquina virtual que recebe as alterações da imagem e atualiza o estado do personagem.

Quero que você escreva o código do nosso novo editor focando especificamente em DOIS processos críticos que costumam bugar:

### FOCO 1: O Ciclo de Vida da Imagem (Entrada -> Canvas)
Explique e implemente como o editor recebe uma imagem externa e a monta na tela do editor gráfico.
1. O editor (renderizado no `index.page.new.tsx`) deve receber: `costumeId`, `format` ('svg' | 'png' | 'jpg') e `imageData` (string SVG ou Base64).
2. **Se for Vetor (SVG):** O código deve limpar o projeto ativo do Paper.js, acionar um serviço inspirado no `scratch-svg-renderer` para sanitizar a string, e usar `paper.project.importSVG()` para desenhar os vetores na tela.
3. **Se for Bitmap:** O código deve carregar a imagem em um `Image` nativo, desenhá-la no `CanvasRenderingContext2D` e calcular a escala/zoom corretamente para não distorcer os pixels.

### FOCO 2: Sincronização com o Palco (Editor -> Motor do Jogo)
O editor não altera o palco do jogo diretamente. Ele deve funcionar com a lógica de "Debounce" e "Commit" para não travar a interface:
1. Enquanto o usuário arrasta o mouse (ex: desenhando), o editor atualiza APENAS o canvas interno a 60fps.
2. **Commit (onMouseUp):** Quando a ação termina, o editor dispara um "commit":
   - Extrai o SVG atualizado (`paper.project.exportSVG`) ou o Base64 do Bitmap.
   - Dispara uma prop `onUpdateCostume(costumeId, newImageData)` avisando o motor superior que a edição daquele "stroke" terminou. O motor fará o trabalho semelhante ao `scratch-vm` de atualizar o palco (Stage).
   - Salva a string extraída no array de histórico local para gerenciar a ferramenta de Desfazer/Refazer (Undo/Redo).

### REQUISITOS DE CÓDIGO E ARQUITETURA:
- Utilize **Zustand** (ou Context API) para gerenciar o estado isolado do editor (ferramenta ativa: Pincel/Borracha/Seleção, cor, espessura).
- Implemente o "Tool Pattern" usando classes ou hooks limpos (ex: `class BrushTool`), separando a lógica matemática do mouse do componente visual.
- Crie o hook de inicialização `useCanvasEditor.ts` que lide com a criação e destruição do Paper.js/Canvas 2D, prevenindo vazamento de memória quando o componente for desmontado.

Por favor, forneça:
1. A arquitetura de pastas sugerida.
2. O código do serviço de conversão/sanitização (inspirado no `scratch-svg-renderer`).
3. O hook de gerenciamento do Canvas (`useCanvasEditor.ts`).
4. A estrutura do arquivo `index.page.new.tsx` (ou o componente wrapper) mostrando a conexão de Entrada e Saída de dados (Foco 1 e 2).

tem o repositório local para vc olhar: C:\Users\Vitor Weber\Desktop\picode_hub_code\teste_scrratch\scratch-editor