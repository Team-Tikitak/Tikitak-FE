import { useQueryClient } from '@tanstack/react-query';
import {
  useCallback,
  useMemo,
  useState,
  type MouseEvent,
  type TouchEvent,
  type UIEvent,
} from 'react';
import { Link, useLocation, useNavigate, useNavigationType } from 'react-router';
import { PageShell } from '@/app/layout';
import { PATHS, toFeedDetail } from '@/app/routes/paths';
import { feedKeys } from '@/shared/api/feed/keys';
import { useInfiniteFeeds } from '@/shared/api/feed/queries';
import { useMe } from '@/shared/api/user/queries';
import { useInfiniteScroll, useScrollRestore } from '@/shared/hooks';
import { useHeroHandoff } from '@/shared/hooks/useHeroHandoff';
import { usePullToRefresh } from '@/shared/hooks/usePullToRefresh';
import { Divider, EmptyTeamView, Header } from '@/shared/ui';
import { PullToRefreshIndicator } from '@/shared/ui/PullToRefreshIndicator';
import { StoredHero } from '@/shared/ui/StoredHero';
import { EmptyFeedView } from './EmptyFeedView';
import { FeedCountToolbar, type FeedViewMode } from './FeedCountToolbar';
import { FeedGrid } from './FeedGrid';
import { FeedListItem } from './FeedListItem';
import { FeedSkeleton } from './FeedSkeleton';
import { adaptFeedListItem } from '../lib/adaptFeedListItem';
import { preloadFeedHeroAssets, runFeedHeroTransition } from '../lib/feedHeroAssets';
import { warmFeedDetail } from '../lib/warmFeedDetail';
import type { FeedItem } from '../model/types';

