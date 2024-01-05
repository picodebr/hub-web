import { GetServerSideProps } from 'next';

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
  Flex,
  Img,
  Progress,
  Text,
  useColorMode,
} from '@chakra-ui/react';
import { FiUsers } from 'react-icons/fi';
import { TbCode, TbMathSymbols } from 'react-icons/tb';

const StudentPage: React.FC = () => {
  const { colorMode } = useColorMode();
  return (
    <Flex direction="column" w="100%" h="100%" overflow="auto">
      <Flex bg={colorMode === 'light' ? 'primary900' : 'primary400'} h="102px" position="relative" borderRadius="10px" minH="102px" gap="-24px">
        <Flex
          position="absolute"
          borderRadius="50%"
          bg="gray300"
          bottom="-2rem"
          w="6rem"
          h="6rem"
          left="50%"
          boxShadow=" 0px 4px 6px -2px"
          transform="translate(-50%, 0)"
          overflow="hidden"
          border="4px"
          borderColor="white"
        >
          <Img src="/avatars/default.jpeg" w="100%" h="100%" />
        </Flex>
      </Flex>
      {/* Left Content */}
      <Flex w="100%" h="auto" border="1px" borderColor="gray300" borderRadius="10px" bg="white" display="flex" padding="40px" gap="32px">
        <Flex direction="column" gap="32px">
          <Flex w="70%" h="fit-content" display="flex" direction="column" justify="end">
            <Text fontSize="18px" fontWeight="600" color="primary500">
              Matheus Silva Rodrigues
            </Text>
            <Text fontSize="12px" color="gray400">
              @mathalegria
            </Text>
            <Text fontSize="14px" margin="8px 0 8px 0" color="gray600">
              Entusiasta da tecnologia em busca de conhecimento e inovação. Apaixonado por música, viagens e aprendizado contínuo.
            </Text>
          </Flex>
          <Flex w="50%" direction="row" align="center" justify="space-between" gap="0.5rem" fontWeight="400" color="gray400">
            <Text>0</Text>
            <Text>5</Text>
          </Flex>
          <Flex w="50%" direction="row" align="center" justify="space-between" gap="0.5rem" fontWeight="400" color="gray400">
            <Progress value={4} rounded={8} flex="1" min={0} max={5} size="sm" w="50%" />
          </Flex>
        </Flex>
        {/* Right Content */}
        <Flex
          display="flex"
          flex="1 0 0"
          justify="flex-end"
          direction="row"
          w="183px"
          h="auto"
          border="1px"
          borderRadius="8px"
          borderColor="primary300"
          justifyContent="center"
        >
          <Text>Engajamento</Text>
        </Flex>
      </Flex>
      <Accordion allowMultiple bg="white" border="1px" borderColor="gray300" borderRadius="10px" margin="24px 0 0 0">
        <AccordionItem border="none" borderRadius="10px">
          <AccordionButton borderRadius="md">
            <Text flex="1" textAlign="left" padding="20px" color="gray600" fontSize="14px">
              Grupos
            </Text>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel padding="20px">
            <Flex direction="row" gap="16px" align="center">
              <FiUsers fontSize="40px" color="#21E080" />
              <Flex display="column" justify="space-between">
                <Text fontWeight="700" fontSize="18px" color="primary700">
                  Grupo de História
                </Text>
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
            </Flex>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
      <Accordion allowMultiple bg="white" border="1px" borderColor="gray300" borderRadius="10px" margin="24px 0 0 0">
        <AccordionItem border="none" borderRadius="10px">
          <AccordionButton borderRadius="md">
            <Text flex="1" textAlign="left" padding="20px" color="gray600" fontSize="14px">
              Dificuldades
            </Text>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel padding="20px">
            <Flex direction="row" gap="16px" align="center">
              <TbMathSymbols fontSize="40px" color="" />
              <Flex display="column" justify="space-between">
                <Text fontWeight="700" fontSize="18px" color="primary700">
                  Matemática
                </Text>
                <Text>Equações de segundo grau</Text>
              </Flex>
            </Flex>
            <Flex direction="row" gap="16px" align="center" marginTop="20px">
              <TbCode fontSize="40px" color="" />
              <Flex display="column" justify="space-between">
                <Text fontWeight="700" fontSize="18px" color="primary700">
                  Programação
                </Text>
                <Text>Lógica de programação e algoritmos</Text>
              </Flex>
            </Flex>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
      <Accordion allowMultiple bg="white" border="1px" borderColor="gray300" borderRadius="10px" margin="24px 0 0 0">
        <AccordionItem border="none" borderRadius="10px">
          <AccordionButton borderRadius="md">
            <Text flex="1" textAlign="left" padding="20px" color="gray600" fontSize="14px">
              Habilidades
            </Text>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel padding="20px">
            <Flex direction="row" gap="16px" align="center">
              <TbMathSymbols fontSize="40px" color="" />
              <Flex display="column" justify="space-between">
                <Text fontWeight="700" fontSize="18px" color="primary700">
                  Matemática
                </Text>
                <Text>Equações de primeiro grau</Text>
              </Flex>
            </Flex>
            <Flex direction="row" gap="16px" align="center" marginTop="20px">
              <TbCode fontSize="40px" color="" />
              <Flex display="column" justify="space-between">
                <Text fontWeight="700" fontSize="18px" color="primary700">
                  Programação
                </Text>
                <Text>Lógica de programação e algoritmos</Text>
              </Flex>
            </Flex>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Flex>
  );
};

export default StudentPage;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const selectedPage = 'student';

  try {
    cookieManager.updateToken(req);

    const user = await validateSession();

    return { props: { selectedPage, pageTitle: 'Aluno', user } };
  } catch (err: any) {
    cookieManager.forceTokenExpires(res);
    logError(selectedPage, err);

    return { redirect: { destination: '/login', permanent: false } };
  }
};
