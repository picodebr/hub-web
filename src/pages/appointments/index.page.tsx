import { validateSession } from '@/_base/services/auth';
import { cookieManager, logError } from '@/_base/utils';
import { Flex, Img, Text } from '@chakra-ui/react';
import { GetServerSideProps } from 'next';
import { ReactNode, useState } from 'react';

type PageStepsType = 'DOUBT' | 'TECH' | 'PEDAGO' | 'CALENDAR';

const Appointment: React.FC = () => {
  const [step, setStep] = useState<PageStepsType>('DOUBT');

  const PageStepElement: Record<PageStepsType, ReactNode> = {
    DOUBT: (
      <Flex direction="column" gap="50px">
        <Text borderBottom="1px" borderColor="gray300" padding="0 20px 20px">
          Qual sua dúvida?
        </Text>
        <Flex w="100%" h="fit-content">
          <Flex w="100%" justify="space-between" align="center" direction="column">
            <Img
              src="https://i.imgur.com/DxSySOb.jpeg"
              w="300px"
              h="300px"
              borderRadius="20px"
              boxShadow="md"
              _hover={{ transform: `scale(1.15)` }}
              transition="0.2s"
              onClick={() => setStep('TECH')}
              cursor="pointer"
            />
            <Flex fontSize="24px">Técnica</Flex>
          </Flex>
          <Flex w="100%" justify="center" align="center" gap="50px" direction="column">
            <Img
              src="https://i.imgur.com/onk18pJ.jpeg"
              w="300px"
              h="300px"
              borderRadius="20px"
              boxShadow="md"
              _hover={{ transform: `scale(1.15)` }}
              transition="0.2s"
              onClick={() => setStep('PEDAGO')}
              cursor="pointer"
            />
            <Flex fontSize="24px">Pedagógica</Flex>
          </Flex>
        </Flex>
      </Flex>
    ),
    TECH: <Flex></Flex>,
    PEDAGO: <Flex></Flex>,
    CALENDAR: <Flex></Flex>,
  };

  return (
    <Flex
      flex="1"
      bgColor="white"
      direction="column"
      borderRadius="12px"
      padding="20px"
      gap="20px"
      textAlign="left"
      whiteSpace="nowrap"
      borderBottom="1px solid gray300"
      border="1px"
      borderColor="gray300"
      boxShadow="md"
      color="gray600"
    >
      {PageStepElement[step]}
    </Flex>
  );
};

export default Appointment;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const selectedPage = 'appointments';

  try {
    cookieManager.updateToken(req);

    const user = await validateSession();

    return { props: { selectedPage, pageTitle: 'Reuniões', user, showBackButton: false } };
  } catch (err: any) {
    cookieManager.forceTokenExpires(res);
    logError(selectedPage, err);

    return { redirect: { destination: '/login', permanent: false } };
  }
};
