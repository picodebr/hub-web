import { IUpdateProjectParams } from '@/_base/interfaces/project';
import { ICodeProject } from '../../interfaces/codeProject/IProject';
import { api } from '@/_base/classes/api';

type FuncType = (params: IUpdateProjectParams) => Promise<ICodeProject>;

export const updateCodeProject: FuncType = async ({ id, ...params }) => {
  const { data } = await api.patch(`code/project/${id}`, params);
  return data;
};
