import { GetServerSideProps } from 'next';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Flex, useDisclosure } from '@chakra-ui/react';
import { FaSave } from 'react-icons/fa';
import { IoMdAdd } from 'react-icons/io';

import { getStockMaker, updateStockMaker } from '@/_base/services/storeMaker';
import { IStockMaker } from '@/_base/interfaces/storeMaker';
import { useAsyncCallback, useCustomToast } from '@/_base/hooks';
import { useSelectedSchool } from '@/components/Page/components/Header';
import { PlusButton } from '@/components/Buttons/Plus';
import { TabSwitch } from '@/components/TabSwitch';
import { StockPageView, stockPageViews } from './interfaces';
import { StockPage } from './components/Stock';
import { ResaleOrders } from './components/ResaleOrders';
import { AnimatePresence } from 'framer-motion';

const Stock: React.FC = () => {
  const [unSavedstock, setUnsavedStock] = useState<IStockMaker[]>([]);
  const [stock, setStock] = useState<IStockMaker[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageView, setPageView] = useState<StockPageView>('Estoque');

  const { isOpen, onOpen, onClose } = useDisclosure();

  const toast = useCustomToast();
  const { school } = useSelectedSchool();

  useEffect(() => {
    (async () => {
      if (!school?.hub_school_id) return;
      setIsLoading(true);
      try {
        const results = await getStockMaker(school.hub_school_id);
        setStock(results);
        setUnsavedStock(results);
      } catch {
        toast({ status: `error`, description: `Não foi possível listar o estoque` });
      } finally {
        setIsLoading(false);
      }
    })();
  }, [school]);

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
