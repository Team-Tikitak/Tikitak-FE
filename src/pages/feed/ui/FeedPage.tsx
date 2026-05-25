import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { PageShell } from '@/app/layout';
import { toFeedDetail } from '@/app/routes';
import { useFeeds } from '@/shared/api/feed/queries';
import { useMe } from '@/shared/api/user/queries';
import { Divider, Header } from '@/shared/ui';
import { FeedCountToolbar, type FeedViewMode } from './FeedCountToolbar';
import { FeedGrid } from './FeedGrid';
import { FeedListItem } from './FeedListItem';
import { adaptFeedListItem } from '../lib/adaptFeedListItem';

export const FeedPage = () => {
  const [viewMode, setViewMode] = useState<FeedViewMode>('list');
  const { data: me } = useMe();
  const teamId = me?.activeTeamId ?? null;
  const { data, isLoading, isError } = useFeeds(teamId);

  const navigate = useNavigate();
  const feeds = useMemo(() => data?.items.map(adaptFeedListItem) ?? [], [data]);
  const totalCount = feeds.length;

  return (
    <PageShell
      header={
        <Header variant="left" title="피드" rightIcon={null} className="border-b border-gray-300" />
      }
      contentClassName="relative isolate flex flex-col overflow-hidden"
    >
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-6 pt-6 pb-24">
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
          <p className="body-3 mt-10 text-center text-gray-500">아직 작성된 피드가 없습니다.</p>
        ) : viewMode === 'grid' ? (
          <FeedGrid items={feeds} />
        ) : (
          <ul className="flex flex-col gap-5">
            {feeds.map((feed) => (
              <li key={feed.id} className="flex flex-col gap-5">
                <FeedListItem item={feed} onClick={() => navigate(toFeedDetail(feed.id))} />
                <Divider />
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageShell>
  );
};
