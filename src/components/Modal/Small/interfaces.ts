import { ModalOverlayProps, ModalProps } from '@chakra-ui/react';
import { ReactNode } from 'react';

export interface IModalProps extends Partial<ModalProps> {
  show: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
  onCloseModal?: () => void;
  title?: string;
  okText?: ReactNode;
  cancelText?: string;
  disableOkButton?: boolean;
  disableCancelButton?: boolean;
  isLoading?: boolean;
  overlay?: ModalOverlayProps;
  topIcon?: ModalTopIconType | React.ReactElement;
  showCloseButton?: boolean;
  bgOkButton?: string;
}

export const modalTopIconTypes = <const>['ray', 'checked', 'warning'];

export type ModalTopIconType = (typeof modalTopIconTypes)[number];
