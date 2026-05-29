import type { FeedViewMode } from '../ui/FeedCountToolbar';

const FEED_VIEW_MODE_KEY = 'tikitak:feed-view-mode';

export const readFeedViewMode = (): FeedViewMode => {
  if (typeof window === 'undefined') return 'list';
  const stored = window.sessionStorage.getItem(FEED_VIEW_MODE_KEY);
  return stored === 'grid' || stored === 'list' ? stored : 'list';
};

export const storeFeedViewMode = (mode: FeedViewMode): void => {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(FEED_VIEW_MODE_KEY, mode);
};
