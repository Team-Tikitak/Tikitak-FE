import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { getInviteAcceptPathFromUrl } from '@/app/lib/inviteDeepLink';
import { PATHS } from '@/app/routes/paths';
import { restoreSession } from '@/shared/api/auth/restoreSession';
import { safeSessionGet, safeSessionSet } from '@/shared/lib/storage/sessionStore';

const SPLASH_SEEN_KEY = 'splash-seen';
const SPLASH_DURATION_MS = 2300;

interface UseSplashGateParams {
  animationStarted?: boolean;
}

const readSplashSeen = () => safeSessionGet(SPLASH_SEEN_KEY) === '1';

const markSplashSeen = () => safeSessionSet(SPLASH_SEEN_KEY, '1');

export const useSplashGate = ({ animationStarted = false }: UseSplashGateParams = {}) => {
  const navigate = useNavigate();
  const alreadySeen = readSplashSeen();
  const shouldCheckLaunchInvite = Capacitor.isNativePlatform();
  const [isCheckingLaunchInvite, setIsCheckingLaunchInvite] = useState(shouldCheckLaunchInvite);

  useEffect(() => {
    if (!shouldCheckLaunchInvite) {
      return;
    }

    let cancelled = false;

    void App.getLaunchUrl()
      .then((launch) => {
        if (cancelled) return;

        const invitePath = launch?.url ? getInviteAcceptPathFromUrl(launch.url) : null;
        if (invitePath) {
          markSplashSeen();
          navigate(invitePath, { replace: true });
          return;
        }

        setIsCheckingLaunchInvite(false);
      })
      .catch(() => {
        if (!cancelled) setIsCheckingLaunchInvite(false);
      });

    return () => {
      cancelled = true;
    };
  }, [navigate, shouldCheckLaunchInvite]);

  useEffect(() => {
    if (isCheckingLaunchInvite) {
      return;
    }

    if (alreadySeen) {
      navigate(PATHS.LOGIN, { replace: true });
      return;
    }

    if (!animationStarted) {
      return;
    }

    let cancelled = false;
    const restorePromise = restoreSession();

    const timer = window.setTimeout(() => {
      void restorePromise.then((authed) => {
        if (cancelled) return;
        markSplashSeen();
        if (authed) {
          navigate(PATHS.HOME, { replace: true });
        } else {
          navigate(PATHS.LOGIN, {
            replace: true,
            state: { fromSplash: true },
          });
        }
      });
    }, SPLASH_DURATION_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [alreadySeen, animationStarted, isCheckingLaunchInvite, navigate]);

  return { alreadySeen, isCheckingLaunchInvite };
};
