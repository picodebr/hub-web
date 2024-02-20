import React from 'react';
import { BiErrorCircle } from 'react-icons/bi';
import ReactSelect from 'react-select';
import Creatable from 'react-select/creatable';

import { ISelectProps } from '../interfaces';

import { Container, Error, StyledSelect, Title } from './styles';

export const SelectInput: React.FC<ISelectProps> = ({
  placeholder,
  title,
  options,
  isMultiSelect,
  isCreatable,
  onSelectChange,
  initialValue,
  instanceId,
  backgroundColor,
  error,
  ...rest
}) => {
  const isMulti: any = isMultiSelect;

  const handleChange = (e: any) => {
    const results = isMulti ? e.map((option: any) => option.value) : [e.value];
    onSelectChange && onSelectChange(results);
  };

  const props = {
    defaultValue: initialValue,
    options,
    isMulti,
    placeholder,
    styles: StyledSelect,
    onChange: handleChange,
    instanceId,
    ...rest,
  };

  return (
    <Container backgroundColor={backgroundColor}>
      {title && <Title>{title}</Title>}
      {isCreatable ? <Creatable {...props} /> : <ReactSelect {...props} />}
      {error && (
        <Error>
          <BiErrorCircle id="icon" />
          {error}
        </Error>
      )}
    </Container>
  );
};
