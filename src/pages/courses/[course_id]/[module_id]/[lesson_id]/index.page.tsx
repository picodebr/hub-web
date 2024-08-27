import { Flex, Skeleton, Text } from '@chakra-ui/react';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { PiSealCheckFill } from 'react-icons/pi';
import { GetServerSideProps } from 'next';

import { useCustomToast } from '@/_base/hooks';
import { IHubModuleLesson } from '@/_base/interfaces/module';
import { getCourseActivity, getModuleLesson, sendModuleLesson } from '@/_base/services/course';
import { QuizPage } from '@/components/LessonPage/Quiz';
import { VideoLesson } from './components/video';

interface IProps {
  courseId: string;
  moduleId: string;
  lessonId: string;
}

const Lesson: React.FC<IProps> = ({ courseId, moduleId, lessonId }) => {
  const [lesson, setLesson] = useState<IHubModuleLesson | null>(null);
  const [lessonIsFinished, setLessonIsFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [LessonPage, setLessonPage] = useState<ReactNode>(false);

  const toast = useCustomToast();

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const [moduleLesson, activity] = await Promise.all([getModuleLesson(courseId, moduleId, lessonId), getCourseActivity(courseId)]);
        setLesson(moduleLesson);
        setLessonIsFinished(!!activity.metadata?.find((m) => m.lessons.find((l) => l.entity_id === lessonId && !!l.finished_at)));
      } catch {
        toast({ status: `error`, description: `Não foi possível listar as atividades disponíveis no momento` });
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleSubmitLesson = useCallback(async () => {
    if (lessonIsFinished) return;
    try {
      setLessonIsFinished(true);
      await sendModuleLesson(courseId, moduleId, lessonId);
    } catch {
      toast({ status: `error`, description: `Não foi possível salvar seu progresso` });
    }
  }, []);

  return lesson?.lesson_type === `quiz` ? (
    // <QuizPage answers={[]} challenge={}/>
    <VideoLesson lesson={lesson} isLoading={isLoading} handleSubmitLesson={handleSubmitLesson} lessonIsFinished={lessonIsFinished} />
  ) : (
    <VideoLesson lesson={lesson} isLoading={isLoading} handleSubmitLesson={handleSubmitLesson} lessonIsFinished={lessonIsFinished} />
  );
};

export default Lesson;

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const selectedPage = 'courses';

  const courseId = `${query.course_id}`;
  const moduleId = `${query.module_id}`;
  const lessonId = `${query.lesson_id}`;
  const pageTitle = `${query._p || 'Atividade'}`;

  return { props: { selectedPage, courseId, moduleId, lessonId, pageTitle } };
};
