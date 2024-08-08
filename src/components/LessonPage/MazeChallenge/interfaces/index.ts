import { HTMLAttributes } from 'react';

export const mazeCustomBlocks = <const>[
  'movement_forward',
  'movement_rotate',
  'controls_if_path',
  'controls_if_else_path',
  'controls_repeat_until_reach_end',
];
export type MazeCustomBlock = typeof mazeCustomBlocks[number];

export const mazePlayers = <const>['drone', 'car', 'bicicle', 'ant'];
export type MazePlayer = typeof mazePlayers[number];

export interface IMazeMap {
  size: number; // positive
  start: ICoordinate;
  finish: ICoordinate;
  path: ICoordinate[];
}

export interface IMazeFields extends IMazeMap {
  blocks: Readonly<MazeCustomBlock[]>;
  player: MazePlayer;
  max_blocks?: number; // positive
}

export interface IMazePreview {
  size?: number; // positive
  start?: ICoordinate;
  finish?: ICoordinate;
  path?: ICoordinate[];
  blocks?: MazeCustomBlock[];
  player?: MazePlayer;
  max_blocks?: number; // positive
}

export interface IProps extends IMazePreview {
  validate: boolean;
  onValidate: (passed: boolean) => void;
  onInputsChange: (values: IMazeFields) => void;
}

export interface IMazePathCreatorProps extends HTMLAttributes<HTMLElement> {
  size: number;
  mapFields: IMazeField[][];
  onMapClick: (x: number, y: number) => void;
  onMapDoubleClick: (x: number, y: number) => void;
  onMapContextMenu: (x: number, y: number) => void;
}

export interface ICoordinate {
  x: number; // non-negative
  y: number; // non-negative
}

export interface IMazeField {
  isStart: boolean;
  isEnd: boolean;
  isPath: boolean;
}

export const minimumMazeSize = 4;
export const maximumMazeSize = 20;

export const gameStatus = <const>[
  'running',
  'stop',
  'collision',
  'fail',
  'finish',
  'over',
];

export type GameStatus = typeof gameStatus[number];

export type Themes = Record<MazePlayer, ITheme>;

export const pathImages = <const>['pass', 'curve', 'end', 'tee', 'cross'];

export type PathImage = typeof pathImages[number];

export interface ITheme {
  player: string;
  goal: string;
  path: IPath;
  backgroundColor: string;
}

export type IPath = Record<PathImage, string>;
