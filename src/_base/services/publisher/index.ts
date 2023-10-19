import { api } from '@/_base/classes/api';
import { IPublisher } from '@/_base/interfaces/publisher';
import { ServiceResponse } from '../@types';
import { ICreatePublisherDTO, IUpdatePublisherDTO } from './interface';

export const createPublisher = async (params: ICreatePublisherDTO): ServiceResponse<IPublisher> => {
  const { data } = await api.post('/publisher', params);
  return data;
};

export const listPublishers = async (): ServiceResponse<IPublisher[]> => {
  const { data } = await api.get('/publisher');
  return data;
};

export const getPublisher = async (id: string): ServiceResponse<IPublisher[]> => {
  const { data } = await api.get(`/publisher/${id}`);
  return data;
};

export const updatePublisher = async ({ id, ...params }: IUpdatePublisherDTO): ServiceResponse<IPublisher> => {
  const { data } = await api.patch(`/publisher/${id}`, params);
  return data;
};

export const deletePublisher = async (id: string): ServiceResponse<IPublisher> => {
  const { data } = await api.delete(`/publisher/${id}`);
  return data;
};
