import TikitakLogoIcon from '@/shared/assets/Logo/tikitakLogoIcon.svg?react';
import { cn } from '@/shared/lib';

interface PullToRefreshIndicatorProps {
  pullDistance: number;
  threshold: number;
  refreshing?: boolean;
  className?: string;
}

const INDICATOR_SIZE = 48;

export const PullToRefreshIndicator = ({
  pullDistance,
  threshold,
  refreshing = false,
  className,
}: PullToRefreshIndicatorProps) => {
  const progress = refreshing ? 1 : Math.min(1, pullDistance / threshold);
  const visible = refreshing || pullDistance > 0;
  const refreshDistance = refreshing ? threshold : pullDistance;
  const translateY = Math.max(0, refreshDistance / 2 - INDICATOR_SIZE / 2);
  const logoScale = 0.9 + progress * 0.1;
  const fillClipTop = `${100 - progress * 100}%`;
  const shouldSpin = refreshing || progress >= 1;

  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-x-0 top-0 z-30 mx-auto flex size-12 items-center justify-center transition-[opacity,transform] duration-180 ease-out',
        visible ? 'opacity-100' : 'opacity-0',
        className,
      )}
      style={{ transform: `translateY(${translateY}px)` }}
    >
      <div className={cn('size-10 origin-center', shouldSpin && 'animate-spin')}>
        <div
          className="relative size-full overflow-hidden"
          style={{ transform: `scale(${logoScale})` }}
        >
          <TikitakLogoIcon className="absolute inset-0 size-full opacity-35 grayscale" />
          <TikitakLogoIcon
            className="absolute inset-0 size-full"
            style={{ clipPath: `inset(${fillClipTop} 0 0 0)` }}
          />
        </div>
      </div>
    </div>
  );
};
