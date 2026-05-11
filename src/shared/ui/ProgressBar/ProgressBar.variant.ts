import { tv } from 'tailwind-variants';

export const progressBarVariants = tv({
  slots: {
    container: 'flex gap-2.5',
    item: 'h-1 flex-1 overflow-hidden rounded-max bg-gray-300',
    fill: 'h-full w-full origin-left rounded-max bg-main-001 transition-transform duration-300 ease-out',
  },

  variants: {
    active: {
      true: {
        fill: 'scale-x-100',
      },

      false: {
        fill: 'scale-x-0',
      },
    },
  },
});
