import { AvatarGroupVariants } from './AvatarGroup.variant';
import { Avatar } from '../Avatar/Avatar';
import type { ComponentPropsWithoutRef } from 'react';
import type { VariantProps } from 'tailwind-variants';

type AvatarItem = {
  id: number;
  src: string;
  alt?: string;
};

type AvatarGroupProps = VariantProps<typeof AvatarGroupVariants> &
  ComponentPropsWithoutRef<'div'> & {
    users: AvatarItem[];
  };

export function AvatarGroup({ users, size = 'md', className, ...props }: AvatarGroupProps) {
  return (
    <div className={AvatarGroupVariants({ size, className })} {...props}>
      {users.map((user) => (
        <Avatar key={user.id} src={user.src} alt={user.alt} size={size} />
      ))}
    </div>
  );
}
