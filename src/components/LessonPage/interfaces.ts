import { AnswerResultType, IHubChallenge } from '@/_base/interfaces/challenges';
import { DailyGameProps } from '@/_base/interfaces/challenges/DailyGameProps';

export interface ILessonPageProps {
  challenge?: IHubChallenge | null;
  registerAnswer: (value: AnswerResultType) => void;
  dailyGame?: DailyGameProps;
  lessonChallenges?: IHubChallenge[];
  answers?: AnswerResultType[];
  onPageChange?: (action: `next` | `previous`) => void;
  onFinish: () => void;
  complete?: boolean;
  currentLessonIndex?: number;
}
