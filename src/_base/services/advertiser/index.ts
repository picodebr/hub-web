import { api } from '@/_base/classes/api';
import { IAdvertiser } from '@/_base/interfaces/advertiser';
import { ServiceResponse } from '../@types';
import { ICreateAdvertiserDTO, IUpdateAdvertiserDTO } from './interface';

export const createAdvertiser = async (params: ICreateAdvertiserDTO): ServiceResponse<IAdvertiser> => {
  const { data } = await api.post('/advertiser', params);
  return data;
};

export const listAdvertisers = async (): ServiceResponse<IAdvertiser[]> => {
  const { data } = await api.get('/advertiser');
  return data;
};

export const getAdvertiser = async (id: string): ServiceResponse<IAdvertiser[]> => {
  const { data } = await api.get(`/advertiser/${id}`);
  return data;
};

export const updateAdvertiser = async ({ id, ...params }: IUpdateAdvertiserDTO): ServiceResponse<IAdvertiser> => {
  const { data } = await api.patch(`/advertiser/${id}`, params);
  return data;
};

export const deleteAdvertiser = async (id: string): ServiceResponse<IAdvertiser> => {
  const { data } = await api.delete(`/advertiser/${id}`);
  return data;
};
