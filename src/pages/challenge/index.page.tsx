import { GetServerSideProps } from 'next';
import { Flex, Img, Text, Tooltip } from '@chakra-ui/react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { animate, AnimatePresence, motion, useMotionValue, useTransform } from 'framer-motion';
import { Step, StepIndicator, StepNumber, StepStatus, Stepper } from '@chakra-ui/react';

import { getDailyChallenges, getDailyConfig } from '@/_base/services/challenges';
import { AnswerResultType, IDailyChallenge, IHubChallenge } from '@/_base/interfaces/challenges';
import { useAsyncCallback, useAuth } from '@/_base/hooks';
import { DailyGameProps } from '@/_base/interfaces/challenges/DailyGameProps';
import { LessonPage } from '@/components/LessonPage';
import { GenericButton } from '@/components/Buttons/Generic';
import { LuRocket } from 'react-icons/lu';
import { cookieManager, formatShortName, logError } from '@/_base/utils';
import moment from 'moment';
import { validateSession } from '@/_base/services/auth';
import { FINISHED_DAILY_CHALLENGES_STORAGE_KEY, DAILY_CHALLENGES_STORAGE_KEY } from '@/_base/config/storage';
import { GoDot, GoDotFill } from 'react-icons/go';

const EXPIRES_AT = new Date().setHours(23, 59, 59);

type PageView = `start` | `countdown` | `challenges` | `sending` | `retry` | `finished`;

