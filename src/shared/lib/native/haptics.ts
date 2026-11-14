import { Capacitor } from '@capacitor/core';

export const HAPTIC_KINDS = ['light', 'medium', 'selection', 'success', 'error'] as const;
export type HapticKind = (typeof HAPTIC_KINDS)[number];

/**
 * 네이티브 앱에서만 진동 피드백을 준다. 웹이나 플러그인이 없는 구버전 앱에서는 조용히 무시한다.
 * 원격 웹이 구버전 앱에도 먼저 배포되므로, 플러그인 등록 여부를 매번 확인한다.
 */
export const triggerHaptic = (kind: HapticKind = 'light'): void => {
  if (!Capacitor.isNativePlatform()) return;

  void import('@capacitor/haptics')
    .then(async ({ Haptics, ImpactStyle, NotificationType }) => {
      if (!Capacitor.isPluginAvailable('Haptics')) return;

      switch (kind) {
        case 'light':
          return Haptics.impact({ style: ImpactStyle.Light });
        case 'medium':
          return Haptics.impact({ style: ImpactStyle.Medium });
        case 'selection':
          return Haptics.selectionChanged();
        case 'success':
          return Haptics.notification({ type: NotificationType.Success });
        case 'error':
          return Haptics.notification({ type: NotificationType.Error });
      }
    })
    .catch(() => {
      // 진동은 부가 피드백이라 실패해도 동작을 막지 않는다
    });
};
