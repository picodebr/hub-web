import { GetServerSideProps } from 'next';
import { MdWarning } from 'react-icons/md';
import { Flex } from '@chakra-ui/react';
import { ReactNode, useMemo, useState } from 'react';

import { logError, cookieManager } from '@/_base/utils';
import { ProjectPageView, projectPageViews } from './interfaces';
import { TabSwitch } from '@/components/TabSwitch';
import { Activities } from './components/Atividades';
import { GroupRequests } from './components/Pedidos';
import { GenericButton } from '@/components/Buttons/Generic';
import { useAsyncCallback, useCustomToast } from '@/_base/hooks';
import { Planning } from './components/Planejamentos';
import { Members } from './components/Membros';
import { getGroupById } from '@/_base/services/group';
import { IHubGroup } from '@/_base/interfaces/group';

interface IProps {
  group: IHubGroup;
}

const GroupPage: React.FC<IProps> = ({ group }) => {
  const [pageView, setPageView] = useState<ProjectPageView>('Atividades');

  const toast = useCustomToast();

  const needSave = useMemo<boolean>(() => false, []);

  const handleSave = useAsyncCallback(async () => {
    toast({ status: 'success', description: 'Grupo salvo' });
  }, []);

  const PageViewComponent: Record<ProjectPageView, ReactNode> = {
    Atividades: <Activities group={group} />,
    Planejamentos: <Planning />,
    Pedidos: <GroupRequests />,
    Membros: <Members group={group} />,
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

export const getServerSideProps: GetServerSideProps = async ({ req, res, query }) => {
  const selectedPage = 'groups';

  try {
    cookieManager.updateToken(req);

    const group = await getGroupById(`${query.group_id}`);

    return { props: { selectedPage, pageTitle: group.display_name, group } };
  } catch (err: any) {
    cookieManager.forceTokenExpires(res);
    logError(selectedPage, err);

    return { redirect: { destination: '/login', permanent: false } };
  }
};
