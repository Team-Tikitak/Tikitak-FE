const FEED_DELETE_KEY = 'tikitak:feed-deleting';
const TTL_MS = 1500;

export const markFeedDeleting = (): void => {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(FEED_DELETE_KEY, String(Date.now()));
};

export const consumeFeedDeleting = (): boolean => {
  if (typeof window === 'undefined') return false;
  const raw = window.sessionStorage.getItem(FEED_DELETE_KEY);
  if (!raw) return false;
  window.sessionStorage.removeItem(FEED_DELETE_KEY);
  return Date.now() - Number(raw) <= TTL_MS;
};
