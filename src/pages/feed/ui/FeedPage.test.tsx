import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { clearStoredHero, readStoredHero, storeHero } from '@/shared/lib/hero/heroStorage';
import { FeedPage } from './FeedPage';
import { runFeedHeroTransition } from '../lib/feedHeroAssets';
import { warmFeedDetail } from '../lib/warmFeedDetail';
import type { FeedItem } from '../model/types';
import type { ReactElement } from 'react';

const FEED_HERO_STORAGE_KEY = 'tikitak:last-feed-hero';
const { navigateMock, saveScrollPositionMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  saveScrollPositionMock: vi.fn(),
}));

const storeFeedHero = (feedItem: FeedItem, rect: DOMRect) =>
  storeHero(FEED_HERO_STORAGE_KEY, {
    itemId: feedItem.id,
    heroKey: `pin-${feedItem.id}`,
    thumbnailUrl: feedItem.thumbnailUrl,
    heroPreviewUrl: feedItem.heroPreviewUrl,
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
  });
const readStoredFeedHero = () => readStoredHero(FEED_HERO_STORAGE_KEY);
const clearStoredFeedHero = () => clearStoredHero(FEED_HERO_STORAGE_KEY);

vi.mock('../lib/warmFeedDetail', () => ({
  warmFeedDetail: vi.fn(),
}));

vi.mock('../lib/feedHeroAssets', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    runFeedHeroTransition: vi.fn(),
  };
});

