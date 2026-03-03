/**
 * useKeyboardInput - Gerenciador de Entrada de Teclado Global.
 * 
 * Captura eventos de pressionamento de tecla em toda a janela e despacha para
 * os atores que possuem blocos "quando a tecla [pressionada]". Ele lida tanto
 * com o ator ativo quanto com atores em segundo plano (via Headless Runner).
 */
import { useEffect } from "react";
import { useStage } from "../context/StageContext";
import { useProject } from "../context/ProjectContext";
import { HeadlessBlocklyRunner } from "../lib/HeadlessBlocklyRunner";
import { BlocklyWorkspaceRef } from "../components/BlocklyWorkspace";

type ExecuteSpriteCodeFn = (spriteId: string, code: string) => Promise<void>;

export function useKeyboardInput(
    blocklyRef: React.RefObject<BlocklyWorkspaceRef | null>,
    executeSpriteCode: ExecuteSpriteCodeFn
) {
    const stageContext = useStage();
    const { sprites, activeSpriteId } = useProject();

    useEffect(() => {
        const handleGlobalKeyDown = async (e: KeyboardEvent) => {
            // Ignora inputs e modo upload
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
            if (stageContext.isUploadMode) return;

            const key = e.key;

            // 1. Força Execução (Incremento de contador)
            if (stageContext.setForceExecution) stageContext.setForceExecution(true);

            try {
                const executionPromises: Promise<void>[] = [];

                // 2. Itera por TODOS os atores
                for (const sprite of sprites) {
                    let codeToRun = "";

                    if (sprite.id === activeSpriteId) {
                        // Ator Ativo: Pergunta ao BlocklyWorkspace (Visualização Atual)
                        if (blocklyRef.current) {
                            const activeCode = blocklyRef.current.checkKeyEvents(key);
                            if (activeCode) codeToRun = activeCode;
                        }
                    } else {
                        // Ator Inativo: Verificação Headless
                        if (sprite.blocks) {
                            codeToRun = HeadlessBlocklyRunner.getKeyPressCode(sprite.blocks, key);
                        }
                    }

                    // 3. Fila de Execução se o código for encontrado
                    if (codeToRun) {
                        executionPromises.push(executeSpriteCode(sprite.id, codeToRun));
                    }
                }

                // Aguarda todos os atores terminarem a execução deste passo
                if (executionPromises.length > 0) {
                    await Promise.all(executionPromises);
                }

            } finally {
                if (stageContext.setForceExecution) stageContext.setForceExecution(false);
            }
        };

        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [sprites, activeSpriteId, stageContext, executeSpriteCode, blocklyRef]);
}
