import { IAddress } from '../address';
import { IContact } from '../contact';

export interface IAgency {
  id: string;
  readable_id: string;
  name: string;
  description?: string;
  contacts: IContact[];
  address: IAddress;
  created_at: string;
  updated_at: string;
}
