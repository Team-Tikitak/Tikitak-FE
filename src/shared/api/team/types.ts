export type TeamMemberRole = 'OWNER' | 'MEMBER';

export interface TeamMember {
  teamMemberId: number;
  nickname: string;
  role: TeamMemberRole;
  profileImgUrl: string;
}

export interface TeamMembersResponse {
  members: TeamMember[];
}
