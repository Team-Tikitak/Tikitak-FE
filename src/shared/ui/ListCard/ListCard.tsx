import { type ComponentPropsWithRef } from 'react';
import { tv } from 'tailwind-variants';
import RightIcon from '@/shared/assets/Icon/RightIcon.svg?react';

const ListCardVariants = tv({
  base: 'w-full h-14 gap-2 px-[18px] py-[14px] flex items-center justify-between text-gray-900 border-b border-gray-200 cursor-pointer',
});

export interface ListCardProps extends ComponentPropsWithRef<'button'> {
  title: string;
}

export function ListCard({ title, className, ref, ...props }: ListCardProps) {
  return (
    <button type="button" className={ListCardVariants({ className })} ref={ref} {...props}>
      <span className="body-7">{title}</span>
      <RightIcon className="size-5" aria-hidden="true" focusable="false" />
    </button>
  );
}
