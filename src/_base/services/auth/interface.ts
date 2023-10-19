import * as z from 'zod';

import { IAdmin } from '@/_base/interfaces/admin';
import { ZodCustomSchema } from '../@types';

/** Interfaces and Types */

export interface IAuthLoginInput {
  email: string;
  password: string;
}

export interface IAuthLoginOutput {
  user: IAdmin;
  token: string;
}

/** Zod schemas */

export const authSchema: ZodCustomSchema<IAuthLoginInput> = z.object({
  email: z.string().email().nonempty('Enter an email'),
  password: z.string().min(6, 'Password has at least 6 characters').nonempty('Enter a password'),
});
