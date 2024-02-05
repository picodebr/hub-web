import { IHubClass } from '../class';
import { IHubGroup } from '../group';
import { HubPermissions } from '../permissions';
import { IHubUserSchool } from '../school';
import { HubUserRole } from './HubUserRole';
import { IHubUserMetadata } from './IHubUserMetadata';
import { IHubUserPreferences } from './IHubUserPreferences';

export interface IHubUser {
  id: string;
  hub_class_id: string | null;
  hub_school_group_id: string;
  name: string;
  email: string;
  username: string;
  role: HubUserRole;
  avatar: string | null;
  bio: string | null;
  preferences: IHubUserPreferences;
  permissions: HubPermissions;
  birthdate: Date;
  created_at: Date;
  schools: IHubUserSchool[];
  metadata: IHubUserMetadata;
  hub_class: IHubClass;
  groups: IHubGroup[];

}

export const EMPTY_HUB_USER: IHubUser = {
  id: '',
  hub_class_id: '',
  hub_school_group_id: '',
  name: '',
  email: '',
  username: '',
  role: 'student',
  avatar: null,
  bio: null,
  permissions: {
    code: false,
    kranio: false,
    maker: false,
  },
  preferences: {
    theme: 'light',
  },
  birthdate: new Date(),
  created_at: new Date(),
  schools: [],
  metadata: {},
  hub_class: {} as any,
  groups: [],
};
