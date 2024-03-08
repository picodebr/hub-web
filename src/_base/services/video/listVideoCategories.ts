import { api } from '@/_base/classes/api';
import { IHubBookCategory } from '@/_base/interfaces/book';
import { IPagingResponse } from '@/_base/interfaces/shared';

export const listVideoCategories = async (): Promise<IPagingResponse<IHubBookCategory>> => {
  const { data } = await api.get(`/video/category/list`);
  return data;
};
