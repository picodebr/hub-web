import { IProject } from '../project';
import { IHubUserSchool } from '../school';
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
  hub_school: IHubUserSchool;
}
