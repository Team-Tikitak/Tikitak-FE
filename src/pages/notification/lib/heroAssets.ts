import { normalizeImageUrl } from '@/shared/lib';

const HERO_PRELOAD_TIMEOUT_MS = 180;
const IMAGE_PRELOAD_CACHE_LIMIT = 50;
const imagePreloadCache = new Map<string, Promise<void>>();

const preloadImage = (url: string | null | undefined): Promise<void> => {
  const normalized = normalizeImageUrl(url);
  if (!normalized) return Promise.resolve();
  const cached = imagePreloadCache.get(normalized);
  if (cached) return cached;

  const preload = new Promise<void>((resolve) => {
    const image = new Image();
    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = normalized;
  });
  imagePreloadCache.set(normalized, preload);
  if (imagePreloadCache.size > IMAGE_PRELOAD_CACHE_LIMIT) {
    const oldestKey = imagePreloadCache.keys().next().value;
    if (oldestKey) imagePreloadCache.delete(oldestKey);
  }
  return preload;
};

interface NotificationHeroAssets {
  thumbnailUrl: string | null;
  heroPreviewUrl: string | null;
}

/** 히어로 전환에 쓰일 썸네일/프리뷰를 미리 로드. 지연은 최대 180ms로 제한 */
export const preloadNotificationHeroAssets = (assets: NotificationHeroAssets): Promise<void> =>
  Promise.race([
    Promise.all([preloadImage(assets.thumbnailUrl), preloadImage(assets.heroPreviewUrl)]).then(
      () => undefined,
    ),
    new Promise<void>((resolve) => window.setTimeout(resolve, HERO_PRELOAD_TIMEOUT_MS)),
  ]);
