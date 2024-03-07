import { Button } from '@chakra-ui/react';
import { IPlusButtonProps } from './interfaces';
import { MdWarning } from 'react-icons/md';

export const PlusButton: React.FC<IPlusButtonProps> = ({ label, warning, ...props }) => {
  return (
    <Button
      bgColor={warning ? 'primary500' : 'white'}
      w="fit-content"
      h="fit-content"
      border="1px"
      borderColor="gray300"
      padding="8px 14px"
      borderRadius="8px"
      fontSize="16px"
      fontWeight="600"
      color={warning ? '#fff' : 'gray700'}
      boxShadow="sm"
      cursor="pointer"
      {...props}
      rightIcon={warning ? <MdWarning /> : props.rightIcon}
    >
      {label}
    </Button>
  );
};
