import { type ComponentPropsWithRef, type ComponentType, type SVGProps } from 'react';
import { tv } from 'tailwind-variants';
import { cn } from '@/shared/lib';
import { type BottomNavigationTab } from './BottomNavigation.types';

const bottomNavigationButtonVariants = tv({
  base: 'group rounded-max flex h-[44px] w-full max-w-[84px] items-center justify-center text-[12px] leading-[140%] font-medium text-gray-500 transition-colors duration-150 ease-out [-webkit-tap-highlight-color:transparent]',
  variants: {
    selected: {
      true: 'text-main font-semibold',
      false: '',
    },
  },
});

const bottomNavigationIconVariants = tv({
  base: 'size-6 shrink-0',
  variants: {
    fillCurrent: {
      true: '[&_path]:fill-current',
      false: '',
    },
    showFilledIcon: {
      true: '[&_.icon-filled]:inline [&_.icon-outline]:hidden',
      false: '',
    },
  },
});

interface BottomNavigationItemProps extends Omit<ComponentPropsWithRef<'button'>, 'onSelect'> {
  value: BottomNavigationTab;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  filledIcon?: ComponentType<SVGProps<SVGSVGElement>>;
  iconClassName?: string;
  selected?: boolean;
  fillsWhenSelected?: boolean;
  listItemClassName?: string;
  onSelect?: (tab: BottomNavigationTab) => void;
}

export function BottomNavigationItem({
  value,
  label,
  icon: Icon,
  filledIcon: FilledIcon,
  iconClassName,
  selected = false,
  fillsWhenSelected = false,
  listItemClassName,
  onSelect,
  className,
  ref,
  ...props
}: BottomNavigationItemProps) {
  const ResolvedIcon = selected && FilledIcon ? FilledIcon : Icon;

  return (
    <li className={cn('flex min-w-0 justify-center', listItemClassName)}>
      <button
        type="button"
        ref={ref}
        aria-current={selected ? 'page' : undefined}
        onClick={() => onSelect?.(value)}
        className={bottomNavigationButtonVariants({ selected, className })}
        {...props}
      >
        <span className="flex flex-col items-center justify-center transition-transform duration-150 ease-out group-active:scale-[0.98]">
          <ResolvedIcon
            aria-hidden="true"
            className={bottomNavigationIconVariants({
              fillCurrent: selected && fillsWhenSelected && !FilledIcon,
              showFilledIcon: selected,
              className: iconClassName,
            })}
          />
          <span className="relative inline-grid">
            <span aria-hidden="true" className="invisible font-semibold">
              {label}
            </span>
            <span className="absolute inset-0">{label}</span>
          </span>
        </span>
      </button>
    </li>
  );
}
