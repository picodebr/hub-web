import { HubPermissions } from '../permissions';
import { HubUserRole } from './HubUserRole';

export interface IHubUser {
  id: string;
  hub_class_id: string | null;
  name: string;
  username: string;
  email: string;
  role: HubUserRole;
  allowed_grades: string[];
  permissions: HubPermissions;
}

export const EMPTY_HUB_USER: IHubUser = {
  id: '',
  hub_class_id: '',
  name: '',
  username: '',
  email: '',
  role: 'student',
  allowed_grades: [],
  permissions: {
    code: false,
    kranio: false,
    maker: false,
  },
};
