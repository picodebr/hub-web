import { IHubGroupMetadata } from './IHubGroupMetadata';

export interface IHubGroup {
  id: string;
  hub_project_class_id: string | null;
  hub_user_id: string | null;
  display_name: string;
  metadata: IHubGroupMetadata;
  created_at: Date;
  updated_at: Date;
}
