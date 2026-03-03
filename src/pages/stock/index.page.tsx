import { GetServerSideProps } from 'next';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { Flex, useDisclosure } from '@chakra-ui/react';
import { FaSave } from 'react-icons/fa';
import { IoMdAdd } from 'react-icons/io';

import { getStockMaker, updateStockMaker } from '@/_base/services/storeMaker';
import { IStockMaker } from '@/_base/interfaces/storeMaker';
import { useAsyncCallback, useAuth, useCustomToast } from '@/_base/hooks';
import { useSelectedSchool } from '@/components/Page/components/Header';
import { PlusButton } from '@/components/Buttons/Plus';
import { TabSwitch } from '@/components/TabSwitch';
import { StockPageView, stockPageViews } from './interfaces';
import { StockPage } from './components/Stock';
import { ResaleOrders } from './components/ResaleOrders';
import { AnimatePresence } from 'framer-motion';
import { Reserves } from './components/Reserves';
import { IHubGroup, IHubGroupOrder } from '@/_base/interfaces/group';
import { acceptOrder, listTeacherGroups, rejectOrder, updateOrderStatus } from '@/_base/services/group';
import { Orders } from '../groups/[group_id]/components/Pedidos/components/Orders';

const Stock: React.FC = () => {
  const [unSavedstock, setUnsavedStock] = useState<IStockMaker[]>([]);
  const [stock, setStock] = useState<IStockMaker[]>([]);
  const [groups, setGroups] = useState<IHubGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageView, setPageView] = useState<StockPageView>('Estoque');

  const { isOpen, onOpen, onClose } = useDisclosure();

  const toast = useCustomToast();
  const { school } = useSelectedSchool();
  const { user } = useAuth();

  const loadData = useCallback(async () => {
    const schoolId = school?.hub_school_id || user.chosen_school_id;
    if (!schoolId) return;
    setIsLoading(true);
    try {
      const [results, teacherGroups] = await Promise.all([getStockMaker(schoolId), listTeacherGroups(schoolId)]);
      setGroups(teacherGroups);
      setStock(results);
      setUnsavedStock(results);
    } catch {
      toast({ status: `error`, description: `Não foi possível listar o estoque` });
    } finally {
      setIsLoading(false);
    }
  }, [school, user]);

  useEffect(() => {
    loadData();
  }, [school, user]);

  const needSave = useMemo(() => JSON.stringify(unSavedstock) !== JSON.stringify(stock), [unSavedstock, stock]);

  const handleSave = useAsyncCallback(
    async () => {
      setIsLoading(true);
      await updateStockMaker({ items: stock.map((s) => ({ id: s.id, quantity: s.quantity })) });
      setUnsavedStock(stock);
    },
    [stock],
    true,
    () => setIsLoading(false),
  );

  const handleChangeStatus = useAsyncCallback(async (order: IHubGroupOrder) => {
    await updateOrderStatus({ order_id: order.id, status: order.metadata.status || `in_separation` });

    setGroups((e) => {
      e.forEach((group) => {
        if (order.hub_group_id === group.id) group.orders = group.orders.map((o) => (o.id === order.id ? order : o));
      });
      return e;
    });
  }, []);

  const handleApproveOrder = useAsyncCallback(async (order: IHubGroupOrder) => {
    await acceptOrder({ order_id: order.id, group_id: order.hub_group_id });

    setGroups((e) => {
      e.forEach((group) => {
        if (order.hub_group_id === group.id) group.orders = group.orders.map((o) => (o.id === order.id ? order : o));
      });
      return e;
    });
  }, []);

  const handleRejectOrder = useAsyncCallback(async (order: IHubGroupOrder) => {
    await rejectOrder({ order_id: order.id, group_id: order.hub_group_id });

    setGroups((e) => {
      e.forEach((group) => {
        if (order.hub_group_id === group.id) group.orders = group.orders.map((o) => (o.id === order.id ? order : o));
      });
      return e;
    });
  }, []);

  const PageViewComponent: Record<StockPageView, ReactNode> = {
    Estoque: (
      <StockPage
        isLoading={isLoading}
        stock={stock}
        setStock={setStock}
        setUnsavedStock={setUnsavedStock}
        setIsLoading={setIsLoading}
        onCloseModal={onClose}
        modalIsOpen={isOpen}
      />
    ),
    'Solicitações de revenda': <ResaleOrders />,
    Reservas: <Reserves groups={groups} refreshStock={loadData} />,
    Pedidos: <Orders groups={groups} onApproveOrder={handleApproveOrder} onRejectOrder={handleRejectOrder} onChangeStatus={handleChangeStatus} />,
  };

  return (
    <Flex direction="column" flex="1" overflow="hidden" gap="1rem" userSelect="none">
      <Flex w="100%" justify="space-between" gap="1rem">
        <TabSwitch
          tabs={stockPageViews.map((view) => ({ isSelected: pageView === view, key: view, label: view }))}
          onSwitch={(view) => setPageView(view as any)}
          currentTabColor="primary700"
        />
        {pageView === `Estoque` && (
          <Flex align="center" gap="1rem">
            <PlusButton label="Adicionar Item" rightIcon={<IoMdAdd />} alignSelf="flex-end" onClick={onOpen} isLoading={isLoading} />
            <PlusButton label="Salvar" rightIcon={<FaSave />} alignSelf="flex-end" warning={needSave} onClick={handleSave} isLoading={isLoading} />
          </Flex>
        )}
      </Flex>
      <AnimatePresence mode="wait">{PageViewComponent[pageView]}</AnimatePresence>
    </Flex>
  );
};

export default Stock;
export const getServerSideProps: GetServerSideProps = async () => {
  const selectedPage = 'stock';

  return { props: { selectedPage, pageTitle: 'Estoque', showBackButton: false } };
};
