import { type ComponentPropsWithRef, type ComponentType, type SVGProps } from 'react';
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

interface BottomNavigationTabConfig {
  value: BottomNavigationTab;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  filledIcon?: ComponentType<SVGProps<SVGSVGElement>>;
  fillsWhenSelected?: boolean;
  gridColumnClassName: string;
}

const NAVIGATION_TABS = [
  {
    value: 'home',
    label: '홈',
    icon: HomeIcon,
    fillsWhenSelected: true,
    gridColumnClassName: 'col-start-1',
  },
  {
    value: 'feed',
    label: '피드',
    icon: IconBottom,
    filledIcon: IconBottomFilled,
    fillsWhenSelected: false,
    gridColumnClassName: 'col-start-2',
  },
  {
    value: 'activity',
    label: '활동',
    icon: ActivityIcon,
    filledIcon: ActivityIconFilled,
    fillsWhenSelected: false,
    gridColumnClassName: 'col-start-4',
  },
  {
    value: 'my',
    label: '마이',
    icon: MyIcon,
    fillsWhenSelected: true,
    gridColumnClassName: 'col-start-5',
  },
] satisfies BottomNavigationTabConfig[];

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
      <ul className="grid w-full grid-cols-[1fr_1fr_72px_1fr_1fr] items-center">
        {NAVIGATION_TABS.map(({ gridColumnClassName, ...tab }) => (
          <BottomNavigationItem
            key={tab.value}
            {...tab}
            selected={activeTab === tab.value}
            onSelect={handleTabChange}
            listItemClassName={gridColumnClassName}
          />
        ))}
        <li className="col-start-3 row-start-1 flex justify-center">
          <FloatingButton
            aria-label={createAriaLabel}
            onClick={handleCreateClick}
            disabled={createDisabled}
            className="-translate-y-7 active:-translate-y-7 active:scale-[0.97]"
          />
        </li>
      </ul>
    </nav>
  );
};

export type { BottomNavigationTab };
