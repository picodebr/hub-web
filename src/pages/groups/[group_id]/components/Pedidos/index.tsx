import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Orders } from './components/Orders';
import { Store } from './components/Store';
import { IHubGroup, IHubGroupMetadata, IHubGroupOrder } from '@/_base/interfaces/group';
import { IStockMaker, IStoreMakerResale } from '@/_base/interfaces/storeMaker';
import { AnimatePresence } from 'framer-motion';
import { Flex, Tab, TabList, Tabs } from '@chakra-ui/react';
import { GroupOrdersPageView, groupOrdersPageViews } from '../../interfaces';
import { Resale } from './components/Resale';
import { GroupItems } from './components/GroupItems';

interface IProps {
  handleSave: (metadata: IHubGroupMetadata) => void;
  handleFinishOrder: (data: { id: string; quantity: number }[]) => void;
  handleFinishResaleOrder: (data: IStoreMakerResale[]) => void;
  handleApproveOrder: (data: IHubGroupOrder) => void;
  handleRejectOrder: (data: IHubGroupOrder) => void;
  refreshStock: () => void;
  canEdit: boolean;
  group: IHubGroup;
  storeMakerList: IStockMaker[];
  cartIsOpened: boolean;
  setStoreIsOpened: Dispatch<SetStateAction<boolean>>;
}

export const GroupRequests: React.FC<IProps> = ({
  handleFinishOrder,
  handleFinishResaleOrder,
  handleApproveOrder,
  group,
  canEdit,
  storeMakerList,
  handleRejectOrder,
  setStoreIsOpened,
  cartIsOpened,
  refreshStock,
}) => {
  const [pageView, setPageView] = useState<GroupOrdersPageView>(`Pedidos`);

  useEffect(() => {
    setStoreIsOpened([`Loja PiCode`, `Marketplace`].includes(pageView));
  }, [pageView]);

  const Views: Record<GroupOrdersPageView, React.ReactElement> = {
    Pedidos: <Orders group={group} onApproveOrder={handleApproveOrder} onRejectOrder={handleRejectOrder} />,
    'Loja PiCode': (
      <Store
        onChangeView={setPageView}
        group={group}
        onFinishOrder={handleFinishOrder}
        canEdit={canEdit}
        storeMakerList={storeMakerList}
        cartIsOpened={cartIsOpened}
      />
    ),
    Marketplace: (
      <Resale onChangeView={setPageView} group={group} onFinishResaleOrder={handleFinishResaleOrder} canEdit={canEdit} cartIsOpened={cartIsOpened} />
    ),
    'Items do grupo': <GroupItems group={group} refreshStock={refreshStock} />,
  };
  return (
    <Flex direction="column" gap="1rem" overflow="hidden" h="100%">
      <Flex align="center" justify="space-between" h="fit-content">
        <Tabs bg="#fff" borderColor="primary200" borderRadius="md">
          <TabList>
            {groupOrdersPageViews.map((v) => (
              <Tab isDisabled={!canEdit} key={v} onClick={() => setPageView(v)}>
                {v}
              </Tab>
            ))}
          </TabList>
        </Tabs>
      </Flex>
      <AnimatePresence mode="wait">{Views[pageView]}</AnimatePresence>
    </Flex>
  );
};
