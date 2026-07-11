import type { FeedItem } from '../model/types';

const HERO_PRELOAD_TIMEOUT_MS = 300;
const IMAGE_PRELOAD_CACHE_LIMIT = 150;
interface PreloadedImageInfo {
  width: number;
  height: number;
}

interface FeedHeroTransitionResult {
  imageAspectRatio?: number;
}

const imagePreloadCache = new Map<string, Promise<PreloadedImageInfo | null>>();
const imageVoidPreloadCache = new Map<string, Promise<void>>();

const preloadImageInfo = (url: string): Promise<PreloadedImageInfo | null> => {
  if (!url) return Promise.resolve(null);
  const cached = imagePreloadCache.get(url);
  if (cached) return cached;

  const preload = new Promise<PreloadedImageInfo | null>((resolve) => {
    const image = new Image();
    const resolveWithInfo = () => {
      resolve(
        image.naturalWidth && image.naturalHeight
          ? { width: image.naturalWidth, height: image.naturalHeight }
          : null,
      );
    };
    image.onload = () => {
      if (typeof image.decode !== 'function') {
        resolveWithInfo();
        return;
      }
      void image.decode().then(resolveWithInfo).catch(resolveWithInfo);
    };
    image.onerror = () => resolve(null);
    image.src = url;
  });
  imagePreloadCache.set(url, preload);
  if (imagePreloadCache.size > IMAGE_PRELOAD_CACHE_LIMIT) {
    const oldestKey = imagePreloadCache.keys().next().value;
    if (oldestKey) {
      imagePreloadCache.delete(oldestKey);
      imageVoidPreloadCache.delete(oldestKey);
    }
  }
  return preload;
};

export const preloadImage = (url: string): Promise<void> => {
  if (!url) return Promise.resolve();
  const cached = imageVoidPreloadCache.get(url);
  if (cached) return cached;
  const preload = preloadImageInfo(url).then(() => undefined);
  imageVoidPreloadCache.set(url, preload);
  return preload;
};

export const preloadFeedHeroAssets = (item: FeedItem) =>
  Promise.race([
    Promise.all([preloadImageInfo(item.thumbnailUrl), preloadImageInfo(item.heroPreviewUrl)]).then(
      ([thumbnailInfo, heroPreviewInfo]) => heroPreviewInfo ?? thumbnailInfo ?? null,
    ),
    new Promise<PreloadedImageInfo | null>((resolve) =>
      window.setTimeout(() => resolve(null), HERO_PRELOAD_TIMEOUT_MS),
    ),
  ]);

// 뱃지 fade 완료를 기다리지 않고 캡처 직후 바로 navigate로 이어지도록 한다. ssgoi가 전환 중
// 이전 페이지 DOM을 유지하므로, fade는 navigate와 동시에 트리거돼도 CSS transition이 화면에
// 그려질 시간은 충분하다 — 여기서 인위적으로 기다리면 "뱃지 사라짐"과 "히어로 시작" 사이에
// 체감 공백만 늘어난다.
export const runFeedHeroTransition = async (
  item: FeedItem,
  source: HTMLElement | null,
  capture: (item: FeedItem, source: HTMLElement) => void,
): Promise<FeedHeroTransitionResult> => {
  const heroInfo = await preloadFeedHeroAssets(item);
  if (source) capture(item, source);
  return {
    imageAspectRatio:
      heroInfo?.width && heroInfo.height ? heroInfo.width / heroInfo.height : undefined,
  };
};
