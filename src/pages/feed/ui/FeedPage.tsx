import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { PageShell } from '@/app/layout';
import { PATHS, toFeedDetail } from '@/app/routes/paths';
import { useFeeds } from '@/shared/api/feed/queries';
import { useMe } from '@/shared/api/user/queries';
import { Divider, EmptyTeamView, Header } from '@/shared/ui';
import { EmptyFeedView } from './EmptyFeedView';
import { FeedCountToolbar, type FeedViewMode } from './FeedCountToolbar';
import { FeedGrid } from './FeedGrid';
import { FeedListItem } from './FeedListItem';
import { FeedSkeleton } from './FeedSkeleton';
import { adaptFeedListItem } from '../lib/adaptFeedListItem';
import { readFeedViewMode, storeFeedViewMode } from '../lib/viewModeStorage';

export const FeedPage = () => {
  const navigate = useNavigate();
  const [viewMode, setViewModeState] = useState<FeedViewMode>(readFeedViewMode);
  const setViewMode = (mode: FeedViewMode) => {
    setViewModeState(mode);
    storeFeedViewMode(mode);
  };
  const { data: me, isPending: isMePending } = useMe();
  const teamId = me?.activeTeamId ?? null;
  const { data, isLoading, isError } = useFeeds(teamId);

  const feeds = useMemo(() => data?.items.map(adaptFeedListItem) ?? [], [data]);
  const totalCount = feeds.length;
  const showFeedLoading = isMePending || isLoading;

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
      <div className="no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pt-6 pb-24">
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
            {feeds.map((feed) => (
              <li key={feed.id} className="flex flex-col gap-5">
                <Link
                  to={toFeedDetail(feed.id)}
                  state={{ thumbnailUrl: feed.thumbnailUrl }}
                  className="block"
                >
                  <FeedListItem item={feed} />
                </Link>
                <Divider />
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageShell>
  );
};
