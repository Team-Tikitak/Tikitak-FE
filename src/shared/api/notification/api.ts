import { instance } from '../instance';
import { NOTIFICATION_ENDPOINTS } from './endpoints';
import type {
  DeleteDeviceTokenRequest,
  NotificationListParams,
  NotificationListResponse,
  NotificationTeamParams,
  NotificationUnreadCountResponse,
  RegisterDeviceTokenRequest,
} from './types';
import type { ApiResponse } from '../type';

export const postDeviceToken = (body: RegisterDeviceTokenRequest) =>
  instance.post<ApiResponse<string>>(NOTIFICATION_ENDPOINTS.DEVICE_TOKENS, body);

export const deleteDeviceToken = (body: DeleteDeviceTokenRequest) =>
  instance.delete<ApiResponse<string>>(NOTIFICATION_ENDPOINTS.DEVICE_TOKENS, { data: body });

export const getNotifications = (params?: NotificationListParams) =>
  instance.get<ApiResponse<NotificationListResponse>>(NOTIFICATION_ENDPOINTS.NOTIFICATIONS, {
    params,
  });

export const patchNotificationRead = (notificationId: number) =>
  instance.patch<ApiResponse<string>>(NOTIFICATION_ENDPOINTS.NOTIFICATION_READ(notificationId));

export const getUnreadNotificationCount = (params?: NotificationTeamParams) =>
  instance.get<ApiResponse<NotificationUnreadCountResponse>>(
    NOTIFICATION_ENDPOINTS.NOTIFICATION_UNREAD_COUNT,
    { params },
  );

export const patchNotificationReadAll = (params?: NotificationTeamParams) =>
  instance.patch<ApiResponse<string>>(NOTIFICATION_ENDPOINTS.NOTIFICATION_READ_ALL, undefined, {
    params,
  });
