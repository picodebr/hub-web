import { api } from '@/_base/classes/api';

export const checkEmail = async (email: string): Promise<{ is_valid: boolean }> => {
  const { data } = await api.get(`/user/check_email/${email}`);
  return data;
};
