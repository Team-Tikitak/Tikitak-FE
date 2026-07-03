import { cn } from '@/shared/lib';
import { AvatarVariants } from './Avatar.variant';
import type { ComponentPropsWithoutRef } from 'react';
import type { VariantProps } from 'tailwind-variants';

type AvatarProps = VariantProps<typeof AvatarVariants> &
  ComponentPropsWithoutRef<'div'> & {
    src: string;
    alt?: string;
  };

export function Avatar({ src, alt = '', size, className, ...props }: AvatarProps) {
  return (
    <div className={cn(AvatarVariants({ size }), className)} {...props}>
      <img src={src} alt={alt} className="size-full object-cover" />
    </div>
  );
}
