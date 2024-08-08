import { IMazeFields } from '../interfaces';

export interface Challenge {
  toolbox: ToolboxConfig;
  map: IMazeFields;
  blockly: IBlockly;
}

export interface ToolboxConfig {
  blocks: {
    builtin?: Readonly<string[]>;
    custom?: Readonly<string[]>;
  };
}

export interface IBlockly {
  maxBlocks?: number;
}
