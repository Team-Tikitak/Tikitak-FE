const CDN_HOST = 'dev-media.kusitms.xyz';
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type MediaFolder = 'profile-image' | 'feed-image' | 'team-image' | 'daily-question-image';

export const normalizeImageUrl = (
  url?: string | null,
  folder: MediaFolder = 'profile-image',
): string | undefined => {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('//')) return `https:${url}`;
  if (url.startsWith('/')) return url;
  if (UUID_REGEX.test(url)) {
    return `https://${CDN_HOST}/media/${folder}/${url}.png`;
  }
  return `https://${url}`;
};
