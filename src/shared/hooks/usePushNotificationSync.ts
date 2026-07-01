import { Capacitor } from '@capacitor/core';
import { useEffect } from 'react';
import { useRegisterDeviceToken } from '@/shared/api/notification/queries';
import { useGetAgreements } from '@/shared/api/user/queries';
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
  const resyncNonce = usePushSyncStore((state) => state.resyncNonce);
  const { mutate: registerDeviceToken } = useRegisterDeviceToken();

  const { data: agreements } = useGetAgreements({
    enabled: isLoggedIn && Capacitor.isNativePlatform(),
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
