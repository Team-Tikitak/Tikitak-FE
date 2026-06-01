import { type ComponentPropsWithRef } from 'react';
import { cn } from '@/shared/lib';
import { Skeleton } from '@/shared/ui';
import { MenuButton } from './MenuButton';

const FEED_VIEW_MODES = ['grid', 'list'] as const;

export type FeedViewMode = (typeof FEED_VIEW_MODES)[number];

interface FeedCountToolbarProps extends Omit<ComponentPropsWithRef<'div'>, 'onChange'> {
  count: number;
  loading?: boolean;
  viewMode?: FeedViewMode;
  onViewModeChange?: (mode: FeedViewMode) => void;
}

export const FeedCountToolbar = ({
  count,
  loading = false,
  viewMode = 'list',
  onViewModeChange,
  className,
  ref,
  ...props
}: FeedCountToolbarProps) => {
  return (
    <div
      ref={ref}
      className={cn('flex w-full items-center justify-between gap-6', className)}
      {...props}
    >
      {loading ? (
        <Skeleton className="h-5 w-24" aria-hidden="true" />
      ) : (
        <p className="body-8 text-gray-700">
          총 <span className="body-9 text-main">{count.toLocaleString()}</span> 개의 기록
        </p>
      )}
      <div className="flex items-center gap-3">
        {FEED_VIEW_MODES.map((mode) => (
          <MenuButton
            key={mode}
            menuType={mode}
            selected={viewMode === mode}
            onClick={() => onViewModeChange?.(mode)}
          />
        ))}
      </div>
    </div>
  );
};
