import { mathBlocks } from '../../blocks/math';
import { categoryColors, ICategory } from '../interfaces';

const id = 'math';

const { colour, secondaryColour } = categoryColors[id];

export const mathCategory: ICategory = {
  id,
  name: 'Matemática',
  colour,
  secondaryColour,
  blocks: mathBlocks,
};
