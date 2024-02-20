import { AppStatus } from '@/_base/interfaces/appStatus/AppStatus';

export interface IStatusModalProps {
  status: AppStatus;
}

interface IStatusModalContent {
  message?: string;
  imageUrl?: string;
  rotateImage?: boolean;
}

export const statusModalContent: Record<AppStatus, IStatusModalContent> = {
  starting: {},
  waiting_to_connect: {},
  connection_failed: {
    message: 'Falha ao connectar-se com o dispositivo.',
    imageUrl: '/icons/error.png',
  },
  ready_to_compile: {},
  compiling: {
    message: 'Compilando',
    imageUrl: '/icons/o-loading.svg',
    rotateImage: true,
  },
  compiled: {},
  compilation_failed: {
    message: 'Erro ao compilar.',
    imageUrl: '/icons/error.png',
  },
  ready_to_upload: {},
  uploading: {
    message: 'Carregando',
    imageUrl: '/icons/o-loading.svg',
    rotateImage: true,
  },
  uploaded: { message: 'Pronto!', imageUrl: '/icons/done.png' },
  upload_failed: {
    message: 'Erro ao carregar. Por favor, reconecte dispositivo.',
    imageUrl: '/icons/error.png',
  },
};
