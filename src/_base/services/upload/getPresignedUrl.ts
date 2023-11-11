import { api } from '@/_base/classes/api';
import { BucketFolders, IPreSignedUploadResponse } from '@/_base/interfaces/upload';

export const getPresignedUrl = async (mimetype: string, folder?: BucketFolders): Promise<IPreSignedUploadResponse> => {
  const { data } = await api.get(`/providers/upload?mimetype=${mimetype}&folder=${folder || ''}`);
  return data;
};
