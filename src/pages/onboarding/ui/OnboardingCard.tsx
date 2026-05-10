import { type ComponentPropsWithRef } from 'react';
import { tv } from 'tailwind-variants';

const OnboardingCardVariants = tv({
  base: [
    'flex h-21 w-full cursor-pointer flex-col items-start justify-center gap-1 rounded-sm border p-[18px]',
    'touch-manipulation select-none',
    'transition-[background-color,border-color,transform] duration-100 ease-out',
    'active:scale-[0.985]',
  ],
  variants: {
    isSelected: {
      true: 'border-main-002 bg-main-000',
      false: 'border-transparent bg-gray-100',
    },
  },
  defaultVariants: {
    isSelected: false,
  },
});

export interface OnboardingCardProps extends ComponentPropsWithRef<'button'> {
  title: string;
  description: string;
  isSelected?: boolean;
}

export function OnboardingCard({
  title,
  description,
  isSelected,
  className,
  ref,
  ...props
}: OnboardingCardProps) {
  return (
    <button
      type="button"
      ref={ref}
      className={OnboardingCardVariants({ isSelected, className })}
      aria-pressed={isSelected}
      {...props}
    >
      <p className="body-9 text-main-002">{title}</p>
      <p className="body-5 font-pretendard text-gray-600">{description}</p>
    </button>
  );
}
