import * as z from 'zod';

import { ZodCustomSchema } from '../@types';

/** Interfaces and Types */
export interface IUpdateNotificationDTO {
  id: string;
  viewed: boolean;
}

/** Zod schemas */

export const notificationSchema: ZodCustomSchema<IUpdateNotificationDTO> = z.object({
  id: z.string().trim().nonempty(),
  viewed: z.boolean(),
});
