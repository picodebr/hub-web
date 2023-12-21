import { api } from '@/_base/classes/api';
import { IHubClass } from '@/_base/interfaces/class';

export const addClass = async (body: { class_code: string }): Promise<IHubClass> => {
  const { data } = await api.post(`/class/add`, body);
  return data;
};
