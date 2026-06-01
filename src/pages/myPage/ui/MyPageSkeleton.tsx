import { Skeleton } from '@/shared/ui';

export const MyPageSkeleton = () => {
  return (
    <>
      <section className="flex flex-col gap-4" aria-hidden="true">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="size-5 rounded-full" />
        </div>
        <div className="flex flex-col gap-3">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="flex items-end justify-between gap-2 rounded-[12px] bg-gray-100 p-[18px]"
            >
              <div className="flex flex-col gap-2">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex -space-x-2">
                <Skeleton className="size-8 rounded-full" />
                <Skeleton className="size-8 rounded-full" />
                <Skeleton className="size-8 rounded-full" />
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
    <Skeleton className="h-6 w-24" />
    <div className="flex flex-col">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="flex w-full items-center justify-between gap-2 border-b border-gray-200 p-3"
        >
          <Skeleton className="h-5 w-28" />
          <Skeleton className="size-5" />
        </div>
      ))}
    </div>
  </section>
);
