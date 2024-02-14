/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Category, categoryColors } from '../../categories/interfaces';
import { IBlock, IBlockParser } from '../interfaces';

const category: Category = 'serial';
const { colour } = categoryColors[category];

const printlnParser: IBlockParser = (block, { scratchParser, lang }) => {
  const { MESSAGE } = block.fields;

  const isString = typeof MESSAGE === 'string';

  const name = lang === 'cpp' ? 'Serial.println' : 'console.log';

  const messagePrefix = lang === 'cpp' ? '' : isString ? '[USER] Println: ' : '"[USER] Println:", ';

  const formattedMessage = isString
    ? `"${messagePrefix}${MESSAGE.split('\\"')
        .map((e) => e.replace(/"/g, '\\"'))
        .join('\\"')}"`
    : `${messagePrefix}${scratchParser(MESSAGE)}`;

  const instruction = `${name}(${formattedMessage});\n`;

  return `${instruction}${scratchParser(block.statements.next)}`;
};

export const serialBlocks: IBlock[] = [
  {
    name: `${category}_println`,
    init() {
      // @ts-ignore
      this.jsonInit({
        message0: 'escrever %1 na porta serial',
        args0: [
          {
            type: 'input_value',
            name: 'MESSAGE',
          },
        ],
        colour,
        category,
        extensions: ['shape_statement'],
      });
    },
    toolboxXml: `
    <block type="${category}_println">
      <value name="MESSAGE">
        <shadow type="text">
          <field name="TEXT"></field>
        </shadow>
      </value>
    </block>
    `,
    parserCpp: printlnParser,
    parserJs: printlnParser,
  },
];
