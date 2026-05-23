import { useGetTeamDetail } from '@/shared/api/team/queries';

export const useTeamDetail = (teamId: number) => {
  const { data, isError } = useGetTeamDetail(teamId);

  const teamName = data?.teamName || '';
  const myProfile = data?.myProfile;
  const members = data?.teamMembers || [];
  const isOwner = data?.myProfile?.teamMemberRole === 'OWNER';

  return { teamName, myProfile, members, isOwner, isError };
};
