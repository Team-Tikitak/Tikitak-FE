import { Skeleton } from '@/shared/ui';

export const TeamDetailSkeleton = () => {
  return (
    <>
      <section className="flex flex-col gap-4" aria-hidden="true">
        <Skeleton className="h-6 w-20" />
        <div className="bg-main-000 flex items-center gap-3 rounded-lg p-4">
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="ml-auto h-5 w-8" />
        </div>
      </section>

      <section className="flex flex-col gap-4" aria-hidden="true">
        <Skeleton className="h-6 w-20" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center gap-2 py-3 pr-4">
              <Skeleton className="size-10 shrink-0 rounded-full" />
              <div className="flex flex-col gap-1">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <Skeleton className="h-[52px] w-full rounded-lg" aria-hidden="true" />
    </>
  );
};
