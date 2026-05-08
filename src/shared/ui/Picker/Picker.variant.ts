import { tv } from 'tailwind-variants';

export const PickerVariants = tv({
  base: 'h-11 flex items-center justify-center rounded-full rounded-bl-none cursor-pointer shadow-picker',
  variants: {
    variant: {
      default: 'bg-white',
      new: 'bg-main-001',
    },
    count: {
      single: 'w-11',
      multiple: 'w-18',
    },
  },
  defaultVariants: {
    variant: 'default',
    count: 'single',
  },
});
