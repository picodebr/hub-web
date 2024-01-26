import { useState } from 'react';
import { Orders } from './components/Orders';
import { Store } from './components/Store';
import { IHubGroup, IHubGroupMetadata, IHubGroupOrder, IHubGroupOrderItem } from '@/_base/interfaces/group';

interface IProps {
  handleSave: (metadata: IHubGroupMetadata) => void;
  handleFinishOrder: (data: IHubGroupOrderItem[]) => void;
  handleApproveOrder: (data: IHubGroupOrder) => void;
  group: IHubGroup;
}

export type OrdersPageView = `orders` | `store`;

export const GroupRequests: React.FC<IProps> = ({ handleFinishOrder, handleApproveOrder, group }) => {
  const [pageView, setPageView] = useState<OrdersPageView>(`orders`);

  const Views: Record<OrdersPageView, React.ReactElement> = {
    orders: <Orders onChangeView={setPageView} group={group} onApproveOrder={handleApproveOrder} />,
    store: <Store onChangeView={setPageView} onFinishOrder={handleFinishOrder} />,
  };
  return Views[pageView];
};
