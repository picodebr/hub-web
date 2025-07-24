import { GetServerSideProps } from 'next';
import { MdWarning } from 'react-icons/md';
import { Flex, Image, Text } from '@chakra-ui/react';
import { ReactNode, useEffect, useMemo, useState } from 'react';

import { logError, cookieManager, formatCoin } from '@/_base/utils';
import { GroupPageView, groupPageViews } from './interfaces';
import { TabSwitch } from '@/components/TabSwitch';
import { Activities } from './components/Atividades';
import { GroupRequests } from './components/Pedidos';
import { GenericButton } from '@/components/Buttons/Generic';
import { useAsyncCallback, useAuth, useCustomToast } from '@/_base/hooks';
import { Planning } from './components/Planejamentos';
import { Members } from './components/Membros';
import { acceptOrder, rejectOrder, addOrder, getGroupById, updateGroup, listAvailableUsersForGroupByProject } from '@/_base/services/group';
import { IHubGroup, IHubGroupMetadata, IHubGroupOrder, IUpdateHubGroupParams } from '@/_base/interfaces/group';
import { getStockMaker } from '@/_base/services/storeMaker';
import { useSelectedSchool } from '@/components/Page/components/Header';
import { IStockMaker, IStoreMakerResale } from '@/_base/interfaces/storeMaker';
import { IHubUser } from '@/_base/interfaces/user';
import { makeDonation } from '@/_base/services/student/makeDonation';
import { AnimatePresence } from 'framer-motion';
import { ITempFile } from '@/_base/interfaces/shared';
import { getPresignedUrl, uploadFile } from '@/_base/services/upload';

interface IProps {
  group: IHubGroup;
}

