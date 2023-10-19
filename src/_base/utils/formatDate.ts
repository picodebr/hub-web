const UTCTime = 1000 * 60 * 60 * 3;

export const formatDateInput = (value?: string | number | Date, utc = true) =>
  value ? new Date(new Date(value).getTime() - (utc ? UTCTime : 0)).toISOString().split('.')[0] : '';
