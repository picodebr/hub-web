import { ScratchTranspilerLanguage } from '../blocks/interfaces';
import { ICustomArgs } from './parseHTMLUnknownElement';

export const parseVariableNames = (
  args: ICustomArgs,
  lang: ScratchTranspilerLanguage,
) =>
  Object.keys(args)
    .map(
      (k, i) =>
        `${
          lang === 'js'
            ? ''
            : args[k as keyof ICustomArgs] === 'text'
            ? 'double '
            : 'bool '
        }_arg${i}`,
    )
    .join(', ');
