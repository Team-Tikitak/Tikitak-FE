import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationPage } from './NotificationPage';
import { readStoredNotificationHero, storeNotificationHero } from '../lib/notificationHeroStorage';

const mockUseInfiniteNotifications = vi.fn();
const mockReadNotification = vi.fn();

vi.mock('@/shared/api/notification/queries', () => ({
  useInfiniteNotifications: (params: { teamId: number }) => mockUseInfiniteNotifications(params),
  useReadNotification: () => ({ mutate: mockReadNotification }),
}));

vi.mock('@/shared/hooks/team/useActiveTeamId', () => ({
  useActiveTeamId: () => 1,
}));

vi.mock('@/shared/hooks/useEdgeSwipeBack', () => ({
  useEdgeSwipeBack: vi.fn(),
}));

vi.mock('../hooks/useNotificationSettingsSheet', () => ({
  useNotificationSettingsSheet: () => ({ openSheet: vi.fn() }),
}));

// 프리로드는 최대 180ms 대기 레이스라 테스트에선 즉시 resolve로 대체
vi.mock('../lib/heroAssets', () => ({
  preloadNotificationHeroAssets: vi.fn(() => Promise.resolve()),
}));

const SCROLL_KEY = 'notification-scroll:1';

const makeNotification = (overrides: Partial<Record<string, unknown>> = {}) => ({
  notificationId: 11,
  body: '성정수님이 회원님의 사진에 댓글을 남겼습니다',
  feedId: 7,
  profileImageUrl: 'https://example.com/avatar.jpg',
  thumbnailImageUrl: 'https://example.com/thumb-7.jpg',
  heroPreviewUrl: 'https://example.com/preview-7.jpg',
  createdAt: new Date().toISOString(),
  isRead: false,
  ...overrides,
});

const mockFetchNextPage = vi.fn();

const setNotifications = (
  items: ReturnType<typeof makeNotification>[],
  extra: Partial<Record<string, unknown>> = {},
) => {
  mockUseInfiniteNotifications.mockReturnValue({
    data: { pages: [{ items }] },
    isLoading: false,
    isError: false,
    fetchNextPage: mockFetchNextPage,
    hasNextPage: false,
    isFetchingNextPage: false,
    ...extra,
  });
};

const FeedDetailProbe = () => {
  const state = useLocation().state as { heroKey?: string } | null;
  return <div data-testid="feed-detail-probe" data-hero-key={state?.heroKey} />;
};

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/notification']}>
      <Routes>
        <Route path="/notification" element={<NotificationPage />} />
        <Route path="/feed/:feedId" element={<FeedDetailProbe />} />
      </Routes>
    </MemoryRouter>,
  );

const getScrollContainer = (container: HTMLElement) =>
  container.querySelector<HTMLDivElement>('div.overflow-y-auto')!;

const getStoredHeroCopy = () =>
  document.querySelector<HTMLElement>('[data-stored-notification-hero]');

let intersectionCallbacks: IntersectionObserverCallback[] = [];

beforeAll(() => {
  // useScrollRestore는 rAF 기반 — 동기 실행으로 대체해 저장/복원을 즉시 관찰
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    callback(0);
    return 0;
  });
  vi.stubGlobal('cancelAnimationFrame', () => {});
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: IntersectionObserverCallback) {
        intersectionCallbacks.push(callback);
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  // jsdom은 레이아웃이 없어 스크롤 복원 조건(maxScrollTop ≥ saved)을 못 만족 — 치수 고정
  Object.defineProperty(Element.prototype, 'scrollHeight', { configurable: true, get: () => 1000 });
  Object.defineProperty(Element.prototype, 'clientHeight', { configurable: true, get: () => 600 });
});

