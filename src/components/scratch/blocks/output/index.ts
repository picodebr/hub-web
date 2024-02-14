/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Category, categoryColors } from '../../categories/interfaces';
import { IBlockParser, IOBlocksFactory } from '../interfaces';

const category: Category = 'output';
const { colour } = categoryColors[category];

const digitalWriteParser: IBlockParser = (block, { scratchParser, lang }) => {
  const { PIN, LEVEL } = block.fields;

  const name = lang === 'cpp' ? 'code::_digitalWrite' : 'digitalWrite';

  const instruction = PIN && LEVEL ? `${name}(${PIN}, ${LEVEL});\n` : '';

  return `${instruction}${scratchParser(block.statements.next)}`;
};

const analogWriteParser: IBlockParser = (block, { scratchParser, lang }) => {
  const { PIN, VALUE } = block.fields;

  const parsedValue = scratchParser(VALUE);

  const name = lang === 'cpp' ? 'code::_analogWrite' : 'analogWrite';

  const instruction = PIN && parsedValue ? `${name}(${PIN}, ${parsedValue});\n` : '';

  return `${instruction}${scratchParser(block.statements.next)}`;
};

export const outputBlocksFactories: IOBlocksFactory[] = [
  (pins) => ({
    name: `${category}_digital_write`,
    init() {
      // @ts-ignore
      this.jsonInit({
        message0: 'coloque o pino %1 em nível %2',
        args0: [
          {
            type: 'field_dropdown',
            name: 'PIN',
            options: pins.map((pin) => [pin.value, pin.value]),
          },
          {
            type: 'field_dropdown',
            name: 'LEVEL',
            options: [
              ['alto', 'HIGH'],
              ['baixo', 'LOW'],
            ],
          },
        ],
        colour,
        category,
        extensions: ['shape_statement'],
      });
    },
    parserCpp: digitalWriteParser,
    parserJs: digitalWriteParser,
  }),

  (pins) => ({
    name: `${category}_analog_write`,
    init() {
      // @ts-ignore
      this.jsonInit({
        message0: 'coloque o pino %1 em %2',
        args0: [
          {
            type: 'field_dropdown',
            name: 'PIN',
            options: pins.filter((pin) => pin.isPWM).map((pin) => [pin.value, pin.value]),
          },
          {
            type: 'input_value',
            name: 'VALUE',
          },
        ],
        colour,
        category,
        extensions: ['shape_statement'],
      });
    },
    toolboxXml: `
    <block type="${category}_analog_write">
      <value name="VALUE">
        <shadow type="math_whole_number">
          <field name="NUM"></field>
        </shadow>
      </value>
    </block>
    `,
    parserCpp: analogWriteParser,
    parserJs: analogWriteParser,
  }),
];
