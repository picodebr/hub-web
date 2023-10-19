import * as z from 'zod';

import { IContact, contactSchema } from '@/_base/interfaces/contact';
import { ZodCustomSchema } from '../@types';

/** Interfaces and Types */

export interface ICreateAdvertiserDTO {
  name: string;
  contacts: IContact[];
  permission_group_id: string;
  agency_id?: string;
}

export interface IUpdateAdvertiserDTO extends ICreateAdvertiserDTO {
  id: string;
}

/** Zod schemas */

export const advertiserSchema: ZodCustomSchema<ICreateAdvertiserDTO> = z.object({
  name: z.string().trim().nonempty(),
  permission_group_id: z.string().nonempty(),
  agency_id: z.string().optional().nullable(),
  contacts: contactSchema.optional(),
});
