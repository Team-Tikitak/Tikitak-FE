import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { readFeedViewMode, storeFeedViewMode } from './viewModeStorage';

const STORAGE_KEY = 'tikitak:feed-view-mode';

describe('viewModeStorage', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  afterEach(() => {
    window.sessionStorage.clear();
  });

  it('defaults to grid when nothing stored', () => {
    expect(readFeedViewMode()).toBe('grid');
  });

  it('falls back to grid when stored value is invalid', () => {
    window.sessionStorage.setItem(STORAGE_KEY, 'unexpected');
    expect(readFeedViewMode()).toBe('grid');
  });

  it('persists and reads grid mode', () => {
    storeFeedViewMode('grid');
    expect(readFeedViewMode()).toBe('grid');
  });

  it('persists and reads list mode', () => {
    storeFeedViewMode('list');
    expect(readFeedViewMode()).toBe('list');
  });
});
