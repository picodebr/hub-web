import { BaseTool } from './BaseTool';
import { IPaintItem } from '@/_base/domain/entities/IPaintEditor';

export class EraserTool extends BaseTool {
  private lastCursorSize: number = 0;
  private cursorUrl: string | null = null;

  private updateCursorPattern() {
    if (!this.scope.view || !this.scope.view.element) return;

    const size = this.getState().brushSize;
    const zoom = this.scope.view.zoom;
    // Tamanho do cursor em pixels reais de tela
    const canvasSize = Math.max(4, Math.round(size * zoom));

    // Só recria a imagem se o tamanho renderizado mudar
    if (this.lastCursorSize === canvasSize) return;
    this.lastCursorSize = canvasSize;

    if (this.cursorUrl) {
      URL.revokeObjectURL(this.cursorUrl);
    }

    const r = canvasSize / 2 - 0.5;
    const c = canvasSize / 2;

    // Círculo SVG que serve de cursor (com borda pra não sumir em fundos brancos e pretos)
    const svg = `<svg width="${canvasSize}" height="${canvasSize}" xmlns="http://www.w3.org/2000/svg">
            <circle cx="${c}" cy="${c}" r="${r > 0 ? r : 1}" fill="rgba(80,80,80,0.15)" stroke="rgba(0,0,0,0.8)" stroke-width="1.5" />
            <circle cx="${c}" cy="${c}" r="${r > 0 ? r : 1}" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="0.5" />
        </svg>`;

    const blob = new Blob([svg], { type: 'image/svg+xml' });
    this.cursorUrl = URL.createObjectURL(blob);

    // O hotspot do cursor fica exatamente no centro c, c. Usamos setProperty com important para destruir os do Tailwind
    this.scope.view.element.style.setProperty('cursor', `url(${this.cursorUrl}) ${c} ${c}, crosshair`, 'important');
  }

  protected setupHandlers() {
    this.tool.onMouseMove = () => {
      this.updateCursorPattern();
    };

    this.tool.onMouseDown = (event: paper.ToolEvent) => {
      const realPoint = this.getRealPoint(event);
      this.updateCursorPattern();
      this.eraseAt(realPoint);
    };

    this.tool.onMouseDrag = (event: paper.ToolEvent) => {
      const realPoint = this.getRealPoint(event);
      this.eraseAt(realPoint);
      this.onLiveSync?.();
    };

    this.tool.onMouseUp = () => {
      this.saveHistory();
    };
  }

  private eraseAt(point: paper.Point) {
    const size = this.getState().brushSize;
    const dl = this.drawingLayer;

    // O círculo matemático usado APENAS para os cálculos.
    // Paper.js muitas vezes requer `insert: true` para booleanos, então criamos invisível.
    const mathCircle = new this.scope.Path.Circle({
      center: point,
      radius: size / 2,
      insert: true, // Necessário no core do paper.js pra path intersections em alguns casos
      parent: dl,
      visible: false, // Invisível
    }) as IPaintItem;
    mathCircle.guide = true;

    try {
      // Cópia estática dos filhos da camada de desenho atual
      const children = [...dl.children];

      const recursiveErase = (item: IPaintItem) => {
        // Ignora todos os guides (inclusive o mathCircle), itens travados e nulos
        if (!item || item.guide || item === mathCircle) return;
        if (item.locked) return;

        if (item instanceof this.scope.Group) {
          const groupChildren = [...item.children];
          groupChildren.forEach((child) => recursiveErase(child));

          // Se o grupo ficar vazio após secagem, remove.
          if (item.children.length === 0) item.remove();
        } else if (item instanceof this.scope.PathItem) {
          // Check bounding box antes de arriscar booleano custoso
          if (item.bounds.intersects(mathCircle.bounds) || mathCircle.isInside(item.bounds)) {
            try {
              // Operação booleana de cortar (insert: false no resultado pra não suplantar do nada)
              const result = item.subtract(mathCircle as unknown as paper.PathItem, { insert: false });

              if (result) {
                // Se o resultado for uma forma totalmente vazia ou corrompida, apagamos
                if (result instanceof this.scope.Path && result.segments.length === 0) {
                  item.remove();
                } else if (result.bounds.width === 0 || result.bounds.height === 0) {
                  item.remove();
                } else if (result !== item) {
                  // A forma foi alterada! Substituimos o item velho pelo cortado
                  item.replaceWith(result);
                  result.selected = item.selected;
                }
              } else {
                // result null indica que a forma foi integralmente subtraída/limpa
                item.remove();
              }
            } catch (err) {
              // Formas aberrantes causam crash no paper, ignoramos
              console.warn('Falha matemática no Paper.js:', err);
            }
          }
        } else if (item instanceof this.scope.Raster) {
          // Bitmap erase
          if (item.bounds.intersects(mathCircle.bounds) || mathCircle.isInside(item.bounds)) {
            const ctx = item.context;
            if (ctx) {
              ctx.save();
              const matrix = item.matrix.inverted();
              ctx.setTransform(matrix.a, matrix.c, matrix.b, matrix.d, matrix.tx + item.size.width / 2, matrix.ty + item.size.height / 2);
              ctx.globalCompositeOperation = 'destination-out';
              ctx.beginPath();
              ctx.arc(point.x, point.y, size / 2, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();

              (item as IPaintItem)._canvasDirty = true;
              item.image = item.canvas;
            }
          }
        }
      };

      // Processa todos da raiz do grupo de desenho
      children.forEach((item) => recursiveErase(item));
    } finally {
      // GARANTIA ABSOLUTA: remove o molde matemático IMEDIATAMENTE.
      mathCircle.remove();
    }
  }

  activate() {
    super.activate();
    this.lastCursorSize = 0; // Força recriar
    this.updateCursorPattern();
  }

  deactivate() {
    if (this.scope.view && this.scope.view.element) {
      this.scope.view.element.style.setProperty('cursor', 'crosshair', 'important');
    }
    if (this.cursorUrl) {
      URL.revokeObjectURL(this.cursorUrl);
      this.cursorUrl = null;
    }
    this.lastCursorSize = 0;
  }
}
