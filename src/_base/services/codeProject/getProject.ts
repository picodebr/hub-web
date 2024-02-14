import { IProject } from '../../interfaces/codeProject/IProject';
import { api } from '@/_base/classes/api';

type FuncType = (id: string) => Promise<IProject>;

export const getProject: FuncType = async (id) => {
  const { data } = await api.get(`project/${id}`);
  return data;
};
