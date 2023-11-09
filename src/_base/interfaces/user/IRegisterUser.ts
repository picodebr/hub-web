import { HubPermissions } from "../permissions";
import { HubUserRole } from "./HubUserRole";
import { HubUserType } from "./HubUserType";

export default interface IRegisterUser {
  hub_class_id?: string | null;
  name: string;
  email: string;
  username: string;
  password: string;
  role: HubUserRole;
  permissions?: HubPermissions;
  user_type: HubUserType;
}
