import { afterEach, describe, expect, it } from 'vitest';
import { clearStoredFeedHero, readStoredFeedHero, storeFeedHero } from './feedHeroStorage';
import type { FeedItem } from '../model/types';

const makeFeed = (overrides: Partial<FeedItem> = {}): FeedItem => ({
  id: '42',
  location: '사무실',
  title: '오늘의 피드',
  participantAvatarUrls: [],
  date: '2026.07.04',
  thumbnailUrl: 'https://example.com/thumb.jpg',
  heroPreviewUrl: '',
  photoCount: 1,
  ...overrides,
});

const makeRect = (): DOMRect =>
  ({
    left: 24,
    top: 180,
    width: 120,
    height: 160,
  }) as DOMRect;

describe('feedHeroStorage', () => {
  afterEach(() => {
    clearStoredFeedHero();
  });

  it('stores visible source rect and falls back preview url to thumbnail url', () => {
    const stored = storeFeedHero(makeFeed(), makeRect());

    expect(stored).toEqual({
      feedId: '42',
      thumbnailUrl: 'https://example.com/thumb.jpg',
      heroPreviewUrl: 'https://example.com/thumb.jpg',
      left: 24,
      top: 180,
      width: 120,
      height: 160,
    });
    expect(readStoredFeedHero()).toEqual(stored);
  });

  it('clears the stored hero source', () => {
    storeFeedHero(makeFeed(), makeRect());

    clearStoredFeedHero();

    expect(readStoredFeedHero()).toBeNull();
  });
});
