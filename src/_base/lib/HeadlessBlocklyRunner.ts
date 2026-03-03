/**
 * HeadlessBlocklyRunner - Executor de Blocos em Segundo Plano.
 * 
 * Esta classe utilitária permite carregar e gerar código para blocos do Blockly 
 * sem a necessidade de uma interface gráfica (workspace visível). É utilizada 
 * principalmente para disparar eventos (Bandeira Verde, Teclas) para atores 
 * que não estão selecionados no momento.
 */
import * as Blockly from 'blockly/core';
import { javascriptGenerator } from 'blockly/javascript';

export class HeadlessBlocklyRunner {
    /**
     * Generates code for "When Green Flag Clicked" blocks from a JSON block definition.
     * Uses a headless workspace to load blocks and generate code without UI.
     * @param blocks JSON object representing the blocks (Blockly.serialization)
     * @returns Generated JavaScript code or empty string
     */
    public static getGreenFlagCode(blocks: any): string {
        if (!blocks) return "";

        const headlessWs = new Blockly.Workspace();
        try {
            Blockly.serialization.workspaces.load(blocks, headlessWs);

            // Init Generator
            // Init Generator
            const generator = javascriptGenerator as unknown as { init: (ws: Blockly.Workspace) => void };
            if (generator.init) generator.init(headlessWs);

            const topBlocks = headlessWs.getTopBlocks(false);
            let definitions = "";
            let combinedCode = "";

            // 1. Collect Definitions (Custom Blocks & Procedures)
            for (const block of topBlocks) {
                if (block.type === 'procedures_defnoreturn' ||
                    block.type === 'procedures_defreturn' ||
                    block.type.startsWith('custom_def_')) {
                    const defCode = javascriptGenerator.blockToCode(block);
                    if (defCode && typeof defCode === 'string') {
                        definitions += defCode + "\n";
                    }
                }
            }

            // 2. Find and Generate Flag Blocks
            for (const block of topBlocks) {
                if (block.type === 'when_flag_clicked') {
                    const nextBlock = block.getNextBlock();
                    if (nextBlock) {
                        const code = javascriptGenerator.blockToCode(nextBlock);
                        if (code && typeof code === 'string') {
                            combinedCode += code + "\n";
                        }
                    }
                }
            }

            return combinedCode ? definitions + "\n" + combinedCode : "";

        } catch (err) {
            console.warn(`[HeadlessRunner] Error generating Green Flag code:`, err);
            return "";
        } finally {
            headlessWs.dispose();
        }
    }

    /**
     * Generates code for "When Key Pressed" blocks matching the given key.
     * @param blocks JSON object representing the blocks
     * @param key The key pressed (e.g. "a", "ArrowUp", " ")
     * @returns Generated JavaScript code or empty string
     */
    public static getKeyPressCode(blocks: any, key: string): string {
        if (!blocks) return "";

        const headlessWs = new Blockly.Workspace();
        try {
            Blockly.serialization.workspaces.load(blocks, headlessWs);

            // Init Generator
            // Init Generator
            const generator = javascriptGenerator as unknown as { init: (ws: Blockly.Workspace) => void };
            if (generator.init) generator.init(headlessWs);

            const topBlocks = headlessWs.getTopBlocks(false);
            let combinedCode = "";

            for (const block of topBlocks) {
                if (block.type === 'event_when_key_pressed') {
                    const keyOption = block.getFieldValue('KEY_OPTION');

                    // Match Logic
                    let isMatch = false;
                    if (keyOption === key) isMatch = true;
                    else if (keyOption.toLowerCase() === key.toLowerCase()) isMatch = true;
                    else if (keyOption === "space" && key === " ") isMatch = true;
                    else if (keyOption === "up arrow" && key === "ArrowUp") isMatch = true;
                    else if (keyOption === "down arrow" && key === "ArrowDown") isMatch = true;
                    else if (keyOption === "right arrow" && key === "ArrowRight") isMatch = true;
                    else if (keyOption === "left arrow" && key === "ArrowLeft") isMatch = true;
                    else if (keyOption === "enter" && key === "Enter") isMatch = true;

                    if (isMatch) {
                        const nextBlock = block.getNextBlock();
                        if (nextBlock) {
                            const code = javascriptGenerator.blockToCode(nextBlock);
                            if (code && typeof code === 'string') {
                                combinedCode += code + "\n";
                            }
                        }
                    }
                }
            }

            return combinedCode;

        } catch (err) {
            console.warn(`[HeadlessRunner] Error generating Key Press code:`, err);
            return "";
        } finally {
            headlessWs.dispose();
        }
    }
}
