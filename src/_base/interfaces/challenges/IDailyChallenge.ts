import { AnswerResultType } from './AnswerResultType';
import { IHubChallenge } from './IHubChallenge';

export interface IDailyChallenge {
  challenges: IHubChallenge[];
  expires_at: number;
  started_at: number;
  finished_at: number | null;
  answers: Record<number, IDailyChallengeAnswers[]>;
}

export interface IDailyChallengeAnswers extends IHubChallenge {
  passed: boolean;
  earned_coins: number;
}

export interface ISendDailyChallengesParams {
  results: AnswerResultType[];
}
