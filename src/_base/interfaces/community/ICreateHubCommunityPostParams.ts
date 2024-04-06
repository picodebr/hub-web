import { z } from 'zod';
import { ZodCustomSchema } from '../zod';
import { zodSchemaErrors } from '@/_base/errors/zodSchemaErrors';
import { IHubCommunityPostMetadata } from './IHubCommunityPostMetadata';

export interface ICreateHubCommunityPostParams {
  content: string;
  metadata?: IHubCommunityPostMetadata;
}

export const EMPTY_CREATE_REPORT_DATA: ICreateHubCommunityPostParams = {
  content: '',
  metadata: { media: [] },
};

/** Zod schemas */
export const communityPostSchema: ZodCustomSchema<ICreateHubCommunityPostParams> = z.object({
  content: z.string({ required_error: zodSchemaErrors.REQUIRED_FIELD }).min(1, { message: zodSchemaErrors.REQUIRED_FIELD }),
  metadata: z.any(),
});
