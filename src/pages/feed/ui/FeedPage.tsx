import { useCallback, useEffect, useMemo, useState, type MouseEvent } from 'react';
import { flushSync } from 'react-dom';
import { Link, useNavigate } from 'react-router';
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
import { preloadFeedHeroAssets } from '../lib/feedHeroAssets';
import { clearStoredFeedHero, readStoredFeedHero, storeFeedHero } from '../lib/feedHeroStorage';
import type { FeedItem } from '../model/types';

const FEED_LIST_EAGER_COUNT = 6;
const FEED_SCROLL_STORAGE_PREFIX = 'feed-scroll';
const STORED_HERO_CLEAR_DELAY_MS = 900;

const getFeedScrollKey = (teamId: number, viewMode: FeedViewMode) =>
  `${FEED_SCROLL_STORAGE_PREFIX}:${teamId}:${viewMode}`;

export const FeedPage = () => {
  const navigate = useNavigate();
  const { data: me, isPending: isMePending } = useMe();
  const teamId = me?.activeTeamId ?? null;

  const [viewMode, setViewMode] = useState<FeedViewMode>('grid');
  const [viewModeTeamId, setViewModeTeamId] = useState(teamId);
  const [storedFeedHero, setStoredFeedHero] = useState(readStoredFeedHero);
  if (teamId !== viewModeTeamId) {
    setViewModeTeamId(teamId);
    setViewMode('grid');
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
    handleScroll,
    restored: scrollRestored,
  } = useScrollRestore(scrollKey, {
    ready: !showFeedLoading && !isError,
    contentSignal: feeds.length,
  });
  const suppressedHeroId = storedFeedHero?.feedId ?? null;
  const isStoredHeroFeedLoaded = storedFeedHero
    ? feeds.some((feed) => feed.id === storedFeedHero.feedId)
    : true;

  useEffect(() => {
    if (!storedFeedHero) return;
    if (!scrollRestored || !isStoredHeroFeedLoaded) return;

    const id = window.setTimeout(() => {
      clearStoredFeedHero();
      setStoredFeedHero(null);
    }, STORED_HERO_CLEAR_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [isStoredHeroFeedLoaded, scrollRestored, storedFeedHero]);

  const captureFeedHero = useCallback(
    (item: FeedItem, source: HTMLElement) => {
      const rect = source.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const frameRect = scrollRef.current?.parentElement?.getBoundingClientRect();
      const localRect = frameRect
        ? new DOMRect(rect.left - frameRect.left, rect.top - frameRect.top, rect.width, rect.height)
        : rect;
      flushSync(() => {
        setStoredFeedHero(storeFeedHero(item, localRect));
      });
    },
    [scrollRef],
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
    await preloadFeedHeroAssets(feed);
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
      {storedFeedHero && <StoredFeedHero storedFeedHero={storedFeedHero} />}
      <div
        ref={scrollRef}
        className="no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pt-6 pb-24"
        onScroll={handleScroll}
      >
        <FeedCountToolbar
          count={totalCount}
          loading={showFeedLoading}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
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
                  onFocus={(event) => {
                    const source =
                      event.currentTarget.querySelector<HTMLElement>('[data-hero-exit-key]');
                    if (source) captureFeedHero(feed, source);
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
