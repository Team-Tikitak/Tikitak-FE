import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearStoredFeedHero, readStoredFeedHero, storeFeedHero } from './feedHeroStorage';
import type { FeedItem } from '../model/types';

const makeFeed = (overrides: Partial<FeedItem> = {}): FeedItem => ({
  id: '42',
  type: 'GENERAL',
  place: '사무실',
  question: '',
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
    vi.useRealTimers();
    clearStoredFeedHero();
  });

  it('stores visible source rect and falls back preview url to thumbnail url', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-04T10:00:00Z'));

    const stored = storeFeedHero(makeFeed(), makeRect());

    expect(stored).toEqual({
      feedId: '42',
      thumbnailUrl: 'https://example.com/thumb.jpg',
      heroPreviewUrl: 'https://example.com/thumb.jpg',
      createdAt: new Date('2026-07-04T10:00:00Z').getTime(),
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

  it('drops stale hero sources instead of replaying old coordinates', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-04T10:00:00Z'));

    storeFeedHero(makeFeed(), makeRect());

    vi.setSystemTime(new Date('2026-07-04T10:11:00Z'));

    expect(readStoredFeedHero()).toBeNull();
  });
});
