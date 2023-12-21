import { api } from '@/_base/classes/api';
import { IHubClass } from '@/_base/interfaces/class';

export const getClassData = async (classId: string): Promise<IHubClass> => {
  const { data } = await api.get(`/class/${classId}`);
  return data;
};
