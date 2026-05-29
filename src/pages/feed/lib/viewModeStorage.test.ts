import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { readFeedViewMode, storeFeedViewMode } from './viewModeStorage';

const STORAGE_KEY = 'tikitak:feed-view-mode';

describe('viewModeStorage', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });
  afterEach(() => {
    sessionStorage.clear();
  });

  it('defaults to list when nothing stored', () => {
    expect(readFeedViewMode()).toBe('list');
  });

  it('returns grid when grid is stored', () => {
    sessionStorage.setItem(STORAGE_KEY, 'grid');
    expect(readFeedViewMode()).toBe('grid');
  });

  it('returns list when list is stored', () => {
    sessionStorage.setItem(STORAGE_KEY, 'list');
    expect(readFeedViewMode()).toBe('list');
  });

  it('falls back to list when stored value is invalid', () => {
    sessionStorage.setItem(STORAGE_KEY, 'invalid');
    expect(readFeedViewMode()).toBe('list');
  });

  it('storeFeedViewMode persists to sessionStorage', () => {
    storeFeedViewMode('grid');
    expect(sessionStorage.getItem(STORAGE_KEY)).toBe('grid');
    storeFeedViewMode('list');
    expect(sessionStorage.getItem(STORAGE_KEY)).toBe('list');
  });
});
