import * as z from 'zod';

import { AdChannelType, AdTemplateType, IAdMetadata, ICreative, adChannelTypes } from '@/_base/interfaces/ad';
import { ICostType, costTypeSchema } from '@/_base/interfaces/cost-type';
import { IPublisherAdDirect } from '@/_base/interfaces/publisher';
import { ITargetingData } from '@/_base/interfaces/targeting';
import { ZodCustomSchema } from '../@types';

/** Interfaces and Types */

export interface ICreateAdDTO {
  name: string;
  creative: ICreative;
  style?: string;
  start_at?: Date;
  end_at?: Date;
  channel_type: AdChannelType;
  cost_type?: ICostType;
  template: AdTemplateType;
  link: string;
  campaign_id: string;
  direct_publishers: IPublisherAdDirect[];
  targeting: ITargetingData;
  metadata?: IAdMetadata;
}

export interface IUpdateAdDTO extends Partial<ICreateAdDTO> {
  id: string;
}

/** Zod schemas */

export const adSchema: ZodCustomSchema<ICreateAdDTO> = z.object({
  name: z.string().trim().nonempty(),
  creative: z.object({ html: z.string().trim().nonempty(), css: z.string().trim(), js: z.string().trim() }).required(),
  style: z.string().optional(),
  start_at: z.string().optional(),
  end_at: z.string().optional(),
  channel_type: z.enum(adChannelTypes),
  cost_type: costTypeSchema.optional(),
  link: z.string().url().nonempty(),
  campaign_id: z.string().nonempty('Insert a campaign'),
  direct_publishers: z.any(),
  targeting: z.any(),
  metadata: z.any().optional(),
  template: z.string().nonempty(),
});
