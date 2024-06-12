import { IDailyChallenge } from './IDailyChallenge';

export interface DailyGameProps extends IDailyChallenge {
  currentIndex: number;
  remainingLifes: number;
}
