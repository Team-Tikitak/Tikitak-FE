import { useState } from 'react';
import { useGetTeamDetail, useTeamMembers } from '@/shared/api/team/queries';

interface UseSelfTagParams {
  teamId: number | null | undefined;
}

export const useSelfTag = ({ teamId }: UseSelfTagParams) => {
  const { data: teamDetail } = useGetTeamDetail(teamId);
  const { data: teamMembersData } = useTeamMembers(teamId);
  const myProfile = teamDetail?.myProfile;
  const myTeamMember = teamMembersData?.members.find(
    (member) => member.nickname === myProfile?.nickname,
  );

  const [isSelfTagged, setIsSelfTagged] = useState(true);

  return { isSelfTagged, setIsSelfTagged, myProfile, myTeamMember };
};
