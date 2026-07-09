import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type UIEvent,
} from 'react';
import { flushSync } from 'react-dom';
import { Link, useLocation, useNavigate, useNavigationType } from 'react-router';
import { PageShell } from '@/app/layout';
import { PATHS, toFeedDetail } from '@/app/routes/paths';
import { useInfiniteFeeds } from '@/shared/api/feed/queries';
import { useMe } from '@/shared/api/user/queries';
import { useInfiniteScroll, useScrollRestore } from '@/shared/hooks';
import { Divider, EmptyTeamView, Header } from '@/shared/ui';
import { EmptyFeedView } from './EmptyFeedView';
import { FeedCountToolbar, type FeedViewMode } from './FeedCountToolbar';
import { FeedGrid } from './FeedGrid';
import { FeedListItem } from './FeedListItem';
import { FeedSkeleton } from './FeedSkeleton';
import { StoredFeedHero } from './StoredFeedHero';
import { adaptFeedListItem } from '../lib/adaptFeedListItem';
import { preloadFeedHeroAssets, waitForQuestionDecorFade } from '../lib/feedHeroAssets';
import { clearStoredFeedHero, readStoredFeedHero, storeFeedHero } from '../lib/feedHeroStorage';
import type { FeedItem } from '../model/types';

const FEED_LIST_EAGER_COUNT = 6;
const FEED_SCROLL_STORAGE_PREFIX = 'feed-scroll';
const STORED_HERO_FADE_DELAY_MS = 120;
const STORED_HERO_CLEAR_DELAY_MS = 260;
const STORED_HERO_MAX_LIFETIME_MS = 5000;
const HERO_FLIGHT_START_GRACE_MS = 300;
const HERO_FLIGHT_MAX_WAIT_MS = 2000;
const STORED_HERO_DEPARTURE_RECOVERY_MS = 1500;

const getFeedScrollKey = (teamId: number, viewMode: FeedViewMode) =>
  `${FEED_SCROLL_STORAGE_PREFIX}:${teamId}:${viewMode}`;

interface FeedLocationState {
  feedViewMode?: FeedViewMode;
}

const getFeedViewModeFromState = (state: unknown): FeedViewMode => {
  const value = (state as FeedLocationState | null)?.feedViewMode;
  return value === 'list' || value === 'grid' ? value : 'grid';
};

