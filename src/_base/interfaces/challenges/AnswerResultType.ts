import { ISendAlgorithmParams } from './IAlgorithmChallenge';
import { ISendMazeParams } from './IMazeChallenge';
import { ISendQuizParams } from './IQuizChallenge';

export type AnswerResultType = ISendQuizParams | ISendAlgorithmParams | ISendMazeParams;
