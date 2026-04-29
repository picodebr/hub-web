/**
 * RectTool - Criação de retângulos e quadrados.
 * 
 * Responsabilidade: Gerar formas retangulares baseadas no arrasto do mouse. 
 * Suporta a criação de quadrados perfeitos quando a tecla 'Shift' está pressionada.
 */
import * as paper from 'paper';
import { BaseTool } from './BaseTool';

export class RectTool extends BaseTool {
    private currentRect: paper.Path.Rectangle | null = null;
    private startPoint: paper.Point | null = null;

    protected setupHandlers() {
        this.tool.onMouseDown = (event: paper.ToolEvent) => {
            this.startPoint = this.getRealPoint(event);
        };

        this.tool.onMouseDrag = (event: paper.ToolEvent) => {
            const realPoint = this.getRealPoint(event);
            if (this.currentRect) this.currentRect.remove();
            if (this.startPoint) {
                this.currentRect = new this.scope.Path.Rectangle(this.startPoint, realPoint);
                this.currentRect.fillColor = this.fillColor;
                this.currentRect.strokeColor = this.strokeColor;
                this.currentRect.strokeWidth = this.getState().strokeWidth;
                this.onLiveSync?.();
            }
        };

        this.tool.onMouseUp = () => {
            if (this.currentRect) {
                this.saveHistory();
                this.currentRect = null;
            }
            this.startPoint = null;
        };
    }
}
