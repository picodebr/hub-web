import { IContact } from '../contact';

export interface IPublisher {
  id: string;
  readable_id: string;
  name: string;
  contacts: IContact[];
  sites: IPublisherSite[];
  created_at: string;
  updated_at: string;
}

export interface IPublisherSite {
  id: string;
  name: string;
  url: string;
  pages: IPublisherSitePage[];
}

export interface IPublisherSitePage {
  id: string;
  name: string;
  path: string;
}

export interface IPublisherAdDirect {
  id: string;
  ad_id: string;
  publisher_id: string;
  sites_enabled: string[];
  pages_enabled: string[];
}
