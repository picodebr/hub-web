# Comparação: Hub-Web vs Scratch 3.0

> Contexto criado em 2026-04-27 para auxiliar na identificação de diferenças comportamentais entre o projeto hub-web e o Scratch original.

---

## Índice

1. [Visão Geral das Arquiteturas](#1-visão-geral-das-arquiteturas)
2. [VM e Execução de Blocos](#2-vm-e-execução-de-blocos)
3. [Threading e Scheduling](#3-threading-e-scheduling)
4. [Gerenciamento de Sprites e Clones](#4-gerenciamento-de-sprites-e-clones)
5. [Figurinos (Costumes) e Fundos (Backdrops)](#5-figurinos-costumes-e-fundos-backdrops)
6. [Detecção de Colisão](#6-detecção-de-colisão)
7. [Renderização](#7-renderização)
8. [Variáveis e Escopos](#8-variáveis-e-escopos)
9. [Gerenciamento de Estado (GUI)](#9-gerenciamento-de-estado-gui)
10. [Serialização de Projetos](#10-serialização-de-projetos)
11. [Sistema de Áudio](#11-sistema-de-áudio)
12. [Efeitos Visuais](#12-efeitos-visuais)
13. [Sistema de I/O (Teclado, Mouse)](#13-sistema-de-io-teclado-mouse)
14. [Tabela Resumo das Diferenças Críticas](#14-tabela-resumo-das-diferenças-críticas)
15. [Principais Riscos de Comportamento Diferente](#15-principais-riscos-de-comportamento-diferente)

---

## 1. Visão Geral das Arquiteturas

### Scratch 3.0
Monorepo com pacotes separados e altamente especializados:
```
scratch-gui        → UI (React + Redux)
scratch-vm         → Virtual Machine (runtime, execute, sequencer, threads)
scratch-render     → WebGL renderer (drawables, skins, silhouette)
scratch-svg-renderer → Processamento SVG
```

### Hub-Web
Monólito integrado dentro de `src/_base/`:
```
vm/PicoVM.ts                    → VM principal
vm/BlockInterpreter.ts          → Execução de blocos
services/code/ProjectService.ts → Facade do projeto
services/code/SpriteService.ts  → Gestão de sprites
services/code/CostumeService.ts → Gestão de figurinos
services/code/BackdropService.ts→ Gestão de fundos
context/ProjectContext.tsx      → Estado React (Context API)
engine/webgl/WebGLRenderer.ts   → Renderer WebGL customizado
engine/webgl/CollisionEngine.ts → Detecção de colisão
hooks/Code/useStageRunner.ts    → Primitivas de execução (movimento, etc.)
```

---

## 2. VM e Execução de Blocos

### Scratch (`scratch-vm`)
```
VirtualMachine (virtual-machine.js)
  └─ Runtime (engine/runtime.js)
       ├─ Sequencer (engine/sequencer.js)   ← loop de 30 FPS
       ├─ Execute (engine/execute.js)        ← executa blocos individuais
       └─ Thread (engine/thread.js)          ← estado de uma thread
```

**Como funciona:**
- O `Sequencer` usa um loop principal (via `setInterval` / RAF) que processa **todas as threads ativas** em sequência a cada frame
- `execute.js` avalia cada bloco usando um modelo baseado em **generator/retomada** — blocos que precisam "aguardar" (wait, glide) podem ser **interrompidos no meio** e retomados no próximo tick sem bloquear outras threads
- Threads têm estados explícitos: `RUNNING`, `PROMISE_WAIT`, `YIELD`, `YIELD_TICK`, `DONE`
- O scheduler aplica o tempo de forma equitativa entre threads (round-robin com budget de steps)

### Hub-Web (`PicoVM.ts` + `BlockInterpreter.ts`)
```
PicoVM
  └─ BlockInterpreter    ← executa blocos com async/await
       └─ Thread         ← AbortController para cancelamento
```

**Como funciona:**
- Usa **async/await nativo do JavaScript** em vez de generators
- Cada hat block gera uma `Promise` que executa o stack linearmente
- Max `40 steps/frame` antes de chamar `_waitOneFrame()` (pausa de ~33ms)
- Threads paralelas rodam como Promises independentes — não há scheduler centralizado
- Cancelamento via `AbortController` (cada thread tem seu próprio controller)

### Diferenças Críticas
| Aspecto | Scratch | Hub-Web |
|---------|---------|---------|
| Modelo de execução | Generators/coroutines | async/await |
| Interleaving de threads | Round-robin no scheduler central | Paralelismo JS nativo (event loop) |
| Yield explícito | `YIELD_TICK` state | `await _waitOneFrame()` |
| Budget por frame | Steps controlados pelo Sequencer | Max 40 steps hardcoded em PicoVM |
| Cancelamento | Substituição da thread | AbortController |

**Impacto:** Timing pode divergir — em Scratch, múltiplas threads compartilham o orçamento de um frame de forma previsível. No hub-web, threads assíncronas dependem do event loop do JS, podendo causar ordenações levemente diferentes.

---

## 3. Threading e Scheduling

### Scratch
- **Sequencer** (`engine/sequencer.js`): Itera todas as threads a cada "tick" (30 FPS via `setInterval(fn, 0)` com RAF para sincronização)
- Threads com `YIELD_TICK` são pausadas até o próximo tick — garante que todos os sprites atualizam a cada frame antes do renderer
- Blocos de controle como `repeat`, `forever`, `if` manipulam a pilha de execução diretamente (sem `await`)
- O "work time limit" impede que scripts lentos travem o frame

### Hub-Web
- Não há sequencer centralizado — cada script rodaindependentemente como Promise
- `PicoVM._frameSteps` conta steps globais mas não os distribui entre threads
- `await yieldFrame()` em `useStageRunner.ts` cede para o próximo RAF tick
- `ExecutionEngine` rastreia quantas tarefas estão ativas, mas não interfere no scheduling

**Impacto:** Em Scratch, `wait(0)` garante que todas as threads rodem pelo menos um passo antes de prosseguir. No hub-web, o comportamento depende do event loop — pode causar diferenças em scripts com timing preciso.

---

## 4. Gerenciamento de Sprites e Clones

### Scratch
```
Sprite (sprite.js)
  ├─ blocks        ← compartilhado por todos os clones
  ├─ costumes[]    ← compartilhado por todos os clones
  ├─ sounds[]      ← compartilhado por todos os clones
  └─ variables     ← compartilhado por todos os clones

RenderedTarget (rendered-target.js) extends Target
  ├─ sprite        ← referência para o Sprite pai
  ├─ x, y, direction, size, visible
  ├─ currentCostume (índice)
  ├─ effects       ← por instância
  └─ isOriginal    ← true para o original, false para clones
```

**Características:**
- Separação clara entre definição (Sprite) e instância (RenderedTarget)
- Clones compartilham código/figurinos via referência (sem cópia)
- Clones têm seus próprios: posição, efeitos, costume ativo, variáveis locais
- Limite de 300 clones por projeto

### Hub-Web
```
SpriteService
  ├─ sprites[]       ← array flat de objetos sprite
  ├─ parentId        ← identifica clones (parentId !== null)
  └─ bumpRevision()  ← incrementa stateRevision para o heartbeat
```

**Características:**
- Não há separação entre `Sprite` (definição) e `RenderedTarget` (instância)
- Clones são **deep copies** do pai (dados copiados, não compartilhados por referência)
- Mudanças de costume no pai são sincronizadas manualmente para clones
- Sem limite explícito de clones documentado

### Diferenças Críticas
| Aspecto | Scratch | Hub-Web |
|---------|---------|---------|
| Arquitetura | Sprite (def) + RenderedTarget (instância) | Objeto flat único |
| Compartilhamento de código em clones | Por referência (eficiente) | Deep copy |
| Costume ativo | Índice por instância | Campo no objeto sprite |
| Sincronização clone → pai | Automática (compartilhamento de referência) | Manual via `bumpRevision` |

**Impacto:** Mudanças de código/costume no sprite original em Scratch afetam clones imediatamente. No hub-web pode haver desync se a sincronização manual não for feita em todos os casos.

---

## 5. Figurinos (Costumes) e Fundos (Backdrops)

### Scratch
```typescript
costume = {
  name: string,
  assetId: string,        // md5 hash do asset
  md5: string,
  dataFormat: "svg"|"png"|"jpg",
  bitmapResolution: number, // 1 ou 2 (para retina)
  rotationCenterX: number,  // centro de rotação relativo ao tamanho
  rotationCenterY: number,
  skinId: number           // ID no renderer WebGL
}
```

- Assets armazenados como blobs dentro do .sb3 (zip)
- `load-costume.js` processa e registra no renderer como "skin"
- SVG renderizado como `SVGSkin`, bitmap como `BitmapSkin`
- **Centro de rotação preservado por costume**

### Hub-Web
```typescript
costume = {
  name: string,
  url: string,            // URL do S3 ou data URL
  thumbnail?: string,
  // rotationCenterX/Y: NÃO encontrado na análise
}
```

- Assets enviados para S3 (ou data URL para preview)
- `CostumeService` processa e redimensiona (max 960px)
- SVG enviado direto; bitmap convertido via canvas
- Centro de rotação: **não confirmado se é preservado**

### Diferenças Críticas
| Aspecto | Scratch | Hub-Web |
|---------|---------|---------|
| Armazenamento | Zip (.sb3) com md5 | S3 com URL |
| Centro de rotação | Armazenado por costume | Possivelmente não armazenado |
| Resolução de bitmap | Suporte a 2x (retina) | Resize para max 960px |
| SVG processing | scratch-svg-renderer | Upload direto para S3 |
| Skin/renderer link | skinId no costume | URL direta |

**Impacto:** Se o centro de rotação não for preservado no hub-web, sprites rotacionados aparecem em posição errada (deslocados do ponto esperado).

---

## 6. Detecção de Colisão

### Scratch (`scratch-render/src/Silhouette.js`)
- Cada `Drawable` tem uma `Silhouette` (máscara de pixels gerada pelo renderer)
- `isTouching(target)`: compara silhouettes pixel a pixel no espaço do stage
- Aplica transformações do renderer (posição, rotação, escala, efeitos)
- A silhouette é recalculada quando o costume/efeito muda
- Detecção de cor: `touchingColor()` via leitura de pixels do WebGL framebuffer

### Hub-Web (`CollisionEngine.ts`)
- Extrai canal **alpha** da imagem do costume (sem o renderer)
- Cache de masks por URL (cacheados indefinidamente)
- Algoritmo:
  1. AABB bounding-box para rejeição rápida
  2. Varre região de sobreposição pixel a pixel (`SAMPLE_STEP = 1`)
  3. Aplica transformação inversa (posição/rotação/escala) para mapear coords → pixel
  4. Alpha > 10 em ambos os sprites → colisão
- Cache de frame: limpo a cada RAF para evitar redundâncias

### Diferenças Críticas
| Aspecto | Scratch | Hub-Web |
|---------|---------|---------|
| Base de dados | Silhouette do renderer (inclui efeitos) | Alpha-mask da imagem original |
| Efeitos visuais na colisão | Considera (ghost, pixelate, etc.) | **Não considera** (alpha da imagem crua) |
| Costume SVG | Via renderer (rasterizado) | Via canvas separado |
| Cache | Por drawable (invalidado ao mudar costume) | Por URL (permanente por sessão) |
| Cor de toque | WebGL framebuffer | WebGL (também presente) |

**Impacto:** Se um sprite tem efeito "fantasma" (ghost), no Scratch ele deixa de colidir quando totalmente transparente. No hub-web, a colisão usa o alpha original da imagem — o sprite "invisible" pode ainda colidir.

---

## 7. Renderização

### Scratch (`scratch-render/RenderWebGL.js`)
```
RenderWebGL
  ├─ Drawables[]         ← um por RenderedTarget ou pen layer
  │   ├─ Skin reference
  │   ├─ position, rotation, scale
  │   └─ Effects (EffectTransform.js)
  └─ Skins[]
      ├─ BitmapSkin
      ├─ SVGSkin
      └─ PenSkin
```

- Drawables têm z-order explícito (stage-layering.js)
- Efeitos: color, fisheye, whirl, pixelate, mosaic, brightness, ghost
- PenSkin: superfície de desenho dinâmica
- Bolhas de fala: TextBubbleSkin

### Hub-Web (`WebGLRenderer.ts`)
- Renderer WebGL customizado
- TextureManager para cache de texturas
- Math3D para transformações
- Shaders GLSL customizados
- **Sistema de efeitos visuais não claramente documentado na análise**

### Diferenças Críticas
| Aspecto | Scratch | Hub-Web |
|---------|---------|---------|
| Efeitos visuais | 7 efeitos completos (color, ghost, etc.) | A confirmar |
| Pen/Drawing | PenSkin dedicada | A confirmar |
| Bolhas de fala | TextBubbleSkin | A confirmar |
| Z-order | stage-layering.js explícito | A confirmar |

---

## 8. Variáveis e Escopos

### Scratch
- Variáveis são objetos `Variable` com `id`, `name`, `value`, `type`
- Escopos: variáveis de sprite (locais) vs variáveis de stage (globais)
- Listas são um tipo especial de variável (`Variable.TYPE_LIST`)
- Cloud variables (prefixo `☁`) sincronizadas com servidor
- Monitores: displays flutuantes na stage (mostram valor em tempo real)

### Hub-Web
```typescript
// PicoVM.getVariableValue():
1. Verifica variáveis locais do sprite
2. Fallback para variáveis globais (stage)
3. Retorna 0 se não encontrada (comportamento Scratch)
```

- `VariableService` gerencia variáveis e listas
- Monitores suportados (Scratch-style floating displays)
- Modos de variável: `'stage'` vs `'upload'`
- Sem suporte a cloud variables

### Diferenças Críticas
| Aspecto | Scratch | Hub-Web |
|---------|---------|---------|
| Identificação | Por id único + nome | A confirmar |
| Cloud variables | Sim | Não |
| Escopo local de clone | Clones têm cópias de variáveis locais | A confirmar |

---

## 9. Gerenciamento de Estado (GUI)

### Scratch
- **Redux** com store centralizado
- Reducers separados por domínio (targets, projectState, monitors, etc.)
- HOCs (Higher Order Components) para side-effects de loading/saving
- VM emite eventos → Redux actions → React re-renders

### Hub-Web
- **React Context API** com híbrido push/pull:
  - **PUSH**: Eventos meta (seleção de sprite) → atualização imediata do state
  - **PULL**: Dados de alta frequência (sprites, variáveis) → heartbeat a 30 FPS via RAF
- `stateRevision` como versão de "dirty check" — React só atualiza se revision mudou
- 6 `setState` em um tick RAF = 1 re-render (React 18 batching automático)

### Diferenças Críticas
| Aspecto | Scratch | Hub-Web |
|---------|---------|---------|
| State management | Redux | React Context + heartbeat |
| Frequência de sync | Event-driven | 30 FPS polling |
| Latência de update | Imediato (event-driven) | Até 33ms de delay (heartbeat) |

---

## 10. Serialização de Projetos

### Scratch (SB3 Format)
```json
{
  "targets": [
    {
      "isStage": true,
      "name": "Stage",
      "costumes": [{"assetId": "...", "md5ext": "...", "rotationCenterX": 240}],
      "sounds": [...],
      "blocks": {"blockId": {...}}
    },
    {
      "isStage": false,
      "name": "Sprite1",
      "x": 0, "y": 0,
      "direction": 90,
      "size": 100,
      "visible": true,
      "costumes": [...],
      "variables": {"varId": ["varName", 0]}
    }
  ],
  "meta": {"semver": "3.0.0"}
}
```

- Arquivo ZIP contendo JSON + assets binários
- `sb3.js` para serialização/deserialização
- Assets identificados por md5 hash

### Hub-Web
- Serialização via `SerializationService.ts`
- Assets armazenados no S3 com URLs
- Formato JSON customizado (não compatível com SB3)
- `BrowserFileSystem.ts` gerencia uploads para S3

---

## 11. Sistema de Áudio

### Scratch
- `SharedAudioContext` (único contexto WebAudio por projeto)
- `SoundBank` por sprite (nodes de áudio por sprite)
- Efeitos de áudio encadeados: echo, fade, robot, mute, volume
- `AudioRecorder` para gravação do microfone
- Sons podem ser tocados concorrentemente

### Hub-Web
- `SoundService` (análise incompleta)
- Sons associados a sprites e fundos
- Cada backdrop pode ter sons próprios (campo `sounds[]` no backdrop)

### Diferenças
| Aspecto | Scratch | Hub-Web |
|---------|---------|---------|
| Efeitos de áudio | 5 efeitos (echo, fade, robot, mute, volume) | A confirmar |
| Concorrência | SoundBank por sprite | A confirmar |
| Gravação | AudioRecorder integrado | A confirmar |

---

## 12. Efeitos Visuais

### Scratch (via `EffectTransform.js`)
Suporta 7 efeitos por sprite:
- `color` — rotação de hue (0-200)
- `fisheye` — distorção de barril
- `whirl` — rotação espiral
- `pixelate` — pixelização
- `mosaic` — mosaico/tile
- `brightness` — brilho (-100 a 100)
- `ghost` — transparência (0-100)

### Hub-Web
- Efeitos não claramente mapeados na análise
- CollisionEngine usa alpha original (não considera efeito ghost)

**Impacto:** Blocos de efeitos visuais do Scratch podem ter comportamento diferente ou não implementado.

---

## 13. Sistema de I/O (Teclado, Mouse)

### Scratch (`src/io/keyboard.js`, `mouse.js`)
- `keyboard.js`: rastreia teclas pressionadas, array de chaves ativas
- `mouse.js`: posição no stage (coordenadas do stage), estado de botões
- Eventos despachados via Runtime para threads registradas
- Suporte a eventos de toque (mobile)

### Hub-Web (`PicoVM.ts` + `useStageRunner.ts`)
- `triggerKeyPress(key)` no PicoVM ativa threads de "when key pressed"
- `useStageRunner` rastreia `pressedKeys` (Set) e estado do mouse
- Listener de eventos no documento ou stage canvas

---

## 14. Tabela Resumo das Diferenças Críticas

| Componente | Scratch | Hub-Web | Risco de Divergência |
|------------|---------|---------|---------------------|
| **Execução de blocos** | Generator/coroutine | async/await | 🔴 Alto — timing diferente |
| **Scheduling de threads** | Round-robin centralizado | Event loop JS | 🔴 Alto — ordem de execução |
| **Arquitetura de sprites** | Sprite (def) + RenderedTarget | Objeto flat | 🟡 Médio — sync de clones |
| **Centro de rotação** | Armazenado por costume | Não confirmado | 🔴 Alto — posicionamento |
| **Colisão com efeitos** | Considera efeitos visuais | Ignora efeitos | 🟡 Médio — ghost/transparência |
| **Efeitos visuais** | 7 efeitos completos | A confirmar | 🟡 Médio |
| **Clones** | Compartilham código por referência | Deep copy | 🟡 Médio — sync manual |
| **Bolhas de fala** | TextBubbleSkin no renderer | A confirmar | 🟡 Médio |
| **Pen/Drawing** | PenSkin dedicada | A confirmar | 🟡 Médio |
| **Cloud variables** | Suportado | Não suportado | 🟢 Baixo (feature extra) |
| **Efeitos de áudio** | 5 efeitos | A confirmar | 🟢 Baixo |
| **Bounce on edge** | math-util.js | `bounceOnEdge()` em useStageRunner | 🟡 Médio — ângulo de reflexão |

---

## 15. Principais Riscos de Comportamento Diferente

### 🔴 1. Timing de Execução de Scripts Concorrentes
**Causa:** Scratch usa generators com round-robin; hub-web usa async/await puro.

**Sintoma:** Scripts que dependem de ordem de execução entre sprites diferentes podem ter comportamentos diferentes. Ex: `broadcast e wait` pode resolver em ordem diferente.

**Onde verificar:** [src/_base/vm/PicoVM.ts](src/_base/vm/PicoVM.ts) — método `_stepAllThreads` ou equivalente.

---

### 🔴 2. Centro de Rotação do Costume
**Causa:** Scratch armazena `rotationCenterX/Y` por costume. Hub-web pode não preservar isso.

**Sintoma:** Sprite aparece deslocado ao rotacionar — pois o ponto de origem (pivot) está diferente.

**Onde verificar:** [src/_base/services/code/CostumeService.ts](src/_base/services/code/CostumeService.ts) — verificar se `rotationCenterX/Y` é salvo/lido.

---

### 🔴 3. Comportamento de `wait(0)` e Sincronização de Frame
**Causa:** Em Scratch, `wait(0)` garante que todas as threads avançam pelo menos um passo. No hub-web, um `await` pode ceder imediatamente sem garantir isso.

**Sintoma:** Scripts que usam `wait(0)` para sincronizar podem "adiantar" no hub-web.

---

### 🟡 4. Colisão com Sprites Transparentes (Ghost Effect)
**Causa:** CollisionEngine usa alpha da imagem original, não considera o efeito ghost aplicado pelo renderer.

**Sintoma:** `touching(sprite)?` retorna `true` mesmo quando o sprite está "invisível" via efeito ghost.

**Onde verificar:** [src/_base/engine/webgl/CollisionEngine.ts](src/_base/engine/webgl/CollisionEngine.ts).

---

### 🟡 5. Sync de Clones com o Sprite Original
**Causa:** No Scratch, clones acessam o código do pai por referência — mudanças são automáticas. No hub-web, clones são deep copies.

**Sintoma:** Mudar o costume do sprite original em runtime pode não refletir em clones existentes.

**Onde verificar:** [src/_base/services/code/SpriteService.ts](src/_base/services/code/SpriteService.ts) — método de update de clones.

---

### 🟡 6. Ângulo de Reflexão no `bounceOnEdge`
**Causa:** Scratch usa `math-util.js` para calcular o ângulo de reflexão considerando direção atual. Hub-web implementa próprio `bounceOnEdge()`.

**Sintoma:** Sprite que bate na borda reflete com ângulo ligeiramente diferente.

**Onde verificar:** [src/_base/hooks/Code/useStageRunner.ts](src/_base/hooks/Code/useStageRunner.ts) — função `bounceOnEdge`.

---

## Arquivos-Chave para Debugging

| Arquivo Hub-Web | Equivalente Scratch | O que compara |
|-----------------|---------------------|---------------|
| [src/_base/vm/PicoVM.ts](src/_base/vm/PicoVM.ts) | `scratch-vm/src/engine/runtime.js` + `sequencer.js` | Loop principal, scheduling |
| [src/_base/vm/BlockInterpreter.ts](src/_base/vm/BlockInterpreter.ts) | `scratch-vm/src/engine/execute.js` | Execução de blocos individuais |
| [src/_base/hooks/Code/useStageRunner.ts](src/_base/hooks/Code/useStageRunner.ts) | `scratch-vm/src/blocks/scratch3_motion.js` | Movimento, glide, bounce |
| [src/_base/engine/webgl/CollisionEngine.ts](src/_base/engine/webgl/CollisionEngine.ts) | `scratch-render/src/Silhouette.js` | Colisão pixel-level |
| [src/_base/services/code/SpriteService.ts](src/_base/services/code/SpriteService.ts) | `scratch-vm/src/sprites/sprite.js` + `rendered-target.js` | Lifecycle de sprites |
| [src/_base/services/code/CostumeService.ts](src/_base/services/code/CostumeService.ts) | `scratch-vm/src/import/load-costume.js` | Loading e processamento de figurinos |

---

*Arquivo gerado automaticamente via análise comparativa de código. Atualizar conforme novos comportamentos forem identificados.*
