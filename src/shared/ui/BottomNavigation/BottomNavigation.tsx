import { type ComponentPropsWithRef } from 'react';
import { useNavigate } from 'react-router';
import { PATHS } from '@/app/routes';
import { cn } from '@/shared/lib';
import { FloatingButton } from '../FloatingButton';
import { type BottomNavigationTab } from './BottomNavigation.types';
import { BottomNavigationSelectedTab } from './BottomNavigationSelectedTab';

interface BottomNavigationProps extends Omit<ComponentPropsWithRef<'nav'>, 'onChange'> {
  activeTab?: BottomNavigationTab;
  onCreateClick?: () => void;
  createAriaLabel?: string;
}

export const BottomNavigation = ({
  activeTab = 'home',
  onCreateClick,
  createAriaLabel = '추가',
  className,
  ref,
  ...props
}: BottomNavigationProps) => {
  const navigate = useNavigate();

  const handleTabChange = (tab: BottomNavigationTab) => {
    if (tab === 'home') navigate(PATHS.HOME);
    if (tab === 'feed') navigate(PATHS.FEED);
    if (tab === 'my') navigate(PATHS.MY_PAGE);
  };

  const handleCreateClick = onCreateClick ?? (() => navigate(PATHS.FEED_CREATE));

  return (
    <nav
      ref={ref}
      aria-label="하단 내비게이션"
      className={cn('flex w-full max-w-[353px] items-center justify-between gap-3', className)}
      {...props}
    >
      <BottomNavigationSelectedTab activeTab={activeTab} onTabChange={handleTabChange} />
      <FloatingButton
        aria-label={createAriaLabel}
        onClick={handleCreateClick}
        className="shrink-0"
      />
    </nav>
  );
};

export type { BottomNavigationTab };
