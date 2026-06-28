import { Capacitor } from '@capacitor/core';
import { useEffect } from 'react';
import { useRegisterDeviceToken } from '@/shared/api/notification/queries';
import { getDeviceToken, resolvePlatform } from '@/shared/lib/native/getDeviceToken';
import { confirmDialog } from '@/shared/lib/native/nativeDialog';
import { openAppSettings } from '@/shared/lib/native/openAppSettings';
import { useAuthStore } from '@/shared/stores/authStore';

export const usePushNotificationSync = () => {
  // 토큰 문자열이 아니라 로그인 여부(boolean)에만 의존한다.
  // 토큰 문자열을 쓰면 401 인터셉터의 토큰 갱신마다 effect가 재실행되어 중복 등록된다.
  const isLoggedIn = useAuthStore((state) => Boolean(state.accessToken));
  const { mutate: registerDeviceToken } = useRegisterDeviceToken();

  useEffect(() => {
    if (!isLoggedIn || !Capacitor.isNativePlatform()) return;

    let cancelled = false;
    let removeListener: (() => void) | undefined;

    const register = (fcmToken: string) => {
      const platform = resolvePlatform();
      if (!platform) return;
      registerDeviceToken({ fcmToken, platform });
    };

    void (async () => {
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

      // 권한 거부 상태면 토큰이 발급될 일이 없으므로 종료.
      if (result.status === 'already-denied') return;

      // granted면 즉시 등록. unavailable(예: iOS 콜드스타트에 APNs 토큰 미준비로
      // 첫 getToken 실패)이어도 종료하지 않고 아래 리스너를 등록해, APNs 토큰이
      // 도착해 FCM 토큰이 발급되는 순간 tokenReceived로 받아 등록한다.
      if (result.status === 'granted') register(result.token.fcmToken);

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
  }, [isLoggedIn, registerDeviceToken]);
};
