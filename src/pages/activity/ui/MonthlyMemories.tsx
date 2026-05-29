import { useHomeEveryonePick, useHomeRegions } from '@/shared/api/home/queries';
import { ContentImageCard } from './ContentImageCard';

interface MonthlyMemoriesProps {
  teamId: number | null | undefined;
}

export const MonthlyMemories = ({ teamId }: MonthlyMemoriesProps) => {
  const { data: pickData } = useHomeEveryonePick(teamId);
  const { data: regionsData } = useHomeRegions(teamId);

  const firstPick = pickData?.picks[0];
  const firstRegion = regionsData?.regions[0];

  return (
    <section className="flex w-full flex-col gap-[18px]">
      <h2 className="body-2 text-black">6월 추억</h2>
      <div className="flex w-full items-center gap-4">
        <ContentImageCard
          title="모두의 PICK"
          description="반응과 댓글이 가장 많은 사진"
          imageUrl={firstPick?.thumbnailImageUrl}
        />
        <ContentImageCard
          title={firstRegion ? `${firstRegion.region}에서` : '지역별 추억'}
          description="지역별로 모아보는 사진"
          imageUrl={firstRegion?.thumbnailImageUrl}
        />
      </div>
    </section>
  );
};
