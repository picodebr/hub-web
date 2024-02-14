import React, { useState, useEffect } from 'react';

import { BiErrorCircle } from 'react-icons/bi';
import { IRadioInputProps } from '../interfaces';

import { Container, Input, Label, Name, Error, OptionsWrapper } from './styles';

export const RadioInput: React.FC<IRadioInputProps> = ({
  title,
  name,
  initialValue,
  options,
  onInputChange,
  error,
  isHorizontal,
  disabled,
  ...args
}) => {
  const [checkedValue, setCheckedValue] = useState(initialValue);
  const inputName = name || title;

  useEffect(() => {
    setCheckedValue(initialValue);
  }, [initialValue]);

  return (
    <Container {...args}>
      <Name>{title}</Name>

      <OptionsWrapper isHorizontal={isHorizontal}>
        {options?.map((option) => (
          <Label key={option.value} htmlFor={`${inputName}-${option.value}`} isHorizontal={isHorizontal}>
            <Input
              type="radio"
              value={option.value || checkedValue}
              name={inputName}
              onChange={() => onInputChange && onInputChange(option.value)}
              checked={checkedValue === option.value}
              onClick={() => setCheckedValue(option.value)}
              disabled={disabled}
              id={`${inputName}-${option.value}`}
            />
            {option.label}
          </Label>
        ))}
      </OptionsWrapper>
      {error && (
        <Error isHorizontal={isHorizontal}>
          <BiErrorCircle id="icon" />
          {error}
        </Error>
      )}
    </Container>
  );
};
