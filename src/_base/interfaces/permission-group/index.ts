import { IPermissionsPerModule } from '../permissions';

export interface IPermissionGroup {
  id: string;
  name: string;
  description?: string;
  permissions: IPermissionsPerModule;
}
