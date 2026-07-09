import { useNavigate } from 'react-router';
import { PageShell } from '@/app/layout';
import { PATHS } from '@/app/routes/paths';
import { useUnreadNotificationCount } from '@/shared/api/notification/queries';
import { useActiveTeamSelection } from '@/shared/hooks/team/useActiveTeamSelection';
import { AppHeader } from '@/shared/ui/AppHeader';
import { EmptyTeamView } from '@/shared/ui/EmptyTeamView';
import { LoadingState } from '@/shared/ui/LoadingState';
import { MapView } from './MapView';

export const HomePage = () => {
  const navigate = useNavigate();
  const {
    me,
    activeTeam: selectedTeam,
    openTeamSheet,
    isTeamsPending: isPending,
    isFetching,
    toNotificationPage,
  } = useActiveTeamSelection();

  const hasTeams = me?.hasTeam ?? false;
  const hasActiveTeam = hasTeams && selectedTeam !== undefined;
  const { data: unreadData } = useUnreadNotificationCount({ teamId: selectedTeam?.teamId ?? 0 });
  const hasUnreadNotifications = (unreadData?.unreadCount ?? 0) > 0;

  // 재요청 중 빈 캐시로 EmptyState 깜빡임 방지
  if (isPending || (isFetching && !hasActiveTeam)) {
    return (
      <PageShell
        header={
          <AppHeader
            teamName=""
            teamNameLoading
            onTeamSelect={openTeamSheet}
            onBellClick={toNotificationPage}
          />
        }
        contentClassName="flex flex-1 flex-col overflow-hidden"
      >
        <LoadingState
          variant="fullscreen"
          className="pb-[calc(var(--bottom-nav-clearance)+env(safe-area-inset-bottom))]"
        />
      </PageShell>
    );
  }

  if (hasActiveTeam) {
    return (
      <PageShell
        header={
          <AppHeader
            teamName={selectedTeam?.teamName ?? ''}
            showNotificationDot={hasUnreadNotifications}
            onTeamSelect={openTeamSheet}
            onBellClick={toNotificationPage}
          />
        }
        contentClassName="flex flex-1 flex-col overflow-hidden"
      >
        <MapView teamId={selectedTeam.teamId} />
      </PageShell>
    );
  }

  return (
    <PageShell contentClassName="flex flex-1 flex-col">
      <EmptyTeamView onCreateTeam={() => navigate(PATHS.TEAM_CREATE)} />
    </PageShell>
  );
};
