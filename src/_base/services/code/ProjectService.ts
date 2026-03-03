/**
 * ProjectService - Gerenciador de Estado do Projeto.
 *
 * Este serviço atua como a "única fonte de verdade" para os dados do projeto.
 * Ele gerencia a lista de atores (sprites), cenários (backdrops), fantasias e o
 * código associado a cada bloco. Utiliza o EventEmitter para notificar a UI e
 * outros serviços sempre que algo muda (ex: posição de um ator, troca de cenário).
 */

import { SpriteData, CostumeData, BackdropData, BlocklyJson, ProjectEvents, SpriteVariable } from '../../interfaces/code';
import { EventEmitter } from '../../lib/EventEmitter';

export class ProjectService extends EventEmitter<ProjectEvents> {
  private sprites: SpriteData[] = [];
  private activeSpriteId: string = '';
  private backdrops: BackdropData[] = [];
  private activeBackdropId: string = '';
  private stageVariables: { name: string; type: string }[] = [{ name: 'minha variável', type: 'Number' }];
  private uploadVariables: { name: string; type: string }[] = [{ name: 'minha variável', type: 'Number' }];

  constructor() {
    super();
    this.initializeDefaults();
  }

  /**
   * Initialize with default sprite and backdrop
   */
  private initializeDefaults(): void {
    // Default backdrop
    this.backdrops = [{ id: 'bg1', name: 'Fundo 1', url: '/img/fundo.jpg' }];
    this.activeBackdropId = 'bg1';

    // Default sprite
    this.sprites = [
      {
        id: 'sprite1',
        name: 'Ator 1',
        x: 0,
        y: 0,
        angle: 90,
        size: 100,
        visible: true,
        costume: '/img/deco.png',
        currentCostumeId: 'c1',
        costumes: [{ id: 'c1', name: 'padrão', url: '/img/deco.png' }],
        bubbleText: '',
        bubbleType: null,
        blocks: undefined,
        code: '',
      },
    ];
    this.activeSpriteId = 'sprite1';
  }

  // ========== SPRITE MANAGEMENT ==========

  /**
   * Get all sprites
   */
  public getSprites(): SpriteData[] {
    return this.sprites;
  }

  /**
   * Get the active sprite
   */
  public getActiveSprite(): SpriteData {
    return this.sprites.find((s) => s.id === this.activeSpriteId) || this.sprites[0];
  }

  /**
   * Get active sprite ID
   */
  public getActiveSpriteId(): string {
    return this.activeSpriteId;
  }

  /**
   * Get a specific sprite by ID
   */
  public getSpriteById(id: string): SpriteData | undefined {
    return this.sprites.find((s) => s.id === id);
  }

  /**
   * Add a new sprite
   */
  public async addSprite(file?: File): Promise<void> {
    const newId = `sprite${Date.now()}`;

    const createSprite = (url: string = '/img/deco.png', costumeName: string = 'padrão'): SpriteData => {
      return {
        id: newId,
        name: `Ator ${this.sprites.length + 1}`,
        x: 0,
        y: 0,
        angle: 90,
        size: 100,
        visible: true,
        costume: url,
        currentCostumeId: 'c1',
        costumes: [{ id: 'c1', name: costumeName, url: url }],
        bubbleText: '',
        bubbleType: null,
        blocks: {
          blocks: {
            languageVersion: 0,
            blocks: [],
          },
          variables: [], // Initialize empty, workspace handles injection from Service
        },
        variables: [], // Initialize explicit variables
        code: '',
      };
    };

    if (file) {
      const url = await this.readFileAsDataURL(file);
      const name = file.name.split('.')[0];
      this.sprites.push(createSprite(url, name));
    } else {
      this.sprites.push(createSprite());
    }

    this.activeSpriteId = newId;
    this.emit('spritesChange', this.sprites);
    this.emit('activeSpriteChange', newId);
  }

