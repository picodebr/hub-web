import { IHubClass } from '../interfaces/class';

type FuncType = (classes: IHubClass[]) => IHubClass[];

const GRADE_ORDER = [
  'G3',
  'G4',
  'G5',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '1EM',
  '2EM',
  '3EM',
  'MakersPro Mini',
  'MakersPro Explorers',
  'MakersPro Creators',
  'MakersPro Innovators',
  'MakersPro Experts',
];

const getIndex = (grade?: string) => {
  const index = GRADE_ORDER.indexOf(grade || '');
  return index === -1 ? 999 : index;
};

export const sortGradesByClass: FuncType = (classes) =>
  [...classes].sort((a, b) => getIndex(a.grade) - getIndex(b.grade));
