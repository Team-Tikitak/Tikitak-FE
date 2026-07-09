import { cn } from '@/shared/lib';
import TodayTikitakLogo from '../../../shared/assets/Logo/TodaysTikitak.svg?react';

interface TodayTikitakChipProps {
  className?: string;
}

export const TodayTikitakChip = ({ className }: TodayTikitakChipProps) => {
  return (
    <div
      role="img"
      aria-label="Today's Tiki-tak!"
      className={cn('bg-main-001 h-6 w-20 rounded-tl-sm rounded-br-sm px-1.5 py-[2px]', className)}
    >
      <TodayTikitakLogo aria-hidden className="size-full" />
    </div>
  );
};
