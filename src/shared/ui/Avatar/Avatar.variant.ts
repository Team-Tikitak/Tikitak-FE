import { tv } from 'tailwind-variants';

export const AvatarVariants = tv({
  base: 'overflow-hidden bg-white border border-gray-200 rounded-full flex items-center justify-center',
  variants: {
    size: {
      xs: 'size-6',
      sm: 'size-7',
      md: 'size-9',
      lg: 'size-11',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});
