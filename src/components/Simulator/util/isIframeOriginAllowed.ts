export const isIframeOriginAllowed = (origin: string, iframeUrl: string) => iframeUrl.startsWith(origin);
