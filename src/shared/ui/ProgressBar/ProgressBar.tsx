import { cn } from '@/shared/lib';
import { progressBarVariants } from './ProgressBar.variant';

type OnboardingProgressBarProps = {
  currentStep: 1 | 2 | 3;
} & React.ComponentPropsWithRef<'div'>;

export function ProgressBar({ currentStep, className, ref, ...props }: OnboardingProgressBarProps) {
  const { container } = progressBarVariants();

  return (
    <div ref={ref} className={cn(container(), className)} {...props}>
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