export const FeedPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const navigationType = useNavigationType();
  const mountedAtRef = useRef(Date.now());
  const { data: me, isPending: isMePending } = useMe();
  const teamId = me?.activeTeamId ?? null;

  const [viewMode, setViewMode] = useState<FeedViewMode>(() =>
    getFeedViewModeFromState(location.state),
  );
  const [viewModeTeamId, setViewModeTeamId] = useState(teamId);
  // 상세에서 뒤로 돌아온(POP) 경우에만 저장된 히어로를 복원 — 탭 등 새 진입에선 잔여 히어로 폐기
  const [storedFeedHero, setStoredFeedHero] = useState(() => {
    if (navigationType !== 'POP') {
      clearStoredFeedHero();
      return null;
    }
    return readStoredFeedHero();
  });
  const [storedHeroVisible, setStoredHeroVisible] = useState(Boolean(storedFeedHero));
  const hideStoredHero = useCallback(() => {
    setStoredHeroVisible(false);
    setStoredFeedHero(null);
  }, []);
  const dismissStoredHero = useCallback(() => {
    clearStoredFeedHero();
    hideStoredHero();
  }, [hideStoredHero]);
  const isTeamSwitch = teamId !== viewModeTeamId && viewModeTeamId !== null;
  if (teamId !== viewModeTeamId) {
    setViewModeTeamId(teamId);
    setViewMode(isTeamSwitch ? 'grid' : getFeedViewModeFromState(location.state));
    if (isTeamSwitch) {
      hideStoredHero();
    }
  }

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteFeeds(teamId);

  const feeds = useMemo(
    () => data?.pages.flatMap((page) => page.items).map(adaptFeedListItem) ?? [],
    [data],
  );
  const totalCount = data?.pages[0]?.pageInfo.totalCount ?? feeds.length;
  const showFeedLoading = isMePending || isLoading;
  const scrollKey = teamId ? getFeedScrollKey(teamId, viewMode) : null;
  const { observerRef } = useInfiniteScroll({
    hasNextPage: Boolean(hasNextPage) && !showFeedLoading && !isError,
    isFetchingNextPage,
    fetchNextPage,
  });
  const {
    scrollRef,
    handleScroll: handleRestoreScroll,
    restored: scrollRestored,
  } = useScrollRestore(scrollKey, {
    ready: !showFeedLoading && !isError,
    contentSignal: feeds.length,
  });
  const suppressedHeroId = storedHeroVisible ? (storedFeedHero?.feedId ?? null) : null;
  const isStoredHeroFeedLoaded = storedFeedHero
    ? feeds.some((feed) => feed.id === storedFeedHero.feedId)
    : true;

  useEffect(() => {
    if (!isTeamSwitch) return;
    clearStoredFeedHero();
  }, [isTeamSwitch]);

  useEffect(() => {
    if (!storedFeedHero) return;

    const maxTimeoutId = window.setTimeout(() => {
      dismissStoredHero();
    }, STORED_HERO_MAX_LIFETIME_MS);
    return () => window.clearTimeout(maxTimeoutId);
  }, [dismissStoredHero, storedFeedHero]);

  // 저장 히어로 핸드오프. ssgoi 역방향 비행 중에는 클론이 타일을 덮고 있어 그 밑에서
  // 미리 페이드인이 끝나면 클론이 걷힐 때 장식이 "뚝" 나타난다. ssgoi가 비행 동안
  // 사본에 inline opacity 0을 걸었다가 착지 시 복원하므로, 그 복원 시점을 기다렸다가
  // 핸드오프(suppress 해제)를 시작한다.
  useEffect(() => {
    if (!storedFeedHero || !scrollRestored || !isStoredHeroFeedLoaded) return;

    let finished = false;
    const timeoutIds: number[] = [];
    const observers: MutationObserver[] = [];
    const schedule = (callback: () => void, ms: number) => {
      timeoutIds.push(window.setTimeout(callback, ms));
    };
    const finish = () => {
      if (finished) return;
      finished = true;
      schedule(() => setStoredHeroVisible(false), STORED_HERO_FADE_DELAY_MS);
      schedule(() => dismissStoredHero(), STORED_HERO_CLEAR_DELAY_MS);
    };

    const copy = document.querySelector<HTMLElement>('[data-stored-feed-hero]');
    const isInFlight = () => copy?.style.opacity === '0';
    const observeStyle = (onChange: () => void) => {
      if (!copy) return;
      const observer = new MutationObserver(onChange);
      observer.observe(copy, { attributes: true, attributeFilter: ['style'] });
      observers.push(observer);
    };
    const waitForLanding = () => {
      observeStyle(() => {
        if (!isInFlight()) finish();
      });
      schedule(finish, HERO_FLIGHT_MAX_WAIT_MS);
    };

    if (storedFeedHero.createdAt > mountedAtRef.current) {
      // 출발용 히어로(이 페이지에서 방금 캡처)는 핸드오프하지 않고, 탭이 취소된 경우만 늦게 복구.
      schedule(finish, STORED_HERO_DEPARTURE_RECOVERY_MS);
    } else if (!copy) {
      finish();
    } else if (isInFlight()) {
      waitForLanding();
    } else {
      let flightStarted = false;
      observeStyle(() => {
        if (!flightStarted && isInFlight()) {
          flightStarted = true;
          waitForLanding();
        }
      });
      schedule(() => {
        if (!flightStarted) finish();
      }, HERO_FLIGHT_START_GRACE_MS);
    }

    return () => {
      for (const id of timeoutIds) window.clearTimeout(id);
      for (const observer of observers) observer.disconnect();
    };
  }, [dismissStoredHero, isStoredHeroFeedLoaded, scrollRestored, storedFeedHero]);

  const captureFeedHero = useCallback(
    (item: FeedItem, source: HTMLElement) => {
      const rect = source.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const frameRect = scrollRef.current?.parentElement?.getBoundingClientRect();
      const localRect = frameRect
        ? new DOMRect(rect.left - frameRect.left, rect.top - frameRect.top, rect.width, rect.height)
        : rect;
      const nextStoredFeedHero = storeFeedHero(item, localRect);
      flushSync(() => {
        setStoredHeroVisible(true);
        setStoredFeedHero(nextStoredFeedHero);
      });
    },
    [scrollRef],
  );

  const handleViewModeChange = useCallback(
    (mode: FeedViewMode) => {
      if (mode === 'list' && storedFeedHero) {
        dismissStoredHero();
      }
      setViewMode(mode);
      navigate('.', {
        replace: true,
        state: { ...(location.state as FeedLocationState | null), feedViewMode: mode },
        preventScrollReset: true,
      });
    },
    [dismissStoredHero, location.state, navigate, storedFeedHero],
  );

  const handleFeedScroll = useCallback(
    (event: UIEvent<HTMLDivElement>) => {
      handleRestoreScroll(event);
      if (!storedFeedHero || !scrollRestored) return;
      dismissStoredHero();
    },
    [dismissStoredHero, handleRestoreScroll, scrollRestored, storedFeedHero],
  );

  const handleListFeedClick = async (event: MouseEvent<HTMLAnchorElement>, feed: FeedItem) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      event.shiftKey
    ) {
      return;
    }

    event.preventDefault();
    const source = event.currentTarget.querySelector<HTMLElement>('[data-hero-exit-key]');
    if (source) captureFeedHero(feed, source);
    await Promise.all([preloadFeedHeroAssets(feed), waitForQuestionDecorFade(feed)]);
    navigate(toFeedDetail(feed.id), {
      state: { thumbnailUrl: feed.thumbnailUrl, heroPreviewUrl: feed.heroPreviewUrl },
    });
  };

  if (!isMePending && !teamId) {
    return (
      <PageShell contentClassName="flex flex-1 flex-col">
        <EmptyTeamView onCreateTeam={() => navigate(PATHS.TEAM_CREATE)} />
      </PageShell>
    );
  }

  return (
    <PageShell
      header={
        <Header variant="left" title="피드" rightIcon={null} className="border-b border-gray-300" />
      }
      contentClassName="relative isolate flex flex-col overflow-hidden"
    >
      {storedFeedHero && (
        <StoredFeedHero storedFeedHero={storedFeedHero} visible={storedHeroVisible} />
      )}
      <div
        ref={scrollRef}
        className="no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pt-6 pb-24"
        onScroll={handleFeedScroll}
      >
        <FeedCountToolbar
          count={totalCount}
          loading={showFeedLoading}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          className="mb-6"
        />
        {showFeedLoading ? (
          <FeedSkeleton viewMode={viewMode} />
        ) : isError ? (
          <p className="body-3 mt-10 text-center text-gray-500">피드를 불러오지 못했습니다.</p>
        ) : feeds.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <EmptyFeedView />
          </div>
        ) : viewMode === 'grid' ? (
          <FeedGrid
            items={feeds}
            suppressedHeroId={suppressedHeroId}
            onHeroCapture={captureFeedHero}
          />
        ) : (
          <ul className="flex flex-col gap-5">
            {feeds.map((feed, index) => (
              <li key={feed.id} className="flex flex-col gap-5">
                <Link
                  to={toFeedDetail(feed.id)}
                  state={{ thumbnailUrl: feed.thumbnailUrl, heroPreviewUrl: feed.heroPreviewUrl }}
                  className="block"
                  onPointerDown={(event) => {
                    const source =
                      event.currentTarget.querySelector<HTMLElement>('[data-hero-exit-key]');
                    if (source) captureFeedHero(feed, source);
                    void preloadFeedHeroAssets(feed);
                  }}
                  onFocus={() => {
                    void preloadFeedHeroAssets(feed);
                  }}
                  onMouseEnter={() => void preloadFeedHeroAssets(feed)}
                  onClick={(event) => void handleListFeedClick(event, feed)}
                >
                  <FeedListItem
                    item={feed}
                    eager={index < FEED_LIST_EAGER_COUNT}
                    suppressHeroImage={suppressedHeroId === feed.id}
                  />
                </Link>
                <Divider />
              </li>
            ))}
          </ul>
        )}
        {!showFeedLoading && !isError && feeds.length > 0 && (
          <>
            <div ref={observerRef} className="h-8 shrink-0" aria-hidden="true" />
            {isFetchingNextPage && <FeedSkeleton viewMode={viewMode} />}
          </>
        )}
      </div>
    </PageShell>
  );
};
