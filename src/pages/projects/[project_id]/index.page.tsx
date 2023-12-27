import { GetServerSideProps } from 'next';
import { ReactNode, useState } from 'react';
import { FaArrowUp, FaPaperclip, FaPlus } from 'react-icons/fa';
import { FiEdit2, FiPlus, FiSend, FiTrash, FiUsers } from 'react-icons/fi';

import { validateSession } from '@/_base/services/auth';
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
  IconButton,
  Img,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from '@chakra-ui/react';
import { ProjectPageView, projectPageViews } from './interfaces';
import { TabSwitch } from '@/components/TabSwitch';
import { EditableTextInput } from '@/components/Inputs/EditableText';

const ProjectPage: React.FC = () => {
  const [pageView, setPageView] = useState<ProjectPageView>('Sobre');

  const PageViewComponent: Record<ProjectPageView, ReactNode> = {
    Sobre: (
      <Flex direction="column" gap="24px" overflow="auto">
        <Flex w="100%" h="auto" p="20px" display="flex" direction="column" bg="white" borderRadius="10px" border="1px" borderColor="gray300">
          <Flex pb={4} direction="column" gap="6px">
            <Text fontSize="14px" fontWeight="500">
              Nome do projeto
            </Text>
            <EditableTextInput placeholder="Soma" />
          </Flex>
          <Flex pb={4} direction="column" gap="6px">
            <Text fontSize="14px" fontWeight="500">
              Objetivo
            </Text>
            <EditableTextInput placeholder="Ensinar os alunos do 2º ano sobre a operação de soma de forma lúdica e prática" />
          </Flex>
        </Flex>
        <Flex gap="0px" direction="column">
          <Flex w="100%" h="42px" bg="primary300" p="12px" color="white" borderTopRadius="10px" fontWeight="500" align="center">
            Etapas
          </Flex>
          <Flex w="100%" h="auto" p="20px" display="flex" direction="column" bg="white" borderBottomRadius="10px" border="1px" borderColor="gray300">
            <Flex pb={4} direction="column" gap="6px">
              <Text fontSize="14px" fontWeight="500">
                Contextualização
              </Text>
              <EditableTextInput placeholder="Apresente aos alunos situações do cotidiano em que a soma é utilizada, como por exemplo, contar objetos, somar dinheiro." />
            </Flex>
            <Flex pb={4} direction="column" gap="6px">
              <Text fontSize="14px" fontWeight="500">
                Planejamento
              </Text>
              <EditableTextInput placeholder="Auxilie os alunos a construírem o jogo utilizando os materiais disponíveis. Eles podem desenhar o tabuleiro, os dados e as regras." />
            </Flex>
            <Flex pb={4} direction="column" gap="6px">
              <Text fontSize="14px" fontWeight="500">
                Construção
              </Text>
              <EditableTextInput placeholder="Distribua folhas de papel e peça para os alunos planejarem um jogo utilizando a operação de soma. Eles devem pensar em regras simples." />
            </Flex>
            <Flex pb={4} direction="column" gap="6px">
              <Text fontSize="14px" fontWeight="500">
                Apresentação e Testes
              </Text>
              <EditableTextInput placeholder="Cada aluno ou grupo apresentará o jogo construído para a turma. Durante a apresentação, eles devem explicar as regras." />
            </Flex>
            <Flex pb={4} direction="column" gap="6px">
              <Text fontSize="14px" fontWeight="500">
                Desafio Maker
              </Text>
              <EditableTextInput placeholder="Cada aluno ou grupo apresentará o jogo construído para a turma. Durante a apresentação, eles devem explicar as regras." />
            </Flex>
          </Flex>
        </Flex>
        <Flex gap="0px" direction="column">
          <Flex
            w="100%"
            h="42px"
            bg="primary500"
            p="12px 39px 12px 12px"
            color="white"
            borderTopRadius="10px"
            fontWeight="500"
            align="center"
            justify="space-between"
          >
            Habilidades BNCC
            <Menu>
              <MenuButton as={IconButton} icon={<FiEdit2 />}></MenuButton>
              <MenuList color="gray700">
                <MenuItem>Adicionar nova habilidade</MenuItem>
                <MenuItem>Excluir habilidade</MenuItem>
                <MenuItem>Editar habilidade</MenuItem>
              </MenuList>
            </Menu>
          </Flex>
          <Flex w="100%" h="auto" p="20px" display="flex" direction="column" bg="white" borderBottomRadius="10px" border="1px" borderColor="gray300">
            <Flex pb={4} direction="column" gap="6px">
              <Text fontSize="14px" fontWeight="500">
                Matemática
              </Text>
              <Flex p="8px" border="1px" borderColor="gray300" borderRadius="8px">
                EF06MA01 - Utilizar estratégias pessoais de cálculo mental ou escrito, como contar, estimar, utilizar fatos da adição e da subtração.
              </Flex>
            </Flex>
            <Flex pb={4} direction="column" gap="6px">
              <Text fontSize="14px" fontWeight="500">
                História
              </Text>
              <Flex p="8px" border="1px" borderColor="gray300" borderRadius="8px">
                EF06MA01 - Utilizar estratégias pessoais de cálculo mental ou escrito, como contar, estimar, utilizar fatos da adição e da subtração.
              </Flex>
            </Flex>
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
              <EditableTextInput placeholder="Descreva como foi a apresentação do projeto de cada grupo" />
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
    </Flex>
  );
};

export default ProjectPage;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const selectedPage = 'project';

  try {
    cookieManager.updateToken(req);

    const user = await validateSession();

    return { props: { selectedPage, pageTitle: 'Projeto', user } };
  } catch (err: any) {
    cookieManager.forceTokenExpires(res);
    logError(selectedPage, err);

    return { redirect: { destination: '/login', permanent: false } };
  }
};
