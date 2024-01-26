export interface IHubGroupOrder {
  id: string;
  items: IHubGroupOrderItem[];
  created_at?: Date;
  approved_at?: Date | null;
  approved_by?: string | null;
}

export interface IHubGroupOrderItem {
  id: string;
  name: string;
  description: string;
  image: string;
  price: string;
  quantity: number;
}
