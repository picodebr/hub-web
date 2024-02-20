import { IProject } from '../project/IProject';

export interface IProjectFolder {
  id: string;
  name: string;
  projects: IProject[];
}

export interface IProjectFolderListingItem
  extends Omit<IProjectFolder, 'projects'> {
  projects_count: number;
}
