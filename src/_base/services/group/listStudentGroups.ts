import { api } from '@/_base/classes/api';
import { IHubGroup } from '@/_base/interfaces/group';

export const listStudentGroups = async (): Promise<IHubGroup[]> => {
  const { data } = await api.get(`/group/list`);
  return data;
};
