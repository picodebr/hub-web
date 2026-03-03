/**
 * CodeExecutor - Orquestrador de Sandbox (Isolamento).
 * 
 * Esta classe é o núcleo da segurança e execução do Palco. Ela:
 * 1. Cria um iframe oculto (sandbox) para cada ator.
 * 2. Injeta uma API de "proxy" dentro do iframe (move, say, turn) que se comunica com o pai.
 * 3. Executa código JavaScript gerado de forma assíncrona.
 * 4. Garante que erros no código de um ator não derrubem a aplicação principal.
 */
// app/lib/CodeExecutor.ts

export class CodeExecutor {
    public iframe: HTMLIFrameElement | null = null; // Agora pertence à instância!
    public spriteId: string; // Para sabermos quem é o dono

    // O Motor (pode ser static pois é constante)
    private static readonly RUNNER_HTML = `
        <!DOCTYPE html>
        <html>
        <body>
        <script>
            // --- SISTEMA DE COMUNICAÇÃO ASYNC ---
            function callParent(action, args) {
                return new Promise((resolve, reject) => {
                    const id = Math.random().toString(36).substr(2, 9);
                    const handler = (event) => {
                        if (event.data && event.data.type === 'ACTION_DONE' && event.data.requestId === id) {
                            window.removeEventListener('message', handler);
                            if (event.data.error) reject(new Error(event.data.error));
                            else resolve(event.data.result);
                        }
                    };
                    window.addEventListener('message', handler);
                    window.parent.postMessage({ type: 'SPRITE_ACTION', action, args, requestId: id }, '*');
                });
            }

            // --- API (Proxies) ---
            function move(steps) { return callParent('move', [steps]); }
            function turn(deg) { return callParent('turn', [deg]); }
            
            // Looks
            function say(text) { return callParent('say', [text]); }
            function sayFor(text, secs) { return callParent('sayFor', [text, secs]); }
            function think(text) { return callParent('think', [text]); }
            function thinkFor(text, secs) { return callParent('thinkFor', [text, secs]); }
            function switchCostume(id) { return callParent('switchCostume', [id]); }
            function nextCostume() { return callParent('switchCostume', ['NEXT']); }
            function switchBackdrop(id) { return callParent('switchBackdrop', [id]); }
            function nextBackdrop() { return callParent('switchBackdrop', ['NEXT']); }
            
            // Visibility & Size
            function setSize(size) { return callParent('setSize', [size]); } // NEW
            function changeSize(delta) { return callParent('changeSize', [delta]); } // NEW
            function show() { return callParent('show', []); } // NEW
            function hide() { return callParent('hide', []); } // NEW
            
            // Motion
            function wait(secs) { return callParent('wait', [secs]); }
            function goTo(x, y) { return callParent('goTo', [x, y]); }
            function setX(x) { return callParent('setX', [x]); }
            function setY(y) { return callParent('setY', [y]); }
            function addX(val) { return callParent('addX', [val]); }
            function addY(val) { return callParent('addY', [val]); }
            function goToMouse() { return callParent('goToMouse', []); }
            function pointToMouse() { return callParent('pointToMouse', []); }
            function pointInDirection(deg) { return callParent('pointInDirection', [deg]); }
            function bounceOnEdge() { return callParent('bounceOnEdge', []); }
            
            // --- OBJETOS GLOBAIS (Para compatibilidade com código gerado: sprite.move(), stage.wait()) ---
            const sprite = {
                move, turn, 
                say, sayFor, think, thinkFor,
                switchCostume, nextCostume, 
                setSize, changeSize, show, hide, // NEW
                goTo, setX, setY, addX, addY, 
                goToMouse, pointToMouse, pointInDirection, setAngle: pointInDirection, // ALIAS for setAngle
                bounceOnEdge,
            };
            
            const stage = {
                wait,
                switchBackdrop, nextBackdrop,
            };

            // --- ESCUTAR CODIGO ---
            window.addEventListener('message', async (event) => {
                if (event.data && event.data.type === 'EXECUTE') {
                    try {
                        const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
                        await new AsyncFunction('"use strict";' + event.data.code)();
                        window.parent.postMessage({ type: 'EXECUTION_DONE', requestId: event.data.requestId }, '*');
                    } catch (e) {
                        window.parent.postMessage({ type: 'RUNTIME_ERROR', message: e.message, requestId: event.data.requestId }, '*');
                    }
                }
            });
        </script>
        </body>
        </html>
    `;

    constructor(spriteId: string) {
        this.spriteId = spriteId;
    }

    init() {
        if (typeof window === 'undefined') return;
        if (this.iframe) return;

        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.sandbox.add('allow-scripts');
        document.body.appendChild(iframe);
        this.iframe = iframe;

        // Debug ID
        iframe.id = 'sandbox-' + this.spriteId;

        // Injeta o motor
        iframe.srcdoc = CodeExecutor.RUNNER_HTML;
    }

    run(code: string): Promise<void> {
        if (!this.iframe) this.init();

        return new Promise((resolve, reject) => {
            const requestId = Math.random().toString(36).substr(2, 9);

            const handler = (event: MessageEvent) => {
                if (!event.data) return;

                // Filter by type and request ID (if possible, or just assume sequential for now)
                // For simplified single-thread per sprite:
                if (event.data.type === 'EXECUTION_DONE' && event.data.requestId === requestId) {
                    window.removeEventListener('message', handler);
                    resolve();
                } else if (event.data.type === 'RUNTIME_ERROR' && event.data.requestId === requestId) {
                    window.removeEventListener('message', handler);
                    // Log error but maybe don't reject main promise to not crash UI?
                    // Better to reject so caller knows.
                    reject(new Error(event.data.message));
                }
            };

            window.addEventListener('message', handler);

            setTimeout(() => {
                this.iframe?.contentWindow?.postMessage({ type: 'EXECUTE', code, requestId }, '*');
            }, 10);
        });
    }

    dispose() {
        if (this.iframe) {
            document.body.removeChild(this.iframe);
            this.iframe = null;
        }
    }
}