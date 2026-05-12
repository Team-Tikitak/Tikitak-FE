import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { PATHS } from '@/app/routes/paths';

const SPLASH_SEEN_KEY = 'splash-seen';
const SPLASH_DURATION_MS = 2300;

const readSplashSeen = () => {
  try {
    return sessionStorage.getItem(SPLASH_SEEN_KEY) === '1';
  } catch {
    return false;
  }
};

const markSplashSeen = () => {
  try {
    sessionStorage.setItem(SPLASH_SEEN_KEY, '1');
  } catch {
    // 일부 브라우저 보안 모드에서 sessionStorage 쓰기가 막힘 — 다음 진입 시 스플래시 재노출 감수
  }
};

export const useSplashGate = () => {
  const navigate = useNavigate();
  const alreadySeen = readSplashSeen();

  useEffect(() => {
    if (alreadySeen) {
      navigate(PATHS.LOGIN, { replace: true });
      return;
    }

    const timer = window.setTimeout(() => {
      markSplashSeen();
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
