import { api } from '@/_base/classes/api';
import { IHubClass } from '@/_base/interfaces/class';

export const listClasses = async (): Promise<IHubClass[]> => {
  const { data } = await api.get(`/class/list`);
  return data;
};
