import { IHubChallenge } from './IHubChallenge';

export interface DailyGameProps {
  challenges: IHubChallenge[];
  currentIndex: number;
}
