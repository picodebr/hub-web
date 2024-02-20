import { Category, ICategory } from './interfaces';
import { controlCategory } from './control';
import { inputCategory } from './input';
import { outputCategory } from './output';
import { variableCategory } from './variable';
import { procedureCategory } from './procedure';
import { mathCategory } from './math';
import { sensorCategory } from './sensor';
import { actuatorCategory } from './actuator';
import { serialCategory } from './serial';
import { eventCategory } from './event';

export const scratchCategories: ICategory[] = [
  outputCategory,
  inputCategory,
  eventCategory,
  controlCategory,
  mathCategory,
  sensorCategory,
  actuatorCategory,
  serialCategory,
  variableCategory,
  procedureCategory,
];

export const scratchIOFactoryCategories: Category[] = [
  'input',
  'output',
  'sensor',
  'actuator',
];
