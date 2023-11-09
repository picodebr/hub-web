import { IHubUser } from "../user";

export interface IAuthOutput {
  access_token: string;
  user: IHubUser;
}