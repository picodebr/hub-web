# Plano: Refatorar Paint Editor (Costume + Backdrop Editor)

> Criado em: 2026-04-30  
> Referência: scratch-gui em `C:\Users\Vitor Weber\Desktop\scratch-editor\packages\scratch-gui`

---

## Como o Scratch trata imagens (referência)

### Tipos aceitos e tratamento

| Tipo | Tratamento |
|------|-----------|
| **SVG** | Sanitização 3 camadas (hrefs externos, `@import`, `url()` externos) → armazena como SVG |
| **PNG** | Redimensiona pela regra 960×720 → armazena como PNG |
| **JPG** | Mantém como JPEG na importação. Ao editar no paint editor: converte para PNG (perde qualidade) |
| **BMP** | Converte para PNG via canvas → trata como PNG |
| **GIF** | Decodifica frames com `omggif` → cada frame vira um **costume separado** |
| **WebP / outros** | Rejeita com erro |

### Regra de redimensionamento (`BitmapAdapter.getResizedWidthHeight`)

```
imagem ≤ 480×360         → dobra (width*2, height*2)
480×360 < img ≤ 960×720  → mantém tamanho original
imagem > 960×720          → escala para caber em 960×720 (preserva aspect ratio)
```

Teto máximo: **960×720** (2× o palco de 480×360 = `bitmapResolution=2`).  
Algoritmo: **nearest-neighbor**, dois passes (width → height) para evitar interpolação do browser.

### `bitmapResolution = 2` — por quê

Todos os bitmaps são armazenados em 2× a resolução do palco. Herança do Scratch 2 (resolução 1). Ao carregar projetos antigos com `bitmapResolution=1`, o VM multiplica dimensões por 2. Todos os imports novos nascem com `bitmapResolution=2`.

### Sanitização SVG — 3 camadas

1. **DOMPurify hooks**: bloqueia `href` externos (só aceita `data:` e `#interno`)
2. **CSS parsing**: remove `@import` e qualquer `url()` externo no estilo inline
3. **Fixup custom**: limpeza adicional via `fixup-svg-string.js`

### Gap atual no hub-web

| Scratch faz | hub-web atual |
|-------------|---------------|
| Redimensiona bitmaps para máx 960×720 | Não redimensiona — usa dimensão original |
| `bitmapResolution=2` normalizado | Sem normalização de resolução |
| BMP → PNG automático | Provavelmente não suporta BMP |
| GIF → múltiplos costumes | Sem suporte a GIF animado |
| SVG sanitizado antes de armazenar | Sem sanitização (risco de XSS) |
| JPEG mantido como JPEG | Tudo vira base64 SVG/PNG |
| Nearest-neighbor no resize | Depende do padrão do browser (bilinear) |

### Arquivos de referência no scratch-editor

- `scratch-gui/src/lib/file-uploader.js` — pipeline principal de upload
- `scratch-gui/src/lib/bmp-converter.js` — BMP → PNG
- `scratch-gui/src/lib/gif-decoder.js` — frames de GIF
- `node_modules/@scratch/scratch-svg-renderer/src/bitmap-adapter.js` — regra de resize
- `node_modules/@scratch/scratch-svg-renderer/src/sanitize-svg.js` — sanitização SVG
- `scratch-vm/src/import/load-costume.js` — carregamento no renderer

---

## Diagnóstico: 3 Problemas Estruturais

### Problema 1 — `stageUrl` não definido para imagens raster

**Sintoma:** PNG/JPG importado aparece correto no editor mas errado no palco (tamanho/posição).

**Causa:** `handleRasterLoad` em `PaintEditor/index.tsx` coloca a imagem no canvas Paper.js mas não dispara `syncToContext`, então `stageUrl` fica `undefined`. O palco cai no fallback `url`, que é o thumbnail cropado.

**O que o scratch-gui faz:** Converte ImageData → Canvas → Blob → PNG e passa ao renderer com coordenadas absolutas via `vm.updateBitmap()`.

