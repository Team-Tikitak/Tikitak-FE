import { Capacitor } from '@capacitor/core';
import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { PATHS, toFeedDetail } from '@/app/routes/paths';
import { useReadNotification } from '@/shared/api/notification/queries';
import { usePatchActiveTeam } from '@/shared/api/user/queries';
import { useActiveTeamId } from '@/shared/hooks/team/useActiveTeamId';
import { useAuthStore } from '@/shared/stores/authStore';

type PushData = Record<string, string | undefined>;

const FEED_DETAIL_TYPES = new Set([
  'FEED_COMMENT',
  'FEED_COMMENT_REPLIED',
  'DAILY_QUESTION_UPLOADED',
]);

let pendingPushData: PushData | null = null;

const isReadyForDeepLink = () =>
  Boolean(useAuthStore.getState().accessToken) && window.location.pathname !== PATHS.ROOT;

export const usePushNotificationDeepLink = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const accessToken = useAuthStore((state) => state.accessToken);
  const activeTeamId = useActiveTeamId();
  const { mutate: patchActiveTeam } = usePatchActiveTeam({ silent: true });
  const { mutate: readNotification } = useReadNotification();

  const handleRef = useRef<(data: PushData) => void>(() => {});
  handleRef.current = (data) => {
    const notificationId = Number(data.notificationId);
    if (Number.isInteger(notificationId) && notificationId > 0) {
      readNotification(notificationId);
    }

    if (data.type && FEED_DETAIL_TYPES.has(data.type)) {
      const { feedId, teamId } = data;
      if (!feedId) return;
      const goToFeed = () => navigate(toFeedDetail(feedId));

      const targetTeamId = teamId != null ? Number(teamId) : null;
      if (targetTeamId && targetTeamId !== activeTeamId) {
        patchActiveTeam(targetTeamId, { onSuccess: goToFeed, onError: goToFeed });
      } else {
        goToFeed();
      }
    }
  };

  // 콜드스타트: 인증 복구·스플래시 종료 후 보류해둔 딥링크를 처리
  useEffect(() => {
    if (!pendingPushData || !accessToken || location.pathname === PATHS.ROOT) return;
    const data = pendingPushData;
    pendingPushData = null;
    handleRef.current(data);
  }, [accessToken, location.pathname]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let cancelled = false;
    let removeListener: (() => void) | undefined;

    void (async () => {
      const { FirebaseMessaging } = await import('@capacitor-firebase/messaging');
      const handle = await FirebaseMessaging.addListener('notificationActionPerformed', (event) => {
        const data = event.notification?.data as PushData | undefined;
        if (!data) return;
        if (isReadyForDeepLink()) {
          handleRef.current(data);
        } else {
          pendingPushData = data;
        }
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
  }, []);
};
