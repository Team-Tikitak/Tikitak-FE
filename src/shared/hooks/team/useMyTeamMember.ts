import { useGetTeams } from '@/shared/api/user/queries';
import { useActiveTeamId } from '@/shared/hooks/team/useActiveTeamId';

/** 현재 팀과 그 팀에서의 내 teamMemberId. 팀이 없으면 둘 다 null. */
export const useMyTeamMember = () => {
  const activeTeamId = useActiveTeamId();
  const { data: teams } = useGetTeams();
  const team = teams?.find((item) => item.teamId === activeTeamId);

  return { teamId: team?.teamId ?? null, teamMemberId: team?.teamMemberId ?? null };
};
