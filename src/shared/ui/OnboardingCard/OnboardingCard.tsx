import { tv } from 'tailwind-variants';

const OnboardingCardVariants = tv({
  base: 'w-full h-21 gap-1 p-[18px] flex rounded-sm flex-col items-start justify-center cursor-pointer',
  variants: {
    isSelected: {
      true: 'border border-main-002 bg-main-000',
      false: 'bg-gray-100',
    },
  },
  defaultVariants: {
    isSelected: false,
  },
});

export type OnboardingCardProps = {
  title: string;
  description: string;
  isSelected?: boolean;
} & React.ComponentPropsWithRef<'button'>;

export function OnboardingCard({
  title,
  description,
  isSelected,
  className,
  ...props
}: OnboardingCardProps) {
  return (
    <button type="button" className={OnboardingCardVariants({ isSelected, className })} {...props}>
      <p className="body-9 text-main-002">{title}</p>
      <p className="body-5 text-gray-600">{description}</p>
    </button>
  );
}
