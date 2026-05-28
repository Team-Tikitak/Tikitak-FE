import { cn } from '@/shared/lib';
import type { FeedViewMode } from './FeedCountToolbar';

interface FeedSkeletonProps {
  viewMode: FeedViewMode;
}

const SkeletonBlock = ({ className }: { className?: string }) => (
  <div className={cn('animate-pulse rounded-md bg-gray-200', className)} />
);

export const FeedSkeleton = ({ viewMode }: FeedSkeletonProps) => {
  if (viewMode === 'grid') {
    return (
      <ul className="grid grid-cols-3 gap-1" aria-hidden="true">
        {Array.from({ length: 12 }).map((_, index) => (
          <li key={index}>
            <SkeletonBlock className="aspect-square w-full rounded-sm" />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className="flex flex-col gap-5" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, index) => (
        <li key={index} className="flex flex-col gap-5">
          <div className="flex w-full items-start gap-4">
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <div className="flex flex-col gap-2">
                <div className="flex w-full flex-col gap-1.5">
                  <SkeletonBlock className="h-4 w-24" />
                  <SkeletonBlock className="h-5 w-4/5" />
                </div>
                <div className="flex h-6 items-center -space-x-1">
                  <SkeletonBlock className="size-6 rounded-full" />
                  <SkeletonBlock className="size-6 rounded-full" />
                  <SkeletonBlock className="size-6 rounded-full" />
                </div>
              </div>
              <SkeletonBlock className="h-4 w-20" />
            </div>
            <SkeletonBlock className="size-[92px] shrink-0 rounded-sm" />
          </div>
          <div className="h-px w-full bg-gray-200" />
        </li>
      ))}
    </ul>
  );
};
