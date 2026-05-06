import { type ComponentPropsWithRef } from 'react';
import { cn } from '@/shared/lib';

type MenuButtonType = 'grid' | 'list';

interface MenuButtonProps extends Omit<ComponentPropsWithRef<'button'>, 'type'> {
  menuType?: MenuButtonType;
  selected?: boolean;
}

const GridIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3" y="3" width="7" height="7" rx="1" fill="currentColor" />
    <rect x="14" y="3" width="7" height="7" rx="1" fill="currentColor" />
    <rect x="3" y="14" width="7" height="7" rx="1" fill="currentColor" />
    <rect x="14" y="14" width="7" height="7" rx="1" fill="currentColor" />
  </svg>
);

const ListIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3" y="4" width="5" height="3" rx="1" fill="currentColor" />
    <rect x="11" y="4" width="10" height="3" rx="1" fill="currentColor" />
    <rect x="3" y="10.5" width="5" height="3" rx="1" fill="currentColor" />
    <rect x="11" y="10.5" width="10" height="3" rx="1" fill="currentColor" />
    <rect x="3" y="17" width="5" height="3" rx="1" fill="currentColor" />
    <rect x="11" y="17" width="10" height="3" rx="1" fill="currentColor" />
  </svg>
);

export const MenuButton = ({
  menuType = 'grid',
  selected = false,
  className,
  'aria-label': ariaLabel,
  ref,
  ...props
}: MenuButtonProps) => {
  const Icon = menuType === 'grid' ? GridIcon : ListIcon;

  return (
    <button
      ref={ref}
      type="button"
      aria-label={ariaLabel ?? (menuType === 'grid' ? '그리드 보기' : '리스트 보기')}
      aria-pressed={selected}
      className={cn(
        'flex size-6 items-center justify-center transition-colors duration-150',
        selected ? 'text-black' : 'text-gray-600',
        className,
      )}
      {...props}
    >
      <Icon className="size-[18px]" />
    </button>
  );
};
