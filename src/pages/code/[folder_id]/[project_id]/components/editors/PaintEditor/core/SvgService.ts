/**
 * SvgService - Motor de serialização e normalização SVG.
 *
 * Responsabilidade: Traduzir objetos vetoriais do Paper.js para strings SVG limpas,
 * cuidando de viewBox, clipping de artboard e compatibilidade com o Scratch.
 * Além disso, limpa SVGs importados para garantir que não contenham lixo
 * (como guias internas) e que a hierarquia de camadas seja editável.
 */
import { IPaintExportOptions, IPaintItem } from '@/_base/domain/entities/IPaintEditor';
import { DRAWING_CONFIG, SVG_ID_WHITELIST } from '../constants';

export class SvgService {
  constructor(private scope: paper.PaperScope) { }

  /**
   * Exporta o desenho como SVG para miniatura e para o palco.
   *
   * Diferenciação de ViewBox:
   * - thumbnailSvg: ViewBox dinâmico (apenas o conteúdo), usado para ícones.
   * - stageSvg: ViewBox estático (480x360), garantindo que o personagem
   * apareça no palco exatamente onde foi desenhado no editor.
   */
  exportDrawingSVG(options?: { isBackdrop?: boolean }): { thumbnailSvg: string; stageSvg: string } {
    const project = this.scope.project;
    if (!project) return { thumbnailSvg: '', stageSvg: '' };

    const dl = project.layers.find((l) => l.name === 'drawing') || project.activeLayer;

    const artboardCenter = new this.scope.Point(
      DRAWING_CONFIG.abX + DRAWING_CONFIG.artboard.w / 2,
      DRAWING_CONFIG.abY + DRAWING_CONFIG.artboard.h / 2,
    );

    // 1. Thumbnail Bounds: computed BEFORE any visibility changes so that
    // guide items (PBT_BOUNDS_BOX, SCRATCH_BBOX_HACK) — which are always invisible —
    // never inflate dl.bounds into artboard dimensions.
    let thumbBounds = dl.bounds.clone().expand(4);
    if (!thumbBounds || thumbBounds.width < 1 || thumbBounds.height < 1) {
      thumbBounds = new this.scope.Rectangle(artboardCenter.x - 1, artboardCenter.y - 1, 2, 2);
    }

    // Hide only VISIBLE guide/artboard items for the export, and track them for restoration.
    // Items already invisible (PBT_BOUNDS_BOX, SCRATCH_BBOX_HACK) are skipped entirely so
    // that restoration never accidentally makes them visible again.
    const hiddenItems: paper.Item[] = [];

    [...dl.children].forEach((item) => {
      if (item.name === 'PBT_BOUNDS_BOX') return;
      if (!item.visible) return;

      if ((item as any).guide) {
        item.visible = false;
        hiddenItems.push(item);
        return;
      }

      // Oculta retângulos que tenham exatamente o tamanho do artboard (ex: fundo branco de Backdrop)
      if (!options?.isBackdrop && item instanceof this.scope.Path.Rectangle) {
        const b = item.bounds;
        if (Math.abs(b.width - DRAWING_CONFIG.artboard.w) < 2 && Math.abs(b.height - DRAWING_CONFIG.artboard.h) < 2) {
          item.visible = false;
          hiddenItems.push(item);
        }
      }
    });

    const wasClipped = dl.clipped;
    const clipMask = dl.firstChild;
    if (wasClipped && clipMask) {
      dl.clipped = false;
      clipMask.remove();
    }

    const buildFullSvg = (content: string, bounds: paper.Rectangle) => {
      const w = bounds.width.toFixed(2);
      const h = bounds.height.toFixed(2);
      const x = bounds.x.toFixed(2);
      const y = bounds.y.toFixed(2);
      return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="${w}" height="${h}" viewBox="${x} ${y} ${w} ${h}">${content}</svg>`;
    };

    const exportOptions: IPaintExportOptions = {
      asString: true,
      match: (item: paper.Item) => {
        // SEMPRE exportamos o PBT_BOUNDS_BOX. Ele é invisível, então não interfere no jogo,
        // mas é vital para o editor saber a posição real do palco ao re-abrir o arquivo.
        if (item.name === 'PBT_BOUNDS_BOX') return true;

        // Para o palco e miniatura, exportamos apenas o que é visível para o usuário.
        return item.visible && !item.locked && !(item as any).guide && item.name !== 'SCRATCH_BBOX_HACK';
      }
    };

    let thumbnailSvg = '';
    try {
      // 🛡️ FIX: paper.js exportSVG can throw SecurityError if there's a tainted canvas
      const thumbInner = dl.exportSVG(exportOptions) as string;
      thumbnailSvg = buildFullSvg(thumbInner, thumbBounds);
    } catch (e) {
      console.warn('[SvgService] Fallback: Could not export thumbnail SVG due to security/taint constraints.', e);
      thumbnailSvg = ''; // Fallback: A UI mostrará um placeholder ou a última imagem válida
    }

    // 2. Stage SVG:
    // Sempre exportamos no tamanho do artboard (480x360) para garantir mapeamento 1:1 com o palco.
    // Isso evita que o ator mude de tamanho ou estique dependendo da sua posição no editor.
    const stageBounds = new this.scope.Rectangle(
      DRAWING_CONFIG.abX,
      DRAWING_CONFIG.abY,
      DRAWING_CONFIG.artboard.w,
      DRAWING_CONFIG.artboard.h,
    );
    let stageSvg = '';
    try {
      const stageInner = dl.exportSVG(exportOptions) as string;
      stageSvg = buildFullSvg(stageInner, stageBounds);
    } catch (e) {
      console.error('[SvgService] Critical: Could not export stage SVG.', e);
      stageSvg = '';
    }

    // Restaura apenas os itens que foram ocultados para o export
    hiddenItems.forEach((i) => (i.visible = true));

    if (wasClipped && clipMask) {
      dl.insertChild(0, clipMask);
      dl.clipped = true;
    }

    const projectLayer = project.layers.find((l) => l.name === 'drawing');
    if (projectLayer) projectLayer.activate();

    return { thumbnailSvg, stageSvg };
  }

  /**
   * Prepara um SVG importado para edição no canvas.
   * Preserva a hierarquia de grupos enquanto garante que as transformações sejam aplicadas.
   */
  releaseSVG(importedNode: paper.Item) {
    const project = this.scope.project;
    if (!importedNode || !project) return;

    console.log('[SvgService] Iniciando releaseSVG para o nó:', importedNode.name || 'Group', importedNode);

    // Encontra a camada de desenho
    const dl = project.layers.find((l) => l.name === 'drawing') || project.activeLayer;
    console.log('[SvgService] Camada de destino (drawing):', dl.name, dl);

    const processNode = (node: paper.Item) => {
      // 1. "FRITAR" TRANSFORMAÇÕES (Baking): 
      // Aplicamos apenas em VETORES. Para Rasters (PNG/JPG), mantemos a matriz
      // para evitar problemas de re-pixelização e perda de qualidade.
      if (!(node instanceof this.scope.Raster)) {
        (node as IPaintItem).applyMatrix = true;
      }

      // 2. GRADIENTES -> CORES SÓLIDAS:
      if (node.fillColor && (node.fillColor as any).gradient) {
        const grad = (node.fillColor as any);
        if (grad.stops && grad.stops.length > 0) {
          node.fillColor = grad.stops[0].color;
        }
      }
      if (node.strokeColor && (node.strokeColor as any).gradient) {
        const grad = (node.strokeColor as any);
        if (grad.stops && grad.stops.length > 0) {
          node.strokeColor = grad.stops[0].color;
        }
      }

      // 3. REMOVER MÁSCARAS E CLIPPATHS:
      // O Scratch não suporta máscaras vetoriais complexas.
      const group = node as paper.Group;
      if (group.clipped && node.children.length > 0) {
        group.clipped = false;
        node.children[0].remove(); // Remove o item que servia de máscara
      }

      // 4. LIMPEZA DE FILTROS E EFEITOS:
      node.shadowColor = null; // Scratch não suporta drop-shadows vetoriais
      node.blendMode = 'normal'; // Garante compatibilidade total

      // HACK FIX: Scratch artboard bounds marker
      if (node instanceof this.scope.Path.Rectangle || node instanceof this.scope.PathItem) {
        const b = node.bounds;
        if (Math.abs(b.width - DRAWING_CONFIG.artboard.w) < 2 && Math.abs(b.height - DRAWING_CONFIG.artboard.h) < 2) {
          const hasVisibleFill = node.fillColor && node.fillColor.alpha > 0.01;
          const hasVisibleStroke = node.strokeColor && node.strokeColor.alpha > 0.01;
          if (!hasVisibleFill && !hasVisibleStroke) {
            node.locked = true;
            (node as any).guide = true;
            node.name = 'SCRATCH_BBOX_HACK';
            node.visible = false;
          }
        }
      }

      // Recursividade
      if (node.children && node.children.length > 0) {
        [...node.children].forEach((child) => processNode(child));
      }
    };

    processNode(importedNode);

    // Desagrupamento e Baking Final
    const flatten = (item: paper.Item) => {
      // Garante que transformações do pai foram "fritas" no filho antes de desagrupar (apenas para vetores)
      if (!(item instanceof this.scope.Raster)) {
        item.applyMatrix = true;
      }
      if (item instanceof this.scope.Group) {
        if (item.name && SVG_ID_WHITELIST.includes(item.name)) {
          dl.addChild(item);
          return;
        }
        const children = [...item.children];
        children.forEach((child) => {
          if (!(child instanceof this.scope.Raster)) {
            child.applyMatrix = true;
          }
          flatten(child);
        });
        if (item !== importedNode) {
          item.children.forEach((c) => dl.addChild(c));
          item.remove();
        }
      } else {
        dl.addChild(item);
      }
    };

    flatten(importedNode);

    if (importedNode instanceof this.scope.Group && (!importedNode.name || !SVG_ID_WHITELIST.includes(importedNode.name))) {
      importedNode.children.forEach((c) => dl.addChild(c));
      importedNode.remove();
    }

    // Após processar tudo, forçamos uma atualização de matrizes em toda a camada (apenas vetores)
    dl.applyMatrix = true;
    dl.children.forEach(c => {
      if (!(c instanceof this.scope.Raster)) {
        c.applyMatrix = true;
      }
    });
  }

  /**
   * Converte um item (ou grupo) em um Bitmap (Raster) de alta resolução.
   * Útil para fallback quando o SVG é complexo demais para ser vetorizado no Scratch.
   */
  rasterizeItem(item: paper.Item): paper.Raster {
    // No Paper.js, passamos a resolução dentro de um objeto de opções
    const raster = item.rasterize({ resolution: 300 }); 
    item.remove();
    return raster;
  }
}
