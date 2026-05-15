import { Ssgoi, SsgoiTransition } from '@ssgoi/react';
import { fade, sheet } from '@ssgoi/react/view-transitions';
import { OverlayProvider } from 'overlay-kit';
import { Outlet, useLocation } from 'react-router';
import { PATHS } from '@/app/routes';
import { cn } from '@/shared/lib';
import { BottomNavigation, type BottomNavigationTab } from '@/shared/ui';

interface RootLayoutProps {
  className?: string;
}

const INSTANT_PHYSICS = { spring: { stiffness: 1500, damping: 80 } };
const FAST_PHYSICS = { spring: { stiffness: 1000, damping: 55 } };

const ssgoiConfig = {
  defaultTransition: fade({ physics: INSTANT_PHYSICS }),
  transitions: [
    { from: PATHS.HOME, to: PATHS.FEED_CREATE, transition: sheet({ physics: FAST_PHYSICS }) },
    { from: PATHS.FEED, to: PATHS.FEED_CREATE, transition: sheet({ physics: FAST_PHYSICS }) },
    { from: PATHS.MY_PAGE, to: PATHS.FEED_CREATE, transition: sheet({ physics: FAST_PHYSICS }) },
  ],
};

const TAB_PATHS = [PATHS.HOME, PATHS.FEED, PATHS.MY_PAGE] as const;
type TabPath = (typeof TAB_PATHS)[number];

const ACTIVE_TAB_BY_PATH = {
  [PATHS.HOME]: 'home',
  [PATHS.FEED]: 'feed',
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
      <Ssgoi config={ssgoiConfig}>
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
            <div className="pointer-events-auto absolute bottom-[calc(8px+env(safe-area-inset-bottom))] left-1/2 z-30 flex w-full max-w-[393px] -translate-x-1/2 justify-center px-5">
              <BottomNavigation activeTab={activeTab} />
            </div>
          )}
        </div>
      </Ssgoi>
    </div>
  );
};
