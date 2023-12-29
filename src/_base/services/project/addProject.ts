import { api } from '@/_base/classes/api';
import { IProject } from '@/_base/interfaces/project';
import { IAddProjectParams } from '@/_base/interfaces/project/IAddProjectParams';

export const addProject = async (params: IAddProjectParams): Promise<IProject> => {
  const { data } = await api.post(`/project/add`, params);
  return data;
};
