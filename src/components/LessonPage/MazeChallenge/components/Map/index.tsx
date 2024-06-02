/* eslint-disable react/no-array-index-key */
import React, { useMemo } from 'react';
import { MdClose as CloseIcon } from 'react-icons/md';

import dronePassImage from '../../assets/icons/path/drone/pass.svg';
import droneCurveImage from '../../assets/icons/path/drone/curve.svg';
import droneEndImage from '../../assets/icons/path/drone/end.svg';
import droneTeeImage from '../../assets/icons/path/drone/tee.svg';
import droneCrossImage from '../../assets/icons/path/drone/cross.svg';

import antPassImage from '../../assets/icons/path/ant/pass.svg';
import antCurveImage from '../../assets/icons/path/ant/curve.svg';
import antEndImage from '../../assets/icons/path/ant/end.svg';
import antTeeImage from '../../assets/icons/path/ant/tee.svg';
import antCrossImage from '../../assets/icons/path/ant/cross.svg';

import biciclePassImage from '../../assets/icons/path/bicicle/pass.svg';
import bicicleCurveImage from '../../assets/icons/path/bicicle/curve.svg';
import bicicleEndImage from '../../assets/icons/path/bicicle/end.svg';
import bicicleTeeImage from '../../assets/icons/path/bicicle/tee.svg';
import bicicleCrossImage from '../../assets/icons/path/bicicle/cross.svg';

import carPassImage from '../../assets/icons/path/car/pass.svg';
import carCurveImage from '../../assets/icons/path/car/curve.svg';
import carEndImage from '../../assets/icons/path/car/end.svg';
import carTeeImage from '../../assets/icons/path/car/tee.svg';
import carCrossImage from '../../assets/icons/path/car/cross.svg';

import DroneImage from '../../assets/icons/drone.svg';
import AntImage from '../../assets/icons/ant.svg';
import BicicleImage from '../../assets/icons/bicicle.svg';
import CarImage from '../../assets/icons/car.svg';

import SugarImage from '../../assets/icons/sugar.svg';
import FlagImage from '../../assets/icons/flag.png';
import TargetImage from '../../assets/icons/target.png';
import LocationImage from '../../assets/icons/location.png';

import {
  Map,
  Row,
  Column,
  Player,
  Finish,
  PlayerImage,
  NoCollisionElement,
  CollisionElement,
  CollisionContainer,
} from './styles';
import { PlayerCoordinates } from '../../utils/getInitialPlayerCoordinates';
import makeMapMatrix from '../../utils/makeMapMatrix';

import { makeLiveElements } from '../../utils/makeLiveElements';
import {
  GameStatus,
  IMazeFields,
  IPath,
  PathImage,
  Themes,
} from '../../interfaces';

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
    player: DroneImage,
    goal: TargetImage,
    path: {
      pass: dronePassImage,
      curve: droneCurveImage,
      end: droneEndImage,
      tee: droneTeeImage,
      cross: droneCrossImage,
    },
    backgroundColor: '#3F3F3F',
  },
  ant: {
    player: AntImage,
    goal: SugarImage,
    path: {
      pass: antPassImage,
      curve: antCurveImage,
      end: antEndImage,
      tee: antTeeImage,
      cross: antCrossImage,
    },
    backgroundColor: '#B4753B',
  },
  bicicle: {
    player: BicicleImage,
    goal: LocationImage,
    path: {
      pass: biciclePassImage,
      curve: bicicleCurveImage,
      end: bicicleEndImage,
      tee: bicicleTeeImage,
      cross: bicicleCrossImage,
    },
    backgroundColor: '#95d19b',
  },
  car: {
    player: CarImage,
    goal: FlagImage,
    path: {
      pass: carPassImage,
      curve: carCurveImage,
      end: carEndImage,
      tee: carTeeImage,
      cross: carCrossImage,
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

const Maps: React.FC<Props> = ({
  gameStatus,
  fields,
  player,
  collisions,
  maxCollisions,
}) => {
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
        <PlayerImage
          gameStatus={gameStatus}
          src={theme.player}
          srcCollision={theme.player}
        />
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