**Arquivo:** `src/pages/code/[folder_id]/[project_id]/components/editors/PaintEditor/index.tsx`

---

### Problema 2 — SVG Import com posicionamento frágil

**Sintoma:** SVGs externos ficam posicionados errado no palco vs. o que o usuário vê no editor.

**Causa:** Detecção do marcador `PBT_BOUNDS_BOX` via regex rígida:
```
/viewBox\s*=\s*["']272(\.0+)?\s+120(\.0+)?\s+480(\.0+)?\s+360(\.0+)?["']/
```
SVGs externos sem esse marcador são centralizados de forma inconsistente.

**O que o scratch-gui faz:** Paper.js importa e aplica transformação com base no `rotationCenterX/Y`, sem marcadores internos.

**Arquivo:** `src/pages/code/[folder_id]/[project_id]/components/editors/PaintEditor/index.tsx` (função `importSvgString`)

---

### Problema 3 — BackdropEditor acoplado aos métodos de costume

**Sintoma:** Backdrops usam `addCostumeToSprite`, `removeCostumeFromSprite`, etc. Cast `as any` em ProjectContext.

**Causa:** `BackdropEditor.tsx` não tem seus próprios métodos — reutiliza os de costume com cast de tipo.

**Arquivo:** `src/pages/code/[folder_id]/[project_id]/components/editors/BackdropEditor.tsx`

---

## Plano de Implementação

### FASE 1 — Corrigir comunicação Paint Editor → Palco (crítico)

#### 1.1 — Garantir `stageUrl` sempre populado

Em `PaintEditor/index.tsx`, no `handleRasterLoad`:

1. Após `forceInternalCanvas()` / `paper.view.draw()`, chamar `syncToContext({ immediate: true })`
2. Garantir que `SvgService.exportDrawingSVG` inclua imagens raster como `<image>` embedded no SVG de saída
3. Verificar que o `stageUrl` resultante renderiza corretamente no WebGL renderer

#### 1.2 — Unificar o export de costume/backdrop

No `syncToContext`, separar claramente:
- `thumbUrl` = SVG cropado ao bounds do conteúdo (para thumbnail na sidebar)
- `stageUrl` = SVG com `viewBox="0 0 480 360"` (para palco) — **sempre 480×360, independente do conteúdo**

---

### FASE 2 — Corrigir SVG Import Positioning (médio)

#### 2.1 — Remover dependência do `PBT_BOUNDS_BOX` para SVGs externos

Em vez do regex rígido, ao importar SVG externo:
1. Importar via `paper.project.importSVG(svgString)`
2. Calcular o `bounds` do item importado
3. Reposicionar para `center = artboardCenter = { x: 240, y: 180 }`

#### 2.2 — SVGs gerados pelo editor continuam usando `PBT_BOUNDS_BOX`

Lógica bifurcada:
- **Tem o marcador** → posição exata preservada (caminho atual)
- **Não tem o marcador** → centralizar no artboard (SVGs externos)

---

### FASE 3 — Separar BackdropEditor semanticamente (médio)

#### 3.1 — Criar métodos dedicados no ProjectContext

```typescript
addBackdropToStage(backdrop: BackdropData): void
removeBackdropFromStage(backdropId: string): void
renameBackdrop(backdropId: string, name: string): void
updateBackdrop(backdropId: string, thumbUrl: string, stageUrl: string): void
```

#### 3.2 — BackdropEditor usa os novos métodos

Em `BackdropEditor.tsx`, substituir chamadas de costume pelos métodos de backdrop.

#### 3.3 — Remover o cast `as any` no ProjectContext

Criar tipo próprio para o estágio no contexto.

---

---

## Implementado (2026-04-30)

### CORS fix + Resize rules (Fase 1 + tratamento de imagens)

