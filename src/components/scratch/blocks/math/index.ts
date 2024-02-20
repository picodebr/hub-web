/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Category, categoryColors } from '../../categories/interfaces';
import { IBlock, IBlockParser } from '../interfaces';

const category: Category = 'math';
const { colour } = categoryColors[category];

const comparisonParser: IBlockParser = (block, { scratchParser, wrapParens }) => {
  const { NUM1, NUM2, OP } = block.fields;

  const parsedLeft = wrapParens(scratchParser(NUM1, true));
  const parsedRight = wrapParens(scratchParser(NUM2, true));

  return parsedLeft && parsedRight && OP ? `(${parsedLeft} ${OP} ${parsedRight})` : '';
};

const arithmeticParser: IBlockParser = (block, { scratchParser, doubleToIntParse, wrapParens }) => {
  const { NUM1, NUM2, OP } = block.fields;

  const parsedLeft = wrapParens(scratchParser(NUM1, true));
  const parsedRight = wrapParens(scratchParser(NUM2, true));

  if (!parsedLeft || !parsedRight || !OP) return '';

  const op = OP === '_' ? '-' : OP;

  return op === '%' ? `(${doubleToIntParse(parsedLeft)} % ${doubleToIntParse(parsedRight)})` : `(${parsedLeft} ${op} ${parsedRight})`;
};

const logicParser: IBlockParser = (block, { scratchParser, wrapParens }) => {
  const { OPERAND1, OPERAND2, OP } = block.fields;

  const parsedLeft = wrapParens(scratchParser(OPERAND1));
  const parsedRight = wrapParens(scratchParser(OPERAND2));

  if (!parsedLeft || !parsedRight || !OP) return '';

  return `(${parsedLeft} ${OP} ${parsedRight})`;
};

const notParser: IBlockParser = (block, { scratchParser, wrapParens }) => {
  const { OPERAND } = block.fields;

  const value = wrapParens(scratchParser(OPERAND));

  return value ? `! ${value}` : '';
};

export const mathBlocks: IBlock[] = [
  {
    name: `${category}_comparison`,
    init() {
      // @ts-ignore
      this.jsonInit({
        message0: '%1 %2 %3',
        args0: [
          {
            type: 'input_value',
            name: 'NUM1',
          },
          {
            type: 'field_dropdown',
            name: 'OP',
            options: [
              ['<', '<'],
              ['≤', '<='],
              ['=', '=='],
              ['≠', '!='],
              ['>', '>'],
              ['≥', '>='],
            ],
          },
          {
            type: 'input_value',
            name: 'NUM2',
          },
        ],
        colour,
        category,
        extensions: ['output_boolean'],
      });
    },
    toolboxXml: `
    <block type="${category}_comparison">
      <value name="NUM1">
        <shadow type="math_number">
          <field name="NUM"></field>
        </shadow>
      </value>
      <value name="NUM2">
        <shadow type="math_number">
          <field name="NUM"></field>
        </shadow>
      </value>
    </block>
    `,
    parserCpp: comparisonParser,
    parserJs: comparisonParser,
  },

  {
    name: `${category}_arithmetic`,
    init() {
      // @ts-ignore
      this.jsonInit({
        message0: '%1 %2 %3',
        args0: [
          {
            type: 'input_value',
            name: 'NUM1',
          },
          {
            type: 'field_dropdown',
            name: 'OP',
            options: [
              ['+', '+'],
              ['-', '_'], // the transpiler thinks that the '-' symbol is a numbers negative sign and ignores it
              ['x', '*'],
              ['/', '/'],
              ['%', '%'],
            ],
          },
          {
            type: 'input_value',
            name: 'NUM2',
          },
        ],
        colour,
        category,
        extensions: ['output_number'],
      });
    },
    toolboxXml: `
    <block type="${category}_arithmetic">
      <value name="NUM1">
        <shadow type="math_number">
          <field name="NUM"></field>
        </shadow>
      </value>
      <value name="NUM2">
        <shadow type="math_number">
          <field name="NUM"></field>
        </shadow>
      </value>
    </block>
    `,
    parserCpp: arithmeticParser,
    parserJs: arithmeticParser,
  },

  {
    name: `${category}_logic`,
    init() {
      // @ts-ignore
      this.jsonInit({
        message0: '%1 %2 %3',
        args0: [
          {
            type: 'input_value',
            name: 'OPERAND1',
            check: 'Boolean',
          },
          {
            type: 'field_dropdown',
            name: 'OP',
            options: [
              ['e', '&&'],
              ['ou', '||'],
            ],
          },
          {
            type: 'input_value',
            name: 'OPERAND2',
            check: 'Boolean',
          },
        ],
        colour,
        category,
        extensions: ['output_boolean'],
      });
    },
    parserCpp: logicParser,
    parserJs: logicParser,
  },

  {
    name: `${category}_not`,
    init() {
      // @ts-ignore
      this.jsonInit({
        message0: 'não %1',
        args0: [
          {
            type: 'input_value',
            name: 'OPERAND',
            check: 'Boolean',
          },
        ],
        colour,
        category,
        extensions: ['output_boolean'],
      });
    },
    parserCpp: notParser,
    parserJs: notParser,
  },
];
