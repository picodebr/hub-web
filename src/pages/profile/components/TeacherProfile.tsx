import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Flex, Text, useColorMode } from '@chakra-ui/react';
import { FiFileText, FiHelpCircle } from 'react-icons/fi';
import { IoChevronForward } from 'react-icons/io5';
import { MdOutlinePlayCircleFilled } from 'react-icons/md';

export const TeacherProfile: React.FC = () => {
  const { colorMode } = useColorMode();
  return (
    <Flex w="100%" display="flex" direction="column" gap="24px">
      <Flex w="100%" h="fit-content" gap="32px" maxH="330px">
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
          <Flex direction="column" flex="1" gap="20px" overflow="hidden auto">
            {[
              'Como abrir o livro na plataforma?',
              'Como criar um novo projeto?',
              'Como acessar minhas turmas?',
              'O que fazer se meu aluno esquecer a senha?',
              'Como começar um novo curso?',
              'Como entrar em contato com o suporte da PiCode?',
              'Como pedir um novo produto através da loja?',
            ].map((subject) => (
              <Flex key={subject} align="center" gap="12px" w="100%" _notLast={{ borderBottom: '1px', borderColor: 'gray300' }}>
                <Flex align="center" justify="center" gap="12px" marginBottom="20px" w="100%">
                  <FiHelpCircle fontSize="24px" color={colorMode === 'dark' ? '#FCFCFD' : '#101828'} />
                  <Flex w="100%" fontWeight="500" color="gray700">
                    {subject}
                  </Flex>
                  <IoChevronForward color={colorMode === 'dark' ? '#FCFCFD' : '#101828'} />
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
            <AccordionPanel pb={4} display="flex" gap="8px">
              <Flex boxShadow="md" bgColor="primary50" borderRadius="10px" w="207px" h="183px" p="12px" direction="column" gap="8px">
                <Flex direction="row" align="center" gap="4px" color="primary500" fontWeight="500">
                  <FiFileText />
                  <Text>Arquivo de texto</Text>
                </Flex>
                <Text fontSize="12px">3 dias atrás</Text>
              </Flex>
              <Flex boxShadow="md" bgColor="primary50" borderRadius="10px" w="207px" h="183px" p="12px" direction="column" gap="8px">
                <Flex direction="row" align="center" gap="4px" color="primary500" fontWeight="500">
                  <FiFileText />
                  <Text>Arquivo de texto</Text>
                </Flex>
                <Text fontSize="12px">3 dias atrás</Text>
              </Flex>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </Flex>
    </Flex>
  );
};
