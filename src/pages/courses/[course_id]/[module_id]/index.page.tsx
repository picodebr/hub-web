import { GetServerSideProps } from 'next';

import { validateSession } from '@/_base/services/auth';
import { logError, cookieManager } from '@/_base/utils';
import { Flex } from '@chakra-ui/react';
import { TrailCanvas } from '@/components/Trail';

const Courses: React.FC = () => {
  return (
    <Flex bgColor="white" borderRadius="12px" w="100%" h="100%" border="1px" borderColor="gray300">
      <TrailCanvas />
    </Flex>
  );
};

export default Courses;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const selectedPage = 'courses';

  try {
    cookieManager.updateToken(req);

    await validateSession();

    return { props: { selectedPage, pageTitle: 'Modulo tal' } };
  } catch (err: any) {
    cookieManager.forceTokenExpires(res);
    logError(selectedPage, err);

    return { redirect: { destination: '/login', permanent: false } };
  }
};
