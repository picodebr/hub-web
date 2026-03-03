/**
 * Componente BlocklyWorkspace - O "Coração" da Programação em Blocos.
 *
 * Este componente gerencia a instância do Google Blockly, integrando:
 * 1. Interface de programação para Atores (Stage Mode - JavaScript).
 * 2. Interface de programação para Placa (Upload Mode - Arduino C++).
 * 3. Temas customizados, gestão de variáveis e criação de blocos personalizados (Procedimentos).
 * 4. Persistência de blocos por Ator e em janelas de Upload.
 */

'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import { javascriptGenerator } from 'blockly/javascript';
import * as PtBr from 'blockly/msg/pt-br';
import { ToolboxDefinition, ToolboxUploadDefinition } from '../../../../../_base/config/toolbox';
import { initStageGenerators } from '../../../../../_base/generators/stage';
import { initCustomGenerators } from '../../../../../_base/generators/custom_generators';
import { arduinoGenerator } from '../../../../../_base/generators/arduino';
import { useStage } from '../../../../../_base/context/StageContext';
import { ProjectService, getProjectService } from '../../../../../_base/services/code/ProjectService';
import { useProject } from '../../../../../_base/context/ProjectContext';
import {
  BlockStageDefinitions,
  BlockBoardDefinitions,
  applyVariableTypeLogic,
  registerCustomExtensions,
  CustomBlockDefinitions,
} from '../../../../../_base/config/custom_definitions';
import { registerContinuousToolbox } from '@blockly/continuous-toolbox';
import '@blockly/field-slider';
import { FieldAngle } from '@blockly/field-angle';

// Registrar FieldAngle explicitamente
try {
  Blockly.fieldRegistry.register('field_angle', FieldAngle);
} catch (e) {
  // Ignora erro se já estiver registrado
}

// Configura o idioma do Blockly para Português do Brasil
// eslint-disable-next-line @typescript-eslint/no-explicit-any
Blockly.setLocale(PtBr as any);

// Sobrescreve mensagens para estilo Scratch/PictoBlox
Blockly.Msg['VARIABLES_SET'] = 'mude %1 para %2';
Blockly.Msg['MATH_CHANGE_TITLE'] = 'adicione %2 a %1';

interface BlocklyWorkspaceProps {
  onBlockClick?: (code: string) => void;
  onRunCode?: (code: string) => void;
}

/**
 * Interface exposta via forwardRef para permitir que componentes pais interajam com o workspace.
 */
export interface BlocklyWorkspaceRef {
  checkKeyEvents: (key: string) => string | null; // Verifica se há blocos de evento para uma tecla
  generateCodeForBlock: (blockId: string) => string | null; // Gera código de um bloco específico
  checkGreenFlagEvents: () => string | null; // Coleta código de todos os blocos "Ao clicar na bandeira"
  undo: () => void;
  redo: () => void;
  getWorkspace: () => Blockly.WorkspaceSvg | null;
}

/**
 * Definição de Tema Customizado (CustomGreenTheme)
 * Altera a estética do Blockly para tons de verde nos blocos de lógica e matemática,
 * além de ajustar fontes e cores de fundo para um visual mais moderno.
 */
const CustomGreenTheme = Blockly.Theme.defineTheme('custom_green_theme', {
  name: 'custom_green_theme',
  base: Blockly.Themes.Zelos, // Baseado no renderer Zelos (estilo Scratch 3.0)
  fontStyle: {
    family: 'var(--font-outfit), sans-serif',
    weight: '400',
    size: 17,
  },
  blockStyles: {
    math_blocks: {
      colourPrimary: '#59C059',
      colourSecondary: '#46A346',
      colourTertiary: '#388C38',
    },
    logic_blocks: {
      colourPrimary: '#59C059',
      colourSecondary: '#46A346',
      colourTertiary: '#388C38',
    },
  },
  categoryStyles: {
    category_logic: {
      colour: '#59C059',
    },
    category_math: {
      colour: '#59C059',
    },
  },
  componentStyles: {
    workspaceBackgroundColour: '#F9F9F9',
    toolboxBackgroundColour: '#F9F9F9',
    toolboxForegroundColour: '#555',
    flyoutBackgroundColour: '#F9F9F9',
    flyoutForegroundColour: '#555',
    flyoutOpacity: 1,
    scrollbarColour: '#555',
    insertionMarkerColour: '#fff',
    insertionMarkerOpacity: 0.3,
    scrollbarOpacity: 0.2,
    cursorColour: '#d0d0d0',
  },
  startHats: true, // Habilita o estilo de "chapéu" para blocos de evento (indicando início de script)
});

