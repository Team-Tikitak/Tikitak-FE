import type { TeamRole, TeamStatus } from '@/shared/types';

export interface TeamItem {
  teamId: number;
  teamMemberId: number;
  name: string;
  description: string;
  teamImageUrl: string;
  role: TeamRole;
  memberStatus: TeamStatus;
  teamStatus: TeamStatus;
  nickname: string;
  profileImageUrl: string;
  memberCount: number;
  isActive: boolean;
  joinedAt: string;
}
