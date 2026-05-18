export type SocialProvider = 'KAKAO' | 'GOOGLE' | 'APPLE';
export type MemberStatus = 'ACTIVE' | 'INACTIVE' | 'WITHDRAWN';

export interface MeResponse {
  memberId: number;
  email: string;
  socialProvider: SocialProvider;
  status: MemberStatus;
  hasAgreedRequiredTerms: boolean;
  activeTeamId: number | null;
  hasTeam: boolean;
  createdAt: string;
}
