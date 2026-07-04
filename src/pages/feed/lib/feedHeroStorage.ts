import { normalizeImageUrl } from '@/shared/lib';
import {
  safeSessionGet,
  safeSessionRemove,
  safeSessionSet,
} from '@/shared/lib/storage/sessionStore';
import type { FeedItem } from '../model/types';

const FEED_HERO_STORAGE_KEY = 'tikitak:last-feed-hero';

export interface StoredFeedHero {
  feedId: string;
  thumbnailUrl: string;
  heroPreviewUrl: string;
  left: number;
  top: number;
  width: number;
  height: number;
}

const isStoredFeedHero = (value: Partial<StoredFeedHero>): value is StoredFeedHero =>
  Boolean(value.feedId) &&
  typeof value.thumbnailUrl === 'string' &&
  typeof value.heroPreviewUrl === 'string' &&
  typeof value.left === 'number' &&
  typeof value.top === 'number' &&
  typeof value.width === 'number' &&
  typeof value.height === 'number';

export const readStoredFeedHero = (): StoredFeedHero | null => {
  const raw = safeSessionGet(FEED_HERO_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<StoredFeedHero>;
    return isStoredFeedHero(parsed) ? parsed : null;
  } catch {
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
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
  };
  safeSessionSet(FEED_HERO_STORAGE_KEY, JSON.stringify(payload));
  return payload;
};
