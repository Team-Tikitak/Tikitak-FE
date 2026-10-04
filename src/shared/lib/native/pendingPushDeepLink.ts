export interface PushNotificationData {
  type?: string;
  feedId?: string;
  teamId?: string;
  notificationId?: string;
}

// 콜드스타트(스플래시 중)에 탭된 푸시를 인증 복구 이후 처리하려고 보관한다.
let pending: PushNotificationData | null = null;
const listeners = new Set<() => void>();

export const setPendingPushDeepLink = (data: PushNotificationData) => {
  pending = data;
  listeners.forEach((listener) => listener());
};

export const hasPendingPushDeepLink = () => pending !== null;

export const takePendingPushDeepLink = () => {
  const data = pending;
  pending = null;
  return data;
};

export const subscribePendingPushDeepLink = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
