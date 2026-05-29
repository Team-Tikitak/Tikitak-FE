import TakCareIcon from '@/shared/assets/Character/TakCare.svg?react';
import { cn } from '@/shared/lib';
import type { ComponentPropsWithoutRef } from 'react';

type LoadingStateVariant = 'page' | 'fullscreen' | 'inline';

export interface LoadingStateProps extends ComponentPropsWithoutRef<'div'> {
  variant?: LoadingStateVariant;
  label?: string;
}

const variantClassName: Record<LoadingStateVariant, string> = {
  page: 'min-h-[320px] py-12',
  fullscreen: 'h-full min-h-dvh',
  inline: 'py-6',
};

const iconClassName: Record<LoadingStateVariant, string> = {
  page: 'size-16',
  fullscreen: 'size-20',
  inline: 'size-10',
};

export const LoadingState = ({
  variant = 'page',
  label = '불러오는 중',
  className,
  ...props
}: LoadingStateProps) => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn(
        'flex w-full flex-col items-center justify-center gap-3 text-gray-500',
        variantClassName[variant],
        className,
      )}
      {...props}
    >
      <TakCareIcon className={cn('loading-character', iconClassName[variant])} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  );
};
