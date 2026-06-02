import { useGetFeedDetail } from '@/shared/api/feed/queries';
import { formatYmd } from '@/shared/lib/date';
import { normalizeImageUrl } from '@/shared/lib/normalizeImageUrl';
import type { CarouselImage, Participant } from '@/shared/ui';

export const useFeedData = (teamId: number, feedId: number) => {
  const { data, isLoading, isError } = useGetFeedDetail(teamId, feedId);

  const authorName = data?.author.nickname ?? '';

  const participants: Participant[] = (data?.taggedMembers ?? []).map((m) => ({
    id: m.teamMemberId,
    name: m.nickname,
    avatarSrc: normalizeImageUrl(m.profileImageUrl),
  }));

  const sortedImages = (data?.images ?? []).sort((a, b) => a.orderIndex - b.orderIndex);

  const images: CarouselImage[] = sortedImages.map((img) => ({
    src: normalizeImageUrl(img.imageUrl) ?? '',
  }));
  const feedImageIds: number[] = sortedImages.map((img) => img.feedImageId);

  const placeName = data?.place?.name ?? '';
  const content = data?.content ?? '';
  const date = data ? formatYmd(data.createdAt) : '';

  return {
    authorName,
    participants,
    images,
    feedImageIds,
    placeName,
    content,
    date,
    isLoading,
    isError,
  };
};
