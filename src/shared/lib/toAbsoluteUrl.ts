export const toAbsoluteUrl = (url: string) =>
  url.startsWith('http') ? url : `https://${url}`;
