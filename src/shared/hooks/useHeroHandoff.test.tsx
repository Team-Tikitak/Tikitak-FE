import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearStoredHero, readStoredHero, storeHero } from '@/shared/lib/hero/heroStorage';
import { useHeroHandoff, type HeroSourceItem } from './useHeroHandoff';
import type { RefObject } from 'react';
import type { NavigationType } from 'react-router';

const STORAGE_KEY = 'tikitak:test-hero-handoff';

const HERO_ITEM: HeroSourceItem = {
  id: '1',
  heroKey: 'pin-1',
  thumbnailUrl: 'https://example.com/pick.jpg',
};

const rect = (left: number, top: number, width: number, height: number): DOMRect =>
  ({
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    x: left,
    y: top,
    toJSON: () => ({}),
  }) as DOMRect;

const createSource = (sourceRect: DOMRect) => {
  const source = document.createElement('img');
  source.getBoundingClientRect = () => sourceRect;
  return source;
};

const renderHandoff = (
  scrollFrameRef: RefObject<HTMLElement | null>,
  options: Partial<Parameters<typeof useHeroHandoff>[0]> = {},
) =>
  renderHook(() =>
    useHeroHandoff({
      storageKey: STORAGE_KEY,
      navigationType: 'PUSH' as NavigationType,
      scrollRestored: true,
      isItemLoaded: () => true,
      scrollFrameRef,
      ...options,
    }),
  );

describe('useHeroHandoff', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.sessionStorage.clear();
    clearStoredHero(STORAGE_KEY);
  });

  afterEach(() => {
    vi.useRealTimers();
    window.sessionStorage.clear();
    clearStoredHero(STORAGE_KEY);
  });

  it('기본 좌표 모드는 기존처럼 스크롤 프레임의 부모 기준으로 저장한다', () => {
    const parentFrame = document.createElement('div');
    parentFrame.getBoundingClientRect = () => rect(0, 40, 390, 700);
    const scrollFrame = document.createElement('div');
    Object.defineProperty(scrollFrame, 'scrollTop', { configurable: true, value: 240 });
    parentFrame.append(scrollFrame);

    const { result } = renderHandoff({ current: scrollFrame });

    act(() => {
      result.current.captureHero(HERO_ITEM, createSource(rect(20, 180, 160, 204)));
    });

    const stored = readStoredHero(STORAGE_KEY);
    expect(stored?.left).toBe(20);
    expect(stored?.top).toBe(140);
  });

  it('scroll-content 좌표 모드는 스크롤된 콘텐츠 기준으로 저장한다', () => {
    const scrollFrame = document.createElement('div');
    scrollFrame.getBoundingClientRect = () => rect(0, 100, 390, 600);
    Object.defineProperty(scrollFrame, 'scrollTop', { configurable: true, value: 240 });
    Object.defineProperty(scrollFrame, 'scrollLeft', { configurable: true, value: 12 });

    const { result } = renderHandoff(
      { current: scrollFrame },
      { heroCoordinateMode: 'scroll-content' },
    );

    act(() => {
      result.current.captureHero(HERO_ITEM, createSource(rect(20, 180, 160, 204)));
    });

    const stored = readStoredHero(STORAGE_KEY);
    expect(stored?.left).toBe(32);
    expect(stored?.top).toBe(320);
  });

  it('캡처된 히어로와 원본이 겹치지 않도록 원본 itemId를 숨김 대상으로 반환한다', () => {
    const scrollFrame = document.createElement('div');
    const { result } = renderHandoff({ current: scrollFrame });

    act(() => {
      result.current.captureHero(HERO_ITEM, createSource(rect(20, 180, 160, 204)));
    });

    expect(result.current.storedHeroVisible).toBe(true);
    expect(result.current.suppressedItemId).toBe('1');
  });

  it('renderCapturedHero가 false면 복귀용 히어로만 저장하고 현재 목록은 숨기지 않는다', () => {
    const scrollFrame = document.createElement('div');
    const { result } = renderHandoff({ current: scrollFrame }, { renderCapturedHero: false });

    act(() => {
      result.current.captureHero(HERO_ITEM, createSource(rect(20, 180, 160, 204)));
    });

    expect(readStoredHero(STORAGE_KEY)?.itemId).toBe('1');
    expect(result.current.storedHero).toBeNull();
    expect(result.current.storedHeroVisible).toBe(false);
    expect(result.current.suppressedItemId).toBeNull();
  });

  it('복귀 시 현재 원본 DOM 좌표로 저장 히어로 위치를 보정한다', () => {
    storeHero(STORAGE_KEY, {
      itemId: HERO_ITEM.id,
      heroKey: HERO_ITEM.heroKey,
      thumbnailUrl: HERO_ITEM.thumbnailUrl,
      heroPreviewUrl: HERO_ITEM.thumbnailUrl,
      left: 10,
      top: 20,
      width: 90,
      height: 90,
    });
    const scrollFrame = document.createElement('div');
    scrollFrame.getBoundingClientRect = () => rect(0, 100, 390, 600);
    Object.defineProperty(scrollFrame, 'scrollTop', { configurable: true, value: 300 });
    const currentSource = createSource(rect(60, 260, 92, 92));

    const { result } = renderHandoff(
      { current: scrollFrame },
      {
        navigationType: 'POP' as NavigationType,
        heroCoordinateMode: 'scroll-content',
        getCurrentSource: () => currentSource,
      },
    );

    expect(result.current.storedHero).toEqual(
      expect.objectContaining({
        left: 60,
        top: 460,
        width: 92,
        height: 92,
      }),
    );
  });

  it('복귀 히어로 비행이 늦게 시작되면 착지할 때까지 원본 숨김을 유지한다', () => {
    storeHero(STORAGE_KEY, {
      itemId: HERO_ITEM.id,
      heroKey: HERO_ITEM.heroKey,
      thumbnailUrl: HERO_ITEM.thumbnailUrl,
      heroPreviewUrl: HERO_ITEM.thumbnailUrl,
      left: 10,
      top: 20,
      width: 90,
      height: 90,
    });
    const storedHeroCopy = document.createElement('img');
    storedHeroCopy.dataset.storedHero = '';
    document.body.append(storedHeroCopy);

    const { result } = renderHandoff(
      { current: document.createElement('div') },
      { navigationType: 'POP' as NavigationType },
    );

    expect(result.current.storedHeroVisible).toBe(true);

    act(() => {
      vi.advanceTimersByTime(250);
    });
    storedHeroCopy.style.opacity = '0';
    act(() => {
      vi.advanceTimersByTime(50);
    });

    expect(result.current.storedHeroVisible).toBe(true);
    expect(result.current.suppressedItemId).toBe(HERO_ITEM.id);

    storedHeroCopy.style.opacity = '';
    act(() => {
      vi.advanceTimersByTime(50);
    });
    act(() => {
      vi.advanceTimersByTime(120);
    });

    expect(result.current.storedHeroVisible).toBe(false);
    expect(result.current.suppressedItemId).toBeNull();

    storedHeroCopy.remove();
  });
});
