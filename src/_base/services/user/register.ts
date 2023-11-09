import IRegisterUser from "@/_base/interfaces/user/IRegisterUser";
import { IAuthLoginOutput } from "../auth/interface";
import { api } from "@/_base/classes/api";

export const registerUser = async (params: IRegisterUser): Promise<IAuthLoginOutput> => {
  const { data } = await api.post('/user/register', params);
  return data;
};