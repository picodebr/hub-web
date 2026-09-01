import { useCallback, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { Flex, Grid, Progress, Skeleton, Text, Box, Icon, Badge, useColorMode } from '@chakra-ui/react';
import { FiPlayCircle, FiCheckCircle, FiClock, FiBook } from 'react-icons/fi';
import { motion } from 'framer-motion';

import { useCustomRouter } from '@/_base/hooks/CustomRouter';
import { IHubCourse, IHubCourseActivity } from '@/_base/interfaces/course';
import { listCourses } from '@/_base/services/course';
import { useCustomToast } from '@/_base/hooks';
import { useDarkMode } from '@/_base/hooks/useDarkMode';
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

      return { finished, total, percentage: Math.min(Math.ceil((finished / (total || 1)) * 100), 100) };
    },
    [coursesActivity],
  );

  const getModuleCount = (course: IHubCourse) => course.modules.length;
  const getLessonCount = (course: IHubCourse) => course.modules.flatMap((m) => m.lessons).length;

  const handleCourseClick = (course: IHubCourse) => {
    router.push(`/courses/${course.id}?_p=${course.title}`);
  };

  // Cores dinâmicas para o tema Light/Dark
  const bgCard = colorMode === 'light' ? 'white' : 'gray.800';
  const borderColor = colorMode === 'light' ? 'gray.200' : 'gray.700';

  return (
    <Flex flex="1" direction="column" pr="0.5rem">
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
        <Skeleton
          isLoaded
          display="grid"
          gap="1rem"
          gridTemplateColumns={{ base: 'repeat(auto-fill, minmax(150px, 1fr))', sm: 'repeat(auto-fill, minmax(290px, 1fr))' }}
          gridTemplateRows="minmax(min-content, max-content)"
          borderRadius="md"
          flex="1"
          h="100%"
        >
          {courses.length ? (
            courses.map((course, index) => {
              const { finished, total, percentage } = getProgress(course);
              const isFinished = percentage === 100;
              const isStarted = percentage > 0;
              const moduleCount = getModuleCount(course);
              const lessonCount = getLessonCount(course);
              const gradients = [
                'from-sky-400 to-blue-600',
                'from-violet-400 to-purple-600',
                'from-emerald-400 to-teal-600',
                'from-amber-400 to-orange-600',
                'from-pink-400 to-rose-600',
                'from-cyan-400 to-sky-600',
              ];
              const gradient = gradients[index % gradients.length];

              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                  onClick={() => handleCourseClick(course)}
                  className="group relative rounded-2xl hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col h-fit p-4"
                >
                  {/* Gradiente Superior com Imagem */}
                  <div className={`h-32 bg-linear-to-br ${gradient} relative overflow-hidden shrink-0 rounded-xl`}>
                    {course.thumbnail && (
                      <Box
                        backgroundImage={`url(${course.thumbnail})`}
                        backgroundSize="cover"
                        backgroundPosition="center"
                        h="100%"
                        w="100%"
                        position="absolute"
                      />
                    )}
                    {/* Padrão decorativo de linhas */}
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{
                        backgroundImage:
                          'linear-gradient(rgba(255,255,255,0.8) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.8) 2px, transparent 2px)',
                        backgroundSize: '16px 16px',
                        zIndex: 1,
                      }}
                    />
                    {/* Ícone de Livro */}
                    <Flex position="absolute" inset="0" align="center" justify="center" zIndex={2}>
                      <FiBook className="w-16 h-16 text-white/50" strokeWidth={1.5} />
                    </Flex>

                    {/* Status Badge - Top Right */}
                    <Box position="absolute" top="3" right="3">
                      {isFinished ? (
                        <Badge
                          colorScheme="green"
                          variant="solid"
                          borderRadius="full"
                          px="3"
                          py="1"
                          display="flex"
                          alignItems="center"
                          gap="1"
                          fontSize="11px"
                          fontWeight="700"
                        >
                          <Icon as={FiCheckCircle} w="3" h="3" />
                          CONCLUÍDO
                        </Badge>
                      ) : isStarted ? (
                        <Badge colorScheme="blue" variant="solid" borderRadius="full" px="3" py="1" fontSize="11px" fontWeight="700">
                          {percentage}%
                        </Badge>
                      ) : (
                        <Badge
                          colorScheme="gray"
                          variant="solid"
                          borderRadius="full"
                          px="3"
                          py="1"
                          display="flex"
                          alignItems="center"
                          gap="1"
                          fontSize="11px"
                          fontWeight="700"
                        >
                          <Icon as={FiClock} w="3" h="3" />
                          NÃO INICIADO
                        </Badge>
                      )}
                    </Box>
                  </div>

                  {/* Conteúdo do Card */}
                  <Flex direction="column" gap="0.75rem" flex="1" mt="0.5rem">
                    {/* Título */}
                    <Text fontSize="14px" fontWeight="700" color={colorMode === 'light' ? 'gray.800' : 'gray.100'} noOfLines={2}>
                      {course.title}
                    </Text>

                    {/* Módulos e Aulas */}
                    <Text fontSize="12px" color={colorMode === 'light' ? 'gray.600' : 'gray.400'} fontWeight="500">
                      {moduleCount} módulo{moduleCount !== 1 ? 's' : ''} · {lessonCount} aula{lessonCount !== 1 ? 's' : ''}
                    </Text>

                    {/* Barra de Progresso */}
                    <Progress
                      value={percentage}
                      min={0}
                      max={100}
                      size="sm"
                      borderRadius="full"
                      colorScheme={isFinished ? 'green' : 'blue'}
                      bg={colorMode === 'light' ? 'gray.200' : 'gray.700'}
                      mt="0.25rem"
                    />

                    {/* Aulas Concluídas */}
                    <Text fontSize="11px" color={colorMode === 'light' ? 'gray.600' : 'gray.400'} fontWeight="500">
                      {finished}/{total} aulas concluídas
                    </Text>
                  </Flex>
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground mt-10">
              <FiPlayCircle className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-medium text-foreground/70">Lista vazia</p>
            </div>
          )}
        </Skeleton>
      )}
    </Flex>
  );
};

export default Courses;

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: { selectedPage: 'courses', pageTitle: 'Meus cursos', showBackButton: false } };
};
