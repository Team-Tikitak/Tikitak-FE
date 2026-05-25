import { useEffect, useState } from 'react';
import { useGetTeamDetail, useTeamMembers } from '@/shared/api/team/queries';
import type { TeamMember } from '@/shared/api/team/types';

interface UseSelfTagParams {
  teamId: number | null | undefined;
  commitMembers: (members: TeamMember[]) => void;
}

export const useSelfTag = ({ teamId, commitMembers }: UseSelfTagParams) => {
  const { data: teamDetail } = useGetTeamDetail(teamId);
  const { data: teamMembersData } = useTeamMembers(teamId);
  const myProfile = teamDetail?.myProfile;
  const myTeamMember = teamMembersData?.members.find(
    (member) => member.nickname === myProfile?.nickname,
  );

  const [isSelfTagged, setIsSelfTagged] = useState(true);

  useEffect(() => {
    if (isSelfTagged && myTeamMember) {
      commitMembers([myTeamMember]);
    } else {
      commitMembers([]);
    }
  }, [isSelfTagged, myTeamMember, commitMembers]);

  return { isSelfTagged, setIsSelfTagged, myProfile, myTeamMember };
};
