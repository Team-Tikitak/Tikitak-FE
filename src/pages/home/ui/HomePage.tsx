import { useNavigate } from 'react-router';
import { PageShell } from '@/app/layout';
import { PATHS } from '@/app/routes/paths';
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
  } = useActiveTeamSelection();

  const hasTeams = me?.hasTeam ?? false;
  const hasActiveTeam = hasTeams && selectedTeam !== undefined;

  // 재요청 중 빈 캐시로 EmptyState 깜빡임 방지
  if (isPending || (isFetching && !hasActiveTeam)) {
    return (
      <PageShell
        header={<AppHeader teamName="" teamNameLoading onTeamSelect={openTeamSheet} />}
        contentClassName="flex flex-1 flex-col overflow-hidden"
      >
        <LoadingState
          variant="fullscreen"
          className="pb-[calc(60px+env(safe-area-inset-bottom))]"
        />
      </PageShell>
    );
  }

  if (hasActiveTeam) {
    return (
      <PageShell
        header={<AppHeader teamName={selectedTeam?.teamName ?? ''} onTeamSelect={openTeamSheet} />}
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
