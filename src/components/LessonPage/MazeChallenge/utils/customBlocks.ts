/* eslint-disable indent */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { MazePlayer } from '../interfaces';

export const customBlocksTypes = <const>[
  'movement_forward',
  'movement_rotate',
  'controls_if_path',
  'controls_if_else_path',
  'controls_repeat_until_reach_end',
];
const playerImages: Record<MazePlayer, string> = {
  ant: `/challenges/icons/sugar.svg`,
  bicicle: `/challenges/icons/location.png`,
  car: `/challenges/icons/flag.png`,
  drone: `/challenges/icons/target.png`,
};

type CustomBlockType = (typeof customBlocksTypes)[number];

interface BlocklyArgs {
  type: string;
  name?: string;
  options?: Array<Array<string>>;
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface BlocklyComponent {
  type: CustomBlockType;
  message0: string;
  args0?: BlocklyArgs[];
  inputsInline?: boolean;
  previousStatement: Record<string, unknown> | null;
  nextStatement: Record<string, unknown> | null;
  colour: number;
  tooltip: string;
  helpUrl: string;
  generatorCallback(block?: any): string;
}

export type CreateCustomBlock = (player: MazePlayer) => BlocklyComponent;

// source: https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#8wpthh
export const movementForward: CreateCustomBlock = () => ({
  type: 'movement_forward',
  message0: 'avançar',
  previousStatement: null,
  nextStatement: null,
  colour: 285,
  tooltip: 'Move um quadrado para frente',
  helpUrl: '',
  generatorCallback: () => 'forward();\n',
});

// source: https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#83j9gt
export const movementRotate: CreateCustomBlock = () => ({
  type: 'movement_rotate',
  message0: 'gire à %1 %2',
  args0: [
    {
      type: 'input_dummy',
    },
    {
      type: 'field_dropdown',
      name: 'direction',
      options: [
        ['esquerda ↺', 'L'],
        ['direita ↻', 'R'],
      ],
    },
  ],
  inputsInline: true,
  previousStatement: null,
  nextStatement: null,
  colour: 285,
  tooltip: 'Vire para a direção especificada',
  helpUrl: '',
  generatorCallback: (block) => (block.getFieldValue('direction') === 'L' ? 'turnLeft();\n' : 'turnRight();\n'),
});

// source: https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#m5x4ff
export const controlsIfPath: CreateCustomBlock = () => ({
  type: 'controls_if_path',
  message0: 'se caminho à %1 %2 %3 faça %4',
  args0: [
    {
      type: 'input_dummy',
    },
    {
      type: 'field_dropdown',
      name: 'direction',
      options: [
        ['frente', 'A'],
        ['esquerda ↺', 'L'],
        ['direita ↻', 'R'],
      ],
    },
    {
      type: 'input_dummy',
    },
    {
      type: 'input_statement',
      name: 'statement',
    },
  ],
  inputsInline: true,
  previousStatement: null,
  nextStatement: null,
  colour: 210,
  tooltip: 'Executa os blocos em "faça" se houver um caminho para a direção especificada',
  helpUrl: '',
  generatorCallback: (block) => {
    const direction = block.getFieldValue('direction');
    const condition = direction === 'A' ? 'isPathForward()' : direction === 'L' ? 'isPathToLeft()' : 'isPathToRight()';

    return `if (${condition}) {
  ${(window as any).Blockly.JavaScript.statementToCode(block, 'statement') || ''}
}`;
  },
});

// source: https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#buty92
export const controlsIfElsePath: CreateCustomBlock = () => ({
  type: 'controls_if_else_path',
  message0: 'se caminho à %1 %2 %3 faça %4 senão %5',
  args0: [
    {
      type: 'input_dummy',
    },
    {
      type: 'field_dropdown',
      name: 'direction',
      options: [
        ['frente', 'A'],
        ['esquerda ↺', 'L'],
        ['direita ↻', 'R'],
      ],
    },
    {
      type: 'input_dummy',
    },
    {
      type: 'input_statement',
      name: 'truthy_statement',
    },
    {
      type: 'input_statement',
      name: 'falsy_statement',
    },
  ],
  inputsInline: true,
  previousStatement: null,
  nextStatement: null,
  colour: 210,
  tooltip: 'Executa os blocos em "faça" se houver um caminho para a direção especificada. Caso contrário, os blocos em "senão" serão executados',
  helpUrl: '',
  generatorCallback: (block) => {
    const direction = block.getFieldValue('direction');
    const condition = direction === 'A' ? 'isPathForward()' : direction === 'L' ? 'isPathToLeft()' : 'isPathToRight()';

    return `if (${condition}) {
  ${(window as any).Blockly.JavaScript.statementToCode(block, 'truthy_statement') || ''}
} else {
  ${(window as any).Blockly.JavaScript.statementToCode(block, 'falsy_statement') || ''}
}`;
  },
});

// source: https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#9ag263
export const controlsRepeatUntilReachEnd: CreateCustomBlock = (player) => ({
  type: 'controls_repeat_until_reach_end',
  message0: 'repetir até %1 %2 faça %3',
  args0: [
    {
      type: 'field_image',
      src: playerImages[player],
      width: 20,
      height: 20,
      alt: 'P',
    },
    {
      type: 'input_dummy',
    },
    {
      type: 'input_statement',
      name: 'statement',
    },
  ],
  previousStatement: null,
  nextStatement: null,
  colour: 120,
  tooltip: 'Executa os blocos em "faça" enquanto não chegar na posição final (⚐)',
  helpUrl: '',
  generatorCallback: (block) => `while (notDone()) {
  ${(window as any).Blockly.JavaScript.statementToCode(block, 'statement') || ''}
}`,
});

const customBlocks: Record<CustomBlockType, CreateCustomBlock> = {
  movement_forward: movementForward,
  movement_rotate: movementRotate,
  controls_if_path: controlsIfPath,
  controls_if_else_path: controlsIfElsePath,
  controls_repeat_until_reach_end: controlsRepeatUntilReachEnd,
};

export default customBlocks;
