export const normalizeImageUrl = (url?: string | null): string | undefined => {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('//')) return `https:${url}`;
  if (url.startsWith('/')) return url;
  return `https://${url}`;
};

export const toSafeImageUrl = (url?: string | null): string => normalizeImageUrl(url) ?? '';
