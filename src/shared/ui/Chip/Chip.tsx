import { type ComponentPropsWithRef } from 'react';
import { cn } from '@/shared/lib';

type ChipProps = ComponentPropsWithRef<'span'>;

export const Chip = ({ className, children, ref, ...props }: ChipProps) => {
  return (
    <span
      ref={ref}
      className={cn(
        'rounded-max button-5 inline-flex w-fit items-center justify-center border border-gray-300 bg-white px-4 py-[6px] text-gray-900',
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
};
