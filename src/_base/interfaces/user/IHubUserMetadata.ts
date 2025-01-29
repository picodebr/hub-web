import { IDailyChallenge } from '../challenges';
import { HistoryDataType } from '../shared';

export interface IHubUserMetadata {
  engagement?: HistoryDataType;
  xp?: HistoryDataType;
  redefine_password?: boolean;
  last_access?: number;
  first_access?: number;
  coins?: number;
  kanban?: string;
  daily_challenges?: IDailyChallenge;
}
