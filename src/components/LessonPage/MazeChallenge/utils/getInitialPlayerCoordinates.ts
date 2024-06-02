import { ICoordinate } from '../interfaces';

export interface PlayerCoordinates {
  angle: number;
  position: ICoordinate;
}

export default function getInitialPlayerCoordinates(
  start?: ICoordinate,
): PlayerCoordinates {
  const x = start ? start.x : 0;
  const y = start ? start.y : 0;

  return {
    angle: 0,
    position: { x, y },
  };
}
