import { HubUserType } from './HubUserType';

export default interface IRegisterUser {
  primary_code: string;
  name: string;
  email: string;
  username: string;
  password: string;
  password_confirmation: string;
  birthdate: string;
  user_type: HubUserType;
}

export const EMPTY_REGISTER_USER_DATA: IRegisterUser = {
  primary_code: '',
  name: '',
  email: '',
  username: '',
  password: '',
  password_confirmation: '',
  birthdate: '',
  user_type: '' as any,
};
