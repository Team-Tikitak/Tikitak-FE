import type { NotificationListParams, NotificationTeamParams } from './types';

export const notificationKeys = {
  all: ['notification'] as const,
  list: () => [...notificationKeys.all, 'list'] as const,
  infiniteListFiltered: (params: NotificationListParams) =>
    [...notificationKeys.list(), 'infinite', params] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
  unreadCountFiltered: (params: NotificationTeamParams) =>
    [...notificationKeys.unreadCount(), params] as const,
};
