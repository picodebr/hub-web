import styled from 'styled-components';

import { GameStatus } from '../../interfaces';

import { PlayerCoordinates } from '../../utils/getInitialPlayerCoordinates';

interface ColumnProps {
  backgroundImageURL: string;
  pathStrokeColor: string;
  pathFillColor: string;
  borderColor?: string;
}

export interface Props {
  backgroundColor: string;
  size: number;
}

const mapPadding = '2rem';

export const Map = styled.div<Props>`
  display: flex;
  flex-direction: column;
  padding: ${mapPadding};
  background-color: #fff;
  position: relative;
  user-select: none;
  overflow: hidden;
  --map-width: var(--game-button-container-max-width);
  --columns: ${(props) => props.size};
  --rows: ${(props) => props.size};
`;

export const Row = styled.div`
  display: flex;
  flex-direction: row;

  &:not(:first-child) > *::after,
  &:not(:first-child) > *:last-child::after {
    border-top-width: 0;
  }
`;

export const Column = styled.div<ColumnProps>`
  --color-path: #e2e4f7;
  --color-path-line: rgb(161, 170, 248, 0.4);
  --square-size: calc((var(--map-width) - 4rem) / var(--columns));
  --border-color: ${(props) => props.borderColor || 'rgba(255, 255, 255, 0.0)'};
  background-image: url(${(props) => props.backgroundImageURL});
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  position: relative;

  width: calc(100% / var(--columns));
  height: var(--square-size);

  &::after {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    content: '';
    border: 1px solid var(--border-color);
  }

  &:not(:last-child)::after {
    border-right-width: 0;
  }

  &.extern {
  }

  &.finish {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: calc(var(--square-size) * 0.9);
    color: #9ae5e6;
  }

  &.deg90 {
    transform: rotateZ(-90deg);
    & > *,
    &::after {
      transform: rotateZ(90deg);
    }
  }

  &.deg180 {
    transform: rotateZ(-180deg);
    & > *,
    &::after {
      transform: rotateZ(180deg);
    }
  }

  &.deg270 {
    transform: rotateZ(-270deg);
    & > *,
    &::after {
      transform: rotateZ(270deg);
    }
  }
`;

interface PlayerProps {
  coordinates: PlayerCoordinates;
}

export const Player = styled.div<PlayerProps>`
  width: var(--square-size);
  height: var(--square-size);
  position: absolute;
  left: calc(var(--column) * var(--square-size) + ${mapPadding});
  top: calc(var(--row) * var(--square-size) + ${mapPadding});
  display: flex;
  box-sizing: border-box;
  align-items: center;
  justify-content: center;
  transform: rotateZ(calc(var(--angle) * -1deg));
  line-height: var(--square-size);
  overflow: hidden;

  --row: ${(props) => props.coordinates.position.y};
  --column: ${(props) => props.coordinates.position.x};
  --angle: ${(props) => props.coordinates.angle};
  --square-size: calc((var(--map-width) - 4rem) / var(--columns));

  &.running,
  &.collision {
    transition-duration: var(--animation-duration);
  }

  &.collision {
    color: red;
  }

  &.finish {
    color: #00ff00;
  }
`;

interface PlayerImageProps {
  src: string;
  srcCollision?: string;
  gameStatus: GameStatus;
}

function getBackgroundImageURL(props: PlayerImageProps): string {
  return props.gameStatus === 'collision' ? props.srcCollision || props.src : props.src;
}

export const PlayerImage = styled.div<PlayerImageProps>`
  width: 90%;
  height: 90%;
  background-size: contain;
  transform: rotateZ(90deg);
  background-position: center;
  background-repeat: no-repeat;
  background-image: url(${getBackgroundImageURL});
`;

interface FinishProps {
  src: string;
}

export const Finish = styled.div<FinishProps>`
  width: 70%;
  height: 70%;
  background-image: url(${(props) => props.src});
  background-position: center;
  background-size: contain;
  background-repeat: no-repeat;
`;

export const CollisionContainer = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  padding: 0.25rem 1rem;

  & > :not(:first-child) {
    margin-left: 0.5rem;
  }
`;

interface IconProps {
  imageURL: string;
}

export const NoCollisionElement = styled.div<IconProps>`
  width: 1.5rem;
  height: 1.5rem;
  background-image: url(${(props) => props.imageURL});
  background-position: center;
  background-size: contain;
  background-repeat: no-repeat;
  position: relative;
`;

export const CollisionElement = styled.div<IconProps>`
  width: 1.5rem;
  height: 1.5rem;
  font-size: 1.5rem;
  color: red;
  background-image: url(${(props) => props.imageURL});
  background-position: center;
  background-size: contain;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
`;
