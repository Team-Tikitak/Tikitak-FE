import { useState } from 'react';
import { useRecommendedPlaces } from '@/shared/api/home/queries';
import { cn } from '@/shared/lib';
import { ContentImageCard } from './ContentImageCard';
import { RECOMMENDED_PLACES_TOOLTIP } from '../model/mock';

const InfoIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="10" cy="6.5" r="1" fill="currentColor" />
    <rect x="9.25" y="9" width="1.5" height="6" rx="0.75" fill="currentColor" />
  </svg>
);

const CloseIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
    <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

interface MonthlyRecommendedPlacesProps {
  teamId: number | null | undefined;
}

export const MonthlyRecommendedPlaces = ({ teamId }: MonthlyRecommendedPlacesProps) => {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const { data: placesData } = useRecommendedPlaces(teamId);

  return (
    <section className="flex w-full flex-col gap-[18px]">
      <div className="relative flex items-center gap-2">
        <h2 className="body-2 text-black">{placesData?.month}월 추천 장소</h2>
        <button
          type="button"
          aria-label="추천 장소 안내"
          className="flex size-5 items-center justify-center text-gray-500"
          onClick={() => setTooltipOpen((v) => !v)}
        >
          <InfoIcon className="size-5" />
        </button>
        {tooltipOpen && (
          <Tooltip text={RECOMMENDED_PLACES_TOOLTIP} onClose={() => setTooltipOpen(false)} />
        )}
      </div>
      <div className="flex w-full items-center gap-4">
        {placesData?.places.map((place) => (
          <ContentImageCard
            key={place.name}
            title={place.name}
            description={place.curation}
            imageUrl={place.imageUrl}
            onClick={place.kakaoMapUrl ? () => window.open(place.kakaoMapUrl, '_blank') : undefined}
          />
        ))}
      </div>
    </section>
  );
};

interface TooltipProps {
  text: string;
  onClose: () => void;
  className?: string;
}

const Tooltip = ({ text, onClose, className }: TooltipProps) => (
  <div className={cn('absolute top-[22px] left-[49px] z-10', className)}>
    <div className="absolute top-[-6px] left-[45px] size-0 border-x-[6px] border-b-8 border-x-transparent border-b-blue-100" />
    <div className="flex items-center gap-1 rounded-full bg-blue-100 px-4 py-2">
      <span className="text-sm leading-[1.4] tracking-[-0.056px] whitespace-nowrap text-gray-900">
        {text}
      </span>
      <button
        type="button"
        onClick={onClose}
        aria-label="안내 닫기"
        className="flex size-6 items-center justify-center text-gray-900"
      >
        <CloseIcon className="size-6" />
      </button>
    </div>
  </div>
);
