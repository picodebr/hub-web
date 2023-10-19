import * as z from 'zod';

import { IContact, contactSchema } from '@/_base/interfaces/contact';
import { IPublisherSite } from '@/_base/interfaces/publisher';
import { ZodCustomSchema } from '../@types';

/** Interfaces and Types */

export interface ICreatePublisherDTO {
  name: string;
  contacts: IContact[];
  sites: IPublisherSite[];
}

export interface IUpdatePublisherDTO extends ICreatePublisherDTO {
  id: string;
}

/** Zod schemas */

export const publisherSchema: ZodCustomSchema<ICreatePublisherDTO> = z.object({
  name: z.string().trim().nonempty(),
  sites: z.array(
    z.object({
      name: z.string().nonempty(),
      url: z.string().url().nonempty(),
      pages: z.array(z.object({ name: z.string().nonempty(), path: z.string().nonempty() }).optional()).optional(),
    }),
  ),
  contacts: z.array(contactSchema.optional()).optional(),
});