  /**
   * Delete a sprite
   */
  public deleteSprite(id: string): void {
    if (this.sprites.length <= 1) {
      console.warn('[ProjectService] Cannot delete last sprite');
      return;
    }

    this.sprites = this.sprites.filter((s) => s.id !== id);

    // If deleted active sprite, select another
    if (this.activeSpriteId === id) {
      this.activeSpriteId = this.sprites[0].id;
      this.emit('activeSpriteChange', this.activeSpriteId);
    }

    this.emit('spritesChange', this.sprites);
  }

  /**
   * Select a sprite as active
   */
  public selectSprite(id: string): void {
    const exists = this.sprites.find((s) => s.id === id);
    if (exists) {
      this.activeSpriteId = id;
      this.emit('activeSpriteChange', id);
    }
  }

  /**
   * Update sprite properties
   */
  public updateSprite(id: string, changes: Partial<SpriteData>): void {
    const sprite = this.sprites.find((s) => s.id === id);
    if (sprite) {
      Object.assign(sprite, changes);
      this.emit('spritesChange', this.sprites);
    }
  }

  /**
   * Update sprite blocks and code
   */
  public updateSpriteBlocks(id: string, blocks: BlocklyJson, code: string, variables?: SpriteVariable[]): void {
    const sprite = this.sprites.find((s) => s.id === id);
    if (sprite) {
      sprite.blocks = blocks;
      sprite.code = code;
      if (variables) {
        sprite.variables = variables;
      }
      // Don't emit change for performance (blocks update frequently)
    }
  }

  /**
   * Set all sprites (for loading projects)
   */
  public setSprites(newSprites: SpriteData[]): void {
    this.sprites = newSprites;
    this.emit('spritesChange', this.sprites);
  }

  /**
   * Set active sprite ID (for loading projects)
   */
  public setActiveSpriteId(id: string): void {
    if (this.sprites.find((s) => s.id === id)) {
      this.activeSpriteId = id;
      this.emit('activeSpriteChange', id);
    }
  }

  // ========== COSTUME MANAGEMENT ==========

  /**
   * Add a costume to a sprite
   */
  public async addCostumeToSprite(spriteId: string, file: File): Promise<void> {
    const sprite = this.sprites.find((s) => s.id === spriteId);
    if (!sprite) return;

    const url = await this.readFileAsDataURL(file);
    const newCostume: CostumeData = {
      id: `costume${Date.now()}`,
      name: file.name.split('.')[0],
      url: url,
    };

    sprite.costumes.push(newCostume);
    sprite.currentCostumeId = newCostume.id;
    sprite.costume = newCostume.url;

    this.emit('spritesChange', this.sprites);
  }

  /**
   * Remove a costume from a sprite
   */
  public removeCostumeFromSprite(spriteId: string, costumeId: string): void {
    const sprite = this.sprites.find((s) => s.id === spriteId);
    if (!sprite || sprite.costumes.length <= 1) return;

    sprite.costumes = sprite.costumes.filter((c) => c.id !== costumeId);

    // If current costume was deleted, switch to first
    if (sprite.currentCostumeId === costumeId) {
      const first = sprite.costumes[0];
      sprite.currentCostumeId = first.id;
      sprite.costume = first.url;
    }

    this.emit('spritesChange', this.sprites);
  }

  // ========== BACKDROP MANAGEMENT ==========

  /**
   * Get all backdrops
   */
  public getBackdrops(): BackdropData[] {
    return this.backdrops;
  }

  /**
   * Get active backdrop
   */
  public getActiveBackdrop(): BackdropData {
    return this.backdrops.find((b) => b.id === this.activeBackdropId) || this.backdrops[0];
  }

  /**
   * Get active backdrop ID
   */
  public getActiveBackdropId(): string {
    return this.activeBackdropId;
  }

  /**
   * Add a new backdrop
   */
  public async addBackdrop(file: File): Promise<void> {
    const url = await this.readFileAsDataURL(file);
    const newBackdrop: BackdropData = {
      id: `bg${Date.now()}`,
      name: file.name.split('.')[0],
      url: url,
    };

    this.backdrops.push(newBackdrop);
    this.activeBackdropId = newBackdrop.id;
    this.emit('backdropChange', this.backdrops);
    this.emit('activeBackdropChange', newBackdrop.id);
  }

