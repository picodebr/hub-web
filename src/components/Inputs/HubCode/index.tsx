import { ChangeEvent, useState } from 'react';
import { BiErrorCircle } from 'react-icons/bi';
import { Container, Label, Input, Error } from './styles';

interface ICodeInputProps {
  code: string;
  error?: string;
  setCode: (code: string) => void;
}

export const HubCodeInput: React.FC<ICodeInputProps> = ({ code, setCode, error }) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toUpperCase().replace(/-/g, '');

    if (value === '' || (/^[A-Z-]+$/g.test(value) && value.length <= 16)) setCode(value.replace(/([A-Z]{4})(?=[A-Z])/g, '$1-'));
  };

  return (
    <Container inputFocused={isFocused}>
      <Label>Código</Label>
      <Input
        max={19}
        value={code}
        onChange={handleChange}
        placeholder="AAAA-BBBB-CCCC-DDDD"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      <Error data-show={!!error}>
        <BiErrorCircle />
        {error}
      </Error>
    </Container>
  );
};
