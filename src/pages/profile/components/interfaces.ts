import { IProject } from '@/_base/interfaces/project';
import { IHubUser } from '@/_base/interfaces/user';
import { IHubCertificate } from '@/_base/interfaces/certificate';

export interface IProfileComponentProps {
  projects: IProject[];
  user: IHubUser;
  certificates?: IHubCertificate[];
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
