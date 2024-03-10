import { Button, HStack, Input, useNumberInput } from '@chakra-ui/react';

interface INumberScaleInputProps {
  value: string;
  onInputChange: (value: string) => void;
  min?: number;
  max?: number;
}

export const NumberScaleInput: React.FC<INumberScaleInputProps> = ({ onInputChange, value, min = 0, max }) => {
  const { getInputProps, getIncrementButtonProps, getDecrementButtonProps } = useNumberInput({
    step: 0.5,
    defaultValue: 0.0,
    min,
    max,
    precision: 2,
    onChange: (e) => onInputChange(e),
    value,
  });

  const inc = getIncrementButtonProps();
  const dec = getDecrementButtonProps();
  const input = getInputProps();

  return (
    <HStack maxW="320px">
      <Button {...dec}>-</Button>
      <Input {...input} borderColor="gray300" />
      <Button {...inc}>+</Button>
    </HStack>
  );
};
