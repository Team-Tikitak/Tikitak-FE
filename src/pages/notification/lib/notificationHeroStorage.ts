import {
  safeSessionGet,
  safeSessionRemove,
  safeSessionSet,
} from '@/shared/lib/storage/sessionStore';

const NOTIFICATION_HERO_STORAGE_KEY = 'tikitak:last-notification-hero';
const NOTIFICATION_HERO_MAX_AGE_MS = 10 * 60 * 1000;

// 같은 런타임에서 저장된 히어로만 복원해, 리로드 후 예전 히어로가 맥락 없이 재생되는 것을 막는다.
let storedInThisRuntime = false;

export interface StoredNotificationHero {
  notificationId: number;
  feedId: number;
  thumbnailUrl: string;
  createdAt: number;
  left: number;
  top: number;
  width: number;
  height: number;
}

const isStoredNotificationHero = (
  value: Partial<StoredNotificationHero>,
): value is StoredNotificationHero =>
  typeof value.notificationId === 'number' &&
  typeof value.feedId === 'number' &&
  typeof value.thumbnailUrl === 'string' &&
  value.thumbnailUrl !== '' &&
  typeof value.createdAt === 'number' &&
  typeof value.left === 'number' &&
  typeof value.top === 'number' &&
  typeof value.width === 'number' &&
  typeof value.height === 'number';

export const readStoredNotificationHero = (): StoredNotificationHero | null => {
  const raw = safeSessionGet(NOTIFICATION_HERO_STORAGE_KEY);
  if (!raw) return null;
  if (!storedInThisRuntime) {
    clearStoredNotificationHero();
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<StoredNotificationHero>;
    if (!isStoredNotificationHero(parsed)) {
      clearStoredNotificationHero();
      return null;
    }

    if (Date.now() - parsed.createdAt > NOTIFICATION_HERO_MAX_AGE_MS) {
      clearStoredNotificationHero();
      return null;
    }

    return parsed;
  } catch {
    clearStoredNotificationHero();
    return null;
  }
};

export const clearStoredNotificationHero = (): void => {
  safeSessionRemove(NOTIFICATION_HERO_STORAGE_KEY);
};

export const storeNotificationHero = (
  payload: Omit<StoredNotificationHero, 'createdAt'>,
): StoredNotificationHero => {
  const stored: StoredNotificationHero = { ...payload, createdAt: Date.now() };
  storedInThisRuntime = true;
  safeSessionSet(NOTIFICATION_HERO_STORAGE_KEY, JSON.stringify(stored));
  return stored;
};
