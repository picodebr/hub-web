'use client';

/**
 * PaintEditor - O coração visual do PicoCode Hub para criação de Atores e Cenários.
 *
 * Responsabilidade: Orquestrar a ponte entre o ecossistema React (Estado/Contexto)
 * e o motor vetorial Paper.js (Canvas). Gerencia o ciclo de vida do projeto de desenho,
 * sincronização em tempo real com o palco e a persistência de histórico (Undo/Redo).
 *
 * Estratégia de Sincronização (Live Sync):
 * Gera um par de SVGs:
 * 1. Thumbnail: Cortado rente aos limites do desenho (gera o ícone na sidebar).
 * 2. Stage: Mantém o artboard 480x360 (garante posição absoluta correta no palco).
 *
 * Fluxo de Dados:
 * 1. Mudança no Paper.js -> useTools dispara mudança.
 * 2. syncToContext (Throttled @ 10fps) exporta via SvgService.
 * 3. Update no ProjectContext propaga o base64 para o StageRunner.
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import * as paper from 'paper';
import { DRAWING_CONFIG } from './constants';
import { SvgService } from './core/SvgService';
import { normalizeSvgString, decodeSvgUrl, detectFormat } from './services/svgRenderer';

// UI
import { Header } from './ui/Header';
import { Toolbar } from './ui/Toolbar';
import { CanvasView } from './ui/CanvasView';

// Hooks
import { usePaperProject } from './hooks/usePaperProject';
import { useHistory } from './hooks/useHistory';
import { useTools } from './hooks/useTools';
import { useZoom } from './hooks/useZoom';
import { useProject } from '@/_base/context/ProjectContext';
import { IPaintItem } from '@/_base/domain/entities/IPaintEditor';

interface PaintEditorProps {
  spriteId: string;
  costumeId: string;
  costumeName: string;
  initialUrl?: string;
  isBackdrop?: boolean;
}

export const PaintEditor: React.FC<PaintEditorProps> = ({ spriteId, costumeId, costumeName, initialUrl, isBackdrop }) => {
  const { updateCostume } = useProject();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // State
  const [state, setState] = useState({
    fillColor: '#4483ff',
    strokeColor: '#000000',
    strokeWidth: 1,
    brushSize: 20,
    fillTransparent: false,
    strokeTransparent: false,
    fontFamily: 'Arial',
    fontSize: 24,
  });

  const [textInput, setTextInput] = useState({
    visible: false,
    x: 0,
    y: 0,
    value: '',
    point: null as paper.Point | null,
  });

  // Paper.js setup
  const scope = usePaperProject(canvasRef);
  const svgService = useMemo(() => (scope ? new SvgService(scope) : null), [scope]);

  // Stable refs for context sync (prevents re-render cascades)
  const spriteIdRef = useRef(spriteId);
  const costumeIdRef = useRef(costumeId);
  const isBackdropRef = useRef(isBackdrop);
  
  spriteIdRef.current = spriteId;
  costumeIdRef.current = costumeId;
  isBackdropRef.current = isBackdrop;

  const updateCostumeRef = useRef(updateCostume);
  useEffect(() => {
    updateCostumeRef.current = updateCostume;
  }, [updateCostume]);

  const costumeNameRef = useRef(costumeName);
  useEffect(() => {
    costumeNameRef.current = costumeName;
  }, [costumeName]);

  // Track last synced offset to avoid infinite delta loops
  const lastOffsetRef = useRef({ x: 0, y: 0 });

  // Reseta o rastreamento de offset ao trocar de sprite/fantasia
  useEffect(() => {
    lastOffsetRef.current = { x: 0, y: 0 };
  }, [spriteId, costumeId]);

  // Stable syncToContext that never changes identity
  // SINCRONIZAÇÃO COM O PALCO (LIVE SYNC):
  // Esta função converte o estado atual do canvas vetorial em um par de SVGs:
  // - thumbnailSvg: Cortado para os limites do desenho (gera o ícone da galeria).
  // - stageSvg: Mantém o artboard 480x360 (garante posição correta no palco).
  const syncToContext = useCallback(() => {
    if (!svgService || !scope) return;
    const { thumbnailSvg, stageSvg } = svgService.exportDrawingSVG({ isBackdrop: isBackdropRef.current });
    if (!thumbnailSvg || !stageSvg) return;

    const encode = (s: string) => btoa(new TextEncoder().encode(s).reduce((a, b) => a + String.fromCharCode(b), ''));
    const thumbUrl = `data:image/svg+xml;base64,${encode(thumbnailSvg)}`;
    const stageUrl = `data:image/svg+xml;base64,${encode(stageSvg)}`;
    
    // Armazenamos a URL sincronizada para que o useEffect de carga inicial a ignore
    lastSyncedUrlRef.current = stageUrl;
    
    updateCostumeRef.current(spriteIdRef.current, costumeIdRef.current, thumbUrl, stageUrl);
  }, [scope]);

  // Undo/Redo
  // Undo/Redo
  const { saveHistory, setInitialState, undo, redo, canUndo, canRedo } = useHistory(scope, syncToContext);

  const onShowTextInput = useCallback(
    (point: paper.Point) => {
      const view = scope?.view;
      if (view) {
        const viewPos = view.projectToView(point);
        setTextInput({ visible: true, x: viewPos.x, y: viewPos.y, value: '', point });
      }
    },
    [scope],
  );

  // Tools
  const { activeToolId, activateTool, commitText, notifyProjectChange, clearSelectionForCostumeSwitch } = useTools(
    scope,
    state,
    saveHistory,
    onShowTextInput
  );

  // Zoom & Scroll
  const { zoom, setZoom, scrollPos, updateScroll, zoomToFit } = useZoom(scope);

  // Helper: import SVG string into the project
  const importSvgString = useCallback(
    (svgString: string, isInitial: boolean = false) => {
      // Segurança: Verifica se o motor gráfico (scope) e o projeto estão ativos
      if (!scope || !scope.project || !svgService) return;

      // Sanitize and normalize (Inkscape namespaces, version 1.1, viewBox fixing, units stripping)
      const normalized = normalizeSvgString(svgString);
      
      console.log(`[PaintEditor] Iniciando importação SVG (${normalized.length} bytes). isInitial:`, isInitial);

      // Garante que este escopo e projeto estão ativos para a importação
      scope.activate();
      
      scope.project.importSVG(normalized, {
        insert: true,
        onLoad: (importedItem: paper.Item | null) => {
          console.log('[PaintEditor] SVG importado com sucesso:', importedItem?.name || 'sem nome', importedItem);
          
          // Verifica se o projeto ainda existe no momento do callback
          if (!importedItem || !scope.project) {
            console.warn('[PaintEditor] Importação abortada ou falhou: Item nulo ou projeto destruído.');
            return;
          }
          // Tenta encontrar nosso marcador de limites do artboard
          const bbox = importedItem.getItem({ name: 'PBT_BOUNDS_BOX', recursive: true });

          if (bbox) {
            // RESTAURAÇÃO DE POSIÇÃO ROBUSTA:
            // Se o SVG contém nosso marcador 'PBT_BOUNDS_BOX', sabemos exatamente
            // onde o artboard original estava em relação aos itens.
            // Aplicamos um delta de translação para alinhar o desenho importado
            // precisamente ao centro (0,0 lógico) do novo projeto.
            const expectedTopLeft = new scope.Point(DRAWING_CONFIG.abX, DRAWING_CONFIG.abY);
            const currentTopLeft = bbox.bounds.topLeft;
            const delta = expectedTopLeft.subtract(currentTopLeft);

            importedItem.translate(delta);
            // bbox.remove(); // NOVO: Não removemos mais o marcador para que o recarregamento futuro saiba que o item já está alinhado e não force escala redundante.
            (bbox as IPaintItem).guide = true;
            bbox.visible = false;
          } else {
            const stageCenter = new scope.Point(DRAWING_CONFIG.canvas.w / 2, DRAWING_CONFIG.canvas.h / 2);
            importedItem.position = stageCenter;

            const ib = importedItem.bounds;
            const scaleFactor = isBackdrop ? 1.0 : 0.8;
            const maxW = DRAWING_CONFIG.artboard.w * scaleFactor;
            const maxH = DRAWING_CONFIG.artboard.h * scaleFactor;

            if (ib.width > maxW || ib.height > maxH || isBackdrop) {
              // AUTO-SCALE COMPORTAMENTAL:
              // Só aplicamos a escala se NÃO for o carregamento inicial do projeto (preserva zoom salvo)
              // OU se for um item novo que precisa caber no palco.
              if (!isInitial) {
                const scale = Math.min(maxW / ib.width, maxH / ib.height);
                importedItem.scale(scale);
              }
            }
          }

          svgService.releaseSVG(importedItem);

          if (isInitial) {
            setInitialState();
            // SINCRONIZAÇÃO INICIAL:
            // Forçamos um sync imediato após carregar um SVG externo/original para garantir
            // que o context receba a versão normalizada e com PBT_BOUNDS_BOX.
            requestAnimationFrame(() => syncToContext());
          } else {
            saveHistory();
            notifyProjectChange();
          }

          // Se for a primeira carga ou troca de costume, podemos enquadrar
          // Mas evitamos se for apenas um re-render do mesmo costume
          // Usamos SetTimeout para garantir que o ResizeObserver do Canvas aplicou o ViewSize real da tela
          setTimeout(() => {
            zoomToFit();
          }, 50);
        },
      });
    },
    [scope, isBackdrop, svgService, saveHistory, setInitialState, zoomToFit, notifyProjectChange, syncToContext],
  );

  // Initial Load - handles both base64 and URL
  // Uses costumeId AND initialUrl as the key: reloads when the active costume changes
  // OR when the URL changes (e.g. new file uploaded for same costume).
  const loadedCostumeIdRef = useRef<string | null>(null);
  const loadedUrlRef = useRef<string | null>(null);
  const lastSyncedUrlRef = useRef<string | null>(null);
  // Monotonic counter — each new load increments it; stale async callbacks compare before acting
  const currentLoadIdRef = useRef(0);

  useEffect(() => {
    if (!scope || !initialUrl) return;

    const isRecentlySynced = lastSyncedUrlRef.current === initialUrl;
    const isSameUrl = loadedUrlRef.current === initialUrl;

    if (loadedCostumeIdRef.current === costumeId && (isSameUrl || isRecentlySynced)) {
      return;
    }

    loadedCostumeIdRef.current = costumeId;
    loadedUrlRef.current = initialUrl;

    // Invalidate any in-flight load from a previous costume switch
    const loadId = ++currentLoadIdRef.current;

    // Clear drawing layer BEFORE resetting the SelectTool so that when activate()
    // calls updateBoundingBox() → getSelectedItems(), the layer is already empty
    // and no highlight clones are recreated for the old sprite.
    const dl = scope.project.layers.find((l) => l.name === 'drawing');
    if (dl) {
      [...dl.children].forEach((child) => {
        if (child.name !== 'PBT_BOUNDS_BOX') child.remove();
      });
    }

    clearSelectionForCostumeSwitch();

    const format = detectFormat(initialUrl);
    console.log(`[PaintEditor] Efeito de carga disparado. URL: ${initialUrl}, Format: ${format}, CostumeId: ${costumeId}`);

    const handleRasterLoad = (raster: paper.Raster, isInitialLoad: boolean = false) => {
      if (!scope || !scope.project) return;

      const dl = scope.project.layers.find((l) => l.name === 'drawing');
      if (dl && raster.layer !== dl) {
        dl.addChild(raster);
      }

      const finalizeRaster = () => {
        // Guard: if another costume was loaded after this one started, discard
        if (loadId !== currentLoadIdRef.current) {
          raster.remove();
          return;
        }
        if (!scope || !scope.project) return;
        const stageCenter = new scope.Point(DRAWING_CONFIG.canvas.w / 2, DRAWING_CONFIG.canvas.h / 2);
        raster.position = stageCenter;

        const rb = raster.bounds;
        const scaleFactor = isBackdrop ? 1.0 : 0.8;
        const maxW = DRAWING_CONFIG.artboard.w * scaleFactor;
        const maxH = DRAWING_CONFIG.artboard.h * scaleFactor;

        if (rb.width > maxW || rb.height > maxH || isBackdrop) {
          const scale = Math.min(maxW / rb.width, maxH / rb.height);
          raster.applyMatrix = true;
          raster.scale(scale);
        }

        if (isInitialLoad) {
          setInitialState();
        } else {
          saveHistory();
        }

        requestAnimationFrame(() => syncToContext());
        setTimeout(() => zoomToFit(), 50);
      };

      const needsDownsample = raster.width > 2000 || raster.height > 2000;
      if (needsDownsample && typeof createImageBitmap === 'function') {
        const maxSafetyDim = 1200;
        const ratio = Math.min(maxSafetyDim / raster.width, maxSafetyDim / raster.height);
        const newW = Math.max(1, Math.floor(raster.width * ratio));
        const newH = Math.max(1, Math.floor(raster.height * ratio));

        const sourceImage = raster.image as HTMLImageElement | HTMLCanvasElement | ImageBitmap;
        createImageBitmap(sourceImage, { resizeWidth: newW, resizeHeight: newH, resizeQuality: 'high' })
          .then((bitmap) => {
            if (loadId !== currentLoadIdRef.current) {
              bitmap.close();
              raster.remove();
              return;
            }
            const offscreen = document.createElement('canvas');
            offscreen.width = newW;
            offscreen.height = newH;
            const ctx = offscreen.getContext('2d');
            if (ctx) {
              ctx.drawImage(bitmap, 0, 0);
              bitmap.close();
              raster.image = offscreen;
            }
            requestAnimationFrame(finalizeRaster);
          })
          .catch(() => {
            if (loadId !== currentLoadIdRef.current) {
              raster.remove();
              return;
            }
            console.warn('[PaintEditor] createImageBitmap falhou no downsample, usando imagem original.');
            requestAnimationFrame(finalizeRaster);
          });
      } else {
        requestAnimationFrame(finalizeRaster);
      }
    };

    if (format === 'svg') {
      console.log('[PaintEditor] Buscando SVG...', initialUrl);
      decodeSvgUrl(initialUrl)
        .then((svgString) => {
          if (loadId !== currentLoadIdRef.current) {
            console.log('[PaintEditor] Carga SVG descartada (stale loadId)');
            return;
          }
          console.log('[PaintEditor] SVG decodificado, enviando para importSvgString');
          importSvgString(svgString, true);
        })
        .catch((err: any) => {
          if (loadId !== currentLoadIdRef.current) return;
          console.error('[PaintEditor] Erro ao carregar/decodificar SVG:', err);
          console.warn('[PaintEditor] Fallback para Raster devido a erro no SVG');
          const raster = new scope.Raster(initialUrl);
          if (initialUrl.startsWith('http') || initialUrl.startsWith('/')) {
            raster.crossOrigin = 'anonymous';
          }
          raster.onLoad = () => {
            if (loadId !== currentLoadIdRef.current) {
              raster.remove();
              return;
            }
            handleRasterLoad(raster, true);
          };
          raster.onError = () => {
            console.error('[PaintEditor] Erro fatal ao carregar imagem raster:', initialUrl);
          };
        });
    } else {
      const raster = new scope.Raster(initialUrl);
      if (initialUrl.startsWith('http') || initialUrl.startsWith('/')) {
        raster.crossOrigin = 'anonymous';
      }
      raster.onLoad = () => {
        if (loadId !== currentLoadIdRef.current) {
          raster.remove();
          return;
        }
        handleRasterLoad(raster, true);
      };
      raster.onError = () => {
        console.error('[PaintEditor] Erro fatal ao carregar imagem raster:', initialUrl);
      };
    }
  }, [
    scope,
    initialUrl,
    costumeId,
    importSvgString,
    isBackdrop,
    clearSelectionForCostumeSwitch,
    syncToContext,
    saveHistory,
    setInitialState,
    zoomToFit,
  ]);

  const handleFlip = useCallback(
    (axis: 'x' | 'y') => {
      if (!scope) return;

      const dl = scope.project.layers.find((l) => l.name === 'drawing') || scope.project.activeLayer;
      // Pega apenas os filhos diretos da camada de desenho que estão selecionados.
      // Isso é o mais seguro para evitar inversões duplas ou heranças estranhas do Paper.js.
      const selected = dl.children.filter((i) => i.selected && !i.locked && !(i as unknown as IPaintItem).guide);

      if (selected.length === 0) return;

      let totalBounds: paper.Rectangle | null = null;
      selected.forEach((item) => {
        if (!totalBounds) totalBounds = item.bounds.clone();
        else totalBounds = (totalBounds as paper.Rectangle).unite(item.bounds);
      });

      if (totalBounds) {
        const center = (totalBounds as paper.Rectangle).center;
        selected.forEach((item) => {
          item.scale(axis === 'x' ? -1 : 1, axis === 'y' ? -1 : 1, center);
        });
        saveHistory();
        notifyProjectChange();
      }
    },
    [scope, saveHistory, notifyProjectChange],
  );

  const handleGroup = useCallback(() => {
    if (!scope) return;
    const dl = scope.project.layers.find((l) => l.name === 'drawing') || scope.project.activeLayer;
    const selected = dl.children.filter((i) => i.selected && !i.locked && !(i as unknown as IPaintItem).guide);
    if (selected.length > 1) {
      new scope.Group(selected);
      saveHistory();
      notifyProjectChange();
    }
  }, [scope, saveHistory, notifyProjectChange]);

  const handleUngroup = useCallback(() => {
    if (!scope) return;
    const dl = scope.project.layers.find((l) => l.name === 'drawing') || scope.project.activeLayer;
    const itemsToUngroup = dl.children.filter((i) => i.selected && i instanceof scope.Group);
    let changed = false;

    itemsToUngroup.forEach((item) => {
      if (item instanceof scope.Group && item.parent) {
        const parent = item.parent;
        const index = item.index;
        const children = item.removeChildren();
        parent.insertChildren(index, children);
        children.forEach((c) => (c.selected = true));
        item.remove();
        changed = true;
      }
    });
    if (changed) {
      saveHistory();
      notifyProjectChange();
    }
  }, [scope, saveHistory, notifyProjectChange]);

  const handleLayering = useCallback(
    (action: 'front' | 'back' | 'forward' | 'backward') => {
      if (!scope) return;
      const dl = scope.project.layers.find((l) => l.name === 'drawing') || scope.project.activeLayer;
      const selected = dl.children.filter((i) => i.selected && !i.locked && !(i as unknown as IPaintItem).guide);
      if (selected.length === 0) return;

      selected.forEach((item) => {
        switch (action) {
          case 'front':
            item.bringToFront();
            break;
          case 'back':
            item.sendToBack();
            break;
          case 'forward': {
            const next = item.nextSibling;
            if (next) item.insertAbove(next);
            break;
          }
          case 'backward': {
            const prev = item.previousSibling;
            if (prev) item.insertBelow(prev);
            break;
          }
        }
      });
      saveHistory();
      notifyProjectChange();
    },
    [scope, saveHistory, notifyProjectChange],
  );

  const handleDelete = useCallback(() => {
    if (!scope) return;
    const dl = scope.project.layers.find((l) => l.name === 'drawing') || scope.project.activeLayer;
    const selected = dl.children.filter((i) => i.selected && !i.locked && !(i as unknown as IPaintItem).guide);
    if (selected.length > 0) {
      selected.forEach((item) => item.remove());
      saveHistory();
      notifyProjectChange();
    }
  }, [scope, saveHistory, notifyProjectChange]);

  const handleDuplicate = useCallback(() => {
    if (!scope) return;
    const dl = scope.project.layers.find((l) => l.name === 'drawing') || scope.project.activeLayer;
    const selected = dl.children.filter((i) => i.selected && !i.locked && !(i as unknown as IPaintItem).guide);
    if (selected.length > 0) {
      selected.forEach((item) => {
        const copy = item.copyTo(item.parent as paper.Group);
        copy.position = copy.position.add(new scope.Point(10, 10));
        copy.selected = true;
        item.selected = false;
      });
      saveHistory();
      notifyProjectChange();
    }
  }, [scope, saveHistory, notifyProjectChange]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (textInput.visible) return;

      // Delete / Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
        e.preventDefault();
        handleDelete();
      }

      // Undo / Redo
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
          notifyProjectChange();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, textInput.visible, handleDelete, notifyProjectChange]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden select-none text-slate-800 font-sans min-h-0">
      <Header
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={() => {
          undo();
          notifyProjectChange();
        }}
        onRedo={() => {
          redo();
          notifyProjectChange();
        }}
        onFlipHorizontal={() => handleFlip('x')}
        onFlipVertical={() => handleFlip('y')}
        onGroup={handleGroup}
        onUngroup={handleUngroup}
        onBringToFront={() => handleLayering('front')}
        onSendToBack={() => handleLayering('back')}
        onMoveForward={() => handleLayering('forward')}
        onMoveBackward={() => handleLayering('backward')}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
        fillColor={state.fillColor}
        strokeColor={state.strokeColor}
        strokeWidth={state.strokeWidth}
        brushSize={state.brushSize}
        fillTransparent={state.fillTransparent}
        strokeTransparent={state.strokeTransparent}
        fontFamily={state.fontFamily}
        fontSize={state.fontSize}
        activeToolId={activeToolId}
        onChangeState={(changes) => setState((s) => ({ ...s, ...changes }))}
      />

      <div className="flex flex-1 overflow-hidden min-h-0">
        <Toolbar activeToolId={activeToolId} onSelectTool={activateTool} />

        <CanvasView
          scope={scope}
          canvasRef={canvasRef}
          scrollPos={scrollPos}
          onScroll={updateScroll}
          textInput={textInput}
          setTextInputValue={(val) => setTextInput({ ...textInput, value: val })}
          onTextCommit={() => {
            if (textInput.point) commitText(textInput.value, textInput.point);
            setTextInput({ ...textInput, visible: false, value: '', point: null });
          }}
          zoom={zoom}
          onZoomIn={() => setZoom(zoom * 1.2)}
          onZoomOut={() => setZoom(zoom / 1.2)}
          onZoomToFit={zoomToFit}
        />
      </div>
    </div>
  );
};

export default PaintEditor;
