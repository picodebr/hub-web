import { categoryColors, ICategory } from '../interfaces';
import { procedureBlocks } from '../../blocks/procedure';

const id = 'procedure';

const { colour, secondaryColour } = categoryColors[id];

export const procedureCategory: ICategory = {
  id,
  name: 'Meus Blocos',
  colour,
  secondaryColour,
  blocks: procedureBlocks,
  custom: 'PROCEDURE',
};
