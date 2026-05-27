import { useState } from 'react';
import { useNavigate } from 'react-router';
import { PageShell } from '@/app/layout';
import { PATHS } from '@/app/routes';
import { useGetTeams, useMe, usePatchActiveTeam } from '@/shared/api/user/queries';
import { AppHeader } from '@/shared/ui/AppHeader';
import { Header } from '@/shared/ui/Header';
import { EmptyTeamView } from './EmptyTeamView';
import { MapView } from './MapView';
import { useTeamPickerSheet } from '../hooks/useTeamPickerSheet';

export const HomePage = () => {
  const navigate = useNavigate();
  const { data: me } = useMe();
  const { data: teams, isPending } = useGetTeams();
  const { mutate: patchActiveTeam } = usePatchActiveTeam();

  const hasTeams = me?.hasTeam ?? false;
  const teamItems = teams ?? [];

  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(
    () => me?.activeTeamId ?? null,
  );
  const selectedTeam = teamItems.find((team) => team.teamId === selectedTeamId) ?? teamItems[0];

  const { openSheet: openTeamSheet } = useTeamPickerSheet({
    teams: teamItems,
    selectedTeamId: selectedTeam?.teamId,
    onSelectTeam: (teamId) => {
      setSelectedTeamId(teamId);
      patchActiveTeam(teamId);
    },
    onCreateTeam: () => navigate(PATHS.TEAM_CREATE),
  });

  if (isPending) return null;

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
    <PageShell
      header={<Header showBackButton onBack={() => navigate(-1)} />}
      contentClassName="flex flex-1 flex-col"
    >
      <EmptyTeamView onCreateTeam={() => navigate(PATHS.TEAM_CREATE)} />
    </PageShell>
  );
};
