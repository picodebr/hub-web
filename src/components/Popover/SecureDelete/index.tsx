import { AppButton } from '@/components/Forms/Button';
import { AppInput } from '@/components/Forms/Input';
import {
  ButtonGroup,
  Flex,
  PlacementWithLogical,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Text,
} from '@chakra-ui/react';
import { useState } from 'react';
import { FaTrash } from 'react-icons/fa6';

const SECURE_TEXT = 'permanently delete';

interface IProps {
  onDelete: () => void;
  title?: string;
  isDisabled?: boolean;
  secureText?: string;
  placement?: PlacementWithLogical;
}

export const SecureDeletePopover: React.FC<IProps> = ({
  onDelete,
  isDisabled,
  title = 'Permanently delete?',
  secureText = SECURE_TEXT,
  placement,
}) => {
  const [deleteTextConfirm, setDeleteTextConfirm] = useState('');

  const handleDelete = () => {
    if (deleteTextConfirm !== secureText) return;

    onDelete();
    setDeleteTextConfirm('');
  };

  return (
    <Popover placement={placement}>
      <PopoverTrigger>
        <Flex
          cursor={isDisabled ? 'not-allowed' : 'pointer'}
          _hover={isDisabled ? {} : { color: '#cf3e3e', boxShadow: 'md' }}
          filter={isDisabled ? 'grayscale(0.7)' : ''}
          opacity={isDisabled ? '0.5' : ''}
          pointerEvents={isDisabled ? 'none' : 'auto'}
          transition="all 0.15s"
          justify="center"
          fontSize="0.975rem"
          border="1px"
          w="1.65rem"
          h="1.65rem"
          align="center"
          borderRadius="md"
          bg="#fff"
          color="#ad4a4a"
          margin="auto"
        >
          <FaTrash />
        </Flex>
      </PopoverTrigger>
      <PopoverContent marginRight="2rem">
        <PopoverArrow marginLeft="1rem" />
        <PopoverCloseButton />
        <PopoverHeader fontSize="1rem">{title}</PopoverHeader>
        <PopoverBody display="flex" flexDirection="column" gap="0.5rem">
          <Text align="left" overflow="hidden" whiteSpace="normal">
            To confirm deletion, type <i style={{ color: '#808080' }}>{secureText}</i> in the text input field.
          </Text>
          <AppInput value={deleteTextConfirm} onChange={(e) => setDeleteTextConfirm(e.target.value)} size="xs" />{' '}
          <ButtonGroup display="flex" justifyContent="flex-end">
            <AppButton isDisabled={deleteTextConfirm !== secureText} label="Delete" btntype="outline-warning" size="sm" onClick={handleDelete} />
          </ButtonGroup>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};
