import { IProject } from '@/_base/interfaces/project';
import { IHubUser } from '@/_base/interfaces/user';

export interface IProfileComponentProps {
  projects: IProject[];
  user: IHubUser;
}

export interface IAvatarOptions {
  skinColor?: string;
  earrings?: string;
  eyebrows?: string;
  eyes?: string;
  glassesProbability?: number;
  glasses?: string;
  mouth?: string;
  hair?: string;
  hairColor?: string;
}
