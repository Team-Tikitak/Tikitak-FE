import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useFirstVisitHint } from './useFirstVisitHint';

const STORAGE_KEY = 'test-first-visit-key';

describe('useFirstVisitHint', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  afterEach(() => {
    localStorage.clear();
  });

  it('returns seen=false on first visit', () => {
    const { result } = renderHook(() => useFirstVisitHint(STORAGE_KEY));
    expect(result.current.seen).toBe(false);
  });

  it('returns seen=true when localStorage flag is already set', () => {
    localStorage.setItem(STORAGE_KEY, '1');
    const { result } = renderHook(() => useFirstVisitHint(STORAGE_KEY));
    expect(result.current.seen).toBe(true);
  });

  it('markSeen sets seen=true and persists to localStorage', () => {
    const { result } = renderHook(() => useFirstVisitHint(STORAGE_KEY));
    act(() => result.current.markSeen());
    expect(result.current.seen).toBe(true);
    expect(localStorage.getItem(STORAGE_KEY)).toBe('1');
  });

  it('different keys do not share state', () => {
    const { result: a } = renderHook(() => useFirstVisitHint('key-a'));
    const { result: b } = renderHook(() => useFirstVisitHint('key-b'));
    act(() => a.current.markSeen());
    expect(a.current.seen).toBe(true);
    expect(b.current.seen).toBe(false);
  });
});
