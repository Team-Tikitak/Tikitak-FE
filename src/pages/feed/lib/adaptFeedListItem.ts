import type { FeedListItem as ApiFeedListItem } from '@/shared/api/feed/types';
import { normalizeImageUrl } from '@/shared/lib/normalizeImageUrl';
import type { FeedItem } from '../model/types';

const formatYmd = (iso: string) => iso.slice(0, 10).replaceAll('-', '.');

export const adaptFeedListItem = (item: ApiFeedListItem): FeedItem => {
  const authorAvatar = normalizeImageUrl(item.author.profileImageUrl);
  return {
    id: String(item.feedId),
    location: item.place?.name ?? '',
    title: item.content,
    participantAvatarUrls: authorAvatar ? [authorAvatar] : [],
    date: formatYmd(item.createdAt),
    thumbnailUrl: normalizeImageUrl(item.thumbnailImageUrl, 'feed-image') ?? '',
    photoCount: item.imageCount,
  };
};
