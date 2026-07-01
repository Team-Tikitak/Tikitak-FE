import { Capacitor } from '@capacitor/core';
import { useEffect } from 'react';
import { useRegisterDeviceToken } from '@/shared/api/notification/queries';
import { useGetAgreements } from '@/shared/api/user/queries';
import { readPushEnabled, storeDeviceToken } from '@/shared/lib/native/deviceTokenStorage';
import {
  getDeviceToken,
  getDeviceTokenIfGranted,
  resolvePlatform,
} from '@/shared/lib/native/getDeviceToken';
import { confirmDialog } from '@/shared/lib/native/nativeDialog';
import { openAppSettings } from '@/shared/lib/native/openAppSettings';
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

    const register = async (fcmToken: string) => {
      // 앱 내에서 알림을 꺼둔 경우 재등록하지 않음(끈 설정을 앱 재실행이 되돌리는 것 방지)
      if (!(await readPushEnabled())) return;
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
        void register(token.fcmToken);
      } else if (hasAgreedTerms) {
        const result = await getDeviceToken();
        if (cancelled) return;

        if (result.status === 'just-denied') {
          const goSettings = await confirmDialog({
            title: '알림 권한 필요',
            message: '알림이 꺼져 있어요. 설정에서 직접 허용할 수 있어요.',
            okButtonTitle: '설정 열기',
            cancelButtonTitle: '취소',
          });
          if (goSettings) await openAppSettings();
          return;
        }

        if (result.status === 'already-denied') return;
        if (result.status === 'granted') void register(result.token.fcmToken);
      }

      const { FirebaseMessaging } = await import('@capacitor-firebase/messaging');
      const handle = await FirebaseMessaging.addListener(
        'tokenReceived',
        ({ token: refreshed }) => {
          if (refreshed) void register(refreshed);
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
