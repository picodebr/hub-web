import { ServerResponse } from 'http';

export const forceTokenExpiration = (res: ServerResponse): void => {
  res.setHeader('Set-Cookie', 'adhow_access=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT');
};
