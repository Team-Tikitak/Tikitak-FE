import { type ComponentPropsWithRef } from 'react';
import { cn } from '@/shared/lib';
import { FloatingButton } from '../FloatingButton';
import { type BottomNavigationTab } from './BottomNavigation.types';
import { BottomNavigationSelectedTab } from './BottomNavigationSelectedTab';

interface BottomNavigationProps extends Omit<ComponentPropsWithRef<'nav'>, 'onChange'> {
  activeTab?: BottomNavigationTab;
  onTabChange?: (tab: BottomNavigationTab) => void;
  onCreateClick?: () => void;
  createAriaLabel?: string;
}

export const BottomNavigation = ({
  activeTab = 'home',
  onTabChange,
  onCreateClick,
  createAriaLabel = '추가',
  className,
  ref,
  ...props
}: BottomNavigationProps) => {
  return (
    <nav
      ref={ref}
      aria-label="하단 내비게이션"
      className={cn('flex w-[353px] items-center justify-between', className)}
      {...props}
    >
      <BottomNavigationSelectedTab activeTab={activeTab} onTabChange={onTabChange} />
      <FloatingButton aria-label={createAriaLabel} onClick={onCreateClick} className="shrink-0" />
    </nav>
  );
};

export type { BottomNavigationTab };
