import { api } from '@/_base/classes/api';
import { IStockMaker } from '@/_base/interfaces/storeMaker';

export const getStockMaker = async (school_id: string): Promise<IStockMaker[]> => {
  const { data } = await api.get(`/store_maker/list/${school_id}`);
  return data;
};
