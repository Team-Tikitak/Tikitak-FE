import { useState } from 'react';
import { useNavigate } from 'react-router';
import { PATHS } from '@/app/routes/paths';
import { useGetTeams, useMe, usePatchActiveTeam } from '@/shared/api/user/queries';
import { useTeamPickerSheet } from '@/shared/hooks/useTeamPickerSheet';

export const useActiveTeamSelection = () => {
  const navigate = useNavigate();
  const { data: me, isPending: isMePending } = useMe();
  const { data: teams, isPending: isTeamsPending } = useGetTeams();
  const { mutate: patchActiveTeam } = usePatchActiveTeam();

  const teamItems = teams ?? [];
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

  const activeTeamId = selectedTeamId ?? me?.activeTeamId ?? null;
  const activeTeam = teamItems.find((team) => team.teamId === activeTeamId) ?? teamItems[0];

  const { openSheet: openTeamSheet } = useTeamPickerSheet({
    teams: teamItems,
    selectedTeamId: activeTeam?.teamId,
    onSelectTeam: (teamId) => {
      setSelectedTeamId(teamId);
      patchActiveTeam(teamId);
    },
    onCreateTeam: () => navigate(PATHS.TEAM_CREATE),
  });

  return {
    me,
    teams: teamItems,
    activeTeam,
    openTeamSheet,
    isMePending,
    isTeamsPending,
  };
};
