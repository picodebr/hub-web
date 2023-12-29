import { LuRocket } from 'react-icons/lu';
import { GetServerSideProps } from 'next';
import { useState } from 'react';
import { FaHeart, FaRegClock, FaRegHeart } from 'react-icons/fa';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Header } from 'rsuite';

import { validateSession } from '@/_base/services/auth';
import { logError, cookieManager } from '@/_base/utils';
import { Logo } from '@/components/Logo';
import { Button, Flex, Img, Link, Progress, Text } from '@chakra-ui/react';

const Challenge: React.FC = () => {
  return (
    <Flex direction="column" w="100%" h="69px" padding="20px 0" gap="20px" textAlign="left" whiteSpace="nowrap">
      <Flex align="center" justify="flex-end" h="fit-content"></Flex>
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
            <FaHeart />
            <FaRegHeart color="error200" />
            <FaRegHeart color="error200" />
            <FaRegHeart color="error200" />
            <FaRegHeart color="error200" />
          </Flex>
        </Flex>
      </Flex>
      <Flex
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
          00:10
        </Flex>
        <Text fontSize="14px" color="gray600">
          Use cada momento valioso para dar o seu melhor. Boa sorte!
        </Text>
        <Button bgColor="primary600" gap="8px" color="white" p="12px">
          Iniciar Desafio
          <LuRocket />
        </Button>
      </Flex>
    </Flex>
  );
};

export default Challenge;

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
