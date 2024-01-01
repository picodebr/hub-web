import { IProjectMetadata } from './IProjectMetadata';

export interface IAddProjectParams {
  class_id: string;
  title: string;
  description?: string | null;
  metadata: IProjectMetadata;
}

export interface IUpdateProjectParams {
  id: string;
  title: string;
  description?: string | null;
  metadata: IProjectMetadata;
}
