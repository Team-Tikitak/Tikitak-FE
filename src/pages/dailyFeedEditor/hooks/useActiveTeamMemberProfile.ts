import { useTeamMembers } from '@/shared/api/team/queries';
import { useGetTeams } from '@/shared/api/user/queries';
import { useActiveTeamId } from '@/shared/hooks/useActiveTeamId';

export const useActiveTeamMemberProfile = () => {
  const teamId = useActiveTeamId();
  const { data: teams = [] } = useGetTeams();
  const activeTeamProfile = teams.find((team) => team.teamId === teamId);
  const { data: teamMembersData } = useTeamMembers(teamId);

  const memberProfile = teamMembersData?.members.find(
    (member) => member.teamMemberId === activeTeamProfile?.teamMemberId,
  );

  return {
    teamId,
    teamMemberId: activeTeamProfile?.teamMemberId ?? null,
    nickname: memberProfile?.nickname ?? activeTeamProfile?.nickname ?? '',
    profileImgUrl: memberProfile?.profileImgUrl,
  };
};
