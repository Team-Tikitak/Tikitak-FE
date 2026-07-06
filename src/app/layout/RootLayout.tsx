import { OverlayProvider } from 'overlay-kit';
import { lazy, Suspense } from 'react';
import { Outlet, useLocation } from 'react-router';
import { useInviteDeepLink } from '@/app/lib/useInviteDeepLink';
import { useOAuthDeepLink } from '@/app/lib/useOAuthDeepLink';
import { PATHS } from '@/app/routes/paths';
import { cn } from '@/shared/lib/cn';
import { GlobalBottomNavigation } from './GlobalBottomNavigation';
import { TransitionProvider } from '../providers/TransitionProvider';

const PushNotificationBridge = lazy(() =>
  import('./PushNotificationBridge').then((module) => ({
    default: module.PushNotificationBridge,
  })),
);

interface RootLayoutProps {
  className?: string;
}

const getRouteKey = (pathname: string): string => {
  if (/^\/teams\/\d+\/invite$/.test(pathname)) return PATHS.TEAM_INVITE;
  if (/^\/teams\/\d+$/.test(pathname)) return PATHS.TEAM_DETAIL;
  if (/^\/invite\/[^/]+$/.test(pathname)) return PATHS.INVITE_ACCEPT;
  return pathname;
};

export const RootLayout = ({ className }: RootLayoutProps) => {
  useOAuthDeepLink();
  useInviteDeepLink();
  const location = useLocation();

  return (
    <div
      className={cn(
        'mx-auto flex h-dvh w-full flex-col overflow-hidden bg-white sm:max-w-[393px]',
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
              <div
                key={location.pathname}
                data-ssgoi-transition={getRouteKey(location.pathname)}
                className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-white"
              >
                <Outlet />
              </div>
            )}
          </OverlayProvider>
          <GlobalBottomNavigation />
        </div>
      </TransitionProvider>
      <Suspense fallback={null}>
        <PushNotificationBridge />
      </Suspense>
    </div>
  );
};
