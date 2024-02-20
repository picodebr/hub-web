import { ICreateProjectParams } from '@/_base/interfaces/codeProject/ICreateProjectParams';
import { IProject } from '../../interfaces/codeProject/IProject';
import { api } from '@/_base/classes/api';

type FuncType = (params: ICreateProjectParams) => Promise<IProject>;

export const createProject: FuncType = async (params) => {
  const { data } = await api.post('project', params);
  return data;
};
