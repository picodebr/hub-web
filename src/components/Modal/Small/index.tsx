import {
  Box,
  Modal as ChakraModal,
  Image,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';
import React, { PropsWithChildren } from 'react';
import { motion } from 'framer-motion';

import { GenericButton } from '../../Buttons/Generic';
import { IModalProps } from './interfaces';

export const SmallModal: React.FC<PropsWithChildren<IModalProps & { overflow?: string; modalMaxW?: string }>> = ({
  show,
  title,
  onConfirm,
  onCancel,
  children,
  okText,
  cancelText,
  disableCancelButton = false,
  disableCloseButton = false,
  disableOkButton = false,
  overlay = {},
  topIcon,
  isLoading,
  onCloseModal,
  showCloseButton = true,
  bgOkButton,
  modalMaxW,
  ...rest
}) => {
  return (
    <ChakraModal {...rest} isOpen={show} onClose={() => (onCloseModal ? onCloseModal() : onCancel && onCancel())} scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(2px)" {...overlay} />
      <ModalContent w={!rest.size ? 'fit-content' : undefined} maxW={modalMaxW || "min(450px, calc(100vw - 32px))"} zIndex="9998" borderRadius="20px" overflowX="hidden">
        <ModalHeader fontSize="1rem" p="1.5rem 1.5rem 0 1.5rem" color="gray800" display="flex" alignItems="center" gap="0.5rem" overflow="hidden">
          {typeof topIcon === 'string' ? (
            <Box>
              <Image src={`/icons/${topIcon}.svg`} h="48px" />
            </Box>
          ) : (
            topIcon || null
          )}
          <Text color="gray700" noOfLines={1}>{title}</Text>
        </ModalHeader>
        {(!!onCancel || !!onCloseModal) && showCloseButton && <ModalCloseButton isDisabled={disableCloseButton} mt="0.25rem" />}
        <ModalBody overflow="auto" overflowX="hidden" p="1.5rem">
          {children}
        </ModalBody>

        <ModalFooter p="1.5rem" justifyContent="center" gap="1rem">
          {!!onCancel && (
            <motion.button className="btn" whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }}>
              <GenericButton
                px="1.5rem"
                borderColor="gray300"
                label={cancelText || 'Cancelar'}
                onClick={onCancel}
                btntype="outline"
                isDisabled={disableCancelButton}
              />
            </motion.button>
          )}
          <motion.button className="btn" whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }}>
            <GenericButton
              px="1.5rem"
              border="none"
              fontWeight="500"
              label={okText || 'Confirmar'}
              onClick={() => {
                onConfirm();
              }}
              isDisabled={disableOkButton}
              isLoading={isLoading}
              bg={bgOkButton || 'primary900'}
            />
          </motion.button>
        </ModalFooter>
      </ModalContent>
    </ChakraModal>
  );
};
