/**
 * Utilitário de persistência que serializa o estado do app em arquivos .pico e vice-versa.
 * Garante que atores, blocos e configurações sejam salvos e restaurados corretamente.
 */
import { registerCustomBlockFromSpec } from '../config/custom_definitions';
import { getProjectService } from '../services/ProjectService';
import { SpriteData, BackdropData, IBlocklyWorkspaceJson, CustomBlockSpec, IBlocklyBlock, SoundData } from '../domain/entities';
import * as Blockly from 'blockly/core';
import { javascriptGenerator } from 'blockly/javascript';

export interface IProjectContextUI {
    isUploadMode: boolean;
    uploadModeBlocks: IBlocklyWorkspaceJson | string | null;
    uploadCode: string;

    // Setters para carregamento de projeto
    setIsUploadMode: (val: boolean) => void;
    setUploadModeBlocks: (val: IBlocklyWorkspaceJson | string | null) => void;
    setUploadCode: (val: string) => void;

    // Dados do palco como fallback
    backdrops: BackdropData[];
    activeBackdropId: string;
    activeSpriteId: string;
}

// Interface do Arquivo de Projeto
export interface ProjectFile {
    metadata: {
        version: string;
        timestamp: string;
    };
    settings: {
        mode: 'stage' | 'upload';
    };
    stage: {
        activeSpriteId: string;
        backdrops?: BackdropDto[];
        activeBackdropId?: string;
    };
    sprites: SpriteDto[];
    uploadMode: {
        blocks: IBlocklyWorkspaceJson | string | null; // String JSON ou Objeto
        code: string;
    };
    customProcedures?: CustomBlockSpec[]; // Definições de blocos customizados
}

interface SpriteDto {
    id: string;
    name: string;
    x: number;
    y: number;
    size: number;
    angle: number;
    visible: boolean;
    costume: string | null; // Base64 ou URL
    blocks: IBlocklyWorkspaceJson | undefined; // JSON do Blockly
    variables?: { id: string, name: string, type: string, value: string | number | boolean | null, isGlobal: boolean }[];
    rotationStyle?: 'all around' | 'left-right' | "don't rotate";
    sounds?: SoundData[];
    currentSoundId?: string | null;
    volume?: number;
    bubbleText?: string;
    bubbleType?: 'say' | 'think' | null;
}

interface BackdropDto {
    id: string;
    name: string;
    url: string;
}

