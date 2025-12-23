import { api } from '@/_base/classes/api';
import { IHubBookCategory } from '@/_base/interfaces/book';
import { IPagingResponse } from '@/_base/interfaces/shared';

export const listBookCategories = async (school_id?: string): Promise<IPagingResponse<IHubBookCategory>> => {
  const { data } = await api.get(`/book/category/list?school_id=${school_id}`);
  return data;
};
