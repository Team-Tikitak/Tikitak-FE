import type { FeedListItem as ApiFeedListItem } from '@/shared/api/feed/types';
import { formatYmd } from '@/shared/lib/date';
import { normalizeImageUrl } from '@/shared/lib/normalizeImageUrl';
import type { FeedItem } from '../model/types';

export const adaptFeedListItem = (item: ApiFeedListItem): FeedItem => {
  return {
    id: String(item.feedId),
    location: item.place?.name ?? '',
    title: item.content ?? '',
    date: formatYmd(item.createdAt),
    thumbnailUrl: normalizeImageUrl(item.thumbnailImageUrl) ?? '',
    photoCount: item.imageCount,
    participantAvatarUrls: item.taggedMembers.map((member) => member.profileImageUrl),
  };
};
