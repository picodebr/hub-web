import { GetServerSideProps } from 'next';
import { Button, Flex } from '@chakra-ui/react';
import { ReactNode, useEffect, useState } from 'react';
import { animate, AnimatePresence, motion, useMotionValue, useTransform } from 'framer-motion';

import { GenericButton } from '@/components/Buttons/Generic';
import { LuRocket } from 'react-icons/lu';

type PageView = `start` | `countdown` | `challenges`;

const Challenge: React.FC = () => {
  const [pageView, setPageView] = useState<PageView>(`start`);
  const [challengeStartedAt, setChallengeStartedAt] = useState<Date | null>(null);

  useEffect(() => {
    if (pageView !== `countdown`) return;

    const tm = setTimeout(() => setPageView(`challenges`), 11500);
    return () => clearTimeout(tm);
  }, [pageView]);

  const PageViewComponent: Record<PageView, ReactNode> = {
    start: (
      <motion.div style={{ height: `100%`, width: `100%` }}>
        <Flex w="100%" bgImage="/patterns/cloudy.svg" h="100%" justify="center" align="center">
          <GenericButton
            label="Iniciar Desafio"
            rightIcon={<LuRocket />}
            onClick={() => {
              setChallengeStartedAt(new Date());
              setPageView(`countdown`);
            }}
          />
        </Flex>
      </motion.div>
    ),
    countdown: (
      <motion.div
        key="COUNTDOWN"
        initial={{ y: 0, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -10, opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{ height: `100%`, width: `100%` }}
      >
        <Countdown key={challengeStartedAt?.getTime() || `empty`} />
      </motion.div>
    ),
    challenges: (
      <motion.div
        key="CHALLENGES"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -10, opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{ height: `100%`, width: `100%` }}
      >
        <Flex bgImage="/patterns/sprinkle.svg" h="100%" borderRadius="md"></Flex>
      </motion.div>
    ),
  };

  return <AnimatePresence mode="wait">{PageViewComponent[pageView]}</AnimatePresence>;
};

export default Challenge;

export const getServerSideProps: GetServerSideProps = async () => {
  const selectedPage = 'challenge';

  return { props: { selectedPage, pageTitle: 'Desafio Diário', showBackButton: false } };
};

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
