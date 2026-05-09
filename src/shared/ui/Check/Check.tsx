import { type ComponentPropsWithRef } from 'react';
import CheckIcon from '@/shared/assets/Icon/CheckIcon.svg?react';
import { cn } from '@/shared/lib';

interface CheckProps extends ComponentPropsWithRef<'span'> {
  checked?: boolean;
}

export function Check({ checked = false, className, ref, ...props }: CheckProps) {
  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={cn(
        'inline-flex size-6 items-center justify-center',
        checked ? 'text-main-001' : 'text-gray-400',
        className,
      )}
      {...props}
    >
      <CheckIcon className="size-6" />
    </span>
  );
}
