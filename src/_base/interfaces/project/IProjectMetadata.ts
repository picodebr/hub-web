import { IHubProjectStep } from './IHubProjectStep';

export interface IProjectMetadata {
  steps?: IHubProjectStep[];
  presentation?: string;
  bncc?: string[];
  tools?: string[];
  attachments?: string[];
}
