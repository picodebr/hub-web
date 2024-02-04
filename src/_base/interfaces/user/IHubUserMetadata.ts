import { HistoryDataType } from '../shared';

export interface IHubUserMetadata {
  engagement?: HistoryDataType;
  xp?: HistoryDataType;
  redefine_password?: boolean;
  last_access?: number;
  first_access?: number;
  kanban?: string;
}
