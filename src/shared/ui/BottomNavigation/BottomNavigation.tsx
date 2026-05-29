import { type ComponentPropsWithRef } from 'react';
import { useNavigate } from 'react-router';
import { PATHS } from '@/app/routes/paths';
import ActivityIcon from '@/shared/assets/Icon/ActivityIcon.svg?react';
import ActivityIconFilled from '@/shared/assets/Icon/ActivityIcon_Filled.svg?react';
import HomeIcon from '@/shared/assets/Icon/HomeIcon.svg?react';
import IconBottom from '@/shared/assets/Icon/IconBottom.svg?react';
import IconBottomFilled from '@/shared/assets/Icon/IconBottom_Filled.svg?react';
import MyIcon from '@/shared/assets/Icon/MyIcon.svg?react';
import { cn } from '@/shared/lib';
import { FloatingButton } from '../FloatingButton';
import { type BottomNavigationTab } from './BottomNavigation.types';
import { BottomNavigationItem } from './BottomNavigationItem';

interface BottomNavigationProps extends Omit<ComponentPropsWithRef<'nav'>, 'onChange'> {
  activeTab?: BottomNavigationTab;
  onCreateClick?: () => void;
  createAriaLabel?: string;
  createDisabled?: boolean;
}

const LEFT_TABS = [
  { value: 'home' as const, label: '홈', icon: HomeIcon, fillsWhenSelected: true },
  {
    value: 'feed' as const,
    label: '피드',
    icon: IconBottom,
    filledIcon: IconBottomFilled,
    fillsWhenSelected: false,
  },
];

const RIGHT_TABS = [
  {
    value: 'activity' as const,
    label: '활동',
    icon: ActivityIcon,
    filledIcon: ActivityIconFilled,
    fillsWhenSelected: false,
  },
  { value: 'my' as const, label: '마이', icon: MyIcon, fillsWhenSelected: true },
];

export const BottomNavigation = ({
  activeTab = 'home',
  onCreateClick,
  createAriaLabel = '추가',
  createDisabled = false,
  className,
  ref,
  ...props
}: BottomNavigationProps) => {
  const navigate = useNavigate();

  const handleTabChange = (tab: BottomNavigationTab) => {
    if (tab === 'home') navigate(PATHS.HOME);
    if (tab === 'feed') navigate(PATHS.FEED);
    if (tab === 'activity') navigate(PATHS.ACTIVITY);
    if (tab === 'my') navigate(PATHS.MY_PAGE);
  };

  const handleCreateClick = onCreateClick ?? (() => navigate(PATHS.FEED_CREATE));

  return (
    <nav
      ref={ref}
      aria-label="하단 내비게이션"
      className={cn(
        'relative flex h-[calc(60px+env(safe-area-inset-bottom))] w-full items-center overflow-visible border-t border-gray-300 bg-white pb-[env(safe-area-inset-bottom)]',
        className,
      )}
      {...props}
    >
      <ul className="flex flex-1 justify-around">
        {LEFT_TABS.map((tab) => (
          <BottomNavigationItem
            key={tab.value}
            {...tab}
            selected={activeTab === tab.value}
            onSelect={handleTabChange}
          />
        ))}
      </ul>
      <FloatingButton
        aria-label={createAriaLabel}
        onClick={handleCreateClick}
        disabled={createDisabled}
        className="shrink-0 -translate-y-5"
      />
      <ul className="flex flex-1 justify-around">
        {RIGHT_TABS.map((tab) => (
          <BottomNavigationItem
            key={tab.value}
            {...tab}
            selected={activeTab === tab.value}
            onSelect={handleTabChange}
          />
        ))}
      </ul>
    </nav>
  );
};

export type { BottomNavigationTab };
