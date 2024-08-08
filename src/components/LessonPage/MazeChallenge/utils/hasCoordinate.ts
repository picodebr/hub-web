export interface Coordinate {
  x: number;
  y: number;
}

export default function hasCoordinate(
  { x, y }: Coordinate,
  list: Coordinate[],
): boolean {
  if (!Array.isArray(list)) return false;

  const found = list.find(e => e.x === x && e.y === y);
  return found !== undefined;
}
