import { IAgency } from '../agency';
import { ICampaign } from '../campaign';
import { IContact } from '../contact';
import { IPermissionGroup } from '../permission-group';

export interface IAdvertiser {
  id: string;
  readable_id: string;
  name: string;
  contacts: IContact[];
  agency_id?: string;
  permission_group_id: string;
  created_at: string;
  updated_at: string;
  permission_group: IPermissionGroup;
  agency?: IAgency;
  campaigns: ICampaign[];
}
