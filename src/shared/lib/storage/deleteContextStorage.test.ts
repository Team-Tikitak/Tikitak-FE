import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { consumeFeedDeleting, markFeedDeleting } from './deleteContextStorage';

const STORAGE_KEY = 'tikitak:feed-deleting';

describe('deleteContextStorage', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-29T00:00:00Z'));
  });
  afterEach(() => {
    sessionStorage.clear();
    vi.useRealTimers();
  });

  it('returns false when nothing was marked', () => {
    expect(consumeFeedDeleting()).toBe(false);
  });

  it('returns true within TTL after marking', () => {
    markFeedDeleting();
    expect(sessionStorage.getItem(STORAGE_KEY)).not.toBeNull();
    expect(consumeFeedDeleting()).toBe(true);
  });

  it('removes the key after consume', () => {
    markFeedDeleting();
    consumeFeedDeleting();
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('returns false when TTL has expired', () => {
    markFeedDeleting();
    vi.advanceTimersByTime(2000);
    expect(consumeFeedDeleting()).toBe(false);
  });

  it('second consume returns false even within TTL', () => {
    markFeedDeleting();
    expect(consumeFeedDeleting()).toBe(true);
    expect(consumeFeedDeleting()).toBe(false);
  });
});
