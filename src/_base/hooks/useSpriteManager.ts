/**
 * useSpriteManager - Gestor de Dados dos Atores e Cenários.
 *
 * Sincroniza a interface do React com a lógica de persistência do `ProjectService`.
 * Gerencia a lista de atores, o ator selecionado, as fantasias e o cenário do palco.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { SpriteData, BackdropData, BlocklyJson, SpriteVariable } from '../interfaces/code';
import { getProjectService } from '../services/code/ProjectService';

export function useSpriteManager() {
  const projectService = getProjectService();

  // Estado Local (Sincronizado com o Service)
  const [sprites, setSprites] = useState<SpriteData[]>(projectService.getSprites());
  const [activeSpriteId, setActiveSpriteId] = useState<string>(projectService.getActiveSpriteId());

  const [backdrops, setBackdrops] = useState<BackdropData[]>(projectService.getBackdrops());
  const [activeBackdropId, setActiveBackdropId] = useState<string>(projectService.getActiveBackdropId());

  useEffect(() => {
    // Sincronização Inicial
    setSprites(projectService.getSprites());
    setActiveSpriteId(projectService.getActiveSpriteId());
    setBackdrops(projectService.getBackdrops());
    setActiveBackdropId(projectService.getActiveBackdropId());

    const handleSpritesChange = (newSprites: SpriteData[]) => {
      setSprites([...newSprites]);
    };

    const handleActiveSpriteChange = (id: string) => {
      setActiveSpriteId(id);
    };

    const handleBackdropChange = (newBackdrops: BackdropData[]) => {
      setBackdrops([...newBackdrops]);
    };

    const handleActiveBackdropChange = (id: string) => {
      setActiveBackdropId(id);
    };

    projectService.on('spritesChange', handleSpritesChange);
    projectService.on('activeSpriteChange', handleActiveSpriteChange);
    projectService.on('backdropChange', handleBackdropChange);
    projectService.on('activeBackdropChange', handleActiveBackdropChange);

    return () => {
      projectService.off('spritesChange', handleSpritesChange);
      projectService.off('activeSpriteChange', handleActiveSpriteChange);
      projectService.off('backdropChange', handleBackdropChange);
      projectService.off('activeBackdropChange', handleActiveBackdropChange);
    };
  }, []);

  // --- Ações (Proxy para o Service) ---

  const addSprite = useCallback((file?: File) => {
    projectService.addSprite(file);
  }, []);

  const deleteSprite = useCallback((id: string) => {
    projectService.deleteSprite(id);
  }, []);

  const selectSprite = useCallback((id: string) => {
    projectService.selectSprite(id);
  }, []);

  const updateSpriteInfo = useCallback((id: string, changes: Partial<SpriteData>) => {
    projectService.updateSprite(id, changes);
  }, []);

  const updateSpriteBlocks = useCallback((id: string, blocks: BlocklyJson, code: string, variables?: SpriteVariable[]) => {
    projectService.updateSpriteBlocks(id, blocks, code, variables);
  }, []);

  // --- Backdrop Actions ---
  const addBackdrop = useCallback((file: File) => {
    projectService.addBackdrop(file);
  }, []);

  const deleteBackdrop = useCallback((id: string) => {
    projectService.deleteBackdrop(id);
  }, []);

  const selectBackdrop = useCallback((id: string) => {
    projectService.setActiveBackdropId(id);
  }, []);

  // Setters Expostos para o ProjectManager (Carga)
  const setSpritesExternal = useCallback((newSprites: SpriteData[]) => {
    projectService.setSprites(newSprites);
  }, []);

  const setActiveSpriteIdExternal = useCallback((id: string) => {
    projectService.setActiveSpriteId(id);
  }, []);

  const setBackdropsExternal = useCallback((newBackdrops: BackdropData[]) => {
    // ProjectService precisa de um método setBackdrops?
    // Verificado ProjectService: Ele tem setBackdrops?
    // Preciso verificar se o ProjectService possui setBackdrops.
    // Se não, devo adicionar ou usar uma solução alternativa.
    // Assumindo que existirá ou será adicionado.
    if ((projectService as any).setBackdrops) {
      (projectService as any).setBackdrops(newBackdrops);
    } else {
      console.warn('ProjectService.setBackdrops ausente');
    }
  }, []);

  const setActiveBackdropIdExternal = useCallback((id: string) => {
    projectService.setActiveBackdropId(id);
  }, []);

  return {
    sprites,
    activeSpriteId,
    backdrops,
    activeBackdropId,
    // Methods
    addSprite,
    deleteSprite,
    selectSprite,
    updateSpriteInfo,
    updateSpriteBlocks,
    addBackdrop,
    deleteBackdrop,
    selectBackdrop,
    // External Setters (Load)
    setSpritesExternal,
    setActiveSpriteIdExternal,
    setBackdropsExternal,
    setActiveBackdropIdExternal,
  };
}
