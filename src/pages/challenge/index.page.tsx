import { GetServerSideProps } from 'next';
import { Flex, Text, useUpdateEffect } from '@chakra-ui/react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { ReactNode, useEffect, useState } from 'react';
import { animate, AnimatePresence, motion, useMotionValue, useTransform } from 'framer-motion';

import { getDailyChallenges } from '@/_base/services/challenges';
import { AnswerResultType, IDailyChallenge, IHubChallenge } from '@/_base/interfaces/challenges';
import { useAsyncCallback, useAuth } from '@/_base/hooks';
import { challengeVariants } from './motionVariants';
import { DailyGameProps } from '@/_base/interfaces/challenges/DailyGameProps';
import { LessonPage } from '@/components/LessonPage';
import { GenericButton } from '@/components/Buttons/Generic';
import { LuRocket } from 'react-icons/lu';
import { cookieManager, formatShortName, logError } from '@/_base/utils';
import moment from 'moment';
import { validateSession } from '@/_base/services/auth';
import { FINISHED_DAILY_CHALLENGES_STORAGE_KEY, DAILY_CHALLENGES_STORAGE_KEY } from '@/_base/config/storage';

type PageView = `start` | `countdown` | `challenges` | `sending` | `finished`;

const Challenge: React.FC = () => {
  const [pageView, setPageView] = useState<PageView>(`start`);
  const [counterAnimation, setCounterAnimation] = useState(0);
  const [dailyGame, setDailyGame] = useState<DailyGameProps | null>(null);
  const [currentChallenge, setCurrentChallenge] = useState<IHubChallenge | null>(null);
  const [answers, setAnswers] = useState<AnswerResultType[]>(cookieManager.getCookie<AnswerResultType[]>(DAILY_CHALLENGES_STORAGE_KEY, true) || []);

  const { user } = useAuth();
  const [lastLife, setLastLife] = useState(0);

  const loadChallenges = useAsyncCallback(
    async () => {
      const dailyChallenges = await getDailyChallenges();
      cookieManager.setCookie(DAILY_CHALLENGES_STORAGE_KEY, `[]`);
      cookieManager.setCookie(FINISHED_DAILY_CHALLENGES_STORAGE_KEY, `[]`);

      const game = formatDailyGame(dailyChallenges);
      setDailyGame(game);
      setCurrentChallenge(game.challenges[game.currentIndex]);
    },
    [],
    true,
    () => {
      setCounterAnimation(Date.now());
      setPageView(`countdown`);
    },
  );

  useEffect(() => {
    const challengeInProgress = user.metadata.daily_challenges;

    const savedDataIsValid = challengeInProgress?.challenges?.length && challengeInProgress.expires_at > Date.now();
    if (savedDataIsValid) {
      const game = formatDailyGame(challengeInProgress);
      setDailyGame(game);
      if (!game.finished_at) {
        setCurrentChallenge(game.challenges[game.currentIndex]);
        setPageView(`challenges`);
      }
    }
  }, [user]);

  useEffect(() => {
    let tm: NodeJS.Timeout;

    switch (pageView) {
      case `countdown`:
        tm = setTimeout(() => setPageView(`challenges`), 11500);
        break;

      case `sending`:
        tm = setTimeout(() => setPageView(`finished`), 6000);
        break;

      default:
        break;
    }

    return () => {
      if (tm) clearTimeout(tm);
    };
  }, [pageView]);

  const registerAnswer = (response: AnswerResultType) => {
    if (!currentChallenge) return;
    const finishedChallenges = cookieManager.getCookie<string[]>(FINISHED_DAILY_CHALLENGES_STORAGE_KEY, true) || [];

    switch (currentChallenge.type) {
      case `quiz`:
        if (!finishedChallenges?.includes(currentChallenge.id))
          cookieManager.setCookie(FINISHED_DAILY_CHALLENGES_STORAGE_KEY, JSON.stringify([...finishedChallenges, currentChallenge.id]));
        break;

      case `algorithm`:
        if (
          (response as any).sequence?.length === currentChallenge.data.algorithm_sequence?.length &&
          !finishedChallenges?.includes(currentChallenge.id)
        )
          cookieManager.setCookie(FINISHED_DAILY_CHALLENGES_STORAGE_KEY, JSON.stringify([...finishedChallenges, currentChallenge.id]));
        break;

      case `map`:
        if ((response as any).is_passed !== undefined && !finishedChallenges?.includes(currentChallenge.id))
          cookieManager.setCookie(FINISHED_DAILY_CHALLENGES_STORAGE_KEY, JSON.stringify([...finishedChallenges, currentChallenge.id]));
        break;

      case `video`:
        if (!finishedChallenges?.includes(currentChallenge.id))
          cookieManager.setCookie(FINISHED_DAILY_CHALLENGES_STORAGE_KEY, JSON.stringify([...finishedChallenges, currentChallenge.id]));
        break;

      default:
        break;
    }

    setAnswers((_answers) => {
      const targetAnswer = _answers.find((x) => x.hub_challenge_id === response.hub_challenge_id);

      let updatedAnswers = _answers;
      if (targetAnswer) updatedAnswers = updatedAnswers.map((x) => (x.hub_challenge_id === response.hub_challenge_id ? response : x));
      else updatedAnswers.push(response);

      cookieManager.setCookie(DAILY_CHALLENGES_STORAGE_KEY, JSON.stringify(updatedAnswers));
      return updatedAnswers;
    });
  };

  const onPageChange = (action: `next` | `previous`) => {
    if (!dailyGame) return;
    const newIndex =
      action === `next` ? Math.min(dailyGame.currentIndex + 1, dailyGame.challenges.length - 1) : Math.max(dailyGame.currentIndex - 1, 0);
    setCurrentChallenge(dailyGame.challenges[newIndex]);
    setDailyGame((e) => ({ ...(e as any), currentIndex: newIndex }));
  };

  const onFinish = () => {
    setPageView(`sending`);
    // const isCorrect = false;
    // if (isCorrect) {
    //   setDailyGame((e) => ({ ...(e || ({} as any)), currentIndex: (e?.currentIndex || 0) + 1 }));
    //   setCurrentChallenge(dailyGame?.challenges[(dailyGame?.currentIndex || 0) + 1] || null);
    // } else {
    //   setLastLife(dailyGame?.remainingLifes || 0);
    //   setDailyGame((e) => ({ ...(e || ({} as any)), currentIndex: (e?.currentIndex || 0) + 1, remainingLifes: (e?.remainingLifes || 1) - 1 }));
    //   setCurrentChallenge(dailyGame?.challenges[(dailyGame?.currentIndex || 0) + 1] || null);
    // }
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

  const PageViewComponent: Record<PageView, ReactNode> = {
    start: (
      <motion.div
        key="START"
        initial={{ y: 0, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 0, opacity: 1 }}
        transition={{ duration: 0 }}
        style={{ height: `100%`, width: `100%` }}
      >
        {dailyGame?.finished_at ? (
          <Flex w="100%" bgImage="/patterns/cloudy.svg" h="100%" pt="5rem" align="center" borderRadius="lg" direction="column" gap="5rem">
            <Flex direction="column" color="#fff" fontSize="16px" gap="2rem" textAlign="center" align="center">
              <Text fontSize="20px" fontWeight="500">
                {`Novos desafios ${moment(dailyGame?.expires_at).fromNow()}`}
              </Text>
              <Text maxW={{ base: `100%`, lg: `70%` }}>
                Parabéns por realizar os desafios diários, continue assim para obter o máximo de moedas possível.
              </Text>
            </Flex>
          </Flex>
        ) : (
          <Flex w="100%" bgImage="/patterns/cloudy.svg" h="100%" pt="5rem" align="center" borderRadius="lg" direction="column" gap="5rem">
            <Flex direction="column" color="#fff" fontSize="16px" gap="2rem" textAlign="center" align="center">
              <Text fontSize="20px" fontWeight="500">
                Novos desafios disponíveis!
              </Text>
              <Text maxW={{ base: `100%`, lg: `70%` }}>
                Hey {formatShortName(user.name, true) || `aluno`}, os desafios não ficam disponíveis por muito tempo. Portanto, estabeleça um horário
                do seu dia para realizar os desafios diários e ganhe bônus pela sua consistência!
              </Text>
            </Flex>
            <GenericButton btntype="outline-white" label="Iniciar Desafio" rightIcon={<LuRocket />} onClick={() => loadChallenges()} />
          </Flex>
        )}
      </motion.div>
    ),
    countdown: (
      <motion.div
        key="COUNTDOWN"
        initial={{ y: 0, opacity: 1 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -10, opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{ height: `100%`, width: `100%` }}
      >
        <Countdown key={counterAnimation || `empty`} />
      </motion.div>
    ),
    challenges: (
      <motion.div
        key="CHALLENGES"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -10, opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{ height: `100%`, width: `100%`, display: `flex` }}
      >
        <Flex direction="column" flex="1" gap="1.5rem" textAlign="left" whiteSpace="nowrap" overflow="hidden">
          <Flex justify="space-between">
            <Flex
              h="fit-content"
              bgColor="white"
              borderRadius="10px"
              boxShadow="md"
              align="center"
              padding="16px 20px"
              color="gray400"
              gap="16px"
              fontSize="15px"
              border="1px"
              borderColor="gray300"
            >
              <Flex gap="2rem" justify="space-between">
                <Text>Tentativas restantes</Text>

                <Flex color="error600" gap="0.5rem" fontSize="24px">
                  {Array.from({ length: 3 }).map((_, i) =>
                    i + 1 <= (dailyGame?.remainingLifes || 0) ? (
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
            <Flex
              h="fit-content"
              bgColor="white"
              borderRadius="10px"
              boxShadow="md"
              align="center"
              padding="16px 20px"
              color="gray400"
              gap="16px"
              fontSize="15px"
              border="1px"
              borderColor="gray300"
            >
              <Flex gap="2rem" justify="space-between">
                <Text>Os desafios expiram {moment(dailyGame?.expires_at).fromNow()}</Text>
              </Flex>
            </Flex>
          </Flex>

          {!!currentChallenge && !!dailyGame && (
            <LessonPage
              challenge={currentChallenge}
              dailyGame={dailyGame}
              registerAnswer={registerAnswer}
              answers={answers}
              onPageChange={onPageChange}
              onFinish={onFinish}
            />
          )}
        </Flex>
      </motion.div>
    ),
    sending: (
      <motion.div
        key="SENDING"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -10, opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{ height: `100%`, width: `100%` }}
      >
        <Flex
          direction="column"
          userSelect="none"
          h="100%"
          w="100%"
          sx={{
            '.wrapper': {
              w: `20rem`,
              aspectRatio: 1,
              margin: `auto`,
              bgImage: `/loading/rocket-picode.gif`,
              bgPosition: `bottom`,
              bgSize: `contain`,
              bgRepeat: `no-repeat`,
            },
          }}
        >
          <motion.div
            className="wrapper"
            animate={{
              scale: [0, 2, 4, 3, 1],
              rotate: [0, -95, 270, 270, 0],
              transition: { duration: 1.75, ease: `backInOut` },
            }}
          />
        </Flex>
      </motion.div>
    ),
    finished: (
      <motion.div
        key="FINISHED"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -10, opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{ height: `100%`, width: `100%` }}
      >
        <Flex h="100%" w="100%" bg="white">
          Tela de resultado
        </Flex>
      </motion.div>
    ),
  };

  return <AnimatePresence mode="wait">{PageViewComponent[pageView]}</AnimatePresence>;
};

export default Challenge;

function Countdown() {
  const count = useMotionValue(59);
  const rounded = useTransform(count, Math.round);

  const [num, setNum] = useState(count.get());

  useEffect(() => {
    const animation = animate(count, 0, { duration: 10, ease: [`circInOut`], delay: 1.5, onUpdate: (e) => setNum(Math.round(e)) });

    return animation.stop;
  }, []);

  return (
    <Flex
      direction="column"
      fontSize="2.3rem"
      userSelect="none"
      bgImage="/patterns/cloudy.svg"
      h="100%"
      w="100%"
      sx={{
        '.wrapper': {
          w: `20rem`,
          aspectRatio: 1,
          margin: `auto`,
          bgImage: `/loading/rocket-picode.gif`,
          bgPosition: `bottom`,
          bgSize: `contain`,
          bgRepeat: `no-repeat`,
        },
      }}
    >
      <Flex margin="auto" direction="column" gap="0.5rem" align="center" fontFamily="LXGW WenKai Mono TC" color="#fff">
        <motion.p
          animate={{
            opacity: [0, 0, 0, 0, 0, 0, 1],
            transition: { duration: 2.5 },
          }}
        >
          Contagem regressiva
        </motion.p>
        <Flex fontFamily="LXGW WenKai Mono TC" fontWeight="600">
          <motion.h1
            animate={{
              opacity: [0, 0, 0, 0, 0, 0, 1],
              transition: { duration: 2.5 },
            }}
          >
            {num < 10 ? `00:0` : `00:`}
          </motion.h1>
          <motion.h1
            animate={{
              opacity: [0, 0, 0, 0, 0, 0, 1],
              transition: { duration: 2.5 },
            }}
          >
            {rounded}
          </motion.h1>
        </Flex>
      </Flex>
      <motion.div
        className="wrapper"
        animate={{
          scale: [0, 2, 4, 3, 1],
          rotate: [0, -95, 270, 270, 0],
          transition: { duration: 1.75, ease: `backInOut` },
        }}
      />
    </Flex>
  );
}

const formatDailyGame = (daily: IDailyChallenge): DailyGameProps => {
  const totalLifes = 5;
  const answersToDailyChallenges =
    daily.answers[daily.started_at]?.filter((answer) => !!daily.challenges.find((challenge) => challenge.id === answer.id)) || [];
  const answersCount = answersToDailyChallenges.length ? answersToDailyChallenges.length / totalLifes : 0;
  const remainingLifes = totalLifes - answersCount;

  const storageData = cookieManager.getCookie<AnswerResultType[]>(DAILY_CHALLENGES_STORAGE_KEY, true);
  const currentIndex = storageData ? (storageData.length || 1) - 1 : 0;

  return { ...daily, currentIndex, remainingLifes };
};

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const selectedPage = 'challenge';
  try {
    cookieManager.updateToken(req);

    await validateSession();
    return { props: { selectedPage, pageTitle: 'Desafio Diário', showBackButton: false } };
  } catch (err: any) {
    cookieManager.forceTokenExpires(res);
    logError(selectedPage, err);

    return { redirect: { destination: '/login', permanent: false } };
  }
};
