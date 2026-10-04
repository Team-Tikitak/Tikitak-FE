import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { PATHS } from '@/app/routes/paths';
import { restoreSession } from '@/shared/api/auth/restoreSession';
import {
  hasPendingPushDeepLink,
  subscribePendingPushDeepLink,
} from '@/shared/lib/native/pendingPushDeepLink';
import { getInviteAcceptPathFromUrl } from '@/shared/lib/routing/inviteDeepLink';
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
    let proceeded = false;
    const restorePromise = restoreSession();

    const proceed = () => {
      if (proceeded) return;
      proceeded = true;
      void restorePromise.then((result) => {
        if (cancelled) return;
        markSplashSeen();
        if (result === 'authenticated') {
          navigate(PATHS.HOME, { replace: true });
        } else {
          // 서버 장애로 확인하지 못한 경우는 로그아웃이 아니므로 로그인 화면에서 안내한다
          navigate(PATHS.LOGIN, {
            replace: true,
            state:
              result === 'unavailable'
                ? { fromSplash: true, sessionUnavailable: true }
                : { fromSplash: true },
          });
        }
      });
    };

    // 푸시 알림을 탭해 진입했다면 스플래시 연출 시간을 기다리지 않고 인증 복구 직후 바로 넘어간다
    if (hasPendingPushDeepLink()) {
      proceed();
      return () => {
        cancelled = true;
      };
    }

    const timer = window.setTimeout(proceed, SPLASH_DURATION_MS);
    const unsubscribe = subscribePendingPushDeepLink(() => {
      window.clearTimeout(timer);
      proceed();
    });

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      unsubscribe();
    };
  }, [alreadySeen, animationStarted, isCheckingLaunchInvite, navigate]);

  return { alreadySeen, isCheckingLaunchInvite };
};
