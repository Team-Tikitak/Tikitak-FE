export const toAbsoluteUrl = (url: string | undefined | null) => {
  if (!url) return undefined;
  return url.startsWith('http') ? url : `https://${url}`;
};
