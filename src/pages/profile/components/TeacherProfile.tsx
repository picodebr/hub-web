import moment from 'moment';

import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Flex, Text, useColorMode } from '@chakra-ui/react';
import { FiFileText, FiHelpCircle } from 'react-icons/fi';
import { IoChevronForward } from 'react-icons/io5';
import { MdOutlinePlayCircleFilled } from 'react-icons/md';
import { IProfileComponentProps } from './interfaces';
import { useCustomRouter, useHubTour } from '@/_base/hooks';

type GuideType = { label: string; action: () => void };

export const TeacherProfile: React.FC<IProfileComponentProps> = ({ projects }) => {
  const { colorMode } = useColorMode();
  const router = useCustomRouter();
  const { navbar } = useHubTour();

  const guides: GuideType[] = [
    { action: () => navbar.startTour(), label: 'Como navegar pela plataforma?' },
    { action: () => navbar.startTour(), label: 'Como abrir o livro na plataforma?' },
    { action: () => navbar.startTour(), label: 'Como criar um novo projeto?' },
    { action: () => navbar.startTour(), label: 'Como acessar minhas turmas?' },
    { action: () => navbar.startTour(), label: 'O que fazer se meu aluno esquecer a senha?' },
    { action: () => navbar.startTour(), label: 'Como começar um novo curso?' },
    { action: () => navbar.startTour(), label: 'Como entrar em contato com o suporte da PiCode?' },
    { action: () => navbar.startTour(), label: 'Como pedir um novo produto através da loja?' },
  ];

  return (
    <Flex w="100%" display="flex" direction="column" gap="24px">
      <Flex w="100%" h="fit-content" gap="32px" maxH="330px" minH="330px">
        <Flex
          bg="white"
          p="20px"
          w="100%"
          h="100%"
          display="flex"
          justify="column"
          direction="column"
          gap="20px"
          borderRadius="10px"
          boxShadow="md"
          overflow="hidden"
        >
          <Flex direction="column" w="100%" borderBottom="1px" borderColor="gray300" justify="center">
            <Flex marginBottom="20px" fontSize="14px" color="gray600">
              Guia Rápido
            </Flex>
          </Flex>
          <Flex direction="column" flex="1" overflow="hidden auto">
            {guides.map((guide) => (
              <Flex key={guide.label} w="100%" _notLast={{ borderBottom: '1px', borderColor: 'gray300' }}>
                <Flex
                  onClick={() => guide.action()}
                  align="center"
                  gap="12px"
                  w="100%"
                  p="10px 4px"
                  m="7px 0"
                  borderRadius="md"
                  cursor="pointer"
                  _hover={{ bg: `gray100` }}
                >
                  <Flex align="center" justify="center" gap="12px" w="100%">
                    <FiHelpCircle fontSize="24px" color={colorMode === 'dark' ? '#FCFCFD' : '#101828'} />
                    <Flex w="100%" fontWeight="500" color="gray700">
                      {guide.label}
                    </Flex>
                    <IoChevronForward color={colorMode === 'dark' ? '#FCFCFD' : '#101828'} />
                  </Flex>
                </Flex>
              </Flex>
            ))}
          </Flex>
        </Flex>

        <Flex
          bg="white"
          p="1.25rem 1.25rem 0px 1.25rem"
          w="100%"
          h="100%"
          display="flex"
          justify="column"
          direction="column"
          gap="1.25rem"
          borderRadius="10px"
          marginBottom="1.25rem"
          boxShadow="md"
          overflow="hidden"
        >
          <Flex direction="column" w="100%" h="fit-content" borderBottom="1px" borderColor="gray300" justify="center">
            <Flex fontSize="0.875rem" color="gray600" marginBottom="1.25rem">
              Boas vindas à PiCode 🚀
            </Flex>
          </Flex>
          <Flex flex="1" align="center" gap="0.75rem" w="100%" pb="1.25rem">
            <Flex w="100%" h="100%" borderRadius="6px" bg="lightgray" align="center" justify="center" fontSize="3rem">
              <MdOutlinePlayCircleFilled />
            </Flex>
          </Flex>
        </Flex>
      </Flex>

      <Flex
        bgColor="white"
        flexDirection="column"
        borderRadius="10px"
        boxShadow="md"
        w="100%"
        gap="1.25rem"
        textAlign="left"
        display="column"
        justify="center"
        color="gray600"
      >
        <Accordion allowMultiple>
          <AccordionItem border="none">
            <AccordionButton borderRadius="md">
              <Text flex="1" textAlign="left" padding="0.85rem 0.5rem">
                Projetos
              </Text>
              <AccordionIcon />
            </AccordionButton>
            {projects?.length ? (
              <AccordionPanel pb={4} display="flex" gap="8px">
                {projects
                  .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                  .map((project) => (
                    <Flex
                      key={project.id}
                      boxShadow="md"
                      bgColor="primary50"
                      borderRadius="10px"
                      w="207px"
                      h="183px"
                      p="12px"
                      direction="column"
                      gap="8px"
                    >
                      <Flex
                        direction="row"
                        align="center"
                        gap="4px"
                        color="primary500"
                        fontWeight="500"
                        cursor="pointer"
                        transition="all 0.1s"
                        _hover={{ filter: `brightness(0.9)` }}
                        onClick={() => router.push(`/projects/${project.id}`)}
                      >
                        <FiFileText />
                        <Text>{project.title}</Text>
                      </Flex>
                      <Flex direction="column">
                        <Text fontSize="11px" fontWeight="500">
                          Atualizado em
                        </Text>
                        <Text fontSize="12px">{moment(project.updated_at).calendar()}</Text>
                      </Flex>
                    </Flex>
                  ))}
              </AccordionPanel>
            ) : (
              <AccordionPanel pb={4}>
                <Text color="gray500">Você ainda não possui nenhum projeto</Text>
              </AccordionPanel>
            )}
          </AccordionItem>
        </Accordion>
      </Flex>
    </Flex>
  );
};
