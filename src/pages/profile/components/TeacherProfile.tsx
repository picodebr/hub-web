import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
  Img,
  Link,
  Progress,
  Switch,
  Text,
} from '@chakra-ui/react';
import { FiDivide, FiHelpCircle } from 'react-icons/fi';
import { IoChevronForward } from 'react-icons/io5';
import { MdOutlinePlayCircleFilled } from 'react-icons/md';

const TeacherProfile: React.FC = () => {
  return (
    <Flex w="100%" display="flex" direction="column" gap="24px">
      <Flex w="100%" h="fit-content" gap="32px">
        <Flex
          bg="white"
          p="20px 20px 0px 20px"
          w="100%"
          h="100%"
          display="flex"
          justify="column"
          direction="column"
          gap="20px"
          borderRadius="10px"
          marginBottom="20px"
          boxShadow="md"
        >
          <Flex direction="column" w="100%" borderBottom="1px" borderColor="gray300" justify="center">
            <Flex marginBottom="20px" fontSize="14px" color="gray600">
              Disciplinas lecionadas
            </Flex>
          </Flex>
          <Flex align="center" gap="12px" w="100%" borderBottom="1px" borderColor="gray300">
            <Flex align="center" justify="center" gap="12px" marginBottom="20px" w="100%">
              <FiDivide fontSize="24px" />
              <Flex w="100%" fontWeight="500" color="gray700">
                Matemática
              </Flex>
              <IoChevronForward />
            </Flex>
          </Flex>
          <Flex align="center" gap="12px" w="100%" borderBottom="1px" borderColor="gray300">
            <Flex align="center" justify="center" gap="12px" marginBottom="20px" w="100%">
              <FiDivide fontSize="24px" />
              <Flex w="100%" fontWeight="500" color="gray700">
                Geometria
              </Flex>
              <IoChevronForward />
            </Flex>
          </Flex>
          <Flex align="center" gap="12px" w="100%">
            <Flex align="center" justify="center" gap="12px" marginBottom="20px" w="100%">
              <FiDivide fontSize="24px" />
              <Flex w="100%" fontWeight="500" color="gray700">
                Tecnologia
              </Flex>
              <IoChevronForward />
            </Flex>
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
        >
          <Flex direction="column" w="100%" h="fit-content" borderBottom="1px" borderColor="gray300" justify="center">
            <Flex fontSize="0.875rem" color="gray600" marginBottom="1.25rem">
              Continue assistindo
            </Flex>
          </Flex>
          <Flex align="center" gap="0.75rem" w="100%" pb="1.25rem">
            <Flex w="100%" h="11rem" borderRadius="6px" bg="pink" align="center" justify="center" fontSize="3rem">
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
        h="fit-content"
        padding="1.25rem"
        gap="1.25rem"
        textAlign="left"
        display="column"
        justify="center"
        color="gray600"
      >
        <Accordion defaultIndex={[0]} allowMultiple>
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box as="span" flex="1" textAlign="left">
                  Meus dados
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>Nome</AccordionPanel>
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
        justify="center"
        color="gray600"
      >
        <Accordion defaultIndex={[0]} allowMultiple>
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box as="span" flex="1" textAlign="left">
                  Certificados
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}></AccordionPanel>
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
          <Text>Suporte Picode</Text>
          <FiHelpCircle color="#D0D5DD" />
        </Flex>
      </Flex>
    </Flex>
  );
};

export default TeacherProfile;
