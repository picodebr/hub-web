import { HTMLAttributes } from 'react';

export interface IGenericModalProps extends HTMLAttributes<HTMLElement> {
  title?: string;
  confirmButtonTitle?: string;
  cancelButtonTitle?: string;
  buttonDisabled?: boolean;
  show: boolean;
  onClose: () => void;
  onSave?: () => void;
  children: React.ReactNode;
}
