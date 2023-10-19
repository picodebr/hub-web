import { api } from '@/_base/classes/api';
import { IAdmin } from '@/_base/interfaces/admin';
import { ICampaign } from '@/_base/interfaces/campaign';
import { ServiceResponse } from '../@types';
import { ICreateCampaignDTO, IUpdateCampaignDTO } from './interface';

export const createCampaign = async (params: ICreateCampaignDTO): ServiceResponse<ICampaign> => {
  const { data } = await api.post('/campaign', params);
  return data;
};

export const listCampaigns = async (): ServiceResponse<ICampaign[]> => {
  const { data } = await api.get('/campaign');
  return data;
};

export const getCampaignById = async (id: string): ServiceResponse<ICampaign> => {
  const { data } = await api.get(`/campaign/${id}`);
  return data;
};

export const updateCampaign = async ({ id, ...params }: IUpdateCampaignDTO): ServiceResponse<ICampaign> => {
  const { data } = await api.patch(`/campaign/${id}`, params);
  return data;
};

export const deleteCampaign = async (id: string): ServiceResponse<ICampaign> => {
  const { data } = await api.delete(`/campaign/${id}`);
  return data;
};

//This endpoint returns all collected data of ads
export const listCampaignsWithMetrics = async (): ServiceResponse<{ campaigns: ICampaign[]; admin: IAdmin }> => {
  const { data } = await api.get('/campaign/metrics');
  return data;
};
