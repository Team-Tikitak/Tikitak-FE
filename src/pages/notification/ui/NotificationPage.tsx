import { useNavigate } from 'react-router';
import { PageShell } from '@/app/layout';
import SettingIcon from '@/shared/assets/Icon/SettingIcon.svg?react';
import { useEdgeSwipeBack, useInfiniteScroll } from '@/shared/hooks';
import { Header } from '@/shared/ui';
import { EmptyNotificationView } from './EmptyNotificationView';
import { NotificationItem } from './NotificationItem';
import { NotificationSkeleton } from './NotificationSkeleton';
import { useNotificationClick } from '../hooks/useNotificationClick';
import { useNotifications } from '../hooks/useNotifications';
import { useNotificationSettingsSheet } from '../hooks/useNotificationSettingsSheet';

export const NotificationPage = () => {
  const navigate = useNavigate();
  const { notifications, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useNotifications();
  const { openSheet } = useNotificationSettingsSheet();
  const { observerRef } = useInfiniteScroll({ hasNextPage, isFetchingNextPage, fetchNextPage });
  const { handleNotificationClick, preloadNotification } = useNotificationClick();
  useEdgeSwipeBack();

  const renderContent = () => {
    if (isLoading) {
      return <NotificationSkeleton />;
    }

    if (isError) {
      return (
        <div className="flex flex-1 items-center justify-center">
          <p className="body-3 text-center text-gray-500">알림을 불러오지 못했습니다.</p>
        </div>
      );
    }

    if (notifications.length === 0) {
      return (
        <div className="flex flex-1 items-center justify-center">
          <EmptyNotificationView />
        </div>
      );
    }

    return (
      <>
        <ul className="flex flex-col py-5">
          {notifications.map((notification) => (
            <li key={notification.id}>
              <NotificationItem
                body={notification.body}
                feedId={notification.feedId}
                notificationId={notification.id}
                avatarUrl={notification.avatarUrl}
                thumbnailUrl={notification.thumbnailUrl}
                heroPreviewUrl={notification.heroPreviewUrl}
                createdAt={notification.createdAt}
                unread={!notification.read}
                onPointerDown={() => preloadNotification(notification)}
                onMouseEnter={() => preloadNotification(notification)}
                onFocus={() => preloadNotification(notification)}
                onClick={(event) => void handleNotificationClick(event, notification)}
                className="px-5 py-4"
              />
            </li>
          ))}
        </ul>
        {isFetchingNextPage && <NotificationSkeleton count={3} className="py-0" />}
        <div ref={observerRef} className="h-8 shrink-0" aria-hidden />
      </>
    );
  };

  return (
    <PageShell
      header={
        <Header
          title="알림"
          showBackButton
          onBack={() => navigate(-1)}
          rightIcon={<SettingIcon className="size-6" />}
          rightAriaLabel="알림 설정"
          onRightClick={openSheet}
        />
      }
      contentClassName="no-scrollbar flex flex-1 flex-col"
    >
      {renderContent()}
    </PageShell>
  );
};
