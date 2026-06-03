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
