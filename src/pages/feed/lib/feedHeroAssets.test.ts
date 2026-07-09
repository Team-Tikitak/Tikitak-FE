import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { preloadImage, preloadFeedHeroAssets } from './feedHeroAssets';
import type { FeedItem } from '../model/types';

describe('feedHeroAssets', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('preloadImage', () => {
    const stubImage = (decode?: () => Promise<void>) => {
      const instances: Array<{
        onload: (() => void) | null;
        onerror: (() => void) | null;
        decode?: () => Promise<void>;
      }> = [];

      class MockImage {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        decode = decode;
        src = '';

        constructor() {
          instances.push(this);
        }
      }

      vi.stubGlobal('Image', MockImage);
      return instances;
    };

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

    it('should wait for image decode after load when decode succeeds', async () => {
      const decode = vi.fn().mockResolvedValue(undefined);
      const images = stubImage(decode);

      const promise = preloadImage('https://example.com/decode-success.jpg');
      images[0]?.onload?.();

      await expect(promise).resolves.toBeUndefined();
      expect(decode).toHaveBeenCalledTimes(1);
    });

    it('should resolve after load even when decode fails', async () => {
      const decode = vi.fn().mockRejectedValue(new Error('decode failed'));
      const images = stubImage(decode);

      const promise = preloadImage('https://example.com/decode-fail.jpg');
      images[0]?.onload?.();

      await expect(promise).resolves.toBeUndefined();
      expect(decode).toHaveBeenCalledTimes(1);
    });

    it('should resolve on load when decode is not supported', async () => {
      const images = stubImage();

      const promise = preloadImage('https://example.com/decode-unsupported.jpg');
      images[0]?.onload?.();

      await expect(promise).resolves.toBeUndefined();
    });
  });

  describe('preloadFeedHeroAssets', () => {
    const mockFeedItem: FeedItem = {
      id: 'feed-1',
      title: 'Test',
      type: 'GENERAL',
      place: 'Seoul',
      question: '',
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
