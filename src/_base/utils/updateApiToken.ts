import { IncomingMessage } from 'http';

import { api } from '@/_base/classes/api';

interface NextRequest extends IncomingMessage {
  cookies: Record<string, unknown>;
}

export const updateApiToken = (req: NextRequest): void => {
  const { adhow_access } = req.cookies;

  api.defaults.headers.authorization = `Bearer ${adhow_access}`;
};
