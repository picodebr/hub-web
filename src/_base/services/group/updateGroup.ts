import { api } from '@/_base/classes/api';
import { IHubGroup, IHubGroupMetadata } from '@/_base/interfaces/group';

export interface IupdateGroupParams {
  id: string;
  metadata: IHubGroupMetadata;
}

export const updateGroup = async ({ id, metadata }: IupdateGroupParams): Promise<IHubGroup> => {
  const { data } = await api.patch(`/group/${id}`, { metadata });
  return data;
};
