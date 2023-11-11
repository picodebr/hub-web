import IRegisterUser from "@/_base/interfaces/user/IRegisterUser";
import { IAuthLoginResponse } from "../auth/interface";
import { api } from "@/_base/classes/api";

export const registerUser = async (params: IRegisterUser): Promise<IAuthLoginResponse> => {
  const { data } = await api.post('/user/register', params);
  return data;
};