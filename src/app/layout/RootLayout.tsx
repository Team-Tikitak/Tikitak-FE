import { SsgoiTransition } from '@ssgoi/react';
import { OverlayProvider } from 'overlay-kit';
import { Outlet, useLocation } from 'react-router';
import { PATHS } from '@/app/routes';
import { cn } from '@/shared/lib';
import { BottomNavigation, type BottomNavigationTab } from '@/shared/ui';
import { TransitionProvider } from '../providers/TransitionProvider';

interface RootLayoutProps {
  className?: string;
}

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

const getRouteKey = (pathname: string): string => {
  if (/^\/teams\/\d+\/invite$/.test(pathname)) return PATHS.TEAM_INVITE;
  if (/^\/teams\/\d+$/.test(pathname)) return PATHS.TEAM_DETAIL;
  if (/^\/place\/[^/]+$/.test(pathname)) return PATHS.PLACE_DETAIL;
  if (/^\/invite\/[^/]+$/.test(pathname)) return PATHS.INVITE_ACCEPT;
  return pathname;
};

export const RootLayout = ({ className }: RootLayoutProps) => {
  const location = useLocation();
  const showTabBar = isTabPath(location.pathname);
  const activeTab = isTabPath(location.pathname)
    ? ACTIVE_TAB_BY_PATH[location.pathname]
    : undefined;

  return (
    <div
      className={cn(
        'mx-auto flex h-dvh w-full max-w-[393px] flex-col overflow-hidden bg-white',
        className,
      )}
    >
      <TransitionProvider>
        <div id="app-canvas" className="relative z-0 flex min-h-0 flex-1 flex-col overflow-hidden">
          <OverlayProvider>
            {location.pathname === PATHS.ROOT ? (
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <Outlet />
              </div>
            ) : (
              <SsgoiTransition
                key={location.pathname}
                id={getRouteKey(location.pathname)}
                className="flex h-full min-h-0 flex-1 flex-col overflow-hidden"
              >
                <Outlet />
              </SsgoiTransition>
            )}
          </OverlayProvider>
          <div
            className={cn(
              'absolute bottom-0 left-1/2 z-30 w-full max-w-[393px] -translate-x-1/2 transition-opacity duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]',
              showTabBar ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
            )}
          >
            <BottomNavigation activeTab={activeTab} />
          </div>
        </div>
      </TransitionProvider>
    </div>
  );
};
