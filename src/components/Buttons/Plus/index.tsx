import { Button } from '@chakra-ui/react';
import { IPlusButtonProps } from './interfaces';

export const PlusButton: React.FC<IPlusButtonProps> = ({ label, ...props }) => {
  return (
    <Button
      bgColor="white"
      w="fit-content"
      h="fit-content"
      border="1px"
      borderColor="gray300"
      padding="8px 14px"
      borderRadius="8px"
      fontSize="16px"
      fontWeight="600"
      color="gray700"
      boxShadow="sm"
      cursor="pointer"
      {...props}
    >
      {label}
    </Button>
  );
};
