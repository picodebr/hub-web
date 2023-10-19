import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Button } from '@chakra-ui/react';
import { useRef } from 'react';

interface IComponentProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  btnConfirmLabel?: string;
  btnCancelLabel?: string;
}

export const AlertDialogModal: React.FC<IComponentProps> = ({ isOpen, onCancel, onConfirm, title, message, btnConfirmLabel, btnCancelLabel }) => {
  const cancelRef = useRef<any>();

  return (
    <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onCancel}>
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            {title}
          </AlertDialogHeader>

          <AlertDialogBody>{message}</AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onCancel}>
              {btnCancelLabel || 'Cancel'}
            </Button>
            <Button colorScheme="red" onClick={onConfirm} ml={3}>
              {btnConfirmLabel || 'Confirm'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};
