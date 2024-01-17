/** Interfaces and Types */

import { z } from 'zod';
import { ZodCustomSchema } from '../zod';
import { zodSchemaErrors } from '@/_base/errors/zodSchemaErrors';

export interface ICreateHubGroupParams {
  hub_project_class_id: string | null;
  display_name: string;
  users: string[];
}

/** Zod schemas */
export const createHubGroupSchema: ZodCustomSchema<ICreateHubGroupParams> = z.object({
  display_name: z.string({ required_error: zodSchemaErrors.REQUIRED_FIELD }).trim(),
  hub_project_class_id: z.string({ required_error: zodSchemaErrors.REQUIRED_FIELD }).uuid(),
  users: z.array(z.string({ required_error: zodSchemaErrors.REQUIRED_FIELD }).uuid()).min(1, { message: zodSchemaErrors.REQUIRED_FIELD }),
});
