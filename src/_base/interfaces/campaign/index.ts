import { IAd } from '../ad';
import { IAdmin } from '../admin';
import { IAdvertiser } from '../advertiser';

export interface ICampaign {
  id: string;
  name: string;
  description?: string;
  status: CampaignStatusType;
  budget: string;
  channel_type: CampaignChannelType;
  start_at?: string;
  end_at?: string;
  created_by: string;
  advertiser_id: string;
  advertiser: IAdvertiser;
  ads: IAd[];
  total_budget_used?: number;
  creator?: IAdmin;
}

export const campaignStatusTypes = <const>['running', 'stopped', 'finished'];
export type CampaignStatusType = (typeof campaignStatusTypes)[number];

export const campaignChannelTypes = <const>['RTB', 'Direct'];
export type CampaignChannelType = (typeof campaignChannelTypes)[number];
