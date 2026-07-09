import type { FeedType } from '@/shared/api/feed/types';

export interface FeedItem {
  id: string;
  type: FeedType;
  place: string;
  question: string;
  title: string;
  participantAvatarUrls: string[];
  date: string;
  thumbnailUrl: string;
  heroPreviewUrl: string;
  photoCount: number;
}