vi.mock('react-router', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

const renderFeedPage = (ui: ReactElement) => {
  const queryClient = new QueryClient();
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

vi.mock('@/shared/api/user/queries', () => ({
  useMe: vi.fn(() => ({ data: { activeTeamId: 1 }, isPending: false })),
}));

vi.mock('@/shared/api/feed/queries', () => ({
  feedDetailQueryOptions: vi.fn(() => ({
    queryKey: ['feed', 'detail', 'mock'],
    queryFn: () => Promise.resolve(null),
  })),
  useInfiniteFeeds: vi.fn(() => ({
    data: {
      pages: [
        {
          items: [
            {
              feedId: 1,
              type: 'GENERAL',
              content: '테스트 게시물',
              thumbnailImageUrl: 'https://example.com/thumb.jpg',
              heroPreviewUrl: 'https://example.com/hero.jpg',
              imageCount: 1,
              author: {
                teamMemberId: 1,
                nickname: '작성자',
                profileImageUrl: '',
                anonymous: false,
                isAnonymous: false,
              },
              place: {
                placeId: 'place-1',
                name: '서울',
                latitude: 0,
                longitude: 0,
                address: '서울',
              },
              question: null,
              commentCount: 0,
              createdAt: '2026-07-06T00:00:00Z',
              updatedAt: '2026-07-06T00:00:00Z',
              taggedMembers: [],
            },
          ],
          pageInfo: { totalCount: 1, hasNext: false, nextCursor: null, size: 1 },
        },
      ],
    },
    isLoading: false,
    isError: false,
    fetchNextPage: vi.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
  })),
}));

vi.mock('@/shared/hooks', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('@/shared/hooks');
  return {
    ...actual,
    useInfiniteScroll: vi.fn(() => ({ observerRef: { current: null } })),
    useScrollRestore: vi.fn(() => ({
      scrollRef: { current: null },
      handleScroll: vi.fn(),
      saveScrollPosition: saveScrollPositionMock,
      restored: true,
    })),
  };
});

const createFeedItem = (overrides: Partial<FeedItem> = {}): FeedItem => ({
  id: '1',
  title: '테스트 게시물',
  type: 'GENERAL',
  place: '서울',
  question: '',
  thumbnailUrl: 'https://example.com/thumb.jpg',
  heroPreviewUrl: 'https://example.com/hero.jpg',
  participantAvatarUrls: [],
  date: '2026.07.06',
  photoCount: 1,
  ...overrides,
});

// 히어로 저장/읽기 로직 테스트
describe('FeedPage - Hero Management', () => {
  beforeEach(() => {
    clearStoredFeedHero();
    sessionStorage.clear();
    navigateMock.mockClear();
    saveScrollPositionMock.mockClear();
    vi.mocked(runFeedHeroTransition).mockResolvedValue({});
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should store and retrieve feed hero', () => {
    const feedItem = createFeedItem({
      id: 'feed-1',
      title: 'Test Feed',
      place: 'Seoul',
      date: new Date().toISOString(),
      photoCount: 3,
    });

    const rect = new DOMRect(10, 20, 100, 150);
    storeFeedHero(feedItem, rect);

    const retrieved = readStoredFeedHero();
    expect(retrieved).not.toBeNull();
    expect(retrieved?.itemId).toBe('feed-1');
    expect(retrieved?.thumbnailUrl).toBe('https://example.com/thumb.jpg');
    expect(retrieved?.left).toBe(10);
    expect(retrieved?.top).toBe(20);
  });

  it('should not store hero with empty URLs', () => {
    const feedItem = createFeedItem({
      id: 'feed-2',
      title: 'Empty Feed',
      place: 'Seoul',
      thumbnailUrl: '',
      heroPreviewUrl: '',
      date: new Date().toISOString(),
      photoCount: 0,
    });

    const rect = new DOMRect(0, 0, 100, 100);
    storeFeedHero(feedItem, rect);

    // 빈 URL 검증: sessionStorage에 저장되지 않아야 함
    const retrieved = readStoredFeedHero();
    expect(retrieved).toBeNull();
  });

  it('should clear stored hero', () => {
    const feedItem = createFeedItem({
      id: 'feed-3',
      title: 'Test Feed',
      place: 'Seoul',
      date: new Date().toISOString(),
      photoCount: 3,
    });

    const rect = new DOMRect(0, 0, 100, 100);
    storeFeedHero(feedItem, rect);

    expect(readStoredFeedHero()).not.toBeNull();

    clearStoredFeedHero();
    expect(readStoredFeedHero()).toBeNull();
  });

  it('should use fallback thumbnail when hero preview URL is missing', () => {
    const feedItem = createFeedItem({
      id: 'feed-4',
      title: 'Test Feed',
      place: 'Seoul',
      heroPreviewUrl: '',
      date: new Date().toISOString(),
    });

    const rect = new DOMRect(0, 0, 100, 100);
    const stored = storeFeedHero(feedItem, rect);

    // heroPreviewUrl이 없을 때 thumbnailUrl로 폴백
    expect(stored.heroPreviewUrl).toBe('https://example.com/thumb.jpg');
  });

  it('should handle multiple rect coordinate formats', () => {
    const feedItem = createFeedItem({
      id: 'feed-5',
      title: 'Test Feed',
      place: 'Seoul',
      date: new Date().toISOString(),
      photoCount: 2,
    });

    // 음수 좌표
    const negativeRect = new DOMRect(-10, -20, 100, 150);
    const stored1 = storeFeedHero(feedItem, negativeRect);
    expect(stored1.left).toBe(-10);
    expect(stored1.top).toBe(-20);

    // 큰 좌표
    const largeRect = new DOMRect(1000, 2000, 500, 750);
    const stored2 = storeFeedHero(feedItem, largeRect);
    expect(stored2.left).toBe(1000);
    expect(stored2.top).toBe(2000);
  });

  it('should validate stored hero structure', () => {
    const feedItem = createFeedItem({
      id: 'feed-6',
      title: 'Test Feed',
      place: 'Seoul',
      date: new Date().toISOString(),
      photoCount: 4,
    });

    const rect = new DOMRect(10, 20, 100, 150);
    const stored = storeFeedHero(feedItem, rect);

    expect(stored).toHaveProperty('itemId');
    expect(stored).toHaveProperty('thumbnailUrl');
    expect(stored).toHaveProperty('heroPreviewUrl');
    expect(stored).toHaveProperty('left');
    expect(stored).toHaveProperty('top');
    expect(stored).toHaveProperty('width');
    expect(stored).toHaveProperty('height');
  });

  it('clears stored grid hero when switching to list view', () => {
    const feedItem = createFeedItem();
    storeFeedHero(feedItem, new DOMRect(10, 20, 90, 90));

    const { container } = renderFeedPage(
      <MemoryRouter>
        <FeedPage />
      </MemoryRouter>,
    );

    expect(container.querySelector('img.absolute[data-hero-exit-key="pin-1"]')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '리스트 보기' }));

    expect(readStoredFeedHero()).toBeNull();
    expect(container.querySelector('img.absolute[data-hero-exit-key="pin-1"]')).toBeNull();
    const listHeroImage = container.querySelector('article [data-hero-exit-key="pin-1"]');
    expect(listHeroImage).toBeInTheDocument();
    expect(listHeroImage).not.toHaveClass('opacity-0');
  });

  it('활동 페이지와 같은 하단 내비게이션 여백 스페이서를 렌더링한다', () => {
    const { container } = renderFeedPage(
      <MemoryRouter>
        <FeedPage />
      </MemoryRouter>,
    );

    expect(container.querySelector('[data-feed-bottom-spacer]')).toHaveClass(
      'h-[calc(var(--bottom-nav-clearance)+env(safe-area-inset-bottom))]',
    );
  });

  it('keeps a stored hero target in list view while hiding the matching list image', () => {
    const feedItem = createFeedItem();
    storeFeedHero(feedItem, new DOMRect(10, 20, 92, 92));

    const { container } = renderFeedPage(
      <MemoryRouter initialEntries={[{ pathname: '/feed', state: { feedViewMode: 'list' } }]}>
        <FeedPage />
      </MemoryRouter>,
    );

    expect(container.querySelector('img.absolute[data-hero-exit-key="pin-1"]')).toBeInTheDocument();
    expect(container.querySelector('article [data-hero-exit-key="pin-1"]')).toBeNull();
    expect(container.querySelector('article img')).toHaveClass('opacity-0');
    expect(container.querySelector('article span.absolute')).toHaveClass('opacity-0');
  });

  it('renders the stored hero inside the feed scroll container so restored coordinates follow scroll content', () => {
    const feedItem = createFeedItem();
    storeFeedHero(feedItem, new DOMRect(10, 20, 92, 92));

    const { container } = renderFeedPage(
      <MemoryRouter>
        <FeedPage />
      </MemoryRouter>,
    );

    const scrollContainer = container.querySelector('[data-feed-scroll-container]');
    const storedHero = container.querySelector('img.absolute[data-hero-exit-key="pin-1"]');

    expect(storedHero).toBeInTheDocument();
    expect(storedHero?.closest('[data-feed-scroll-container]')).toBe(scrollContainer);
  });

  it('복귀 시 현재 피드 원본 DOM 좌표로 저장 히어로 위치를 보정한다', () => {
    const getBoundingClientRect = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function (this: HTMLElement) {
        if (this.dataset.feedHeroSourceId === '1') {
          return new DOMRect(64, 284, 88, 88);
        }
        if (this.hasAttribute('data-feed-scroll-container')) {
          return new DOMRect(0, 220, 390, 600);
        }

        return new DOMRect(0, 0, 0, 0);
      });
    const feedItem = createFeedItem();
    storeFeedHero(feedItem, new DOMRect(10, 20, 92, 92));

    try {
      const { container } = renderFeedPage(
        <MemoryRouter>
          <FeedPage />
        </MemoryRouter>,
      );

      expect(container.querySelector('img.absolute[data-hero-exit-key="pin-1"]')).toHaveStyle({
        left: '64px',
        top: '64px',
        width: '88px',
        height: '88px',
      });
    } finally {
      getBoundingClientRect.mockRestore();
    }
  });

  it('복귀 중 발생한 scroll 이벤트만으로는 stored hero를 정리하지 않는다', () => {
    const feedItem = createFeedItem();
    storeFeedHero(feedItem, new DOMRect(10, 20, 92, 92));

    const { container } = renderFeedPage(
      <MemoryRouter>
        <FeedPage />
      </MemoryRouter>,
    );

    const scrollContainer = container.querySelector('[data-feed-scroll-container]');
    expect(scrollContainer).toBeInTheDocument();
    expect(container.querySelector('img.absolute[data-hero-exit-key="pin-1"]')).toBeInTheDocument();

    fireEvent.scroll(scrollContainer as Element, { target: { scrollTop: 240 } });

    expect(container.querySelector('img.absolute[data-hero-exit-key="pin-1"]')).toBeInTheDocument();
    expect(readStoredFeedHero()).not.toBeNull();
  });

  it('스크롤 의도가 시작되면 stored hero를 즉시 정리해 스크롤 잔상을 남기지 않는다', () => {
    const feedItem = createFeedItem();
    storeFeedHero(feedItem, new DOMRect(10, 20, 92, 92));

    const { container } = renderFeedPage(
      <MemoryRouter initialEntries={[{ pathname: '/feed', state: { feedViewMode: 'list' } }]}>
        <FeedPage />
      </MemoryRouter>,
    );

    const scrollContainer = container.querySelector('[data-feed-scroll-container]');
    expect(scrollContainer).toBeInTheDocument();
    expect(container.querySelector('img.absolute[data-hero-exit-key="pin-1"]')).toBeInTheDocument();
    expect(container.querySelector('article img')).toHaveClass('opacity-0');

    fireEvent.touchMove(scrollContainer as Element, {
      cancelable: true,
      touches: [{ clientY: -20 }],
    });

    expect(container.querySelector('img.absolute[data-hero-exit-key="pin-1"]')).toBeNull();
    expect(container.querySelector('article img')).not.toHaveClass('opacity-0');
    expect(readStoredFeedHero()).toBeNull();
  });

  it('quickly hands off the stored list hero back to the real list image', () => {
    vi.useFakeTimers();
    const feedItem = createFeedItem();
    storeFeedHero(feedItem, new DOMRect(10, 20, 92, 92));

    const { container } = renderFeedPage(
      <MemoryRouter initialEntries={[{ pathname: '/feed', state: { feedViewMode: 'list' } }]}>
        <FeedPage />
      </MemoryRouter>,
    );

    const storedHero = container.querySelector('img.absolute[data-hero-exit-key="pin-1"]');
    const listImage = container.querySelector('article img');
    expect(storedHero).toHaveClass('opacity-100');
    expect(listImage).toHaveClass('opacity-0');

    // 히어로 비행 시작 대기(그레이스) 경과 후 핸드오프 시작
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(storedHero).toHaveClass('opacity-100');

    act(() => {
      vi.advanceTimersByTime(120);
    });

    expect(storedHero).toHaveClass('opacity-0');
    expect(listImage).not.toHaveClass('opacity-0');

    act(() => {
      vi.advanceTimersByTime(140);
    });

    expect(container.querySelector('img.absolute[data-hero-exit-key="pin-1"]')).toBeNull();
    expect(readStoredFeedHero()).toBeNull();
  });

  it('리스트 뷰에서 pointerDown 시 상세 데이터를 미리 캐시한다', () => {
    const { container } = renderFeedPage(
      <MemoryRouter initialEntries={[{ pathname: '/feed', state: { feedViewMode: 'list' } }]}>
        <FeedPage />
      </MemoryRouter>,
    );

    const link = container.querySelector('a[href="/feed/1"]');
    expect(link).toBeInTheDocument();

    fireEvent.pointerDown(link!);

    expect(warmFeedDetail).toHaveBeenCalledWith(expect.anything(), 1, '1');
  });

  it('리스트 뷰에서 상세 진입 시 imageAspectRatio를 navigate state로 전달한다', async () => {
    vi.mocked(runFeedHeroTransition).mockResolvedValue({ imageAspectRatio: 16 / 9 });
    const { container } = renderFeedPage(
      <MemoryRouter initialEntries={[{ pathname: '/feed', state: { feedViewMode: 'list' } }]}>
        <FeedPage />
      </MemoryRouter>,
    );

    const link = container.querySelector('a[href="/feed/1"]');
    expect(link).toBeInTheDocument();

    fireEvent.click(link!);

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/feed/1', {
        state: {
          thumbnailUrl: 'https://example.com/thumb.jpg',
          heroPreviewUrl: 'https://example.com/hero.jpg',
          imageAspectRatio: 16 / 9,
        },
      });
    });
    expect(saveScrollPositionMock).toHaveBeenCalledTimes(1);
    const [saveOrder] = saveScrollPositionMock.mock.invocationCallOrder;
    const [navigateOrder] = navigateMock.mock.invocationCallOrder;
    expect(saveOrder).toBeDefined();
    expect(navigateOrder).toBeDefined();
    expect(saveOrder!).toBeLessThan(navigateOrder!);
  });
});
