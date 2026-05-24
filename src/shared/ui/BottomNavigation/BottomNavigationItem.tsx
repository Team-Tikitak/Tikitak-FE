import { type ComponentType, type SVGProps } from 'react';
import { cn } from '@/shared/lib';
import { type BottomNavigationTab } from './BottomNavigation.types';

interface BottomNavigationItemProps {
  value: BottomNavigationTab;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  selected?: boolean;
  fillsWhenSelected?: boolean;
  onSelect?: (tab: BottomNavigationTab) => void;
}

export function BottomNavigationItem({
  value,
  label,
  icon: Icon,
  selected = false,
  fillsWhenSelected = false,
  onSelect,
}: BottomNavigationItemProps) {
  return (
    <li className="flex min-w-0 justify-center">
      <button
        type="button"
        aria-current={selected ? 'page' : undefined}
        onClick={() => onSelect?.(value)}
        className={cn(
          'rounded-max press-feedback flex h-[44px] w-full max-w-[84px] flex-col items-center justify-center text-[12px] leading-[140%] font-medium text-gray-500',
          selected && 'text-main font-semibold',
        )}
      >
        <Icon
          aria-hidden="true"
          className={cn(
            'size-6 shrink-0',
            selected && fillsWhenSelected && '[&_path]:fill-current',
            selected && '[&_.icon-filled]:inline [&_.icon-outline]:hidden',
          )}
        />
        <span>{label}</span>
      </button>
    </li>
  );
}
