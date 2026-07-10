import { useUnreadNotificationCount } from '@/shared/api/notification/queries';
import { useActiveTeamId } from './team/useActiveTeamId';

/** 활성 팀에 안읽은 알림이 있는지 — 팀이 없으면(teamId 0) 요청 없이 false */
export const useHasUnreadNotifications = (): boolean => {
  const teamId = useActiveTeamId();
  const { data } = useUnreadNotificationCount({ teamId });
  return (data?.unreadCount ?? 0) > 0;
};
