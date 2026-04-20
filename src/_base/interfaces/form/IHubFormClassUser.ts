import { IHubUser } from '../user';
import { IHubFormClass } from './IHubFormClass';

export interface IHubFormClassUser {
  id: string;
  hub_form_class_id: string;
  hub_user_id: string;
  questions: IHubFormClassAnswers[];
  metadata: IHubFormClassUserMetadata;
  created_at: Date;
  updated_at: Date;
  hub_form_class: IHubFormClass;
  user: IHubUser;
}

export interface IHubFormClassAnswers {
  question_id: string;
  score: number;
}
export interface IHubFormClassUserMetadata {}
