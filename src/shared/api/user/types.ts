import type { TeamRole } from '@/shared/types';

export type SocialProvider = 'KAKAO' | 'GOOGLE' | 'APPLE';
export type MemberStatus = 'ACTIVE' | 'INACTIVE' | 'WITHDRAWN';

export interface MeResponse {
  memberId: number;
  email: string;
  socialProvider: SocialProvider;
  status: MemberStatus;
  hasAgreedRequiredTerms: boolean;
  onboardingCompleted: boolean;
  activeTeamId: number | null;
  hasTeam: boolean;
  createdAt: string;
}

export interface AgreementsResponse {
  termsAgreed: boolean;
  privacyAgreed: boolean;
  termsAgreedAt: string;
}

export interface AgreementsRequest {
  termsAgreed: boolean;
  privacyAgreed: boolean;
}

export type Team = {
  teamId: number;
  teamMemberId: number;
  teamName: string;
  description: string;
  role: TeamRole;
  nickname: string;
  profileImageUrl: string;
  memberCount: number;
  joinedAt: string;
  active: boolean;
  isActive: boolean;
};

export interface TeamListResponse {
  teams: Team[];
}
