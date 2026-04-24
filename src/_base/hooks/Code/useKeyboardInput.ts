/**
 * useKeyboardInput - Gerenciador de Entrada de Teclado Global.
 *
 * Captura eventos de pressionamento de tecla em toda a janela e despacha para
 * os atores que possuem blocos "quando a tecla [pressionada]". Ele lida tanto
 * com o ator ativo quanto com atores em segundo plano (via Headless Runner).
 */
/**
 * Captura e redirecionamento de eventos de teclado para o palco de simulação.
 */
import { useEffect } from 'react';
import { useExecutionRunner } from '../../context/RuntimeContext';
import { useUI } from '../../context/UIContext';
import { useProject } from '../../context/ProjectContext';
import { HeadlessBlocklyRunner } from '../../lib/HeadlessBlocklyRunner';
import { BlocklyWorkspaceRef } from '../../domain/entities/IBlockly';

type ExecuteSpriteCodeFn = (spriteId: string, code: string) => Promise<void>;

export function useKeyboardInput(blocklyRef: React.RefObject<BlocklyWorkspaceRef | null>, executeSpriteCode: ExecuteSpriteCodeFn) {
  const stageContext = useExecutionRunner();
  const { isUploadMode } = useUI();
  // board removed
  const { sprites, activeSpriteId } = useProject();

  const { setForceExecution } = stageContext;

  useEffect(() => {
    // REGISTRO DO EVENT LISTENER:
    // Adiciona um listener global para eventos de 'keydown' na janela.
    const handleGlobalKeyDown = async (e: KeyboardEvent) => {
      // FILTRO DE FOCO (UX):
      // Ignoramos eventos de teclado se o usuário estiver digitando em um
      // campo de texto (INPUT/TEXTAREA) ou se o modo de upload estiver ativo
      // (onde as teclas devem ir para a placa, não para o simulador).
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
      if (isUploadMode) return;

      const key = e.key;

      // 0. PREVENT DEFAULT:
      // O Espaço no navegador costuma "clicar" em botões focados (como o Play)
      // ou rolar a página. Vamos prevenir isso para que apenas o simulador
      // responda ao comando.
      if (key === ' ') e.preventDefault();

      // 1. Força Execução (Incremento de contador)
      // Sinaliza ao runner que uma execução forçada está em andamento,
      // o que pode ser usado para controlar o fluxo de simulação.
      if (setForceExecution) setForceExecution(true);

      try {
        // COLETA DE PROMESAS DE EXECUÇÃO:
        // Armazena todas as promessas de execução de código para aguardar
        // a conclusão de todas elas simultaneamente.
        const executionPromises: Promise<void>[] = [];

        // 2. Itera por TODOS os atores
        // Cada ator pode ter um bloco "quando a tecla [pressionada]".
        for (const sprite of sprites) {
          let codeToRun = '';

          if (sprite.id === activeSpriteId) {
            // Ator Ativo: Pergunta ao BlocklyWorkspace (Visualização Atual)
            // Para o ator ativo, o código é extraído diretamente do workspace Blockly
            // que está visível e interativo.
            if (blocklyRef.current) {
              const activeCode = blocklyRef.current.checkKeyEvents(key);
              if (activeCode) codeToRun = activeCode;
            }
          } else {
            // Ator Inativo: Verificação Headless
            // Para atores inativos, usamos o HeadlessBlocklyRunner para
            // verificar seus blocos sem renderizar o workspace.
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
        if (setForceExecution) setForceExecution(false);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [sprites, activeSpriteId, setForceExecution, executeSpriteCode, blocklyRef, isUploadMode]);
}
