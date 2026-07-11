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
  interactive?: boolean;
}

interface BottomNavigationTabConfig {
  value: BottomNavigationTab;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  filledIcon?: ComponentType<SVGProps<SVGSVGElement>>;
  iconClassName?: string;
  fillsWhenSelected?: boolean;
  gridColumnClassName: 'col-start-1' | 'col-start-2' | 'col-start-4' | 'col-start-5';
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
    iconClassName: '-translate-x-[0.3px]',
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
  interactive = true,
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
        'relative h-[calc(88px+env(safe-area-inset-bottom))] w-full overflow-visible pb-[env(safe-area-inset-bottom)]',
        className,
      )}
      {...props}
    >
      <ul className="absolute bottom-0 left-0 grid h-[calc(60px+env(safe-area-inset-bottom))] w-full grid-cols-[minmax(0,1fr)_minmax(0,1fr)_80px_minmax(0,1fr)_minmax(0,1fr)] items-center border-t border-gray-300 bg-white px-5 pt-2 pb-[calc(8px+env(safe-area-inset-bottom))]">
        {NAVIGATION_TABS.map(({ gridColumnClassName, ...tab }) => (
          <BottomNavigationItem
            key={tab.value}
            {...tab}
            selected={activeTab === tab.value}
            onSelect={handleTabChange}
            listItemClassName={gridColumnClassName}
          />
        ))}
        <li className="pointer-events-none absolute top-[-28px] left-0 h-14 w-full">
          <FloatingButton
            aria-label={createAriaLabel}
            onClick={handleCreateClick}
            disabled={createDisabled}
            className={cn(
              'absolute top-0 left-1/2 -translate-x-1/2',
              interactive ? 'pointer-events-auto' : 'pointer-events-none',
            )}
          />
        </li>
      </ul>
    </nav>
  );
};

export type { BottomNavigationTab };
