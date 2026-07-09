import { cn } from '@/shared/lib';
import { Skeleton } from '@/shared/ui';

interface NotificationSkeletonProps {
  count?: number;
  className?: string;
}

export const NotificationSkeleton = ({ count = 6, className }: NotificationSkeletonProps) => (
  <ul className={cn('flex flex-col p-5', className)} aria-hidden="true">
    {Array.from({ length: count }).map((_, index) => (
      <li key={index} className="flex w-full items-center gap-3 py-4">
        <Skeleton className="size-10 shrink-0 rounded-full" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Skeleton className="h-4 w-3/5" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="size-13 shrink-0 rounded-sm" />
      </li>
    ))}
  </ul>
);
