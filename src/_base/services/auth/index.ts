import { api } from '@/_base/classes/api';

import { IAdmin } from '@/_base/interfaces/admin';
import { ServiceResponse } from '../../interfaces/zod';
import { IAuthLoginInput, IAuthLoginOutput } from './interface';

export const signin = async (credentials: IAuthLoginInput): ServiceResponse<IAuthLoginOutput> => {
  const { data } = await api.post<IAuthLoginOutput>('/auth/admin', credentials);
  return data;
};

export const validateSession = async (): ServiceResponse<IAdmin> => {
  const { data } = await api.get<IAdmin>('/auth/admin');
  return data;
};
