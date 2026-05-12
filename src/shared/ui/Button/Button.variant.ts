import { tv } from 'tailwind-variants';

export const ButtonVariants = tv({
  base: [
    'flex items-center justify-center',
    'h-11 w-full rounded-max gap-xs button-7',
    'active:bg-gray-300 active:text-gray-700 active:border-none',
    'disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-400',
  ],

  variants: {
    variant: {
      default: 'border border-gray-400 bg-white text-gray-700',
      primary: 'h-12 bg-main-001 px-4 py-3 button-1 text-white',
      secondary: 'border border-invite-border bg-white button-0 text-black',
      destructive: 'bg-red-100 text-red-600',
    },
  },

  defaultVariants: {
    variant: 'default',
  },
});
