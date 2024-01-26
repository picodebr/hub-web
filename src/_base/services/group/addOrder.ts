import { api } from '@/_base/classes/api';
import { IHubGroup, IHubGroupOrderItem } from '@/_base/interfaces/group';
import { uuid } from 'uuidv4';

export interface IAddOrderParams {
  group_id: string;
  metadata: IHubGroupOrderItem[];
}

export const addOrder = async ({ group_id, metadata }: IAddOrderParams): Promise<IHubGroup & { order_id: string }> => {
  const order_id = uuid();
  const { data } = await api.post(`/group/order/add`, { group_id, metadata: { id: order_id, items: metadata } });
  data.order_id = order_id;
  return data;
};
