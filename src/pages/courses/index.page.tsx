import { useCallback, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { Flex, Grid, Progress, Skeleton, Text } from '@chakra-ui/react';

import { logError, cookieManager } from '@/_base/utils';
import { useCustomRouter } from '@/_base/hooks/CustomRouter';
import { IHubCourse, IHubCourseActivity } from '@/_base/interfaces/course';
import { listCourses } from '@/_base/services/course';
import { useCustomToast } from '@/_base/hooks';

const Courses: React.FC = () => {
  const [courses, setCourses] = useState<IHubCourse[]>([]);
  const [coursesActivity, setCoursesActivity] = useState<IHubCourseActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const router = useCustomRouter();
  const toast = useCustomToast();

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const { results, activities } = await listCourses();
        setCourses(results);
        setCoursesActivity(activities);
      } catch {
        toast({ status: `error`, description: `Não foi possível listar os cursos disponíveis no momento` });
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const getProgress = useCallback(
    (course: IHubCourse) => {
      const total = course.modules.flatMap((m) => m.lessons).length;
      const finished = coursesActivity
        ?.filter((activity) => activity.hub_course_id === course.id)
        .flatMap((c) => (c.metadata || []).flatMap((m) => m.lessons))
        .filter((lesson) => !!lesson.finished_at).length;

      return Math.min(Math.ceil((finished / (total || 1)) * 100), 100);
    },
    [coursesActivity],
  );

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
      border="1px"
      borderColor="gray300"
      color="gray600"
    >
      <Text borderBottom="1px" borderColor="gray300" padding="0 20px 20px">
        Meus cursos
      </Text>
      <Skeleton isLoaded={!isLoading} m="0 2rem" rounded={8} h="250px" w="175px">
        <Grid
          gap="1.5rem"
          gridTemplateColumns="repeat(auto-fill, minmax(175px, 1fr))"
          gridTemplateRows="minmax(min-content, max-content)"
          borderRadius="md"
          flex="1"
        >
          {courses.map((course) => (
            <Flex
              key={course.id}
              direction="column"
              h="100%"
              w="175px"
              overflow="hidden"
              cursor="pointer"
              _hover={{ filter: 'brightness(0.95)' }}
              onClick={() => router.push(`/courses/${course.id}?_p=${course.title}`)}
              bg="gray50"
              border="1px"
              borderColor="gray200"
              borderRadius="6px"
            >
              <Flex
                backgroundImage={course.thumbnail || `/logo/pi-logo-dark.svg`}
                backgroundSize="cover"
                backgroundPosition="center"
                h="203px"
                borderRadius="6px 6px 0 0 "
              />
              <Flex direction="column" padding="0.5rem">
                <Text noOfLines={1}>{course.title}</Text>
                <Flex align="center" gap="1rem">
                  <Progress size="sm" colorScheme="green" value={getProgress(course)} rounded={8} flex="1" min={0} max={100} />
                  <Text w="fit-content" fontSize="12px">
                    {getProgress(course)}%
                  </Text>
                </Flex>
              </Flex>
            </Flex>
          ))}
        </Grid>
      </Skeleton>
    </Flex>
  );
};

export default Courses;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const selectedPage = 'courses';

  try {
    cookieManager.updateToken(req);

    return { props: { selectedPage, pageTitle: 'Meus cursos', showBackButton: false } };
  } catch (err: any) {
    cookieManager.forceTokenExpires(res);
    logError(selectedPage, err);

    return { redirect: { destination: '/login', permanent: false } };
  }
};
