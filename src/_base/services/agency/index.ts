import { api } from '@/_base/classes/api';
import { IAgency } from '@/_base/interfaces/agency';
import { ServiceResponse } from '../@types';
import { ICreateAgencyDTO, IUpdateAgencyDTO } from './interface';

export const createAgency = async (params: ICreateAgencyDTO): ServiceResponse<IAgency> => {
  const { data } = await api.post('/agency', params);
  return data;
};

export const listAgencies = async (): ServiceResponse<IAgency[]> => {
  const { data } = await api.get('/agency');
  return data;
};

export const getAgency = async (id: string): ServiceResponse<IAgency[]> => {
  const { data } = await api.get(`/agency/${id}`);
  return data;
};

export const updateAgency = async ({ id, ...params }: IUpdateAgencyDTO): ServiceResponse<IAgency> => {
  const { data } = await api.patch(`/agency/${id}`, params);
  return data;
};

export const deleteAgency = async (id: string): ServiceResponse<IAgency> => {
  const { data } = await api.delete(`/agency/${id}`);
  return data;
};
