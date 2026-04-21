/**
 * BrowserFileSystem - Ponte para manipulação de arquivos e mídia no navegador.
 * 
 * Responsabilidade: Fornecer métodos utilitários para leitura, redimensionamento 
 * e conversão de imagens para formatos compatíveis com o motor de simulação (DataURLs). 
 * Abstrai o processamento de Canvas para otimização de performance visual.
 */
const MAX_FILE_SIZE_MB = 10; // Aumentado para 10MB para permitir processamento de originais em alta resolução
const MAX_SPRITE_DIMENSION = 2048;
const MAX_BACKDROP_DIMENSION = 2048;

export class BrowserFileSystem {
    /**
     * Lê um arquivo como Data URL (Base64).
     */
    public static async readFileAsDataURL(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                resolve(result);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    /**
     * Processa um arquivo (SVG ou Bitmap) com limites de tamanho e redimensionamento.
     */
    public static async processFile(file: File, isBackdrop: boolean = false): Promise<string> {
        // 1. Validação básica de tamanho (10MB)
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            throw new Error(`O arquivo é muito grande! O limite é de ${MAX_FILE_SIZE_MB}MB.`);
        }

        // 2. Trata SVG: Lê diretamente como DataURL
        if (file.type === 'image/svg+xml') {
            return this.readFileAsDataURL(file);
        }

        const maxDim = isBackdrop ? MAX_BACKDROP_DIMENSION : MAX_SPRITE_DIMENSION;

        // 3. Trata Bitmaps: Carrega e redimensiona se necessário
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    let { width, height } = img;

                    // Se a imagem já estiver dentro dos limites, retorna a original sem re-encoding
                    if (width <= maxDim && height <= maxDim) {
                        resolve(e.target?.result as string);
                        return;
                    }

                    // Redimensiona se alguma dimensão exceder o limite
                    const ratio = Math.min(maxDim / width, maxDim / height);
                    width *= ratio;
                    height *= ratio;

                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        resolve(e.target?.result as string); // Fallback para o original
                        return;
                    }

                    // Aplica um smoothing de alta qualidade para o redimensionamento
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(img, 0, 0, width, height);

                    // Exporta no tipo original ou PNG se desconhecido
                    const type = file.type || 'image/png';
                    // Qualidade 0.95 para manter excelente qualidade visual
                    const dataUrl = canvas.toDataURL(type, 0.95);
                    resolve(dataUrl);
                };
                img.onerror = reject;
                img.src = e.target?.result as string;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
}
