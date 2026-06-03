import { useNavigate } from 'react-router';
import { toTeamDetail } from '@/app/routes/paths';
import { useTeamMembers } from '@/shared/api/team/queries';
import type { Team } from '@/shared/api/user/types';
import { toSafeImageUrl } from '@/shared/lib';
import { TeamCard } from './TeamCard';

interface MyPageTeamCardProps {
  team: Team;
}

export const MyPageTeamCard = ({ team }: MyPageTeamCardProps) => {
  const navigate = useNavigate();
  const { data: membersData } = useTeamMembers(team.teamId);

  const users = membersData?.members.map((member) => ({
    id: member.teamMemberId,
    src: toSafeImageUrl(member.profileImgUrl),
  })) ?? [
    {
      id: team.teamMemberId,
      src: toSafeImageUrl(team.profileImgUrl),
    },
  ];

  return (
    <TeamCard
      teamName={team.teamName}
      memberCount={team.memberCount}
      users={users}
      isLeader={team.role === 'OWNER'}
      onClick={() => navigate(toTeamDetail(team.teamId))}
    />
  );
};
