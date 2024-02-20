/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Category, categoryColors } from '../../categories/interfaces';
import { IBlockParser, VariableBlockFactory } from '../interfaces';

export const VARIABLE_PREFIX = '_var_';

const category: Category = 'variable';
const { colour } = categoryColors[category];

const getParser: IBlockParser = (block) => {
  const { VARIABLE } = block.fields;
  return `${VARIABLE_PREFIX}${VARIABLE}`;
};

const setParser: IBlockParser = (block, { scratchParser }) => {
  const { VARIABLE, VALUE } = block.fields;

  const parsedValue = scratchParser(VALUE);

  const instruction = parsedValue ? `${VARIABLE_PREFIX}${VARIABLE} = ${parsedValue};\n` : '';

  return `${instruction}${scratchParser(block.statements.next)}`;
};

const incParser: IBlockParser = (block, { scratchParser }) => {
  const { VARIABLE, VALUE } = block.fields;

  const parsedValue = scratchParser(VALUE);

  const instruction = parsedValue ? `${VARIABLE_PREFIX}${VARIABLE} += ${parsedValue};\n` : '';

  return `${instruction}${scratchParser(block.statements.next)}`;
};

export const variableBlocksFactories: VariableBlockFactory[] = [
  (vars) => ({
    name: `${category}_get`,
    init() {
      // @ts-ignore
      this.jsonInit({
        message0: '%1',
        args0: [
          {
            type: 'field_dropdown',
            name: 'VARIABLE',
            options: () => vars.map((e) => [e, e]),
          },
        ],
        category,
        colour,
        extensions: ['output_string'],
      });
    },
    toolboxXml: '<block type="variable_get"></block>',
    parserCpp: getParser,
    parserJs: getParser,
  }),

  (vars) => ({
    name: `${category}_set`,
    init() {
      // @ts-ignore
      this.jsonInit({
        message0: 'definir %1 para %2',
        args0: [
          {
            type: 'field_dropdown',
            name: 'VARIABLE',
            options: () => vars.map((e) => [e, e]),
          },
          {
            type: 'input_value',
            name: 'VALUE',
          },
        ],
        category,
        colour,
        extensions: ['shape_statement'],
      });
    },
    toolboxXml: `
    <block type="${category}_set">
      <value name="VALUE">
        <shadow type="math_number">
          <field name="NUM"></field>
        </shadow>
      </value>
    </block>`,
    parserCpp: setParser,
    parserJs: setParser,
  }),

  (vars) => ({
    name: `${category}_inc`,
    init() {
      // @ts-ignore
      this.jsonInit({
        message0: 'mudar %1 por %2',
        args0: [
          {
            type: 'field_dropdown',
            name: 'VARIABLE',
            options: () => vars.map((e) => [e, e]),
          },
          {
            type: 'input_value',
            name: 'VALUE',
          },
        ],
        category,
        colour,
        extensions: ['shape_statement'],
      });
    },
    toolboxXml: `
      <block type="${category}_inc">
        <value name="VALUE">
          <shadow type="math_number">
            <field name="NUM"></field>
          </shadow>
        </value>
      </block>`,
    parserCpp: incParser,
    parserJs: incParser,
  }),
];
