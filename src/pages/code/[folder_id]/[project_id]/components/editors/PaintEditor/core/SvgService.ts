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
  constructor(private scope: paper.PaperScope) {}

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

    // 🛡️ Oculta retângulos de suporte e limpa elementos indesejados
    const hiddenItems: paper.Item[] = [];
    const artboardCenter = new this.scope.Point(
      DRAWING_CONFIG.abX + DRAWING_CONFIG.artboard.w / 2,
      DRAWING_CONFIG.abY + DRAWING_CONFIG.artboard.h / 2,
    );

    [...dl.children].forEach((item) => {
      // Remove/Oculta marcadores internos e retângulos que cobrem o fundo
      if (item.name === 'PBT_BOUNDS_BOX' || (item as any).guide) {
        item.visible = false;
        hiddenItems.push(item);
      }

      // Especial: Se não for Backdrop, oculta retângulos que tenham exatamente o tamanho do artboard e sejam brancos/transparentes
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
      return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="${x} ${y} ${w} ${h}" width="${w}" height="${h}">${content}</svg>`;
    };

    // 1. Thumbnail Bounds: Sempre rente ao conteúdo
    let thumbBounds = dl.bounds.clone().expand(4);
    if (!thumbBounds || thumbBounds.width < 1 || thumbBounds.height < 1) {
      thumbBounds = new this.scope.Rectangle(artboardCenter.x - 1, artboardCenter.y - 1, 2, 2);
    }

    const exportOptions: IPaintExportOptions = {
      asString: true,
      match: (item: paper.Item) => {
        // Para o palco e miniatura, exportamos APENAS o que é visível para o usuário.
        // Isso evita que retângulos invisíveis de suporte (HACKs/GUIAs) interfiram 
        // no teste de colisão (hit-test) do palco.
        return item.visible && !item.locked && !(item as any).guide && item.name !== 'SCRATCH_BBOX_HACK' && item.name !== 'PBT_BOUNDS_BOX';
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

    // Restaura tudo
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
      // Remove máscaras de recorte que o Scratch às vezes gera e que atrapalham a edição
      const group = node as paper.Group;
      if (group.clipped && node.children.length > 0) {
        group.clipped = false;
        node.children[0].remove();
      }

      // Garante que as transformações (scale, rotate, translate) sejam aplicadas aos caminhos
      // Em paper.js, applyMatrix é uma propriedade de Item.
      (node as IPaintItem).applyMatrix = true;

      // HACK FIX: Scratch injects a 480x360 transparent rectangle to force costume bounds.
      // We must lock it so the SelectTool doesn't pick it up when clicking the canvas.
      if (node instanceof this.scope.Path.Rectangle || node instanceof this.scope.PathItem) {
        const b = node.bounds;
        if (Math.abs(b.width - DRAWING_CONFIG.artboard.w) < 2 && Math.abs(b.height - DRAWING_CONFIG.artboard.h) < 2) {
          const hasVisibleFill = node.fillColor && node.fillColor.alpha > 0.01;
          const hasVisibleStroke = node.strokeColor && node.strokeColor.alpha > 0.01;
          
          if (!hasVisibleFill && !hasVisibleStroke) {
            node.locked = true;
            (node as any).guide = true; // Força a ser ignorado pelo HitTest completamente
            node.name = 'SCRATCH_BBOX_HACK';
            node.visible = false;
          }
        }
      }

      // Recursividade para processar todos os filhos sem destruir grupos
      if (node.children && node.children.length > 0) {
        [...node.children].forEach((child) => processNode(child));
      }
    };

    processNode(importedNode);

    // Desagrupamento recursivo condicional: move itens para a camada de desenho
    // EXCETO se o grupo possuir um ID da nossa Whitelist de padronização.
    // DESCOMPRESSÃO DE HIERARQUIA (FLATTENING):
    // SVGs externos (especialmente do Scratch) costumam vir com dezenas de
    // grupos (<g>) aninhados desnecessariamente. Esta lógica recursiva
    // "achata" a hierarquia para que o usuário possa clicar e selecionar
    // caminhos individuais sem precisar "entrar" em 10 grupos.
    // Preservamos grupos apenas se tiverem IDs da whitelist (ex: 'eye', 'mouth').
    const flatten = (item: paper.Item) => {
      if (item instanceof this.scope.Group) {
        // Se for um grupo com ID padrão, preservamos ele como uma unidade
        if (item.name && SVG_ID_WHITELIST.includes(item.name)) {
          dl.addChild(item);
          return;
        }

        const children = [...item.children];
        children.forEach((child) => {
          // BAKED TRANSFORMATIONS:
          // Garante que a transformação do pai (scale/rotate) seja aplicada
          // permanentemente ao filho (baked) antes de movê-lo para a raiz.
          // Isso evita que o item "pule" ou mude de forma ao ser desagrupado.
          child.applyMatrix = true;
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

    // Caso o nó raiz importado fosse um grupo sem ID especial, ele agora está vazio ou deve ser removido
    if (importedNode instanceof this.scope.Group && (!importedNode.name || !SVG_ID_WHITELIST.includes(importedNode.name))) {
      importedNode.children.forEach((c) => dl.addChild(c));
      importedNode.remove();
    }
  }
}
