import { IProject } from '../project';
import { IHubUser } from '../user';
import { IHubGroupStudentLink } from './IHubGroupStudentLink';
import { IHubGroupMetadata } from './IHubGroupMetadata';
import { IHubGroupOrder } from './IHubGroupOrder';

export interface IHubGroup {
  id: string;
  hub_project_class_id: string | null;
  hub_user_id: string | null;
  display_name: string;
  metadata: IHubGroupMetadata;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  students: IHubUser[];
  educator: IHubUser | null;
  project: IProject | null;
  student_links: IHubGroupStudentLink[];
  orders: IHubGroupOrder[];
}
