import { api } from '@/_base/classes/api';
import { IHubNotification } from '@/_base/interfaces/notification';

export const getNotifications = async (schoolId: string): Promise<IHubNotification[]> => {
  const { data } = await api.get(`/notification/list/${schoolId}`);
  return data.results;
};