const FEED_LIST_EAGER_COUNT = 6;
const FEED_SCROLL_STORAGE_PREFIX = 'feed-scroll';
const FEED_HERO_STORAGE_KEY = 'tikitak:last-feed-hero';

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
  const queryClient = useQueryClient();
  const { data: me, isPending: isMePending } = useMe();
  const teamId = me?.activeTeamId ?? null;

  const [viewMode, setViewMode] = useState<FeedViewMode>(() =>
    getFeedViewModeFromState(location.state),
  );
  const [viewModeTeamId, setViewModeTeamId] = useState(teamId);
  const isTeamSwitch = teamId !== viewModeTeamId && viewModeTeamId !== null;

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
    saveScrollPosition,
    restored: scrollRestored,
  } = useScrollRestore(scrollKey, {
    ready: !showFeedLoading && !isError,
    contentSignal: feeds.length,
  });
  const pullToRefresh = usePullToRefresh({
    scrollRef,
    disabled: !teamId || showFeedLoading || isError,
    onRefresh: () =>
      teamId ? queryClient.invalidateQueries({ queryKey: feedKeys.list(teamId) }) : undefined,
  });
  const getCurrentFeedHeroSource = useCallback(
    (itemId: string) => {
      const container = scrollRef.current;
      if (!container) return null;

      return (
        Array.from(container.querySelectorAll<HTMLElement>('[data-feed-hero-source-id]')).find(
          (element) => element.dataset.feedHeroSourceId === itemId,
        ) ?? null
      );
    },
    [scrollRef],
  );

  const {
    storedHero: storedFeedHero,
    storedHeroVisible,
    suppressedItemId: suppressedHeroId,
    hideStoredHero,
    dismissStoredHero,
    captureHero,
  } = useHeroHandoff({
    storageKey: FEED_HERO_STORAGE_KEY,
    navigationType,
    shouldResetOnContextChange: isTeamSwitch,
    scrollRestored,
    isItemLoaded: (itemId) => feeds.some((feed) => feed.id === itemId),
    scrollFrameRef: scrollRef,
    heroCoordinateMode: 'scroll-content',
    getCurrentSource: getCurrentFeedHeroSource,
  });

  const captureFeedHero = useCallback(
    (item: FeedItem, source: HTMLElement) => {
      captureHero(
        {
          id: item.id,
          heroKey: `pin-${item.id}`,
          thumbnailUrl: item.thumbnailUrl,
          heroPreviewUrl: item.heroPreviewUrl,
        },
        source,
      );
    },
    [captureHero],
  );

  if (teamId !== viewModeTeamId) {
    setViewModeTeamId(teamId);
    setViewMode(isTeamSwitch ? 'grid' : getFeedViewModeFromState(location.state));
    if (isTeamSwitch) {
      hideStoredHero();
    }
  }

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
    },
    [handleRestoreScroll],
  );

  const handleFeedTouchMove = useCallback(
    (event: TouchEvent<HTMLDivElement>) => {
      pullToRefresh.touchHandlers.onTouchMove(event);
    },
    [pullToRefresh.touchHandlers],
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
    saveScrollPosition();
    const source = event.currentTarget.querySelector<HTMLElement>('[data-hero-exit-key]');
    const { imageAspectRatio } = await runFeedHeroTransition(feed, source, captureFeedHero);
    navigate(toFeedDetail(feed.id), {
      state: {
        thumbnailUrl: feed.thumbnailUrl,
        heroPreviewUrl: feed.heroPreviewUrl,
        ...(imageAspectRatio ? { imageAspectRatio } : {}),
      },
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
      <div
        ref={scrollRef}
        data-feed-scroll-container
        className="no-scrollbar relative flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain"
        onScroll={handleFeedScroll}
        onTouchStart={pullToRefresh.touchHandlers.onTouchStart}
        onTouchMove={handleFeedTouchMove}
        onTouchEnd={pullToRefresh.touchHandlers.onTouchEnd}
        onTouchCancel={pullToRefresh.touchHandlers.onTouchCancel}
      >
        <PullToRefreshIndicator
          pullDistance={pullToRefresh.pullDistance}
          threshold={pullToRefresh.threshold}
          armed={pullToRefresh.isRefreshArmed}
          refreshing={pullToRefresh.isRefreshing}
        />
        {storedFeedHero && scrollRestored && (
          <StoredHero
            storedHero={storedFeedHero}
            visible={storedHeroVisible}
            instanceKey={FEED_HERO_STORAGE_KEY}
            style={pullToRefresh.pullTransformStyle}
          />
        )}
        <div
          className="flex min-h-full flex-col px-6 pt-6"
          style={pullToRefresh.pullTransformStyle}
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
              teamId={teamId}
              suppressedHeroId={suppressedHeroId}
              onHeroCapture={captureFeedHero}
              onBeforeNavigate={saveScrollPosition}
            />
          ) : (
            <ul className="flex flex-col gap-5">
              {feeds.map((feed, index) => (
                <li key={feed.id} className="flex flex-col gap-5">
                  <Link
                    to={toFeedDetail(feed.id)}
                    state={{
                      thumbnailUrl: feed.thumbnailUrl,
                      heroPreviewUrl: feed.heroPreviewUrl,
                    }}
                    className="block"
                    onPointerDown={(event) => {
                      const source =
                        event.currentTarget.querySelector<HTMLElement>('[data-hero-exit-key]');
                      if (source) captureFeedHero(feed, source);
                      void preloadFeedHeroAssets(feed);
                      warmFeedDetail(queryClient, teamId, feed.id);
                    }}
                    onFocus={() => {
                      void preloadFeedHeroAssets(feed);
                    }}
                    onMouseEnter={() => {
                      void preloadFeedHeroAssets(feed);
                    }}
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
          <div
            data-feed-bottom-spacer
            className="h-[calc(var(--bottom-nav-clearance)+env(safe-area-inset-bottom))] shrink-0"
            aria-hidden="true"
          />
        </div>
      </div>
    </PageShell>
  );
};
