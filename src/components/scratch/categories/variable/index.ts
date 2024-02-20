import { categoryColors, ICategory } from '../interfaces';
import { variableButton } from '../../buttons/variable';
import { variableBlocksFactories } from '../../blocks/variable';

const id = 'variable';

const { colour, secondaryColour } = categoryColors[id];

export const variableCategory: ICategory = {
  id,
  name: 'Variáveis',
  colour,
  secondaryColour,
  blocks: [],
  blocksFactories: variableBlocksFactories,
  custom: id,
  button: variableButton,
};
