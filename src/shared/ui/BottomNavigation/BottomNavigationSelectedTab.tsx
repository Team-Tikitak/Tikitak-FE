import { type ComponentPropsWithRef, type ComponentType, type SVGProps } from 'react';
import ActivityIcon from '@/shared/assets/Icon/ActivityIcon.svg?react';
import FeedIcon from '@/shared/assets/Icon/FeedIcon.svg?react';
import HomeIcon from '@/shared/assets/Icon/HomeIcon.svg?react';
import MyIcon from '@/shared/assets/Icon/MyIcon.svg?react';
import { cn } from '@/shared/lib';
import { BOTTOM_NAVIGATION_TABS, type BottomNavigationTab } from './BottomNavigation.types';
import { BottomNavigationItem } from './BottomNavigationItem';

interface BottomNavigationItemConfig {
  value: BottomNavigationTab;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  fillsWhenSelected?: boolean;
}

interface BottomNavigationSelectedTabProps extends Omit<ComponentPropsWithRef<'ul'>, 'onChange'> {
  activeTab?: BottomNavigationTab;
  onTabChange?: (tab: BottomNavigationTab) => void;
}

const BOTTOM_NAVIGATION_ITEM_CONFIGS = {
  home: { label: '홈', icon: HomeIcon, fillsWhenSelected: true },
  feed: { label: '피드', icon: FeedIcon, fillsWhenSelected: true },
  activity: { label: '활동', icon: ActivityIcon, fillsWhenSelected: true },
  my: { label: '마이', icon: MyIcon, fillsWhenSelected: true },
} satisfies Record<BottomNavigationTab, Omit<BottomNavigationItemConfig, 'value'>>;

export function BottomNavigationSelectedTab({
  activeTab = 'home',
  onTabChange,
  className,
  ref,
  ...props
}: BottomNavigationSelectedTabProps) {
  return (
    <ul
      ref={ref}
      className={cn(
        'grid h-[60px] max-w-[276px] min-w-0 flex-1 grid-cols-4 items-center border border-gray-300 bg-white px-3 py-2',
        className,
      )}
      {...props}
    >
      {BOTTOM_NAVIGATION_TABS.map((tab) => (
        <BottomNavigationItem
          key={tab}
          value={tab}
          {...BOTTOM_NAVIGATION_ITEM_CONFIGS[tab]}
          selected={activeTab === tab}
          onSelect={onTabChange}
        />
      ))}
    </ul>
  );
}
