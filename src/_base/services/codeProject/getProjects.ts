import { IPagingResponse } from '@/_base/interfaces/shared';
import { IProject } from '../../interfaces/codeProject/IProject';
import { api } from '@/_base/classes/api';

type FuncType = () => Promise<IPagingResponse<IProject>>;

export const getProjects: FuncType = async () => {
  const { data } = await api.get(`/projects`);

  return data;
};
