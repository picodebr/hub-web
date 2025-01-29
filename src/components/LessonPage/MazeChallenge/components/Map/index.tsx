import React, { useMemo } from 'react';
import { MdClose as CloseIcon } from 'react-icons/md';

import { Map, Row, Column, Player, Finish, PlayerImage, NoCollisionElement, CollisionElement, CollisionContainer } from './styles';
import { PlayerCoordinates } from '../../utils/getInitialPlayerCoordinates';
import makeMapMatrix from '../../utils/makeMapMatrix';

import { makeLiveElements } from '../../utils/makeLiveElements';
import { GameStatus, IMazeFields, IPath, PathImage, Themes } from '../../interfaces';

function getSquareImageURL(classValue: string, path: IPath): string {
  const keys = Object.keys(path);

  for (let i = 0; i < keys.length; i += 1) {
    if (classValue.indexOf(keys[i]) >= 0) return path[keys[i] as PathImage];
  }

  return '';
}

export interface Props {
  gameStatus: GameStatus;
  fields: IMazeFields;
  player: PlayerCoordinates;
  collisions: number;
  maxCollisions: number;
}

const defaultColors = {
  background: '#b05c30',
  pathFill: '#5C2114',
  pathStroke: '#D78459',
};

const themes: Themes = {
  drone: {
    player: `/challenges/icons/drone.svg`,
    goal: `/challenges/icons/target.png`,
    path: {
      pass: `/challenges/icons/path/drone/pass.svg`,
      curve: `/challenges/icons/path/drone/curve.svg`,
      end: `/challenges/icons/path/drone/end.svg`,
      tee: `/challenges/icons/path/drone/tee.svg`,
      cross: `/challenges/icons/path/drone/cross.svg`,
    },
    backgroundColor: '#3F3F3F',
  },
  ant: {
    player: `/challenges/icons/ant.svg`,
    goal: `/challenges/icons/sugar.svg`,
    path: {
      pass: '/challenges/icons/path/ant/pass.svg',
      curve: '/challenges/icons/path/ant/curve.svg',
      end: '/challenges/icons/path/ant/end.svg',
      tee: '/challenges/icons/path/ant/tee.svg',
      cross: '/challenges/icons/path/ant/cross.svg',
    },
    backgroundColor: '#B4753B',
  },
  bicicle: {
    player: `/challenges/icons/bicicle.svg`,
    goal: `/challenges/icons/location.png`,
    path: {
      pass: '/challenges/icons/path/bicicle/pass.svg',
      curve: '/challenges/icons/path/bicicle/curve.svg',
      end: '/challenges/icons/path/bicicle/end.svg',
      tee: '/challenges/icons/path/bicicle/tee.svg',
      cross: '/challenges/icons/path/bicicle/cross.svg',
    },
    backgroundColor: '#95d19b',
  },
  car: {
    player: `/challenges/icons/car.svg`,
    goal: `/challenges/icons/flag.png`,
    path: {
      pass: '/challenges/icons/path/car/pass.svg',
      curve: '/challenges/icons/path/car/curve.svg',
      end: '/challenges/icons/path/car/end.svg',
      tee: '/challenges/icons/path/car/tee.svg',
      cross: '/challenges/icons/path/car/cross.svg',
    },
    backgroundColor: '#AAAAAA',
  },
};

interface ICollisionProps {
  playerUrl: string;
}

const NoCollision: React.FC<ICollisionProps> = ({ playerUrl }) => {
  return <NoCollisionElement imageURL={playerUrl} />;
};

const Collision: React.FC<ICollisionProps> = ({ playerUrl }) => {
  return (
    <CollisionElement imageURL={playerUrl}>
      <CloseIcon />
    </CollisionElement>
  );
};

const Maps: React.FC<Props> = ({ gameStatus, fields, player, collisions, maxCollisions }) => {
  const { size } = fields;

  const mapMatrix = makeMapMatrix({ map: fields, size });

  const theme = useMemo(() => themes[fields.player], [fields]);

  const collisionElements = useMemo(
    () =>
      makeLiveElements({
        maxCollisions,
        collisions,
        noCollisionElement: () => <NoCollision playerUrl={theme.player} />,
        collisionElement: () => <Collision playerUrl={theme.player} />,
      }),
    [maxCollisions, collisions, theme],
  );

  return (
    <Map className="map" backgroundColor={theme.backgroundColor} size={size}>
      {mapMatrix.map((row, rowIndex) => (
        <Row key={`row-${rowIndex}`}>
          {row.map((column, columnIndex) => (
            <Column
              key={`column-${columnIndex}`}
              className={`column ${column}`}
              pathFillColor={defaultColors.pathFill}
              pathStrokeColor={defaultColors.pathStroke}
              backgroundImageURL={getSquareImageURL(column, theme.path)}
            >
              {column.indexOf('finish') >= 0 ? <Finish src={theme.goal} /> : ''}
            </Column>
          ))}
        </Row>
      ))}
      <Player coordinates={player} className={gameStatus}>
        <PlayerImage gameStatus={gameStatus} src={theme.player} srcCollision={theme.player} />
      </Player>
      <CollisionContainer>
        {collisionElements.map(({ Element, key }) => (
          <Element key={key} />
        ))}
      </CollisionContainer>
    </Map>
  );
};

export default Maps;
