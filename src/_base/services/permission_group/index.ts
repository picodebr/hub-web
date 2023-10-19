import { api } from '@/_base/classes/api';
import { IPermissionGroup } from '@/_base/interfaces/permission-group';
import { ServiceResponse } from '../@types';
import { ICreatePermissionGroupDTO, IUpdatePermissionGroupDTO } from './interface';

export const createPermissionGroup = async (params: ICreatePermissionGroupDTO): ServiceResponse<IPermissionGroup> => {
  const { data } = await api.post('/permission_group', params);
  return data;
};

export const listPermissionGroups = async (): ServiceResponse<IPermissionGroup[]> => {
  const { data } = await api.get('/permission_group');
  return data;
};

export const getPermissionGroup = async (id: string): ServiceResponse<IPermissionGroup> => {
  const { data } = await api.get(`/permission_group/${id}`);
  return data;
};

export const updatePermissionGroup = async ({ id, ...params }: IUpdatePermissionGroupDTO): ServiceResponse<IPermissionGroup> => {
  const { data } = await api.patch(`/permission_group/${id}`, params);
  return data;
};

export const deletePermissionGroup = async (user_id: string): ServiceResponse<IPermissionGroup> => {
  const { data } = await api.delete(`/permission_group/${user_id}`);
  return data;
};
