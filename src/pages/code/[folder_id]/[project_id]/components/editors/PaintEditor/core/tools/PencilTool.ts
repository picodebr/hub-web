/**
 * PencilTool - Ferramenta de desenho livre (Lápis).
 * 
 * Responsabilidade: Gerar caminhos (Paths) baseados no rastro do mouse, 
 * aplicar suavização (Smoothing) para evitar serrilhados e fechar 
 * automaticamente o caminho se as extremidades estiverem próximas, 
 * facilitando o preenchimento posterior.
 */
import * as paper from 'paper';
import { BaseTool } from './BaseTool';

export class PencilTool extends BaseTool {
    private currentPath: paper.Path | null = null;

    protected setupHandlers() {
        this.tool.onMouseDown = (event: paper.ToolEvent) => {
            const realPoint = this.getRealPoint(event);
            this.currentPath = new this.scope.Path();
            this.currentPath.strokeColor = this.strokeColor;
            this.currentPath.strokeWidth = this.getState().strokeWidth;
            this.currentPath.strokeCap = 'round';
            this.currentPath.strokeJoin = 'round';
            this.currentPath.add(realPoint);
        };

        this.tool.onMouseDrag = (event: paper.ToolEvent) => {
            const realPoint = this.getRealPoint(event);
            if (this.currentPath) {
                this.currentPath.add(realPoint);
                this.onLiveSync?.();
            }
        };

        this.tool.onMouseUp = () => {
            if (this.currentPath) {
                if (this.currentPath.segments.length > 3) {
                    const first = this.currentPath.firstSegment.point;
                    const last = this.currentPath.lastSegment.point;
                    const dist = first.getDistance(last);

                    const threshold = this.toProjectSize(25);

                    if (dist < threshold) {
                        this.currentPath.closed = true;
                        // O SEGREDO: Definimos um preenchimento com Alpha 0 (quase transparente)
                        // Isso faz com que o Paper.js detecte o "interior" no hitTest,
                        // permitindo que o balde de tinta funcione ao clicar dentro.
                        this.currentPath.fillColor = new this.scope.Color(0, 0, 0, 0.00001);
                        this.currentPath.lastSegment.point = this.currentPath.firstSegment.point;
                    }
                }

                this.currentPath.simplify(1);
                this.currentPath.smooth({ type: 'catmull-rom', factor: 0.5 });
                this.saveHistory();
                this.currentPath = null;
            }
        };
    }
}
