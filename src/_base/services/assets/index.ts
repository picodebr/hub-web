import { api } from '@/_base/classes/api';
import { IAssetFile, IAssetFolder } from '@/_base/interfaces/ad_assets';
import { ServiceResponse } from '../@types';
import { ICreateAssetFileDTO, ICreateAssetFolderDTO, IUpdateAssetFolderDTO } from './interface';

export const createAssetFolder = async (params: ICreateAssetFolderDTO): ServiceResponse<IAssetFolder> => {
  const { data } = await api.post('/assets/folder', params);
  return data;
};

export const createAssetFile = async (params: ICreateAssetFileDTO): ServiceResponse<IAssetFile> => {
  const { data } = await api.post('/assets/file', params);
  return data;
};

export const listAssetFolders = async (): ServiceResponse<IAssetFolder[]> => {
  const { data } = await api.get('/assets/folders');
  return data;
};

export const updateAssetFolder = async ({ id, ...params }: IUpdateAssetFolderDTO): ServiceResponse<IAssetFolder> => {
  const { data } = await api.patch(`/assets/folder/${id}`, params);
  return data;
};

export const deleteAssetFolder = async (id: string): ServiceResponse<void> => {
  const { data } = await api.delete(`/assets/folder/${id}`);
  return data;
};

export const deleteAssetFile = async (id: string): ServiceResponse<void> => {
  const { data } = await api.delete(`/assets/file/${id}`);
  return data;
};
