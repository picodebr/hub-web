import { IStoreMakerItem } from './IStoreMakerItem';

export interface IStockMaker {
  id: string;
  hub_school_id: string;
  store_maker_item_id: string;
  quantity: number;
  store_item: IStoreMakerItem;
  updated_at: string;
}
