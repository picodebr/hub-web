import { IStoreMakerItem } from './IStoreMakerItem';
import { IStoreMakerSchoolMetadata } from './IStoreMakerSchoolMetadata';

export interface IStockMaker {
  id: string;
  hub_school_id: string;
  store_maker_item_id?: string;
  hub_user_id?: string;
  metadata: IStoreMakerSchoolMetadata;
  quantity: number;
  store_item: IStoreMakerItem;
  updated_at: string;
}
