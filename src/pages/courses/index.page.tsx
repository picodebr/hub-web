import { useCallback, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { Flex, Grid, Progress, Skeleton, Text, Box, Icon, Badge, useColorMode } from '@chakra-ui/react';
import { FiPlayCircle, FiCheckCircle, FiClock } from 'react-icons/fi';
import { motion } from 'framer-motion';

import { useCustomRouter } from '@/_base/hooks/CustomRouter';
import { IHubCourse, IHubCourseActivity } from '@/_base/interfaces/course';
import { listCourses } from '@/_base/services/course';
import { useCustomToast } from '@/_base/hooks';
import { useDarkMode } from '@/_base/hooks/useDarkMode';
import { InternalCard } from '@/components/InternalCard';
import { InternalPageHeader } from '@/components/InternalPageHeader';

// --- Variáveis de Animação (Framer Motion) ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

const Courses: React.FC = () => {
  const [courses, setCourses] = useState<IHubCourse[]>([]);
  const [coursesActivity, setCoursesActivity] = useState<IHubCourseActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { colorMode } = useColorMode();
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

  const handleCourseClick = (course: IHubCourse) => {
    router.push(`/courses/${course.id}?_p=${course.title}`);
  };

  // Cores dinâmicas para o tema Light/Dark
  const bgCard = colorMode === 'light' ? 'white' : 'gray.800';
  const borderColor = colorMode === 'light' ? 'gray.200' : 'gray.700';

  return (
    <Flex flex="1" direction="column" h="100%" overflowY="auto" overflowX="hidden" pb="2rem" pr="0.5rem">
      {/* Cabeçalho da Página */}
      <InternalPageHeader
        title="Meus Cursos e Trilhas"
        description="Seu aprendizado começa aqui"
        icon={<FiPlayCircle className="w-6 h-6 text-primary" />}
      />
      {/* Conteúdo Principal */}
      {isLoading ? (
        <Grid gap="1.5rem" gridTemplateColumns="repeat(auto-fill, minmax(260px, 1fr))">
          {[1, 2, 3, 4].map((i) => (
            <Flex key={i} direction="column" borderRadius="2xl" overflow="hidden" border="1px solid" borderColor={borderColor}>
              <Skeleton h="200px" w="100%" />
              <Flex direction="column" p="1.25rem" gap="1rem" bg={bgCard}>
                <Skeleton h="20px" w="80%" />
                <Skeleton h="10px" w="100%" />
              </Flex>
            </Flex>
          ))}
        </Grid>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 overflow-y-auto pb-8 px-2 content-start h-full pt-2">
          {courses.length ? (
            courses.map((course, index) => {
              const progress = getProgress(course);
              const isFinished = progress === 100;
              const isStarted = progress > 0;

              return (
                <InternalCard
                  key={course.id}
                  index={index}
                  onClick={() => handleCourseClick(course)}
                  title={course.title}
                  Icon={FiPlayCircle}
                  content={
                    course.thumbnail ? (
                      <Flex height="160px" p="1rem" marginBottom="-1rem" zIndex="999">
                        <Box
                          backgroundImage={`url(${course.thumbnail || '/logo/pi-logo-dark.svg'})`}
                          backgroundSize="contain"
                          backgroundPosition="center"
                          backgroundRepeat="no-repeat"
                          h="100%"
                          w="100%"
                          border="1px solid"
                          borderRadius="1rem"
                          borderColor={borderColor}
                        />
                      </Flex>
                    ) : undefined
                  }
                  footer={
                    <Flex direction="column" gap="0.5rem" w="100%">
                      <Flex justify="space-between" align="center">
                        {isFinished ? (
                          <Badge colorScheme="green" variant="subtle" borderRadius="full" px="2" display="flex" alignItems="center" gap="1">
                            <Icon as={FiCheckCircle} /> Concluído
                          </Badge>
                        ) : isStarted ? (
                          <Text fontSize="12px" fontWeight="600" color="primary.600">
                            {progress}% Concluído
                          </Text>
                        ) : (
                          <Badge colorScheme="gray" variant="subtle" borderRadius="full" px="2" display="flex" alignItems="center" gap="1">
                            <Icon as={FiClock} /> Não iniciado
                          </Badge>
                        )}
                      </Flex>

                      <Progress
                        value={progress}
                        min={0}
                        max={100}
                        size="sm"
                        borderRadius="full"
                        colorScheme={isFinished ? 'green' : 'blue'}
                        bg={colorMode === 'light' ? 'gray.100' : 'gray.700'}
                      />
                    </Flex>
                  }
                  showFooterIcon
                />
              );
            })
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground mt-10">
              <FiPlayCircle className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-medium text-foreground/70">Lista vazia</p>
            </div>
          )}
        </div>
      )}
    </Flex>
  );
};

export default Courses;

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: { selectedPage: 'courses', pageTitle: 'Meus cursos', showBackButton: false } };
};
