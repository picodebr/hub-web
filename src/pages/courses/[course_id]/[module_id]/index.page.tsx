import { useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { Progress } from 'antd';
import { Flex, Skeleton, Text } from '@chakra-ui/react';
import { PiSealCheckFill } from 'react-icons/pi';

import { lessonTypeInfoMapper } from '@/_base/utils';
import { useCustomRouter, useCustomToast } from '@/_base/hooks';
import { IHubModule, IHubModuleLesson } from '@/_base/interfaces/module';
import { getCourseActivity, listModuleLessons } from '@/_base/services/course';
import { getHubModule } from '@/_base/services/module';
import { GenericButton } from '@/components/Buttons/Generic';
import { ILessonActivity } from '@/_base/interfaces/course';
interface IProps {
  courseId: string;
  moduleId: string;
}

const Module: React.FC<IProps> = ({ courseId, moduleId }) => {
  const [hubModule, setHubModule] = useState<IHubModule | null>(null);
  const [lessons, setLessons] = useState<(IHubModuleLesson & { finished?: boolean })[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [finishedLessons, setFinishedLessons] = useState<ILessonActivity[]>([]);

  const toast = useCustomToast();
  const router = useCustomRouter();

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const [{ results }, mod, activity] = await Promise.all([
          listModuleLessons(courseId, moduleId),
          getHubModule(moduleId),
          getCourseActivity(courseId),
        ]);

        const totalLessonFinished =
          activity.metadata?.filter((m) => m.entity_id === mod.id).flatMap((m) => m.lessons.filter((l) => !!l.finished_at)) || [];
        setFinishedLessons(totalLessonFinished);
        setLessons(
          results.map((result) => ({
            ...result,
            finished: !!totalLessonFinished.find((l) => l.entity_id === result.id),
          })),
        );
        setHubModule(mod);
      } catch {
        toast({ status: `error`, description: `Não foi possível listar as atividades disponíveis no momento` });
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <Flex direction="column" bgColor="white" borderRadius="md" flex="1" border="1px" borderColor="gray300" overflow="hidden" boxShadow="md">
      <Flex p="1rem" gap="1rem" borderBottom="1px" borderColor="gray300" align="center" direction={{ base: 'column', lg: 'row' }}>
        <Skeleton
          isLoaded={!isLoading}
          display={{ base: 'flex', lg: undefined }}
          justifyContent={{ base: 'space-around', lg: undefined }}
          w={{ base: '100%', lg: undefined }}
          gap="1rem"
        >
          <Flex
            backgroundImage={hubModule?.course.thumbnail || `/logo/pi-logo-dark.svg`}
            backgroundSize="cover"
            backgroundPosition="center"
            h="130px"
            aspectRatio={1}
            borderRadius="6px"
            border="1px"
            borderColor="gray200"
          />
          <Flex display={{ base: 'flex', lg: 'none' }}>
            <Progress
              type="circle"
              percent={Math.ceil((finishedLessons.length / lessons.length) * 100)}
              format={() => (isLoading ? `` : `${finishedLessons.length}/${lessons.length}`)}
            />
          </Flex>
        </Skeleton>
        <Flex direction="column" gap="1rem" flex="1" h="100%" w="100%">
          <Skeleton isLoaded={!isLoading} maxW={{ base: undefined, xl: '30%' }}>
            <Text noOfLines={1} fontWeight="500" fontSize="1rem">
              {hubModule?.title || `Módulo vazio`}
            </Text>
          </Skeleton>
          <Skeleton isLoaded={!isLoading} maxW={{ base: undefined, xl: '30%' }}>
            {hubModule?.description && (
              <Text noOfLines={4} color="gray500">
                {hubModule.description}
              </Text>
            )}
          </Skeleton>
          <Flex flex="1" align="flex-end">
            <Skeleton isLoaded={!isLoading} maxW={{ base: undefined, xl: '30%' }}>
              <Text noOfLines={1} color="gray400" fontSize="14px">
                Curso: {hubModule?.course.title || `Módulo vazio`}
              </Text>
            </Skeleton>
          </Flex>
        </Flex>
        <Flex display={{ base: 'none', lg: 'flex' }}>
          <Progress
            type="circle"
            percent={Math.ceil((finishedLessons.length / lessons.length) * 100)}
            format={() => (isLoading ? `` : `${finishedLessons.length}/${lessons.length}`)}
          />
        </Flex>
      </Flex>
      <Flex direction="column" flex="1" overflow="hidden auto" p={{ base: `1rem`, xl: '2rem' }} gap={{ base: `1rem`, xl: '2rem' }}>
        {(lessons.length ? lessons : [{} as IHubModuleLesson & { finished?: boolean }]).map((lesson, i) =>
          lesson.id ? (
            <Flex
              key={lesson.id + i}
              bg="gray50"
              minH="4.5rem"
              maxH="4.5rem"
              padding="0.5rem 1rem"
              borderRadius="md"
              justify="space-between"
              cursor="pointer"
              transition="all 0.07s"
              _hover={{ filter: `brightness(0.98)` }}
            >
              <Flex direction="column" justify="space-between" pb="0.15rem">
                <Flex gap="0.5rem" align="center">
                  <Text fontWeight="500" color="gray800">{`${i + 1}. ${lesson.title}`}</Text>
                  {lesson.finished && (
                    <Flex color="primary300">
                      <PiSealCheckFill fontSize="1.2rem" filter="brightness(0.93)" />
                    </Flex>
                  )}
                </Flex>
                <Flex bg="primary700" w="fit-content" p="0.15rem 0.5rem" borderRadius="xl" align="center">
                  <Text color="#fff" fontSize="13px" textAlign="center">
                    {lessonTypeInfoMapper[lesson.lesson_type].label}
                  </Text>
                </Flex>
              </Flex>
              <Flex align="center">
                <GenericButton
                  label={finishedLessons.find((l) => l.entity_id === lesson.id) ? 'Ver novamente' : 'Iniciar'}
                  bg="primary700"
                  color="gray800"
                  leftIcon={lessonTypeInfoMapper[lesson.lesson_type].icon({ fontSize: `1.15rem` })}
                  onClick={() => router.push(`/courses/${courseId}/${moduleId}/${lesson.id}?_p=${lesson.title}`)}
                />
              </Flex>
            </Flex>
          ) : (
            <>
              <Skeleton minH="4.5rem" maxH="4.5rem" m="0 2rem" />
              <Skeleton minH="4.5rem" maxH="4.5rem" m="0 2rem" />
              <Skeleton minH="4.5rem" maxH="4.5rem" m="0 2rem" />
            </>
          ),
        )}
      </Flex>
    </Flex>
  );
};

export default Module;

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const selectedPage = 'courses';

  const courseId = `${query.course_id}`;
  const moduleId = `${query.module_id}`;
  const pageTitle = `${query._p || 'Módulo'}`;

  return { props: { selectedPage, courseId, moduleId, pageTitle } };
};