const BlocklyWorkspace = React.forwardRef<BlocklyWorkspaceRef, BlocklyWorkspaceProps>(({ onBlockClick, onRunCode }, ref) => {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);

  // Use ProjectContext for sprite data (single source of truth)
  const {
    sprites,
    activeSpriteId,
    getSpriteById,
    updateSpriteBlocks,
    stageVariables,
    uploadVariables,
    addVariable,
    renameVariable,
    deleteVariable,
    getUserVariables,
    forceSyncVariables,
  } = useProject();

  // Use StageContext for runtime state and mode
  const { isUploadMode, uploadModeBlocks, setUploadModeBlocks, setUploadCode } = useStage();

  // Ref to track if we are currently loading blocks (to prevent save loops)
  const isLoadingBlocks = useRef(false);
  const lastLoadedSpriteRef = useRef<any>(null); // To track which sprite object is currently loaded
  // Ref to active ID to use inside callbacks/cleanup
  const activeIdRef = useRef(activeSpriteId);
  // Ref to track PREVIOUS sprite ID for save-before-switch
  const previousSpriteIdRef = useRef<string>(activeSpriteId);

  // Ref to mode to access in cleanup/effects
  const isUploadModeRef = useRef(isUploadMode);

  // Keep refs updated
  useEffect(() => {
    activeIdRef.current = activeSpriteId;
    // Initialize previousSpriteIdRef on first render so save-before-switch works when adding first new sprite
    if (previousSpriteIdRef.current === null) {
      previousSpriteIdRef.current = activeSpriteId;
    }
  }, [activeSpriteId]);

  useEffect(() => {
    isUploadModeRef.current = isUploadMode;
  }, [isUploadMode]);

  // Ref to callback to avoid stale closures
  const onRunCodeRef = useRef(onRunCode);
  const onBlockClickRef = useRef(onBlockClick);

  useEffect(() => {
    onRunCodeRef.current = onRunCode;
  }, [onRunCode]);

  useEffect(() => {
    onBlockClickRef.current = onBlockClick;
  }, [onBlockClick]);

  // --- MODAL STATE (Hoisted) ---
  const [isVarModalOpen, setIsVarModalOpen] = React.useState(false);
  const [isVarDeleteModalOpen, setIsVarDeleteModalOpen] = React.useState(false);
  const [isProcModalOpen, setIsProcModalOpen] = React.useState(false);
  const [preselectedVar, setPreselectedVar] = React.useState<string | null>(null);

  // BLOQUEIO DE CONTEXT MENU NA TOOLBOX/FLYOUT (Pedido do usuário)
  const handleToolboxContextMenu = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    // Verifica se o clique foi dentro da toolbox ou do flyout
    const isToolbox =
      target &&
      (target.closest('.blocklyFlyout') ||
        target.closest('.blocklyToolboxDiv') ||
        target.closest('.blocklyToolbox') ||
        target.closest('.blocklyFlyoutScrollbar') ||
        target.closest('.blocklyFlyoutBackground') ||
        target.closest('.blocklyTreeRow') ||
        target.closest('.blocklyBlockCanvas')); // Captura cliques nos blocos dentro do flyout

    if (isToolbox) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, []);

  // SYNC GLOBAL VARIABLES REMOVED FROM HERE
  // It is now handled inside the mode switching effect to avoid race conditions with workspace.clear()

  // --- HANDLE BLOCKLY EVENTS ---
  const handleBlocklyEvents = useCallback(
    (event: any) => {
      if (!workspaceRef.current) return;

      // CASCATA DE DELEÇÃO: Apagar chamadas ao apagar a definição
      if (event.type === Blockly.Events.BLOCK_DELETE) {
        const deletedBlockJson = event.oldJson;
        if (deletedBlockJson && deletedBlockJson.type && deletedBlockJson.type.startsWith('custom_def_')) {
          const procId = deletedBlockJson.type.replace('custom_def_', '');
          const callBlockType = 'custom_call_' + procId;

          // Encontrar todas as instâncias desse bloco de chamada e apagar
          const allBlocks = workspaceRef.current.getAllBlocks(false);
          allBlocks.forEach((block) => {
            if (block.type === callBlockType) {
              block.dispose(false);
            }
          });
        }
      }

      if (
        event.type === Blockly.Events.BLOCK_CREATE ||
        event.type === Blockly.Events.BLOCK_CHANGE ||
        event.type === Blockly.Events.BLOCK_MOVE ||
        event.type === Blockly.Events.BLOCK_DELETE
      ) {
        if (isLoadingBlocks.current) return;

        // Filter out UI events if needed, but usually these are fine.
        if (event.isUiEvent) return;

        const json = Blockly.serialization.workspaces.save(workspaceRef.current);

        if (isUploadModeRef.current) {
          const code = arduinoGenerator.workspaceToCode(workspaceRef.current);
          setUploadModeBlocks(json);
          setUploadCode(code);
        } else {
          const code = javascriptGenerator.workspaceToCode(workspaceRef.current);

          const variables = workspaceRef.current
            .getVariableMap()
            .getAllVariables()
            .filter((v) => typeof (v as any).type === 'string' && (v as any).type !== '')
            .map((v) => ({
              id: v.getId(),
              name: (v as any).name,
              type: (v as any).type,
              value: 0,
              isGlobal: true,
            }));

          updateSpriteBlocks(activeIdRef.current, json, code, variables);
        }

        // 2. SYNC VARIABLES BACK TO PROJECT SERVICE
        if (event.type === Blockly.Events.VAR_DELETE) {
          const varEvent = event as Blockly.Events.VarDelete;
          const varName = varEvent.varName;

          if (varName) {
            const mode = isUploadModeRef.current ? 'upload' : 'stage';
            const targetVars = isUploadModeRef.current ? uploadVariables : stageVariables;
            const isGlobal = targetVars.some((v) => v.name === varName);

            if (isGlobal) {
              deleteVariable(mode, varName);
            }
          }
        }

        if (event.type === Blockly.Events.VAR_RENAME) {
          const varEvent = event as Blockly.Events.VarRename;
          const oldName = varEvent.oldName;
          const newName = varEvent.newName;

          if (oldName && newName) {
            const targetVars = isUploadModeRef.current ? uploadVariables : stageVariables;
            const isGlobal = targetVars.some((v) => v.name === oldName);

            if (isGlobal) {
              const mode = isUploadModeRef.current ? 'upload' : 'stage';
              renameVariable(mode, oldName, newName);
            }
          }
        }
      }
    },
    [setUploadModeBlocks, setUploadCode, updateSpriteBlocks, stageVariables, uploadVariables, deleteVariable, renameVariable],
  );

  const handleBlocklyEventsRef = useRef(handleBlocklyEvents);
  useEffect(() => {
    handleBlocklyEventsRef.current = handleBlocklyEvents;
  }, [handleBlocklyEvents]);

  // Listener attachment is now handled centrally in the main initialization effect
  // to avoid duplicate listeners and ensure correct lifecycle with Flyout listeners.
  // The previous useEffect here has been removed.

  // EXPOSE METHOD TO CHECK KEYS FROM PARENT (Global Listener)
  React.useImperativeHandle(ref, () => ({
    checkKeyEvents: (key: string) => {
      if (!workspaceRef.current || isUploadModeRef.current) return null;

      const workspace = workspaceRef.current;

      // Ensure generator init
      if ((javascriptGenerator as any).init) (javascriptGenerator as any).init(workspace);

      const topBlocks = workspace.getTopBlocks(false);
      let combinedCode = '';

      for (const block of topBlocks) {
        if (block.type === 'event_when_key_pressed') {
          const keyOption = block.getFieldValue('KEY_OPTION'); // ex: "space", "up arrow"

          let isMatch = false;

          // 1. Match Direto
          if (keyOption === key) isMatch = true;
          // 2. Case Insensitive (para letras)
          else if (keyOption && keyOption.toLowerCase() === key.toLowerCase()) isMatch = true;
          // 3. Mapeamentos Especiais (Legacy Scratch/Blockly names)
          else if (keyOption === 'space' && key === ' ') isMatch = true;
          else if (keyOption === 'up arrow' && key === 'ArrowUp') isMatch = true;
          else if (keyOption === 'down arrow' && key === 'ArrowDown') isMatch = true;
          else if (keyOption === 'right arrow' && key === 'ArrowRight') isMatch = true;
          else if (keyOption === 'left arrow' && key === 'ArrowLeft') isMatch = true;
          else if (keyOption === 'enter' && key === 'Enter') isMatch = true;

          if (isMatch) {
            // Feedback Visual (Flash)
            if ((block as any).setHighlighted) {
              (block as any).setHighlighted(true);
              setTimeout(() => {
                if ((block as any).setHighlighted) (block as any).setHighlighted(false);
              }, 200);
            }

            // Gerar Código
            const nextBlock = block.getNextBlock();
            if (nextBlock) {
              // Coleta Definições Customizadas
              let definitions = ''; // TODO: Collect global definitions if needed
              const allBlocks = workspace.getTopBlocks(false);
              for (const potentialDef of allBlocks) {
                if (potentialDef.type.startsWith('custom_def_')) {
                  const defCode = javascriptGenerator.blockToCode(potentialDef);
                  definitions += defCode + '\n';
                }
              }

              // Gera código do evento
              let code = javascriptGenerator.blockToCode(nextBlock);

              if (code && typeof code === 'string') {
                // NÃO substitui 'stage.sprite' por 'currentSprite' AQUI.
                // Deixa o 'javascriptGenerator' gerar 'sprite.action()'.
                // O Proxy no 'page.tsx' lidará com 'sprite' sendo o objeto correto.
                // Mas espere, o gerador 'blockly/javascript' usa 'sprite' ou 'activeSprite'?
                // Nossos geradores usam 'sprite'.

                // O código original substituía: code.replaceAll('stage.sprite', 'currentSprite');
                // Mas nossa execução usa 'new Function("sprite", ...)'
                // Se o código gerado for 'sprite.move()', está ok.
                // Se for 'stage.sprite.move()', precisamos limpar.
                // Nossos geradores em 'generators/javascript.ts' geram 'await sprite.move(...)'.

                combinedCode += definitions + '\n' + code + '\n';
              }
            }
          }
        }
      }
      return combinedCode || null;
    },
    generateCodeForBlock: (blockId: string) => {
      if (!workspaceRef.current || isUploadModeRef.current) return null;
      const block = workspaceRef.current.getBlockById(blockId);
      if (!block) return null;

      // Ensure generator init
      // @ts-ignore
      if (javascriptGenerator.init) javascriptGenerator.init(workspaceRef.current);

      // SPECIAL HANDLING FOR CUSTOM DEFINITIONS
      // If user clicks the definition block, we want to test it.
      if (block.type.startsWith('custom_def_')) {
        // 1. Generate the definition code (which includes the body)
        const defCode = javascriptGenerator.blockToCode(block);

        // 2. Extract function name and arguments from the block to build a call
        // We need to look at the PROTOTYPE input
        const prototype = block.getInputTargetBlock('PROTOTYPE');
        if (prototype) {
          const funcName = prototype.getFieldValue('NAME');
          // @ts-ignore
          const safeFuncName = javascriptGenerator.nameDB_.getName(funcName, Blockly.Names.NameType.PROCEDURE);

          const args: string[] = [];
          prototype.inputList.forEach((input) => {
            if (input.name.startsWith('ARG_')) {
              const target = input.connection?.targetBlock();
              if (target) {
                // Default values based on type
                if (target.type === 'argument_reporter_number') args.push('0');
                else if (target.type === 'argument_reporter_boolean') args.push('false');
                else args.push('""'); // string
              }
            }
          });

          const callCode = `await ${safeFuncName}(${args.join(', ')});`;
          return defCode + '\n' + callCode;
        }
      }

      // Normal Block Execution
      // If the block is inside a definition, we probably need the definition too?
      // For now, let's assume normal blocks just run their code.
      // BUT if they use arguments, they might fail if not inside the function scope.
      // This is a known limitation of clicking blocks inside a procedure.

      // However, we should also check if we need to include definitions for OTHER blocks calling them.
      // Let's rely on the global definition collection in checkGreenFlagEvents equivalent if needed.
      // But for single block click, usually we just run that block.

      // FIX: If the block is a CALL to a custom function, we need the definition!
      let extraDefs = '';
      if (block.type.startsWith('custom_call_')) {
        const allBlocks = workspaceRef.current.getTopBlocks(false);
        for (const potentialDef of allBlocks) {
          if (potentialDef.type.startsWith('custom_def_')) {
            const defCode = javascriptGenerator.blockToCode(potentialDef);
            extraDefs += defCode + '\n';
          }
        }
      }

      return (extraDefs + javascriptGenerator.blockToCode(block)) as string;
    },
    checkGreenFlagEvents: () => {
      if (!workspaceRef.current || isUploadModeRef.current) return null;
      const workspace = workspaceRef.current;
      // Ensure generator init
      if ((javascriptGenerator as any).init) (javascriptGenerator as any).init(workspace);

      const topBlocks = workspace.getTopBlocks(false);

      // 1. Collect Definitions (Custom Blocks & Procedures)
      let definitions = '';
      for (const block of topBlocks) {
        if (block.type === 'procedures_defnoreturn' || block.type === 'procedures_defreturn' || block.type.startsWith('custom_def_')) {
          const defCode = javascriptGenerator.blockToCode(block);
          if (defCode && typeof defCode === 'string') {
            definitions += defCode + '\n';
          }
        }
      }

      let combinedCode = '';

      for (const block of topBlocks) {
        if (block.type === 'when_flag_clicked') {
          // Flash Feedback
          if ((block as any).setHighlighted) {
            try {
              (block as any).setHighlighted(true);
              setTimeout(() => {
                if ((block as any).setHighlighted) (block as any).setHighlighted(false);
              }, 200);
            } catch (e) {
              /* ignore */
            }
          }

          const nextBlock = block.getNextBlock();
          if (nextBlock) {
            const code = javascriptGenerator.blockToCode(nextBlock);
            if (code && typeof code === 'string') {
              combinedCode += code + '\n';
            }
          }
        }
      }

      if (!combinedCode) return null;
      return definitions + '\n' + combinedCode;
    },
    undo: () => {
      if (workspaceRef.current) {
        workspaceRef.current.undo(false);
      }
    },
    redo: () => {
      if (workspaceRef.current) {
        workspaceRef.current.undo(true);
      }
    },
    getWorkspace: () => workspaceRef.current,
  }));

  // HANDLE MODE SWITCHING & TOOLBOX
  // --- TRANSITION STATE ---
  const [isTransitioning, setIsTransitioning] = React.useState(false);

  // --- 1. EFEITO DE CARGA DE BLOCOS (DESTRUTIVO) ---
  // Dispara apenas quando mudamos o "que" estamos editando (Ator ou Modo)
  useEffect(() => {
    if (workspaceRef.current) {
      setIsTransitioning(true);
      isLoadingBlocks.current = true;

      const timeoutId = setTimeout(() => {
        if (!workspaceRef.current) return;

        // Salva o estado anterior antes de trocar
        const toolbox = isUploadMode ? ToolboxUploadDefinition : ToolboxDefinition;
        workspaceRef.current.updateToolbox(toolbox);

        if (previousSpriteIdRef.current && previousSpriteIdRef.current !== activeSpriteId && !isUploadMode) {
          const json = Blockly.serialization.workspaces.save(workspaceRef.current);
          const code = javascriptGenerator.workspaceToCode(workspaceRef.current);
          updateSpriteBlocks(previousSpriteIdRef.current, json, code);
        }

        try {
          previousSpriteIdRef.current = activeSpriteId;
          workspaceRef.current.clear();
          // workspaceRef.current.getVariableMap().clear(); // Removido para evitar pisque de variáveis

          if (isUploadMode) {
            if (uploadModeBlocks) {
              const cleanJson = { ...uploadModeBlocks };
              delete (cleanJson as any).variables;
              Blockly.serialization.workspaces.load(cleanJson, workspaceRef.current);
            } else {
              const setup = workspaceRef.current.newBlock('setup_block');
              setup.initSvg();
              setup.render();
              setup.moveBy(60, 40);
              setup.setDeletable(false);
              const loop = workspaceRef.current.newBlock('loop_block');
              loop.initSvg();
              loop.render();
              loop.moveBy(360, 40);
              loop.setDeletable(false);
            }
          } else {
            const spriteData = getSpriteById(activeSpriteId);
            if (spriteData && spriteData.blocks) {
              const cleanJson = { ...spriteData.blocks };
              delete (cleanJson as any).variables;
              Blockly.serialization.workspaces.load(cleanJson, workspaceRef.current);
            }
          }

          if ((workspaceRef.current as any).getToolbox()) {
            (workspaceRef.current as any).getToolbox().refreshSelection();
          }
        } catch (e) {
          console.error('[BlocklyWorkspace] Error switching mode:', e);
        } finally {
          if (workspaceRef.current) {
            Blockly.svgResize(workspaceRef.current);
            workspaceRef.current.render();
          }
          isLoadingBlocks.current = false;
          setTimeout(() => setIsTransitioning(false), 100);
        }
      }, 450);

      return () => clearTimeout(timeoutId);
    }
  }, [isUploadMode, activeSpriteId, sprites]); // Sem stageVariables/uploadVariables aqui!

  // --- 2. EFEITO DE SINCRONIZAÇÃO DE VARIÁVEIS (NÃO-DESTRUTIVO) ---
  // Apenas garante que as variáveis do ProjectService existam no workspace
  useEffect(() => {
    if (workspaceRef.current && !isLoadingBlocks.current) {
      const mode = isUploadMode ? 'upload' : 'stage';
      const targetVars = getUserVariables(mode);
      const varMap = workspaceRef.current.getVariableMap();

      targetVars.forEach((v) => {
        if (!varMap.getVariable(v.name)) {
          varMap.createVariable(v.name, v.type);
        }
      });

      // Atualiza toolbox para refletir novas variáveis
      if ((workspaceRef.current as any).getToolbox()) {
        (workspaceRef.current as any).getToolbox().refreshSelection();
      }
    }
  }, [stageVariables, uploadVariables, isUploadMode]);

  useEffect(() => {
    if (!blocklyDiv.current) return;

    if (!workspaceRef.current) {
      // Register Extensions

      if (!Blockly.Extensions.isRegistered(`force_hat`))
        Blockly.Extensions.register('force_hat', function (this: Blockly.Block) {
          // @ts-ignore
          this.hat = 'cap';
        });
      registerCustomExtensions();

      // console.log("Injecting Blockly...");

      // Register blocks (both Stage and Board/Hardware)
      Blockly.defineBlocksWithJsonArray(BlockStageDefinitions);
      Blockly.defineBlocksWithJsonArray(BlockBoardDefinitions);
      Blockly.defineBlocksWithJsonArray(CustomBlockDefinitions); // Register Custom Blocks too

      // SOBRESCRITA DO BLOCO MATH_CHANGE (ADICIONE)
      // Força o campo de variável a aceitar apenas NUMBER
      Blockly.defineBlocksWithJsonArray([
        {
          type: 'math_change',
          message0: '%{BKY_MATH_CHANGE_TITLE}',
          args0: [
            {
              type: 'field_variable',
              name: 'VAR',
              variable: '%{BKY_MATH_CHANGE_TITLE_ITEM}',
              variableTypes: ['Number'], // FILTRO: Apenas números
              defaultType: 'Number',
            },
            {
              type: 'input_value',
              name: 'DELTA',
              check: 'Number',
            },
          ],
          previousStatement: null,
          nextStatement: null,
          style: 'variable_blocks',
          helpUrl: '%{BKY_MATH_CHANGE_HELPURL}',
          extensions: ['math_change_tooltip'],
        },
      ]);

      // Registra extensões de variáveis (Tipagem forte) - APÓS definições para garantir override
      // registerVariableExtensions(); // REMOVIDO: Arquivo deletado

      // BLOQUEIO TOTAL DE OPÇÕES DE VARIÁVEIS NO MENU DE CONTEXTO
      // Monkey-patch no registry para impedir que essas opções sejam registradas ou recriadas
      try {
        const registry = Blockly.ContextMenuRegistry.registry;
        const originalRegister = registry.register.bind(registry);

        // Override do método register para ignorar IDs indesejados
        registry.register = (item: any) => {
          if (item.id === 'variableDelete' || item.id === 'variableRename') {
            return;
          }
          originalRegister(item);
        };

        // BLOQUEIO SEGURO VIA PROTOTYPE (Não quebra o build)
        // Usamos o protótipo do BlockSvg para interceptar o menu de contexto especificamente nos blocos
        const blockSvgProto = (Blockly as any).BlockSvg?.prototype;
        if (blockSvgProto && !blockSvgProto.originalShowContextMenu) {
          blockSvgProto.originalShowContextMenu = blockSvgProto.showContextMenu;
          blockSvgProto.showContextMenu = function (e: Event) {
            // Se o bloco estiver em um Flyout (Toolbox), ignoramos o menu
            if (this.workspace && (this.workspace.isFlyout || (this.workspace.getParent && this.workspace.getParent()?.isFlyout))) {
              return;
            }
            return this.originalShowContextMenu.call(this, e);
          };
        }

        // Limpa os que já existirem (Garante remoção total)
        ['variableDelete', 'variableRename', 'blockDuplicate', 'cleanWorkspace', 'blockCollapseExpand', 'blockInline'].forEach((id) => {
          if (registry.getItem(id)) registry.unregister(id);
        });

        // --- NOVO: OPÇÃO DUPLICAR PILHA (SCRIPT INTEIRO) ---
        const duplicateStackId = 'duplicate_stack_option';

        // Define a opção
        const duplicateStackOption = {
          displayText: 'Duplicar',
          preconditionFn: function (scope: any) {
            const block = scope.block;
            if (!block) return 'hidden';

            // Impedir duplicação dos blocos principais (singletons)
            if (block.type === 'setup_block' || block.type === 'loop_block') {
              return 'disabled';
            }

            return 'enabled';
          },
          callback: function (scope: any) {
            const block = scope.block;
            if (!block) return;

            // 1. Serializa o bloco CLICADO e seus seguidores (Stack)
            // AVISO: Usar block.getRootBlock() aqui duplicaria o Setup inteiro ao clicar dentro dele.
            // Ao usar 'block', permitimos duplicar trechos de lógica de dentro do setup/loop.
            // @ts-ignore
            const json = Blockly.serialization.blocks.save(block);

            if (json) {
              // 2. Deserializa (cria cópia) no workspace atual
              // @ts-ignore
              const newBlock = Blockly.serialization.blocks.append(json, block.workspace) as Blockly.BlockSvg;

              // 3. Move um pouco para não ficar em cima do original
              const xy = block.getRelativeToSurfaceXY();
              newBlock.moveTo(new Blockly.utils.Coordinate(xy.x + 40, xy.y + 40));

              newBlock.initSvg();
              newBlock.render();
              newBlock.select();
            }
          },
          scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
          id: duplicateStackId,
          weight: 0, // Topo da lista
        };

        // Registra (remove antes se existir para evitar erro de hot-reload)
        if (registry.getItem(duplicateStackId)) {
          registry.unregister(duplicateStackId);
        }
        registry.register(duplicateStackOption);
        // ---------------------------------------------------

        // BLOQUEIO DE CONTEXT MENU NA TOOLBOX/FLYOUT (Pedido do usuário)
        // Adicionamos tanto no document quanto na div principal com captura para interceptar antes do Blockly
        blocklyDiv.current?.addEventListener('contextmenu', handleToolboxContextMenu, true);
        document.addEventListener('contextmenu', handleToolboxContextMenu, true);
      } catch (e) {
        console.warn('Falha ao aplicar patch no menu de contexto:', e);
      }

      // Initialize Generators
      initStageGenerators();
      initCustomGenerators(); // Init static custom generators

      registerContinuousToolbox();

      // 1. INICIALIZAÇÃO COM TOOLBOX VAZIO
      // Necessário para evitar erro de callback não encontrado
      const emptyToolbox = { kind: 'categoryToolbox', contents: [] };
      workspaceRef.current = Blockly.inject(blocklyDiv.current, {
        toolbox: emptyToolbox,
        plugins: {
          flyoutsVerticalToolbox: 'ContinuousFlyout',
          metricsManager: 'ContinuousMetrics',
          toolbox: 'ContinuousToolbox',
        },
        renderer: 'zelos',
        theme: CustomGreenTheme,
        trashcan: true,
        zoom: {
          controls: true,
          wheel: true,
          startScale: 0.8,
          maxScale: 3,
          minScale: 0.3,
          scaleSpeed: 1.2,
          pinch: true,
        },
        grid: {
          spacing: 20,
          length: 3,
          colour: '#ccc',
          snap: true,
        },
        move: {
          scrollbars: {
            horizontal: true,
            vertical: true,
          },
          drag: true,
          wheel: false,
        },
      });

      // 2. REGISTRAR CALLBACKS (Antes de carregar o toolbox real)

      // LISTENER GLOBAL DE VARIÁVEIS (CRÍTICO: Deve ser registrado AQUI após o inject)
      // Isso garante que capturamos mudanças vindas do Flyout/Toolbox Continuous
      const blocksToInjectListener = ['variables_set', 'variables_get', 'math_change'];

      workspaceRef.current.addChangeListener((event: any) => {
        if (!workspaceRef.current) return;

        // Ignorar mudanças de valor/campo DURANTE o arrasto para performance,
        // mas permitir CRIAÇÃO (pois arrastar do flyout é uma criação durante o drag)
        if (workspaceRef.current.isDragging() && event.type !== Blockly.Events.BLOCK_CREATE) return;

        // 1. Mudança direta no campo VAR (ex: Dropdown)
        if (event.type === Blockly.Events.BLOCK_CHANGE && event.element === 'field' && event.name === 'VAR') {
          const block = workspaceRef.current?.getBlockById(event.blockId);
          if (block) {
            applyVariableTypeLogic(block, true);
          }
        }

        // 2. Renomeação ou Deleção de Variável -> Atualiza TODOS os blocos
        if (event.type === Blockly.Events.VAR_RENAME || event.type === Blockly.Events.VAR_DELETE) {
          // console.log("[BlocklyWorkspace] Variable Renamed/Deleted. Updating all blocks...");
          const allBlocks = workspaceRef.current?.getAllBlocks(false) || [];
          allBlocks.forEach((b) => {
            if (blocksToInjectListener.includes(b.type)) {
              applyVariableTypeLogic(b, true);
            }
          });
        }

        // 3. Criação de Bloco (Arrastado do Flyout ou Duplicado)
        if (event.type === Blockly.Events.BLOCK_CREATE) {
          const createEvent = event as any; // Avoid type cast issues with abstract event
          if (createEvent.ids) {
            createEvent.ids.forEach((blockId: string) => {
              const block = workspaceRef.current?.getBlockById(blockId);
              if (block && blocksToInjectListener.includes(block.type)) {
                applyVariableTypeLogic(block, true);
              }
            });
          }
        }
        // 4. Proactive Cleanup: Prevent untyped internal variables (like 'i') - REMOVIDO POR SEGURANÇA
      });

      workspaceRef.current.registerButtonCallback('OPEN_VARIABLE_MODAL', (button) => {
        setIsVarModalOpen(true);
      });
      workspaceRef.current.registerButtonCallback('OPEN_VARIABLE_DELETE_MODAL', (button) => {
        setIsVarDeleteModalOpen(true);
      });

      // REGISTER CUSTOM TOOLBOX CALLBACKS
      workspaceRef.current.registerToolboxCategoryCallback('CUSTOM_VARIABLE', (ws) => {
        const mode = isUploadModeRef.current ? 'upload' : 'stage';
        const currentVars = getProjectService().getUserVariables(mode);

        const xmlList: Element[] = [];

        // Botão Criar
        const btnCreate = document.createElement('button');
        btnCreate.setAttribute('text', 'Criar Variável');
        btnCreate.setAttribute('callbackKey', 'OPEN_VARIABLE_MODAL');
        xmlList.push(btnCreate);

        // Botão Apagar (Só mostra se houver variáveis)
        if (currentVars.length > 0) {
          const btnDelete = document.createElement('button');
          btnDelete.setAttribute('text', 'Apagar Variável');
          btnDelete.setAttribute('callbackKey', 'OPEN_VARIABLE_DELETE_MODAL');
          xmlList.push(btnDelete);
        }

        currentVars.forEach((v) => {
          const existing = ws.getVariableMap().getVariable(v.name);
          if (!existing) {
            ws.getVariableMap().createVariable(v.name, v.type);
          }
        });

        const allVars = ws
          .getVariableMap()
          .getAllVariables()
          .filter((v) => typeof (v as any).type === 'string' && (v as any).type !== '');

        if (allVars.length > 0) {
          const lastVar = allVars[allVars.length - 1];
          const lastVarId = lastVar.getId();
          const lastVarName = (lastVar as any).name;
          const lastVarType = (lastVar as any).type;

          const blockSet = document.createElement('block');
          blockSet.setAttribute('type', 'variables_set');
          blockSet.setAttribute('gap', '20');
          const fieldVar = document.createElement('field');
          fieldVar.setAttribute('name', 'VAR');
          fieldVar.setAttribute('id', lastVarId);
          fieldVar.setAttribute('variabletype', lastVarType);
          fieldVar.textContent = lastVarName;
          blockSet.appendChild(fieldVar);

          const valueElem = document.createElement('value');
          valueElem.setAttribute('name', 'VALUE');

          if (lastVarType === 'Number') {
            const shadowElem = document.createElement('shadow');
            shadowElem.setAttribute('type', 'math_number');
            const fieldNum = document.createElement('field');
            fieldNum.setAttribute('name', 'NUM');
            fieldNum.textContent = '0';
            shadowElem.appendChild(fieldNum);
            valueElem.appendChild(shadowElem);
          } else {
            const shadowElem = document.createElement('shadow');
            shadowElem.setAttribute('type', 'text');
            const fieldTxt = document.createElement('field');
            fieldTxt.setAttribute('name', 'TEXT');
            fieldTxt.textContent = '';
            shadowElem.appendChild(fieldTxt);
            valueElem.appendChild(shadowElem);
          }

          blockSet.appendChild(valueElem);
          xmlList.push(blockSet);

          const anyNumberVar = allVars.find((v) => (v as any).type === 'Number');
          if (anyNumberVar) {
            const blockChange = document.createElement('block');
            blockChange.setAttribute('type', 'math_change');
            blockChange.setAttribute('gap', '32');
            const fieldVarChange = document.createElement('field');
            fieldVarChange.setAttribute('name', 'VAR');
            const targetId = lastVarType === 'Number' ? lastVarId : anyNumberVar.getId();
            const targetName = lastVarType === 'Number' ? lastVarName : (anyNumberVar as any).name;

            fieldVarChange.setAttribute('id', targetId);
            fieldVarChange.setAttribute('variabletype', 'Number');
            fieldVarChange.textContent = targetName;
            blockChange.appendChild(fieldVarChange);

            const valueChange = document.createElement('value');
            valueChange.setAttribute('name', 'DELTA');
            const shadowChange = document.createElement('shadow');
            shadowChange.setAttribute('type', 'math_number');
            const fieldNumChange = document.createElement('field');
            fieldNumChange.setAttribute('name', 'NUM');
            fieldNumChange.textContent = '1';
            shadowChange.appendChild(fieldNumChange);
            valueChange.appendChild(shadowChange);
            blockChange.appendChild(valueChange);

            xmlList.push(blockChange);
          }
        }

        for (const variable of allVars) {
          const blockGet = document.createElement('block');
          blockGet.setAttribute('type', 'variables_get');
          blockGet.setAttribute('gap', '8');
          const fieldVar = document.createElement('field');
          fieldVar.setAttribute('name', 'VAR');
          fieldVar.setAttribute('id', variable.getId());
          fieldVar.setAttribute('variabletype', (variable as any).type);
          fieldVar.textContent = (variable as any).name;
          blockGet.appendChild(fieldVar);
          xmlList.push(blockGet);
        }

        return xmlList;
      });

      workspaceRef.current.registerButtonCallback('CREATE_MY_BLOCK_BTN', () => {
        setIsProcModalOpen(true);
      });

      workspaceRef.current.registerToolboxCategoryCallback('MY_PROCEDURES', (ws) => {
        const xmlList = [];

        const btnCreate = document.createElement('button');
        btnCreate.setAttribute('text', 'Criar um Bloco');
        btnCreate.setAttribute('callbackKey', 'CREATE_MY_BLOCK_BTN');
        xmlList.push(btnCreate);

        const blocks = ws.getAllBlocks(false);
        for (const block of blocks) {
          if (block.type.startsWith('custom_def_')) {
            const indexSuffix = block.type.replace('custom_def_', '');
            const callType = 'custom_call_' + indexSuffix;
            const blockXml = document.createElement('block');
            blockXml.setAttribute('type', callType);
            blockXml.setAttribute('gap', '16');
            const prototype = block.getInputTargetBlock('PROTOTYPE');
            if (prototype) {
              prototype.inputList.forEach((input) => {
                if (input.name.startsWith('ARG_')) {
                  const argBlock = input.connection?.targetBlock();
                  if (argBlock) {
                    const valueElem = document.createElement('value');
                    valueElem.setAttribute('name', input.name);
                    if (argBlock.type === 'argument_reporter_string') {
                      const shadowElem = document.createElement('shadow');
                      shadowElem.setAttribute('type', 'text');
                      const field = document.createElement('field');
                      field.setAttribute('name', 'TEXT');
                      field.textContent = '';
                      shadowElem.appendChild(field);
                      valueElem.appendChild(shadowElem);
                    } else if (argBlock.type === 'argument_reporter_number') {
                      const shadowElem = document.createElement('shadow');
                      shadowElem.setAttribute('type', 'math_number');
                      const field = document.createElement('field');
                      field.setAttribute('name', 'NUM');
                      field.textContent = '0';
                      shadowElem.appendChild(field);
                      valueElem.appendChild(shadowElem);
                    }
                    blockXml.appendChild(valueElem);
                  }
                }
              });
            }
            xmlList.push(blockXml);
          }
        }
        return xmlList;
      });

      // 3. CARREGAR TOOLBOX REAL
      const initialToolbox = isUploadMode ? ToolboxUploadDefinition : ToolboxDefinition;
      workspaceRef.current.updateToolbox(initialToolbox);

      Blockly.svgResize(workspaceRef.current);

      (workspaceRef.current as any).getFlyoutScale = function () {
        return 0.6;
      };

      let flyout = workspaceRef.current.getFlyout();
      if (!flyout && (workspaceRef.current as any).getToolbox()) {
        flyout = (workspaceRef.current as any).getToolbox().getFlyout();
      }

      if (flyout) {
        (flyout as any).getFlyoutScale = function () {
          return 0.5;
        };
      }

      if ((workspaceRef.current as any).getToolbox()) {
        (workspaceRef.current as any).getToolbox().refreshSelection();
      }

      const mainListener = (event: Blockly.Events.Abstract) => {
        handleBlocklyEventsRef.current(event);
        handleFlyoutClick(event);
      };
      workspaceRef.current.addChangeListener(mainListener);

      let flyoutWs: Blockly.WorkspaceSvg | null = null;
      flyout = workspaceRef.current.getFlyout();
      if (!flyout && (workspaceRef.current as any).getToolbox()) {
        flyout = (workspaceRef.current as any).getToolbox().getFlyout();
      }

      if (flyout) {
        flyoutWs = flyout.getWorkspace();
        if (flyoutWs) {
          flyoutWs.addChangeListener(mainListener);
        }
      }

      const handleFlyoutClick = (event: Blockly.Events.Abstract) => {
        if (event.type === Blockly.Events.CLICK) {
          if (!isUploadModeRef.current && workspaceRef.current) {
            if (flyoutWs && event.workspaceId === flyoutWs.id) {
              const blockId = (event as any).blockId;
              if (blockId) {
                const block = flyoutWs.getBlockById(blockId);
                if (block && onRunCodeRef.current) {
                  if (!block.isEnabled()) return;
                  try {
                    if ((javascriptGenerator as any).init) (javascriptGenerator as any).init(flyoutWs);
                    const codeOrTuple = javascriptGenerator.blockToCode(block);
                    let codeToRun = '';
                    if (Array.isArray(codeOrTuple)) {
                      codeToRun = `window.alert(${codeOrTuple[0]});`;
                    } else if (typeof codeOrTuple === 'string') {
                      codeToRun = codeOrTuple;
                    }

                    if (workspaceRef.current) {
                      let definitions = '';
                      workspaceRef.current.getTopBlocks(false).forEach((b) => {
                        if (b.type.startsWith('custom_def_')) {
                          const defCode = javascriptGenerator.blockToCode(b);
                          if (typeof defCode === 'string') definitions += defCode + '\n';
                        }
                      });
                      codeToRun = definitions + codeToRun;
                    }
                    if (codeToRun) onRunCodeRef.current(codeToRun);
                  } catch (e) {
                    console.warn(e);
                  }
                }
              }
              return;
            }

            if (workspaceRef.current && event.workspaceId === workspaceRef.current.id) {
              if ((event as any).blockId && onBlockClickRef.current) {
                onBlockClickRef.current((event as any).blockId);
              }
            }
          }
        }
      };

      const flyoutScrollbar = workspaceRef.current.getFlyout();
      if (flyoutScrollbar) {
        const originalSetVisible = (flyoutScrollbar as any).setVisible;
        (flyoutScrollbar as any).setVisible = function (visible: boolean) {
          originalSetVisible.call(this, visible);
          if (!visible) {
            try {
              if ((this as any).scrollbar_ && (this as any).scrollbar_.svgGroup_) {
                (this as any).scrollbar_.svgGroup_.style.display = 'none';
              }
              const domScrollbars = document.querySelectorAll('.blocklyFlyoutScrollbar');
              domScrollbars.forEach((el) => {
                (el as HTMLElement).style.display = 'none';
              });
            } catch (e) {
              console.warn('Erro ao ocultar scrollbar', e);
            }
          } else {
            const domScrollbars = document.querySelectorAll('.blocklyFlyoutScrollbar');
            domScrollbars.forEach((el) => {
              (el as HTMLElement).style.display = '';
            });

            if ((this as any).scrollbar_ && (this as any).scrollbar_.svgGroup_) {
              (this as any).scrollbar_.svgGroup_.style.display = 'block';
            }
          }
        };
      }
    }

    const resizeObserver = new ResizeObserver(() => {
      if (workspaceRef.current) {
        Blockly.svgResize(workspaceRef.current);
      }
    });

    if (blocklyDiv.current) resizeObserver.observe(blocklyDiv.current);
    return () => {
      resizeObserver.disconnect();
      document.removeEventListener('contextmenu', handleToolboxContextMenu, true);
      blocklyDiv.current?.removeEventListener('contextmenu', handleToolboxContextMenu, true);
    };
  }, [activeSpriteId, sprites, handleToolboxContextMenu]);

  // DEPENDENCY activeSpriteId + sprites (to detect Load Project)

  // Lazy load modals to avoid circular deps if any, or just for cleanliness
  const VariableModal = React.lazy(() => import('./modals/VariableModal'));
  const VariableDeleteModal = React.lazy(() => import('./modals/VariableDeleteModal'));
  const ProcedureModal = React.lazy(() => import('./modals/ProcedureModal'));

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={blocklyDiv} style={{ width: '100%', height: '100%' }} />
      {/* Suspense is required for Lazy components */}
      <React.Suspense fallback={null}>
        {workspaceRef.current && (
          <>
            <VariableModal
              isOpen={isVarModalOpen}
              onClose={() => setIsVarModalOpen(false)}
              workspace={workspaceRef.current}
              isUploadMode={isUploadMode}
            />
            <VariableDeleteModal
              isOpen={isVarDeleteModalOpen}
              onClose={() => {
                setIsVarDeleteModalOpen(false);
                setPreselectedVar(null);
              }}
              workspace={workspaceRef.current}
              isUploadMode={isUploadMode}
              initialSelection={preselectedVar}
            />
            <ProcedureModal isOpen={isProcModalOpen} onClose={() => setIsProcModalOpen(false)} workspace={workspaceRef.current} />
          </>
        )}
      </React.Suspense>
    </div>
  );
});

// Set display name for debugging
BlocklyWorkspace.displayName = 'BlocklyWorkspace';

export default BlocklyWorkspace;
