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

// 질문 장식(테두리·칩) 페이드아웃 중 네비게이션을 잡아주는 시간.
const QUESTION_DECOR_FADE_OUT_MS = 100;

export const waitForQuestionDecorFade = (item: FeedItem): Promise<void> =>
  item.type === 'DAILY_QUESTION'
    ? new Promise<void>((resolve) => window.setTimeout(resolve, QUESTION_DECOR_FADE_OUT_MS))
    : Promise.resolve();

export const preloadFeedHeroAssets = (item: FeedItem) =>
  Promise.race([
    Promise.all([preloadImage(item.thumbnailUrl), preloadImage(item.heroPreviewUrl)]).then(
      () => undefined,
    ),
    new Promise<void>((resolve) => window.setTimeout(resolve, HERO_PRELOAD_TIMEOUT_MS)),
  ]);

// 뱃지 fade와 히어로 비행이 붙어 보이도록, 프리로드가 끝난 뒤에야 fade를 시작한다.
// FeedGrid/FeedPage가 각자 구현하면 순서가 어긋날 수 있어 공용 헬퍼로 강제한다.
export const runFeedHeroTransition = async (
  item: FeedItem,
  source: HTMLElement | null,
  capture: (item: FeedItem, source: HTMLElement) => void,
): Promise<void> => {
  await preloadFeedHeroAssets(item);
  if (source) capture(item, source);
  await waitForQuestionDecorFade(item);
};
