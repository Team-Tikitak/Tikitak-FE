import { App } from '@capacitor/app';
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

// 콜드스타트(푸시 진입 등)의 첫 화면 요청과 경합하지 않도록 앱 시작 시 동기화를 늦춘다
const STARTUP_SYNC_DELAY_MS = 5000;

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

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
    const removeListeners: Array<() => void> = [];
    let latestToken: string | undefined;

    const register = async (fcmToken: string) => {
      // 앱 시작마다 tokenReceived가 같은 토큰으로 한 번 더 오므로 중복 등록하지 않는다
      if (fcmToken === latestToken) return;
      latestToken = fcmToken;
      // 앱 내에서 알림을 꺼둔 경우 재등록하지 않음(끈 설정을 앱 재실행이 되돌리는 것 방지)
      if (!(await readPushEnabled())) return;
      const platform = resolvePlatform();
      if (!platform || cancelled) return;
      registerDeviceToken(
        { fcmToken, platform },
        {
          onSuccess: () => {
            if (fcmToken === latestToken) void storeDeviceToken(fcmToken);
          },
          // 실패한 토큰이 다시 오면 재등록할 수 있도록 중복 검사 대상에서 제외
          onError: () => {
            if (fcmToken === latestToken) latestToken = undefined;
          },
        },
      );
    };

    void (async () => {
      if (resyncNonce === 0) {
        await wait(STARTUP_SYNC_DELAY_MS);
        if (cancelled) return;
      }

      // 설정 앱에서 권한을 허용하고 돌아왔거나 등록이 실패한 경우를 포그라운드 복귀 때 다시 맞춘다
      const appStateHandle = await App.addListener('appStateChange', ({ isActive }) => {
        if (!isActive || latestToken) return;
        void getDeviceTokenIfGranted().then((token) => {
          if (token && !cancelled) void register(token.fcmToken);
        });
      });
      if (cancelled) {
        void appStateHandle.remove();
        return;
      }
      removeListeners.push(() => void appStateHandle.remove());

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
      removeListeners.push(() => void handle.remove());
    })();

    return () => {
      cancelled = true;
      removeListeners.forEach((remove) => remove());
    };
  }, [isLoggedIn, registerDeviceToken, resyncNonce, hasAgreedTerms]);
};
