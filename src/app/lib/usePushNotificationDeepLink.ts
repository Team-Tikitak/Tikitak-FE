import { Capacitor } from '@capacitor/core';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { toFeedDetail } from '@/app/routes/paths';
import { usePatchActiveTeam } from '@/shared/api/user/queries';
import { useActiveTeamId } from '@/shared/hooks/team/useActiveTeamId';

type PushData = Record<string, string | undefined>;

const FEED_DETAIL_TYPES = new Set(['FEED_COMMENT', 'DAILY_QUESTION_UPLOADED']);

export const usePushNotificationDeepLink = () => {
  const navigate = useNavigate();
  const activeTeamId = useActiveTeamId();
  const { mutate: patchActiveTeam } = usePatchActiveTeam({ silent: true });

  const handleRef = useRef<(data: PushData) => void>(() => {});
  handleRef.current = (data) => {
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

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let cancelled = false;
    let removeListener: (() => void) | undefined;

    void (async () => {
      const { FirebaseMessaging } = await import('@capacitor-firebase/messaging');
      const handle = await FirebaseMessaging.addListener('notificationActionPerformed', (event) => {
        const data = event.notification?.data as PushData | undefined;
        if (data) handleRef.current(data);
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
