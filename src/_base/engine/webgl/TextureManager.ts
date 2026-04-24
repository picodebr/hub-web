/**
 * TextureManager.ts
 * Gerenciador de texturas WebGL para as fantasias do PiCode.
 */

export class TextureManager {
    private gl: WebGL2RenderingContext;
    private textureCache = new Map<string, { tex: WebGLTexture, width: number, height: number }>();
    private pendingHires = new Map<string, Promise<{ tex: WebGLTexture, width: number, height: number }>>();

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
    }

    /**
     * Remove tudo do cache (usado quando fechamos um projeto)
     */
    clearCache() {
        for (const entry of this.textureCache.values()) {
            this.gl.deleteTexture(entry.tex);
        }
        this.textureCache.clear();
        this.pendingHires.clear();
    }

    /**
     * Retorna a textura de forma síncrona.
     * Use APENAS se tiver certeza que ela já foi pre-carregada.
     */
    getTextureSync(url: string | null): { tex: WebGLTexture, width: number, height: number } | null {
        if (!url) return null;
        return this.textureCache.get(url) || null;
    }

    /**
     * Inicia o carregamento de uma textura em background (fire-and-forget).
     * Não bloqueia - use no render loop para garantir que texturas estejam
     * disponíveis nos próximos frames sem pausar o frame atual.
     */
    startLoading(url: string | null): void {
        if (!url || url === '/img/empty.png') return;
        if (this.textureCache.has(url) || this.pendingHires.has(url)) return;
        // Dispara o carregamento sem await - o cache será populado quando terminar
        this.loadTexture(url).catch(() => {/* silencia erros de textura em background */});
    }

    /**
     * Carrega uma imagem de forma assíncrona, faz upload pra GPU e a retorna.
     * Compatível com base64, URLs externas e SVGs (rasteriza antes).
     */
    async loadTexture(url: string | null): Promise<{ tex: WebGLTexture | null, width: number, height: number }> {
        if (!url) return { tex: null, width: 0, height: 0 };
        if (url === '/img/empty.png') return { tex: null, width: 0, height: 0 }; // Evitar baixar dummy images constantemente, a n?o ser q seja requerido

        // Se já tá em cache, maravilha
        if (this.textureCache.has(url)) {
            return this.textureCache.get(url)!;
        }

        // Se já está na fila de download, espere
        if (this.pendingHires.has(url)) {
            return this.pendingHires.get(url)!;
        }

        const promise = new Promise<{ tex: WebGLTexture, width: number, height: number }>((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous'; // Para CORS
            
            img.onload = () => {
                let sourceToUpload: HTMLImageElement | HTMLCanvasElement = img;

                // Rasterização de SVGs. WebGL nao carrega vetor, então desenhamos no canvas para rasterizar
                if (url.includes('.svg') || url.startsWith('data:image/svg+xml')) {
                    const canvas = document.createElement('canvas');
                    
                    // Fator de escala agressivo para garantir nitidez dos vetores
                    // em alta resolução (ex. em tela cheia)
                    const dpr = window.devicePixelRatio || 1;
                    const upscale = dpr * 2.5; // Aproximadamente o nível de oversampling do Scratch 3
                    
                    canvas.width = img.width * upscale;
                    canvas.height = img.height * upscale;
                    
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.imageSmoothingEnabled = true;
                        ctx.imageSmoothingQuality = 'high';
                        ctx.scale(upscale, upscale);
                        // Desenha usando o tamanho original, o scale do contexto cuida da alta resolução
                        ctx.drawImage(img, 0, 0, img.width, img.height);
                        sourceToUpload = canvas;
                    }
                }

                const tex = this.gl.createTexture();
                if (!tex) {
                    reject("Falha ao criar WebGLTexture.");
                    return;
                }

                this.gl.bindTexture(this.gl.TEXTURE_2D, tex);
                
                // FlipY = true para imagens ficarem corretas (WebGL lê de baixo pra cima)
                this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, 1);
                
                this.gl.texImage2D(
                    this.gl.TEXTURE_2D, 
                    0, 
                    this.gl.RGBA, 
                    this.gl.RGBA, 
                    this.gl.UNSIGNED_BYTE, 
                    sourceToUpload
                );

                // Configuração padrão para spritesheet (Clamp to Edge e Nearest ou Linear)
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
                
                // LinearFilter gera bordas borradas, Nearest gera bordas sharp no zoom
                // Scratch usa Linear + Mipmaps as vezes, usaremos Linear
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);

                const result = { tex, width: img.naturalWidth || img.width, height: img.naturalHeight || img.height };
                this.textureCache.set(url, result);
                this.pendingHires.delete(url);
                resolve(result);
            };

            img.onerror = () => {
                this.pendingHires.delete(url);
                reject(new Error(`Failed to load image: ${url}`));
            };

            img.src = url;
        });

        this.pendingHires.set(url, promise);
        return promise;
    }
}
