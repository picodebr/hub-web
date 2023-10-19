import { ZodCustomSchema } from '@/_base/services/@types';
import * as z from 'zod';

export interface IContact {
  email?: string;
  phone?: string;
  name?: string;
}

export const contactSchema: ZodCustomSchema<IContact> = z.object({
  email: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  name: z.string().trim().optional(),
});
