import { api } from '@/_base/classes/api';
import { IProject } from '@/_base/interfaces/project';
import { IUpdateProjectParams } from '@/_base/interfaces/project/IAddProjectParams';

export const updateProject = async ({ id, ...params }: IUpdateProjectParams): Promise<IProject> => {
  const { data } = await api.patch(`/project/${id}`, params);
  return data;
};
