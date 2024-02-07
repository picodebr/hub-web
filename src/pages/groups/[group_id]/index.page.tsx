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
import { useAsyncCallback, useAuth, useCustomToast } from '@/_base/hooks';
import { Planning } from './components/Planejamentos';
import { Members } from './components/Membros';
import { addOrder, getGroupById, updateGroup } from '@/_base/services/group';
import { IHubGroup, IHubGroupMetadata, IHubGroupOrder, IHubGroupOrderItem } from '@/_base/interfaces/group';
import { acceptOrder } from '@/_base/services/group/acceptOrder';

interface IProps {
  group: IHubGroup;
}

const GroupPage: React.FC<IProps> = ({ group: _group }) => {
  const [group, setGroup] = useState<IHubGroup>(_group);
  const [savedGroup, setSavedGroup] = useState<IHubGroup>(_group);
  const [pageView, setPageView] = useState<ProjectPageView>('Atividades');
  const [isLoading, setIsLoading] = useState(false);

  const toast = useCustomToast();
  const { user } = useAuth();

  const canEdit = user.role === `student` && !!group.student_links.find((e) => e.hub_user_id === user.id);
  const needSave = useMemo<boolean>(() => JSON.stringify(group) !== JSON.stringify(savedGroup), [group, savedGroup]);

  const handleSaveGroup = useAsyncCallback(
    async (metadata: IHubGroupMetadata, showToast = true) => {
      setIsLoading(true);
      const updatedGroup = await updateGroup({ id: group.id, metadata });
      showToast && toast({ status: 'success', description: 'Atualizado com sucesso!' });

      setGroup((g) => ({ ...g, ...updatedGroup }));
      setSavedGroup((g) => ({ ...g, ...updatedGroup }));
    },
    [],
    false,
    () => {
      setIsLoading(false);
    },
  );

  const handleFinishOrder = useAsyncCallback(async (metadata: IHubGroupOrderItem[]) => {
    const data = await addOrder({ group_id: group.id, metadata });

    setGroup((e) => ({ ...e, student_links: data.student_links }));
    setSavedGroup((e) => ({ ...e, student_links: data.student_links }));
  }, []);

  const handleApproveOrder = useAsyncCallback(async (order: IHubGroupOrder) => {
    await acceptOrder({ order_id: order.id, group_id: group.id });
    setGroup((e) => {
      const res = {
        ...e,
        student_links: e.student_links.map((s) => ({
          ...s,
          metadata: { orders: s.metadata.orders?.map((o) => (o.id === order.id ? { ...o, approved_at: new Date() } : o)) || [] },
        })),
      };

      setSavedGroup(res);

      return res;
    });
  }, []);

  const PageViewComponent: Record<ProjectPageView, ReactNode> = {
    Atividades: <Activities group={group} setGroup={setGroup} canEdit={canEdit} />,
    Planejamentos: <Planning group={group} setGroup={setGroup} canEdit={canEdit} />,
    Pedidos: (
      <GroupRequests
        handleFinishOrder={handleFinishOrder}
        handleSave={handleSaveGroup}
        group={group}
        handleApproveOrder={handleApproveOrder}
        canEdit={canEdit}
      />
    ),
    Membros: <Members group={group} />,
  };

  return (
    <Flex direction="column" w="100%" h="100%" gap="1.5rem" overflow="hidden" mb="-1rem" pb="1rem">
      <Flex justify="space-between">
        <TabSwitch
          tabs={projectPageViews.map((view) => ({ isSelected: pageView === view, key: view, label: view }))}
          onSwitch={(view) => setPageView(view as any)}
          currentTabColor="primary700"
        />

        <GenericButton
          label="Salvar"
          onClick={() => handleSaveGroup(group.metadata)}
          border="1px"
          borderColor="gray300"
          isLoading={isLoading}
          bg={needSave ? 'primary500' : 'primary700'}
          color="white"
          boxShadow="sm"
          isDisabled={!canEdit}
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
