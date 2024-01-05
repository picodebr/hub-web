import { IHubUser } from '@/_base/interfaces/user';

export interface IAvatarListProps {
  users: IHubUser[];
  max?: number;
}
