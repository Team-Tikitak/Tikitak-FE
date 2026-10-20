import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { PATHS } from '@/app/routes/paths';
import { dailyQuestionQueryOptions } from '@/shared/api/dailyQuestion/queries';
import { useGetTeams, useMe, usePatchActiveTeam } from '@/shared/api/user/queries';
import { showToast } from '@/shared/ui/Toast/showToast';
import { useTeamPickerSheet } from './useTeamPickerSheet';

// 팀 시트 접힌 높이에서 보이는 팀 수
const PREFETCH_TEAM_LIMIT = 3;

export const useActiveTeamSelection = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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

  const { openSheet } = useTeamPickerSheet({
    teams: teamItems,
    selectedTeamId: activeTeam?.teamId,
    onSelectTeam: (teamId) => {
      setSelectedTeamId(teamId);
      patchActiveTeam(teamId, {
        onSuccess: () => showToast('팀을 변경했어요'),
      });
    },
    onCreateTeam: () => navigate(PATHS.TEAM_CREATE),
  });

  // 시트를 고르는 동안 다른 팀 데일리 질문을 미리 받아 전환 직후 배너가 늦게 뜨지 않게 함.
  // 팀 수 상한이 없으므로 시트를 처음 열었을 때 보이는 팀까지만 받는다.
  const openTeamSheet = () => {
    teamItems
      .filter((team) => team.teamId !== activeTeam?.teamId)
      .slice(0, PREFETCH_TEAM_LIMIT)
      .forEach((team) => {
        void queryClient.prefetchQuery(dailyQuestionQueryOptions(team.teamId));
      });
    openSheet();
  };

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
