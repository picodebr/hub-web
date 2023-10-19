import { api } from '@/_base/classes/api';
import { INotification } from '@/_base/interfaces/notification';
import { ServiceResponse } from '../@types';
import { IUpdateNotificationDTO } from './interface';

export const listNotifications = async (): ServiceResponse<INotification[]> => {
  const { data } = await api.get('/notification');
  return data;
};

export const updateNotification = async ({ id, ...params }: IUpdateNotificationDTO): ServiceResponse<INotification> => {
  const { data } = await api.patch(`/notification/${id}`, params);
  return data;
};

export const deleteNotification = async (id: string): ServiceResponse<void> => {
  const { data } = await api.delete(`/notification/${id}`);
  return data;
};
