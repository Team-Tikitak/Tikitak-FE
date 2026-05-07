import { tv } from 'tailwind-variants';

export const AvatarGroupVariants = tv({
  base: 'flex items-center',
  variants: {
    size: {
      sm: '-space-x-2',
      md: '-space-x-[15px]',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});
