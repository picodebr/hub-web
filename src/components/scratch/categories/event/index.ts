import { categoryColors, ICategory } from '../interfaces';
import { eventBlocks } from '../../blocks/event';

const id = 'event';

const { colour, secondaryColour } = categoryColors[id];

export const eventCategory: ICategory = {
  id,
  name: 'event',
  colour,
  secondaryColour,
  blocks: eventBlocks,
  hidden: true,
};
