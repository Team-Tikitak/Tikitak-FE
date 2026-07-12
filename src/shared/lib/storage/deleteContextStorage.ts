import { safeSessionGet, safeSessionRemove, safeSessionSet } from './sessionStore';

const FEED_DELETE_KEY = 'tikitak:feed-deleting';
const TTL_MS = 1500;

export const markFeedDeleting = (): void => {
  safeSessionSet(FEED_DELETE_KEY, String(Date.now()));
};

export const consumeFeedDeleting = (): boolean => {
  const raw = safeSessionGet(FEED_DELETE_KEY);
  if (!raw) return false;
  safeSessionRemove(FEED_DELETE_KEY);
  return Date.now() - Number(raw) <= TTL_MS;
};

// 소비하지 않고 확인만 한다 (플래그는 목록 전환 시 consumeFeedDeleting이 소비)
export const isFeedDeleting = (): boolean => {
  const raw = safeSessionGet(FEED_DELETE_KEY);
  return Boolean(raw) && Date.now() - Number(raw) <= TTL_MS;
};