export const ProjectManager = {
    /**
     * Gera o objeto JSON do projeto atual.
     */
    serializeProject: (context: IProjectContextUI): ProjectFile => {
        // Obtém sprites do ProjectService (fonte única de verdade para blocos)
        const projectService = getProjectService();
        const allSprites = projectService.getSprites();

        const sprites: SpriteDto[] = allSprites.map(s => ({
            id: s.id,
            name: s.name,
            x: s.x,
            y: s.y,
            size: s.size,
            angle: s.angle,
            visible: s.visible,
            rotationStyle: s.rotationStyle,
            costume: s.costume,
            blocks: s.blocks,
            variables: s.blocks && s.blocks.variables ? s.blocks.variables.map(v => ({
                id: v.id,
                name: v.name,
                type: v.type, // Tipo da variável no Blockly
                value: 0, // Valor padrão (Blockly não armazena valor corrente no JSON estático)
                isGlobal: true // Simplificação: assume global por padrão
            })) : [],
            sounds: s.sounds,
            currentSoundId: s.currentSoundId,
            volume: s.volume,
            bubbleText: s.bubbleText,
            bubbleType: s.bubbleType
        }));

        // Extração de procedimentos customizados não é mais necessária aqui,
        // pois usamos o campo customProcedures no arquivo de projeto.

        const backdrops: BackdropDto[] = context.backdrops.map(b => ({
            id: b.id,
            name: b.name,
            url: b.url
        }));

        return {
            metadata: {
                version: "1.0.0",
                timestamp: new Date().toISOString()
            },
            customProcedures: [],

            settings: {
                mode: context.isUploadMode ? 'upload' : 'stage'
            },
            stage: {
                activeSpriteId: context.activeSpriteId,
                backdrops: backdrops,
                activeBackdropId: context.activeBackdropId
            },
            sprites: sprites,
            uploadMode: {
                blocks: context.uploadModeBlocks,
                code: context.uploadCode
            }
        };
    },

    /**
     * Salva o projeto em um arquivo .json (Download no navegador).
     * @param context StageContext para dados de modo e upload
     * @param fileName Nome do arquivo
     * @param currentWorkspace Workspace Blockly atual (opcional) - se fornecido, salva blocos do sprite ativo antes de serializar
     */
    saveProject: (context: IProjectContextUI, fileName: string = "meu_projeto.json", currentWorkspace?: Blockly.WorkspaceSvg) => {
        try {
            // Se temos um workspace, salvar blocos do sprite ativo antes de serializar
            if (currentWorkspace && !context.isUploadMode) {
                const projectService = getProjectService();
                const activeSpriteId = projectService.getActiveSpriteId();
                const json = Blockly.serialization.workspaces.save(currentWorkspace) as { blocks?: { languageVersion?: number, blocks?: unknown[] }, variables?: unknown[] };
                const code = javascriptGenerator.workspaceToCode(currentWorkspace);
                
                // Garante que a estrutura do JSON tenha o formato esperado
                const blocksJson: IBlocklyWorkspaceJson = {
                    blocks: {
                        languageVersion: json.blocks?.languageVersion ?? 0,
                        blocks: (json.blocks?.blocks || []) as IBlocklyBlock[]
                    },
                    variables: json.variables as { id: string, name: string, type: string }[] | undefined
                };
                
                projectService.updateSpriteBlocks(activeSpriteId, blocksJson, code);
            }

            const data = ProjectManager.serializeProject(context);
            const jsonString = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonString], { type: "application/json" });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            // console.log("Projeto salvo com sucesso!");
        } catch (e) {
            console.error("Erro ao salvar projeto:", e);
            alert("Erro ao salvar projeto.");
        }
    },

    /**
     * Carrega um projeto a partir de um objeto JSON.
     */
    loadProject: (json: ProjectFile, context: IProjectContextUI) => {
        if (!json || !json.sprites) {
            console.error("Arquivo de projeto inválido.");
            alert("Arquivo inválido.");
            return;
        }

        // 1. Restaurar Modo
        if (json.settings && json.settings.mode) {
            context.setIsUploadMode(json.settings.mode === 'upload');
        }

        // 2. Restaurar Sprites
        // Converter DTO para SpriteData (mantendo compatibilidade)
        const newSprites: SpriteData[] = json.sprites.map(s => {
            const defaultCostumeId = 'default_c1';
            return {
                id: s.id || crypto.randomUUID(),
                name: s.name,
                x: s.x,
                y: s.y,
                size: s.size,
                angle: s.angle,
                visible: s.visible ?? true,
                costume: s.costume,
                // Inicialização de propriedades ausentes
                costumes: [{ id: defaultCostumeId, name: 'default', url: s.costume || '' }],
                currentCostumeId: defaultCostumeId,
                sounds: s.sounds || [],
                currentSoundId: s.currentSoundId ?? null,
                volume: s.volume ?? 100,
                bubbleText: s.bubbleText || '',
                bubbleType: s.bubbleType || null,
                blocks: s.blocks || undefined,
                variables: s.variables || [], // Carrega variáveis salvas
                code: "", // O código será gerado novamente pelo Blockly ao carregar
                rotationStyle: s.rotationStyle || 'all around'
            };
        });

        // 2.a Varredura e registro de blocos customizados (CORREÇÃO CRÍTICA)
        // MOVIDO ANTES do setSprites para garantir que definições existam antes da renderização!
        const registeredIDs = new Set<string>();
        // 2. Fallback por varredura (Formato antigo / Metadados ausentes)
        json.sprites.forEach(sprite => {
            if (sprite.blocks && sprite.blocks.blocks && sprite.blocks.blocks.blocks) {
                const traverseBlocks = (block: IBlocklyBlock | undefined) => {
                    if (!block) return;
                    if (block.type && block.type.startsWith('custom_def_')) {
                        const id = block.type.replace('custom_def_', '');
                        if (!registeredIDs.has(id)) {
                            let protoBlock: IBlocklyBlock | null = null;
                            if (block.inputs && block.inputs.PROTOTYPE && block.inputs.PROTOTYPE.block) {
                                protoBlock = block.inputs.PROTOTYPE.block;
                            }
 
                            if (protoBlock) {
                                const name = protoBlock.fields ? String(protoBlock.fields.NAME || "Function " + id) : "Function " + id;
                                const args: { type: string, value: string }[] = [];
                                if (protoBlock.inputs) {
                                    let i = 0;
                                    while (true) {
                                        const key = "ARG_" + i;
                                        if (!protoBlock.inputs[key]) break;
                                        const input = protoBlock.inputs[key];
                                        const shadow = input.shadow || input.block;
                                        if (shadow) {
                                            let type = "input";
                                            if (shadow.type === "argument_reporter_number") type = "number";
                                            else if (shadow.type === "argument_reporter_boolean") type = "bool";
                                            else if (shadow.type === "argument_reporter_string") type = "input";
                                            args.push({ type: type, value: `arg${i + 1} ` });
                                        } else {
                                            args.push({ type: "input", value: `arg${i + 1} ` });
                                        }
                                        i++;
                                    }
                                }
                                try {
                                    registerCustomBlockFromSpec({ id, name, args });
                                    registeredIDs.add(id);
                                } catch (e) {
                                    console.error("Falha no registro de fallback para", id, e);
                                }
                            }
                        }
                    }
                    if (block.next) traverseBlocks(block.next.block);
                };
 
                const topBlocks = sprite.blocks.blocks.blocks;
                if (Array.isArray(topBlocks)) {
                    topBlocks.forEach(b => traverseBlocks(b));
                }
            }
        });

        // Usa Metadados se disponíveis (Método preferido)
        if (json.customProcedures && Array.isArray(json.customProcedures)) {
            json.customProcedures.forEach((proc) => {
                // Só registra se não foi registrado pelo fallback de varredura
                if (!registeredIDs.has(proc.id)) {
                    registerCustomBlockFromSpec(proc);
                    registeredIDs.add(proc.id);
                }
            });
        }

        // AGORA seta sprites via ProjectService, que propagará para todos os contextos.
        const projectService = getProjectService();
        projectService.setSprites(newSprites);

        // 3. Restaurar Sprite Ativo
        if (json.stage && json.stage.activeSpriteId) {
            // Verificar se ID existe, senão pegar o primeiro
            const exists = newSprites.find(s => s.id === json.stage.activeSpriteId);
            if (exists) {
                projectService.setActiveSpriteId(json.stage.activeSpriteId);
            } else if (newSprites.length > 0) {
                projectService.setActiveSpriteId(newSprites[0].id);
            }
        } else if (newSprites.length > 0) {
            projectService.setActiveSpriteId(newSprites[0].id);
        }

        // 4. Restaurar Backdrops (CRITICAL FIX)
        if (json.stage && json.stage.backdrops && Array.isArray(json.stage.backdrops)) {
            // Converte DTO para entidade de dados
            const newBackdrops = json.stage.backdrops.map((b: { id: string; name: string; url: string; sounds?: unknown; currentSoundId?: unknown }) => ({
                id: b.id,
                name: b.name,
                url: b.url,
                sounds: Array.isArray(b.sounds) ? b.sounds : [],
                currentSoundId: typeof b.currentSoundId === 'string' ? b.currentSoundId : null
            }));

            // Usa ProjectService diretamente (Fonte Única de Verdade)
            // StageContext sincronizará via assinatura de eventos
            projectService.setBackdrops(newBackdrops);

            if (json.stage.activeBackdropId) {
                projectService.setActiveBackdropId(json.stage.activeBackdropId);
            } else if (newBackdrops.length > 0) {
                projectService.setActiveBackdropId(newBackdrops[0].id);
            }
        }

        // 4. Restaurar Upload Mode
        if (json.uploadMode) {
            context.setUploadModeBlocks(json.uploadMode.blocks);
            context.setUploadCode(json.uploadMode.code || "");
        }
    },

    /**
     * Helper para ler arquivo do input file e carregar.
     */
    handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>, context: IProjectContextUI) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const json = JSON.parse(content) as ProjectFile;
                ProjectManager.loadProject(json, context);
            } catch (err) {
                console.error("Erro ao ler arquivo:", err);
                alert("Erro ao ler arquivo de projeto.");
            }
        };
        reader.readAsText(file);
    }
};
