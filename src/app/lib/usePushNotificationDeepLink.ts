import { Capacitor } from '@capacitor/core';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { PATHS, toFeedDetail } from '@/app/routes/paths';
import { restoreSession } from '@/shared/api/auth/restoreSession';
import { feedKeys } from '@/shared/api/feed/keys';
import { feedCommentKeys } from '@/shared/api/feedComment/keys';
import { useReadNotification } from '@/shared/api/notification/queries';
import { usePatchActiveTeam } from '@/shared/api/user/queries';
import { useActiveTeamId } from '@/shared/hooks/team/useActiveTeamId';
import { saveRedirectAfterLogin } from '@/shared/lib/routing/redirectAfterLogin';
import { useAuthStore } from '@/shared/stores/authStore';

interface PushNotificationData {
  type?: string;
  feedId?: string;
  teamId?: string;
  notificationId?: string;
}

const FEED_DETAIL_TYPES = new Set([
  'FEED_COMMENT',
  'FEED_COMMENT_REPLIED',
  'DAILY_QUESTION_UPLOADED',
]);

let pendingPushData: PushNotificationData | null = null;

const isReadyForDeepLink = () =>
  Boolean(useAuthStore.getState().accessToken) && window.location.pathname !== PATHS.ROOT;

const parsePositiveInteger = (value: string | undefined): number | null => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const getNotificationId = (data: PushNotificationData) => parsePositiveInteger(data.notificationId);

const getTargetTeamId = (data: PushNotificationData) => parsePositiveInteger(data.teamId);

export const getPushNotificationTargetPath = (data: PushNotificationData): string | null => {
  if (!data.type || !FEED_DETAIL_TYPES.has(data.type) || !data.feedId) {
    return null;
  }

  return toFeedDetail(data.feedId);
};

// 이미 같은 피드 상세를 보고 있으면 navigate가 무효 동작이라 별도로 무효화해야 새 댓글이 반영된다
export const shouldInvalidateFeedQueries = (
  data: PushNotificationData,
  currentPathname: string,
  targetPath: string | null,
): boolean =>
  Boolean(targetPath) && FEED_DETAIL_TYPES.has(data.type ?? '') && currentPathname === targetPath;

export const usePushNotificationDeepLink = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const accessToken = useAuthStore((state) => state.accessToken);
  const activeTeamId = useActiveTeamId();
  const { mutate: patchActiveTeam } = usePatchActiveTeam({ silent: true });
  const { mutate: readNotification } = useReadNotification();
  const queryClient = useQueryClient();

  const handleRef = useRef<(data: PushNotificationData) => void>(() => {});
  handleRef.current = (data) => {
    const targetPath = getPushNotificationTargetPath(data);
    const notificationId = getNotificationId(data);
    const targetTeamId = getTargetTeamId(data);

    if (notificationId) readNotification(notificationId);
    if (!targetPath) return;

    if (shouldInvalidateFeedQueries(data, location.pathname, targetPath)) {
      void queryClient.invalidateQueries({ queryKey: feedCommentKeys.all });
      void queryClient.invalidateQueries({ queryKey: feedKeys.all });
    }

    const navigateToTarget = () => navigate(targetPath);
    if (targetTeamId && targetTeamId !== activeTeamId) {
      patchActiveTeam(targetTeamId, {
        onSuccess: navigateToTarget,
        onError: navigateToTarget,
      });
    } else {
      navigateToTarget();
    }
  };

  const redirectToLoginForPush = useCallback(
    (data: PushNotificationData) => {
      const targetPath = getPushNotificationTargetPath(data);
      if (targetPath) {
        saveRedirectAfterLogin(targetPath);
      }
      navigate(PATHS.LOGIN, { replace: true });
    },
    [navigate],
  );

  // 콜드스타트: 인증 복구·스플래시 종료 후 보류해둔 딥링크를 처리
  useEffect(() => {
    if (!pendingPushData || location.pathname === PATHS.ROOT) return;
    const data = pendingPushData;
    pendingPushData = null;
    if (accessToken) {
      handleRef.current(data);
    } else {
      redirectToLoginForPush(data);
    }
  }, [accessToken, location.pathname, redirectToLoginForPush]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let cancelled = false;
    let removeListener: (() => void) | undefined;

    void (async () => {
      const { FirebaseMessaging } = await import('@capacitor-firebase/messaging');
      const handle = await FirebaseMessaging.addListener('notificationActionPerformed', (event) => {
        const data = event.notification?.data as PushNotificationData | undefined;
        if (!data) return;
        if (isReadyForDeepLink()) {
          handleRef.current(data);
          return;
        }

        if (window.location.pathname === PATHS.ROOT) {
          pendingPushData = data;
          return;
        }

        void restoreSession().then((authed) => {
          if (authed) handleRef.current(data);
          else redirectToLoginForPush(data);
        });
      });

      if (cancelled) {
        void handle.remove();
        return;
      }
      removeListener = () => void handle.remove();
    })();

    return () => {
      cancelled = true;
      removeListener?.();
    };
  }, [redirectToLoginForPush]);
};
