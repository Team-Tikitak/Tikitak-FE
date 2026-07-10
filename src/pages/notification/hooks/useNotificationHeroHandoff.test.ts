import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useNotificationHeroHandoff } from './useNotificationHeroHandoff';
import { storeNotificationHero } from '../lib/notificationHeroStorage';
import type { NotificationListItem } from './useNotifications';
import type { RefObject } from 'react';
import type { NavigationType } from 'react-router';

// MutationObserver 기반 비행 착지 감지(ssgoi DOM 결합)는 여기서 다루지 않는다 —
// 사본 요소가 DOM에 없는 경로로만 핸드오프 완료를 검증한다.

const HERO_STORAGE_KEY = 'tikitak:last-notification-hero';

const NOTIFICATION: NotificationListItem = {
  id: 11,
  body: '알림 본문',
  feedId: 7,
  avatarUrl: null,
  thumbnailUrl: 'https://img.example/thumb.jpg',
  heroPreviewUrl: null,
  createdAt: '2026-07-10T00:00:00.000Z',
  read: false,
};

const HERO_PAYLOAD = {
  notificationId: NOTIFICATION.id,
  feedId: NOTIFICATION.feedId,
  thumbnailUrl: NOTIFICATION.thumbnailUrl as string,
  left: 10,
  top: 20,
  width: 48,
  height: 48,
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

interface HookProps {
  navigationType: NavigationType;
  scrollRestored: boolean;
  notifications: NotificationListItem[];
  scrollFrameRef: RefObject<HTMLElement | null>;
}

const renderHandoff = (props: Partial<HookProps> = {}) =>
  renderHook((current: HookProps) => useNotificationHeroHandoff(current), {
    initialProps: {
      navigationType: 'POP' as NavigationType,
      scrollRestored: true,
      notifications: [NOTIFICATION],
      scrollFrameRef: { current: null },
      ...props,
    },
  });

const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms));

describe('useNotificationHeroHandoff', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.sessionStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    window.sessionStorage.clear();
  });

  it('POP 복귀 시 저장된 히어로를 복원하고 해당 알림을 suppress한다', () => {
    storeNotificationHero(HERO_PAYLOAD);
    const { result } = renderHandoff({ scrollRestored: false });

    expect(result.current.storedHero?.notificationId).toBe(NOTIFICATION.id);
    expect(result.current.storedHeroVisible).toBe(true);
    expect(result.current.suppressedNotificationId).toBe(NOTIFICATION.id);
  });

  it('POP이 아닌 진입에서는 저장된 히어로를 복원하지 않고 폐기한다', () => {
    storeNotificationHero(HERO_PAYLOAD);
    const { result } = renderHandoff({ navigationType: 'PUSH' as NavigationType });

    expect(result.current.storedHero).toBeNull();
    expect(result.current.suppressedNotificationId).toBeNull();
    expect(window.sessionStorage.getItem(HERO_STORAGE_KEY)).toBeNull();
  });

  it('스크롤이 복원되면 핸드오프가 시작되어 페이드 후 사본을 정리한다', () => {
    storeNotificationHero(HERO_PAYLOAD);
    const { result, rerender } = renderHandoff({ scrollRestored: false });

    // 스크롤 복원 전에는 핸드오프 시작 금지
    advance(2000);
    expect(result.current.storedHeroVisible).toBe(true);

    rerender({
      navigationType: 'POP' as NavigationType,
      scrollRestored: true,
      notifications: [NOTIFICATION],
      scrollFrameRef: { current: null },
    });

    // 사본 DOM이 없으므로 즉시 finish — 페이드(120ms) 후 suppress 해제
    advance(120);
    expect(result.current.storedHeroVisible).toBe(false);
    expect(result.current.suppressedNotificationId).toBeNull();

    // 정리(260ms) 후 저장분 제거
    advance(140);
    expect(result.current.storedHero).toBeNull();
    expect(window.sessionStorage.getItem(HERO_STORAGE_KEY)).toBeNull();
  });

  it('목록에 해당 알림이 로드되기 전에는 핸드오프를 미룬다', () => {
    storeNotificationHero(HERO_PAYLOAD);
    const { result, rerender } = renderHandoff({ notifications: [] });

    advance(2000);
    expect(result.current.storedHeroVisible).toBe(true);

    rerender({
      navigationType: 'POP' as NavigationType,
      scrollRestored: true,
      notifications: [NOTIFICATION],
      scrollFrameRef: { current: null },
    });

    advance(260);
    expect(result.current.storedHero).toBeNull();
  });

  it('복원된 사본이 소비되지 않으면 최대 수명(5초) 후 폐기한다', () => {
    storeNotificationHero(HERO_PAYLOAD);
    const { result } = renderHandoff({ scrollRestored: false });

    advance(5000);

    expect(result.current.storedHero).toBeNull();
    expect(result.current.storedHeroVisible).toBe(false);
    expect(window.sessionStorage.getItem(HERO_STORAGE_KEY)).toBeNull();
  });

  it('출발 캡처는 프레임 기준 좌표로 저장하고 즉시 suppress한다', () => {
    const frameParent = document.createElement('div');
    const frame = document.createElement('div');
    frameParent.appendChild(frame);
    frameParent.getBoundingClientRect = () => rect(10, 20, 390, 700);

    const source = document.createElement('button');
    source.getBoundingClientRect = () => rect(30, 40, 48, 48);

    const { result } = renderHandoff({
      navigationType: 'PUSH' as NavigationType,
      scrollFrameRef: { current: frame },
    });

    act(() => result.current.captureNotificationHero(NOTIFICATION, source));

    expect(result.current.storedHero).toMatchObject({
      notificationId: NOTIFICATION.id,
      feedId: NOTIFICATION.feedId,
      left: 20,
      top: 20,
      width: 48,
      height: 48,
    });
    expect(result.current.storedHeroVisible).toBe(true);
    expect(result.current.suppressedNotificationId).toBe(NOTIFICATION.id);
    expect(window.sessionStorage.getItem(HERO_STORAGE_KEY)).not.toBeNull();
  });

  it('출발 캡처 후 이동이 취소되면 지연 복구되어 사본을 정리한다', () => {
    const source = document.createElement('button');
    source.getBoundingClientRect = () => rect(30, 40, 48, 48);

    const { result } = renderHandoff({ navigationType: 'PUSH' as NavigationType });

    act(() => result.current.captureNotificationHero(NOTIFICATION, source));
    expect(result.current.storedHeroVisible).toBe(true);

    // 출발용 히어로는 핸드오프 대신 1500ms 복구 타이머만 걸린다
    advance(1400);
    expect(result.current.storedHeroVisible).toBe(true);

    advance(100 + 260);
    expect(result.current.storedHero).toBeNull();
    expect(window.sessionStorage.getItem(HERO_STORAGE_KEY)).toBeNull();
  });

  it('썸네일이 없는 알림은 캡처하지 않는다', () => {
    const source = document.createElement('button');
    source.getBoundingClientRect = () => rect(30, 40, 48, 48);

    const { result } = renderHandoff({ navigationType: 'PUSH' as NavigationType });

    act(() =>
      result.current.captureNotificationHero({ ...NOTIFICATION, thumbnailUrl: null }, source),
    );

    expect(result.current.storedHero).toBeNull();
    expect(window.sessionStorage.getItem(HERO_STORAGE_KEY)).toBeNull();
  });
});
