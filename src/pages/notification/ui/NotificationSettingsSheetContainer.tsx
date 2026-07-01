import { NotificationSettingsSheet } from '@/shared/ui/BottomSheet';
import { usePushNotificationToggle } from '../hooks/usePushNotificationToggle';

// 오버레이는 overlay-kit 트리에서 독립적으로 렌더되므로, 토글 상태를 라이브로
// 반영하려면 훅을 시트와 함께 오버레이 안에서 실행한다.
export const NotificationSettingsSheetContainer = () => {
  const { supported, enabled, pending, toggle } = usePushNotificationToggle();

  return (
    <NotificationSettingsSheet
      supported={supported}
      enabled={enabled}
      pending={pending}
      onToggle={() => void toggle()}
    />
  );
};
