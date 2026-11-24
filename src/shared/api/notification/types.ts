export type DevicePlatform = 'IOS' | 'ANDROID';

export interface RegisterDeviceTokenRequest {
  fcmToken: string;
  platform: DevicePlatform;
}

export interface DeleteDeviceTokenRequest {
  fcmToken: string;
}

export const NOTIFICATION_TYPES = [
  'FEED_COMMENT',
  'FEED_COMMENT_REPLIED',
  'DAILY_QUESTION_UPLOADED',
  'FEED_UPLOADED',
  'FEED_TAGGED',
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export interface NotificationListItem {
  notificationId: number;
  type: NotificationType;
  title: string;
  body: string;
  teamId: number;
  feedId: number;
  profileImageUrl: string | null;
  thumbnailImageUrl: string | null;
  heroPreviewUrl: string | null;
  createdAt: string;
  read: boolean;
  isRead: boolean;
}

export interface NotificationPageInfo {
  nextCursor: string | null;
  hasNext: boolean;
  size: number;
  totalCount: number;
}

export interface NotificationListResponse {
  items: NotificationListItem[];
  pageInfo: NotificationPageInfo;
}

export interface NotificationListParams {
  teamId?: number;
  cursor?: string;
  size?: number;
}

export interface NotificationTeamParams {
  teamId?: number;
}

export interface NotificationUnreadCountResponse {
  unreadCount: number;
}
