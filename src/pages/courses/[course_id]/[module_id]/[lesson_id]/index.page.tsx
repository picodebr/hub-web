import { useCallback, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';

import { useCustomRouter, useCustomToast } from '@/_base/hooks';
import { IHubModuleLesson } from '@/_base/interfaces/module';
import { getCourseActivity, getModuleLesson, ILessonResult, sendModuleLesson } from '@/_base/services/course';
import { VideoLesson } from './components/video';
import { LessonPage } from '@/components/LessonPage';
import { AnswerResultType, IHubChallenge } from '@/_base/interfaces/challenges';
import { SmallModal } from '@/components/Modal/Small';
import { Flex, Image, ListItem, Text, UnorderedList } from '@chakra-ui/react';
import { IHubCourseActivity } from '@/_base/interfaces/course';
import React from 'react';
import moment from 'moment';

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

  const toast = useCustomToast();
  const router = useCustomRouter();

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const [moduleLesson, activity] = await Promise.all([getModuleLesson(courseId, moduleId, lessonId), getCourseActivity(courseId)]);
        setActivity(activity);
        setLesson(moduleLesson);
        setCurrentChallenge({ ...moduleLesson.challenges[0], index: 0 });
        setLessonIsFinished(!!activity.metadata?.find((m) => m.lessons.find((l) => l.entity_id === lessonId && !!l.finished_at)));
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
  }, [lessonIsFinished, activity, answers, sendingLesson]);

  const handleChangeChallenge = useCallback(
    (action: `next` | `previous`) => {
      if (!currentChallenge || !lesson) return;
      const newIndex = action === `next` ? Math.min(lesson.challenges.length, currentChallenge.index + 1) : Math.max(0, currentChallenge.index - 1);
      const newChallenge = lesson.challenges[newIndex];

      if (newChallenge) setCurrentChallenge({ ...newChallenge, index: newIndex });
    },
    [currentChallenge],
  );

  return (
    <>
      {lesson?.lesson_type === `quiz` ? (
        <LessonPage
          challenge={currentChallenge}
          registerAnswer={(answer) => {
            console.log('answer: ', answer);

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
      <SmallModal
        show={!!(customResult?.openSuccessModal || customResult?.openFailModal)}
        onConfirm={() => router.back()}
        size="lg"
        okText={
          <Flex color={customResult?.openFailModal ? `warning600` : `success600`} gap="0.5rem">
            <Text fontSize="16px">Continuar</Text>
            {customResult?.openSuccessModal && <Image src={`/icons/done.png`} h="20px" />}
          </Flex>
        }
        bgOkButton="transparent"
      >
        <Flex direction="column" gap="1.5rem">
          <Flex align="center" gap="1rem">
            <Flex>
              <Image src={`/icons/${customResult?.openFailModal ? 'warning' : 'checked'}.svg`} h="108px" />
            </Flex>
            <Text fontSize="24px" fontWeight="500" color={customResult?.openFailModal ? 'warning600' : 'success700'}>
              {customResult?.openFailModal ? 'Quiz não concluído' : 'Quiz concluído'}
            </Text>
          </Flex>
          <Flex
            bg={customResult?.openFailModal ? 'warning100' : 'success500'}
            borderRadius="md"
            p="1rem"
            fontSize="19px"
            color={customResult?.openFailModal ? 'warning900' : '#fff'}
            gap="0.5rem"
          >
            <Flex direction="column" gap="0.5rem" justify="center">
              <Flex gap="0.5rem" align="center">
                <Text>Questões:</Text>
                <Text fontWeight="500">{lesson?.challenges.length}</Text>
              </Flex>
              <Flex gap="0.5rem" align="center">
                <Text>Acertos:</Text>
                <Text fontWeight="500">{customResult?.lessonData?.correctAnswersCount || 0}</Text>
              </Flex>
              <Flex gap="0.5rem" align="center">
                <Text>Tempo:</Text>
                <Text fontWeight="500">
                  {moment(Date.now() - startTimestamp).minutes()
                    ? `${moment(Date.now() - startTimestamp).minutes()} ${moment(Date.now() - startTimestamp).minutes() === 1 ? `minuto` : `minutos`}`
                    : `${moment(Date.now() - startTimestamp).seconds() + 1} segundos`}
                </Text>
              </Flex>
            </Flex>
            <Flex flex="1" justify="flex-end">
              <Flex align="center" justify="center" direction="column" gap="0.5rem">
                <Text fontSize="16px">Aproveitamento</Text>
                <Flex border="2px" borderRadius="50%" w="5rem" h="5rem" align="center" justify="center">
                  {(((customResult?.lessonData?.correctAnswersCount || 0) / (lesson?.challenges?.length || 1)) * 100).toFixed()}%
                </Flex>
              </Flex>
            </Flex>
          </Flex>
          {customResult?.openSuccessModal && lesson?.metadata?.completion_coins && (
            <Flex borderRadius="md" p="1rem" direction="column" gap="1rem" border="1px" borderColor="gray300">
              <Flex gap="0.5rem">
                <Image src="/icons/medal.svg" />
                <Text fontSize="20px" fontWeight="600">
                  Conquistas
                </Text>
              </Flex>
              <UnorderedList fontSize="16px">
                {lesson?.metadata?.completion_coins && <ListItem>{`${lesson.metadata.completion_coins} moedas`}</ListItem>}
                {/* <ListItem>
                  <Flex gap="0.5rem" align="center">
                    <Text>Novo módulo desbloqueado</Text>
                    <Text fontWeight="500">(Modulo 2)</Text>
                  </Flex>
                </ListItem>
                <ListItem>
                  <Flex gap="0.5rem" align="center">
                    <Text>Novo certificado conquistado</Text>
                    <Text fontWeight="500">(PiMaker pro)</Text>
                  </Flex>
                </ListItem> */}
              </UnorderedList>
            </Flex>
          )}
        </Flex>
      </SmallModal>
    </>
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
