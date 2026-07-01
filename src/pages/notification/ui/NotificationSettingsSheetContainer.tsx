import { NotificationSettingsSheet } from './NotificationSettingsSheet';
import { usePushNotificationToggle } from '../hooks/usePushNotificationToggle';

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
