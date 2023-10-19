import * as z from 'zod';

import { ZodCustomSchema } from '../@types';

/** Interfaces and Types */

export interface ICreateOrgDTO {
  name: string;
}

export interface IUpdateOrgDTO extends ICreateOrgDTO {}

/** Zod schemas */

export const orgSchema: ZodCustomSchema<ICreateOrgDTO> = z.object({
  name: z.string().trim().nonempty(),
});
