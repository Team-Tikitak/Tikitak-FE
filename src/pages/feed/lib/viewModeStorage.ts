import { safeSessionGet, safeSessionSet } from '@/shared/lib/storage/sessionStore';
import type { FeedViewMode } from '../ui/FeedCountToolbar';

const FEED_VIEW_MODE_KEY = 'tikitak:feed-view-mode';

export const readFeedViewMode = (): FeedViewMode => {
  const stored = safeSessionGet(FEED_VIEW_MODE_KEY);
  return stored === 'grid' || stored === 'list' ? stored : 'grid';
};

export const storeFeedViewMode = (mode: FeedViewMode): void => {
  safeSessionSet(FEED_VIEW_MODE_KEY, mode);
};
