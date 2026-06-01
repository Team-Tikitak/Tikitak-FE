import { type ComponentPropsWithRef } from 'react';
import { cn } from '@/shared/lib';

type SkeletonProps = ComponentPropsWithRef<'div'>;

export const Skeleton = ({ className, ref, ...props }: SkeletonProps) => {
  return (
    <div ref={ref} className={cn('animate-pulse rounded-md bg-gray-200', className)} {...props} />
  );
};
