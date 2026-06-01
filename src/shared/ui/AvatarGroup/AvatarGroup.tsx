import { cn } from '@/shared/lib';
import { AvatarGroupVariants } from './AvatarGroup.variant';
import { Avatar } from '../Avatar/Avatar';
import type { ComponentPropsWithoutRef } from 'react';
import type { VariantProps } from 'tailwind-variants';

export type AvatarItem = {
  id: number;
  src: string;
  alt?: string;
};

type AvatarGroupProps = VariantProps<typeof AvatarGroupVariants> &
  ComponentPropsWithoutRef<'div'> & {
    users: AvatarItem[];
    max?: number;
    total?: number;
  };

const overflowSizeClassName = {
  sm: 'size-7 text-[10px]',
  md: 'size-9 text-xs',
} as const;

export function AvatarGroup({
  users,
  size = 'md',
  max,
  total,
  className,
  ...props
}: AvatarGroupProps) {
  const visibleUsers = typeof max === 'number' ? users.slice(0, max) : users;
  const totalCount = total ?? users.length;
  const overflowCount = totalCount - visibleUsers.length;

  return (
    <div className={AvatarGroupVariants({ size, className })} {...props}>
      {visibleUsers.map((user) => (
        <Avatar key={user.id} src={user.src} alt={user.alt} size={size} />
      ))}
      {overflowCount > 0 && (
        <div
          className={cn(
            'flex items-center justify-center rounded-full border border-gray-200 bg-gray-100 font-medium text-gray-600',
            overflowSizeClassName[size],
          )}
        >
          +{overflowCount}
        </div>
      )}
    </div>
  );
}
