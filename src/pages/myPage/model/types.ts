export interface TeamItem {
  teamId: number;
  teamMemberId: number;
  name: string;
  description: string;
  teamImageUrl: string;
  role: 'OWNER' | 'MEMBER';
  memberStatus: 'ACTIVE' | 'INACTIVE';
  teamStatus: 'ACTIVE' | 'INACTIVE';
  nickname: string;
  profileImageUrl: string;
  memberCount: number;
  isActive: boolean;
  joinedAt: string;
}
