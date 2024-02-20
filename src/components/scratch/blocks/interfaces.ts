import { IBoardPin } from '@/_base/interfaces/boards/IBoard';
import { IParsedBlock } from '../utils/parseHTMLUnknownElement';

export type ScratchTranspilerLanguage = 'cpp' | 'js';

export interface IBlock {
  name: string;
  init?: () => void;
  toolboxXml?: string;
  parserCpp?: IBlockParser;
  parserJs?: IBlockParser;
}

export type VariableBlockFactory = (vars: string[]) => IBlock;

export type IOBlocksFactory = (pins: IBoardPin[]) => IBlock;

export type IGenericFactory = (...args: any) => IBlock;

export type IScratchParser = (block?: IParsedBlock | string, isNumber?: boolean) => string;

interface IBlockUtils {
  scratchParser: IScratchParser;
  doubleToIntParse: (n: string) => string;
  wrapParens: (v?: string) => string;
  procedures: IProcedure[];
  lang: ScratchTranspilerLanguage;
}

export type IBlockParser = (block: IParsedBlock, utils: IBlockUtils) => string;

export interface IProcedure {
  name: string;
  proccode: string;
  args: Record<string, string>;
  onScope: boolean;
}
