/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Category, categoryColors } from '../../categories/interfaces';
import { scratchConfig } from '../../config';
import { IBlock, IBlockParser } from '../interfaces';

const category: Category = 'control';
const { colour } = categoryColors[category];

const delayParser: IBlockParser = (block, { scratchParser, lang }) => {
  const { DURATION } = block.fields;

  const parsedDuration = scratchParser(DURATION);

  const prefix = lang === 'cpp' ? 'code::_' : ' await ';

  const instruction = parsedDuration ? `${prefix}delay(${parsedDuration});\n` : '';

  return `${instruction}${scratchParser(block.statements.next)}`;
};

const ifParser: IBlockParser = (block, { scratchParser }) => {
  const { CONDITION } = block.fields;

  const parsedCondition = scratchParser(CONDITION);

  const instruction = parsedCondition ? `if (${parsedCondition}) {\n${scratchParser(block.statements.truthy)}}\n` : '';

  return `${instruction}${scratchParser(block.statements.next)}`;
};

const ifElseParser: IBlockParser = (block, { scratchParser }) => {
  const { CONDITION } = block.fields;

  const parsedCondition = scratchParser(CONDITION);

  const instruction = parsedCondition
    ? `if (${parsedCondition}) {\n${scratchParser(block.statements.truthy)}} else {\n${scratchParser(block.statements.falsy)}}\n`
    : '';

  return `${instruction}${scratchParser(block.statements.next)}`;
};

const repeatParser: IBlockParser = (block, { wrapParens, scratchParser, lang }) => {
  const { TIMES } = block.fields;

  const parsedCount = wrapParens(scratchParser(TIMES));

  const varDeclaration = lang === 'cpp' ? 'int i' : 'let i';

  const loopSufix = lang === 'cpp' ? '' : 'await safeLoop();\n';

  const instruction = parsedCount
    ? `for (${varDeclaration} = 0; i < ${parsedCount}; i += 1) {\n${scratchParser(block.statements.truthy)}${loopSufix}}\n`
    : '';

  return `${instruction}${scratchParser(block.statements.next)}`;
};

const whileParser: IBlockParser = (block, { wrapParens, scratchParser, lang }) => {
  const { CONDITION } = block.fields;

  const parsedCondition = wrapParens(scratchParser(CONDITION));

  const loopSufix = lang === 'cpp' ? '' : 'await safeLoop();\n';

  const instruction = parsedCondition ? `while (${parsedCondition}) {\n${scratchParser(block.statements.truthy)}${loopSufix}}\n` : '';

  return `${instruction}${scratchParser(block.statements.next)}`;
};

const foreverParser: IBlockParser = (block, { scratchParser, lang }) => {
  const loopSufix = lang === 'cpp' ? '' : 'await safeLoop();\n';

  const instruction = `while (true) {\n${scratchParser(block.statements.truthy)}${loopSufix}}\n`;

  return `${instruction}${scratchParser(block.statements.next)}`;
};

export const controlBlocks: IBlock[] = [
  {
    name: `${category}_wait`,
    init() {
      // @ts-ignore
      this.jsonInit({
        message0: 'espere %1 ms',
        args0: [
          {
            type: 'input_value',
            name: 'DURATION',
          },
        ],
        colour,
        category,
        extensions: ['shape_statement'],
      });
    },
    toolboxXml: `
    <block type="${category}_wait">
      <value name="DURATION">
        <shadow type="math_whole_number">
          <field name="NUM">500</field>
        </shadow>
      </value>
    </block>
    `,
    parserCpp: delayParser,
    parserJs: delayParser,
  },

  {
    name: `${category}_if`,
    init() {
      // @ts-ignore
      this.jsonInit({
        type: 'control_if',
        message0: 'se %1 então',
        message1: '%1', // Statement
        args0: [
          {
            type: 'input_value',
            name: 'CONDITION',
            check: 'Boolean',
          },
        ],
        args1: [
          {
            type: 'input_statement',
            name: 'SUBSTACK',
          },
        ],
        colour,
        category,
        extensions: ['shape_statement'],
      });
    },
    parserCpp: ifParser,
    parserJs: ifParser,
  },

  {
    name: `${category}_if_else`,
    init() {
      // @ts-ignore
      this.jsonInit({
        type: 'control_if_else',
        message0: 'se %1 então',
        message1: '%1',
        message2: 'senão',
        message3: '%1',
        args0: [
          {
            type: 'input_value',
            name: 'CONDITION',
            check: 'Boolean',
          },
        ],
        args1: [
          {
            type: 'input_statement',
            name: 'SUBSTACK',
          },
        ],
        args3: [
          {
            type: 'input_statement',
            name: 'SUBSTACK2',
          },
        ],
        colour,
        category,
        extensions: ['shape_statement'],
      });
    },
    parserCpp: ifElseParser,
    parserJs: ifElseParser,
  },

  {
    name: `${category}_repeat`,
    init() {
      // @ts-ignore
      this.jsonInit({
        message0: 'repita %1 vezes',
        message1: '%1', // Statement
        message2: '%1', // Icon
        lastDummyAlign2: 'RIGHT',
        args0: [
          {
            type: 'input_value',
            name: 'TIMES',
          },
        ],
        args1: [
          {
            type: 'input_statement',
            name: 'SUBSTACK',
          },
        ],
        args2: [
          {
            type: 'field_image',
            src: `${scratchConfig.mediaPath}repeat.svg`,
            width: 24,
            height: 24,
            alt: '*',
            flip_rtl: true,
          },
        ],
        colour,
        category,
        extensions: ['shape_statement'],
      });
    },
    toolboxXml: `
    <block type="${category}_repeat">
        <value name="TIMES">
            <shadow type="math_whole_number">
                <field name="NUM">2</field>
            </shadow>
        </value>
    </block>
    `,
    parserCpp: repeatParser,
    parserJs: repeatParser,
  },

  {
    name: `${category}_while`,
    init() {
      // @ts-ignore
      this.jsonInit({
        message0: 'enquanto %1 faça',
        message1: '%1',
        message2: '%1',
        lastDummyAlign2: 'RIGHT',
        args0: [
          {
            type: 'input_value',
            name: 'CONDITION',
            check: 'Boolean',
          },
        ],
        args1: [
          {
            type: 'input_statement',
            name: 'SUBSTACK',
          },
        ],
        args2: [
          {
            type: 'field_image',
            src: `${scratchConfig.mediaPath}repeat.svg`,
            width: 24,
            height: 24,
            alt: '*',
            flip_rtl: true,
          },
        ],
        colour,
        category,
        extensions: ['shape_statement'],
      });
    },
    parserCpp: whileParser,
    parserJs: whileParser,
  },

  {
    name: `${category}_forever`,
    init() {
      // @ts-ignore
      this.jsonInit({
        message0: 'repetir para sempre',
        message1: '%1',
        message2: '%1',
        lastDummyAlign2: 'RIGHT',
        args1: [
          {
            type: 'input_statement',
            name: 'SUBSTACK',
          },
        ],
        args2: [
          {
            type: 'field_image',
            src: `${scratchConfig.mediaPath}repeat.svg`,
            width: 24,
            height: 24,
            alt: '*',
            flip_rtl: true,
          },
        ],
        colour,
        category,
        extensions: ['shape_statement'],
      });
    },
    parserCpp: foreverParser,
    parserJs: foreverParser,
  },
];
