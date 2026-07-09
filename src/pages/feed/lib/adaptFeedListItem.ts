import type { FeedListItem as ApiFeedListItem } from '@/shared/api/feed/types';
import { formatYmd } from '@/shared/lib/date';
import { normalizeImageUrl, toSafeImageUrl } from '@/shared/lib/image/normalizeImageUrl';
import type { FeedItem } from '../model/types';

export const adaptFeedListItem = (item: ApiFeedListItem): FeedItem => {
  const thumbnailUrl = toSafeImageUrl(item.thumbnailImageUrl);

  return {
    id: String(item.feedId),
    type: item.type,
    place: item.place?.name ?? '',
    question: item.question?.content ?? '',
    title: item.content ?? '',
    date: formatYmd(item.createdAt),
    thumbnailUrl,
    heroPreviewUrl: normalizeImageUrl(item.heroPreviewUrl) ?? thumbnailUrl,
    photoCount: item.imageCount,
    participantAvatarUrls: (item.taggedMembers ?? [])
      .map((member) => normalizeImageUrl(member.profileImageUrl))
      .filter((url): url is string => Boolean(url)),
  };
};
