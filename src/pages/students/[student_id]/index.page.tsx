import { GetServerSideProps } from 'next';

import { validateSession } from '@/_base/services/auth';
import { logError, cookieManager } from '@/_base/utils';
import { Flex } from '@chakra-ui/react';

const StudentPage: React.FC = () => {
  //TODO: @Ana => implementar a paǵina de visualização do aluno

  return (
    <Flex direction="column" w="100%" h="100%" gap="2rem" overflow="hidden">
      Tela do aluno
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
