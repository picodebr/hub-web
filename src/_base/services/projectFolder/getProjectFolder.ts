import { api } from '@/_base/classes/api';
import { IProjectFolder } from '@/_base/interfaces/codeFolder/IProjectFolder';

type FuncType = (id: string) => Promise<IProjectFolder>;

export const getProjectFolder: FuncType = async (id) => {
  const { data } = await api.get(`project_folder/${id}`);
  return data;
};
