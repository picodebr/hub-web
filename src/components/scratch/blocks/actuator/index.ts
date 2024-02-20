/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Category, categoryColors } from '../../categories/interfaces';
import { IBlockParser, IOBlocksFactory } from '../interfaces';

const category: Category = 'actuator';
const { colour } = categoryColors[category];

type BuzzerNote = [string, string]; // [note, frequency]

const buzzerNotes: BuzzerNote[] = [
  ['A', '440'],
  ['A#', '466'],
  ['B', '494'],
  ['C', '523'],
  ['C#', '554'],
  ['D', '587'],
  ['D#', '624'],
  ['E', '659'],
  ['F', '698'],
  ['F#', '740'],
  ['G', '784'],
  ['G#', '831'],
];

const buzzerNoteParser: IBlockParser = (block, { scratchParser, lang }) => {
  const { PIN, NOTE, DURATION } = block.fields;

  const parsedDuration = scratchParser(DURATION);

  const name = lang === 'cpp' ? 'code::buzzer' : 'buzzer';

  const instruction = PIN && NOTE && DURATION ? `${name}(${PIN}, ${NOTE}, ${parsedDuration});\n` : '';

  return `${instruction}${scratchParser(block.statements.next)}`;
};

const buzzerFreqParser: IBlockParser = (block, { scratchParser, lang }) => {
  const { PIN, FREQ, DURATION } = block.fields;

  const parsedFrequency = scratchParser(FREQ);
  const parsedDuration = scratchParser(DURATION);

  const name = lang === 'cpp' ? 'code::buzzer' : 'buzzer';

  const instruction = PIN && parsedFrequency && parsedDuration ? `${name}(${PIN}, ${parsedFrequency}, ${parsedDuration});\n` : '';

  return `${instruction}${scratchParser(block.statements.next)}`;
};

const servoParser: IBlockParser = (block, { scratchParser, lang }) => {
  const { PIN, ANGLE } = block.fields;

  const parsedAngle = scratchParser(ANGLE);

  const name = lang === 'cpp' ? 'code::servo' : 'servo';

  const instruction = PIN && parsedAngle ? `${name}(${PIN}, ${parsedAngle});\n` : '';

  return `${instruction}${scratchParser(block.statements.next)}`;
};

export const actuatorBlocksFactories: IOBlocksFactory[] = [
  (pins) => ({
    name: `${category}_buzzer_note`,
    init() {
      // @ts-ignore
      this.jsonInit({
        message0: 'tocar pino %1 com a nota %2 por %3 ms',
        args0: [
          {
            type: 'field_dropdown',
            name: 'PIN',
            options: pins.map((pin) => [pin.value, pin.value]),
          },
          {
            type: 'field_dropdown',
            name: 'NOTE',
            options: buzzerNotes,
          },
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
    <block type="${category}_buzzer_note">
      <value name="DURATION">
        <shadow type="math_whole_number">
          <field name="NUM"></field>
        </shadow>
      </value>
    </block>
    `,
    parserCpp: buzzerNoteParser,
    parserJs: buzzerNoteParser,
  }),

  (pins) => ({
    name: `${category}_buzzer_freq`,
    init() {
      // @ts-ignore
      this.jsonInit({
        message0: 'tocar pino %1 com a frequência de %2 Hz por %3 ms',
        args0: [
          {
            type: 'field_dropdown',
            name: 'PIN',
            options: pins.map((pin) => [pin.value, pin.value]),
          },
          {
            type: 'input_value',
            name: 'FREQ',
          },
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
    <block type="${category}_buzzer_freq">
      <value name="FREQ">
        <shadow type="math_whole_number">
          <field name="NUM"></field>
        </shadow>
      </value>
      <value name="DURATION">
        <shadow type="math_whole_number">
          <field name="NUM"></field>
        </shadow>
      </value>
    </block>
    `,
    parserCpp: buzzerFreqParser,
    parserJs: buzzerFreqParser,
  }),

  (pins) => ({
    name: `${category}_servo`,
    init() {
      // @ts-ignore
      this.jsonInit({
        message0: 'definir ângulo do servo no pino %1 em %2 graus',
        args0: [
          {
            type: 'field_dropdown',
            name: 'PIN',
            options: pins.filter((pin) => pin.isPWM).map((pin) => [pin.value, pin.value]),
          },
          {
            type: 'input_value',
            name: 'ANGLE',
          },
        ],
        colour,
        category,
        extensions: ['shape_statement'],
      });
    },
    toolboxXml: `
    <block type="${category}_servo">
      <value name="ANGLE">
        <shadow type="math_whole_number">
          <field name="NUM"></field>
        </shadow>
      </value>
    </block>
    `,
    parserCpp: servoParser,
    parserJs: servoParser,
  }),
];
