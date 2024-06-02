import React from 'react';

type ElementType = React.FC;

interface Props {
  maxCollisions: number;
  collisions: number;
  collisionElement: ElementType;
  noCollisionElement: ElementType;
}

type Return = { Element: ElementType; key: string }[];

type MakeLiveIcons = (props: Props) => Return;

export const makeLiveElements: MakeLiveIcons = ({
  maxCollisions,
  collisions,
  collisionElement,
  noCollisionElement,
}) => {
  const icons = [];

  for (let i = 0; i < maxCollisions; i += 1) {
    icons.push({
      Element: i < collisions ? collisionElement : noCollisionElement,
      key: `${i}`,
    });
  }

  return icons;
};