beforeEach(() => {
  sessionStorage.clear();
  intersectionCallbacks = [];
  mockReadNotification.mockClear();
  mockFetchNextPage.mockClear();
  setNotifications([
    makeNotification(),
    makeNotification({
      notificationId: 12,
      feedId: 8,
      body: '이시언님이 회원님을 태그했습니다',
      thumbnailImageUrl: 'https://example.com/thumb-8.jpg',
      isRead: true,
    }),
  ]);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('NotificationPage - 스크롤 복원', () => {
  it('세션에 저장된 스크롤 위치를 마운트 시 복원한다', () => {
    sessionStorage.setItem(SCROLL_KEY, '250');
    const { container } = renderPage();

    expect(getScrollContainer(container).scrollTop).toBe(250);
  });

  it('스크롤하면 현재 위치를 팀별 키로 세션에 저장한다', () => {
    const { container } = renderPage();

    fireEvent.scroll(getScrollContainer(container), { target: { scrollTop: 320 } });

    expect(sessionStorage.getItem(SCROLL_KEY)).toBe('320');
  });
});

describe('NotificationPage - 히어로 핸드오프', () => {
  it('복귀(POP) 시 저장된 히어로 사본을 출발 좌표에 되살리고, 원본 썸네일의 exit-key는 감춘다', () => {
    storeNotificationHero({
      notificationId: 11,
      feedId: 7,
      thumbnailUrl: 'https://example.com/thumb-7.jpg',
      left: 20,
      top: 40,
      width: 52,
      height: 52,
    });

    renderPage();

    const copy = getStoredHeroCopy()!;
    expect(copy).not.toBeNull();
    expect(copy.getAttribute('data-hero-exit-key')).toBe('pin-7-n11');
    expect(copy.style.left).toBe('20px');
    expect(copy.style.top).toBe('40px');

    // 사본이 exit-key를 드는 동안 해당 알림의 원본 썸네일은 키를 내려놓는다
    const suppressedItem = screen.getByRole('link', { name: /성정수/ });
    expect(suppressedItem.querySelector('[data-hero-exit-key]')).toBeNull();
    // 다른 알림의 썸네일은 영향 없음
    const otherItem = screen.getByRole('link', { name: /이시언/ });
    expect(otherItem.querySelector('[data-hero-exit-key="pin-8-n12"]')).not.toBeNull();
  });

  it('사본이 떠 있는 동안 사용자가 스크롤하면 사본을 걷고 저장분도 지운다', () => {
    storeNotificationHero({
      notificationId: 11,
      feedId: 7,
      thumbnailUrl: 'https://example.com/thumb-7.jpg',
      left: 20,
      top: 40,
      width: 52,
      height: 52,
    });
    const { container } = renderPage();
    expect(getStoredHeroCopy()).not.toBeNull();

    fireEvent.scroll(getScrollContainer(container), { target: { scrollTop: 100 } });

    expect(getStoredHeroCopy()).toBeNull();
    expect(readStoredNotificationHero()).toBeNull();
  });
});

describe('NotificationPage - 무한 스크롤', () => {
  it('다음 페이지가 있을 때 센티널이 교차하면 fetchNextPage를 호출한다', () => {
    setNotifications([makeNotification()], { hasNextPage: true });
    renderPage();

    const callback = intersectionCallbacks.at(-1);
    expect(callback).toBeDefined();
    act(() => {
      callback!(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });

    expect(mockFetchNextPage).toHaveBeenCalled();
  });

  it('다음 페이지가 없으면 옵저버를 만들지 않는다', () => {
    renderPage();

    expect(intersectionCallbacks).toHaveLength(0);
  });
});

describe('NotificationPage - 알림 클릭 캡처', () => {
  const mockItemRect = () =>
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
      left: 20,
      top: 40,
      right: 72,
      bottom: 92,
      width: 52,
      height: 52,
      x: 20,
      y: 40,
      toJSON: () => ({}),
    } as DOMRect);

  it('안 읽은 알림 클릭 시 읽음 처리하고 히어로를 캡처한 뒤 heroKey와 함께 상세로 이동한다', async () => {
    mockItemRect();
    renderPage();

    fireEvent.click(screen.getByRole('link', { name: /성정수/ }));

    const probe = await screen.findByTestId('feed-detail-probe');
    expect(probe.getAttribute('data-hero-key')).toBe('pin-7-n11');
    expect(mockReadNotification).toHaveBeenCalledWith(11);
    expect(readStoredNotificationHero()?.notificationId).toBe(11);
  });

  it('이미 읽은 알림은 읽음 처리 없이 이동만 한다', async () => {
    mockItemRect();
    renderPage();

    fireEvent.click(screen.getByRole('link', { name: /이시언/ }));

    const probe = await screen.findByTestId('feed-detail-probe');
    expect(probe.getAttribute('data-hero-key')).toBe('pin-8-n12');
    expect(mockReadNotification).not.toHaveBeenCalled();
  });

  it('수정키(metaKey) 클릭은 SPA 네비게이션과 읽음 처리를 모두 건너뛴다', () => {
    renderPage();

    fireEvent.click(screen.getByRole('link', { name: /성정수/ }), { metaKey: true });

    expect(screen.queryByTestId('feed-detail-probe')).toBeNull();
    expect(screen.getByRole('link', { name: /성정수/ })).toBeInTheDocument();
    expect(mockReadNotification).not.toHaveBeenCalled();
  });
});
