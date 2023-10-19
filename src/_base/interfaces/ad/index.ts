import { ICampaign } from '../campaign';
import { ICostType } from '../cost-type';
import { IPublisherAdDirect } from '../publisher';
import { ITargetingData } from '../targeting';

export interface IAd {
  id: string;
  name: string;
  creative: ICreative;
  link: string;
  channel_type: AdChannelType;
  cost_type: ICostType;
  metadata?: IAdMetadata;
  start_at?: string;
  end_at?: string;
  created_by: string;
  campaign_id: string;
  campaign: ICampaign;
  created_at: string;
  updated_at: string;
  collected_data: IAdCollectedData[];
  direct_publishers: IPublisherAdDirect[];
  targeting: ITargetingData;
  template: AdTemplateType;
}

export interface ICreative {
  html: string;
  css?: string;
  js?: string;
}

export interface IAdMetadata {
  url: string;
  dimension: string;
  placement: AdPlacementType;
}

export interface IAdCollectedData {
  id: string;
  ad_id: string;
  ad: IAd;
  ip: string;
  ref: string;
  host: string;
  hostname: string;
  user_agent: string;
  is_mobile: boolean;
  device_type: string;
  created_at: string;
  event_mapping: IAdEventMapping;
}

export interface IAdEventMapping {
  clicks: Coordinates[];
  hover: TimeAccessData[];
  expanded_time: TimeAccessData[];
  progress_bar: ProgressBar[];
  redirection: RedirectionData[];
}

type Coordinates = { x: string; y: string; is_expanded: boolean; registered_at: string };

type TimeAccessData = { time: number; registered_at: string };

type ProgressBar = { progress: number; registered_at: string };

type RedirectionData = { clicked_at: string };

export const adChannelTypes = <const>['display', 'video', 'image'];
export type AdChannelType = (typeof adChannelTypes)[number];

export const adTemplateTypes = <const>['none', 'injectable', 'in-image'];
export type AdTemplateType = (typeof adTemplateTypes)[number];

export const adPlacements = <const>['fixed-top', 'fixed-bottom', 'inside-page'];
export type AdPlacementType = (typeof adPlacements)[number];

export const adAttachmentsTypes = <const>[
  'adz-top-left-btn',
  'adz-top-center-btn',
  'adz-top-right-btn',
  'adz-right-top-btn',
  'adz-right-center-btn',
  'adz-right-bottom-btn',
  'adz-bottom-left-btn',
  'adz-bottom-center-btn',
  'adz-bottom-right-btn',
  'adz-left-top-btn',
  'adz-left-center-btn',
  'adz-left-bottom-btn',
];
export type AdAttachmentsType = (typeof adAttachmentsTypes)[number];

export const currencyTypes = <const>['BRL', 'USD', 'EUR'];
export type CurrencyType = (typeof currencyTypes)[number];

type CurrencyOption = { label: string; prefix: string };
export const currencyTypeMapper: Record<CurrencyType, CurrencyOption> = {
  BRL: { label: 'Real', prefix: 'R$' },
  USD: { label: 'Dollar', prefix: '$' },
  EUR: { label: 'Euro', prefix: '€' },
};

type AdTemplateDetailType = { label: string; value: string };
export const AD_TEMPLATES_LABEL_MAPPER: Record<AdTemplateType, AdTemplateDetailType> = {
  none: { label: 'None', value: 'none' },
  injectable: { label: 'Inside of page', value: 'injection' },
  'in-image': { label: 'Inside of image', value: 'inImage' },
};

export const AD_FIXED_DIMESIONS: Record<string, string[]> = {
  Billboard: ['970x250'],
  'Smartphone Banner': ['300x50', '320x50'],
  Leaderboard: ['728x90'],
  'Super Leaderboard/ Pushdown': ['970x90'],
  Portrait: ['300x1050'],
  Skyscraper: ['160x600'],
  'Medium Rectangle': ['300x250'],
  '20x60': ['120x60'],
  'Mobile Phone Interstitial': ['640x1136', '  750x1334', '  1080x1920'],
  'Feature Phone Small Banner': ['120x20'],
  'Feature Phone Medium Banner': ['168x28'],
  'Feature Phone Large Banner': ['216x36'],
};
export const AD_ATTACHMENT_LABEL_MAPPER: Record<AdAttachmentsType, string> = {
  'adz-top-left-btn': 'Top left',
  'adz-top-center-btn': 'Top center',
  'adz-top-right-btn': 'Top right',
  'adz-right-top-btn': 'Right Top',
  'adz-right-center-btn': 'Right Center',
  'adz-right-bottom-btn': 'Right Bottom',
  'adz-bottom-left-btn': 'Bottom left',
  'adz-bottom-center-btn': 'Bottom center',
  'adz-bottom-right-btn': 'Bottom right',
  'adz-left-top-btn': 'Left Top',
  'adz-left-center-btn': 'Left Center',
  'adz-left-bottom-btn': 'Left Bottom',
};
