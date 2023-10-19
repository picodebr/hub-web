import { IAd } from '../ad';
import { IAddress } from '../address';
import { ICampaign } from '../campaign';
import { IOrg } from '../org';
import { IPermissionGroup } from '../permission-group';
import { EMPTY_PERMISSIONS_DATA, IPermissionsPerModule } from '../permissions';

export interface IAdmin {
  id: string;
  name: string;
  email: string;
  federal_document?: string;
  org_id?: string;
  permission_group_id?: string;
  permissions: IPermissionsPerModule;
  password_updated_at: string | null;
  created_at: string;
  updated_at: string;
  credit_account: ICreditAccount;
  permission_group?: IPermissionGroup;
  address: IAddress;
  org: IOrg;
  campaigns: ICampaign[];
  ads: IAd[];
}

export interface ICreditAccount {
  value: string;
  expires_in: string | null;
}

export const EMPTY_ADMIN_DATA: IAdmin = {
  id: '',
  name: '',
  email: '',
  permissions: EMPTY_PERMISSIONS_DATA,
  password_updated_at: new Date().toString(),
  created_at: '',
  updated_at: '',
  permission_group: { permissions: EMPTY_PERMISSIONS_DATA } as any,
  credit_account: { value: '0.00', expires_in: null },
  ads: [],
  campaigns: [],
  org: {} as any,
  address: {} as any,
};
