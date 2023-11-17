import { z } from 'zod';

import { ZodCustomSchema } from '../zod';

export interface IRecoverPasswordByEmail {
  email: string;
}

export const recoverPasswordByEmailSchema: ZodCustomSchema<IRecoverPasswordByEmail> = z.object({
  email: z.string().email({ message: 'E-mail obrigatório' }),
});
