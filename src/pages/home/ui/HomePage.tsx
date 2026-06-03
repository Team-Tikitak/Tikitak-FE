import { useNavigate } from 'react-router';
import { PageShell } from '@/app/layout';
import { PATHS } from '@/app/routes/paths';
import { useActiveTeamSelection } from '@/shared/hooks/useActiveTeamSelection';
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
  } = useActiveTeamSelection();

  const hasTeams = me?.hasTeam ?? false;

  if (isPending) {
    return (
      <PageShell
        header={<AppHeader teamName="" teamNameLoading onTeamSelect={openTeamSheet} />}
        contentClassName="flex flex-1 flex-col overflow-hidden"
      >
        <LoadingState variant="fullscreen" />
      </PageShell>
    );
  }

  if (hasTeams) {
    return (
      <PageShell
        header={<AppHeader teamName={selectedTeam?.teamName ?? ''} onTeamSelect={openTeamSheet} />}
        contentClassName="flex flex-1 flex-col overflow-hidden"
      >
        <MapView teamId={selectedTeam?.teamId ?? 0} />
      </PageShell>
    );
  }

  return (
    <PageShell contentClassName="flex flex-1 flex-col">
      <EmptyTeamView onCreateTeam={() => navigate(PATHS.TEAM_CREATE)} />
    </PageShell>
  );
};
