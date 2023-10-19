import { ModalOverlayProps, ModalProps } from '@chakra-ui/react';

export interface IModalProps extends Partial<ModalProps> {
  show: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
  title?: string;
  okText?: string;
  cancelText?: string;
  disableOkButton?: boolean;
  disableCancelButton?: boolean;
  overlay?: ModalOverlayProps;
}
