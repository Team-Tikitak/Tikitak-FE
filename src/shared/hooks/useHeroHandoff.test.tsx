import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearStoredHero, readStoredHero } from '@/shared/lib/hero/heroStorage';
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
});
