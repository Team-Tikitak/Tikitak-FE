import { Capacitor } from '@capacitor/core';
import { useEffect, useState } from 'react';
import { useDeleteDeviceToken, useRegisterDeviceToken } from '@/shared/api/notification/queries';
import {
  readPushEnabled,
  readStoredDeviceToken,
  storeDeviceToken,
  storePushEnabled,
} from '@/shared/lib/native/deviceTokenStorage';
import {
  getDeviceToken,
  invalidateDeviceToken,
  isNotificationPermissionGranted,
} from '@/shared/lib/native/getDeviceToken';
import { confirmDialog } from '@/shared/lib/native/nativeDialog';
import { openAppSettings } from '@/shared/lib/native/openAppSettings';

export const usePushNotificationToggle = () => {
  // 푸시는 네이티브(iOS/Android)에서만 지원. 웹 등은 미지원.
  const supported = Capacitor.isNativePlatform();
  const [enabled, setEnabled] = useState<boolean | null>(null); // null = 로딩 중
  const [pending, setPending] = useState(false);
  const { mutateAsync: registerToken } = useRegisterDeviceToken();
  const { mutateAsync: deleteToken } = useDeleteDeviceToken();

  // 저장된 설정값 + 현재 OS 권한을 합쳐 실제 수신 상태로 초기화.
  // 앱 밖에서 권한이 회수되면 저장값이 true여도 실제로는 꺼진 상태이므로 OFF로 표시.
  useEffect(() => {
    void (async () => {
      const stored = await readPushEnabled();
      if (!supported) {
        setEnabled(stored);
        return;
      }
      const granted = await isNotificationPermissionGranted();
      setEnabled(stored && granted);
    })();
  }, [supported]);

  const enable = async (): Promise<boolean> => {
    const result = await getDeviceToken();

    if (result.status === 'just-denied' || result.status === 'already-denied') {
      const goSettings = await confirmDialog({
        title: '알림 권한 필요',
        message: '알림 권한이 필요해요.\n설정에서 직접 허용해주세요',
        okButtonTitle: '설정 열기',
        cancelButtonTitle: '취소',
      });
      if (goSettings) await openAppSettings();
      return false;
    }

    if (result.status !== 'granted') {
      return false;
    }

    try {
      await registerToken({ fcmToken: result.token.fcmToken, platform: result.token.platform });
      await storeDeviceToken(result.token.fcmToken);
      return true;
    } catch {
      return false;
    }
  };

  const disable = async (): Promise<boolean> => {
    const stored = await readStoredDeviceToken();
    if (stored) {
      try {
        await deleteToken({ fcmToken: stored });
      } catch {
        // 서버 삭제 실패해도 로컬/FCM 토큰은 폐기
      }
    }
    await invalidateDeviceToken();
    return true;
  };

  const toggle = async () => {
    if (!supported || enabled === null || pending) return;
    setPending(true);

    try {
      const next = !enabled;
      const ok = next ? await enable() : await disable();
      if (ok) {
        await storePushEnabled(next);
        setEnabled(next);
      }
    } finally {
      setPending(false);
    }
  };

  return { supported, enabled, pending, toggle };
};
