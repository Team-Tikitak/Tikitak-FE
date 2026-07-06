import { useEffect } from 'react';
import { useNavigate } from 'react-router';
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

  useEffect(() => {
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
  }, [alreadySeen, animationStarted, navigate]);

  return { alreadySeen };
};
