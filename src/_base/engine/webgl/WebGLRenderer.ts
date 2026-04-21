import { Math3D } from './Math3D';
import { VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE, ShaderManager } from './Shaders';
import { TextureManager } from './TextureManager';
import { SpriteData } from '@/_base/domain/entities';

interface SpriteRenderData extends SpriteData {
  // Extensões de cache
  _realWidth?: number;
  _realHeight?: number;
}

export class WebGLRenderer {
  private gl: WebGL2RenderingContext;
  private canvas: HTMLCanvasElement;
  public textureManager: TextureManager;

  private program: WebGLProgram;
  private vao: WebGLVertexArrayObject | null = null;

  // Matrizes
  private projMatrix: Float32Array;

  // Buffer da Geometria (Quad)
  private vertexBuffer: WebGLBuffer | null = null;
  private texCoordBuffer: WebGLBuffer | null = null;

  // Uniform Locations
  private u_projMatrix: WebGLUniformLocation | null = null;
  private u_modelMatrix: WebGLUniformLocation | null = null;
  private u_ghost: WebGLUniformLocation | null = null;
  private u_brightness: WebGLUniformLocation | null = null;
  private u_color: WebGLUniformLocation | null = null;
  private u_image: WebGLUniformLocation | null = null;
  private u_silhouetteColor: WebGLUniformLocation | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const gl = canvas.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: false,
      preserveDrawingBuffer: true, // Importante para permitir readPixels depois!
    });

    if (!gl) {
      throw new Error('WebGL2 n?o suportado pelo navegador.');
    }

    this.gl = gl;
    this.textureManager = new TextureManager(gl);

    // Geometria e Shaders
    this.program = ShaderManager.createProgram(gl, VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE);
    this.gl.useProgram(this.program);
    this.initUniforms();
    this.initBuffers();

    // Matriz de Projeção. Padrão Scratch (0,0 no centro, limites 240x180 em 480x360 real)
    // Definimos a área lógica como (left=-240, right=240, bottom=-180, top=180)
    // Isso quer dizer que +Y vai pra CIMA. Scratch X/Y são perfeitos assim.
    this.projMatrix = Math3D.ortho(-240, 240, -180, 180, -1, 1);

    // Transparencias (Blend)
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  }

  private initUniforms() {
    this.u_projMatrix = this.gl.getUniformLocation(this.program, 'u_projectionMatrix');
    this.u_modelMatrix = this.gl.getUniformLocation(this.program, 'u_modelMatrix');
    this.u_ghost = this.gl.getUniformLocation(this.program, 'u_ghost');
    this.u_brightness = this.gl.getUniformLocation(this.program, 'u_brightness');
    this.u_color = this.gl.getUniformLocation(this.program, 'u_color');
    this.u_image = this.gl.getUniformLocation(this.program, 'u_image');
    this.u_silhouetteColor = this.gl.getUniformLocation(this.program, 'u_silhouetteColor');
  }

  /**
   * Atualiza o canvas alvo do renderizador.
   * Útil quando o componente do palco é remontado mas o Singleton do renderizador persiste.
   */
  public updateCanvas(newCanvas: HTMLCanvasElement) {
    if (this.canvas === newCanvas) return;

    console.log('[WebGLRenderer] Atualizando canvas de renderização.');
    this.canvas = newCanvas;
    const newGl = newCanvas.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: false,
      preserveDrawingBuffer: true,
    });

    if (!newGl) {
      console.error('[WebGLRenderer] Falha ao obter novo contexto WebGL2.');
      return;
    }

    this.gl = newGl;
    // Precisamos atualizar o gl no textureManager também!
    // Como o TextureManager é privado no original, vamos expor ou atualizar.
    // No nosso caso o WebGLRenderer recria o textureManager ou o atualiza.
    this.textureManager = new TextureManager(newGl);

    // Re-inicializa shaders e buffers no novo contexto
    this.program = ShaderManager.createProgram(newGl, VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE);
    newGl.useProgram(this.program);
    this.initUniforms();
    this.initBuffers();

    // Re-habilita Blend no novo contexto
    newGl.enable(newGl.BLEND);
    newGl.blendFunc(newGl.ONE, newGl.ONE_MINUS_SRC_ALPHA);
  }

  private initBuffers() {
    const gl = this.gl;
    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);

    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    const vertices = new Float32Array([-0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5]);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    this.texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
    const texCoords = new Float32Array([0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0]);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);

    gl.bindVertexArray(null);
  }

  /**
   * Pre-carrega texturas (async - use apenas fora do render loop)
   */
  public async preload(backdropUrl: string | null, sprites: SpriteRenderData[]) {
    if (backdropUrl) await this.textureManager.loadTexture(backdropUrl);
    for (const spr of sprites) {
      if (spr.visible && spr.costume) {
        await this.textureManager.loadTexture(spr.costume);
      }
    }
  }

  /**
   * Dispara carregamento de texturas em background (NON-BLOCKING).
   * Use dentro do render loop: não pausa o frame atual.
   * Texturas ausentes aparecerão nos próximos frames automaticamente.
   */
  public preloadNonBlocking(backdropUrl: string | null, sprites: SpriteRenderData[]): void {
    this.textureManager.startLoading(backdropUrl);
    for (let i = 0; i < sprites.length; i++) {
      const spr = sprites[i];
      if (spr.visible && spr.costume) {
        this.textureManager.startLoading(spr.costume);
      }
    }
  }

  /**
   * Desenha a cena inteira DE FORMA SÍNCRONA
   * Isso evita que o canvas pisque antes de receber os dados texturizados
   */
  public drawSceneSync(
    backdropUrl: string | null,
    sprites: SpriteRenderData[],
    clearColor: [number, number, number, number] = [1.0, 1.0, 1.0, 1.0],
    activeSpriteId: string | null = null,
  ) {
    const gl = this.gl;

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(this.program);
    gl.bindVertexArray(this.vao);
    gl.uniformMatrix4fv(this.u_projMatrix, false, this.projMatrix);
    gl.uniform1i(this.u_image, 0);
    gl.uniform4f(this.u_silhouetteColor, 0.0, 0.0, 0.0, 0.0); // Garante que a sombra está desativada no começo

    if (backdropUrl) {
      // Textura deve já estar no cache! Pega synchronously:
      const tk = this.textureManager.getTextureSync(backdropUrl);
      if (tk) {
        this.drawQuad(tk.tex, 0, 0, 480, 360, 0, { ghost: 0, brightness: 0, color: 0 });
      }
    }

    for (let i = 0; i < sprites.length; i++) {
      const spr = sprites[i];
      if (!spr.visible) continue;

      const tk = this.textureManager.getTextureSync(spr.costume || null);
      if (tk) {
        spr._realWidth = tk.width;
        spr._realHeight = tk.height;
        // Sincroniza dimensões reais com o objeto SpriteData padrão para uso na simulação (clamping, etc)
        spr.width = tk.width;
        spr.height = tk.height;
        this.drawSprite(spr, tk.width, tk.height, tk.tex, spr.id === activeSpriteId);
      }
    }

    gl.bindVertexArray(null);
  }

  /**
   * Versão Async usada pelo StageArea para conveniência
   */
  async drawScene(backdropUrl: string | null, sprites: SpriteRenderData[], activeSpriteId: string | null = null) {
    await this.preload(backdropUrl, sprites);
    this.drawSceneSync(backdropUrl, sprites, [1.0, 1.0, 1.0, 1.0], activeSpriteId);
  }

  /**
   * Transforma as cordenadas lógicas Scratch para Model Matrix e pinta 1 Sprite.
   */
  private drawSprite(sprite: SpriteData, imgW: number, imgH: number, texture: WebGLTexture, isActive: boolean = false) {
    // Conversão de Rotation Style do Scratch
    let scaleX = sprite.size / 100;
    let scaleY = sprite.size / 100;
    let rotDeg = 90 - sprite.angle; // Scratch 0 = cima. WebGL 0 = direita. Então glDeg = 90 - scratchDeg

    if (sprite.rotationStyle === 'left-right') {
      rotDeg = 0;
      if (sprite.angle < 0) {
        scaleX = -scaleX;
      }
    } else if (sprite.rotationStyle === "don't rotate") {
      rotDeg = 0;
    }

    const finalW = imgW * scaleX;
    const finalH = imgH * scaleY;
    const rad = rotDeg * (Math.PI / 180);

    const effects = {
      ghost: sprite.effects?.ghost || 0,
      brightness: sprite.effects?.brightness || 0,
      color: sprite.effects?.color || 0,
    };

    this.drawQuad(texture, sprite.x, sprite.y, finalW, finalH, rad, effects);
  }

  /**
   * Helper basico que pinta 1 textura num quad com tamanhos lógicos e rotação.
   */
  private drawQuad(
    tex: WebGLTexture,
    x: number,
    y: number,
    w: number,
    h: number,
    rotRad: number,
    effects: { ghost: number; brightness: number; color: number },
  ) {
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, tex);

    // Gera a ModelMatrix:  M = Translate * Rotate * Scale
    let m = Math3D.identity();
    m = Math3D.translate(m, [x, y, 0]);
    if (rotRad !== 0) m = Math3D.rotateZ(m, rotRad);
    m = Math3D.scale(m, [w, h, 1]);

    this.gl.uniformMatrix4fv(this.u_modelMatrix, false, m);

    // Aplica efeitos (Convertendo sistema Scratch(1 a 100) pra GPU(0.0 a 1.0))
    this.gl.uniform1f(this.u_ghost, effects.ghost / 100.0);
    this.gl.uniform1f(this.u_brightness, effects.brightness / 100.0);
    this.gl.uniform1f(this.u_color, effects.color * (360.0 / 200.0)); // Scratch 200 = 360deg

    // Desenha geometry Triangle Strip (4 vertices = 1 quadrado)
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
  }

  public getGL() {
    return this.gl;
  }
}
