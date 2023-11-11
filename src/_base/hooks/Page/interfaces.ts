import { HubPermissions } from "@/_base/interfaces/permissions";
import { IHubUser } from "@/_base/interfaces/user";

export interface IPageProps {
  user?: IHubUser;
  selectedPage?: string;
  pageTitle?: string;
}

export interface IPageContext {
  user: IHubUser;
  setUser: React.Dispatch<React.SetStateAction<IHubUser>>;
  permissions: HubPermissions;
}
