import { api } from '@/_base/classes/api';
import { ICreateProjectFolderParams } from '@/_base/interfaces/codeFolder/ICreateProjectFolderParams';
import { IProjectFolder } from '@/_base/interfaces/codeFolder/IProjectFolder';

type FuncType = (params: ICreateProjectFolderParams) => Promise<IProjectFolder>;

export const createProjectFolder: FuncType = async (params) => {
  const { data } = await api.post('project_folder', params);
  return data;
};
