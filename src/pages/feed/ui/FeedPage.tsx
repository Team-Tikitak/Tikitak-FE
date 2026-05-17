import { useState } from 'react';
import { PageShell } from '@/app/layout';
import { Divider, Header } from '@/shared/ui';
import { FeedCountToolbar, type FeedViewMode } from './FeedCountToolbar';
import { FeedGrid } from './FeedGrid';
import { FeedListItem } from './FeedListItem';
import { MOCK_FEEDS } from '../model/mock';

export const FeedPage = () => {
  const [viewMode, setViewMode] = useState<FeedViewMode>('list');
  const feeds = MOCK_FEEDS;
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
        {viewMode === 'grid' ? (
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
