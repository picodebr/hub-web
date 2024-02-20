/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Category, categoryColors } from '../../categories/interfaces';
import { IBlockParser, IOBlocksFactory } from '../interfaces';

const category: Category = 'sensor';
const { colour } = categoryColors[category];

const ultrasonicParser: IBlockParser = (block, { lang }) => {
  const { TRIGGER, ECHO, UNIT } = block.fields;

  if (!(TRIGGER && ECHO && UNIT)) return '';

  return lang === 'cpp' ? `code::Ultrasonic::getDistance(${TRIGGER}, ${ECHO}, code::UltrasonicUnit::${UNIT})` : `ultrasonic('${UNIT}')`;
};

export const sensorBlocksFactories: IOBlocksFactory[] = [
  (pins) => ({
    name: `${category}_ultrasonic`,
    init() {
      // @ts-ignore
      this.jsonInit({
        message0: 'Ultrassônico com disparo %1 e eco %2 em %3',
        args0: [
          {
            type: 'field_dropdown',
            name: 'TRIGGER',
            options: pins.map((pin) => [pin.value, pin.value]),
          },
          {
            type: 'field_dropdown',
            name: 'ECHO',
            options: pins.map((pin) => [pin.value, pin.value]),
          },
          {
            type: 'field_dropdown',
            name: 'UNIT',
            options: [
              ['cm', 'cm'],
              ['pol', 'in'],
            ],
          },
        ],
        colour,
        category,
        extensions: ['output_number'],
      });
    },
    parserCpp: ultrasonicParser,
    parserJs: ultrasonicParser,
  }),
];
