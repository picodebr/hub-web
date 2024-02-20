/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Category, categoryColors } from '../../categories/interfaces';
import { IBlock, IBlockParser } from '../interfaces';

const category: Category = 'event';
const { colour } = categoryColors[category];

const setupParser: IBlockParser = (block, { scratchParser, lang }) => {
  const prefix = lang === 'cpp' ? 'void code::_setup()' : 'const setup = async () =>';

  return `${prefix} {\n${scratchParser(block.statements.next)}}\n`;
};

const loopParser: IBlockParser = (block, { scratchParser, lang }) => {
  const prefix = lang === 'cpp' ? 'void code::_loop()' : 'const loop = async () =>';

  return `${prefix} {\n${scratchParser(block.statements.next)}}\n`;
};

export const eventBlocks: IBlock[] = [
  {
    name: `${category}_setup`,
    init() {
      // @ts-ignore
      this.setDeletable(false);

      // @ts-ignore
      this.jsonInit({
        message0: 'setup                ㅤ',
        colour,
        category,
        extensions: ['shape_hat'],
      });
    },
    parserCpp: setupParser,
    parserJs: setupParser,
  },

  {
    name: `${category}_loop`,
    init() {
      // @ts-ignore
      this.setDeletable(false);

      // @ts-ignore
      this.jsonInit({
        message0: 'loop                 ㅤ',
        colour,
        category,
        extensions: ['shape_hat'],
      });
    },
    parserCpp: loopParser,
    parserJs: loopParser,
  },
];
