import React, { useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { Flex, Skeleton, Text, Box, CircularProgress, CircularProgressLabel, Badge, Icon, useColorMode, Button } from '@chakra-ui/react';
import { PiSealCheckFill } from 'react-icons/pi';
import { FiLock, FiPlayCircle, FiRotateCcw } from 'react-icons/fi';
import { motion } from 'framer-motion';

import { lessonTypeInfoMapper } from '@/_base/utils';
import { useCustomRouter, useCustomToast } from '@/_base/hooks';
import { IHubModule, IHubModuleLesson } from '@/_base/interfaces/module';
import { getCourseActivity, listModuleLessons } from '@/_base/services/course';
import { getHubModule } from '@/_base/services/module';
import { ILessonActivity } from '@/_base/interfaces/course';

interface IProps {
  courseId: string;
  moduleId: string;
}

// Variáveis de Animação
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

const Module: React.FC<IProps> = ({ courseId, moduleId }) => {
  const [hubModule, setHubModule] = useState<IHubModule | null>(null);
  const [lessons, setLessons] = useState<(IHubModuleLesson & { finished?: boolean })[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [finishedLessons, setFinishedLessons] = useState<ILessonActivity[]>([]);

  const toast = useCustomToast();
  const router = useCustomRouter();
  const { colorMode } = useColorMode();

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

  const progressPercent = Math.ceil((finishedLessons.length / (lessons.length || 1)) * 100);

  // Cores dinâmicas para o tema Light/Dark
  const bgCard = colorMode === 'light' ? 'white' : 'gray.800';
  const borderColor = colorMode === 'light' ? 'gray.200' : 'gray.700';

  return (
    <Flex direction="column" flex="1" overflow="hidden" gap="1.5rem" pb="2rem">
      {/* 1. HEADER (Hero do Módulo) */}
      <Flex
        bg={bgCard}
        p="1.5rem"
        borderRadius="2xl"
        border="1px solid"
        borderColor={borderColor}
        boxShadow="sm"
        gap="1.5rem"
        align="center"
        direction={{ base: 'column', md: 'row' }}
      >
        <Skeleton isLoaded={!isLoading} borderRadius="xl" overflow="hidden" flexShrink={0}>
          <Flex
            backgroundImage={`url(${hubModule?.course.thumbnail || '/logo/pi-logo-dark.svg'})`}
            backgroundSize="cover"
            backgroundPosition="center"
            h={{ base: '180px', md: '140px' }}
            w={{ base: '100%', md: '140px' }}
            borderRadius="xl"
            border="1px solid"
            borderColor={borderColor}
          />
        </Skeleton>

        <Flex direction="column" gap="0.75rem" flex="1" w="100%">
          <Skeleton isLoaded={!isLoading} maxW={{ base: '100%', md: '60%' }}>
            <Text fontWeight="800" fontSize={{ base: '20px', md: '24px' }} color={colorMode === 'dark' ? 'white' : 'gray.800'} lineHeight="1.2">
              {hubModule?.title || `Carregando módulo...`}
            </Text>
          </Skeleton>

          <Skeleton isLoaded={!isLoading} maxW="100%">
            <Text noOfLines={3} color="gray.500" fontSize="14px">
              {hubModule?.description || 'Nenhuma descrição fornecida para este módulo.'}
            </Text>
          </Skeleton>

          <Skeleton isLoaded={!isLoading} maxW={{ base: '80%', md: '40%' }} mt="auto">
            <Flex
              align="center"
              gap="0.5rem"
              bg={colorMode === 'light' ? 'gray.50' : 'whiteAlpha.50'}
              w="fit-content"
              px="0.75rem"
              py="0.25rem"
              borderRadius="full"
              border="1px solid"
              borderColor={borderColor}
            >
              <Text color="gray.500" fontSize="13px" fontWeight="600">
                Curso:{' '}
                <Text as="span" color="primary.500">
                  {hubModule?.course.title || `...`}
                </Text>
              </Text>
            </Flex>
          </Skeleton>
        </Flex>

        {/* Progresso (Chakra UI Nativo) */}
        <Flex display={{ base: 'none', lg: 'flex' }} align="center" justify="center" p="1rem" flexShrink={0}>
          <Skeleton isLoaded={!isLoading} borderRadius="full">
            <CircularProgress value={progressPercent} size="90px" thickness="8px">
              <CircularProgressLabel fontSize="18px" fontWeight="700" color={colorMode === 'dark' ? 'white' : 'gray.800'}>
                {isLoading ? '...' : `${finishedLessons.length}/${lessons.length}`}
              </CircularProgressLabel>
            </CircularProgress>
          </Skeleton>
        </Flex>
      </Flex>

      {/* 2. LISTA DE AULAS (A Jornada) */}
      <Flex direction="column" flex="1" overflowY="auto" pr="0.5rem">
        {isLoading ? (
          <Flex direction="column" gap="1rem">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} h="5.5rem" borderRadius="xl" />
            ))}
          </Flex>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="show">
            <Flex direction="column" gap="1rem">
              {lessons
                .sort((a, b) => (a?.position || 1) - (b?.position || 1))
                .map((lesson, i, arr) => {
                  const isLocked = hubModule?.metadata?.respect_hierarchy && !!i && !arr[i - 1].finished;
                  const isFinished = !!lesson.finished;
                  const LessonIcon = lessonTypeInfoMapper[lesson.lesson_type]?.icon;

                  return (
                    <motion.div key={lesson.id} variants={itemVariants}>
                      <Flex
                        bg={bgCard}
                        p={{ base: '1rem', md: '1.25rem' }}
                        borderRadius="xl"
                        border="1px solid"
                        borderColor={isFinished ? 'green.200' : borderColor}
                        align={{ base: 'flex-start', md: 'center' }}
                        justify="space-between"
                        direction={{ base: 'column', md: 'row' }}
                        gap="1rem"
                        opacity={isLocked ? 0.65 : 1}
                        cursor={isLocked ? 'not-allowed' : 'pointer'}
                        transition="all 0.2s"
                        boxShadow="sm"
                        _hover={isLocked ? {} : { transform: 'translateX(4px)', borderColor: 'primary.300', boxShadow: 'md' }}
                        onClick={() => !isLocked && router.push(`/courses/${courseId}/${moduleId}/${lesson.id}?_p=${lesson.title}`)}
                      >
                        <Flex align="center" gap="1.25rem" flex="1" w="100%">
                          {/* Indicador de Status/Índice */}
                          <Flex
                            w="44px"
                            h="44px"
                            borderRadius="full"
                            flexShrink={0}
                            bg={isFinished ? 'green.50' : isLocked ? 'gray.100' : 'primary.50'}
                            color={isFinished ? 'green.500' : isLocked ? 'gray.400' : 'primary.500'}
                            align="center"
                            justify="center"
                            border="1px solid"
                            borderColor={isFinished ? 'green.200' : isLocked ? 'gray.200' : 'primary.200'}
                          >
                            {isFinished ? (
                              <Icon as={PiSealCheckFill} fontSize="1.5rem" />
                            ) : (
                              <Text fontWeight="800" fontSize="16px">
                                {i + 1}
                              </Text>
                            )}
                          </Flex>

                          {/* Informações da Aula */}
                          <Flex direction="column" gap="0.25rem">
                            <Text fontWeight="700" fontSize="16px" color={colorMode === 'dark' ? 'white' : 'gray.800'} noOfLines={1}>
                              {lesson.title}
                            </Text>
                            <Flex align="center" gap="0.5rem">
                              <Badge
                                colorScheme={isLocked ? 'gray' : 'blue'}
                                variant="subtle"
                                borderRadius="md"
                                px="2"
                                py="0.5"
                                display="flex"
                                alignItems="center"
                                gap="1"
                              >
                                {LessonIcon && <LessonIcon fontSize="12px" />}
                                <Text mt="1px">{lessonTypeInfoMapper[lesson.lesson_type]?.label}</Text>
                              </Badge>
                            </Flex>
                          </Flex>
                        </Flex>

                        {/* Botão de Ação */}
                        <Flex w={{ base: '100%', md: 'auto' }} justify="flex-end">
                          <Button
                            isDisabled={isLocked}
                            colorScheme={isFinished ? 'gray' : 'blue'}
                            variant={isFinished ? 'outline' : 'solid'}
                            bg={!isFinished && !isLocked ? 'primary.600' : undefined}
                            color={!isFinished && !isLocked ? 'white' : undefined}
                            leftIcon={
                              isLocked ? (
                                <Icon as={FiLock} />
                              ) : isFinished ? (
                                lesson.lesson_type === 'video' ? (
                                  <Icon as={FiPlayCircle} />
                                ) : (
                                  <Icon as={FiRotateCcw} />
                                )
                              ) : (
                                <Icon as={FiPlayCircle} />
                              )
                            }
                            w={{ base: '100%', md: 'auto' }}
                            borderRadius="lg"
                          >
                            {isLocked ? 'Bloqueado' : isFinished ? (lesson.lesson_type === 'video' ? 'Rever' : 'Refazer') : 'Iniciar'}
                          </Button>
                        </Flex>
                      </Flex>
                    </motion.div>
                  );
                })}
            </Flex>
          </motion.div>
        )}
      </Flex>
    </Flex>
  );
};

export default Module;

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  return {
    props: {
      selectedPage: 'courses',
      courseId: `${query.course_id}`,
      moduleId: `${query.module_id}`,
      pageTitle: `${query._p || 'Módulo'}`,
    },
  };
};
