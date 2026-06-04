import { useNavigate } from 'react-router';
import { toFeedDetail } from '@/app/routes';
import { useHomeEveryonePick, useHomeRegions } from '@/shared/api/home/queries';
import { normalizeImageUrl } from '@/shared/lib';
import { ContentImageCard } from './ContentImageCard';

interface MonthlyMemoriesProps {
  teamId: number | null | undefined;
}

export const MonthlyMemories = ({ teamId }: MonthlyMemoriesProps) => {
  const navigate = useNavigate();
  const { data: pickData, isPending: isPickPending } = useHomeEveryonePick(teamId);
  const { data: regionsData, isPending: isRegionsPending } = useHomeRegions(teamId);

  const isPending = isPickPending || isRegionsPending;
  const firstPick = pickData?.picks[0];
  const firstRegion = regionsData?.regions[0];

  if (!isPending && !firstPick && !firstRegion) return null;

  return (
    <section className="flex w-full flex-col gap-[18px]">
      <h2 className="body-2 text-black">{pickData?.month ?? regionsData?.month ?? ''}월 추억</h2>
      <div className="grid w-full grid-cols-2 gap-4">
        {isPending ? (
          <>
            <div className="h-[204px] animate-pulse rounded-lg bg-gray-200" />
            <div className="h-[204px] animate-pulse rounded-lg bg-gray-200" />
          </>
        ) : (
          <>
            {firstPick && (
              <ContentImageCard
                title="모두의 PICK"
                description="반응과 댓글이 가장 많은 사진"
                imageUrl={normalizeImageUrl(firstPick.thumbnailImageUrl)}
                onClick={() => navigate(toFeedDetail(String(firstPick.feedId)))}
              />
            )}
            {firstRegion && (
              <ContentImageCard
                title={`${firstRegion.region}에서`}
                description="지역별로 모아보는 사진"
                imageUrl={normalizeImageUrl(firstRegion.thumbnailImageUrl)}
              />
            )}
          </>
        )}
      </div>
    </section>
  );
};
