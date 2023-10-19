import { api } from '@/_base/classes/api';
import { IAd } from '@/_base/interfaces/ad';
import { ServiceResponse } from '../@types';
import { ICreateAdDTO, IUpdateAdDTO } from './interface';

export const createAd = async (params: ICreateAdDTO): ServiceResponse<IAd> => {
  const { data } = await api.post('/ad', params);
  return data;
};

export const getAdById = async (id: string): ServiceResponse<IAd> => {
  const { data } = await api.get(`/ad/${id}`);
  return data;
};

export const listAdsByCampaign = async (campaign_id: string): ServiceResponse<IAd[]> => {
  const { data } = await api.get(`/ad/list_by_campaign/${campaign_id}`);
  return data;
};

export const updateAd = async ({ id, ...params }: IUpdateAdDTO): ServiceResponse<IAd> => {
  const { data } = await api.patch(`/ad/${id}`, params);
  return data;
};

export const deleteAd = async (id: string): ServiceResponse<IAd> => {
  const { data } = await api.delete(`/ad/${id}`);
  return data;
};
