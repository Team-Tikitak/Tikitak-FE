import { useNavigate } from 'react-router';
import { PATHS } from '@/app/routes/paths';
import { useHomeEveryonePick, useHomeRegions } from '@/shared/api/home/queries';
import TakBuilder from '@/shared/assets/Character/TakBuilder.svg?react';
import type { HeroSourceItem } from '@/shared/hooks/useHeroHandoff';
import { normalizeImageUrl } from '@/shared/lib';
import { ContentImageCard } from './ContentImageCard';

interface MonthlyMemoriesProps {
  teamId: number | null | undefined;
  suppressedItemId?: string | null;
  onHeroCapture?: (item: HeroSourceItem, source: HTMLElement | null) => void;
}

export const MonthlyMemories = ({
  teamId,
  suppressedItemId = null,
  onHeroCapture,
}: MonthlyMemoriesProps) => {
  const navigate = useNavigate();
  const { data: pickData, isPending: isPickPending } = useHomeEveryonePick(teamId);
  const { data: regionsData, isPending: isRegionsPending } = useHomeRegions(teamId);

  const isPending = isPickPending || isRegionsPending;
  const firstPick = pickData?.picks[0];
  const firstRegion = regionsData?.regions[0];
  const month = pickData?.month ?? regionsData?.month;

  if (!isPending && !firstPick && !firstRegion) {
    return (
      <section className="flex w-full flex-col gap-[18px]">
        {month != null && <h2 className="body-2 text-black">{month}월 추억</h2>}
        <div className="flex h-[204px] w-full flex-col items-center justify-center gap-4 rounded-lg bg-gray-100 px-6">
          <TakBuilder className="w-[72px]" aria-hidden="true" />
          <p className="body-10 text-center text-gray-600">
            아직 이번 달의 추억이 없어요.
            <br />
            사진에 댓글을 남겨서 모두의 Pick을 채워주세요.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex w-full flex-col gap-[18px]">
      {isPending ? (
        <div className="h-[22px] w-24 animate-pulse rounded bg-gray-200" />
      ) : (
        <h2 className="body-2 text-black">{month}월 추억</h2>
      )}
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
                heroKey={`pin-${firstPick.feedId}`}
                suppressed={suppressedItemId === String(firstPick.feedId)}
                onPointerDown={(event) => {
                  const source =
                    event.currentTarget.querySelector<HTMLElement>('[data-hero-exit-key]');
                  onHeroCapture?.(
                    {
                      id: String(firstPick.feedId),
                      heroKey: `pin-${firstPick.feedId}`,
                      thumbnailUrl: normalizeImageUrl(firstPick.thumbnailImageUrl) ?? '',
                    },
                    source,
                  );
                }}
                onClick={() => navigate(PATHS.ACTIVITY_EVERYONE_PICK)}
              />
            )}
            {firstRegion && (
              <ContentImageCard
                title={`${firstRegion.region}에서`}
                description="지역별로 모아보는 사진"
                imageUrl={normalizeImageUrl(firstRegion.thumbnailImageUrl)}
                heroKey={`pin-${firstRegion.feedId}`}
                suppressed={suppressedItemId === String(firstRegion.feedId)}
                onPointerDown={(event) => {
                  const source =
                    event.currentTarget.querySelector<HTMLElement>('[data-hero-exit-key]');
                  onHeroCapture?.(
                    {
                      id: String(firstRegion.feedId),
                      heroKey: `pin-${firstRegion.feedId}`,
                      thumbnailUrl: normalizeImageUrl(firstRegion.thumbnailImageUrl) ?? '',
                    },
                    source,
                  );
                }}
                onClick={() => navigate(PATHS.ACTIVITY_REGION_FEEDS)}
              />
            )}
          </>
        )}
      </div>
    </section>
  );
};
