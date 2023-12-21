import { IHubProjectStep } from './IHubProjectStep';

export interface IProjectMetadata {
  steps: IHubProjectStep[];
  images: string[];
  general_annotation: string;
  tools: string[];
  lesson_annotations: string[];
}
