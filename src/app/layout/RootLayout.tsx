import { OverlayProvider } from 'overlay-kit';
import { Outlet, useLocation } from 'react-router';
import { useOAuthDeepLink } from '@/app/lib/useOAuthDeepLink';
import { PATHS } from '@/app/routes/paths';
import { usePushNotificationDeepLink } from '@/shared/hooks/usePushNotificationDeepLink';
import { usePushNotificationSync } from '@/shared/hooks/usePushNotificationSync';
import { cn } from '@/shared/lib';
import { GlobalBottomNavigation } from './GlobalBottomNavigation';
import { TransitionProvider } from '../providers/TransitionProvider';

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
  usePushNotificationSync();
  usePushNotificationDeepLink();
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
    </div>
  );
};
