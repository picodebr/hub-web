import { IAdCollectedData } from '../ad';
import { ICreditAccount } from '../admin';
import { IAgency } from '../agency';

export interface IOrg {
  id: string;
  name: string;
  primary_admin_id: string;
  credit_account: ICreditAccount;
}

export interface IOrgReportData {
  org_name: string;
  campaigns: ImpressionReportDataType[];
  publishers: ImpressionReportDataType[];
  ads: ImpressionReportDataType[];
  advertisers: ImpressionReportDataType[];
  sites: ImpressionReportDataType[];
  pages: ImpressionReportDataType[];
  agencies: IAgency[];
  collected_data: IAdCollectedData[];
}

export type ImpressionReportDataType = { name: string; impressions: ImpressionMetadata[] };

export type ImpressionMetadata = { registered_at: number };
