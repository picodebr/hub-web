import { categoryColors, ICategory } from '../interfaces';
import { inputBlocksFactories } from '../../blocks/input';

const id = 'input';

const { colour, secondaryColour } = categoryColors[id];

export const inputCategory: ICategory = {
  id,
  name: 'Entrada',
  colour,
  secondaryColour,
  blocks: [],
  blocksFactories: inputBlocksFactories,
};
