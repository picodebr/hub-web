import { Button, Flex, Text } from '@chakra-ui/react';
import { GetServerSideProps } from 'next';
import { MdWarning } from 'react-icons/md';
import { ReactNode, useMemo, useState } from 'react';

import { logError, cookieManager } from '@/_base/utils';
import { PlanningPageView, planningPageViews } from './components/interfaces';
import { TabSwitch } from '@/components/TabSwitch';
import { GenericButton } from '@/components/Buttons/Generic';
import { useAsyncCallback, useCustomToast } from '@/_base/hooks';
import { Kanban } from './components/Kanban/index.page';
import { Gantt } from './components/Gantt/index.page';
import { Bill } from './components/Bill/index.page';

interface IProps {}

const Planning: React.FC<IProps> = () => {
  const [pageView, setPageView] = useState<PlanningPageView>('Planejamentos');

  const toast = useCustomToast();

  const needSave = useMemo<boolean>(() => false, []);

  const handleSave = useAsyncCallback(async () => {
    toast({ status: 'success', description: 'Grupo salvo' });
  }, []);

  const PageViewComponent: Record<PlanningPageView, ReactNode> = {
    Planejamentos: <Planning />,
    Kanban: <Kanban />,
    GráficodeGantt: <Gantt />,
    Orçamentos: <Bill />,
  };
  return (
    <Flex w="100%" h="100%">
      <Flex w="100%" h="400px" bg="white" border="1px" borderColor="gray300" borderRadius="10px" padding="20px" gap="50px">
        <Text>Bem vindo(a) aos planejamentos</Text>
        <TabSwitch
          tabs={planningPageViews.map((view) => ({ isSelected: pageView === view, key: view, label: view }))}
          onSwitch={(view) => setPageView(view as any)}
          currentTabColor="primary700"
        />
      </Flex>
    </Flex>
  );
};

export default Planning;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const selectedPage = 'groups/planning';

  try {
    cookieManager.updateToken(req);

    return { props: { selectedPage, pageTitle: `Meus planejamentos` } };
  } catch (err: any) {
    cookieManager.forceTokenExpires(res);
    logError(selectedPage, err);

    return { redirect: { destination: '/login', permanent: false } };
  }
};
