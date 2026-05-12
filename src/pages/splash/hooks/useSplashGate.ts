import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { PATHS } from '@/app/routes/paths';

const SPLASH_SEEN_KEY = 'splash-seen';
const SPLASH_DURATION_MS = 2300;

export const useSplashGate = () => {
  const navigate = useNavigate();
  const alreadySeen = sessionStorage.getItem(SPLASH_SEEN_KEY) === '1';

  useEffect(() => {
    if (alreadySeen) {
      navigate(PATHS.LOGIN, { replace: true });
      return;
    }

    const timer = window.setTimeout(() => {
      sessionStorage.setItem(SPLASH_SEEN_KEY, '1');
      navigate(PATHS.LOGIN, {
        replace: true,
        state: { fromSplash: true },
        viewTransition: true,
      });
    }, SPLASH_DURATION_MS);

    return () => window.clearTimeout(timer);
  }, [alreadySeen, navigate]);

  return { alreadySeen };
};
