import { GetServerSideProps } from 'next';
import { MdWarning } from 'react-icons/md';
import { Flex } from '@chakra-ui/react';
import { ReactNode, useMemo, useState } from 'react';

import { logError, cookieManager } from '@/_base/utils';
import { ProjectPageView, projectPageViews } from './interfaces';
import { TabSwitch } from '@/components/TabSwitch';
import { Activities } from './components/Atividades/index.page';
import { GroupRequests } from './components/Pedidos/index.page';
import { Planning } from './components/Planejamentos/index.page';
import { Members } from './components/Membros/index.page';
import { GenericButton } from '@/components/Buttons/Generic';
import { useAsyncCallback, useCustomToast } from '@/_base/hooks';

interface IProps {}

const GroupPage: React.FC<IProps> = () => {
  const [pageView, setPageView] = useState<ProjectPageView>('Atividades');

  const toast = useCustomToast();

  const needSave = useMemo<boolean>(() => false, []);

  const handleSave = useAsyncCallback(async () => {
    toast({ status: 'success', description: 'Grupo salvo' });
  }, []);

  const PageViewComponent: Record<ProjectPageView, ReactNode> = {
    Atividades: <Activities />,
    Planejamentos: <Planning />,
    Pedidos: <GroupRequests />,
    Membros: <Members />,
  };

  return (
    <Flex direction="column" w="100%" h="100%" gap="2rem" overflow="hidden">
      <Flex justify="space-between">
        <TabSwitch
          tabs={projectPageViews.map((view) => ({ isSelected: pageView === view, key: view, label: view }))}
          onSwitch={(view) => setPageView(view as any)}
          currentTabColor="primary700"
        />

        <GenericButton
          label="Salvar"
          onClick={handleSave}
          border="1px"
          borderColor="gray300"
          bg={needSave ? 'primary500' : 'primary700'}
          color="white"
          boxShadow="sm"
          _hover={{ filter: 'brightness(0.9)' }}
          rightIcon={needSave ? <MdWarning /> : undefined}
        />
      </Flex>
      {PageViewComponent[pageView]}
    </Flex>
  );
};

export default GroupPage;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const selectedPage = 'groups';

  try {
    cookieManager.updateToken(req);

    return { props: { selectedPage, pageTitle: `Grupo tal` } };
  } catch (err: any) {
    cookieManager.forceTokenExpires(res);
    logError(selectedPage, err);

    return { redirect: { destination: '/login', permanent: false } };
  }
};
