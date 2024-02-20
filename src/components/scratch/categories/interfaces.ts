import { IBlock, IGenericFactory } from '../blocks/interfaces';
import { IButton } from '../buttons/interfaces';

export const categoryList = <const>[
  'control',
  'input',
  'output',
  'variable',
  'procedure',
  'math',
  'sensor',
  'actuator',
  'serial',
  'event',
];
export type Category = typeof categoryList[number];

export interface ICategory {
  id: Category;
  name: string;
  colour: string;
  secondaryColour: string;
  blocks: IBlock[];
  blocksFactories?: IGenericFactory[];
  custom?: string;
  button?: IButton;
  hidden?: boolean;
  developmentOnly?: boolean;
}

interface IColor {
  colour: string;
  secondaryColour: string;
}

export const categoryColors: Record<Category, IColor> = {
  control: {
    colour: '#FFAB19',
    secondaryColour: '#CF8B17',
  },
  input: {
    colour: '#9966FF',
    secondaryColour: '#774DCB',
  },
  math: {
    colour: '#40BF4A',
    secondaryColour: '#389438',
  },
  output: {
    colour: '#4C97FF',
    secondaryColour: '#3373CC',
  },
  variable: {
    colour: '#FF8C1A',
    secondaryColour: '#DC6F02',
  },
  procedure: {
    colour: '#FF6680',
    secondaryColour: '#FF4D6A',
  },
  sensor: {
    colour: '#5cb1d6',
    secondaryColour: '#2e8eb8',
  },
  actuator: {
    colour: '#d65cd6',
    secondaryColour: '#bd42bd',
  },
  serial: {
    colour: '#CD853F',
    secondaryColour: '#a56c33',
  },
  event: {
    colour: '#FFBF00',
    secondaryColour: '#cc9900',
  },
};