const Challenge: React.FC = () => {
  const [pageView, setPageView] = useState<PageView>(`start`);
  const [counterAnimation, setCounterAnimation] = useState(0);
  const [dailyGame, setDailyGame] = useState<DailyGameProps | null>(null);
  const [currentChallenge, setCurrentChallenge] = useState<IHubChallenge | null>(null);
  const [answers, setAnswers] = useState<AnswerResultType[]>(cookieManager.getCookie<AnswerResultType[]>(DAILY_CHALLENGES_STORAGE_KEY, true) || []);

  const { user } = useAuth();

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
  const loadConfig = useAsyncCallback(
    async () => {
      const config = await getDailyConfig();

      const allAnswers = Object.values(user.metadata?.daily_challenges?.answers || {}).flatMap((e) => e);
      const correctAnswers = allAnswers.filter((e) => e.passed);

      setDailyGame((e) => ({
        ...(e || ({} as any)),
        config,
        averageResponse: Math.min(((correctAnswers.length || 0) / (allAnswers.length || 1)) * 100, 100),
      }));
    },
    [],
    false,
  );

  useEffect(() => {
    loadConfig();
    setPageView(`retry`);
    const challengeInProgress = user.metadata.daily_challenges;

    const savedDataIsValid = challengeInProgress?.challenges?.length && challengeInProgress.expires_at > Date.now();
    if (savedDataIsValid) {
      const game = formatDailyGame(challengeInProgress);
      setDailyGame(game);
      if (!game.finished_at) {
        setCurrentChallenge(game.challenges[game.currentIndex]);
        // setPageView(`challenges`);
      }
    }
  }, [user]);

  useEffect(() => {
    let tm: NodeJS.Timeout;

    switch (pageView) {
      case `countdown`:
        tm = setTimeout(() => setPageView(`challenges`), 3500);
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

  const registerAnswer = useCallback(
    (response: AnswerResultType) => {
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
    },
    [currentChallenge],
  );

  const onPageChange = (action: `next` | `previous`) => {
    if (!dailyGame) return;
    const newIndex =
      action === `next` ? Math.min(dailyGame.currentIndex + 1, dailyGame.challenges.length - 1) : Math.max(dailyGame.currentIndex - 1, 0);
    setCurrentChallenge(dailyGame.challenges[newIndex]);
    setDailyGame((e) => ({ ...(e as any), currentIndex: newIndex }));
  };

  const onFinish = () => {
    setPageView(`sending`);
  };

  const steps = Array.from({ length: 50 }).map((_, i) => ({
    bonus: dailyGame?.config?.daily_challenges?.consistency_bonus[i + 1]?.coins,
  }));

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
                {`Novos desafios ${moment(EXPIRES_AT).fromNow()}`}
              </Text>
              <Text maxW={{ base: `100%`, lg: `70%` }}>
                Parabéns por realizar os desafios diários, continue assim para obter o máximo de moedas possível.
              </Text>
            </Flex>
          </Flex>
        ) : (
          <Flex w="100%" bgImage="/patterns/cloudy.svg" h="100%" pt="5rem" align="center" borderRadius="lg" direction="column" gap="5rem">
            <Flex direction="column" color="#fff" fontSize="16px" gap="2rem" textAlign="center" align="center">
              <Img src="https://i.imgur.com/bnpvSJs.png" w="160px" h="140px" />
              <Text fontSize="27px" fontWeight="500">
                Novos desafios disponíveis!
              </Text>

              <Flex gap="10px">
                <Flex
                  w="170px"
                  h="170px"
                  bgColor="#fff"
                  color="#000"
                  borderRadius="8px"
                  boxShadow="md"
                  direction="column"
                  p="8px"
                  justify="space-between"
                  align="center"
                >
                  <Flex fontSize="15px" fontWeight="500" lineHeight="16px">
                    Você está em uma consistência de
                  </Flex>
                  <Flex justify="center" align="center" fontSize="25px" fontWeight="700">
                    <Img src="https://i.imgur.com/BkeE5tT.png" w="45px" h="40px" mb="1" ml="-2" />{' '}
                    {user.metadata.daily_challenges?.consecutive_days || 0}
                  </Flex>
                  <Flex justify="center" fontSize="16px" fontWeight="500">
                    dias
                  </Flex>
                </Flex>

                <Flex
                  w="170px"
                  h="170px"
                  bgColor="#fff"
                  color="#000"
                  borderRadius="8px"
                  boxShadow="md"
                  direction="column"
                  p="8px"
                  justify="space-between"
                  align="center"
                >
                  <Flex fontSize="15px" fontWeight="500" lineHeight="16px">
                    {`O desafio expira ${moment(EXPIRES_AT).fromNow()}`}
                  </Flex>
                  <Img src="https://i.imgur.com/IwH4B07.png" w="40px" h="40px" />
                  <Flex justify="center" fontSize="16px" fontWeight="500">
                    Faça já!
                  </Flex>
                </Flex>

                <Flex
                  w="170px"
                  h="170px"
                  bgColor="#fff"
                  color="#000"
                  borderRadius="8px"
                  boxShadow="md"
                  direction="column"
                  p="8px"
                  justify="space-between"
                  align="center"
                >
                  <Flex fontSize="15px" fontWeight="500" lineHeight="16px">
                    Seu aproveitamento atual é de
                  </Flex>
                  <Flex justify="center" align="center" fontSize="25px" fontWeight="700">
                    <Img src="/icons/medal.svg" w="40px" h="40px" /> {dailyGame?.averageResponse || 0}%
                  </Flex>
                  <Flex justify="center" fontSize="16px" fontWeight="500">
                    {`de ${Object.values(dailyGame?.answers || {}).flatMap((e) => e).length} respostas`}
                  </Flex>
                </Flex>
              </Flex>

              <Flex maxW={{ base: `100%`, lg: `70%` }} direction="column">
                <Text color="primary300" fontWeight="700">
                  {formatShortName(user.name, true) || `aluno`},
                </Text>
                Resgate moedas fazendo os desafios diários <br /> Estabeleça um horário do seu dia para realizar os desafios diários e ganhe bônus
                pela sua consistência!
              </Flex>
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
                <Text>{`${(dailyGame?.daily_lifes || 0) + 1}${
                  (dailyGame?.daily_lifes || 0) + 1 === 1 ? ' tentativa restante' : ' tentativas restantes'
                }`}</Text>
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
    retry: (
      <motion.div
        key="RETRY"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -10, opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{ height: `100%`, width: `100%` }}
      >
        <Flex
          h="100%"
          w="100%"
          bg="white"
          p="20px"
          boxShadow="md"
          borderRadius="10px"
          border="1px"
          borderColor="gray300"
          direction="column"
          align="center"
          gap="8px"
          overflow="hidden"
        >
          <Img src="https://i.imgur.com/YpcVqrl.gif" w="300px" />
          <Flex w="100%" fontSize="30px" fontWeight="700" justify="center">
            Vamos tentar de novo?
          </Flex>
          <Flex w="100%" fontSize="20px" fontWeight="500" justify="center">
            Você não acertou todas as questões, mas não se preocupe! Você pode tentar de novo!
          </Flex>
          <Flex overflow="auto" userSelect="none" cursor="auto">
            <Stepper size="sm" colorScheme="yellow" index={dailyGame?.consecutive_days || 1} gap="0.5" overflow="auto !important" w="100%">
              {steps.map((step, index) => (
                <Tooltip key={index} label={step.bonus ? `Bônus de ${step.bonus} moedas` : undefined} placement="top">
                  <Step key={index} style={{ position: `relative` }}>
                    {step.bonus || !index ? (
                      <StepIndicator>
                        <StepStatus complete={<StepNumber />} incomplete={<StepNumber />} active={<StepNumber />} />
                      </StepIndicator>
                    ) : (dailyGame?.consecutive_days || 0) >= index + 1 ? (
                      <GoDotFill color="#FDB022" fontSize={(dailyGame?.consecutive_days || 0) === index + 1 ? `22px` : undefined} />
                    ) : (
                      <GoDot />
                    )}
                  </Step>
                </Tooltip>
              ))}
            </Stepper>
          </Flex>
          <Flex w="100%" justify="center" p="60px" gap="10px">
            <Flex
              w="150px"
              h="150px"
              bgColor="gray100"
              borderRadius="8px"
              p="8px"
              align="center"
              justify="space-between"
              direction="column"
              boxShadow="md"
            >
              <Text align="center">Você acertou</Text>
              <Flex w="100%" fontSize="25px" fontWeight="700" align="center" justify="center">
                <Img src="https://images.emojiterra.com/google/android-12l/512px/1f3af.png" w="35px" h="35px" /> 4
              </Flex>
              <Text>de 5 questões</Text>
            </Flex>
            <Flex
              w="150px"
              h="150px"
              bgColor="gray100"
              borderRadius="8px"
              p="8px"
              align="center"
              justify="space-between"
              direction="column"
              boxShadow="md"
            >
              <Text align="center">Você ainda possui</Text>
              <Flex w="100%" fontSize="25px" fontWeight="700" align="center" justify="center">
                <FaHeart color="red" /> 2
              </Flex>
              <Text>vida(s)</Text>
            </Flex>
          </Flex>
          <Flex w="100%" align="center" justify="center">
            <GenericButton
              w="300px"
              h="60px"
              label="Tentar novamente"
              borderRadius="8px"
              bgColor="primary300"
              color="white"
              fontWeight="700"
              boxShadow="md"
            />
          </Flex>
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
        <Flex
          h="100%"
          w="100%"
          bg="white"
          p="20px"
          boxShadow="md"
          borderRadius="10px"
          border="1px"
          borderColor="gray300"
          direction="column"
          align="center"
          gap="8px"
          overflow="hidden"
        >
          <Img src="https://media.tenor.com/7a1t4VJSC2kAAAAj/snoopy.gif" w="300px" />
          <Flex w="100%" fontSize="30px" fontWeight="700" justify="center">
            Parabéns por completar os desafios
          </Flex>
          <Flex overflow="auto" userSelect="none" cursor="auto">
            <Stepper size="sm" colorScheme="yellow" index={dailyGame?.consecutive_days || 1} gap="0.5" overflow="auto !important" w="100%">
              {steps.map((step, index) => (
                <Tooltip key={index} label={step.bonus ? `Bônus de ${step.bonus} moedas` : undefined} placement="top">
                  <Step key={index} style={{ position: `relative` }}>
                    {step.bonus || !index ? (
                      <StepIndicator>
                        <StepStatus complete={<StepNumber />} incomplete={<StepNumber />} active={<StepNumber />} />
                      </StepIndicator>
                    ) : (dailyGame?.consecutive_days || 0) >= index + 1 ? (
                      <GoDotFill color="#FDB022" fontSize={(dailyGame?.consecutive_days || 0) === index + 1 ? `22px` : undefined} />
                    ) : (
                      <GoDot />
                    )}
                  </Step>
                </Tooltip>
              ))}
            </Stepper>
          </Flex>
          <Flex w="100%" justify="center" p="60px" gap="10px">
            <Flex
              w="150px"
              h="150px"
              bgColor="gray100"
              borderRadius="8px"
              p="8px"
              align="center"
              justify="space-between"
              direction="column"
              boxShadow="md"
            >
              <Text align="center">Consistência de</Text>
              <Flex w="100%" fontSize="25px" fontWeight="700" align="center" justify="center">
                <Img src="https://i.imgur.com/BkeE5tT.png" w="45px" h="40px" /> 1
              </Flex>
              <Text>dias</Text>
            </Flex>
            <Flex
              w="150px"
              h="150px"
              bgColor="gray100"
              borderRadius="8px"
              p="8px"
              align="center"
              justify="space-between"
              direction="column"
              boxShadow="md"
            >
              <Text align="center">Você acertou</Text>
              <Flex w="100%" fontSize="25px" fontWeight="700" align="center" justify="center">
                <Img src="https://images.emojiterra.com/google/android-12l/512px/1f3af.png" w="35px" h="35px" /> 4
              </Flex>
              <Text>de 5 questões</Text>
            </Flex>
            <Flex
              w="150px"
              h="150px"
              bgColor="gray100"
              borderRadius="8px"
              p="8px"
              align="center"
              justify="space-between"
              direction="column"
              boxShadow="md"
            >
              <Text align="center">Você conquistou</Text>
              <Flex w="100%" fontSize="25px" fontWeight="700" align="center" justify="center">
                <Img src="/icons/coin.svg" w="35px" h="35px" /> 3
              </Flex>
              <Text>moedas</Text>
            </Flex>
          </Flex>
          <Flex w="100%" align="center" justify="center">
            <Flex
              w="300px"
              h="60px"
              borderRadius="8px"
              bgColor="primary300"
              color="white"
              fontWeight="700"
              boxShadow="md"
              align="center"
              justify="center"
              cursor="pointer"
              _hover={{ boxShadow: `lg`, color: 'gray700' }}
            >
              Continuar
            </Flex>
          </Flex>
        </Flex>
      </motion.div>
    ),
  };

  return <AnimatePresence mode="wait">{PageViewComponent[pageView]}</AnimatePresence>;
};

export default Challenge;

function Countdown() {
  const count = useMotionValue(59);

  useEffect(() => {
    const animation = animate(count, 0, { duration: 10, ease: [`circInOut`], delay: 1.5 });

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
