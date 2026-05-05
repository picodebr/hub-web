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
import { useAuth } from '@/_base/hooks';

interface IProps {
  handleSave: (metadata: IHubGroupMetadata) => void;
  handleFinishOrder: (data: { id: string; quantity: number }[]) => void;
  handleFinishResaleOrder: (data: IStoreMakerResale[]) => void;
  handleApproveOrder: (data: IHubGroupOrder) => void;
  handleRejectOrder: (data: IHubGroupOrder) => void;
  handleChangeStatus: (data: IHubGroupOrder) => void;
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
  handleChangeStatus,
  group,
  canEdit,
  storeMakerList,
  handleRejectOrder,
  setStoreIsOpened,
  cartIsOpened,
  refreshStock,
}) => {
  const [pageView, setPageView] = useState<GroupOrdersPageView>(`Pedidos`);

  const { user } = useAuth();

  useEffect(() => {
    setStoreIsOpened([`Loja PiCode`, `Marketplace`].includes(pageView));
  }, [pageView]);

  const Views: Record<GroupOrdersPageView, React.ReactElement> = {
    Pedidos: <Orders groups={[group]} onApproveOrder={handleApproveOrder} onRejectOrder={handleRejectOrder} onChangeStatus={handleChangeStatus} />,
    'Loja PiCode': (
      <Store
        onChangeView={setPageView}
        group={group}
        onFinishOrder={handleFinishOrder}
        canEdit={canEdit}
        user={user}
        storeMakerList={storeMakerList}
        cartIsOpened={cartIsOpened}
      />
    ),
    Marketplace: (
      <Resale onChangeView={setPageView} group={group} onFinishResaleOrder={handleFinishResaleOrder} canEdit={canEdit} cartIsOpened={cartIsOpened} />
    ),
    'Itens do grupo': <GroupItems group={group} refreshStock={refreshStock} />,
  };
  return (
    <Flex direction="column" gap="1rem" overflow="hidden" h="100%">
      <Flex align="center" justify="space-between" h="fit-content">
        <Tabs bg="#fff" borderColor="primary200" borderRadius="md">
          <TabList>
            {groupOrdersPageViews.map((v) => (
              <Tab isDisabled={!canEdit} key={v} onClick={() => setPageView(v)} borderRadius="none">
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
