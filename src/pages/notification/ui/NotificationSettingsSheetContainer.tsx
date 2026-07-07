import { NotificationSettingsSheet } from '@/shared/ui/BottomSheet';
import { usePushNotificationToggle } from '../hooks/usePushNotificationToggle';

export const NotificationSettingsSheetContainer = () => {
  const { supported, enabled, toggle } = usePushNotificationToggle();

  return (
    <NotificationSettingsSheet
      supported={supported}
      enabled={enabled}
      onToggle={() => void toggle()}
    />
  );
};
