import { GetServerSideProps } from 'next';
import { useState } from 'react';
import { FaPlus, FaRegFolder } from 'react-icons/fa';
import { FiMoreVertical, FiUsers } from 'react-icons/fi';
import { Header } from 'rsuite';

import { Avatar, AvatarGroup } from '@chakra-ui/react';
import { validateSession } from '@/_base/services/auth';
import { logError, cookieManager } from '@/_base/utils';
import { Logo } from '@/components/Logo';
import { Flex, Img, Link, Progress, Text } from '@chakra-ui/react';

const Groups: React.FC = () => {
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
          >
            <FaPlus />
            Novo grupo
          </Flex>
        </Link>
      </Flex>
      <Flex
        h="fit-content"
        bgColor="white"
        borderRadius="10px"
        boxShadow="md"
        align="center"
        padding="20px 24px"
        color="primary700"
        gap="16px"
        fontSize="18px"
      >
        <FiUsers fontSize="40px" />
        <Flex display="column" justify="space-between">
          <Text fontWeight="700">Grupo de História</Text>
          <AvatarGroup size="sm" max={10}>
            <Avatar name="Ryan Florence" src="https://bit.ly/ryan-florence" />
            <Avatar name="Segun Adebayo" src="https://bit.ly/sage-adebayo" />
            <Avatar name="Kent Dodds" src="https://bit.ly/kent-c-dodds" />
            <Avatar name="Prosper Otemuyiwa" src="https://bit.ly/prosper-baba" />
            <Avatar name="Christian Nwamba" src="https://bit.ly/code-beast" />
            <Avatar name="Ryan Florence" src="https://bit.ly/ryan-florence" />
            <Avatar name="Segun Adebayo" src="https://bit.ly/sage-adebayo" />
            <Avatar name="Kent Dodds" src="https://bit.ly/kent-c-dodds" />
            <Avatar name="Prosper Otemuyiwa" src="https://bit.ly/prosper-baba" />
            <Avatar name="Christian Nwamba" src="https://bit.ly/code-beast" />
            <Avatar name="Ryan Florence" src="https://bit.ly/ryan-florence" />
            <Avatar name="Segun Adebayo" src="https://bit.ly/sage-adebayo" />
            <Avatar name="Kent Dodds" src="https://bit.ly/kent-c-dodds" />
            <Avatar name="Prosper Otemuyiwa" src="https://bit.ly/prosper-baba" />
            <Avatar name="Christian Nwamba" src="https://bit.ly/code-beast" />
          </AvatarGroup>
        </Flex>
        <Flex justify="flex-end" w="100%" color="gray300">
          <FiMoreVertical cursor="pointer" />
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Groups;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const selectedPage = 'groups';

  try {
    cookieManager.updateToken(req);

    await validateSession();

    return { props: { selectedPage, pageTitle: 'Meus grupos' } };
  } catch (err: any) {
    cookieManager.forceTokenExpires(res);
    logError(selectedPage, err);

    return { redirect: { destination: '/login', permanent: false } };
  }
};
