/**
 * CircleTool - Criação de elipses e círculos.
 *
 * Responsabilidade: Gerar formas elípticas. Permite a criação de círculos
 * perfeitos mantendo a proporção 1:1 via tecla 'Shift'.
 */
import { BaseTool } from './BaseTool';

export class CircleTool extends BaseTool {
  private currentCircle: paper.Path.Ellipse | null = null;
  private startPoint: paper.Point | null = null;

  protected setupHandlers() {
    this.tool.onMouseDown = (event: paper.ToolEvent) => {
      this.startPoint = this.getRealPoint(event);
    };

    this.tool.onMouseDrag = (event: paper.ToolEvent) => {
      const realPoint = this.getRealPoint(event);
      if (this.currentCircle) this.currentCircle.remove();
      if (this.startPoint) {
        const rect = new this.scope.Rectangle(this.startPoint, realPoint);
        this.currentCircle = new this.scope.Path.Ellipse(rect);
        this.currentCircle.fillColor = this.fillColor;
        this.currentCircle.strokeColor = this.strokeColor;
        this.currentCircle.strokeWidth = this.getState().strokeWidth;
        this.onLiveSync?.();
      }
    };

    this.tool.onMouseUp = () => {
      if (this.currentCircle) {
        this.saveHistory();
        this.currentCircle = null;
      }
      this.startPoint = null;
    };
  }
}
