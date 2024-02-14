import { categoryColors, ICategory } from '../interfaces';
import { sensorBlocksFactories } from '../../blocks/sensor';

const id = 'sensor';

const { colour, secondaryColour } = categoryColors[id];

export const sensorCategory: ICategory = {
  id,
  name: 'Sensores',
  colour,
  secondaryColour,
  blocks: [],
  blocksFactories: sensorBlocksFactories,
};
