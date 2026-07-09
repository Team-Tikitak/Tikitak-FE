import { useFirstVisitHint } from '@/shared/hooks/useFirstVisitHint';
import { useInfiniteScroll } from '@/shared/hooks/useInfiniteScroll';
import { FeedDetailContent } from '@/shared/ui/FeedDetail/FeedDetailContent';
import type { ReactNode } from 'react';

const FEED_DETAIL_HINT_KEY = 'feed-detail-long-press-hint-seen';

export interface FeedDetailListItem {
  feedId: number;
  heroKey?: string;
  placeholderThumbnail?: string;
}

interface FeedDetailListProps {
  teamId: number;
  items: FeedDetailListItem[];
  emptySlot?: ReactNode;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void | Promise<unknown>;
}

export const FeedDetailList = ({
  teamId,
  items,
  emptySlot,
  hasNextPage = false,
  isFetchingNextPage = false,
  fetchNextPage = () => {},
}: FeedDetailListProps) => {
  const { seen, markSeen } = useFirstVisitHint(FEED_DETAIL_HINT_KEY);
  const { observerRef } = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });

  return (
    <>
      {items.length > 0
        ? items.map((item, index) => (
            <FeedDetailContent
              key={item.feedId}
              teamId={teamId}
              feedId={item.feedId}
              heroKey={item.heroKey}
              placeholderThumbnail={item.placeholderThumbnail}
              showHint={!seen && index === 0}
              onHintDismiss={markSeen}
            />
          ))
        : emptySlot}
      {items.length > 0 && hasNextPage && (
        <div ref={observerRef} className="h-8 shrink-0" aria-hidden="true" />
      )}
    </>
  );
};
