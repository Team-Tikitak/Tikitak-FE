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
            <SsgoiTransition
              key={location.pathname}
              id={location.pathname}
              className="flex min-h-0 flex-1 flex-col overflow-hidden"
            >
              <Outlet />
            </SsgoiTransition>
          </OverlayProvider>
          {showTabBar && (
            <div className="pointer-events-auto absolute bottom-0 left-1/2 z-30 w-full max-w-[393px] -translate-x-1/2">
              <BottomNavigation activeTab={activeTab} />
            </div>
          )}
        </div>
      </TransitionProvider>
    </div>
  );
};
