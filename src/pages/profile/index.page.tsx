import { GetServerSideProps } from 'next';
import { useMemo, useState } from 'react';
import { FaPlus, FaRegFolder } from 'react-icons/fa';
import { FiDivide, FiEdit2, FiHelpCircle, FiMapPin, FiMoreVertical, FiUser, FiUsers } from 'react-icons/fi';
import { IoIosArrowDown } from 'react-icons/io';
import { Header } from 'rsuite';
import { FaArrowDownLong } from 'react-icons/fa6';
import { IconType } from 'react-icons';
import { IoChevronForward } from 'react-icons/io5';
import { MdOutlineEmail, MdOutlinePlayCircleFilled } from 'react-icons/md';

import {
  Flex,
  Img,
  Text,
  Button,
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Switch,
  CircularProgress,
  CircularProgressLabel,
  useColorMode,
} from '@chakra-ui/react';
import { TeacherProfile } from './components/TeacherProfile';
import { StudentProfile } from './components/StudentProfile';
import { validateSession } from '@/_base/services/auth';
import { logError, cookieManager } from '@/_base/utils';
import { IHubUser } from '@/_base/interfaces/user';
import { useCustomRouter } from '@/_base/hooks';

interface IProps {
  user: IHubUser;
}

interface IPersonalData {
  name: string;
  user: string;
  bio: string;
  email: string;
  avatar: string;
  adress: string;
  birth: Date;
}

const Profile: React.FC<IProps> = ({ user }) => {
  const { colorMode, toggleColorMode } = useColorMode();
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
        <Accordion allowMultiple display="column">
          <AccordionItem border="none" fontWeight="500" fontSize="14px">
            <h2>
              <AccordionButton>
                <Box as="span" flex="1" textAlign="left" fontWeight="400">
                  Meus dados
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <Text display="column" pb="6px" pl="3px">
                Nome Completo
              </Text>
              <InputGroup>
                <Input placeholder="Carlos Luis Silva" fontWeight="400" borderColor="gray300" />
                <InputRightElement>
                  <FiEdit2 size="16px" />
                </InputRightElement>
              </InputGroup>
            </AccordionPanel>
            <AccordionPanel pb={4}>
              <Text display="column" pb="6px" pl="3px">
                Nome de Usuário
              </Text>
              <InputGroup>
                <InputLeftElement>
                  <FiUser size="16px" />
                </InputLeftElement>
                <Input placeholder="nome.usuario" fontWeight="400" borderColor="gray300" />
                <InputRightElement>
                  <FiEdit2 size="16px" />
                </InputRightElement>
              </InputGroup>
            </AccordionPanel>
            <AccordionPanel pb={4}>
              <Text display="column" pb="6px" pl="3px">
                Biografia
              </Text>
              <InputGroup>
                <Input placeholder="Entusiasta da tecnologia e apaixonado por números!" fontWeight="400" borderColor="gray300" />
                <InputRightElement>
                  <FiEdit2 size="16px" />
                </InputRightElement>
              </InputGroup>
              <Text fontSize="14px" color="gray500" fontWeight="400" display="flex" textAlign="right">
                108/200 caracteres
              </Text>
            </AccordionPanel>
            <AccordionPanel pb={4}>
              <Text display="column" pb="6px" pl="3px">
                E-mail (opcional)
              </Text>
              <InputGroup>
                <InputLeftElement>
                  <MdOutlineEmail />
                </InputLeftElement>
                <Input placeholder="seuemail@gmail.com" fontWeight="400" borderColor="gray300" />
                <InputRightElement>
                  <FiEdit2 size="16px" />
                </InputRightElement>
              </InputGroup>
            </AccordionPanel>
            <AccordionPanel pb={4}>
              <Text display="column" pb="6px" pl="3px">
                Endereço (opcional)
              </Text>
              <InputGroup>
                <InputLeftElement>
                  <FiMapPin />
                </InputLeftElement>
                <Input placeholder="Rua da Glória 123, Bairro Alegria, Minas Gerais, Brasil" fontWeight="400" borderColor="gray300" />
                <InputRightElement>
                  <FiEdit2 size="16px" />
                </InputRightElement>
              </InputGroup>
            </AccordionPanel>
            <AccordionPanel pb={4}>
              <Text display="column" pb="6px" pl="3px">
                Data de Nascimento
              </Text>
              <InputGroup>
                <Input placeholder="05/10/1998" type="date" fontWeight="400" borderColor="gray300" />
                <InputRightElement>
                  <FiEdit2 size="16px" />
                </InputRightElement>
              </InputGroup>
            </AccordionPanel>
            <AccordionPanel>
              <Button display="flex" w="100%" gap="8px" bgColor="transparent" border="1px" color="gray700" borderColor="gray300">
                Alterar senha
                <FiEdit2 size="20px" />
              </Button>
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
        color="gray600"
        userSelect="none"
      >
        <Accordion allowMultiple w="100%">
          <AccordionItem border="none">
            <h2>
              <AccordionButton>
                <Box as="span" flex="1" textAlign="left">
                  Certificados
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4} display="flex" borderBottom="1px" borderColor="gray300">
              <Flex w="100%" display="flex" justify="space-between">
                <Flex gap="20px" align="center">
                  <Img src="/icons/medal.svg" w="40px" />
                  <Text textAlign="center" h="fit-content" fontSize="15px" fontWeight="500" color="gray700">
                    JavaScript
                  </Text>
                </Flex>
                <CircularProgress value={100}>
                  <CircularProgressLabel>100%</CircularProgressLabel>
                </CircularProgress>
              </Flex>
            </AccordionPanel>
            <AccordionPanel pb={4} display="flex" borderBottom="1px" borderColor="gray300">
              <Flex w="100%" display="flex" justify="space-between">
                <Flex gap="20px" align="center">
                  <Img src="/icons/medal.svg" w="40px" />
                  <Text textAlign="center" h="fit-content" fontSize="15px" fontWeight="500" color="gray700">
                    SQL
                  </Text>
                </Flex>
                <CircularProgress value={60}>
                  <CircularProgressLabel>60%</CircularProgressLabel>
                </CircularProgress>
              </Flex>
            </AccordionPanel>
            <AccordionPanel pb={4} display="flex">
              <Flex w="100%" display="flex" justify="space-between">
                <Flex gap="20px" align="center">
                  <Img src="/icons/medal.svg" w="40px" />
                  <Text textAlign="center" h="fit-content" fontSize="15px" fontWeight="500" color="gray700">
                    Python
                  </Text>
                </Flex>
                <CircularProgress value={50}>
                  <CircularProgressLabel>50%</CircularProgressLabel>
                </CircularProgress>
              </Flex>
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
          <Switch onChange={toggleColorMode} />
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
