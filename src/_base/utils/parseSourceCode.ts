import { ScratchTranspilerLanguage } from '@/components/scratch/blocks/interfaces';
import { IProjectSourceCode, SourceCodeMode } from '../interfaces/codeProject/IProject';
import { getXMLElement } from '@/components/scratch/utils/getXMLElement';
import { scratchTranspiler } from '@/components/scratch/transpiler';

type SourceCodeParser = (sourceCode: IProjectSourceCode, outputLang: ScratchTranspilerLanguage) => string;

const textParser: SourceCodeParser = (sourceCode) => sourceCode.code;

const blockParser: SourceCodeParser = (sourceCode, outputLang) => {
  const xml = getXMLElement(sourceCode.code);

  return scratchTranspiler(xml, sourceCode.variables, outputLang);
};

const sourceCodeParsers: Record<SourceCodeMode, SourceCodeParser> = {
  text: textParser,
  block: blockParser,
};

export const parseSourceCode: SourceCodeParser = (sourceCode, outputLang) => {
  const parser = sourceCodeParsers[sourceCode.mode];

  return parser(sourceCode, outputLang);
};
