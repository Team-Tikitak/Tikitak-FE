export type OAuthProvider = 'kakao' | 'google' | 'apple';

export interface LoginCodeExchangeRequest {
  loginCode: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  isNewMember: boolean;
  hasAgreedRequiredTerms: boolean;
  activeTeamId: number | null;
}
