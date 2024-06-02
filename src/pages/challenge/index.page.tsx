import { GetServerSideProps } from 'next';
import { Flex, Text, useUpdateEffect } from '@chakra-ui/react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

import { listChallenges } from '@/_base/services/challenges';
import { IHubChallenge } from '@/_base/interfaces/challenges';
import { useAsyncCallback } from '@/_base/hooks';
import { shuffleArray } from '@/_base/utils';
import { challengeVariants } from './motionVariants';
import { DailyGameProps } from '@/_base/interfaces/challenges/DailyGameProps';
import { LessonPage } from '@/components/LessonPage';

const Challenge: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [dailyGame, setDailyGame] = useState<DailyGameProps | null>(null);
  const [currentChallenge, setCurrentChallenge] = useState<IHubChallenge | null>(null);

  const [game, setGame] = useState({
    lifes: 5,
    started: 0,
    challenges: [
      { id: 1, time: 2000 },
      { id: 2, time: 2000 },
      { id: 3, time: 2000 },
      { id: 4, time: 2000 },
      { id: 5, time: 5000 },
    ],
  });
  const [lastLife, setLastLife] = useState(0);

  const loadChallenges = useAsyncCallback(
    async () => {
      setIsLoading(true);
      const challenges = await listChallenges({ type: `algorithm`, limit: 10, grade: 9 });
      const shuffled = shuffleArray(challenges.results);

      setDailyGame({ challenges: shuffled, currentIndex: 0 });
      setCurrentChallenge(shuffled[0]);
    },
    [],
    true,
    () => setIsLoading(false),
  );

  useEffect(() => {
    loadChallenges();
  }, []);

  const registerAnswer = (response: string | string[]) => {
    if (!currentChallenge) return;
    let isCorrect = false;

    switch (currentChallenge.type) {
      case `quiz`:
        isCorrect = !!currentChallenge.data.quiz_answers?.find((e) => e.text === response && e.is_correct);
        break;

      case `algorithm`:
        isCorrect = JSON.stringify(response) === JSON.stringify(currentChallenge.data.algorithm_sequence);
        break;

      case `map`:
        break;

      case `video`:
        break;

      default:
        break;
    }

    if (isCorrect) {
      setDailyGame((e) => ({ ...(e || ({} as any)), currentIndex: (e?.currentIndex || 0) + 1 }));
      setCurrentChallenge(dailyGame?.challenges[(dailyGame?.currentIndex || 0) + 1] || null);
    } else {
      setLastLife(game.lifes);
      setGame((e) => ({ ...e, lifes: e.lifes - 1 }));
      setDailyGame((e) => ({ ...(e || ({} as any)), currentIndex: (e?.currentIndex || 0) + 1 }));
      setCurrentChallenge(dailyGame?.challenges[(dailyGame?.currentIndex || 0) + 1] || null);
    }
  };

  useUpdateEffect(() => {
    if (lastLife) {
      const timeout = setTimeout(() => {
        setLastLife(0);
      }, 150);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [lastLife]);

  return (
    <Flex direction="column" flex="1" gap="1.5rem" textAlign="left" whiteSpace="nowrap" overflow="hidden">
      <Flex>
        <Flex
          h="fit-content"
          bgColor="white"
          borderRadius="10px"
          boxShadow="md"
          align="center"
          padding="20px 24px"
          color="gray400"
          gap="16px"
          fontSize="15px"
          border="1px"
          borderColor="gray300"
        >
          <Flex gap="2rem" justify="space-between">
            <Text>Vidas restantes</Text>

            <Flex color="error600" gap="0.5rem" fontSize="24px">
              {Array.from({ length: 5 }).map((_, i) =>
                i + 1 <= game.lifes ? (
                  <motion.div id={`heart-${i + 1}`} key={i + 1}>
                    <FaHeart />
                  </motion.div>
                ) : (
                  <motion.div
                    id={`heart-${i + 1}`}
                    key={i + 1}
                    variants={challengeVariants.health}
                    animate={i + 1 === lastLife ? `animate` : `default`}
                  >
                    <FaRegHeart />
                  </motion.div>
                ),
              )}
            </Flex>
          </Flex>
        </Flex>
      </Flex>

      {!!currentChallenge && !!dailyGame && <LessonPage challenge={currentChallenge} dailyGame={dailyGame} registerAnswer={registerAnswer} />}
    </Flex>
  );
};

export default Challenge;

export const getServerSideProps: GetServerSideProps = async () => {
  const selectedPage = 'challenge';

  return { props: { selectedPage, pageTitle: 'Desafio Diário', showBackButton: false } };
};
