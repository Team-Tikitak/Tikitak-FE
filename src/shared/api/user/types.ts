import type { TeamRole } from '@/shared/types';

export type SocialProvider = 'KAKAO' | 'GOOGLE' | 'APPLE';
export type MemberStatus = 'ACTIVE' | 'INACTIVE' | 'WITHDRAWN';

export type ProfileCharacterType =
  | 'TAK_LEADER'
  | 'TAK_SPARK'
  | 'TAK_BURNER'
  | 'TAK_BUILDER'
  | 'TAK_FREE'
  | 'TAK_CARE';

export interface OnboardingPatchRequest {
  profileCharacterType: ProfileCharacterType;
}

export interface OnboardingPatchResponse {
  onboardingCompleted: boolean;
  profileCharacterType: ProfileCharacterType;
}

export interface MeResponse {
  memberId: number;
  name: string;
  email: string;
  name: string;
  socialProvider: SocialProvider;
  status: MemberStatus;
  hasAgreedRequiredTerms: boolean;
  onboardingCompleted: boolean;
  profileCharacterType: ProfileCharacterType | null;
  activeTeamId: number | null;
  hasTeam: boolean;
  createdAt: string;
  profileCharacterType?: ProfileCharacterType;
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
  profileImgUrl: string;
  memberCount: number;
  joinedAt: string;
  active: boolean;
  isActive: boolean;
};

export interface TeamListResponse {
  teams: Team[];
}
