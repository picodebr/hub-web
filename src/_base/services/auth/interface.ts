import * as z from 'zod';

import { zodSchemaErrors } from '@/_base/errors/zodSchemaErrors';
import { IAdmin } from '@/_base/interfaces/admin';
import { ZodCustomSchema } from '../../interfaces/zod';

/** Interfaces and Types */

export interface IAuthLoginInput {
  identifier: string;
  password: string;
}

export interface IAuthLoginOutput {
  user: IAdmin;
  token: string;
}

/** Zod schemas */

export const authSchema: ZodCustomSchema<IAuthLoginInput> = z.object({
  identifier: z.string({ required_error: zodSchemaErrors.REQUIRED_FIELD }).trim().min(6, { message: zodSchemaErrors.IDENTIFIER_LENGTH }),
  password: z.string({ required_error: zodSchemaErrors.REQUIRED_FIELD }).min(6, { message: zodSchemaErrors.PASS_LENGTH }),
});
