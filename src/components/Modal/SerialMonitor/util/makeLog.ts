import { ILog, LogType } from '../../../../_base/interfaces/Log/ILog';
import { getRandomId } from './getRandomId';

type FuncType = (type: LogType, content: string) => ILog;

export const makeLog: FuncType = (type, content) => ({
  id: getRandomId(),
  content,
  type,
  timestamp: new Date(),
});
