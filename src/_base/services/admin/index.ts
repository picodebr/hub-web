import { api } from '@/_base/classes/api';
import { IAdmin } from '@/_base/interfaces/admin';
import { ServiceResponse } from '../@types';
import { ICreateAdminDTO, IUpdateAdminDTO, IUpdateProfileDTO } from './interface';

export const createAdmin = async (params: ICreateAdminDTO): ServiceResponse<IAdmin> => {
  const { data } = await api.post('/admin/register', params);
  return data;
};

export const listAdmins = async (): ServiceResponse<IAdmin[]> => {
  const { data } = await api.get('/admin');
  return data;
};

export const updateAdmin = async ({ id, ...params }: IUpdateAdminDTO): ServiceResponse<IAdmin> => {
  const { data } = await api.patch(`/admin/${id}`, params);
  return data;
};

export const deleteAdmin = async (id: string): ServiceResponse<void> => {
  const { data } = await api.delete(`/admin/${id}`);
  return data;
};

export const updateProfile = async ({ confirm_password, ...params }: IUpdateProfileDTO): ServiceResponse<IAdmin> => {
  const { data } = await api.patch(`/admin`, params);
  return data;
};

export const getProfile = async (): ServiceResponse<IAdmin> => {
  const { data } = await api.get(`/admin/profile`);
  return data;
};

export const sendRecoveryToken = async (email: string): ServiceResponse<void> => {
  const { data } = await api.post(`/admin/send_recovery_token`, { email });
  return data;
};

export const checkRecoveryToken = async (email: string, recovery_token: string): ServiceResponse<boolean> => {
  const { data } = await api.post(`/admin/check_recovery_token`, { email, recovery_token });
  return data;
};

export const updateForgottenPassword = async (email: string, recovery_token: string, new_password: string): ServiceResponse<void> => {
  const { data } = await api.patch(`/admin/forgotten_password`, { email, recovery_token, new_password });
  return data;
};
