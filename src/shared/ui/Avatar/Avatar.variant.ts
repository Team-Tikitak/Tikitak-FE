import { tv } from 'tailwind-variants';

export const AvatarVariants = tv({
  base: 'overflow-hidden bg-white border border-gray-200 rounded-full flex items-center justify-center',
  variants: {
    size: {
      xs: 'size-6',
      sm: 'size-7 gap-2.5 p-1.5',
      md: 'size-9 gap-3 p-2',
      lg: 'size-11 gap-[15px] p-2',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});
