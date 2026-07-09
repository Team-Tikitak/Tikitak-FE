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
      void image
        .decode()
        .then(resolve)
        .catch(() => resolve());
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

// 뱃지 fade 완료를 기다리지 않고 캡처 직후 바로 navigate로 이어지도록 한다. ssgoi가 전환 중
// 이전 페이지 DOM을 유지하므로, fade는 navigate와 동시에 트리거돼도 CSS transition이 화면에
// 그려질 시간은 충분하다 — 여기서 인위적으로 기다리면 "뱃지 사라짐"과 "히어로 시작" 사이에
// 체감 공백만 늘어난다.
export const runFeedHeroTransition = async (
  item: FeedItem,
  source: HTMLElement | null,
  capture: (item: FeedItem, source: HTMLElement) => void,
): Promise<void> => {
  await preloadFeedHeroAssets(item);
  if (source) capture(item, source);
};
