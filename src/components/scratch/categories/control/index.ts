import { categoryColors, ICategory } from '../interfaces';
import { controlBlocks } from '../../blocks/control';

const id = 'control';

const { colour, secondaryColour } = categoryColors[id];

export const controlCategory: ICategory = {
  id,
  name: 'Controle',
  colour,
  secondaryColour,
  blocks: controlBlocks,
};
