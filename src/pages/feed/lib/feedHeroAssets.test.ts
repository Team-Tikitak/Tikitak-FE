import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { preloadImage, preloadFeedHeroAssets } from './feedHeroAssets';
import type { FeedItem } from '../model/types';

describe('feedHeroAssets', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('preloadImage', () => {
    it('should resolve immediately for empty URL', async () => {
      const result = preloadImage('');
      await expect(result).resolves.toBeUndefined();
    });

    it('should return cached promise for same URL', async () => {
      const url = 'https://example.com/image.jpg';
      const promise1 = preloadImage(url);
      const promise2 = preloadImage(url);

      expect(promise1).toBe(promise2);
    });

    it('should create new promise for different URLs', async () => {
      const url1 = 'https://example.com/image1.jpg';
      const url2 = 'https://example.com/image2.jpg';

      const promise1 = preloadImage(url1);
      const promise2 = preloadImage(url2);

      expect(promise1).not.toBe(promise2);
    });
  });

  describe('preloadFeedHeroAssets', () => {
    const mockFeedItem: FeedItem = {
      id: 'feed-1',
      title: 'Test',
      location: 'Seoul',
      thumbnailUrl: 'https://example.com/thumb.jpg',
      heroPreviewUrl: 'https://example.com/hero.jpg',
      participantAvatarUrls: [],
      date: new Date().toISOString(),
      photoCount: 3,
    };

    it('should return a promise', () => {
      const promise = preloadFeedHeroAssets(mockFeedItem);
      expect(promise).toBeInstanceOf(Promise);
    });

    it('should resolve within timeout', async () => {
      const promise = preloadFeedHeroAssets(mockFeedItem);
      vi.advanceTimersByTime(300);

      await expect(promise).resolves.toBeUndefined();
    });
  });
});
