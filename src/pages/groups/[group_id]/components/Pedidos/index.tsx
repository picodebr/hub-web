import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Orders } from './components/Orders';
import { Store } from './components/Store';
import { IHubGroup, IHubGroupMetadata, IHubGroupOrder } from '@/_base/interfaces/group';
import { IStockMaker } from '@/_base/interfaces/storeMaker';

interface IProps {
  handleSave: (metadata: IHubGroupMetadata) => void;
  handleFinishOrder: (data: { id: string; quantity: number }[]) => void;
  handleApproveOrder: (data: IHubGroupOrder) => void;
  handleRejectOrder: (data: IHubGroupOrder) => void;
  canEdit: boolean;
  group: IHubGroup;
  storeMakerList: IStockMaker[];
  cartIsOpened: boolean;
  setStoreIsOpened: Dispatch<SetStateAction<boolean>>;
}

export type OrdersPageView = `orders` | `store`;

export const GroupRequests: React.FC<IProps> = ({
  handleFinishOrder,
  handleApproveOrder,
  group,
  canEdit,
  storeMakerList,
  handleRejectOrder,
  setStoreIsOpened,
  cartIsOpened,
}) => {
  const [pageView, setPageView] = useState<OrdersPageView>(`orders`);

  useEffect(() => {
    setStoreIsOpened(pageView === `store`);
  }, [pageView]);

  const Views: Record<OrdersPageView, React.ReactElement> = {
    orders: (
      <Orders onChangeView={setPageView} group={group} onApproveOrder={handleApproveOrder} onRejectOrder={handleRejectOrder} canEdit={canEdit} />
    ),
    store: (
      <Store
        onChangeView={setPageView}
        group={group}
        onFinishOrder={handleFinishOrder}
        canEdit={canEdit}
        storeMakerList={storeMakerList}
        cartIsOpened={cartIsOpened}
      />
    ),
  };
  return Views[pageView];
};
