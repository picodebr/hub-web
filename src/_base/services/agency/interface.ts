import * as z from 'zod';

import { IAddress, addressSchema } from '@/_base/interfaces/address';
import { IContact, contactSchema } from '@/_base/interfaces/contact';
import { ZodCustomSchema } from '../@types';

/** Interfaces and Types */

export interface ICreateAgencyDTO {
  name: string;
  description?: string;
  contacts: IContact[];
  address: IAddress;
}

export interface IUpdateAgencyDTO extends ICreateAgencyDTO {
  id: string;
}

/** Zod schemas */

export const agencySchema: ZodCustomSchema<ICreateAgencyDTO> = z.object({
  name: z.string().trim().nonempty(),
  description: z.string().optional().nullable(),
  contacts: contactSchema.optional(),
  address: addressSchema.optional(),
});
