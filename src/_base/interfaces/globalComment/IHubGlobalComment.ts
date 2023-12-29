import { IHubGlobalCommentMetadata } from './IHubGlobalCommentMetadata';

export interface IHubGlobalComment {
  id: string;
  hub_project_class_id: string | null;
  hub_user_id: string | null;
  metadata: IHubGlobalCommentMetadata;
  created_at: Date;
  updated_at: Date;
}
