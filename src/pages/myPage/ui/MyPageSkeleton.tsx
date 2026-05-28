import { cn } from '@/shared/lib';

const SkeletonBlock = ({ className }: { className?: string }) => (
  <div className={cn('animate-pulse rounded-md bg-gray-200', className)} />
);

export const MyPageSkeleton = () => {
  return (
    <>
      <section className="flex flex-col gap-4" aria-hidden="true">
        <div className="flex items-center justify-between">
          <SkeletonBlock className="h-6 w-16" />
          <SkeletonBlock className="size-5 rounded-full" />
        </div>
        <div className="flex flex-col gap-3">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="flex items-end justify-between gap-2 rounded-[12px] bg-gray-100 p-[18px]"
            >
              <div className="flex flex-col gap-2">
                <SkeletonBlock className="h-5 w-28" />
                <SkeletonBlock className="h-4 w-20" />
              </div>
              <div className="flex -space-x-2">
                <SkeletonBlock className="size-8 rounded-full" />
                <SkeletonBlock className="size-8 rounded-full" />
                <SkeletonBlock className="size-8 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <SectionListSkeleton />
      <SectionListSkeleton />
    </>
  );
};

const SectionListSkeleton = () => (
  <section className="flex flex-col gap-4" aria-hidden="true">
    <SkeletonBlock className="h-6 w-24" />
    <div className="flex flex-col">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="flex w-full items-center justify-between gap-2 border-b border-gray-200 p-3"
        >
          <SkeletonBlock className="h-5 w-28" />
          <SkeletonBlock className="size-5" />
        </div>
      ))}
    </div>
  </section>
);
