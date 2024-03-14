import { Flex, Skeleton, Text } from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { PiSealCheckFill } from 'react-icons/pi';
import { GetServerSideProps } from 'next';

import { useCustomToast } from '@/_base/hooks';
import { IHubModuleLesson } from '@/_base/interfaces/module';
import { getCourseActivity, getModuleLesson, sendModuleLesson } from '@/_base/services/course';

interface IProps {
  courseId: string;
  moduleId: string;
  lessonId: string;
}

const Lesson: React.FC<IProps> = ({ courseId, moduleId, lessonId }) => {
  const [lesson, setLesson] = useState<IHubModuleLesson | null>(null);
  const [lessonIsFinished, setLessonIsFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <Flex direction="column" bgColor="white" borderRadius="md" flex="1" border="1px" borderColor="gray300" overflow="hidden">
      <Flex p="1rem" gap="0.75rem" borderBottom="1px" borderColor="gray300" justify="center">
        <Flex direction="column" gap="0.75rem" flex="1">
          <Skeleton isLoaded={!isLoading} maxW="30%" display="flex" alignItems="center" gap="0.25rem">
            <Text noOfLines={1} fontWeight="500" fontSize="1rem" color="gray800">
              {lesson?.title || `Módulo vazio`}
            </Text>
            {lessonIsFinished && (
              <Flex color="primary300">
                <PiSealCheckFill fontSize="1.2rem" filter="brightness(0.93)" />
              </Flex>
            )}
          </Skeleton>
          <Skeleton isLoaded={!isLoading} maxW="30%">
            {lesson?.description && (
              <Text noOfLines={1} color="gray500">
                {lesson.description}
              </Text>
            )}
          </Skeleton>
        </Flex>
        <Flex gap="0.5rem" align="center" h="fit-content">
          <Skeleton isLoaded={!isLoading} h="1.35rem">
            <Text noOfLines={1} color="gray800" fontSize="14px">
              {lesson?.module.title}
            </Text>
          </Skeleton>
        </Flex>
      </Flex>
      <Flex direction="column" flex="1" p={{ base: `1rem`, xl: '1rem' }} gap={{ base: `1rem`, xl: '1rem' }} overflow="hidden">
        <Flex direction="column" gap="0.5rem">
          <Skeleton isLoaded={!isLoading} minH="1.35rem">
            <Text fontSize="1rem">{lesson?.video?.title}</Text>
          </Skeleton>
          <Skeleton isLoaded={!isLoading} minH="1.35rem">
            <Text color="gray400">{lesson?.video?.description}</Text>
          </Skeleton>
        </Flex>
        <Flex flex="1" border="1px" borderColor="gray200" borderRadius="10px" overflow="hidden" justify="center">
          {!!lesson?.video && (
            <video
              controls
              preload="none"
              autoPlay
              controlsList="nodownload"
              poster={lesson.video.thumbnail}
              onTimeUpdate={(e) =>
                ((e.target as any).currentTime / (e.target as any).duration) * 100 > 90 && !lessonIsFinished && handleSubmitLesson()
              }
            >
              <source src={lesson.video.file} type="video/mp4" />
            </video>
          )}
        </Flex>
      </Flex>
    </Flex>
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
