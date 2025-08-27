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

const analogRead1Parser: IBlockParser = (block) => {
  const { PIN } = block.fields;

  return PIN ? `analogRead1(${PIN})` : '';
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
    name: `${category}_analog_read_1`,
    init() {
      // @ts-ignore
      this.jsonInit({
        message0: 'leitura analógica 1 no pino %1',
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
    parserCpp: analogRead1Parser,
    parserJs: analogRead1Parser,
  }),
];
