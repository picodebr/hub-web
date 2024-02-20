import { IUpdateProjectParams } from '@/_base/interfaces/project';
import { IProject } from '../../interfaces/codeProject/IProject';
import { api } from '@/_base/classes/api';

type FuncType = (params: IUpdateProjectParams) => Promise<IProject>;

export const updateProject: FuncType = async ({ id, ...params }) => {
  const { data } = await api.patch(`project/${id}`, params);
  return data;
};
