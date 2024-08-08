import { AnswerResultType, IHubChallenge } from '@/_base/interfaces/challenges';
import { DailyGameProps } from '@/_base/interfaces/challenges/DailyGameProps';

export interface ILessonPageProps {
  challenge: IHubChallenge;
  registerAnswer: (value: AnswerResultType) => void;
  dailyGame?: DailyGameProps;
  answers: AnswerResultType[];
  onPageChange: (action: `next` | `previous`) => void;
  onFinish: () => void;
}
