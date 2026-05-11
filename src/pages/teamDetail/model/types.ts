import type { TeamRole, TeamStatus } from '@/shared/types';

export interface TeamDetail {
  teamId: number;
  name: string;
  description: string;
  teamImageUrl: string;
  status: TeamStatus;
  memberCount: number;
  myTeamMemberId: number;
  myRole: TeamRole;
  myNickname: string;
  myProfileImageUrl: string;
  createdAt: string;
}

export interface TeamMember {
  teamMemberId: number;
  memberId: number;
  nickname: string;
  profileImageUrl: string | null;
  role: TeamRole;
  email: string | null;
  status: TeamStatus;
  joinedAt: string;
}
