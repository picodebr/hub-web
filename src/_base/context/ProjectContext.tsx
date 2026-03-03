/**
 * ProjectContext - Contexto React para Dados do Projeto (Atores, Cenários).
 *
 * Este contexto atua como uma ponte entre o `ProjectService` (lógica de negócio pura)
 * e os componentes React da interface. Ele gerencia o estado global de:
 * 1. Lista de Atores (Sprites) e o ator selecionado.
 * 2. Lista de Cenários (Backdrops) e o cenário ativo.
 * 3. Gestão de Fantasias (Costumes) de cada ator.
 * 4. Persistência de blocos e código gerado por ator.
 */

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getProjectService, ProjectService } from '../services/code';
import { BackdropData, BlocklyJson, SpriteData, SpriteVariable } from '../interfaces/code';

interface ProjectContextType {
  // Sprites
  sprites: SpriteData[];
  activeSpriteId: string;
  activeSprite: SpriteData;
  addSprite: (file?: File) => Promise<void>;
  deleteSprite: (id: string) => void;
  updateSprite: (id: string, changes: Partial<SpriteData>) => void;
  updateSpriteBlocks: (id: string, blocks: BlocklyJson, code: string, variables?: SpriteVariable[]) => void;
  selectSprite: (id: string) => void;
  setSprites: (sprites: SpriteData[]) => void;
  setActiveSpriteId: (id: string) => void;
  getSpriteById: (id: string) => SpriteData | undefined;

  // Costumes
  addCostumeToSprite: (spriteId: string, file: File) => void;
  removeCostumeFromSprite: (spriteId: string, costumeId: string) => void;

  // Backdrops
  backdrops: BackdropData[];
  activeBackdropId: string;
  activeBackdrop: BackdropData;
  addBackdrop: (file: File) => void;
  deleteBackdrop: (id: string) => void;
  selectBackdrop: (id: string) => void;
  setBackdrops: (backdrops: BackdropData[]) => void;
  setActiveBackdropId: (id: string) => void;

  // Global Variables (Separated by Mode)
  stageVariables: { name: string; type: string }[];
  uploadVariables: { name: string; type: string }[];

  // Mode-aware methods
  // Mode-aware methods
  getUserVariables: (mode: 'stage' | 'upload') => { name: string; type: string; scope: 'global' | 'local'; id: string; ownerId?: string }[];
  addVariable: (mode: 'stage' | 'upload', name: string, type: string, scope?: 'global' | 'local', ownerId?: string) => void;
  renameVariable: (mode: 'stage' | 'upload', oldName: string, newName: string, scope?: 'global' | 'local', ownerId?: string) => void;
  deleteVariable: (mode: 'stage' | 'upload', name: string, scope?: 'global' | 'local', ownerId?: string) => void;
  forceSyncVariables: () => void;
}

