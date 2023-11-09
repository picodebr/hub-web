import axios from 'axios';

import { api } from '@/_base/classes/api';
import { ServiceResponse } from '../../interfaces/zod';
import { BucketFolders, IPreSignedUploadResponse } from './interface';

export const getPresignedUrl = async (mimetype: string, folder?: BucketFolders): ServiceResponse<IPreSignedUploadResponse> => {
  const { data } = await api.get(`/providers/upload?mimetype=${mimetype}&folder=${folder || ''}`);
  return data;
};

export const uploadFile = async (path: string, file: File): Promise<void> => {
  await axios.put(path, file, {
    headers: { 'Content-Type': file.type },
  });
};
