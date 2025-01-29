import { PlayerCoordinates } from './getInitialPlayerCoordinates';
import checkCollision from './checkCollision';
import { IMazeFields } from '../interfaces';

export interface Params {
  player: PlayerCoordinates;
  map: IMazeFields;
}

export default function checkFinish({ player, map }: Params): boolean {
  return (
    player.position.x === map.finish.x &&
    player.position.y === map.finish.y &&
    !checkCollision({ player, map })
  );
}
