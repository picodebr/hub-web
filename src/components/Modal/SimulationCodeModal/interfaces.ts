import { IHubUser } from '@/_base/interfaces/user';

export interface ISimulationCodeData {
  code: string;
  name: string;
  email: string;
}

export interface ISimulationCodeModal {
  show: boolean;
  onClose: (updatedUser: IHubUser | null) => void;
}
