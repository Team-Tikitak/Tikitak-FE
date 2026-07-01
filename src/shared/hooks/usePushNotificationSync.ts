import { Capacitor } from '@capacitor/core';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useRegisterDeviceToken } from '@/shared/api/notification/queries';
import { unwrap } from '@/shared/api/request';
import { getAgreements } from '@/shared/api/user/api';
import { userKeys } from '@/shared/api/user/keys';
import { storeDeviceToken } from '@/shared/lib/native/deviceTokenStorage';
import {
  getDeviceToken,
  getDeviceTokenIfGranted,
  resolvePlatform,
} from '@/shared/lib/native/getDeviceToken';
import { useAuthStore } from '@/shared/stores/authStore';
import { usePushSyncStore } from '@/shared/stores/pushSyncStore';

export const usePushNotificationSync = () => {
  const isLoggedIn = useAuthStore((state) => Boolean(state.accessToken));
  // 약관 화면에서 알림 권한을 새로 허용하면 이 값이 바뀌며 effect가 재실행된다.
  const resyncNonce = usePushSyncStore((state) => state.resyncNonce);
  const { mutate: registerDeviceToken } = useRegisterDeviceToken();

  // 약관 화면을 건너뛰는(이미 동의한) 유저를 판별하기 위해 약관 동의 여부를 구독한다.
  // 로더가 채워둔 캐시를 공유하며, 값이 도착하면 아래 effect가 재실행된다.
  const { data: agreements } = useQuery({
    queryKey: userKeys.agreements(),
    queryFn: () => unwrap(() => getAgreements()),
    enabled: isLoggedIn && Capacitor.isNativePlatform(),
    staleTime: 5 * 60 * 1000,
  });
  const hasAgreedTerms = Boolean(agreements?.termsAgreed && agreements?.privacyAgreed);

  useEffect(() => {
    if (!isLoggedIn || !Capacitor.isNativePlatform()) return;

    let cancelled = false;
    let removeListener: (() => void) | undefined;
    let latestToken: string | undefined;

    const register = (fcmToken: string) => {
      const platform = resolvePlatform();
      if (!platform) return;
      latestToken = fcmToken;
      registerDeviceToken(
        { fcmToken, platform },
        {
          onSuccess: () => {
            if (fcmToken === latestToken) void storeDeviceToken(fcmToken);
          },
        },
      );
    };

    void (async () => {
      const token = await getDeviceTokenIfGranted();
      if (cancelled) return;

      if (token) {
        register(token.fcmToken);
      } else if (hasAgreedTerms) {
        // 약관 화면을 보지 않는(이미 동의한) 유저는 여기서 알림 권한을 요청한다.
        // 신규 유저는 hasAgreedTerms=false라 약관 화면이 요청을 담당하고, 여기서는 요청하지 않는다.
        const result = await getDeviceToken();
        if (cancelled) return;
        if (result.status === 'granted') register(result.token.fcmToken);
      }

      const { FirebaseMessaging } = await import('@capacitor-firebase/messaging');
      const handle = await FirebaseMessaging.addListener(
        'tokenReceived',
        ({ token: refreshed }) => {
          if (refreshed) register(refreshed);
        },
      );
      if (cancelled) {
        void handle.remove();
        return;
      }
      removeListener = () => void handle.remove();
    })();

    return () => {
      cancelled = true;
      removeListener?.();
    };
  }, [isLoggedIn, registerDeviceToken, resyncNonce, hasAgreedTerms]);
};
