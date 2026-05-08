import { type ComponentPropsWithRef } from 'react';
import GridIcon from '@/shared/assets/Icon/GridIcon.svg?react';
import ListIcon from '@/shared/assets/Icon/ListIcon.svg?react';
import { cn } from '@/shared/lib';

const MENU_BUTTON_TYPES = ['grid', 'list'] as const;

type MenuButtonType = (typeof MENU_BUTTON_TYPES)[number];

const DEFAULT_MENU_BUTTON_TYPE = MENU_BUTTON_TYPES[0];

const MENU_BUTTON_ICONS = {
  grid: GridIcon,
  list: ListIcon,
} satisfies Record<MenuButtonType, typeof GridIcon>;

const MENU_BUTTON_ARIA_LABELS = {
  grid: '그리드 보기',
  list: '리스트 보기',
} satisfies Record<MenuButtonType, string>;

interface MenuButtonProps extends Omit<ComponentPropsWithRef<'button'>, 'type'> {
  menuType?: MenuButtonType;
  selected?: boolean;
}

export const MenuButton = ({
  menuType = DEFAULT_MENU_BUTTON_TYPE,
  selected = false,
  className,
  'aria-label': ariaLabel,
  ref,
  ...props
}: MenuButtonProps) => {
  const Icon = MENU_BUTTON_ICONS[menuType];

  return (
    <button
      ref={ref}
      type="button"
      aria-label={ariaLabel ?? MENU_BUTTON_ARIA_LABELS[menuType]}
      aria-pressed={selected}
      className={cn(
        'flex size-6 items-center justify-center transition-colors duration-150',
        selected ? 'text-gray-700' : 'text-gray-300',
        className,
      )}
      {...props}
    >
      <Icon aria-hidden="true" className="size-6" />
    </button>
  );
};
