import { ILearnBotElementLayout } from '@/components/LearnBotSimulator/interfaces';

export const sourceCodeModes = <const>['block', 'text'];

export type SourceCodeMode = (typeof sourceCodeModes)[number];

export interface IProjectSourceCode {
  variables: string[];
  code: string;
  mode: SourceCodeMode;
  simulation_elements_layout: ILearnBotElementLayout[];
}

export interface ICodeProject {
  id: string;
  folder_id: string;
  name: string;
  source_code: IProjectSourceCode;
  user_id: string;
  snapshot: string | null;
  private: boolean;
  created_at: string;
  updated_at: string;
}
