import { GetServerSideProps } from 'next';
import { ReactNode, useState } from 'react';
import { FaArrowUp, FaPaperclip, FaPlus } from 'react-icons/fa';
import { FiEdit2, FiFileText, FiPlus, FiSend, FiTrash, FiUsers } from 'react-icons/fi';

import { validateSession } from '@/_base/services/auth';
import { logError, cookieManager } from '@/_base/utils';
import { Avatar, Button, Divider, Flex, Img, Text } from '@chakra-ui/react';
import { TabSwitch } from '@/components/TabSwitch';
import { GroupPageView, groupPageViews } from './interfaces';

const GroupPage: React.FC = () => {
  const [pageView, setPageView] = useState<GroupPageView>('Atividades');

  const PageViewComponent: Record<GroupPageView, ReactNode> = {
    Atividades: (
      <Flex direction="column" gap="24px" overflow="auto">
        <Flex
          w="220px"
          h="183px"
          p="12px"
          gap="4px"
          display="flex"
          direction="column"
          bg="white"
          borderRadius="10px"
          border="1px"
          borderColor="gray300"
          cursor="pointer"
          _hover={{ bg: 'gray50' }}
        >
          <Img src="/images/img.png"></Img>
          <Flex align="center" color="primary500" gap="4px" fontWeight="500">
            <FiFileText />
            Arquivo de Texto
          </Flex>
          <Text color="gray500" fontSize="13px">
            3 dias atrás
          </Text>
        </Flex>
      </Flex>
    ),
    Planejamentos: (
      <Flex direction="column" gap="24px" overflow="auto">
        <Flex>Planejamentos</Flex>
      </Flex>
    ),
    Pedidos: (
      <Flex direction="column" gap="24px" overflow="auto">
        <Flex align="center" justify="flex-end" h="fit-content">
          <Flex
            bgColor="white"
            w="fit-content"
            h="fit-content"
            border="1px"
            borderColor="gray300"
            padding="8px 14px"
            align="center"
            gap="8px"
            borderRadius="8px"
            fontSize="16px"
            fontWeight="600"
            color="gray700"
            boxShadow="sm"
            cursor="pointer"
          >
            <FaPlus />
            Novo Pedido
          </Flex>
        </Flex>
        <Flex w="100%" overflow="auto" direction="column" gap="24px" bgColor="warning25" borderRadius="10px" boxShadow="md">
          <Flex w="100%" h="108px" p="12px 32px" justify="space-between" align="center">
            <Flex align="center" gap="12px">
              <Avatar
                size="sm"
                src="https://images.tcdn.com.br/img/img_prod/650361/10x_cabo_jumper_macho_x_femea_10_cm_de_20_unidades_cada_200_jumpers_no_total_1757_1_20200903185441.jpg"
              ></Avatar>
              <Text color="warning700" fontWeight="500">
                Solicitação de compra
              </Text>
            </Flex>
            <Flex color="warning500" fontSize="14px">
              19/11/2023
            </Flex>
            <Flex h="100%" align="center" gap="12px">
              <Button bg="success600" color="white">
                Aprovar
              </Button>
              <Button bg="white" color="gray700" border="1px" borderColor="gray300">
                Recusar
              </Button>
            </Flex>
          </Flex>
        </Flex>
        <Flex w="100%" h="auto" p="20px" display="flex" direction="column" bg="white" borderRadius="10px" border="1px" borderColor="gray300">
          <Flex w="100%" h="auto" p="12px" justify="space-between" align="center">
            <Flex align="center" gap="12px">
              <Avatar size="sm" src="https://www.makerhero.com/wp-content/uploads/2017/07/1AC01-9-1-min.jpeg"></Avatar>
              <Text color="gray700" fontWeight="500">
                Compra realizada
              </Text>
            </Flex>
            <Flex color="gray500" fontSize="14px">
              19/11/2023
            </Flex>
          </Flex>
          <Divider></Divider>
          <Flex w="100%" h="auto" p="12px" justify="space-between" align="center">
            <Flex align="center" gap="12px">
              <Avatar size="sm" src="https://www.makerhero.com/wp-content/uploads/2017/07/1AC01-9-1-min.jpeg"></Avatar>
              <Text color="gray700" fontWeight="500">
                Compra realizada
              </Text>
            </Flex>
            <Flex color="gray500" fontSize="14px">
              21/10/2023
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    ),
    Membros: (
      <Flex w="100%" h="100%" border="1px" borderColor="gray300" borderRadius="10px" gap="32px" bg="white">
        <Text h="58px" w="100%" align="left" p="20px" fontSize="14px" color="gray600">
          Membros do Grupo
        </Text>
        <Flex></Flex>
      </Flex>
    ),
  };

  return (
    <Flex direction="column" w="100%" h="100%" gap="2rem" overflow="hidden">
      <TabSwitch
        tabs={groupPageViews.map((view) => ({ isSelected: pageView === view, key: view, label: view }))}
        onSwitch={(view) => setPageView(view as any)}
        currentTabColor="primary700"
      />
      {PageViewComponent[pageView]}
    </Flex>
  );
};

export default GroupPage;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const selectedPage = 'project';

  try {
    cookieManager.updateToken(req);

    const user = await validateSession();

    return { props: { selectedPage, pageTitle: 'Projeto', user } };
  } catch (err: any) {
    cookieManager.forceTokenExpires(res);
    logError(selectedPage, err);

    return { redirect: { destination: '/login', permanent: false } };
  }
};
