import { useNavigate } from 'react-router';
import { toFeedDetail } from '@/app/routes/paths';
import { useReadNotification } from '@/shared/api/notification/queries';
import { preloadNotificationHeroAssets } from '../lib/heroAssets';
import type { NotificationListItem } from './useNotifications';
import type { MouseEvent } from 'react';

/** 알림 아이템 클릭 처리 — 읽음 처리 + 히어로 이미지 프리로드(≤180ms) 후 피드 상세로 이동 */
export const useNotificationClick = () => {
  const navigate = useNavigate();
  const { mutate: readNotification } = useReadNotification();

  const preloadNotification = (notification: NotificationListItem) => {
    void preloadNotificationHeroAssets(notification);
  };

  const handleNotificationClick = async (
    event: MouseEvent<HTMLAnchorElement>,
    notification: NotificationListItem,
  ) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      event.shiftKey
    ) {
      return;
    }

    event.preventDefault();
    if (!notification.read) readNotification(notification.id);
    await preloadNotificationHeroAssets(notification);
    navigate(toFeedDetail(String(notification.feedId)), {
      state: {
        thumbnailUrl: notification.thumbnailUrl ?? undefined,
        heroPreviewUrl: notification.heroPreviewUrl ?? undefined,
      },
    });
  };

  return { handleNotificationClick, preloadNotification };
};