**`PaintEditor/index.tsx`**:
- Adicionada `clampToBitmapBounds(w, h)` — aplica regra do Scratch: máx 960×720
- Adicionada `loadRasterSafely(url, onLoaded, onFailed)` dentro do `useEffect` de carga:
  - Para URLs `http://` / `//`: carrega `HTMLImageElement` com `crossOrigin='anonymous'` definido **antes** do `src` (bug raiz do canvas tainted), clampeia para 960×720 e cria `Raster` a partir de canvas limpo
  - Para `data:` URIs: comportamento anterior mantido
- Substituídos os dois `new scope.Raster(initialUrl)` com `crossOrigin` errado por chamadas a `loadRasterSafely`

**`SvgService.ts`**:
- Adicionado `buildFallbackSvg(bounds)`: quando `dl.exportSVG()` lança SecurityError (canvas tainted), rasteriza o frame atual via `view.element.toDataURL()` e gera SVG com `<image>` embedded — garante que `stageUrl` **sempre** retorna um valor válido
- `thumbnailSvg` e `stageSvg` agora usam o fallback em vez de retornar `''`

**Bug raiz resolvido**: `crossOrigin` era definido **depois** do `src` no `new scope.Raster(url)` → browser carregava a imagem sem header CORS → `drawImage` manchava o canvas → `dl.exportSVG()` lançava SecurityError → `syncToContext` recebia strings vazias e retornava sem atualizar → `stageUrl` nunca era definido → palco mostrava imagem errada.

---

### FASE 4 — UX (nice-to-have)

| Item | Arquivo | Dificuldade |
|------|---------|-------------|
| Borda visual da artboard (480×360) | `CanvasView.tsx` | Baixa |
| Persistir zoom por costume | `PaintEditor/index.tsx` | Baixa |
| Reset para Select tool ao trocar costume | `CostumeEditor.tsx` | Baixa |
| Shortcuts completos (Copy, Paste, Select All) | hook `useTools` | Média |
| Text tool: font size/color picker | PaintEditor toolbar | Média |

---

## Referência: Fluxo de Dados do scratch-gui

### Load: VM → Editor
```
vm.getCostume(index)
    → SVG string ou base64 data URI
    → PaintEditorWrapper.image prop
    → PaperCanvas.importImage()
    → paper.project.importSVG() ou Image element
```

### Save: Editor → VM → Palco
```
Tool change → onUpdateImage callback
    → UpdateImageHOC extrai ImageData ou SVG string do Paper.js
    → PaintEditorWrapper.handleUpdateImage()
    → vm.updateSvg() ou vm.updateBitmap()
    → runtime.renderer.updateSVGSkin() ou updateBitmapSkin()
    → emitTargetsUpdate() → UI re-render
```

### Props críticas do PaintEditor (scratch-gui)
```
image           → SVG string ou base64 data URI
imageFormat     → 'svg' | 'png' | 'jpg'
imageId         → targetId + costume.skinId (muda para triggar reload)
rotationCenterX/Y
onUpdateImage   → callback chamado em cada edição
zoomLevelId     → compartilhado entre costumes do mesmo sprite
```

---

## Arquivos-chave no hub-web

| Arquivo | Papel |
|---------|-------|
| `src/pages/code/.../editors/PaintEditor/index.tsx` | Core do editor (Paper.js) |
| `src/pages/code/.../editors/CostumeEditor.tsx` | Sidebar + integração costume |
| `src/pages/code/.../editors/BackdropEditor.tsx` | Sidebar + integração backdrop |
| `src/pages/code/.../editors/PaintEditor/ui/CanvasView.tsx` | Viewport, zoom, scroll |
| `src/_base/lib/ml.ts` | ML (não relacionado ao paint editor) |

## Arquivos-chave no scratch-gui (referência)

| Arquivo | Papel |
|---------|-------|
| `src/containers/paint-editor-wrapper.jsx` | Bridge Redux ↔ scratch-paint |
| `src/containers/costume-tab.jsx` | Gerencia lista de costumes |
| `node_modules/scratch-paint/src/containers/paper-canvas.jsx` | Import/export Paper.js |
| `node_modules/scratch-paint/src/hocs/update-image-hoc.jsx` | Export on change |
