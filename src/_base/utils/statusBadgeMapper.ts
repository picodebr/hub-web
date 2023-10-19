import { CampaignStatusType } from '../interfaces/campaign';

type StatusDisplay = {
  label: string;
  color: string;
};

export const statusBadgeMapper: Record<CampaignStatusType, StatusDisplay> = {
  stopped: { label: 'Stopped', color: 'red' },
  finished: { label: 'Finished', color: 'blue' },
  running: { label: 'Running', color: 'green' },
  ...({} as any),
};
