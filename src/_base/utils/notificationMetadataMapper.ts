export const notificationMetadataMapper = (metadata: Record<string, any>): Record<string, any> => {
  return Object.keys(metadata).reduce((acc, key) => {
    const isSensitiveField = key.indexOf('_id') > 0 || key.indexOf('id_') > 0;

    if (isSensitiveField) return acc;

    if (typeof metadata[key] === 'string') acc[metadataLabelMapper[key] || key] = metadata[key];

    return acc;
  }, {} as Record<string, any>);
};

const metadataLabelMapper: Record<string, string> = {
  name: 'Name',
  title: 'Title',
  description: 'Description',
  status: 'Status',
  budget: 'Budget',
  channel_type: 'Channel type',
  start_at: 'Start time',
  end_at: 'End time',
  metadata: 'Metadata',
};
