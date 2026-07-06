import { usePushNotificationDeepLink } from '@/app/lib/usePushNotificationDeepLink';
import { usePushNotificationSync } from '@/shared/hooks/usePushNotificationSync';

export const PushNotificationBridge = () => {
  usePushNotificationSync();
  usePushNotificationDeepLink();
  return null;
};
