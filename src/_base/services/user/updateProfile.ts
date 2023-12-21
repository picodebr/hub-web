import { api } from '@/_base/classes/api';
import { IAuthResponse } from '@/_base/interfaces/auth';
import IUpdateProfile from '@/_base/interfaces/user/IUpdateProfile';

export const updateProfile = async (params: IUpdateProfile): Promise<IAuthResponse> => {
  const { data } = await api.post('/update', params);
  return data;
};
