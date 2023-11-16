import { HubUserType } from './HubUserType';

export default interface IRegisterUser {
  primary_code: string;
  name: string;
  email: string;
  username: string;
  password: string;
  password_confirmation: string;
  birthdate: Date;
  user_type: HubUserType;
}
