export const NOTIFICATION_ENDPOINTS = {
  DEVICE_TOKENS: '/api/v1/me/device-tokens',
  NOTIFICATIONS: '/api/v1/me/notifications',
  NOTIFICATION_READ: (notificationId: number) => `/api/v1/me/notifications/${notificationId}/read`,
  NOTIFICATION_UNREAD_COUNT: '/api/v1/me/notifications/unread-count',
  NOTIFICATION_READ_ALL: '/api/v1/me/notifications/read-all',
} as const;
