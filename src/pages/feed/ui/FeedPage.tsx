import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { PageShell } from '@/app/layout';
import { PATHS, toFeedDetail } from '@/app/routes/paths';
import { useInfiniteFeeds } from '@/shared/api/feed/queries';
import { useMe } from '@/shared/api/user/queries';
import { useInfiniteScroll } from '@/shared/hooks';
import { Divider, EmptyTeamView, Header } from '@/shared/ui';
import { EmptyFeedView } from './EmptyFeedView';
import { FeedCountToolbar, type FeedViewMode } from './FeedCountToolbar';
import { FeedGrid } from './FeedGrid';
import { FeedListItem } from './FeedListItem';
import { FeedSkeleton } from './FeedSkeleton';
import { adaptFeedListItem } from '../lib/adaptFeedListItem';
import { readFeedViewMode, storeFeedViewMode } from '../lib/viewModeStorage';

const FEED_LIST_EAGER_COUNT = 6;
const FEED_SCROLL_STORAGE_PREFIX = 'feed-scroll';
const SCROLL_RESTORE_MAX_ATTEMPTS = 8;

const getFeedScrollKey = (teamId: number, viewMode: FeedViewMode) =>
  `${FEED_SCROLL_STORAGE_PREFIX}:${teamId}:${viewMode}`;

const readFeedScrollTop = (key: string) => {
  const value = sessionStorage.getItem(key);
  const scrollTop = value ? Number(value) : 0;

  return Number.isFinite(scrollTop) ? scrollTop : 0;
};

const storeFeedScrollTop = (key: string, scrollTop: number) => {
  sessionStorage.setItem(key, String(Math.max(0, Math.round(scrollTop))));
};

export const FeedPage = () => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const restoredKeyRef = useRef<string | null>(null);
  const pendingScrollFrameRef = useRef<number | null>(null);
  const pendingScrollKeyRef = useRef<string | null>(null);
  const latestScrollTopRef = useRef(0);
  const [viewMode, setViewModeState] = useState<FeedViewMode>(readFeedViewMode);
  const setViewMode = (mode: FeedViewMode) => {
    setViewModeState(mode);
    storeFeedViewMode(mode);
  };
  const { data: me, isPending: isMePending } = useMe();
  const teamId = me?.activeTeamId ?? null;
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

  const persistScrollTop = (scrollTop: number) => {
    if (!scrollKey) return;
    pendingScrollKeyRef.current = scrollKey;
    latestScrollTopRef.current = scrollTop;
    if (pendingScrollFrameRef.current !== null) {
      window.cancelAnimationFrame(pendingScrollFrameRef.current);
    }
    pendingScrollFrameRef.current = window.requestAnimationFrame(() => {
      storeFeedScrollTop(scrollKey, scrollTop);
      pendingScrollFrameRef.current = null;
    });
  };

  useEffect(
    () => () => {
      if (pendingScrollFrameRef.current !== null) {
        window.cancelAnimationFrame(pendingScrollFrameRef.current);
        if (pendingScrollKeyRef.current) {
          storeFeedScrollTop(pendingScrollKeyRef.current, latestScrollTopRef.current);
        }
      }
    },
    [],
  );

  useEffect(() => {
    if (!scrollKey || showFeedLoading || isError || restoredKeyRef.current === scrollKey) return;

    const savedScrollTop = readFeedScrollTop(scrollKey);
    if (savedScrollTop <= 0) {
      restoredKeyRef.current = scrollKey;
      return;
    }

    let frame = 0;
    let attempts = 0;

    const restore = () => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const maxScrollTop = Math.max(0, container.scrollHeight - container.clientHeight);
      if (maxScrollTop >= savedScrollTop || attempts >= SCROLL_RESTORE_MAX_ATTEMPTS) {
        container.scrollTop = Math.min(savedScrollTop, maxScrollTop);
        restoredKeyRef.current = scrollKey;
        return;
      }

      attempts += 1;
      frame = window.requestAnimationFrame(restore);
    };

    frame = window.requestAnimationFrame(restore);

    return () => window.cancelAnimationFrame(frame);
  }, [feeds.length, isError, scrollKey, showFeedLoading]);

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
        ref={scrollContainerRef}
        className="no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pt-6 pb-24"
        onScroll={(event) => persistScrollTop(event.currentTarget.scrollTop)}
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
          <FeedGrid items={feeds} />
        ) : (
          <ul className="flex flex-col gap-5">
            {feeds.map((feed, index) => (
              <li key={feed.id} className="flex flex-col gap-5">
                <Link
                  to={toFeedDetail(feed.id)}
                  state={{ thumbnailUrl: feed.thumbnailUrl }}
                  className="block"
                >
                  <FeedListItem item={feed} eager={index < FEED_LIST_EAGER_COUNT} />
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
