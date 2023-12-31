import { IBnccSkill } from '../shared/IBnccSkill';
import { IHubProjectStep } from './IHubProjectStep';

export interface IProjectMetadata {
  steps?: IHubProjectStep[];
  presentation?: string;
  bncc?: IBnccSkill[];
  tools?: string[];
  attachments?: string[];
}
