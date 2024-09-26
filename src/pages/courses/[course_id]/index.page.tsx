import { GetServerSideProps } from 'next';

import { Flex, Progress, Skeleton, Text } from '@chakra-ui/react';
import { useCustomRouter, useCustomToast } from '@/_base/hooks';
import { useEffect, useState } from 'react';
import { IHubModule } from '@/_base/interfaces/module';
import { getCourseActivity, listModules } from '@/_base/services/course';

interface IProps {
  courseId: string;
}

const Course: React.FC<IProps> = ({ courseId }) => {
  const [modules, setModules] = useState<(IHubModule & { finished_lessons: number })[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const toast = useCustomToast();
  const router = useCustomRouter();

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const [{ results }, activity] = await Promise.all([listModules(courseId), getCourseActivity(courseId)]);
        setModules(
          results.map((r) => ({
            ...r,
            finished_lessons: activity.metadata?.find((m) => m.entity_id === r.id)?.lessons.filter((l) => !!l.finished_at)?.length || 0,
          })),
        );
      } catch {
        toast({ status: `error`, description: `Não foi possível listar os módulos disponíveis no momento` });
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <Flex
      flex="1"
      bgColor="white"
      direction="column"
      borderRadius="12px"
      padding="20px 0"
      gap="20px"
      textAlign="left"
      whiteSpace="nowrap"
      borderBottom="1px solid gray300"
      userSelect="none"
      overflow="hidden"
      border="1px"
      borderColor="gray300"
      boxShadow="md"
    >
      <Text borderBottom="1px" borderColor="gray300" padding="0 20px 20px" color="gray600">
        Módulos
      </Text>
      <Flex direction="column" p="0.35rem 1rem" fontWeight="700" color="gray700" gap="6px" h="100%" maxH="400px" overflowY="auto">
        <Skeleton isLoaded={!isLoading} h="2.75rem">
          {modules.map((mod) => (
            <Flex
              key={mod.id}
              cursor="pointer"
              p="12px 8px"
              gap="1rem"
              display="flex"
              justify="space-between"
              onClick={() => router.push(`/courses/${mod.hub_course_id}/${mod.id}?_p=${mod.title}`)}
              _hover={{ bg: `gray50` }}
              _notLast={{ borderBottom: '1px', borderColor: 'gray100', borderRadius: `4px 4px 0 0` }}
              _last={{ borderRadius: `4px` }}
              _first={{ borderRadius: `4px` }}
            >
              <Flex gap="8px" align="center">
                <Text noOfLines={1}>{mod.title}</Text>
                {/* <FiLock color="#13277A" /> */}
              </Flex>
              <Flex w="320px" gap="12px" align="center">
                <Progress value={mod.finished_lessons} rounded={8} flex="1" min={0} max={mod.lessons.length || 1} size="md" />
                <Text fontWeight="500" align="center" fontSize="14px">
                  {`${mod.finished_lessons}/${mod.lessons.length}`}
                </Text>
              </Flex>
            </Flex>
          ))}
        </Skeleton>
      </Flex>
    </Flex>
  );
};

export default Course;

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const selectedPage = 'courses';

  const courseId = `${query.course_id}`;
  const pageTitle = `${query._p || 'Curso'}`;

  return { props: { selectedPage, pageTitle, courseId } };
};
