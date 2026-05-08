import { type ComponentPropsWithRef } from 'react';
import { cn } from '@/shared/lib';
import { progressBarVariants } from './ProgressBar.variant';

interface OnboardingProgressBarProps extends ComponentPropsWithRef<'div'> {
  currentStep: 1 | 2 | 3;
}

export function ProgressBar({ currentStep, className, ref, ...props }: OnboardingProgressBarProps) {
  const { container } = progressBarVariants();

  return (
    <div
      role="progressbar"
      aria-valuenow={currentStep}
      aria-valuemin={1}
      aria-valuemax={3}
      ref={ref}
      className={cn(container(), className)}
      {...props}
    >
      {Array.from({ length: 3 }).map((_, index) => {
        const isActive = index < currentStep;

        const { item } = progressBarVariants({
          active: isActive,
        });

        return <div key={index} className={item()} />;
      })}
    </div>
  );
}
