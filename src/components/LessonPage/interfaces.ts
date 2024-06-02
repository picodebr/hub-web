import { IHubChallenge } from '@/_base/interfaces/challenges';
import { DailyGameProps } from '@/_base/interfaces/challenges/DailyGameProps';

export interface ILessonPageProps {
  challenge: IHubChallenge;
  registerAnswer: (value: string | string[]) => void;
  dailyGame?: DailyGameProps;
}
