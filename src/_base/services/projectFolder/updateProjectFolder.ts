import { api } from '@/_base/classes/api';
import { IProjectFolder } from '@/_base/interfaces/codeFolder/IProjectFolder';
import { IUpdateProjectFolderParams } from '@/_base/interfaces/codeFolder/IUpdateProjectFolderParams';

type FuncType = (params: IUpdateProjectFolderParams) => Promise<IProjectFolder>;

export const updateProjectFolder: FuncType = async ({ id, ...params }) => {
  const { data } = await api.patch(`project_folder/${id}`, params);
  return data;
};
