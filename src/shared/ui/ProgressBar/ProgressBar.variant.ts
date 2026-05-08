import { tv } from 'tailwind-variants';

export const progressBarVariants = tv({
  slots: {
    container: 'flex gap-2.5',
    item: 'h-1 flex-1 rounded-max',
  },

  variants: {
    active: {
      true: {
        item: 'bg-main-001',
      },

      false: {
        item: 'bg-gray-300',
      },
    },
  },
});
