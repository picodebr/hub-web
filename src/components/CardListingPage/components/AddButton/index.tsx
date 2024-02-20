import React from 'react';
import { GoPlus } from 'react-icons/go';

import { Button } from './styles';

interface IProps {
  label: string;
  onButtonClick: () => void;
}

export const AddButton: React.FC<IProps> = ({ label, onButtonClick }) => (
  <Button onClick={() => onButtonClick()}>
    {label} <GoPlus />
  </Button>
);
