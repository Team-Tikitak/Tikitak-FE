import { Capacitor } from '@capacitor/core';

interface FeedPushTarget {
  feedId: string;
  teamId?: string;
}

// 안드로이드는 남은 알림의 data에 FCM 데이터가 없어 feedId로 찾을 수 없다
export const clearFeedPushNotifications = async ({
  feedId,
  teamId,
}: FeedPushTarget): Promise<void> => {
  if (Capacitor.getPlatform() !== 'ios') return;

  const { FirebaseMessaging } = await import('@capacitor-firebase/messaging');
  const { notifications } = await FirebaseMessaging.getDeliveredNotifications();
  const sameFeedNotifications = notifications.filter((notification) => {
    const data = notification.data as { feedId?: unknown; teamId?: unknown } | undefined;
    if (String(data?.feedId) !== feedId) return false;
    return !teamId || String(data?.teamId) === teamId;
  });

  if (sameFeedNotifications.length === 0) return;
  await FirebaseMessaging.removeDeliveredNotifications({ notifications: sameFeedNotifications });
};
