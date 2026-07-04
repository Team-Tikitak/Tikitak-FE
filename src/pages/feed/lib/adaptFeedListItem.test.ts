import { describe, expect, it } from 'vitest';
import type { FeedListItem } from '@/shared/api/feed/types';
import { adaptFeedListItem } from './adaptFeedListItem';

const makeFeedListItem = (overrides: Partial<FeedListItem> = {}): FeedListItem => ({
  feedId: 1,
  type: 'GENERAL',
  content: '오늘의 피드',
  thumbnailImageUrl: 'https://example.com/thumb.jpg',
  heroPreviewUrl: 'https://example.com/preview.jpg',
  imageCount: 1,
  author: {
    teamMemberId: 1,
    nickname: '민경',
    profileImageUrl: '',
    anonymous: false,
    isAnonymous: false,
  },
  place: {
    placeId: 'place-1',
    name: '사무실',
    latitude: 37,
    longitude: 127,
    address: '서울',
  },
  question: null,
  commentCount: 0,
  reactionSummary: {
    totalCount: 0,
    items: [],
  },
  myReaction: null,
  createdAt: '2026-07-04T00:00:00.000Z',
  taggedMembers: [],
  ...overrides,
});

describe('adaptFeedListItem', () => {
  it('falls back to thumbnail url when hero preview url is missing', () => {
    const feed = adaptFeedListItem(makeFeedListItem({ heroPreviewUrl: '' }));

    expect(feed.thumbnailUrl).toBe('https://example.com/thumb.jpg');
    expect(feed.heroPreviewUrl).toBe('https://example.com/thumb.jpg');
  });
});
