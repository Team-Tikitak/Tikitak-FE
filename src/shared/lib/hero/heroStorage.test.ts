import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearStoredHero, readStoredHero, storeHero } from './heroStorage';

const STORAGE_KEY = 'tikitak:test-hero';

const makePayload = (overrides: Partial<Parameters<typeof storeHero>[1]> = {}) => ({
  itemId: '42',
  heroKey: 'pin-42',
  thumbnailUrl: 'https://example.com/thumb.jpg',
  heroPreviewUrl: '',
  left: 24,
  top: 180,
  width: 120,
  height: 160,
  ...overrides,
});

describe('heroStorage', () => {
  afterEach(() => {
    vi.useRealTimers();
    clearStoredHero(STORAGE_KEY);
  });

  it('stores visible source rect and falls back preview url to thumbnail url when empty', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-04T10:00:00Z'));

    const stored = storeHero(STORAGE_KEY, makePayload());

    expect(stored).toEqual({
      itemId: '42',
      heroKey: 'pin-42',
      thumbnailUrl: 'https://example.com/thumb.jpg',
      heroPreviewUrl: 'https://example.com/thumb.jpg',
      createdAt: new Date('2026-07-04T10:00:00Z').getTime(),
      left: 24,
      top: 180,
      width: 120,
      height: 160,
    });
    expect(readStoredHero(STORAGE_KEY)).toEqual(stored);
  });

  it('does not persist when neither thumbnail nor preview url is available', () => {
    storeHero(STORAGE_KEY, makePayload({ thumbnailUrl: '', heroPreviewUrl: '' }));

    expect(readStoredHero(STORAGE_KEY)).toBeNull();
  });

  it('keeps separate storage keys from interfering with each other', () => {
    storeHero(STORAGE_KEY, makePayload({ itemId: 'a' }));
    storeHero('tikitak:test-hero-2', makePayload({ itemId: 'b' }));

    expect(readStoredHero(STORAGE_KEY)?.itemId).toBe('a');
    expect(readStoredHero('tikitak:test-hero-2')?.itemId).toBe('b');

    clearStoredHero('tikitak:test-hero-2');
  });

  it('clears the stored hero source', () => {
    storeHero(STORAGE_KEY, makePayload());

    clearStoredHero(STORAGE_KEY);

    expect(readStoredHero(STORAGE_KEY)).toBeNull();
  });

  it('does not restore heroes stored before a reload (new js runtime)', async () => {
    storeHero(STORAGE_KEY, makePayload());
    expect(readStoredHero(STORAGE_KEY)).not.toBeNull();

    // 새로고침/콜드 스타트 시뮬레이션: sessionStorage는 남고 모듈 상태만 초기화된다
    vi.resetModules();
    const freshRuntime = await import('./heroStorage');

    expect(freshRuntime.readStoredHero(STORAGE_KEY)).toBeNull();
  });

  it('drops stale hero sources instead of replaying old coordinates', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-04T10:00:00Z'));

    storeHero(STORAGE_KEY, makePayload());

    vi.setSystemTime(new Date('2026-07-04T10:11:00Z'));

    expect(readStoredHero(STORAGE_KEY)).toBeNull();
  });
});
