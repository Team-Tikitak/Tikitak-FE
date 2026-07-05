import type { NotificationListParams } from './types';

export const notificationKeys = {
  all: ['notification'] as const,
  list: () => [...notificationKeys.all, 'list'] as const,
  infiniteListFiltered: (params: NotificationListParams) =>
    [...notificationKeys.list(), 'infinite', params] as const,
};
