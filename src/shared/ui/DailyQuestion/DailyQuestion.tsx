import { type ComponentPropsWithRef } from 'react';
import RightIcon from '@/shared/assets/Icon/RightIcon.svg?react';
import { cn } from '@/shared/lib';

export interface DailyQuestionProps extends ComponentPropsWithRef<'button'> {
  question: string;
}

export const DailyQuestion = ({
  question,
  onClick,
  className,
  ref,
  ...props
}: DailyQuestionProps) => (
  <button
    type="button"
    ref={ref}
    onClick={onClick}
    className={cn(
      'flex h-9 w-full shrink-0 items-center justify-center gap-[10px] bg-[#43b0e0] px-5 text-white',
      className,
    )}
    {...props}
  >
    <span className="logo shrink-0 text-white">Today's Tiki-tak!</span>
    <span className="min-w-0 truncate text-[12px] leading-normal font-bold text-white">
      {question}
    </span>
    {onClick && <RightIcon className="size-4 shrink-0 text-white" />}
  </button>
);
