import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Flex, Text } from '@chakra-ui/react';
import { FiDivide, FiFileText } from 'react-icons/fi';
import { IoChevronForward } from 'react-icons/io5';
import { MdOutlinePlayCircleFilled } from 'react-icons/md';

export const TeacherProfile: React.FC = () => {
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
              Disciplinas lecionadas
            </Flex>
          </Flex>
          <Flex direction="column" flex="1" gap="20px" overflow="hidden auto">
            {['Matemática', 'Geometria', 'Tecnologia', 'Física', 'Lógica de programação', 'Compiladores e Transpiladores', 'Estrutura de dados'].map(
              (subject) => (
                <Flex key={subject} align="center" gap="12px" w="100%" _notLast={{ borderBottom: '1px', borderColor: 'gray300' }}>
                  <Flex align="center" justify="center" gap="12px" marginBottom="20px" w="100%">
                    <FiDivide fontSize="24px" />
                    <Flex w="100%" fontWeight="500" color="gray700">
                      {subject}
                    </Flex>
                    <IoChevronForward />
                  </Flex>
                </Flex>
              ),
            )}
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
              Continue assistindo
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
