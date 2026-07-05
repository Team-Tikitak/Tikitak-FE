import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { deleteDeviceToken, getNotifications, patchNotificationRead, postDeviceToken } from './api';
import { notificationKeys } from './keys';
import { unwrap } from '../request';
import type {
  DeleteDeviceTokenRequest,
  NotificationListParams,
  NotificationListResponse,
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
    },
  });
};
