import { IHubUser } from '../user';
import { IHubGroup } from './IHubGroup';

export interface IHubGroupActivity {
  id: string;
  hub_group_id: string;
  hub_user_id: string;
  title: string;
  description: string | null;
  file_url: string;
  metadata: IHubGroupActivityMetadata;
  created_at: Date;
  group: IHubGroup;
  user: IHubUser;
}

export interface IHubGroupActivityMetadata {
  color?: string;
  project_activity_title?: string;
  project_activity_parent?: string;
}
