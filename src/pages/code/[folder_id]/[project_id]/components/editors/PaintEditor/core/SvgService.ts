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

    let thumbnailSvg = '';
    try {
      const thumbInner = dl.exportSVG({ asString: true } as IPaintExportOptions) as string;
      thumbnailSvg = buildFullSvg(thumbInner, thumbBounds);
    } catch (e) {
      console.error('Erro ao exportar SVG para thumbnail:', e);
      thumbnailSvg = '';
    }

    // 2. Stage SVG:
    // Se for Backdrop: 480x360 estático.
    // Se for Sprite: Crop simétrico em relação ao centro do Artboard.
    // Isso garante que o centro (0,0) do Ator continue no centro do desenho,
    // mas o 'bounding box' seja o menor possível para os balões e sensores.
    let stageBounds: paper.Rectangle;

    if (options?.isBackdrop) {
      stageBounds = new this.scope.Rectangle(DRAWING_CONFIG.abX, DRAWING_CONFIG.abY, DRAWING_CONFIG.artboard.w, DRAWING_CONFIG.artboard.h);
    } else {
      // Calcula o bounding box REAL apenas dos elementos de desenho (pula guias e invisíveis)
      let contentBounds: paper.Rectangle | null = null;
      dl.children.forEach((item) => {
        if (item.visible && !item.locked && !(item as any).guide && item.name !== 'PBT_BOUNDS_BOX') {
          if (!contentBounds) contentBounds = item.bounds.clone();
          else contentBounds = contentBounds.unite(item.bounds);
        }
      });

      if (!contentBounds) {
        // Caso vazio, exporta um pequeno box central
        stageBounds = new this.scope.Rectangle(artboardCenter.x - 1, artboardCenter.y - 1, 2, 2);
      } else {
        const cb = contentBounds as paper.Rectangle;
        // Calcula a distância máxima do centro do artboard até os limites do conteúdo
        const dx = Math.max(Math.abs(cb.left - artboardCenter.x), Math.abs(cb.right - artboardCenter.x));
        const dy = Math.max(Math.abs(cb.top - artboardCenter.y), Math.abs(cb.bottom - artboardCenter.y));

        // Cria um retângulo simétrico para manter o centro do Artboard como centro do SVG (Rotation Center)
        const sizeX = Math.ceil(dx * 2 + 4);
        const sizeY = Math.ceil(dy * 2 + 4);
        stageBounds = new this.scope.Rectangle(artboardCenter.x - sizeX / 2, artboardCenter.y - sizeY / 2, sizeX, sizeY);
      }
    }
    let stageSvg = '';
    try {
      const stageInner = dl.exportSVG({ asString: true } as IPaintExportOptions) as string;
      stageSvg = buildFullSvg(stageInner, stageBounds);
    } catch (e) {
      console.error('Erro ao exportar SVG para stage:', e);
      stageSvg = '';
    }

    // Restaura tudo
    hiddenItems.forEach((i) => (i.visible = true));

    if (wasClipped && clipMask) {
      dl.insertChild(0, clipMask);
      dl.clipped = true;
    }

    const dl_again = project.layers.find((l) => l.name === 'drawing');
    if (dl_again) dl_again.activate();

    return { thumbnailSvg, stageSvg };
  }

  /**
   * Prepara um SVG importado para edição no canvas.
   * Preserva a hierarquia de grupos enquanto garante que as transformações sejam aplicadas.
   */
  releaseSVG(importedNode: paper.Item) {
    const project = this.scope.project;
    if (!importedNode || !project) return;

    // Encontra a camada de desenho
    const dl = project.layers.find((l) => l.name === 'drawing') || project.activeLayer;

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
