import { IHubClass } from '../class';
import { IHubSchoolGroup } from './ISchoolGroup';

export interface IHubSchool {
  id: string;
  hub_school_group_id: string;
  display_name: string;
  description: string | null;
  code: string;
  created_at: Date;
  updated_at: Date;
  hub_school_group: IHubSchoolGroup;
  hub_classes: IHubClass[];
}
