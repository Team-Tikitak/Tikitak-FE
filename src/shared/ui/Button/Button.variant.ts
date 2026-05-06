import { tv } from 'tailwind-variants';

export const ButtonVariants = tv({
  base: [
    'flex items-center justify-center',
    'h-11 rounded-max gap-xs button-7',
    'active:bg-gray-300 active:text-gray-700 active:border-none',
  ],

  variants: {
    variant: {
      default: 'border border-gray-400 bg-white text-gray-700',
      destructive: 'bg-red-100 text-red-600',
    },
  },

  defaultVariants: {
    variant: 'default',
  },
});
