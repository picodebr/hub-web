import { GetServerSideProps } from 'next';

import { validateSession } from '@/_base/services/auth';
import { logError, cookieManager } from '@/_base/utils';
import { Flex, Link, Progress, Text } from '@chakra-ui/react';
import { FiChevronLeft, FiLock } from 'react-icons/fi';
import { useCustomRouter } from '@/_base/hooks';

const Courses: React.FC = () => {
  const router = useCustomRouter();
  return (
    <Flex direction="column" w="100%" h="69px" padding="20px 0" gap="20px" textAlign="left" whiteSpace="nowrap">
      <Flex align="center" justify="flex-end" h="fit-content">
        <Link href="/courses" width="100%"></Link>
      </Flex>
      <Flex
        bgColor="white"
        direction="column"
        borderRadius="12px"
        boxShadow="md"
        w="100%"
        h="360px"
        padding="20px 0"
        gap="20px"
        textAlign="left"
        whiteSpace="nowrap"
        borderBottom="1px solid gray300"
      >
        <Text borderBottom="1px" borderColor="gray300" padding="0 20px 20px" color="gray600">
          Módulos
        </Text>
        <Flex direction="column" p="20px" fontWeight="700" color="gray700" gap="12px">
          <Flex
            cursor="pointer"
            borderBottom="1px"
            borderColor="gray100"
            paddingBottom="12px"
            display="flex"
            justify="space-between"
            onClick={() => router.push(`/courses/3/1`)}
          >
            Programação 1
            <Flex w="320px" gap="12px" align="center">
              <Progress value={70} rounded={8} flex="1" min={0} max={100} size="md" />
              <Text fontWeight="500" align="center" fontSize="14px">
                70%
              </Text>
            </Flex>
          </Flex>
          <Flex gap="8px" align="center" borderBottom="1px" borderColor="gray100" paddingBottom="12px" display="flex" justify="space-between">
            <Flex gap="8px" align="center">
              Programação 2
              <FiLock color="#13277A" />
            </Flex>
            <Flex w="320px" gap="12px" align="center">
              <Progress value={0} rounded={8} flex="1" min={0} max={100} size="md" />
              <Text fontWeight="500" align="center" fontSize="14px">
                0%
              </Text>
            </Flex>
          </Flex>
          <Flex gap="8px" align="center" display="flex" justify="space-between">
            <Flex gap="8px" align="center">
              Programação 3
              <FiLock color="#13277A" />
            </Flex>
            <Flex w="320px" gap="12px" align="center">
              <Progress value={0} rounded={8} flex="1" min={0} max={100} size="md" />
              <Text fontWeight="500" align="center" fontSize="14px">
                0%
              </Text>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Courses;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const selectedPage = 'courses';

  try {
    cookieManager.updateToken(req);

    await validateSession();

    return { props: { selectedPage, pageTitle: 'Curso tal' } };
  } catch (err: any) {
    cookieManager.forceTokenExpires(res);
    logError(selectedPage, err);

    return { redirect: { destination: '/login', permanent: false } };
  }
};
