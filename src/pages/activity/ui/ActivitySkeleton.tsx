import { cn } from '@/shared/lib';
import { Skeleton } from '@/shared/ui';

export const ActivitySkeleton = () => {
  return (
    <div className="flex flex-col gap-9 px-5" aria-hidden="true">
      <section className="flex w-full flex-col gap-[18px]">
        <Skeleton className="h-6 w-32" />
        <div className="flex h-[235px] w-full items-end justify-center gap-0">
          <div className="order-1 flex w-[76px] flex-col items-center gap-3">
            <Skeleton className="size-11 rounded-full" />
            <Skeleton className="h-[68px] w-[76px] rounded-sm" />
          </div>
          <div className="order-2 flex w-[76px] flex-col items-center gap-3">
            <Skeleton className="size-11 rounded-full" />
            <Skeleton className="h-[115px] w-[76px] rounded-sm" />
          </div>
          <div className="order-3 flex w-[76px] flex-col items-center gap-3">
            <Skeleton className="size-11 rounded-full" />
            <Skeleton className="h-[48px] w-[76px] rounded-sm" />
          </div>
        </div>
      </section>

      <ContentCardSkeleton titleWidth="w-24" />
      <ContentCardSkeleton titleWidth="w-32" />
    </div>
  );
};

const ContentCardSkeleton = ({ titleWidth }: { titleWidth: string }) => (
  <section className="flex w-full flex-col gap-[18px]">
    <Skeleton className={cn('h-6', titleWidth)} />
    <div className="flex w-full items-center gap-4">
      <Skeleton className="h-[204px] flex-1 rounded-lg" />
      <Skeleton className="h-[204px] flex-1 rounded-lg" />
    </div>
  </section>
);
