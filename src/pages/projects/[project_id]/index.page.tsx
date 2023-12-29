import { GetServerSideProps } from 'next';
import { ReactNode, useState } from 'react';
import { FaArrowUp, FaPaperclip, FaPlus } from 'react-icons/fa';
import { FiEdit2, FiPlus, FiSend, FiTrash, FiUsers } from 'react-icons/fi';

import { logError, cookieManager } from '@/_base/utils';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Flex,
  Img,
  Input,
  Text,
} from '@chakra-ui/react';
import { ProjectPageView, projectPageViews } from './interfaces';
import { TabSwitch } from '@/components/TabSwitch';
import { EditableTextInput } from '@/components/Inputs/EditableText';
import { Modal } from '@/components/Modal';
import { AppTable } from './components/Table';
import { getProject } from '@/_base/services/project';
import { IProject } from '@/_base/interfaces/project';
import { getBnccSkills } from '@/_base/services/user';
import { IBnccSkill } from '@/_base/interfaces/shared/IBnccSkill';

interface IProps {
  project: IProject;
  bnccSkills: IBnccSkill[];
}

const ProjectPage: React.FC<IProps> = ({ project: hubProject, bnccSkills }) => {
  const [pageView, setPageView] = useState<ProjectPageView>('Sobre');
  const [showModal, setShowModal] = useState(false);
  const [project, setProject] = useState<IProject>(hubProject);

  const PageViewComponent: Record<ProjectPageView, ReactNode> = {
    Sobre: (
      <Flex direction="column" gap="24px" overflow="auto">
        <Flex w="100%" h="auto" p="20px" display="flex" direction="column" bg="white" borderRadius="10px" border="1px" borderColor="gray300">
          <Flex pb={4} direction="column" gap="6px">
            <Text fontSize="14px" fontWeight="500">
              Nome do projeto
            </Text>
            <EditableTextInput value={project.title || ''} onInputChange={(title) => setProject((e) => ({ ...e, title }))} />
          </Flex>
          <Flex pb={4} direction="column" gap="6px">
            <Text fontSize="14px" fontWeight="500">
              Objetivo
            </Text>
            <EditableTextInput value={project.description || ''} onInputChange={(description) => setProject((e) => ({ ...e, description }))} />
          </Flex>
        </Flex>
        <Flex gap="0px" direction="column">
          <Flex w="100%" h="42px" bg="primary300" p="12px" color="white" borderTopRadius="10px" fontWeight="500" align="center">
            Etapas
          </Flex>
          <Flex w="100%" h="auto" p="20px" display="flex" direction="column" bg="white" borderBottomRadius="10px" border="1px" borderColor="gray300">
            {project.metadata?.steps?.map((step) => (
              <Flex key={step.title} pb={4} direction="column" gap="6px">
                <Text fontSize="14px" fontWeight="500">
                  {step.title}
                </Text>
                <EditableTextInput value={step.description || ``} />
              </Flex>
            ))}
          </Flex>
        </Flex>
        <Flex gap="0px" direction="column">
          <Flex
            w="100%"
            h="42px"
            bg="primary500"
            p="12px 30px 12px 12px"
            color="white"
            borderTopRadius="10px"
            fontWeight="500"
            align="center"
            justify="space-between"
          >
            Habilidades BNCC
            <Flex
              onClick={() => setShowModal(true)}
              border="1px"
              borderColor="white"
              borderRadius="4px"
              p="2px"
              cursor="pointer"
              _hover={{ filter: 'brightness(0.8)' }}
            >
              <FiEdit2 color="white" fontSize="16px" />
            </Flex>
          </Flex>
          <Flex w="100%" h="auto" p="20px" display="flex" direction="column" bg="white" borderBottomRadius="10px" border="1px" borderColor="gray300">
            {project.metadata.bncc?.map((bncc) => (
              <Flex key={bncc.tag} pb={4} direction="column" gap="6px">
                <Text fontSize="14px" fontWeight="500">
                  {bncc.subject}
                </Text>
                <Flex p="8px" border="1px" borderColor="gray300" borderRadius="8px">
                  {`${bncc.tag} - ${bncc.title}`}
                </Flex>
              </Flex>
            ))}
          </Flex>
        </Flex>
        <Flex gap="0px" direction="column">
          <Flex w="100%" h="42px" bg="primary400" p="12px" color="white" borderTopRadius="10px" fontWeight="500" align="center">
            Apresentação
          </Flex>
          <Flex w="100%" h="auto" p="20px" display="flex" direction="column" bg="white" borderBottomRadius="10px" border="1px" borderColor="gray300">
            <Flex pb={4} direction="column" gap="6px">
              <Text fontSize="14px" fontWeight="500">
                Apresentação
              </Text>
              <EditableTextInput
                value={project.metadata.presentation || ``}
                onInputChange={(presentation) => setProject((e) => ({ ...e, metadata: { ...e.metadata, presentation } }))}
              />
              <Button gap="8px">
                <FaPaperclip />
                Anexar arquivo
              </Button>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    ),
    Materiais: (
      <Flex w="100%" overflow="auto" direction="column" gap="24px">
        {' '}
        <Flex w="100%" borderColor="gray300" borderRadius="10px" gap="32px">
          <Input bg="white" placeholder="Adicione um material" />
          <Flex
            w="40px"
            h="40px"
            direction="row"
            align="center"
            justify="center"
            bg="primary300"
            color="white"
            cursor="pointer"
            borderRadius="10px"
            _hover={{ filter: 'brightness(0.95)' }}
          >
            <FiPlus size="20px" />
          </Flex>
        </Flex>
        <Flex direction="column" gap="24px" w="100%">
          <Flex w="100%" h="auto" p="20px" display="flex" direction="column" bg="white" borderRadius="10px" border="1px" borderColor="gray300">
            <Flex pb={4} gap="6px" w="100%" justify="space-between" borderBottom="1px" borderColor="gray300">
              <Flex fontSize="14px" fontWeight="500" align="center" gap="8px">
                Nome
                <FaArrowUp size="10px" color="#98A2B3" />
              </Flex>
              <Text fontSize="14px" fontWeight="500">
                Ação
              </Text>
            </Flex>
            <Flex p="20px" gap="6px" borderBottom="1px" borderColor="gray300" fontSize="14px" fontWeight="500" justify="space-between">
              Tesoura sem ponta
              <FiTrash color="red" />
            </Flex>
            <Flex p="20px" gap="6px" borderBottom="1px" borderColor="gray300" fontSize="14px" fontWeight="500" justify="space-between">
              Papel
              <FiTrash color="red" />
            </Flex>
            <Flex p="20px" gap="6px" fontSize="14px" fontWeight="500" justify="space-between">
              Arduíno
              <FiTrash color="red" />
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    ),
    Anotações: (
      <Flex w="100%" overflow="auto" direction="column" gap="24px">
        {' '}
        <Flex direction="column">
          <Flex w="100%" h="164px" border="1px" borderColor="gray300" borderRadius="10px" gap="32px" bg="white">
            <Input p="14px" variant="unstyled" placeholder="Faça uma anotação" />
          </Flex>
          <Flex w="100%" justify="flex-end" marginTop="4px" gap="8px" pt="8px">
            <Button w="fit-content" h="44px" bg="primary600" color="white" gap="8px">
              <FaPaperclip size="20px" />
              Anexar arquivo
            </Button>
            <Button w="113px" h="44px" bg="primary300" color="white" gap="8px">
              <FiSend size="20px" />
              Enviar
            </Button>
          </Flex>
        </Flex>
        <Flex direction="column" gap="24px" w="100%">
          <Flex w="100%" h="auto" p="20px" display="flex" direction="column" bg="white" borderRadius="10px" border="1px" borderColor="gray300">
            <Flex pb={4} gap="6px" w="100%" justify="space-between">
              <Flex fontSize="14px" fontWeight="500" align="center" direction="column">
                <Flex gap="10px" direction="row" align="center">
                  <Img src="/avatars/default.jpeg" w="32px" h="32px" borderRadius="100%"></Img>
                  <Flex color="primary700" fontWeight="600" fontSize="17px" direction="column">
                    Carlos Luis
                    <Flex color="gray400" fontSize="14px">
                      @carlosluis
                    </Flex>
                  </Flex>
                </Flex>
              </Flex>
              <FiTrash color="red" size="16px" />
            </Flex>
            <Flex pl="20px" gap="6px" fontSize="14px" fontWeight="500" justify="space-between">
              Os alunos estão realizando uma atividade extra nessa data.
            </Flex>
            <Flex p="20px" fontSize="13px" color="gray400" direction="column">
              11/12/2023 às 12:31
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    ),
    Grupos: (
      <Flex w="100%" h="100%" direction="column" gap="24px">
        <Flex w="100%" overflow="auto" direction="column" gap="24px" bgColor="warning25" borderRadius="10px" boxShadow="md">
          <Flex w="100%" h="108px" p="12px 32px" justify="space-between" align="center">
            <Flex>
              <Text color="warning700" fontWeight="500">
                Nome do grupo
              </Text>
              <AvatarGroup children={undefined}></AvatarGroup>
            </Flex>
            <Flex color="warning500" fontSize="14px">
              19/11/2023
            </Flex>
            <Flex h="100%" direction="column" gap="12px">
              <Button bg="success600" color="white">
                Aprovar
              </Button>
              <Button bg="white" color="gray700" border="1px" borderColor="gray300">
                Recusar
              </Button>
            </Flex>
          </Flex>
        </Flex>
        <Flex w="100%" gap="32px">
          <Flex h="144px" w="100%" bg="gray100" border="1px" borderRadius="10px" borderColor="gray300" />
          <Flex h="144px" w="100%" bg="gray100" border="1px" borderRadius="10px" borderColor="gray300" />
          <Flex h="144px" w="100%" bg="gray100" border="1px" borderRadius="10px" borderColor="gray300" />
          <Flex h="144px" w="100%" bg="gray100" border="1px" borderRadius="10px" borderColor="gray300" />
          <Flex h="144px" w="100%" bg="gray100" border="1px" borderRadius="10px" borderColor="gray300" align="center" justify="center">
            <FaPlus />
          </Flex>
        </Flex>
        <Flex w="100%" h="auto" bg="white" borderRadius="10px" border="1px" borderColor="gray300" p="20px">
          <Accordion w="100%" border="transparent" allowToggle>
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box as="span" flex="1" textAlign="left" fontSize="15px" color="gray600">
                    Grupos
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel display="flex" gap="16px" alignItems="center">
                <FiUsers size="50px" color="#21E080" />
                <Flex direction="column">
                  <Text color="primary700" fontSize="18px" fontWeight="700" gap="4px">
                    Grupo dos meninos
                  </Text>
                  <AvatarGroup size="sm" max={6}>
                    <Avatar></Avatar>
                    <Avatar></Avatar>
                    <Avatar></Avatar>
                    <Avatar></Avatar>
                    <Avatar></Avatar>
                    <Avatar></Avatar>
                    <Avatar></Avatar>
                    <Avatar></Avatar>
                    <Avatar></Avatar>
                  </AvatarGroup>
                </Flex>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </Flex>
      </Flex>
    ),
  };

  return (
    <Flex direction="column" w="100%" h="100%" gap="2rem" overflow="hidden">
      <TabSwitch
        tabs={projectPageViews.map((view) => ({ isSelected: pageView === view, key: view, label: view }))}
        onSwitch={(view) => setPageView(view as any)}
        currentTabColor="primary700"
      />
      {PageViewComponent[pageView]}
      <Modal
        size="6xl"
        title="Habilidades BNCC"
        show={showModal}
        onConfirm={() => setShowModal(false)}
        okText={'Confirmar'}
        onCancel={() => setShowModal(false)}
        topIcon="warning"
      >
        <AppTable
          bnccSkills={bnccSkills}
          values={project.metadata.bncc || []}
          onChange={(bncc) => setProject((e) => ({ ...e, metadata: { ...e.metadata, bncc } }))}
        />
      </Modal>
    </Flex>
  );
};

export default ProjectPage;

export const getServerSideProps: GetServerSideProps = async ({ req, res, query }) => {
  const selectedPage = 'project';

  try {
    cookieManager.updateToken(req);

    const [project, bnccSkills] = await Promise.all([getProject(`${query.project_id}`), getBnccSkills()]);

    return { props: { selectedPage, pageTitle: project.title, project, bnccSkills } };
  } catch (err: any) {
    cookieManager.forceTokenExpires(res);
    logError(selectedPage, err);

    return { redirect: { destination: '/login', permanent: false } };
  }
};
