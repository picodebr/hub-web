import { ICoordinate } from '../interfaces';

export interface Props {
  path: ICoordinate[];
  square: ICoordinate;
}

interface SquareAroundInfo {
  top: boolean;
  bottom: boolean;
  right: boolean;
  left: boolean;
}

const getSquareAroundInfo: (props: Props) => SquareAroundInfo = ({
  path,
  square,
}) => {
  const coordinates = {
    top: { x: square.x, y: square.y - 1 },
    bottom: { x: square.x, y: square.y + 1 },
    right: { x: square.x + 1, y: square.y },
    left: { x: square.x - 1, y: square.y },
  };

  const top = !!path.find(
    p => p.x === coordinates.top.x && p.y === coordinates.top.y,
  );
  const bottom = !!path.find(
    p => p.x === coordinates.bottom.x && p.y === coordinates.bottom.y,
  );
  const right = !!path.find(
    p => p.x === coordinates.right.x && p.y === coordinates.right.y,
  );
  const left = !!path.find(
    p => p.x === coordinates.left.x && p.y === coordinates.left.y,
  );

  return { top, bottom, right, left };
};

const getSquareType: (props: Props) => string = props => {
  const { top: T, bottom: B, right: R, left: L } = getSquareAroundInfo(props);
  const t = !T;
  const b = !B;
  const r = !R;
  const l = !L;

  if (t && b && r && l) return 'isolated';
  if (t && b && r && L) return 'end deg180';
  if (t && b && R && l) return 'end deg0';
  if (t && b && R && L) return 'pass deg0';
  if (t && B && r && l) return 'end deg270';
  if (t && B && r && L) return 'curve deg90';
  if (t && B && R && l) return 'curve deg180';
  if (t && B && R && L) return 'tee deg0';
  if (T && b && r && l) return 'end deg90';
  if (T && b && r && L) return 'curve deg0';
  if (T && b && R && l) return 'curve deg270';
  if (T && b && R && L) return 'tee deg180';
  if (T && B && r && l) return 'pass deg90';
  if (T && B && r && L) return 'tee deg270';
  if (T && B && R && l) return 'tee deg90';
  if (T && B && R && L) return 'cross';

  return 'not-found';
};

export default getSquareType;
