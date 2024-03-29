import { api } from '@/_base/classes/api';
import { IHubGroup } from '@/_base/interfaces/group';

export interface IAddOrderParams {
  group_id: string;
  items: { id: string; quantity: number }[];
}

export const addOrder = async ({ group_id, items }: IAddOrderParams): Promise<IHubGroup> => {
  const { data } = await api.post(`/group/order/add`, { group_id, items });
  return data;
};
