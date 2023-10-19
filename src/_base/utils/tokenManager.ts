import Cookies from 'js-cookie';

const COOKIE_TOKEN_LABEL = 'access_token';
type TokenManager = { setToken: (token: string, expires?: number) => void; getToken: () => string | null };

export const tokenManager: TokenManager = {
  setToken: (token: string, expires = 1) => Cookies.set(btoa(COOKIE_TOKEN_LABEL), btoa(token), { expires }),
  getToken: () => {
    const encodedToken = Cookies.get(btoa(COOKIE_TOKEN_LABEL));
    if (encodedToken) return atob(encodedToken);
    return null;
  },
};
