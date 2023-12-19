import { GetServerSideProps } from 'next';
import { useMemo, useState } from 'react';
import { FaPlus, FaRegFolder } from 'react-icons/fa';
import { FiDivide, FiHelpCircle, FiMoreVertical, FiUsers } from 'react-icons/fi';
import { IoIosArrowDown } from 'react-icons/io';
import { Header } from 'rsuite';
import { FaArrowDownLong } from 'react-icons/fa6';
import { IconType } from 'react-icons';
import { IoChevronForward } from 'react-icons/io5';
import { MdOutlinePlayCircleFilled } from 'react-icons/md';

import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, Image, Input, Switch } from '@chakra-ui/react';
import { CircularProgress, CircularProgressLabel } from '@chakra-ui/react';
import { TeacherProfile } from './components/TeacherProfile';
import { StudentProfile } from './components/StudentProfile';
import { validateSession } from '@/_base/services/auth';
import { logError, cookieManager } from '@/_base/utils';
import { Logo } from '@/components/Logo';
import { Flex, Img, Link, Progress, Text } from '@chakra-ui/react';
import { Button } from '@chakra-ui/react';
import { IHubUser } from '@/_base/interfaces/user';
import { useCustomRouter } from '@/_base/hooks';

interface IProps {
  user: IHubUser;
}

const Profile: React.FC<IProps> = ({ user }) => {
  const ComponentUser = user?.role === 'student' ? StudentProfile : TeacherProfile;
  return (
    <Flex direction="column" flex="1" gap="24px" overflow="auto">
      <ComponentUser />
      <Flex
        bgColor="white"
        flexDirection="column"
        borderRadius="10px"
        boxShadow="md"
        w="100%"
        h="fit-content"
        padding="0.85rem 0.5rem"
        gap="1.25rem"
        textAlign="left"
        display="column"
        justify="center"
        color="gray600"
      >
        <Accordion allowMultiple>
          <AccordionItem border="none">
            <h2>
              <AccordionButton>
                <Box as="span" flex="1" textAlign="left">
                  Meus dados
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <Text>Nome Completo</Text>
              <Input placeholder="Nome completo"></Input>
            </AccordionPanel>
            <AccordionPanel pb={4}>
              <Text>Nome de Usuário</Text>
              <Input placeholder="Nome de Usuário"></Input>
            </AccordionPanel>
            <AccordionPanel pb={4}>
              <Text>Biografia</Text>
              <Input placeholder="Biografia"></Input>
            </AccordionPanel>
            <AccordionPanel pb={4}>
              <Text>E-mail (opcional)</Text>
              <Input placeholder="Seu e-mail"></Input>
            </AccordionPanel>
            <AccordionPanel pb={4}>
              <Text>Endereço (opcional)</Text>
              <Input placeholder="Rua dos bobos, número 0"></Input>
            </AccordionPanel>
            <AccordionPanel pb={4}>
              <Text>Data de Nascimento</Text>
              <Input placeholder="01/01/2024" type="date"></Input>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </Flex>
      <Flex
        bgColor="white"
        flexDirection="column"
        borderRadius="10px"
        boxShadow="md"
        w="100%"
        h="fit-content"
        padding="0.85rem 0.5rem"
        gap="1.25rem"
        textAlign="left"
        display="column"
        justify="center"
        color="gray600"
        userSelect="none"
      >
        <Accordion allowMultiple>
          <AccordionItem border="none">
            <h2>
              <AccordionButton>
                <Box as="span" flex="1" textAlign="left">
                  Certificados
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <Img src="/icons/medal.svg" />
              JavaScript
              <CircularProgress value={100}>
                <CircularProgressLabel>100%</CircularProgressLabel>
              </CircularProgress>
            </AccordionPanel>
            <AccordionPanel pb={4}>
              <Img src="/icons/medal.svg" />
              SQL
              <CircularProgress value={50}>
                <CircularProgressLabel>50%</CircularProgressLabel>
              </CircularProgress>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </Flex>
      <Flex
        bgColor="white"
        flexDirection="column"
        borderRadius="10px"
        boxShadow="md"
        w="100%"
        h="fit-content"
        padding="1.25rem"
        gap="1.25rem"
        textAlign="left"
        display="column"
        justify="space-between"
        color="gray600"
      >
        <Flex display="flex" justify="space-between" direction="row">
          <Text>Modo noturno</Text>
          <Switch />
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Profile;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const selectedPage = 'profile';

  try {
    cookieManager.updateToken(req);

    const user = await validateSession();

    return { props: { selectedPage, pageTitle: 'Meu perfil', user } };
  } catch (err: any) {
    cookieManager.forceTokenExpires(res);
    logError(selectedPage, err);

    return { redirect: { destination: '/login', permanent: false } };
  }
};
