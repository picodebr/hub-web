import { IHubUser } from '@/_base/interfaces/user';

export interface IPageProps {
  user?: IHubUser;
  selectedPage?: string;
  pageTitle?: string;
  headerLabel?: string;
  showBackButton?: boolean;
  backButtonPath?: string;
  isOpen: boolean;
  stopTour: () => void;
}
