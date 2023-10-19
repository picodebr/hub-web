export interface INotification {
  id: string;
  org_id: string;
  ad_id: string | null;
  campaign_id: string | null;
  admin_id: string | null;
  agency_id: string | null;
  advertiser_id: string | null;
  publisher_id: string | null;
  permission_group_id: string | null;
  title: string;
  subtitle: string | null;
  viewed: boolean | null;
  metadata: Record<string, any>;
  created_at: string;
}
