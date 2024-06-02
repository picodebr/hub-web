import { LuRocket } from 'react-icons/lu';
import { GetServerSideProps } from 'next';
import { Button, Flex, Text, transition, useUpdateEffect } from '@chakra-ui/react';
import { FaHeart, FaRegClock, FaRegHeart } from 'react-icons/fa';
import { useEffect, useMemo, useState } from 'react';
import { motion, useAnimate, useMotionValue } from 'framer-motion';

import { cookieManager } from '@/_base/utils';
import moment from 'moment';

const Challenge: React.FC = () => {
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
  const [currentGameId, setCurrentGameId] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [scope, animate] = useAnimate();
  const scale = useMotionValue(0);
  const [lastLife, setLastLife] = useState(0);

  useEffect(() => {
    const controls = animate(scale, 1, { duration: 1 });

    return () => controls.stop();
  }, [currentGameId]);

  const currentTime = useMemo(() => moment(remaining).seconds(), [remaining]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentGameId > 0 && !remaining) {
        setRemaining((e) => Math.max(e - 1000, 0));
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [currentGameId]);

  useUpdateEffect(() => {
    if (lastLife) {
      setTimeout(() => {
        setLastLife(0);
      }, 150);
    }
  }, [lastLife]);

  useUpdateEffect(() => {
    const target = game.challenges.find((e) => e.id === currentGameId);
    setRemaining(target?.time || 0);
    setTimeout(
      () => {
        if (target) {
          setGame((e) => {
            setLastLife(e.lifes);
            return { ...e, lifes: e.lifes - 1 };
          });

          setCurrentGameId((e) => e + 1);
        } else {
          setCurrentGameId(0);
          setRemaining(0);
          setGame((e) => ({ ...e, started: 0, lifes: 5 }));
        }
      },
      target?.time || 1000,
    );
  }, [currentGameId]);

  const onStart = () => {
    setCurrentGameId(1);
    setGame((e) => ({ ...e, started: Date.now() }));
  };

  const variants = {
    default: {
      scale: 1,
    },
    animate: {
      scale: 2,
      transition: {
        ease: 'easeInOut',
        duration: 0.15,
      },
    },
  };

  return (
    <Flex direction="column" flex="1" gap="1.5rem" textAlign="left" whiteSpace="nowrap">
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
                  <motion.div id={`heart-${i + 1}`} key={i + 1} variants={variants} animate={i + 1 === lastLife ? `animate` : `default`}>
                    <FaRegHeart />
                  </motion.div>
                ),
              )}
            </Flex>
          </Flex>
        </Flex>
      </Flex>

      <Flex
        flex="1"
        bgColor="white"
        display="flex"
        flexDirection="column"
        justify="center"
        align="center"
        h="fit-content"
        borderRadius="10px"
        boxShadow="md"
        color="primary700"
        gap="16px"
        fontSize="18px"
        p="96px 128px"
      >
        {/* <Img src="https://media.newyorker.com/photos/64629d9ca8c7816949e96e85/1:1/w_1910,h_1910,c_limit/Dillon-Blur-11.jpg"></Img> */}
        <Flex display="flex" flexDirection="column" align="center" justify="center" gap="8px" fontSize="20px" fontWeight="600" color="primary800">
          <FaRegClock size="26px" />
          Tempo restante para o desafio
        </Flex>
        <Flex color="gray600" fontSize="16px" gap="8px" textAlign="center">
          Fique atento(a)! O desafio está em andamento, e o tempo está passando. Você tem o seguinte período para completar o desafio
        </Flex>
        <Flex display="flex" flexDirection="column" fontSize="40px" fontWeight="700" color="gray800" align="center">
          00:{currentTime.toString().padStart(2, `0`)}
        </Flex>
        <Text fontSize="14px" color="gray600">
          Use cada momento valioso para dar o seu melhor. Boa sorte!
        </Text>
        <Button
          bgColor="primary600"
          _hover={{ filter: `brightness(0.9)` }}
          gap="8px"
          color="white"
          p="12px"
          disabled={!!currentGameId}
          onClick={() => onStart()}
        >
          Iniciar Desafio
          <LuRocket />
        </Button>
      </Flex>
    </Flex>
  );
};

export default Challenge;

export const getServerSideProps: GetServerSideProps = async () => {
  const selectedPage = 'challenge';

  return { props: { selectedPage, pageTitle: 'Desafio Diário', showBackButton: false } };
};
