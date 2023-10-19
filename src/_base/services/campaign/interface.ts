import * as z from 'zod';

import { CampaignChannelType, CampaignStatusType, campaignChannelTypes, campaignStatusTypes } from '@/_base/interfaces/campaign';
import { ZodCustomSchema } from '../@types';

/** Interfaces and Types */
export interface ICreateCampaignDTO {
  name: string;
  description?: string;
  advertiser_id: string;
  start_at?: Date;
  end_at?: Date;
  channel_type: CampaignChannelType;
  budget: string;
  status: CampaignStatusType;
}

export interface IUpdateCampaignDTO extends Partial<ICreateCampaignDTO> {
  id: string;
}

/** Zod schemas */

export const campaignSchema: ZodCustomSchema<ICreateCampaignDTO> = z.object({
  name: z.string().trim().nonempty(),
  description: z.string().trim().optional(),
  advertiser_id: z.string().nonempty('Insert a advertiser'),
  start_at: z.string().optional(),
  end_at: z.string().optional(),
  channel_type: z.enum(campaignChannelTypes),
  budget: z.string().trim().nonempty(),
  status: z.enum(campaignStatusTypes).optional(),
});
