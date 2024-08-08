import { MazeCustomBlock, MazePlayer } from '../interfaces';
import customBlocks, { BlocklyComponent } from './customBlocks';

export default function getCustomBlock(
  blockType: string,
  player: MazePlayer,
): BlocklyComponent | null {
  for (const key in customBlocks) {
    if (customBlocks[key as MazeCustomBlock](player).type === blockType) {
      return customBlocks[key as MazeCustomBlock](player);
    }
  }

  return null;
}
