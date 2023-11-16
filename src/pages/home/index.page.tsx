import { validateSession } from '@/_base/services/auth';
import { logError, tokenManager } from '@/_base/utils';
import { Logo } from '@/components/Logo';
import { Flex, Link, Text } from '@chakra-ui/react';
import { GetServerSideProps } from 'next';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

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
    >
      Página principal
    </Flex>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const selectedPage = 'home';

  try {
    tokenManager.updateToken(req);

    // await validateSession();
    
    return { props: { selectedPage, pageTitle: 'Home' } };
  } catch (err: any) {
    tokenManager.forceExpires(res);
    logError(selectedPage, err);
    
    return { redirect: { destination: '/login', permanent: false } };
  }
};