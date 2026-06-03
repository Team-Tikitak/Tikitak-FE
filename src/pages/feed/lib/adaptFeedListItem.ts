import type { FeedListItem as ApiFeedListItem } from '@/shared/api/feed/types';
import { formatYmd } from '@/shared/lib/date';
import { normalizeImageUrl } from '@/shared/lib/normalizeImageUrl';
import type { FeedItem } from '../model/types';

export const adaptFeedListItem = (item: ApiFeedListItem): FeedItem => {
  const authorAvatar = normalizeImageUrl(item.author.profileImageUrl);
  return {
    id: String(item.feedId),
    location: item.place?.name ?? '',
    title: item.content,
    participantAvatarUrls: authorAvatar ? [authorAvatar] : [],
    date: formatYmd(item.createdAt),
    thumbnailUrl: normalizeImageUrl(item.thumbnailImageUrl) ?? '',
    heroPreviewUrl: normalizeImageUrl(item.heroPreviewUrl) ?? '',
    photoCount: item.imageCount,
  };
};
