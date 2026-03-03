/**
 * useSandboxExecutor - Motor de Execução Isolada (Sandbox).
 * 
 * Este hook é responsável por gerenciar a execução de código JavaScript em ambientes 
 * seguros e isolados (usando iframes via a classe CodeExecutor). Ele:
 * 1. Cria e mantém um executor para cada ator.
 * 2. Faz o roteamento das mensagens do sandbox (ex: "moverse") para ações reais no palco.
 * 3. Garante que um ator não possa interferir no código de outro.
 */
import { useEffect, useRef } from 'react';
import { CodeExecutor } from '../lib/CodeExecutor';
import { useStage } from '../context/StageContext';
import { SpriteData } from '../types'; // Ou '../types' se já tiver movido

export function useSandboxExecutor() {
    const stageContext = useStage(); // Acesso às funções reais (move, turn, etc)
    const executorsRef = useRef<Map<string, CodeExecutor>>(new Map());

    // --- 1. OUVINTE DE MENSAGENS (Ouvir os iframes) ---
    useEffect(() => {
        const handleMessage = async (event: MessageEvent) => {
            const data = event.data;
            if (!data || data.type !== 'SPRITE_ACTION') return;

            // data = { action: 'move', args: [10], requestId: 'abc', ... }

            // Precisamos saber QUAL SPRITE mandou isso.
            // O CodeExecutor (iframe) não sabe quem é, mas podemos descobrir pela 'origem' ou 
            // no futuro passar o ID na mensagem. 
            // POR AGORA: Vamos assumir que quem manda é o "Ator Ativo" ou teremos que melhorar isso.
            // CORREÇÃO: O CodeExecutor sabe o ID! Vamos injetar o ID na mensagem lá no CodeExecutor?
            // Ou melhor: Vamos procurar quem é o dono desse 'source' window.

            const spriteId = findSpriteIdByWindow(event.source as Window);
            if (!spriteId) return;

            try {
                let result;

                // Mapeia ações do Sandbox -> StageContext
                if (data.action === 'move') await stageContext.move(data.args[0], spriteId);
                else if (data.action === 'turn') await stageContext.turn(data.args[0], spriteId);
                else if (data.action === 'say') stageContext.say(data.args[0], spriteId); // Say é sincrono visualmente
                else if (data.action === 'sayFor') await stageContext.sayFor(data.args[0], data.args[1], spriteId);
                else if (data.action === 'think') stageContext.think(data.args[0], spriteId); // NEW
                else if (data.action === 'thinkFor') await stageContext.thinkFor(data.args[0], data.args[1], spriteId); // NEW
                else if (data.action === 'wait') await stageContext.wait(data.args[0]);
                else if (data.action === 'goTo') stageContext.goTo(data.args[0], data.args[1], spriteId);
                else if (data.action === 'setX') await stageContext.setX(data.args[0], spriteId);
                else if (data.action === 'setY') await stageContext.setY(data.args[0], spriteId);
                else if (data.action === 'addX') await stageContext.addX(data.args[0], spriteId); // NEW
                else if (data.action === 'addY') await stageContext.addY(data.args[0], spriteId); // NEW
                else if (data.action === 'goToMouse') await stageContext.goToMouse(spriteId); // NEW
                else if (data.action === 'pointToMouse') await stageContext.pointToMouse(spriteId); // NEW
                else if (data.action === 'pointInDirection') stageContext.setAngle(data.args[0], spriteId); // Mapeado para setAngle
                else if (data.action === 'bounceOnEdge') await stageContext.bounceOnEdge(spriteId); // NOVO

                // Aparência
                else if (data.action === 'switchCostume') await stageContext.switchCostume(data.args[0], spriteId); // NOVO
                else if (data.action === 'switchBackdrop') stageContext.switchBackdrop(data.args[0]); // NOVO (Backdrop é global)

                // Visibilidade & Tamanho
                else if (data.action === 'setSize') await stageContext.setSize(data.args[0], spriteId); // NOVO
                else if (data.action === 'changeSize') await stageContext.changeSize(data.args[0], spriteId); // NOVO
                else if (data.action === 'show') await stageContext.show(spriteId); // NOVO
                else if (data.action === 'hide') await stageContext.hide(spriteId); // NOVO



                // Responde: "Feito!"
                (event.source as Window).postMessage({
                    type: 'ACTION_DONE',
                    requestId: data.requestId,
                    result
                }, '*');

            } catch (e: any) {
                // Responde: "Deu erro!"
                (event.source as Window).postMessage({
                    type: 'ACTION_DONE',
                    requestId: data.requestId,
                    error: e.message || String(e)
                }, '*');
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [stageContext]);

    // Helper para achar quem mandou a mensagem
    const findSpriteIdByWindow = (win: Window): string | null => {
        for (const [id, executor] of executorsRef.current.entries()) {
            if (executor.iframe && executor.iframe.contentWindow === win) {
                return id;
            }
        }
        return null;
    };

    // --- 2. FUNÇÃO DE EXECUÇÃO (Para substituir o executeSpriteCode) ---
    const executeInSandbox = (spriteId: string, code: string) => {
        let executor = executorsRef.current.get(spriteId);

        // Se não existir, cria um
        if (!executor) {
            executor = new CodeExecutor(spriteId);
            executorsRef.current.set(spriteId, executor);
        }

        // Manda rodar!
        return executor.run(code);
    };

    // Limpeza ao desmontar
    useEffect(() => {
        return () => {
            executorsRef.current.forEach(ex => ex.dispose());
            executorsRef.current.clear();
        };
    }, []);

    return { executeInSandbox };
}