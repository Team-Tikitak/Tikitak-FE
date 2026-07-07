import type { FeedItem } from '../model/types';

const HERO_PRELOAD_TIMEOUT_MS = 300;
const IMAGE_PRELOAD_CACHE_LIMIT = 150;
const imagePreloadCache = new Map<string, Promise<void>>();

export const preloadImage = (url: string): Promise<void> => {
  if (!url) return Promise.resolve();
  const cached = imagePreloadCache.get(url);
  if (cached) return cached;

  const preload = new Promise<void>((resolve) => {
    const image = new Image();
    image.onload = () => {
      if (typeof image.decode !== 'function') {
        resolve();
        return;
      }
      void image.decode().then(resolve).catch(resolve);
    };
    image.onerror = () => resolve();
    image.src = url;
  });
  imagePreloadCache.set(url, preload);
  if (imagePreloadCache.size > IMAGE_PRELOAD_CACHE_LIMIT) {
    const oldestKey = imagePreloadCache.keys().next().value;
    if (oldestKey) imagePreloadCache.delete(oldestKey);
  }
  return preload;
};

export const preloadFeedHeroAssets = (item: FeedItem) =>
  Promise.race([
    Promise.all([preloadImage(item.thumbnailUrl), preloadImage(item.heroPreviewUrl)]).then(
      () => undefined,
    ),
    new Promise<void>((resolve) => window.setTimeout(resolve, HERO_PRELOAD_TIMEOUT_MS)),
  ]);
