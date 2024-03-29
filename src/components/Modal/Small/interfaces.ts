import { ModalOverlayProps, ModalProps } from '@chakra-ui/react';

export interface IModalProps extends Partial<ModalProps> {
  show: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
  onCloseModal?: () => void;
  title?: string;
  okText?: string;
  cancelText?: string;
  disableOkButton?: boolean;
  disableCancelButton?: boolean;
  isLoading?: boolean;
  overlay?: ModalOverlayProps;
  topIcon?: ModalTopIconType | React.ReactElement;
  showCloseButton?: boolean;
}

export const modalTopIconTypes = <const>['ray', 'checked', 'warning'];

export type ModalTopIconType = (typeof modalTopIconTypes)[number];
