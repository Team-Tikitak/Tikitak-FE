import { useNavigate } from 'react-router';
import { PageShell } from '@/app/layout';
import SettingIcon from '@/shared/assets/Icon/SettingIcon.svg?react';
import { Header } from '@/shared/ui';
import { EmptyNotificationView } from './emptyNotificationView';
import { NotificationItem } from './notificationItem';
import { NotificationSkeleton } from './notificationSkeleton';
import { useNotifications } from '../hooks/useNotifications';
import { useNotificationSettingsSheet } from '../hooks/useNotificationSettingsSheet';

export const NotificationPage = () => {
  const navigate = useNavigate();
  const { notifications, isLoading, isError } = useNotifications();
  const { openSheet } = useNotificationSettingsSheet();

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
      <ul className="flex flex-col p-5">
        {notifications.map((notification) => (
          <li key={notification.id}>
            <NotificationItem
              type={notification.type}
              actorName={notification.actorName}
              targetName={notification.targetName}
              feedId={notification.feedId}
              avatarUrl={notification.avatarUrl}
              createdAt={notification.createdAt}
              thumbnailUrl={notification.thumbnailUrl}
              className="py-4"
            />
          </li>
        ))}
      </ul>
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
