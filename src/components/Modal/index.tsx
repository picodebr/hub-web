import { Modal as ChakraModal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from '@chakra-ui/react';
import React, { PropsWithChildren } from 'react';
import { AppButton } from '../Forms/Button';
import { IModalProps } from './interfaces';

export const Modal: React.FC<PropsWithChildren<IModalProps>> = ({
  show,
  title,
  onConfirm,
  onCancel,
  children,
  okText,
  cancelText,
  disableCancelButton = false,
  disableOkButton = false,
  overlay = {},
  ...rest
}) => {
  return (
    <ChakraModal {...rest} isOpen={show} onClose={() => onCancel && onCancel()} scrollBehavior="inside">
      <ModalOverlay {...overlay} />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        {!!onCancel && <ModalCloseButton isDisabled={disableCancelButton} />}
        <ModalBody>{children}</ModalBody>

        <ModalFooter>
          {!!onCancel && (
            <AppButton label={cancelText || 'Cancel'} onClick={onCancel} mr={3} btntype="outline-warning" isDisabled={disableCancelButton} />
          )}
          <AppButton
            label={okText}
            onClick={() => {
              onConfirm();
            }}
            btntype="outline"
            isDisabled={disableOkButton}
          />
        </ModalFooter>
      </ModalContent>
    </ChakraModal>
  );
};
