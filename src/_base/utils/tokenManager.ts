/* eslint-disable no-console */
import Cookies from 'js-cookie';
import { IncomingMessage, ServerResponse } from 'http';

import { api } from '../classes/api';

const COOKIE_TOKEN_LABEL = 'access_token';

export const cookieManager: ITokenManager = {
  setToken: (token, expires = 1) => Cookies.set(btoa(COOKIE_TOKEN_LABEL), btoa(token), { expires }),
  getToken: () => {
    const encodedToken = Cookies.get(btoa(COOKIE_TOKEN_LABEL));
    if (encodedToken) return atob(encodedToken);
    return null;
  },
  forceTokenExpires: (res) => res.setHeader('Set-Cookie', `${btoa(COOKIE_TOKEN_LABEL)}=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`),
  updateToken: (req) => {
    const access_token = req.cookies[btoa(COOKIE_TOKEN_LABEL)];

    api.defaults.headers.authorization = `Bearer ${atob(access_token || '')}`;
  },
  getCookie: (name, parse, decode = true) => {
    const encodedToken = Cookies.get(decode ? btoa(name) : name);

    try {
      if (encodedToken)
        return parse
          ? JSON.parse(decode ? atob(encodeURIComponent(encodedToken)) : encodedToken)
          : decode
          ? atob(encodeURIComponent(encodedToken))
          : encodedToken;
    } catch {
      try {
        if (encodedToken) return parse ? JSON.parse(decode ? atob(encodedToken) : encodedToken) : decode ? atob(encodedToken) : encodedToken;
        return null;
      } catch (err) {
        console.error(`Error on get cookies`, err);
      }
      return null;
    }
  },
  setCookie: (name, value, expires = 1, encode = true) => {
    try {
      Cookies.set(encode ? btoa(decodeURIComponent(name)) : name, encode ? btoa(decodeURIComponent(value)) : value, { expires });
    } catch {
      try {
        Cookies.set(encode ? btoa(name) : name, encode ? btoa(value) : value, { expires });
      } catch (err) {
        console.error(`Error on set cookies`, err);
      }
    }
  },
};

type NextAppRequest = IncomingMessage & { cookies: Partial<{ [key: string]: string }> };
interface ITokenManager {
  setToken: (token: string, expires?: number) => void;
  getToken: (parse?: boolean) => string | null;
  forceTokenExpires: (res: ServerResponse) => void;
  updateToken: (req: NextAppRequest) => void;
  getCookie: <T = string>(name: string, parse?: boolean, decode?: boolean) => T | null;
  setCookie: (name: string, value: string, expires?: number, encode?: boolean) => void;
}
