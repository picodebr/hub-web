/** Interfaces and Types */

import { z } from 'zod';
import { ZodCustomSchema } from '../zod';
import { zodSchemaErrors } from '@/_base/errors/zodSchemaErrors';
import { IHubGroupActivityMetadata } from './IHubGroupActivity';

export interface ICreateHubGroupActivityDTO {
  hub_group_id: string;
  title: string;
  description?: string;
  file_url: string;
  metadata?: IHubGroupActivityMetadata;
}

/** Zod schemas */

export const createHubGroupActivitySchema: ZodCustomSchema<ICreateHubGroupActivityDTO> = z.object({
  hub_group_id: z.string({ required_error: zodSchemaErrors.REQUIRED_FIELD }).uuid(),
  title: z.string({ required_error: zodSchemaErrors.REQUIRED_FIELD }).trim(),
  description: z.string().optional(),
  file_url: z.string({ required_error: zodSchemaErrors.REQUIRED_FIELD }),
  metadata: z.any().optional(),
});
