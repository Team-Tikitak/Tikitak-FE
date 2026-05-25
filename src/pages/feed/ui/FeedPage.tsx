import { useMemo, useState } from 'react';
import { PageShell } from '@/app/layout';
import { useFeeds } from '@/shared/api/feed/queries';
import { useMe } from '@/shared/api/user/queries';
import { Divider, Header } from '@/shared/ui';
import { EmptyFeedView } from './EmptyFeedView';
import { FeedCountToolbar, type FeedViewMode } from './FeedCountToolbar';
import { FeedGrid } from './FeedGrid';
import { FeedListItem } from './FeedListItem';
import { adaptFeedListItem } from '../lib/adaptFeedListItem';

export const FeedPage = () => {
  const [viewMode, setViewMode] = useState<FeedViewMode>('list');
  const { data: me } = useMe();
  const teamId = me?.activeTeamId ?? null;
  const { data, isLoading, isError } = useFeeds(teamId);

  const feeds = useMemo(() => data?.items.map(adaptFeedListItem) ?? [], [data]);
  const totalCount = feeds.length;

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
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          className="mb-6"
        />
        {isLoading ? (
          <p className="body-3 mt-10 text-center text-gray-500">불러오는 중...</p>
        ) : isError ? (
          <p className="body-3 mt-10 text-center text-gray-500">피드를 불러오지 못했습니다.</p>
        ) : !teamId ? (
          <p className="body-3 mt-10 text-center text-gray-500">활성 팀을 먼저 선택해주세요.</p>
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
                <FeedListItem item={feed} />
                <Divider />
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageShell>
  );
};
