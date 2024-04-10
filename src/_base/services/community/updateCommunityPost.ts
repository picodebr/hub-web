import { api } from '@/_base/classes/api';
import { IHubCommunityPost, IUpdateHubCommunityPostParams } from '@/_base/interfaces/community';

export const updateCommunityPost = async ({ id, ...dto }: IUpdateHubCommunityPostParams): Promise<IHubCommunityPost> => {
  const { data } = await api.patch(`/community/post/${id}`, dto);
  return data;
};
