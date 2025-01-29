/* eslint-disable no-shadow */
/* eslint-disable no-plusplus */
import { IMazeMap } from '../interfaces';
import getSquareType from './getSquareType';

export interface Params {
  map: IMazeMap;
  size: number;
}

const makeMapMatrix: (params: Params) => string[][] = ({ map, size }) => {
  const mapMatrix: string[][] = [];

  for (let row = 0; row < size; row++) {
    mapMatrix[row] = [];
    mapMatrix[row].length = size;
  }

  for (let row = 0; row < size; row++) {
    for (let column = 0; column < size; column++) {
      const found = map.path.find(
        point => point.x === column && point.y === row,
      );
      mapMatrix[row][column] = found ? 'path' : 'extern';

      if (found) {
        mapMatrix[row][column] += ` ${getSquareType({
          path: map.path,
          square: { x: column, y: row },
        })}`;
      }
    }
  }

  if (map.start && map.start.y < map.size && map.start.x < map.size) {
    mapMatrix[map.start.y][map.start.x] += ' start';
  }

  if (map.finish && map.finish.y < map.size && map.finish.x < map.size) {
    mapMatrix[map.finish.y][map.finish.x] += ' finish';
  }

  return mapMatrix;
};

export default makeMapMatrix;
