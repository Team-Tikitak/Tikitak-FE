import type { FeedListItem as ApiFeedListItem } from '@/shared/api/feed/types';
import { toAbsoluteUrl } from '@/shared/lib/toAbsoluteUrl';
import type { FeedItem } from '../model/types';

const formatYmd = (iso: string) => iso.slice(0, 10).replaceAll('-', '.');

export const adaptFeedListItem = (item: ApiFeedListItem): FeedItem => ({
  id: String(item.feedId),
  location: item.place?.name ?? '',
  title: item.content,
  participantAvatarUrls: item.author.profileImageUrl
    ? [toAbsoluteUrl(item.author.profileImageUrl) as string]
    : [],
  date: formatYmd(item.createdAt),
  thumbnailUrl: toAbsoluteUrl(item.thumbnailImageUrl) ?? '',
  photoCount: item.imageCount,
});
