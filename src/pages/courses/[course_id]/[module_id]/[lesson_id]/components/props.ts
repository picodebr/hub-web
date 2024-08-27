import { IHubModuleLesson } from '@/_base/interfaces/module';

export interface ILessonPageProps {
  isLoading: boolean;
  lesson: IHubModuleLesson | null;
  lessonIsFinished: boolean;
  handleSubmitLesson: () => void;
}
