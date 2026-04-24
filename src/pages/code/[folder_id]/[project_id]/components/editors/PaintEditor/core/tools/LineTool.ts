/**
 * LineTool - Desenho de segmentos de reta.
 * 
 * Responsabilidade: Criar linhas retas simples. Trava o ângulo em incrementos 
 * de 45 graus quando o 'Shift' é utilizado (Orthogonal constraint).
 */
import * as paper from 'paper';
import { BaseTool } from './BaseTool';

export class LineTool extends BaseTool {
    private currentLine: paper.Path.Line | null = null;
    private startPoint: paper.Point | null = null;

    protected setupHandlers() {
        this.tool.onMouseDown = (event: paper.ToolEvent) => {
            this.startPoint = this.getRealPoint(event);
        };

        this.tool.onMouseDrag = (event: paper.ToolEvent) => {
            const realPoint = this.getRealPoint(event);
            if (this.currentLine) this.currentLine.remove();
            if (this.startPoint) {
                this.currentLine = new this.scope.Path.Line(this.startPoint, realPoint);
                this.currentLine.strokeColor = this.strokeColor;
                this.currentLine.strokeWidth = this.getState().strokeWidth;
                this.currentLine.strokeCap = 'round';
                this.onLiveSync?.();
            }
        };

        this.tool.onMouseUp = () => {
            if (this.currentLine) {
                this.saveHistory();
                this.currentLine = null;
            }
            this.startPoint = null;
        };
    }
}
