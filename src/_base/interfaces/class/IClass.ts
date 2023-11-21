import { IHubSchool } from '../school';
import { IHubUser } from '../user';

export interface IHubClass {
  id: string;
  hub_school_id: string;
  display_name: string;
  description: string | null;
  code: string;
  grade: string;
  created_at: Date;
  updated_at: Date;
  hub_school: IHubSchool;
  users: IHubUser[];
}
