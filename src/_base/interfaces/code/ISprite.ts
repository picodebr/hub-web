/**
 * ISprite - Estruturas de Dados para Atores (Sprites) e Fantasias.
 * 
 * Define a forma como os dados de um ator são armazenados e manipulados no sistema. 
 * Inclui posição (x, y), ângulo, tamanho, visibilidade, balões de fala e, crucialmente, 
 * os blocos do Blockly e o código gerado associado.
 */

export interface CostumeData {
    id: string;
    name: string;
    url: string;
}


export type BlocklyJson = Record<string, any>;


export interface SpriteVariable {
    id: string;
    name: string;
    type: string;
    value: any;
    isGlobal: boolean;
}

export interface SpriteData {
    id: string;
    name: string;
    x: number;
    y: number;
    angle: number;
    size: number;
    visible: boolean;
    costume: string | null; // URL or Base64
    costumes: CostumeData[]; // List of costumes
    currentCostumeId: string; // ID of the current costume
    bubbleText: string;
    bubbleType: 'say' | 'think' | null;
    blocks?: BlocklyJson; // Blockly JSON
    variables?: SpriteVariable[]; // Explicitly stored variables
    code?: string; // Generated code
    viewState?: any; // Visual state of blocks
}

