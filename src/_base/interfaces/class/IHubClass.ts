import { IProject } from '../project';
import { IHubUser } from '../user';

export interface IHubClass {
  id: string;
  hub_school_id: string;
  display_name: string;
  description: string | null;
  code: string;
  grade: string;
  students: IHubUser[];
  projects: IProject[];
}
