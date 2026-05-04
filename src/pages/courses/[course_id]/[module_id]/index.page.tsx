import React, { useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { Flex, Skeleton, Text, Box, CircularProgress, CircularProgressLabel, Badge, Icon, Button } from '@chakra-ui/react';
import { PiSealCheckFill } from 'react-icons/pi';
import { FiLock, FiPlayCircle, FiRotateCcw } from 'react-icons/fi';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

import { lessonTypeInfoMapper } from '@/_base/utils';
import { useAsyncCallback, useCustomRouter, useCustomToast } from '@/_base/hooks';
import { useDarkMode } from '@/_base/hooks/useDarkMode';
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
  const { colorMode } = useDarkMode();

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
    <Flex direction="column" flex="1" gap="1.5rem" pb="2rem">
      {/* 1. HEADER - Informações Simples com Botão de Voltar */}
      <Flex direction="column" gap="0.25rem">
        <Flex align="center" gap="1rem">
          <Flex
            userSelect="none"
            cursor="pointer"
            fontWeight="600"
            onClick={() => router.back()}
            pb="0.5rem"
            w="fit-content"
            pt="10px"
            transition="all 0.2s"
            _hover={{ transform: `scale(1.2)` }}
          >
            <ArrowLeft size={20} color={colorMode === 'dark' ? 'white' : 'black'} />
          </Flex>
          <Text fontWeight="700" fontSize="24px" color={colorMode === 'dark' ? 'white' : 'gray.800'}>
            {hubModule?.title || `Carregando módulo...`}
          </Text>
        </Flex>
        <Flex align="center" gap="1rem" color="gray.500" fontSize="13px" ml="2.5rem">
          <Text>{hubModule?.course.title || `...`}</Text>
          <Text>·</Text>
          <Text>
            {lessons.length} aula{lessons.length !== 1 ? 's' : ''}
          </Text>
          <Text>·</Text>
          <Text>{progressPercent}%</Text>
        </Flex>
      </Flex>

      {/* 2. LISTA DE AULAS (Grid de Cards) */}
      <Flex direction="column" flex="1" overflowY="auto" pr="0.5rem">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} h="56" borderRadius="xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4 ">
            {lessons
              .sort((a, b) => (a?.position || 1) - (b?.position || 1))
              .map((lesson, i, arr) => {
                const isLocked = hubModule?.metadata?.respect_hierarchy && !!i && !arr[i - 1].finished;
                const isFinished = !!lesson.finished;

                return (
                  <motion.div
                    key={lesson.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={!isLocked ? { y: -4 } : {}}
                    onClick={() => !isLocked && router.push(`/courses/${courseId}/${moduleId}/${lesson.id}?_p=${lesson.title}`)}
                    className={`group relative transition-all duration-300 ${!isLocked ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}
                  >
                    {/* Card da Aula */}
                    <Flex
                      direction="column"
                      gap="0.5rem"
                      h="fit-content"
                      bg={bgCard}
                      borderRadius="xl"
                      p="0.75rem"
                      border="1px solid"
                      borderColor={borderColor}
                      boxShadow="sm"
                      _hover={!isLocked ? { boxShadow: 'md', borderColor: 'primary.300' } : {}}
                    >
                      {/* Imagem/Fundo Escuro */}
                      <Box
                        position="relative"
                        h="36"
                        bg="gray.900"
                        borderRadius="lg"
                        overflow="hidden"
                        border="1px solid"
                        borderColor="gray.700"
                        boxShadow="md"
                        _hover={!isLocked ? { boxShadow: 'lg' } : {}}
                      >
                        {/* Padrão decorativo de linhas */}
                        <div
                          className="absolute inset-0 opacity-10"
                          style={{
                            backgroundImage:
                              'linear-gradient(rgba(255,255,255,0.8) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.8) 2px, transparent 2px)',
                            backgroundSize: '16px 16px',
                            zIndex: 1,
                          }}
                        />

                        {/* Número/Ícone Centralizado */}
                        <Flex position="absolute" inset="0" align="center" justify="center" zIndex={2}>
                          {isFinished ? (
                            <Flex
                              w="12"
                              h="12"
                              borderRadius="xl"
                              bg="blue.500/30"
                              align="center"
                              justify="center"
                              backdropFilter="blur(10px)"
                              border="2px solid"
                              borderColor="blue.400"
                            >
                              <Icon as={PiSealCheckFill} fontSize="lg" color="blue.300" />
                            </Flex>
                          ) : (
                            <Flex
                              w="12"
                              h="12"
                              borderRadius="xl"
                              bg="blue.500/30"
                              align="center"
                              justify="center"
                              backdropFilter="blur(10px)"
                              border="2px solid"
                              borderColor="blue.400"
                            >
                              <FiPlayCircle className="w-6 h-6 text-blue.300" />
                            </Flex>
                          )}
                        </Flex>

                        {/* Flag VISTO - Top Right */}
                        {isFinished && (
                          <Box position="absolute" top="3" right="3" zIndex={10}>
                            <Badge colorScheme="blue" variant="solid" borderRadius="full" px="2" py="1" fontSize="10px" fontWeight="700">
                              VISTO
                            </Badge>
                          </Box>
                        )}

                        {/* Tempo do Vídeo - Bottom Right */}
                        {lesson.lesson_type === 'video' && <VideoDuration urlS3={lesson.video?.file} />}
                      </Box>

                      {/* Título da Aula */}
                      <Flex direction="column" gap="0.25rem" mt="0.25rem">
                        <Text fontSize="11px" color="gray.500" fontWeight="600">
                          {i + 1}. {lessonTypeInfoMapper[lesson.lesson_type]?.label}
                        </Text>
                        <Text fontSize="13px" fontWeight="700" color={colorMode === 'dark' ? 'white' : 'gray.800'} noOfLines={2} lineHeight="1.3">
                          {lesson.title}
                        </Text>
                      </Flex>
                    </Flex>
                  </motion.div>
                );
              })}
          </div>
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

const formatTime = (segundos: number) => {
  if (!segundos) return '00:00';

  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  const segsRestantes = Math.floor(segundos % 60);

  const minutosFormatados = minutos.toString().padStart(2, '0');
  const segundosFormatados = segsRestantes.toString().padStart(2, '0');

  if (horas > 0) {
    return `${horas}:${minutosFormatados}:${segundosFormatados}`;
  }
  return `${minutosFormatados}:${segundosFormatados}`;
};

interface IVideoDurationProps {
  urlS3?: string;
}

const VideoDuration: React.FC<IVideoDurationProps> = ({ urlS3 }) => {
  const [duration, setDuration] = useState<number | null>(null);

  useEffect(() => {
    if (!urlS3) return;

    // Cria um elemento de vídeo em memória (não aparece na tela)
    const videoElement = document.createElement('video');

    // Adiciona o crossOrigin para evitar bloqueios de CORS ao ler os metadados
    videoElement.crossOrigin = 'anonymous';
    videoElement.src = urlS3;

    // Dispara assim que os metadados (como a duração) estiverem disponíveis
    videoElement.onloadedmetadata = () => {
      setDuration(videoElement.duration);
    };

    // Tratamento de erro caso o link seja inválido ou o S3 bloqueie o acesso
    videoElement.onerror = () => {
      console.error('Erro ao carregar os metadados do vídeo.');
    };

    // Limpeza de memória quando o componente for desmontado
    return () => {
      videoElement.removeAttribute('src');
      videoElement.load();
    };
  }, [urlS3]);

  return (
    <Box position="absolute" bottom="3" right="3" zIndex={10}>
      <Badge
        bg="gray.900/80"
        backdropFilter="blur(10px)"
        border="1px solid"
        borderColor="gray.700"
        color="white"
        borderRadius="md"
        px="2"
        py="1"
        fontSize="10px"
        fontWeight="700"
        display="flex"
        alignItems="center"
        gap="1"
      >
        ⏱ {duration ? formatTime(duration) : 'Calculando...'}
      </Badge>
    </Box>
  );
};
