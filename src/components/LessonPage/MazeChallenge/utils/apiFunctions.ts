/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';
import Blockly from 'blockly';

import checkFinish from './checkFinish';
import hasCoordinate from './hasCoordinate';
import { PlayerCoordinates } from './getInitialPlayerCoordinates';
import { IMazeFields } from '../interfaces';

export interface This {
  player: PlayerCoordinates;
  map: IMazeFields;
  workspace: Blockly.WorkspaceSvg | null;
  refresh: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
}

export interface ApiFunctions {
  forward(this: This): void;
  turnLeft(this: This): void;
  turnRight(this: This): void;
  notDone(this: This): boolean;
  isPathForward(this: This): boolean;
  isPathToLeft(this: This): boolean;
  isPathToRight(this: This): boolean;
  highlightBlock(this: This, id: string): void;
}

export function forward(this: This): void {
  if (this.workspace) (this as any).workspace.lastExecutedFunction = 'forward';

  const angle = Math.abs((this.player.angle % 360) + 360) % 360;
  const { x } = this.player.position;
  const { y } = this.player.position;
  const { size } = this.map;

  if (angle === 0 && x < size) this.player.position.x += 1;
  else if (angle === 90 && y >= 0) this.player.position.y -= 1;
  else if (angle === 180 && x >= 0) this.player.position.x -= 1;
  else if (angle === 270 && y < size) this.player.position.y += 1;

  this.refresh({});
}

export function turnLeft(this: This): void {
  (this as any).workspace.lastExecutedFunction = 'turnLeft';

  this.player.angle += 90;
  this.refresh({});
}

export function turnRight(this: This): void {
  (this as any).workspace.lastExecutedFunction = 'turnRight';

  this.player.angle -= 90;
  this.refresh({});
}

export function notDone(this: This): boolean {
  (this as any).workspace.lastExecutedFunction = 'notDone';

  return !checkFinish({ player: this.player, map: this.map });
}

function hasPathForward(
  angle: number,
  player: PlayerCoordinates,
  map: IMazeFields,
) {
  angle = Math.abs((angle % 360) + 360) % 360;
  const { x } = player.position;
  const { y } = player.position;
  const { size } = map;

  if (angle === 0) {
    return x < size - 1 && hasCoordinate({ x: x + 1, y }, map.path);
  }
  if (angle === 90) return y > 0 && hasCoordinate({ x, y: y - 1 }, map.path);
  if (angle === 180) return x > 0 && hasCoordinate({ x: x - 1, y }, map.path);
  if (angle === 270) {
    return y < size - 1 && hasCoordinate({ x, y: y + 1 }, map.path);
  }

  return false;
}

export function isPathForward(this: This): boolean {
  (this as any).workspace.lastExecutedFunction = 'isPathForward';

  return hasPathForward(this.player.angle, this.player, this.map);
}

export function isPathToLeft(this: This): boolean {
  (this as any).workspace.lastExecutedFunction = 'isPathToLeft';

  return hasPathForward(this.player.angle + 90, this.player, this.map);
}

export function isPathToRight(this: This): boolean {
  (this as any).workspace.lastExecutedFunction = 'isPathToRight';

  return hasPathForward(this.player.angle - 90, this.player, this.map);
}

export function highlightBlock(this: This, id: string): void {
  (this as any).workspace.highlightBlock(id);
}

const functions: ApiFunctions = {
  forward,
  turnLeft,
  turnRight,
  notDone,
  isPathForward,
  isPathToLeft,
  isPathToRight,
  highlightBlock,
};

export default functions;
