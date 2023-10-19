import { IAdmin } from '@/_base/interfaces/admin';
import { IPermissionsPerModule } from '@/_base/interfaces/permissions';

export interface IPageProps {
  admin?: IAdmin;
  selectedPage?: string;
  pageTitle?: string;
}

export interface IPageContext {
  admin: IAdmin;
  setAdmin: React.Dispatch<React.SetStateAction<IAdmin>>;
  permissions: IPermissionsPerModule;
}
