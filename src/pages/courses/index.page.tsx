import { useCallback, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { Flex, Grid, Progress, Skeleton, Text, Box, Icon, useColorMode, Badge } from '@chakra-ui/react';
import { FiPlayCircle, FiCheckCircle, FiClock } from 'react-icons/fi';
import { motion } from 'framer-motion';

import { useCustomRouter } from '@/_base/hooks/CustomRouter';
import { IHubCourse, IHubCourseActivity } from '@/_base/interfaces/course';
import { listCourses } from '@/_base/services/course';
import { useCustomToast } from '@/_base/hooks';

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
    <Flex flex="1" direction="column" gap="1.5rem" h="100%" overflowY="auto" overflowX="hidden" pb="2rem" pr="0.5rem">
      {/* Cabeçalho da Página */}
      <Flex align="center" gap="0.75rem" mb="0.5rem">
        <Flex bg="primary.100" color="primary.600" p="0.5rem" borderRadius="lg">
          <Icon as={FiPlayCircle} boxSize="1.5rem" />
        </Flex>
        <Text fontSize={{ base: '20px', md: '24px' }} fontWeight="800" color={colorMode === 'dark' ? 'white' : 'gray.800'}>
          Meus Cursos e Trilhas
        </Text>
      </Flex>

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
      ) : courses.length === 0 ? (
        <Flex
          direction="column"
          align="center"
          justify="center"
          h="200px"
          border="2px dashed"
          borderColor={borderColor}
          borderRadius="2xl"
          color="gray.400"
        >
          <Icon as={FiPlayCircle} boxSize="3rem" mb="0.5rem" opacity={0.5} />
          <Text fontWeight="500">Nenhum curso disponível no momento.</Text>
        </Flex>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="show">
          <Grid gap="1.5rem" gridTemplateColumns="repeat(auto-fill, minmax(260px, 1fr))">
            {courses.map((course) => {
              const progress = getProgress(course);
              const isFinished = progress === 100;
              const isStarted = progress > 0;

              return (
                <motion.div key={course.id} variants={itemVariants}>
                  <Flex
                    direction="column"
                    h="100%"
                    w="100%"
                    bg={bgCard}
                    border="1px solid"
                    borderColor={borderColor}
                    borderRadius="2xl"
                    overflow="hidden"
                    cursor="pointer"
                    transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
                    _hover={{ transform: 'translateY(-6px)', boxShadow: 'xl', borderColor: 'primary.300' }}
                    onClick={() => handleCourseClick(course)}
                  >
                    {/* Imagem de Capa */}
                    <Box
                      backgroundImage={`url(${course.thumbnail || '/logo/pi-logo-dark.svg'})`}
                      backgroundSize="cover"
                      backgroundPosition="center"
                      backgroundRepeat="no-repeat"
                      h="200px"
                      w="100%"
                      borderBottom="1px solid"
                      borderColor={borderColor}
                    />

                    {/* Informações do Curso */}
                    <Flex direction="column" p="1.25rem" flex="1" justify="space-between" gap="1.25rem">
                      <Text fontSize="16px" fontWeight="700" color={colorMode === 'dark' ? 'white' : 'gray.800'} noOfLines={2} lineHeight="1.3">
                        {course.title}
                      </Text>

                      {/* Barra de Progresso Inteligente */}
                      <Flex direction="column" gap="0.5rem">
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
                    </Flex>
                  </Flex>
                </motion.div>
              );
            })}
          </Grid>
        </motion.div>
      )}
    </Flex>
  );
};

export default Courses;

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: { selectedPage: 'courses', pageTitle: 'Meus cursos', showBackButton: false } };
};
