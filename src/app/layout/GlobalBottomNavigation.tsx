import { useLocation } from 'react-router';
import { PATHS } from '@/app/routes/paths';
import { usePrefetchGameLeaderboards } from '@/shared/api/game/queries';
import { useMe } from '@/shared/api/user/queries';
import { useNativeKeyboardVisible } from '@/shared/hooks/useNativeKeyboardVisible';
import { cn } from '@/shared/lib/cn';
import { useAuthStore } from '@/shared/stores/authStore';
import { BottomNavigation, type BottomNavigationTab } from '@/shared/ui/BottomNavigation';

const TAB_PATHS = [PATHS.HOME, PATHS.FEED, PATHS.ACTIVITY, PATHS.MY_PAGE] as const;
type TabPath = (typeof TAB_PATHS)[number];

const ACTIVE_TAB_BY_PATH = {
  [PATHS.HOME]: 'home',
  [PATHS.FEED]: 'feed',
  [PATHS.ACTIVITY]: 'activity',
  [PATHS.MY_PAGE]: 'my',
} satisfies Record<TabPath, BottomNavigationTab>;

const isTabPath = (pathname: string): pathname is TabPath =>
  (TAB_PATHS as readonly string[]).includes(pathname);

export const GlobalBottomNavigation = () => {
  const location = useLocation();
  const showTabBar = isTabPath(location.pathname);
  const accessToken = useAuthStore((state) => state.accessToken);
  const { data: me } = useMe({ enabled: showTabBar && Boolean(accessToken) });
  const hasActiveTeam = Boolean(me?.activeTeamId);
  // 활동 탭의 게임 순위·게임왕이 늦게 뜨지 않도록 다른 탭에 있을 때 미리 받아 둔다
  usePrefetchGameLeaderboards(showTabBar ? me?.activeTeamId : undefined);
  const activeTab = isTabPath(location.pathname)
    ? ACTIVE_TAB_BY_PATH[location.pathname]
    : undefined;
  const isKeyboardVisible = useNativeKeyboardVisible();
  const isInteractive = showTabBar && !isKeyboardVisible;

  return (
    <div
      className={cn(
        'absolute bottom-0 left-1/2 z-30 w-full -translate-x-1/2 transition-opacity duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] sm:max-w-[393px]',
        isInteractive ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
      )}
    >
      <BottomNavigation
        activeTab={activeTab}
        createDisabled={!hasActiveTeam}
        interactive={isInteractive}
      />
    </div>
  );
};
