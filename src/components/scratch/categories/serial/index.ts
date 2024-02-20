import { serialBlocks } from '../../blocks/serial';
import { categoryColors, ICategory } from '../interfaces';

const id = 'serial';

const { colour, secondaryColour } = categoryColors[id];

export const serialCategory: ICategory = {
  id,
  name: 'Serial',
  colour,
  secondaryColour,
  blocks: serialBlocks,
};
