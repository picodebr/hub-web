import { GetServerSideProps } from 'next';
import { useState } from 'react';
import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Switch, useColorMode } from '@chakra-ui/react';
import { CircularProgress, CircularProgressLabel } from '@chakra-ui/react';
import { TeacherProfile } from './components/TeacherProfile';
import { StudentProfile } from './components/StudentProfile';

import { validateSession } from '@/_base/services/auth';
import { logError, cookieManager } from '@/_base/utils';
import { Flex, Img, Text } from '@chakra-ui/react';
import { IHubUser } from '@/_base/interfaces/user';
import { EditableTextInput } from '@/components/Inputs/EditableText';
import { DateInput } from '@/components/Inputs/Date';
import { formatDateInput } from '../signup/index.page';

interface IProps {
  user: IHubUser;
}

const Profile: React.FC<IProps> = ({ user }) => {
  const { colorMode, toggleColorMode } = useColorMode();

  const [profile, setProfile] = useState<IHubUser>(user);

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
        padding="0.85rem 0.5rem"
        gap="1.25rem"
        textAlign="left"
        display="column"
        justify="center"
        color="gray600"
      >
        <Accordion allowMultiple>
          <AccordionItem border="none">
            <AccordionButton borderRadius="md">
              <Text flex="1" textAlign="left">
                Meus dados
              </Text>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
              <Flex pb={5} direction="column">
                <Text>Nome Completo</Text>
                <EditableTextInput onInputChange={(name) => setProfile((e) => ({ ...e, name }))} value={profile.name} />
              </Flex>
              <Flex pb={5} direction="column">
                <Text>Nome de Usuário</Text>
                <EditableTextInput onInputChange={(username) => setProfile((e) => ({ ...e, username }))} value={profile.username} />
              </Flex>
              <Flex pb={5} direction="column">
                <Text>Biografia</Text>
                <EditableTextInput placeholder="Biografia" onInputChange={(bio) => setProfile((e) => ({ ...e, bio }))} value={profile.bio || ''} />
              </Flex>
              <Flex pb={5} direction="column">
                <Text>E-mail (opcional)</Text>
                <EditableTextInput
                  placeholder="Seu e-mail"
                  onInputChange={(email) => setProfile((e) => ({ ...e, email }))}
                  value={profile.email || ''}
                />
              </Flex>
              <Flex pb={5} direction="column">
                <Text>Endereço (opcional)</Text>
                <EditableTextInput placeholder="Informe seu endereço" />
              </Flex>
              <Flex direction="column">
                <Text>Data de Nascimento</Text>
                <DateInput
                  value={formatDateInput(profile.birthdate)}
                  onInputChange={(birthdate) => setProfile((e) => ({ ...e, birthdate: birthdate ? new Date(birthdate) : e.birthdate }))}
                />
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
            <AccordionButton borderRadius="md">
              <Text flex="1" textAlign="left">
                Certificados
              </Text>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <Img src="/icons/medal.svg" />
              JavaScript
              <CircularProgress value={100}>
                <CircularProgressLabel>100%</CircularProgressLabel>
              </CircularProgress>
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
          <Switch onChange={toggleColorMode} isChecked={colorMode === 'dark'} />
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
