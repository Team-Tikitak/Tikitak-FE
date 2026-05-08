import { tv } from 'tailwind-variants';
import LeftIcon from '@/shared/assets/Icon/LeftIcon.svg?react';

const ListCardVariants = tv({
  base: 'w-full h-14 gap-2 px-[18px] py-[14px] flex items-center justify-between text-gray-900 border-b border-gray-200',
});

export type ListCardProps = {
  title: string;
} & React.ComponentPropsWithRef<'div'>;

export function ListCard({ title, ...props }: ListCardProps) {
  return (
    <div className={ListCardVariants()} {...props}>
      <span className="body-7">{title}</span>
      <LeftIcon className="size-5" />
    </div>
  );
}
