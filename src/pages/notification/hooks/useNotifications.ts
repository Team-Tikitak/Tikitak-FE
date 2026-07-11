import { useInfiniteNotifications } from '@/shared/api/notification/queries';
import { useActiveTeamId } from '@/shared/hooks/team/useActiveTeamId';

export interface NotificationListItem {
  id: number;
  body: string;
  feedId: number;
  avatarUrl: string | null;
  thumbnailUrl: string | null;
  heroPreviewUrl: string | null;
  createdAt: string;
  read: boolean;
}

export const useNotifications = () => {
  const teamId = useActiveTeamId();
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useInfiniteNotifications({ teamId });

  const notifications: NotificationListItem[] =
    data?.pages.flatMap((page) =>
      page.items.map((item) => ({
        id: item.notificationId,
        body: item.body,
        feedId: item.feedId,
        avatarUrl: item.profileImageUrl,
        thumbnailUrl: item.thumbnailImageUrl,
        heroPreviewUrl: item.heroPreviewUrl,
        createdAt: item.createdAt,
        read: item.isRead,
      })),
    ) ?? [];

  return {
    notifications,
    isLoading,
    isError,
    fetchNextPage,
    refreshNotifications: refetch,
    hasNextPage,
    isFetchingNextPage,
  };
};
