/**
 * useCodeExecution - Orquestrador de Execução de Código.
 * 
 * Este hook gerencia o fluxo de rodar e parar o projeto. Ele coordena:
 * 1. O clique no botão "Bandeira Verde" (executa código de todos os atores).
 * 2. O clique no botão "Parar" (interrompe todas as execuções).
 * 3. O clique em blocos individuais no workspace (execução imediata).
 * 4. A ponte com o sandbox para execução isolada.
 */
import { useCallback } from "react";
import { useStage } from "../context/StageContext";
import { useProject } from "../context/ProjectContext";
import { useSandboxExecutor } from "./useSandboxExecutor";
import { HeadlessBlocklyRunner } from "../lib/HeadlessBlocklyRunner";
import { BlocklyWorkspaceRef } from "../components/BlocklyWorkspace";

export function useCodeExecution(blocklyRef: React.RefObject<BlocklyWorkspaceRef | null>) {
    const stageContext = useStage();
    const { sprites, activeSpriteId } = useProject();
    const { executeInSandbox } = useSandboxExecutor();
    const { start, stop } = stageContext;

    // --- NÚCLEO DE EXECUÇÃO ---
    const executeSpriteCode = useCallback(async (spriteId: string, code: string) => {
        if (!code || !code.trim()) return;

        if (stageContext.setForceExecution) stageContext.setForceExecution(true);

        try {
            // console.log(`[Sandbox] Executing for ${spriteId}`);
            await executeInSandbox(spriteId, code);
        } catch (e) {
            console.error(`Error executing code for sprite ${spriteId}:`, e);
        } finally {
            if (stageContext.setForceExecution) stageContext.setForceExecution(false);
        }
    }, [stageContext, executeInSandbox]);

    // --- HANDLERS (TRATADORES DE EVENTOS) ---
    const handleRun = useCallback(async () => {
        // Lógica de reinício
        if (stageContext.isRunning) {
            stop();
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        start();

        // 1. Força execução para o setup
        if (stageContext.setForceExecution) stageContext.setForceExecution(true);

        try {
            const executionPromises: Promise<void>[] = [];

            for (const sprite of sprites) {
                let codeToRun = "";

                if (sprite.id === activeSpriteId) {
                    // Ativo: Workspace Principal
                    if (blocklyRef.current && blocklyRef.current.checkGreenFlagEvents) {
                        const activeCode = blocklyRef.current.checkGreenFlagEvents();
                        if (activeCode) codeToRun = activeCode;
                    }
                } else {
                    // Ator Inativo: Verificação Headless
                    if (sprite.blocks) {
                        codeToRun = HeadlessBlocklyRunner.getGreenFlagCode(sprite.blocks);
                    }
                }

                if (codeToRun) {
                    executionPromises.push(executeSpriteCode(sprite.id, codeToRun));
                }
            }

            if (executionPromises.length > 0) {
                await Promise.all(executionPromises);
            }

        } catch (e) {
            console.warn("Error in handleRun:", e);
        } finally {
            if (stageContext.setForceExecution) stageContext.setForceExecution(false);
        }
    }, [stageContext, stop, start, sprites, activeSpriteId, blocklyRef, executeSpriteCode]);

    const handleStop = useCallback(() => {
        // console.log("--- STOP CLICKED ---");
        stop();
    }, [stop]);

    const handleBlockClick = useCallback(async (blockId: string) => {
        // console.log("Block Clicked:", blockId);
        if (!blocklyRef.current) return;

        const code = blocklyRef.current.generateCodeForBlock(blockId);
        if (!code) return;

        // console.log("Generated Code for Block Click:", code);
        await executeSpriteCode(activeSpriteId, code);
    }, [blocklyRef, activeSpriteId, executeSpriteCode]);

    const handleRunCode = useCallback(async (code: string) => {
        // console.log("Run Code Request:", code);
        await executeSpriteCode(activeSpriteId, code);
    }, [activeSpriteId, executeSpriteCode]);

    return {
        executeSpriteCode,
        handleRun,
        handleStop,
        handleBlockClick,
        handleRunCode
    };
}
