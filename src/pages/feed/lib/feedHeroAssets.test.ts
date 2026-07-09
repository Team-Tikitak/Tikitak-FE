import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { preloadImage, preloadFeedHeroAssets, runFeedHeroTransition } from './feedHeroAssets';
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

  describe('runFeedHeroTransition', () => {
    const stubImage = () => {
      const instances: Array<{ onload: (() => void) | null; onerror: (() => void) | null }> = [];

      class MockImage {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        src = '';

        constructor() {
          instances.push(this);
        }
      }

      vi.stubGlobal('Image', MockImage);
      return instances;
    };

    const resolveAllImages = async (images: Array<{ onload: (() => void) | null }>) => {
      for (const image of images) image.onload?.();
      // preloadImage 내부 microtask 체인(load → decode)이 flush되도록 몇 틱 넘긴다
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    };

    it('프리로드가 끝나야 capture가 호출되고, decor fade가 끝나야 완료된다 (질문 피드)', async () => {
      const item: FeedItem = {
        id: 'feed-order-question',
        title: 'Test',
        type: 'DAILY_QUESTION',
        place: '',
        question: '오늘의 질문',
        thumbnailUrl: 'https://example.com/order-thumb.jpg',
        heroPreviewUrl: 'https://example.com/order-hero.jpg',
        participantAvatarUrls: [],
        date: new Date().toISOString(),
        photoCount: 1,
      };
      const images = stubImage();
      const capture = vi.fn();
      const source = document.createElement('div');
      let settled = false;

      const promise = runFeedHeroTransition(item, source, capture).then(() => {
        settled = true;
      });

      // 이미지 로드가 끝나기 전에는 capture가 호출되면 안 된다
      expect(capture).not.toHaveBeenCalled();

      await resolveAllImages(images);

      // 프리로드가 끝난 직후 capture는 호출되지만, decor fade(100ms)가 끝나기 전이라 아직 완료되지 않는다
      expect(capture).toHaveBeenCalledWith(item, source);
      expect(settled).toBe(false);

      await vi.advanceTimersByTimeAsync(100);

      expect(settled).toBe(true);
      await promise;
    });

    it('질문 피드가 아니면 decor fade 없이 프리로드 직후 완료된다', async () => {
      const item: FeedItem = {
        id: 'feed-order-general',
        title: 'Test',
        type: 'GENERAL',
        place: '서울',
        question: '',
        thumbnailUrl: 'https://example.com/order-general-thumb.jpg',
        heroPreviewUrl: 'https://example.com/order-general-hero.jpg',
        participantAvatarUrls: [],
        date: new Date().toISOString(),
        photoCount: 1,
      };
      const images = stubImage();
      const capture = vi.fn();
      const source = document.createElement('div');

      const promise = runFeedHeroTransition(item, source, capture);
      await resolveAllImages(images);

      await expect(promise).resolves.toBeUndefined();
      expect(capture).toHaveBeenCalledWith(item, source);
    });
  });
});
