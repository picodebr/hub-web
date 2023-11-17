import { z } from 'zod';

import { ZodCustomSchema } from '../zod';

export interface IRecoverPasswordByUsername {
  username: string;
}

export const recoverPasswordByUsernameSchema: ZodCustomSchema<IRecoverPasswordByUsername> = z.object({
  username: z.string({ required_error: 'Campo obrigatório' }).trim().min(6, { message: 'Nome de usuário inválido' }),
});
