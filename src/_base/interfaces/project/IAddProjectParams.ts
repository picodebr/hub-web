import { z } from 'zod';
import { ZodCustomSchema } from '../zod';
import { IProjectMetadata } from './IProjectMetadata';
import { zodSchemaErrors } from '@/_base/errors/zodSchemaErrors';

export interface IAddProjectParams {
  class_id: string;
  title: string;
  description?: string | null;
  metadata: IProjectMetadata;
}

export const addProjectSchema: ZodCustomSchema<IAddProjectParams> = z.object({
  class_id: z.string({ required_error: zodSchemaErrors.REQUIRED_FIELD }).uuid().min(0, { message: zodSchemaErrors.REQUIRED_FIELD }),
  title: z.string({ required_error: zodSchemaErrors.REQUIRED_FIELD }).trim().min(6, { message: zodSchemaErrors.REQUIRED_FIELD }),
  description: z.string().trim(),
  birthdate: z.date({ required_error: zodSchemaErrors.REQUIRED_FIELD }).max(new Date(), { message: zodSchemaErrors.INVALID_FIELD }),
  metadata: z.object({
    presentation: z.string({ required_error: zodSchemaErrors.REQUIRED_FIELD }).trim().min(1, { message: zodSchemaErrors.REQUIRED_FIELD }),
    tools: z.array(z.string()).default([]),
    steps: z
      .array(
        z.object({
          title: z.string({ required_error: zodSchemaErrors.REQUIRED_FIELD }).trim().min(1, { message: zodSchemaErrors.REQUIRED_FIELD }),
          description: z.string().nullable(),
          position: z.number().min(0),
        }),
      )
      .default([]),
    bncc: z
      .array(
        z.object({
          title: z.string({ required_error: zodSchemaErrors.REQUIRED_FIELD }).trim().min(1, { message: zodSchemaErrors.REQUIRED_FIELD }),
          tag: z.string({ required_error: zodSchemaErrors.REQUIRED_FIELD }).trim().min(1, { message: zodSchemaErrors.REQUIRED_FIELD }),
          description: z.string({ required_error: zodSchemaErrors.REQUIRED_FIELD }).trim().min(1, { message: zodSchemaErrors.REQUIRED_FIELD }),
          grade: z.string({ required_error: zodSchemaErrors.REQUIRED_FIELD }).trim().min(1, { message: zodSchemaErrors.REQUIRED_FIELD }),
          subject: z.string({ required_error: zodSchemaErrors.REQUIRED_FIELD }).trim().min(1, { message: zodSchemaErrors.REQUIRED_FIELD }),
        }),
      )
      .default([]),
  }),
});