  /**
   * Delete a backdrop
   */
  public deleteBackdrop(id: string): void {
    if (this.backdrops.length <= 1) return;

    this.backdrops = this.backdrops.filter((b) => b.id !== id);

    // If deleted active backdrop, select first
    if (this.activeBackdropId === id) {
      this.activeBackdropId = this.backdrops[0].id;
    }

    this.emit('backdropChange', this.backdrops);
  }

  /**
   * Select a backdrop as active
   */
  public selectBackdrop(id: string): void {
    if (this.backdrops.find((b) => b.id === id)) {
      this.activeBackdropId = id;
      this.emit('backdropChange', this.backdrops);
      this.emit('activeBackdropChange', id);
    }
  }

  /**
   * Set all backdrops (for loading projects)
   */
  public setBackdrops(newBackdrops: BackdropData[]): void {
    this.backdrops = newBackdrops;
    this.emit('backdropChange', this.backdrops);
  }

  /**
   * Set active backdrop ID (for loading projects)
   */
  public setActiveBackdropId(id: string): void {
    if (this.backdrops.find((b) => b.id === id)) {
      this.activeBackdropId = id;
      this.emit('backdropChange', this.backdrops);
      this.emit('activeBackdropChange', id);
    }
  }

  /**
   * Refreshes all sprite listeners (forces an update).
   * Useful when modifying sprite properties directly by reference.
   */
  public syncSprites(): void {
    this.emit('spritesChange', this.sprites);
  }

  /**
   * Refreshes all backdrop listeners (forces an update).
   */
  public syncBackdrops(): void {
    this.emit('backdropChange', this.backdrops);
  }

  // ========== GLOBAL & LOCAL VARIABLES MANAGEMENT ==========
  // Separated by Mode (Stage vs Upload)

  /**
   * Get all variables available for the current context (Global + Local to Active Sprite)
   */
  public getUserVariables(mode: 'stage' | 'upload'): { name: string; type: string; scope: 'global' | 'local'; id: string; ownerId?: string }[] {
    const globalVars = (mode === 'upload' ? this.uploadVariables : this.stageVariables).map((v) => ({
      ...v,
      scope: 'global' as const,
      id: v.name, // ID is name for globals for now
    }));

    if (mode === 'stage') {
      const activeSprite = this.getActiveSprite();
      if (activeSprite && activeSprite.variables) {
        const localVars = activeSprite.variables.map((v) => ({
          name: v.name,
          type: v.type, // Map internal type if needed, but usually consistent
          scope: 'local' as const,
          id: v.id,
          ownerId: activeSprite.id,
        }));
        return [...globalVars, ...localVars];
      }
    }

    return globalVars;
  }

  // Helper to get raw storage array (legacy support)
  public getVariables(mode: 'stage' | 'upload'): { name: string; type: string }[] {
    return mode === 'upload' ? this.uploadVariables : this.stageVariables;
  }

  public addVariable(mode: 'stage' | 'upload', name: string, type: string, scope: 'global' | 'local' = 'global', ownerId?: string): void {
    if (scope === 'local' && mode === 'stage' && ownerId) {
      const sprite = this.getSpriteById(ownerId);
      if (sprite) {
        // Initialize if undefined
        if (!sprite.variables) sprite.variables = [];

        // Check duplicate LOCAL
        if (!sprite.variables.find((v) => v.name === name)) {
          sprite.variables.push({
            id: name, // Simple ID for now
            name: name,
            type: type,
            value: 0,
            isGlobal: false,
          });

          this.emitVariablesChange('stage'); // Re-emit stage vars to force update
        }
      }
    } else {
      // Global
      const targetList = mode === 'upload' ? this.uploadVariables : this.stageVariables;
      if (!targetList.find((v) => v.name === name)) {
        targetList.push({ name, type });

        this.emitVariablesChange(mode);
      }
    }
  }

