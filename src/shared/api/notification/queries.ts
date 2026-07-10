import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import {
  deleteDeviceToken,
  getNotifications,
  getUnreadNotificationCount,
  patchNotificationRead,
  patchNotificationReadAll,
  postDeviceToken,
} from './api';
import { notificationKeys } from './keys';
import { unwrap } from '../request';
import type {
  DeleteDeviceTokenRequest,
  NotificationListParams,
  NotificationListResponse,
  NotificationTeamParams,
  NotificationUnreadCountResponse,
  RegisterDeviceTokenRequest,
} from './types';

const NOTIFICATION_LIST_STALE_TIME_MS = 15 * 1000;

const markNotificationRead = (
  old: InfiniteData<NotificationListResponse> | undefined,
  notificationId: number,
): InfiniteData<NotificationListResponse> | undefined => {
  if (!old) {
    return old;
  }

  return {
    ...old,
    pages: old.pages.map((page) => ({
      ...page,
      items: page.items.map((item) =>
        item.notificationId === notificationId ? { ...item, read: true, isRead: true } : item,
      ),
    })),
  };
};

const markAllNotificationsRead = (
  old: InfiniteData<NotificationListResponse> | undefined,
): InfiniteData<NotificationListResponse> | undefined => {
  if (!old) {
    return old;
  }

  return {
    ...old,
    pages: old.pages.map((page) => ({
      ...page,
      items: page.items.map((item) => ({ ...item, read: true, isRead: true })),
    })),
  };
};

export const useRegisterDeviceToken = () =>
  useMutation({
    meta: { errorMessage: '알림 토큰 등록에 실패했어요' },
    mutationFn: (body: RegisterDeviceTokenRequest) => postDeviceToken(body),
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
  });

export const useDeleteDeviceToken = () =>
  useMutation({
    meta: { errorMessage: '알림 토큰 해제에 실패했어요' },
    mutationFn: (body: DeleteDeviceTokenRequest) => deleteDeviceToken(body),
  });

export const useInfiniteNotifications = (params: NotificationListParams = {}) =>
  useInfiniteQuery<
    NotificationListResponse,
    Error,
    InfiniteData<NotificationListResponse>,
    ReturnType<typeof notificationKeys.infiniteListFiltered>,
    string | undefined
  >({
    queryKey: notificationKeys.infiniteListFiltered(params),
    queryFn: ({ pageParam }) => unwrap(() => getNotifications({ ...params, cursor: pageParam })),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasNext ? (lastPage.pageInfo.nextCursor ?? undefined) : undefined,
    enabled: params.teamId === undefined || params.teamId > 0,
    staleTime: NOTIFICATION_LIST_STALE_TIME_MS,
  });

export const useReadNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: number) => unwrap(() => patchNotificationRead(notificationId)),
    onSuccess: (_data, notificationId) => {
      queryClient.setQueriesData<InfiniteData<NotificationListResponse>>(
        { queryKey: notificationKeys.list() },
        (old) => markNotificationRead(old, notificationId),
      );
      void queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
    },
  });
};

export const useUnreadNotificationCount = (params: NotificationTeamParams = {}) =>
  useQuery({
    queryKey: notificationKeys.unreadCountFiltered(params),
    queryFn: () => unwrap(() => getUnreadNotificationCount(params)),
    enabled: params.teamId === undefined || params.teamId > 0,
    staleTime: NOTIFICATION_LIST_STALE_TIME_MS,
  });

export const useReadAllNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { errorMessage: '알림을 모두 읽음 처리하는 데 실패했어요' },
    mutationFn: (params: NotificationTeamParams = {}) =>
      unwrap(() => patchNotificationReadAll(params)),
    onSuccess: (_data, variables: NotificationTeamParams = {}) => {
      queryClient.setQueriesData<InfiniteData<NotificationListResponse>>(
        { queryKey: notificationKeys.infiniteListFiltered(variables) },
        markAllNotificationsRead,
      );
      queryClient.setQueriesData<NotificationUnreadCountResponse>(
        { queryKey: notificationKeys.unreadCountFiltered(variables) },
        (old) => (old ? { ...old, unreadCount: 0 } : old),
      );
      void queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCountFiltered(variables),
      });
    },
  });
};
