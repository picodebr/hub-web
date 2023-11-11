import Cookies from 'js-cookie';
import { IncomingMessage, ServerResponse } from 'http';

import { api } from '../classes/api';

const COOKIE_TOKEN_LABEL = 'access_token';

export const tokenManager: ITokenManager = {
  setToken: (token: string, expires = 1) => Cookies.set(btoa(COOKIE_TOKEN_LABEL), btoa(token), { expires }),
  getToken: () => {
    const encodedToken = Cookies.get(btoa(COOKIE_TOKEN_LABEL));
    if (encodedToken) return atob(encodedToken);
    return null;
  },
  forceExpires: (res: ServerResponse) => res.setHeader('Set-Cookie', 'adhow_access=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'),
  updateToken: (req: NextAppRequest) => {
    const access_token  = req.cookies.access_token;
  
    api.defaults.headers.authorization = `Bearer ${access_token}`;
  }
};


type NextAppRequest = IncomingMessage & { cookies: Partial<{[key: string]: string;}>} 
interface ITokenManager { 
  setToken: (token: string, expires?: number) => void;
  getToken: () => string | null;
  forceExpires: (res: ServerResponse) => void;
  updateToken: (req: NextAppRequest) => void;
}