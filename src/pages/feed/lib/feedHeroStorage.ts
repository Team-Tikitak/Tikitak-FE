import { normalizeImageUrl } from '@/shared/lib';
import {
  safeSessionGet,
  safeSessionRemove,
  safeSessionSet,
} from '@/shared/lib/storage/sessionStore';
import type { FeedItem } from '../model/types';

const FEED_HERO_STORAGE_KEY = 'tikitak:last-feed-hero';
const FEED_HERO_MAX_AGE_MS = 10 * 60 * 1000;

// 같은 런타임에서 저장된 히어로만 복원해, 리로드 후 예전 히어로가 맥락 없이 재생되는 것을 막는다.
let storedInThisRuntime = false;

export interface StoredFeedHero {
  feedId: string;
  thumbnailUrl: string;
  heroPreviewUrl: string;
  createdAt: number;
  left: number;
  top: number;
  width: number;
  height: number;
}

const isStoredFeedHero = (value: Partial<StoredFeedHero>): value is StoredFeedHero =>
  Boolean(value.feedId) &&
  typeof value.thumbnailUrl === 'string' &&
  typeof value.heroPreviewUrl === 'string' &&
  typeof value.createdAt === 'number' &&
  typeof value.left === 'number' &&
  typeof value.top === 'number' &&
  typeof value.width === 'number' &&
  typeof value.height === 'number';

export const readStoredFeedHero = (): StoredFeedHero | null => {
  const raw = safeSessionGet(FEED_HERO_STORAGE_KEY);
  if (!raw) return null;
  if (!storedInThisRuntime) {
    clearStoredFeedHero();
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<StoredFeedHero>;
    if (!isStoredFeedHero(parsed)) {
      clearStoredFeedHero();
      return null;
    }

    if (Date.now() - parsed.createdAt > FEED_HERO_MAX_AGE_MS) {
      clearStoredFeedHero();
      return null;
    }

    return parsed;
  } catch {
    clearStoredFeedHero();
    return null;
  }
};

export const clearStoredFeedHero = (): void => {
  safeSessionRemove(FEED_HERO_STORAGE_KEY);
};

export const storeFeedHero = (item: FeedItem, rect: DOMRect): StoredFeedHero => {
  const thumbnailUrl = normalizeImageUrl(item.thumbnailUrl) ?? '';
  const heroPreviewUrl = normalizeImageUrl(item.heroPreviewUrl) ?? thumbnailUrl;
  const payload: StoredFeedHero = {
    feedId: item.id,
    thumbnailUrl,
    heroPreviewUrl,
    createdAt: Date.now(),
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
  };
  if (!thumbnailUrl && !heroPreviewUrl) {
    return payload;
  }
  storedInThisRuntime = true;
  safeSessionSet(FEED_HERO_STORAGE_KEY, JSON.stringify(payload));
  return payload;
};
