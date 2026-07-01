import { tv } from 'tailwind-variants';

export const switchVariants = tv({
  slots: {
    track:
      'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200 ease-out',
    thumb:
      'inline-block size-[22px] rounded-full bg-white shadow-switch transition-transform duration-200 ease-out',
  },

  variants: {
    checked: {
      true: {
        track: 'bg-main-001',
        thumb: 'translate-x-[23px]',
      },

      false: {
        track: 'bg-gray-300',
        thumb: 'translate-x-[3px]',
      },
    },

    disabled: {
      true: {
        track: 'opacity-50',
      },
    },
  },
});
