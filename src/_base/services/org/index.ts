import { api } from '@/_base/classes/api';
import { IOrg, IOrgReportData } from '@/_base/interfaces/org';
import { ServiceResponse } from '../@types';
import { ICreateOrgDTO, IUpdateOrgDTO } from './interface';

export const createOrg = async (params: ICreateOrgDTO): ServiceResponse<IOrg> => {
  const { data } = await api.post('/org', params);
  return data;
};

export const getOrg = async (): ServiceResponse<IOrg> => {
  const { data } = await api.get('/org');
  return data;
};

export const getReportData = async (): ServiceResponse<IOrgReportData> => {
  const { data } = await api.get('/org/report');
  return data;
};

export const updateOrg = async (params: IUpdateOrgDTO): ServiceResponse<IOrg> => {
  const { data } = await api.patch(`/org`, params);
  return data;
};
