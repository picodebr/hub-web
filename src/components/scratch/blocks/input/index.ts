/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Category, categoryColors } from '../../categories/interfaces';
import { IBlockParser, IOBlocksFactory } from '../interfaces';

const category: Category = 'input';
const { colour } = categoryColors[category];

const digitalReadParser: IBlockParser = (block) => {
  const { PIN } = block.fields;

  return PIN ? `digitalRead(${PIN})` : '';
};

const analogReadParser: IBlockParser = (block) => {
  const { PIN } = block.fields;

  return PIN ? `analogRead(${PIN})` : '';
};

const pinModeParser: IBlockParser = (block) => {
  const { PIN } = block.fields;

  return PIN ? `pinMode(${PIN}, INPUT_PULLUP);` : '';
};

export const inputBlocksFactories: IOBlocksFactory[] = [
  (pins) => ({
    name: `${category}_digital_read`,
    init() {
      // @ts-ignore
      this.jsonInit({
        message0: 'leitura digital no pino %1',
        args0: [
          {
            type: 'field_dropdown',
            name: 'PIN',
            options: pins.map((pin) => [pin.value, pin.value]),
          },
        ],
        colour,
        category,
        extensions: ['output_number'],
      });
    },
    parserCpp: digitalReadParser,
    parserJs: digitalReadParser,
  }),

  (pins) => ({
    name: `${category}_analog_read`,
    init() {
      // @ts-ignore
      this.jsonInit({
        message0: 'leitura analógica no pino %1',
        args0: [
          {
            type: 'field_dropdown',
            name: 'PIN',
            options: pins.filter((pin) => pin.isAnalog).map((pin) => [pin.value, pin.value]),
          },
        ],
        colour,
        category,
        extensions: ['output_number'],
      });
    },
    parserCpp: analogReadParser,
    parserJs: analogReadParser,
  }),

  (pins) => ({
    name: `${category}_pin_Mode`,
    init() {
      // @ts-ignore
      this.jsonInit({
        message0: 'ligar pullup no pino %1',
        args0: [
          {
            type: 'field_dropdown',
            name: 'PIN',
            options: pins.map((pin) => [pin.value, pin.value]),
          },
        ],
        colour,
        category,
        extensions: ['shape_statement'],
      });
    },
    parserCpp: pinModeParser,
    parserJs: pinModeParser,
  }),
];