  public renameVariable(mode: 'stage' | 'upload', oldName: string, newName: string, scope: 'global' | 'local' = 'global', ownerId?: string): void {
    if (scope === 'local' && mode === 'stage' && ownerId) {
      const sprite = this.getSpriteById(ownerId);
      if (sprite && sprite.variables) {
        const v = sprite.variables.find((myVar) => myVar.name === oldName);
        if (v) {
          v.name = newName;
          v.id = newName; // Update ID too if simple mapping

          // Propagate to BLOCKS (Only for this sprite)
          if (sprite.blocks) {
            try {
              this.updateVariableInBlocks(sprite.blocks.blocks, oldName, newName);
            } catch (e) {
              console.error(e);
            }
          }
          this.emitVariablesChange('stage');
        }
      }
    } else {
      // Global
      const targetList = mode === 'upload' ? this.uploadVariables : this.stageVariables;
      const variable = targetList.find((v) => v.name === oldName);

      if (variable) {
        variable.name = newName;

        if (mode === 'stage') {
          this.sprites.forEach((sprite) => {
            if (sprite.blocks) {
              try {
                // 1. Update variables list in JSON
                if (sprite.blocks.variables) {
                  sprite.blocks.variables.forEach((v: any) => {
                    if (v.name === oldName) {
                      v.name = newName;
                      if (v.id === oldName) v.id = newName;
                    }
                  });
                }
                // 2. Update fields
                this.updateVariableInBlocks(sprite.blocks.blocks, oldName, newName);
              } catch (e) {
                console.error(`[ProjectService] Failed to propagate stage var rename to sprite ${sprite.id}:`, e);
              }
            }
          });
          this.emit('spritesChange', [...this.sprites]);
        }

        this.emitVariablesChange(mode);
      }
    }
  }

  private updateVariableInBlocks(blocksRoot: any, oldName: string, newName: string) {
    if (!blocksRoot || !blocksRoot.blocks) return;

    const updateBlocks = (blocks: any[]) => {
      blocks.forEach((block) => {
        // Check fields
        if (block.fields) {
          for (const key in block.fields) {
            const field = block.fields[key];
            if (field.id === oldName) {
              field.id = newName;
            }
            if (field.value === oldName && (key === 'VAR' || key === 'VARIABLE')) {
              // checks if it is a variable field
            }
          }
        }
        // Recurse inputs
        if (block.inputs) {
          for (const key in block.inputs) {
            const input = block.inputs[key];
            if (input.block) updateBlocks([input.block]);
            if (input.shadow) updateBlocks([input.shadow]);
          }
        }
        // Recurse next
        if (block.next && block.next.block) {
          updateBlocks([block.next.block]);
        }
      });
    };
    updateBlocks(blocksRoot.blocks);
  }

  public deleteVariable(mode: 'stage' | 'upload', name: string, scope: 'global' | 'local' = 'global', ownerId?: string): void {
    if (scope === 'local' && mode === 'stage' && ownerId) {
      const sprite = this.getSpriteById(ownerId);
      if (sprite && sprite.variables) {
        sprite.variables = sprite.variables.filter((v) => v.name !== name);

        this.emitVariablesChange('stage');
      }
    } else {
      if (mode === 'upload') {
        this.uploadVariables = this.uploadVariables.filter((v) => v.name !== name);
      } else {
        this.stageVariables = this.stageVariables.filter((v) => v.name !== name);
      }

      this.emitVariablesChange(mode);
    }
  }

  private emitVariablesChange(mode: 'stage' | 'upload') {
    if (mode === 'upload') {
      this.emit('uploadVariablesChange', [...this.uploadVariables]);
    } else {
      this.emit('stageVariablesChange', [...this.stageVariables]);
    }
  }

  // Legacy support or "All" sync?
  public forceSyncVariables(): void {
    this.emit('stageVariablesChange', [...this.stageVariables]); // Listeners will re-fetch getUserVariables
    this.emit('uploadVariablesChange', [...this.uploadVariables]);
  }

  // ========== EVENT SYSTEM (Inherited from EventEmitter) ==========

  /**
   * Read a file as Data URL
   */
  private readFileAsDataURL(file: File): Promise<string> {
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
}

// Export singleton instance
let projectServiceInstance: ProjectService | null = null;

export const getProjectService = (): ProjectService => {
  if (!projectServiceInstance) {
    projectServiceInstance = new ProjectService();
  }
  return projectServiceInstance;
};
