import { z } from 'zod';

import { zodSchemaErrors } from '@/_base/errors/zodSchemaErrors';
import { ZodCustomSchema } from '../zod';
import { HubUserType } from './HubUserType';

/** Interfaces and Types */
export default interface IRegisterUser {
  primary_code: string;
  name: string;
  email?: string;
  username: string;
  password: string;
  password_confirmation: string;
  birthdate: Date;
  user_type: HubUserType;
}

export const EMPTY_REGISTER_USER_DATA: IRegisterUser = {
  primary_code: '',
  name: '',
  email: '',
  username: '',
  password: '',
  password_confirmation: '',
  birthdate: undefined as any,
  user_type: '' as any,
};

/** Zod schemas */
export const registerUserSchema: ZodCustomSchema<IRegisterUser> = z.object({
  primary_code: z
    .string({ required_error: zodSchemaErrors.REQUIRED_FIELD })
    .trim()
    .min(4, { message: zodSchemaErrors.CODE_ERROR })
    .max(4, { message: zodSchemaErrors.CODE_ERROR }),
  name: z.string({ required_error: zodSchemaErrors.REQUIRED_FIELD }).trim().min(6, { message: zodSchemaErrors.MININUM_LENGTH }),
  email: z.string().email().optional(),
  username: z.string({ required_error: zodSchemaErrors.REQUIRED_FIELD }).trim().min(6, { message: zodSchemaErrors.MININUM_LENGTH }),
  password: z.string({ required_error: zodSchemaErrors.REQUIRED_FIELD }).min(6, { message: zodSchemaErrors.MININUM_LENGTH }),
  password_confirmation: z.string({ required_error: zodSchemaErrors.REQUIRED_FIELD }).min(6, { message: zodSchemaErrors.MININUM_LENGTH }),
  birthdate: z.date({ required_error: zodSchemaErrors.REQUIRED_FIELD }).max(new Date(), { message: zodSchemaErrors.INVALID_FIELD }),
  user_type: z.string({ required_error: zodSchemaErrors.REQUIRED_FIELD }),
});
