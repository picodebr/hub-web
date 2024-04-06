import { ICreateHubCommunityPostParams } from './ICreateHubCommunityPostParams';

export interface IUpdateHubCommunityPostParams extends Partial<ICreateHubCommunityPostParams> {
  id: string;
}
