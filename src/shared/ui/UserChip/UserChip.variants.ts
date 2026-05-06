import { tv, type VariantProps } from 'tailwind-variants';

export const userChipVariants = tv({
  base: 'inline-flex items-center overflow-hidden rounded-max border py-[6px] pr-3',
  variants: {
    size: {
      md: 'gap-2 pl-[10px]',
      sm: 'gap-2 pl-2',
    },
    selected: {
      true: 'border-main bg-blue-100',
      false: 'bg-white',
    },
  },
  compoundVariants: [
    { size: 'md', selected: false, class: 'border-gray-200' },
    { size: 'sm', selected: false, class: 'border-gray-300' },
  ],
  defaultVariants: { size: 'md', selected: false },
});

export const avatarSizeClass = { md: 'size-6', sm: 'size-5' } as const;
export const innerGapClass = {
  md: 'flex items-center gap-2',
  sm: 'flex items-center gap-[6px]',
} as const;

export type UserChipVariants = VariantProps<typeof userChipVariants>;