const ProjectContext = createContext<ProjectContextType | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projectService] = useState<ProjectService>(() => getProjectService());
  const [sprites, setSpritesState] = useState<SpriteData[]>([]);
  const [activeSpriteId, setActiveSpriteIdState] = useState<string>('');
  const [backdrops, setBackdropsState] = useState<BackdropData[]>([]);
  const [activeBackdropId, setActiveBackdropIdState] = useState<string>('');

  // Separate states
  const [stageVariables, setStageVariablesState] = useState<{ name: string; type: string }[]>([]);
  const [uploadVariables, setUploadVariablesState] = useState<{ name: string; type: string }[]>([]);

  useEffect(() => {
    // Initialize state from service
    setSpritesState(projectService.getSprites());
    setActiveSpriteIdState(projectService.getActiveSpriteId());
    setBackdropsState(projectService.getBackdrops());
    setActiveBackdropIdState(projectService.getActiveBackdropId());

    // Init variables
    setStageVariablesState(projectService.getVariables('stage'));
    setUploadVariablesState(projectService.getVariables('upload'));

    // Subscribe to service changes
    const handleSpritesChange = (newSprites: SpriteData[]) => {
      setSpritesState([...newSprites]);
    };

    const handleActiveSpriteChange = (newId: string) => {
      setActiveSpriteIdState(newId);
    };

    const handleBackdropChange = (newBackdrops: BackdropData[]) => {
      setBackdropsState([...newBackdrops]);
      setActiveBackdropIdState(projectService.getActiveBackdropId());
    };

    const handleStageVars = (vars: { name: string; type: string }[]) => {
      setStageVariablesState([...vars]);
    };

    const handleUploadVars = (vars: { name: string; type: string }[]) => {
      setUploadVariablesState([...vars]);
    };

    projectService.on('spritesChange', handleSpritesChange);
    projectService.on('activeSpriteChange', handleActiveSpriteChange);
    projectService.on('backdropChange', handleBackdropChange);
    projectService.on('stageVariablesChange', handleStageVars);
    projectService.on('uploadVariablesChange', handleUploadVars);

    return () => {
      projectService.off('spritesChange', handleSpritesChange);
      projectService.off('activeSpriteChange', handleActiveSpriteChange);
      projectService.off('backdropChange', handleBackdropChange);
      projectService.off('stageVariablesChange', handleStageVars);
      projectService.off('uploadVariablesChange', handleUploadVars);
    };
  }, [projectService]);

  // Computed values
  const activeSprite = sprites.find((s) => s.id === activeSpriteId) || sprites[0];
  const activeBackdrop = backdrops.find((b) => b.id === activeBackdropId) || backdrops[0];

  // Sprite methods
  const addSprite = async (file?: File) => {
    await projectService.addSprite(file);
  };

  const deleteSprite = (id: string) => {
    projectService.deleteSprite(id);
  };

  const updateSprite = (id: string, changes: Partial<SpriteData>) => {
    projectService.updateSprite(id, changes);
    // Force re-render
    setSpritesState([...projectService.getSprites()]);
  };

  const updateSpriteBlocks = (id: string, blocks: BlocklyJson, code: string) => {
    projectService.updateSpriteBlocks(id, blocks, code);
  };

  const selectSprite = (id: string) => {
    projectService.selectSprite(id);
  };

  const setSprites = (newSprites: SpriteData[]) => {
    projectService.setSprites(newSprites);
  };

  const setActiveSpriteId = (id: string) => {
    projectService.setActiveSpriteId(id);
  };

  const getSpriteById = (id: string) => {
    return projectService.getSpriteById(id);
  };

  // Costume methods
  const addCostumeToSprite = async (spriteId: string, file: File) => {
    await projectService.addCostumeToSprite(spriteId, file);
  };

  const removeCostumeFromSprite = (spriteId: string, costumeId: string) => {
    projectService.removeCostumeFromSprite(spriteId, costumeId);
  };

  // Backdrop methods
  const addBackdrop = async (file: File) => {
    await projectService.addBackdrop(file);
  };

  const deleteBackdrop = (id: string) => {
    projectService.deleteBackdrop(id);
  };

  const selectBackdrop = (id: string) => {
    projectService.selectBackdrop(id);
  };

  const setBackdrops = (newBackdrops: BackdropData[]) => {
    projectService.setBackdrops(newBackdrops);
  };

  const setActiveBackdropId = (id: string) => {
    projectService.setActiveBackdropId(id);
  };

  const value: ProjectContextType = {
    sprites,
    activeSpriteId,
    activeSprite,
    addSprite,
    deleteSprite,
    updateSprite,
    updateSpriteBlocks,
    selectSprite,
    setSprites,
    setActiveSpriteId,
    getSpriteById,
    addCostumeToSprite,
    removeCostumeFromSprite,
    backdrops,
    activeBackdropId,
    activeBackdrop,
    addBackdrop,
    deleteBackdrop,
    selectBackdrop,
    setBackdrops,
    setActiveBackdropId,

    stageVariables,
    uploadVariables,

    addVariable: (mode, name, type, scope, ownerId) => projectService.addVariable(mode, name, type, scope, ownerId),
    renameVariable: (mode, oldName, newName, scope, ownerId) => projectService.renameVariable(mode, oldName, newName, scope, ownerId),
    deleteVariable: (mode, name, scope, ownerId) => projectService.deleteVariable(mode, name, scope, ownerId),
    getUserVariables: (mode) => projectService.getUserVariables(mode),
    forceSyncVariables: () => projectService.forceSyncVariables(),
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProject(): ProjectContextType {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
