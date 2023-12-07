import { validateSession } from '@/_base/services/auth';
import { logError, cookieManager } from '@/_base/utils';
import { Logo } from '@/components/Logo';
import { Flex, Img, Link, Progress, Text } from '@chakra-ui/react';
import { GetServerSideProps } from 'next';
import { useState } from 'react';
import { FaPlus, FaRegFolder } from 'react-icons/fa';
import { FiChevronLeft, FiChevronRight, FiMoreVertical } from 'react-icons/fi';
import { Header } from 'rsuite';

const Project: React.FC = () => {
  return (
    <Flex direction="column" w="100%" h="69px" padding="20px 0" gap="20px" textAlign="left" whiteSpace="nowrap">
      <Flex align="center" justify="flex-end" h="fit-content">
        <Link href="#">
          <Flex
            bgColor="white"
            w="fit-content"
            h="fit-content"
            border="1px"
            borderColor="gray300"
            padding="8px 14px"
            align="center"
            gap="8px"
            borderRadius="8px"
            fontSize="16px"
            fontWeight="600"
            color="gray700"
            boxShadow="md"
            userSelect="none"
          >
            <FaPlus />
            Nova pasta
          </Flex>
        </Link>
      </Flex>
      <Flex
        h="69px"
        bgColor="white"
        borderRadius="10px"
        boxShadow="md"
        align="center"
        padding="20px 24px"
        color="primary700"
        gap="16px"
        fontSize="18px"
      >
        <FaRegFolder fontSize="29px" />
        <Text fontWeight="700">Exemplos</Text>
        <Text fontSize="14px" fontWeight="400" color="gray500" gap="16px">
          5 meses atrás
        </Text>
        <Flex justify="flex-end" w="100%" color="gray300">
          <FiMoreVertical cursor="pointer" />
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Project;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const selectedPage = 'code';

  try {
    cookieManager.updateToken(req);

    await validateSession();

    return { props: { selectedPage, pageTitle: 'Meus projetos (CODE)' } };
  } catch (err: any) {
    cookieManager.forceTokenExpires(res);
    logError(selectedPage, err);

    return { redirect: { destination: '/login', permanent: false } };
  }
};