const GroupPage: React.FC<IProps> = ({ group: _group }) => {
  const [group, setGroup] = useState<IHubGroup>(_group);
  const [savedGroup, setSavedGroup] = useState<IHubGroup>(_group);
  const [pageView, setPageView] = useState<GroupPageView>('Atividades');
  const [isLoading, setIsLoading] = useState(false);
  const [storeIsOpened, setStoreIsOpened] = useState(false);
  const [cartIsOpened, setCartIsOpened] = useState(false);
  const [stock, setStock] = useState<IStockMaker[]>([]);
  const [availableStudents, setAvailableStudents] = useState<IHubUser[]>([]);
  const [activityFiles, setActivityFiles] = useState<ITempFile[]>([]);

  const toast = useCustomToast();
  const { user, setUser } = useAuth();
  const { school } = useSelectedSchool();

  const canEdit =
    (user.role === `student` || group.project?.user_id === user.id) &&
    (user.role !== `student` || !!group.student_links.find((e) => e.hub_user_id === user.id));

  const needSave = useMemo<boolean>(() => JSON.stringify(group) !== JSON.stringify(savedGroup), [group, savedGroup]);
  const { groupAssets, groupBalance } = useMemo(() => {
    const groupAssets = group.orders
      .filter((o) => !!o.approved_at)
      .flatMap((e) => e.items.map((i) => ({ ...e, ...i, ...i.store_item })))
      .reduce((acc, v) => (acc += v.quantity * Number(v.price)), 0);

    const groupBalance = group.students.reduce((acc, v) => (acc += Number(v.metadata.coins)), 0);
    return { groupAssets, groupBalance };
  }, [group]);

  useEffect(() => {
    if (!school) return;
    (async () => {
      setIsLoading(true);
      try {
        const results = await getStockMaker(school?.hub_school_id || ``);
        setStock(results.filter((e) => e.quantity));
      } finally {
        setIsLoading(false);
      }
    })();
  }, [school]);

  const handleSaveGroup = useAsyncCallback(
    async (metadata: IHubGroupMetadata, showToast = true) => {
      setIsLoading(true);

      if (activityFiles.length) {
        for (const { path, file } of activityFiles) {
          if (!metadata.annotation?.includes(path)) return;
          const response = await getPresignedUrl(file.type, 'groups', `public-read`);
          await uploadFile(response.link, file);
          metadata.annotation = metadata.annotation.replaceAll(path, `https://hub-files-hml.s3.amazonaws.com/${response.path}`);
        }

        setActivityFiles([]);
      }

      const updatedGroup = await updateGroup({ id: group.id, metadata });
      showToast && toast({ status: 'success', description: 'Atualizado com sucesso!' });

      setGroup((g) => ({ ...g, ...updatedGroup, orders: g.orders }));
      setSavedGroup((g) => ({ ...g, ...updatedGroup, orders: g.orders }));
    },
    [activityFiles],
    false,
    () => {
      setIsLoading(false);
    },
  );

  const handleRefreshStock = useAsyncCallback(async () => {
    const [results, updatedGroup] = await Promise.all([getStockMaker(school?.hub_school_id || ``), getGroupById(group.id)]);

    setStock(results.filter((e) => e.quantity));
    setGroup(updatedGroup);
    setSavedGroup(updatedGroup);
  }, [school]);

  const handleFinishOrder = useAsyncCallback(async (items: { id: string; quantity: number }[]) => {
    const updatedGroup = await addOrder({ group_id: group.id, items });

    setGroup((e) => ({ ...e, ...updatedGroup }));
    setSavedGroup((e) => ({ ...e, ...updatedGroup }));
    cookieManager.setCookie(`cart:${group.id}`, JSON.stringify([]));
  }, []);

  const handleFinishResaleOrder = useAsyncCallback(async (items: IStoreMakerResale[]) => {
    const updatedGroup = await addOrder({
      group_id: group.id,
      items: items.map((e) => ({ id: e.store_maker_item_id, quantity: e.quantity, hub_store_maker_resale_id: e.id })),
      is_resale: true,
    });

    setGroup((e) => ({ ...e, ...updatedGroup }));
    setSavedGroup((e) => ({ ...e, ...updatedGroup }));
    cookieManager.setCookie(`resale:${group.id}`, JSON.stringify([]));
  }, []);

  const handleApproveOrder = useAsyncCallback(async (order: IHubGroupOrder) => {
    await acceptOrder({ order_id: order.id, group_id: group.id });

    setGroup((e) => {
      e.orders = e.orders.map((o) => (o.id === order.id ? { ...o, approved_at: new Date().toISOString(), approved_by: user.id } : o));
      setSavedGroup(e);

      return e;
    });
  }, []);

  const handleRejectOrder = useAsyncCallback(async (order: IHubGroupOrder) => {
    await rejectOrder({ order_id: order.id, group_id: group.id });

    setGroup((e) => {
      e.orders = e.orders.map((o) => (o.id === order.id ? { ...o, metadata: { denied_at: new Date().toISOString() } } : o));
      setSavedGroup(e);

      return e;
    });
  }, []);

  const handleMakeStudentDonation = useAsyncCallback(
    async (data: { student: IHubUser | null; donation: string }) => {
      if (!data.student) return;
      setIsLoading(true);
      await makeDonation(data.student.id, Number(data.donation));

      const updatedGroup = {
        ...group,
        students: group.students.map((student) => ({
          ...student,
          metadata: {
            ...student.metadata,
            coins:
              student.id === data.student?.id
                ? (student.metadata.coins || 0) + Number(data.donation)
                : student.id === user.id
                ? (student.metadata.coins || 0) - Number(data.donation)
                : student.metadata.coins,
          },
        })),
      };
      setGroup(updatedGroup);
      setSavedGroup(updatedGroup);
      setUser({ ...user, metadata: { ...user.metadata, coins: (user.metadata.coins || 0) - Number(data.donation) } });

      toast({ status: 'success', description: 'Doação enviada com sucesso!' });
    },
    [],
    true,
    () => {
      setIsLoading(false);
    },
  );

  const handleUpdateGroup = useAsyncCallback(async (params: IUpdateHubGroupParams) => {
    await updateGroup({ display_name: params.display_name, users: params.users, id: group.id });
    setGroup((e) => ({
      ...e,
      display_name: params.display_name || e.display_name,
      students: removeDuplicateStudents([...availableStudents, ...group.students]).filter((e) => params.users?.includes(e.id)),
    }));
    setSavedGroup((e) => ({
      ...e,
      display_name: params.display_name || e.display_name,
      students: removeDuplicateStudents([...availableStudents, ...group.students]).filter((e) => params.users?.includes(e.id)),
    }));
    setAvailableStudents(() => removeDuplicateStudents([...availableStudents, ...group.students]).filter((e) => !params.users?.includes(e.id)));
    toast({ status: `success`, description: `Grupo atualizado` });
  }, []);

  const loadAvailableStudents = useAsyncCallback(async () => {
    const students = await listAvailableUsersForGroupByProject(group.project?.id || ``);
    setAvailableStudents(
      students.reduce((acc, v) => {
        const target = group.students.find((e) => e.id === v.id);
        if (!target) acc.push(v);
        return acc;
      }, [] as IHubUser[]),
    );
  }, []);

  useEffect(() => {
    loadAvailableStudents();
  }, []);
  const PageViewComponent: Record<GroupPageView, ReactNode> = {
    Atividades: <Activities group={group} setGroup={setGroup} canEdit={canEdit} setActivityFiles={setActivityFiles} />,
    Planejamentos: <Planning group={group} setGroup={setGroup} canEdit={canEdit} />,
    'Loja Online': (
      <GroupRequests
        handleFinishOrder={handleFinishOrder}
        handleFinishResaleOrder={handleFinishResaleOrder}
        handleSave={handleSaveGroup}
        group={group}
        handleApproveOrder={handleApproveOrder}
        handleRejectOrder={handleRejectOrder}
        canEdit={canEdit}
        setStoreIsOpened={setStoreIsOpened}
        cartIsOpened={cartIsOpened}
        storeMakerList={stock}
        refreshStock={handleRefreshStock}
      />
    ),
    Membros: (
      <Members
        group={group}
        onDonation={(data) => handleMakeStudentDonation(data)}
        user={user}
        onUpdateGroup={handleUpdateGroup}
        availableStudents={availableStudents}
      />
    ),
  };

  return (
    <Flex direction="column" w="100%" h="100%" gap="1.5rem" overflow="hidden" mb="-1rem" pb="1rem">
      <Flex justify="space-between" gap="1rem" align="center">
        <TabSwitch
          tabs={groupPageViews.map((view) => ({ isSelected: pageView === view, key: view, label: view }))}
          onSwitch={(view) => setPageView(view as any)}
          currentTabColor="primary700"
        />
        <Flex gap="1rem" align="center">
          <Flex gap="2rem" align="center" bg="#fff" borderRadius="md" p="0.5rem">
            <Flex direction="column" gap="0.25rem" justify="space-between">
              <Text textAlign="right" fontSize="15px" color="gray600">
                Saldo do grupo
              </Text>
              <Flex align="center" gap="0.5rem" flex="1" justify="space-between">
                <Image src="/icons/coin.svg" />
                <Text whiteSpace="nowrap" fontWeight="400" fontSize="20px" color="gray500">
                  {formatCoin(groupBalance || 0)}
                </Text>
              </Flex>
            </Flex>
            <Flex direction="column" gap="0.25rem">
              <Text textAlign="right" fontSize="15px" color="gray600">
                Patrimônio do grupo
              </Text>
              <Flex align="center" gap="0.875rem" flex="1" position="relative" justify="space-between">
                <Image w="1.2rem" src="/icons/coin.svg" zIndex="5" />
                <Image w="1.2rem" src="/icons/coin.svg" position="absolute" left="-0.5rem" bottom="-0.1rem" zIndex="4" />
                <Image w="1.2rem" src="/icons/coin.svg" position="absolute" left="0.5rem" bottom="-0.1rem" zIndex="4" />
                <Text whiteSpace="nowrap" fontWeight="400" fontSize="20px" color="gray500">
                  {formatCoin(groupAssets || 0)}
                </Text>
              </Flex>
            </Flex>
          </Flex>

          <GenericButton
            label={pageView === `Loja Online` && storeIsOpened ? `Ver carrinho` : 'Salvar'}
            onClick={() => (pageView === `Loja Online` && storeIsOpened ? setCartIsOpened((e) => !e) : handleSaveGroup(group.metadata))}
            border="1px"
            borderColor="gray300"
            isLoading={isLoading}
            bg={needSave ? 'primary500' : 'primary700'}
            color="white"
            
            minW="7rem"
            isDisabled={!canEdit || user.role !== `student`}
            _hover={{ filter: 'brightness(0.9)' }}
            rightIcon={needSave ? <MdWarning /> : undefined}
          />
        </Flex>
      </Flex>
      <AnimatePresence mode="wait">{PageViewComponent[pageView]}</AnimatePresence>
    </Flex>
  );
};

export default GroupPage;

const removeDuplicateStudents = (students: IHubUser[]): IHubUser[] => {
  return students.reduce((acc, v) => {
    const target = acc.find((e) => e.id === v.id);
    if (!target) acc.push(v);
    return acc;
  }, [] as IHubUser[]);
};

export const getServerSideProps: GetServerSideProps = async ({ req, res, query }) => {
  const selectedPage = 'groups';

  try {
    cookieManager.updateToken(req);

    // TODO: add in use effect
    const group = await getGroupById(`${query.group_id}`);

    return { props: { selectedPage, pageTitle: group.display_name, group, headerLabel: `Projeto ${group.project?.title} | ${group.display_name}` } };
  } catch (err: any) {
    cookieManager.forceTokenExpires(res);
    logError(selectedPage, err);

    return { redirect: { destination: '/login', permanent: false } };
  }
};
