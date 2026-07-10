import {
  safeSessionGet,
  safeSessionRemove,
  safeSessionSet,
} from '@/shared/lib/storage/sessionStore';

const HERO_MAX_AGE_MS = 10 * 60 * 1000;

// 같은 런타임에서 저장된 히어로만 복원해, 리로드 후 예전 히어로가 맥락 없이 재생되는 것을 막는다.
// storageKey별로 독립적으로 추적해야 페이지마다 다른 키를 써도 서로 간섭하지 않는다.
const storedRuntimeKeys = new Set<string>();

export interface StoredHero {
  itemId: string;
  heroKey: string;
  thumbnailUrl: string;
  heroPreviewUrl: string;
  createdAt: number;
  left: number;
  top: number;
  width: number;
  height: number;
}

const isStoredHero = (value: Partial<StoredHero>): value is StoredHero =>
  Boolean(value.itemId) &&
  typeof value.heroKey === 'string' &&
  typeof value.thumbnailUrl === 'string' &&
  typeof value.heroPreviewUrl === 'string' &&
  typeof value.createdAt === 'number' &&
  typeof value.left === 'number' &&
  typeof value.top === 'number' &&
  typeof value.width === 'number' &&
  typeof value.height === 'number';

export const readStoredHero = (storageKey: string): StoredHero | null => {
  const raw = safeSessionGet(storageKey);
  if (!raw) return null;
  if (!storedRuntimeKeys.has(storageKey)) {
    clearStoredHero(storageKey);
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<StoredHero>;
    if (!isStoredHero(parsed)) {
      clearStoredHero(storageKey);
      return null;
    }

    if (Date.now() - parsed.createdAt > HERO_MAX_AGE_MS) {
      clearStoredHero(storageKey);
      return null;
    }

    return parsed;
  } catch {
    clearStoredHero(storageKey);
    return null;
  }
};

export const clearStoredHero = (storageKey: string): void => {
  safeSessionRemove(storageKey);
};

export const storeHero = (
  storageKey: string,
  payload: Omit<StoredHero, 'createdAt'>,
): StoredHero => {
  const heroPreviewUrl = payload.heroPreviewUrl || payload.thumbnailUrl;
  const stored: StoredHero = { ...payload, heroPreviewUrl, createdAt: Date.now() };
  if (!stored.thumbnailUrl && !stored.heroPreviewUrl) {
    return stored;
  }
  storedRuntimeKeys.add(storageKey);
  safeSessionSet(storageKey, JSON.stringify(stored));
  return stored;
};
