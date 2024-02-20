import { categoryColors, ICategory } from '../interfaces';
import { outputBlocksFactories } from '../../blocks/output';

const id = 'output';

const { colour, secondaryColour } = categoryColors[id];

export const outputCategory: ICategory = {
  id,
  name: 'Saída',
  colour,
  secondaryColour,
  blocks: [],
  blocksFactories: outputBlocksFactories,
};
