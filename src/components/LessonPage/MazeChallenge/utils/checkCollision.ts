import { IMazeMap } from '../interfaces';
import { PlayerCoordinates } from './getInitialPlayerCoordinates';

export interface Params {
  player: PlayerCoordinates;
  map: IMazeMap;
}

export default function checkCollision({ player, map }: Params): boolean {
  for (let i = 0; i < map.path.length; i += 1) {
    if (
      map.path[i].x === player.position.x &&
      map.path[i].y === player.position.y
    ) {
      return false;
    }
  }

  return true;
}
