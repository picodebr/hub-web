import * as z from 'zod';

import { ZodCustomSchema } from '@/_base/services/@types';

export interface ICostType {
  cpm?: string;
  cpa?: string;
  cpc?: string;
  currency_type: string;
}

export const costTypeSchema: ZodCustomSchema<ICostType> = z.object({
  cpm: z.string().optional(),
  cpa: z.string().optional(),
  cpc: z.string().optional(),
  currency_type: z.string().trim().default('real'),
});
