import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { PATHS } from '@/app/routes/paths';
import { useGetTeams, useMe, usePatchActiveTeam } from '@/shared/api/user/queries';
import { useTeamPickerSheet } from './useTeamPickerSheet';

export const useActiveTeamSelection = () => {
  const navigate = useNavigate();
  const { data: me, isPending: isMePending, isFetching: isMeFetching } = useMe();
  const { data: teams, isPending: isTeamsPending, isFetching: isTeamsFetching } = useGetTeams();
  const { mutate: patchActiveTeam } = usePatchActiveTeam();
  const { mutate: healActiveTeam } = usePatchActiveTeam({ silent: true });

  const teamItems = teams ?? [];
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

  const activeTeamId = selectedTeamId ?? me?.activeTeamId ?? null;
  const activeTeam = teamItems.find((team) => team.teamId === activeTeamId) ?? teamItems[0];

  useEffect(() => {
    if (isMePending || isTeamsPending || isMeFetching || isTeamsFetching) return;
    if (!teams || teams.length === 0) return;
    const isActiveValid = teams.some((team) => team.teamId === me?.activeTeamId);
    if (!isActiveValid) {
      healActiveTeam(teams[0].teamId);
    }
  }, [
    me?.activeTeamId,
    teams,
    isMePending,
    isTeamsPending,
    isMeFetching,
    isTeamsFetching,
    healActiveTeam,
  ]);

  const { openSheet: openTeamSheet } = useTeamPickerSheet({
    teams: teamItems,
    selectedTeamId: activeTeam?.teamId,
    onSelectTeam: (teamId) => {
      setSelectedTeamId(teamId);
      patchActiveTeam(teamId);
    },
    onCreateTeam: () => navigate(PATHS.TEAM_CREATE),
  });

  const toNotificationPage = () => {
    navigate(PATHS.NOTIFICATION);
  };

  return {
    me,
    teams: teamItems,
    activeTeam,
    openTeamSheet,
    isMePending,
    isTeamsPending,
    isFetching: isMeFetching || isTeamsFetching,
    toNotificationPage,
  };
};
