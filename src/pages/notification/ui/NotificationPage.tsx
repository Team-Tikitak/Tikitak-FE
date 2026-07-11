import { type UIEvent } from 'react';
import { useNavigate, useNavigationType } from 'react-router';
import { PageShell } from '@/app/layout';
import SettingIcon from '@/shared/assets/Icon/SettingIcon.svg?react';
import { useEdgeSwipeBack, useInfiniteScroll, useScrollRestore } from '@/shared/hooks';
import { useActiveTeamId } from '@/shared/hooks/team/useActiveTeamId';
import { usePullToRefresh } from '@/shared/hooks/usePullToRefresh';
import { Header } from '@/shared/ui';
import { PullToRefreshIndicator } from '@/shared/ui/PullToRefreshIndicator';
import { EmptyNotificationView } from './EmptyNotificationView';
import { NotificationItem } from './NotificationItem';
import { NotificationSkeleton } from './NotificationSkeleton';
import { StoredNotificationHero } from './StoredNotificationHero';
import { useNotificationClick } from '../hooks/useNotificationClick';
import { useNotificationHeroHandoff } from '../hooks/useNotificationHeroHandoff';
import { useNotifications } from '../hooks/useNotifications';
import { useNotificationSettingsSheet } from '../hooks/useNotificationSettingsSheet';

const NOTIFICATION_SCROLL_STORAGE_PREFIX = 'notification-scroll';

export const NotificationPage = () => {
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const teamId = useActiveTeamId();
  const {
    notifications,
    isLoading,
    isError,
    fetchNextPage,
    refreshNotifications,
    hasNextPage,
    isFetchingNextPage,
  } = useNotifications();
  const { openSheet } = useNotificationSettingsSheet();
  const { observerRef } = useInfiniteScroll({ hasNextPage, isFetchingNextPage, fetchNextPage });
  const scrollKey = teamId > 0 ? `${NOTIFICATION_SCROLL_STORAGE_PREFIX}:${teamId}` : null;
  const {
    scrollRef,
    handleScroll: handleRestoreScroll,
    isRestored: isScrollRestored,
    restored: scrollRestored,
  } = useScrollRestore(scrollKey, {
    ready: !isLoading && !isError,
    contentSignal: notifications.length,
  });
  const pullToRefresh = usePullToRefresh({
    scrollRef,
    disabled: isLoading || isError,
    onRefresh: refreshNotifications,
  });
  const {
    storedHero,
    storedHeroVisible,
    suppressedNotificationId,
    dismissStoredHero,
    captureNotificationHero,
  } = useNotificationHeroHandoff({
    navigationType,
    scrollRestored,
    notifications,
    scrollFrameRef: scrollRef,
  });
  const { handleNotificationClick, preloadNotification } =
    useNotificationClick(captureNotificationHero);
  useEdgeSwipeBack();

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    handleRestoreScroll(event);
    if (!storedHero || !isScrollRestored()) return;
    dismissStoredHero();
  };

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
                suppressHero={suppressedNotificationId === notification.id}
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
      contentClassName="relative isolate flex flex-1 flex-col overflow-hidden"
    >
      {storedHero && (
        <StoredNotificationHero
          storedHero={storedHero}
          visible={storedHeroVisible}
          style={pullToRefresh.pullTransformStyle}
        />
      )}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="no-scrollbar relative flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain"
        {...pullToRefresh.touchHandlers}
      >
        <PullToRefreshIndicator
          pullDistance={pullToRefresh.pullDistance}
          threshold={pullToRefresh.threshold}
          refreshing={pullToRefresh.isRefreshing}
        />
        <div className="flex min-h-full flex-col" style={pullToRefresh.pullTransformStyle}>
          {renderContent()}
        </div>
      </div>
    </PageShell>
  );
};
