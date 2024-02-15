import { IconType } from 'react-icons/lib';
import { MdOutlineQuiz, MdOutlineSlowMotionVideo } from 'react-icons/md';

import { HubModuleLessonType } from '../interfaces/module';
import { IoOptionsOutline } from 'react-icons/io5';
import { GiMaze } from 'react-icons/gi';

export const lessonTypeInfoMapper: Record<HubModuleLessonType, { label: string; icon: IconType }> = {
  video: { label: `Vídeo`, icon: MdOutlineSlowMotionVideo },
  algorithm: { label: `Algoritmo`, icon: IoOptionsOutline },
  maze: { label: `Mapa`, icon: GiMaze },
  quiz: { label: `Quiz`, icon: MdOutlineQuiz },
};
