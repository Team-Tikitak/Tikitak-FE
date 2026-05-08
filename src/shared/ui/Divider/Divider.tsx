import { type ComponentPropsWithRef } from 'react';
import { cn } from '@/shared/lib';

type DividerProps = ComponentPropsWithRef<'hr'>;

export const Divider = ({ className, ref, ...props }: DividerProps) => {
  return <hr ref={ref} className={cn('h-px w-full border-0 bg-gray-200', className)} {...props} />;
};
