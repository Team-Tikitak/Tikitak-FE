export interface TeamDetail {
  teamId: number;
  name: string;
  description: string;
  teamImageUrl: string;
  status: 'ACTIVE' | 'INACTIVE';
  memberCount: number;
  myTeamMemberId: number;
  myRole: 'OWNER' | 'MEMBER';
  myNickname: string;
  myProfileImageUrl: string;
  createdAt: string;
}

export interface TeamMember {
  teamMemberId: number;
  memberId: number;
  nickname: string;
  profileImageUrl: string | null;
  role: 'OWNER' | 'MEMBER';
  email: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  joinedAt: string;
}
