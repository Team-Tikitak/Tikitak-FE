import type { FeedListItem as ApiFeedListItem } from '@/shared/api/feed/types';
import type { FeedItem } from '../model/types';

const formatYmd = (iso: string) => iso.slice(0, 10).replaceAll('-', '.');

export const adaptFeedListItem = (item: ApiFeedListItem): FeedItem => ({
  id: String(item.feedId),
  location: item.place?.name ?? '',
  title: item.content,
  participantAvatarUrls: item.author.profileImageUrl ? [item.author.profileImageUrl] : [],
  date: formatYmd(item.createdAt),
  thumbnailUrl: item.thumbnailImageUrl,
  photoCount: item.imageCount,
});
