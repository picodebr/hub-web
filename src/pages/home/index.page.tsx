import { validateSession } from '@/_base/services/auth';
import { logError, cookieManager } from '@/_base/utils';
import { Logo } from '@/components/Logo';
import { Flex, Link, Text } from '@chakra-ui/react';
import { GetServerSideProps } from 'next';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Header } from 'rsuite';

const Home: React.FC = () => {
  return (
    <Flex
      backgroundColor="white"
      width="400px"
      height="fit-content"
      margin="auto"
      borderRadius="12px"
      boxShadow="md"
      align="center"
      padding="24px"
      direction="column"
      gap="20px"
      textAlign="left"
      whiteSpace="nowrap"
      justify="space-between"
      borderBottom="1px solid gray300"
    >
      Meus cursos
      <Flex
        display="block"
        direction="row"
        h="203px"
        w="156px"
        bg="gray100"
        overflow="hidden"
        cursor="pointer"
        _hover={{ filter: 'brightness(0.95)' }}
      >
        <Flex className="IMAGEM DO TIPO DE USUÁRIO SELECIONADO" flex="1" />
      </Flex>
      <Flex h="28px" bg="white" color="gray900" align="left" justify="left">
        Programação
      </Flex>
      <Flex
        display="block"
        direction="row"
        h="203px"
        w="156px"
        bg="gray100"
        overflow="hidden"
        cursor="pointer"
        _hover={{ filter: 'brightness(0.95)' }}
      >
        <Flex className="IMAGEM DO TIPO DE USUÁRIO SELECIONADO" flex="1" />
      </Flex>
      <Flex h="28px" bg="white" color="gray900" align="left" justify="left">
        Introdução a tecnologia
      </Flex>
      <Flex
        display="block"
        direction="row"
        h="203px"
        w="156px"
        bg="gray100"
        overflow="hidden"
        cursor="pointer"
        _hover={{ filter: 'brightness(0.95)' }}
      >
        <Flex className="IMAGEM DO TIPO DE USUÁRIO SELECIONADO" flex="1" />
      </Flex>
      <Flex h="28px" bg="white" color="gray900" align="left" justify="left">
        Matemática
      </Flex>
    </Flex>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const selectedPage = 'home';

  try {
    cookieManager.updateToken(req);

    // await validateSession();

    return { props: { selectedPage, pageTitle: 'Home' } };
  } catch (err: any) {
    cookieManager.forceTokenExpires(res);
    logError(selectedPage, err);

    return { redirect: { destination: '/login', permanent: false } };
  }
};
