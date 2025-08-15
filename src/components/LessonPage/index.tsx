import { ReactNode, useCallback, useState } from 'react';
import { Flex, Text, Tooltip } from '@chakra-ui/react';
import { FaTasks } from 'react-icons/fa';
import { motion } from 'framer-motion';

import { HubModuleLessonType } from '@/_base/interfaces/module';
import { QuizPage } from './Quiz';
import { ILessonPageProps } from './interfaces';
import { MdCheck, MdNavigateBefore, MdNavigateNext, MdTaskAlt } from 'react-icons/md';
import { AlgorithmPage } from './Algorithm';
import { cookieManager } from '@/_base/utils';
import { FINISHED_DAILY_CHALLENGES_STORAGE_KEY } from '@/_base/config/storage';
import { AnswerResultType, IHubChallenge } from '@/_base/interfaces/challenges';

export const LessonPage: React.FC<ILessonPageProps> = ({
  challenge,
  dailyGame,
  registerAnswer,
  answers = [],
  onPageChange,
  onFinish,
  lessonChallenges,
  currentLessonIndex,
}) => {
  if (!challenge) return;
  const challenges: IHubChallenge[] = (dailyGame ? dailyGame?.challenges : lessonChallenges) || [];

  // const [clearFields, setClearFields] = useState(false);

  // const [workspaceCode, setWorkspaceCode] = useState('');

  const [finishedAnswers, setFinishedAnswers] = useState<string[]>(
    dailyGame ? cookieManager.getCookie<string[]>(FINISHED_DAILY_CHALLENGES_STORAGE_KEY, true) || [] : [],
  );

  const onRegisterAnswer = useCallback(
    (value: AnswerResultType) => {
      registerAnswer(value);
      setFinishedAnswers(
        dailyGame
          ? cookieManager.getCookie<string[]>(FINISHED_DAILY_CHALLENGES_STORAGE_KEY, true) || []
          : (e) => [...e, value.hub_challenge_id].reduce((acc, v) => (acc.includes(v) ? acc : [...acc, v]), [] as string[]),
      );
    },
    [challenge],
  );

  // const handleGameStatusChange = useCallback(
  //   (status: GameStatus) => {
  //     const targetAnswer = answers.find((e) => e.hub_challenge_id === challenge.id);
  //     if (status === `collision`)
  //       onRegisterAnswer({ hub_challenge_id: challenge.id, is_passed: undefined, attempts: ((targetAnswer as any)?.attempts || 0) + 1 } as any);

  //     if (status === 'finish' || status === 'over') {
  //       const is_passed = status === 'finish';

  //       setWorkspaceCode('');

  //       onRegisterAnswer({ hub_challenge_id: challenge.id, is_passed, attempts: ((targetAnswer as any)?.attempts || 0) + 1 } as any);
  //     }
  //   },
  //   [workspaceCode],
  // );

  const ContentPage: Record<HubModuleLessonType, ReactNode> = {
    quiz: <QuizPage challenge={challenge} registerAnswer={onRegisterAnswer} answers={answers} />,
    algorithm: <AlgorithmPage challenge={challenge} registerAnswer={onRegisterAnswer} answers={answers} />,
    map: (
      // <MazePage
      //   fields={challenge.data.maze_field as any}
      //   onGameStatusChange={(status) => handleGameStatusChange(status)}
      //   workspaceCode={workspaceCode}
      //   onWorkspaceCodeChange={setWorkspaceCode}
      //   maxCollisions={3}
      //   clearFields={clearFields}
      //   onClearFields={setClearFields}
      //   challengeId={challenge.id}
      //   player={(challenge.data.maze_field as any)?.player}
      //   answers={answers}
      // />
      <></>
    ),
    video: <QuizPage challenge={challenge} registerAnswer={onRegisterAnswer} answers={answers} />,
  };

  const canPreviousClick = dailyGame ? !!dailyGame?.currentIndex : !!currentLessonIndex;
  const canNextClick = !(
    !finishedAnswers?.includes(challenge.id) || (dailyGame ? dailyGame.currentIndex : currentLessonIndex || 0) + 1 === challenges.length
  );

  return (
    <Flex flex="1" bg="white" direction="column" borderRadius="md" p="1rem" gap="1rem" overflow="hidden auto" h="100%">
      <Flex direction="column" gap={{ base: `1rem` }} maxH="50%" overflow="hidden">
        <Flex justify="space-between">
          <Flex bg="#25467D" w="fit-content" justify="center" borderRadius="md" p="0.25rem 0.75rem" color="white" align="center" gap="0.5rem">
            <MdTaskAlt fontSize="1.5rem" />
            <Text fontSize="20px" whiteSpace="wrap">
              {challenge.title}
            </Text>
          </Flex>

          <Flex bg="#25467D" w="fit-content" justify="center" borderRadius="md" p="0.25rem 0.75rem" color="white" align="center" gap="0.5rem">
            <FaTasks fontSize="1.5rem" />
            <Text fontSize="20px" whiteSpace="wrap">
              {dailyGame
                ? `${(dailyGame.currentIndex || 0) + 1}/${dailyGame.challenges.length}`
                : lessonChallenges?.length
                  ? `${(currentLessonIndex || 0) + 1}/${lessonChallenges.length || 1} `
                  : '1/1'}
            </Text>
          </Flex>
        </Flex>
        <Flex minH="5rem" align="center" maxW="85%" margin="auto" overflow="hidden auto">
          <Flex borderRadius="md" border="1px" borderColor="gray200" p="1rem 2rem" h="fit-content" margin="auto">
            <Text
              fontSize="16px"
              whiteSpace="wrap"
              dangerouslySetInnerHTML={{
                __html: challenge.description,
              }}
            />
          </Flex>
        </Flex>
      </Flex>
      {ContentPage[challenge.type]}
      <Flex
        justify="center"
        mt="0.875rem"
        borderRadius="md"
        p="0.25rem 0.75rem"
        color="white"
        align="center"
        gap="1rem"
        sx={{
          '.btn': {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            bg: '#25467D',
            p: '0.25rem 0.75rem',
            fontSize: `1rem`,
            fontWeight: `500`,
            borderRadius: `md`,
          },
          '.confirm-btn': {
            display: 'flex',
            bg: `success400`,
            borderRadius: `50%`,
            p: `0.25rem`,
            fontSize: `1.5rem`,
          },
        }}
      >
        <motion.button
          className="btn"
          whileHover={canPreviousClick ? { scale: 1.05 } : {}}
          whileTap={canPreviousClick ? { scale: 0.9 } : {}}
          style={{ opacity: canPreviousClick ? 1 : 0.5 }}
          onClick={() => canPreviousClick && onPageChange && onPageChange(`previous`)}
        >
          <MdNavigateBefore />
          Anterior
        </motion.button>
        {finishedAnswers?.length === challenges.length && (
          <Tooltip label="Enviar desafios" placement="top">
            <motion.button className="confirm-btn" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => onFinish()}>
              <MdCheck />
            </motion.button>
          </Tooltip>
        )}
        <motion.button
          className="btn"
          whileHover={canNextClick ? { scale: 1.05 } : {}}
          whileTap={canNextClick ? { scale: 0.9 } : {}}
          style={{ opacity: canNextClick ? 1 : 0.5 }}
          onClick={() => canNextClick && onPageChange && onPageChange(`next`)}
        >
          Próximo
          <MdNavigateNext />
        </motion.button>
      </Flex>
    </Flex>
  );
};
