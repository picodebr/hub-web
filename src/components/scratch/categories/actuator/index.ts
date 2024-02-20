import { categoryColors, ICategory } from '../interfaces';
import { actuatorBlocksFactories } from '../../blocks/actuator';

const id = 'actuator';

const { colour, secondaryColour } = categoryColors[id];

export const actuatorCategory: ICategory = {
  id,
  name: 'Atuadores',
  colour,
  secondaryColour,
  blocks: [],
  blocksFactories: actuatorBlocksFactories,
};
