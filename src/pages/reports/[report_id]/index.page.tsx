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
  Badge,
  Flex,
  Img,
  Progress,
  Text,
  useColorMode,
} from '@chakra-ui/react';
import { FiUsers } from 'react-icons/fi';
import { TbCode, TbMathSymbols } from 'react-icons/tb';
import { useSelectedSchool } from '@/components/Page/components/Header';
import { IHubUser } from '@/_base/interfaces/user';
import { useAuth } from '@/_base/hooks';

const ReportPage: React.FC<IHubUser> = () => {
  const { school } = useSelectedSchool();
  const { user } = useAuth();
  return (
    <Flex direction="column" w="100%" h="100%" overflow="auto">
      <Flex
        direction="column"
        bg="white"
        border="1px"
        borderColor="gray300"
        p="20px"
        h="fit-content"
        position="relative"
        borderRadius="10px"
        gap="14px"
      >
        <Badge bg="orange.300" color="orange.700">
          {' '}
          Em Andamento
        </Badge>
        <Flex>
          <Flex w="100%" fontSize="27px" color="orange.700" fontWeight="600">
            Chamado #0001
          </Flex>
          <Flex fontSize="14px">{user.name} - 30/01/2024 às 16:14</Flex>
        </Flex>
        <Flex direction="column" fontWeight="500">
          Rede de Escola:
          <Text fontWeight="400">{school?.hub_school_group.display_name}</Text>
        </Flex>
        <Flex direction="column" fontWeight="500">
          Escola:
          <Text fontWeight="400">{school.display_name}</Text>
        </Flex>
        <Flex direction="column" fontWeight="500">
          Assunto:
          <Text fontWeight="400">Kits / Placas</Text>
        </Flex>
        <Flex direction="column" fontWeight="500">
          Descrição:
          <Text fontWeight="400">Estamos com falta de placas na unidade</Text>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default ReportPage;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const selectedPage = 'reports';

  try {
    cookieManager.updateToken(req);

    const user = await validateSession();

    return { props: { selectedPage, pageTitle: 'Report', user } };
  } catch (err: any) {
    cookieManager.forceTokenExpires(res);
    logError(selectedPage, err);

    return { redirect: { destination: '/login', permanent: false } };
  }
};
