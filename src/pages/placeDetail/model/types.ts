import { type CarouselImage, type Participant } from '@/shared/ui';

export interface FeedItem {
  id: number;
  participants: Participant[];
  images: CarouselImage[];
  authorName: string;
  content: string;
  date: string;
}

export interface PlaceFeedsMock {
  placeName: string;
  feeds: FeedItem[];
}
