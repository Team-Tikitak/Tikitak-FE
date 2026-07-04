import { describe, it, expect, beforeEach } from 'vitest';
import { storeFeedHero, readStoredFeedHero, clearStoredFeedHero } from '../lib/feedHeroStorage';
import type { FeedItem } from '../model/types';

// 히어로 저장/읽기 로직 테스트
describe('FeedPage - Hero Management', () => {
  beforeEach(() => {
    clearStoredFeedHero();
    sessionStorage.clear();
  });

  it('should store and retrieve feed hero', () => {
    const feedItem: FeedItem = {
      id: 'feed-1',
      title: 'Test Feed',
      location: 'Seoul',
      thumbnailUrl: 'https://example.com/thumb.jpg',
      heroPreviewUrl: 'https://example.com/hero.jpg',
      participantAvatarUrls: [],
      date: new Date().toISOString(),
      photoCount: 3,
    };

    const rect = new DOMRect(10, 20, 100, 150);
    storeFeedHero(feedItem, rect);

    const retrieved = readStoredFeedHero();
    expect(retrieved).not.toBeNull();
    expect(retrieved?.feedId).toBe('feed-1');
    expect(retrieved?.thumbnailUrl).toBe('https://example.com/thumb.jpg');
    expect(retrieved?.left).toBe(10);
    expect(retrieved?.top).toBe(20);
  });

  it('should not store hero with empty URLs', () => {
    const feedItem: FeedItem = {
      id: 'feed-2',
      title: 'Empty Feed',
      location: 'Seoul',
      thumbnailUrl: '',
      heroPreviewUrl: '',
      participantAvatarUrls: [],
      date: new Date().toISOString(),
      photoCount: 0,
    };

    const rect = new DOMRect(0, 0, 100, 100);
    storeFeedHero(feedItem, rect);

    // 빈 URL 검증: sessionStorage에 저장되지 않아야 함
    const retrieved = readStoredFeedHero();
    expect(retrieved).toBeNull();
  });

  it('should clear stored hero', () => {
    const feedItem: FeedItem = {
      id: 'feed-3',
      title: 'Test Feed',
      location: 'Seoul',
      thumbnailUrl: 'https://example.com/thumb.jpg',
      heroPreviewUrl: 'https://example.com/hero.jpg',
      participantAvatarUrls: [],
      date: new Date().toISOString(),
      photoCount: 3,
    };

    const rect = new DOMRect(0, 0, 100, 100);
    storeFeedHero(feedItem, rect);

    expect(readStoredFeedHero()).not.toBeNull();

    clearStoredFeedHero();
    expect(readStoredFeedHero()).toBeNull();
  });

  it('should use fallback thumbnail when hero preview URL is missing', () => {
    const feedItem: FeedItem = {
      id: 'feed-4',
      title: 'Test Feed',
      location: 'Seoul',
      thumbnailUrl: 'https://example.com/thumb.jpg',
      heroPreviewUrl: '',
      participantAvatarUrls: [],
      date: new Date().toISOString(),
      photoCount: 1,
    };

    const rect = new DOMRect(0, 0, 100, 100);
    const stored = storeFeedHero(feedItem, rect);

    // heroPreviewUrl이 없을 때 thumbnailUrl로 폴백
    expect(stored.heroPreviewUrl).toBe('https://example.com/thumb.jpg');
  });

  it('should handle multiple rect coordinate formats', () => {
    const feedItem: FeedItem = {
      id: 'feed-5',
      title: 'Test Feed',
      location: 'Seoul',
      thumbnailUrl: 'https://example.com/thumb.jpg',
      heroPreviewUrl: 'https://example.com/hero.jpg',
      participantAvatarUrls: [],
      date: new Date().toISOString(),
      photoCount: 2,
    };

    // 음수 좌표
    const negativeRect = new DOMRect(-10, -20, 100, 150);
    const stored1 = storeFeedHero(feedItem, negativeRect);
    expect(stored1.left).toBe(-10);
    expect(stored1.top).toBe(-20);

    // 큰 좌표
    const largeRect = new DOMRect(1000, 2000, 500, 750);
    const stored2 = storeFeedHero(feedItem, largeRect);
    expect(stored2.left).toBe(1000);
    expect(stored2.top).toBe(2000);
  });

  it('should validate stored hero structure', () => {
    const feedItem: FeedItem = {
      id: 'feed-6',
      title: 'Test Feed',
      location: 'Seoul',
      thumbnailUrl: 'https://example.com/thumb.jpg',
      heroPreviewUrl: 'https://example.com/hero.jpg',
      participantAvatarUrls: [],
      date: new Date().toISOString(),
      photoCount: 4,
    };

    const rect = new DOMRect(10, 20, 100, 150);
    const stored = storeFeedHero(feedItem, rect);

    expect(stored).toHaveProperty('feedId');
    expect(stored).toHaveProperty('thumbnailUrl');
    expect(stored).toHaveProperty('heroPreviewUrl');
    expect(stored).toHaveProperty('left');
    expect(stored).toHaveProperty('top');
    expect(stored).toHaveProperty('width');
    expect(stored).toHaveProperty('height');
  });
});
