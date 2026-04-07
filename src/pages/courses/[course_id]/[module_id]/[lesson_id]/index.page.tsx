import React, { useCallback, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import moment from 'moment';
import { Flex, Image, ListItem, Text, UnorderedList, Box, Icon, Grid, useColorMode, Button } from '@chakra-ui/react';
import { FiClock, FiTarget, FiCheckCircle, FiXCircle } from 'react-icons/fi';

import { useCustomRouter, useCustomToast } from '@/_base/hooks';
import { IHubModuleLesson } from '@/_base/interfaces/module';
import { getCourseActivity, getModuleLesson, ILessonResult, sendModuleLesson } from '@/_base/services/course';
import { VideoLesson } from './components/video'; // Asumindo o caminho original
import { LessonPage } from '@/components/LessonPage';
import { AnswerResultType, IHubChallenge } from '@/_base/interfaces/challenges';
import { SmallModal } from '@/components/Modal/Small';
import { IHubCourseActivity } from '@/_base/interfaces/course';

interface IProps {
  courseId: string;
  moduleId: string;
  lessonId: string;
}

type CustomResult = ILessonResult & { openSuccessModal?: boolean; openFailModal?: boolean };

const Lesson: React.FC<IProps> = ({ courseId, moduleId, lessonId }) => {
  const [lesson, setLesson] = useState<IHubModuleLesson | null>(null);
  const [lessonIsFinished, setLessonIsFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [answers, setAnswers] = useState<AnswerResultType[]>([]);
  const [customResult, setCustomResult] = useState<CustomResult | null>(null);
  const [activity, setActivity] = useState<IHubCourseActivity | null>(null);
  const [sendingLesson, setSendingLesson] = useState(false);
  const [startTimestamp, setStartTimestamp] = useState(0);
  const [currentChallenge, setCurrentChallenge] = useState<(IHubChallenge & { index: number }) | null>(null);

  const { colorMode } = useColorMode();
  const toast = useCustomToast();
  const router = useCustomRouter();

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const [moduleLesson, courseActivity] = await Promise.all([getModuleLesson(courseId, moduleId, lessonId), getCourseActivity(courseId)]);
        setActivity(courseActivity);
        setLesson(moduleLesson);
        setCurrentChallenge({ ...moduleLesson.challenges[0], index: 0 });
        setLessonIsFinished(!!courseActivity.metadata?.find((m) => m.lessons.find((l) => l.entity_id === lessonId && !!l.finished_at)));
        setStartTimestamp(Date.now());
      } catch {
        toast({ status: `error`, description: `Não foi possível listar as atividades disponíveis no momento` });
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleSubmitLesson = useCallback(async () => {
    if (sendingLesson) return;
    setSendingLesson(true);
    if (lessonIsFinished && lesson?.lesson_type !== 'quiz') return;

    try {
      const r = await sendModuleLesson({ course_id: courseId, module_id: moduleId, lesson_id: lessonId, answers });
      const result = r as CustomResult;

      if (lesson?.lesson_type === `quiz`) {
        result.openSuccessModal = !!result?.is_finished;
        result.openFailModal = !result?.is_finished;
      }
      setCustomResult(result);
      setLessonIsFinished(result.is_finished);
    } catch {
      toast({ status: `error`, description: `Não foi possível salvar seu progresso` });
    } finally {
      setSendingLesson(false);
    }
  }, [lessonIsFinished, activity, answers, sendingLesson, courseId, moduleId, lessonId, lesson?.lesson_type]);

  const handleChangeChallenge = useCallback(
    (action: `next` | `previous`) => {
      if (!currentChallenge || !lesson) return;
      const newIndex = action === `next` ? Math.min(lesson.challenges.length, currentChallenge.index + 1) : Math.max(0, currentChallenge.index - 1);
      const newChallenge = lesson.challenges[newIndex];
      if (newChallenge) setCurrentChallenge({ ...newChallenge, index: newIndex });
    },
    [currentChallenge, lesson],
  );

  const getDurationString = () => {
    const diff = Date.now() - startTimestamp;
    const minutes = moment(diff).minutes();
    if (minutes > 0) return `${minutes} min`;
    return `${moment(diff).seconds()} seg`;
  };

  const scorePercentage = (((customResult?.lessonData?.correctAnswersCount || 0) / (lesson?.challenges?.length || 1)) * 100).toFixed();

  return (
    <>
      {lesson?.lesson_type === `quiz` ? (
        <LessonPage
          challenge={currentChallenge}
          registerAnswer={(answer) => {
            setAnswers((s) =>
              s.find((e) => e.hub_challenge_id === answer.hub_challenge_id)
                ? s.map((v) => (v.hub_challenge_id === answer.hub_challenge_id ? answer : v))
                : [...s, answer],
            );
          }}
          answers={answers}
          onFinish={handleSubmitLesson}
          lessonChallenges={lesson.challenges}
          onPageChange={handleChangeChallenge}
          currentLessonIndex={currentChallenge?.index}
        />
      ) : (
        <VideoLesson lesson={lesson} isLoading={isLoading} handleSubmitLesson={handleSubmitLesson} lessonIsFinished={lessonIsFinished} />
      )}

      {/* Modal de Resultado Premium */}
      <SmallModal
        show={!!(customResult?.openSuccessModal || customResult?.openFailModal)}
        onConfirm={() => router.back()}
        size="lg"
        bgOkButton={customResult?.openFailModal ? 'orange.500' : 'green.500'}
        okText={customResult?.openFailModal ? 'Tentar Novamente' : 'Continuar Jornada'}
      >
        <Flex direction="column" gap="1.5rem" align="center" textAlign="center" pt="1rem">
          {/* Header do Modal */}
          <Flex direction="column" align="center" gap="1rem">
            <Icon
              as={customResult?.openFailModal ? FiXCircle : FiCheckCircle}
              fontSize="5rem"
              color={customResult?.openFailModal ? 'orange.500' : 'green.500'}
            />
            <Text fontSize="24px" fontWeight="800" color={colorMode === 'dark' ? 'white' : 'gray.800'}>
              {customResult?.openFailModal ? 'Quase lá!' : 'Quiz Concluído!'}
            </Text>
            <Text fontSize="15px" color="gray.500" mt="-0.5rem">
              {customResult?.openFailModal
                ? 'Revise os conteúdos e tente novamente para avançar.'
                : 'Excelente trabalho! Você demonstrou que domina o assunto.'}
            </Text>
          </Flex>

          {/* Grid de Estatísticas */}
          <Grid
            templateColumns="repeat(3, 1fr)"
            gap="1rem"
            w="100%"
            bg={colorMode === 'light' ? 'gray.50' : 'whiteAlpha.50'}
            p="1.25rem"
            borderRadius="xl"
            border="1px solid"
            borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}
          >
            <Flex direction="column" align="center" gap="0.5rem">
              <Icon as={FiTarget} color="blue.500" fontSize="1.5rem" />
              <Text fontSize="12px" color="gray.500" fontWeight="600" textTransform="uppercase">
                Acertos
              </Text>
              <Text fontSize="20px" fontWeight="800" color={colorMode === 'dark' ? 'white' : 'gray.800'}>
                {customResult?.lessonData?.correctAnswersCount || 0}/{lesson?.challenges.length}
              </Text>
            </Flex>
            <Flex direction="column" align="center" gap="0.5rem" borderX="1px solid" borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}>
              <Icon as={FiClock} color="purple.500" fontSize="1.5rem" />
              <Text fontSize="12px" color="gray.500" fontWeight="600" textTransform="uppercase">
                Tempo
              </Text>
              <Text fontSize="20px" fontWeight="800" color={colorMode === 'dark' ? 'white' : 'gray.800'}>
                {getDurationString()}
              </Text>
            </Flex>
            <Flex direction="column" align="center" gap="0.5rem">
              <Box color={customResult?.openFailModal ? 'orange.500' : 'green.500'}>
                <FiCheckCircle fontSize="1.5rem" />
              </Box>
              <Text fontSize="12px" color="gray.500" fontWeight="600" textTransform="uppercase">
                Nota
              </Text>
              <Text fontSize="20px" fontWeight="800" color={customResult?.openFailModal ? 'orange.500' : 'green.500'}>
                {scorePercentage}%
              </Text>
            </Flex>
          </Grid>

          {/* Conquistas (Apenas no Sucesso) */}
          {customResult?.openSuccessModal && lesson?.metadata?.completion_coins && (
            <Flex
              w="100%"
              align="center"
              justify="space-between"
              bg="warning.50"
              border="1px solid"
              borderColor="warning.200"
              borderRadius="xl"
              p="1rem"
            >
              <Flex align="center" gap="0.75rem">
                <Image src="/icons/coin.svg" w="24px" h="24px" />
                <Text fontSize="15px" fontWeight="600" color="warning.800">
                  Moedas conquistadas
                </Text>
              </Flex>
              <Text fontSize="18px" fontWeight="800" color="warning.700">
                +{lesson.metadata.completion_coins}
              </Text>
            </Flex>
          )}
        </Flex>
      </SmallModal>
    </>
  );
};

export default Lesson;

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  return {
    props: {
      selectedPage: 'courses',
      courseId: `${query.course_id}`,
      moduleId: `${query.module_id}`,
      lessonId: `${query.lesson_id}`,
      pageTitle: `${query._p || 'Atividade'}`,
    },
  };
};
