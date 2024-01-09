import { IAlgorithmChallenge, IMazeChallenge, IQuizChallenge } from '../challenges';

export interface IHubModuleLessonMetadata {
  target_quantity?: number;
  challenges?: { quiz: IQuizChallenge[]; maze: IMazeChallenge[]; algorithm: IAlgorithmChallenge[] };
}
